import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

interface ProductResponse {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: Product[];
}

// Fetch products from JSON-Server
async function fetchProducts({
  pageParam = 1,
}: {
  pageParam: number;
}): Promise<ProductResponse> {
  // Simulate network delay to make the lazy-loading state visible
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Request 4 items per page
  const res = await fetch(
    `http://localhost:4000/products?_page=${pageParam}&_per_page=4`,
  );
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default function ProductGrid() {
  // 1. INFINITE QUERY: Read and cache sequential pages
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useInfiniteQuery<ProductResponse, Error>({
    queryKey: ["products"],
    queryFn: ({ pageParam }) =>
      fetchProducts({ pageParam: pageParam as number }),
    initialPageParam: 1, // 👈 Required in TanStack Query v5

    // Determine the next page parameter based on the JSON-Server v1 response structure
    getNextPageParam: (lastPage) => {
      // JSON-Server v1 returns 'next' as a number (e.g. 2) or null if there is no next page
      return lastPage.next !== null ? lastPage.next : undefined;
    },

    // Retain cached data in memory for 10 minutes
    staleTime: 5 * 60 * 1000,
  });

  // 2. INTERSECTION OBSERVER: Infinite scroll trigger
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasNextPage || isFetchingNextPage) return;

    // Trigger fetchNextPage when the sentinel comes into view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(target);

    // Clean up
    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Helper to flat-map all loaded product data across all pages
  const allProducts = data ? data.pages.flatMap((page) => page.data) : [];

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6">
        <h3 className="text-sm font-semibold text-zinc-500 mb-6 text-left">
          Assembling Product Grid...
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 h-[280px] flex flex-col justify-between animate-pulse"
            >
              <div className="w-12 h-12 bg-zinc-850 rounded-full mb-4" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 bg-zinc-850 rounded-md w-3/4" />
                <div className="h-3 bg-zinc-850 rounded-md w-1/2" />
                <div className="h-3 bg-zinc-850 rounded-md w-5/6 mt-2" />
              </div>
              <div className="h-4 bg-zinc-850 rounded-md w-1/4 mt-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-red-950/20 border border-red-900/50 rounded-3xl text-center max-w-md mx-auto">
        <span className="text-2xl mb-2 block">⚠️</span>
        <h3 className="text-lg font-semibold text-red-400">
          Failed to load catalog
        </h3>
        <p className="text-sm text-red-300/70 mt-1">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 flex flex-col gap-8">
      {/* Dynamic Caching Alert */}
      <section className="bg-violet-950/15 border border-violet-900/30 rounded-3xl p-6 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <span className="text-2xl mt-0.5 shrink-0">💡</span>
          <div>
            <h4 className="text-sm font-bold text-violet-300">
              Advanced Query Caching Test
            </h4>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Scroll down to fetch multiple pages sequentially. Once loaded,
              click **&quot;Directory & Slices&quot;** or **&quot;Todo
              Dashboard&quot;** in the navigation header to leave this page,
              then click back here. You will notice that all previously loaded
              pages are preserved instantly from memory without a single loading
              state.
            </p>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Client Cache
            </span>
            <h2 className="text-2xl font-bold text-white mt-0.5">
              Hardware Catalog
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Showing {allProducts.length} items
            </p>
          </div>

          {/* Active fetching indicators */}
          {isFetching && !isFetchingNextPage && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <span className="text-[10px] text-violet-300 font-medium tracking-wide uppercase">
                Syncing Cache
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {allProducts.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 flex flex-col justify-between text-left group"
            >
              <div>
                {/* Visual Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-850 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300 mb-4">
                  {product.image}
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400 bg-violet-950/20 border border-violet-900/30 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>

                <h3 className="text-sm font-bold text-zinc-100 mt-3 group-hover:text-white transition-colors">
                  {product.name}
                </h3>

                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between">
                <span className="text-sm font-bold font-mono text-zinc-200">
                  ${product.price}
                </span>
                <button className="px-3 py-1 bg-zinc-800 group-hover:bg-violet-600 group-hover:text-white text-zinc-400 text-[10px] font-bold rounded-lg transition-colors cursor-pointer">
                  View Detail
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentinel / Fetch Trigger */}
      <div
        ref={observerTarget}
        className="w-full py-8 border border-dashed border-zinc-850 rounded-3xl bg-zinc-950/20 text-center flex flex-col items-center justify-center gap-3"
      >
        {isFetchingNextPage ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
            <p className="text-xs text-zinc-500 font-medium">
              Fetching Next Page...
            </p>
          </div>
        ) : hasNextPage ? (
          <div className="flex flex-col items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-zinc-500">
              Scroll down or click below to load more items
            </p>
            <button
              onClick={() => fetchNextPage()}
              className="mt-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Load More Products
            </button>
          </div>
        ) : (
          <p className="text-xs text-zinc-600 font-medium">
            ✓ You&apos;ve viewed the entire hardware catalog
          </p>
        )}
      </div>
    </div>
  );
}
