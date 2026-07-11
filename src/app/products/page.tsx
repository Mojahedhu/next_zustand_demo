"use client";

import ProductGrid from "@/components/productGrid";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-start py-12 px-4 sm:px-6">
      <div className="max-w-5xl w-full flex flex-col gap-6 text-center sm:text-left">
        {/* Header Badge */}
        <div className="inline-flex self-center sm:self-start items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
          <span>Module 3 Milestone</span>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span>Infinite Scroll & Cache Preservation</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight mt-2">
          Milestone: Infinite Catalog
        </h1>
        <p className="text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed">
          This showcase uses an Intersection Observer sentinel to automatically
          load successive pages of products, keeping layout transitions instant
          and smooth.
        </p>
      </div>

      <div className="w-full mt-8">
        <ProductGrid />
      </div>
    </main>
  );
}
