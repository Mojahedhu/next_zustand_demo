# Study Handbook: TanStack Query Milestones

This handbook compiles details for the Module 2 and Module 3 milestones. You can study these templates and replicate them in your workspace to master optimistic updates, cache rollbacks, and paginated infinite scrolls.

---

## 📘 Module 2 Milestone: Todo Dashboard with Cache Rollbacks

### Mapped Files & Destinations

| Artifact File                                                                                                                   | Destination in Workspace           | Purpose                                                                                                  |
| :------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------- | :------------------------------------------------------------------------------------------------------- |
| [db_proposed_m3.json](file:///C:/Users/user/.gemini/antigravity/brain/d8f46685-1933-43b0-8e5f-61036da6f46e/db_proposed_m3.json) | `db.json` (root)                   | Seeds `users`, `todos`, and `products`.                                                                  |
| [todoDashboard.tsx](file:///C:/Users/user/.gemini/antigravity/brain/d8f46685-1933-43b0-8e5f-61036da6f46e/todoDashboard.tsx)     | `src/components/todoDashboard.tsx` | Todo list component with complete optimistic additions, toggles, inline editing, and deletion rollbacks. |
| [todos_page.tsx](file:///C:/Users/user/.gemini/antigravity/brain/d8f46685-1933-43b0-8e5f-61036da6f46e/todos_page.tsx)           | `src/app/todos/page.tsx`           | Route page wrapping the Todo component.                                                                  |

### The Optimistic Mutation Cycle

Optimistic updates make your app feel instantaneous by modifying the UI before the server has responded. The structure utilizes three mutation hook stages:

1. **`onMutate` (Prepare & Predict):**
   - Aborts ongoing fetches to prevent race conditions: `cancelQueries`.
   - Snapshots the current cache state: `getQueryData`.
   - Direct-writes a synthetic predicted value into the cache: `setQueryData`.
   - Returns the snapshot in the context object.
2. **`onError` (Rollback):**
   - If the request fails, it consumes the context snapshot and reverts the cache back to the snapshotted state.
3. **`onSettled` (Validation):**
   - Invalidation is called to pull the real data from the server, confirming absolute sync.

---

## 📙 Module 3 Milestone: Infinite Scroll Product Grid

### Mapped Files & Destinations

| Artifact File                                                                                                                   | Destination in Workspace         | Purpose                                                                               |
| :------------------------------------------------------------------------------------------------------------------------------ | :------------------------------- | :------------------------------------------------------------------------------------ |
| [productGrid.tsx](file:///C:/Users/user/.gemini/antigravity/brain/d8f46685-1933-43b0-8e5f-61036da6f46e/productGrid.tsx)         | `src/components/productGrid.tsx` | Infinite product catalog using `useInfiniteQuery` and browser `IntersectionObserver`. |
| [products_page.tsx](file:///C:/Users/user/.gemini/antigravity/brain/d8f46685-1933-43b0-8e5f-61036da6f46e/products_page.tsx)     | `src/app/products/page.tsx`      | Next.js route file hosting the catalog.                                               |
| [layout_proposed.tsx](file:///C:/Users/user/.gemini/antigravity/brain/d8f46685-1933-43b0-8e5f-61036da6f46e/layout_proposed.tsx) | `src/app/layout.tsx`             | Next.js layout incorporating navigation header for all routes.                        |

---

## Technical Deep Dive: Infinite Queries in TanStack Query v5

Implementing infinite scroll requires specific configuration parameters under the `useInfiniteQuery` hook:

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam }) =>
      fetchProducts({ pageParam: pageParam as number }),
    initialPageParam: 1, // 👈 MANDATORY in TanStack Query v5 (throws error if omitted)
    getNextPageParam: (lastPage) => {
      // Return next page number or undefined if last page reached
      return lastPage.next !== null ? lastPage.next : undefined;
    },
    staleTime: 5 * 60 * 1000, // keeps catalog cached in memory for 5 mins
  });
```

### 1. `initialPageParam`

Unlike TanStack Query v4, v5 requires a explicit `initialPageParam` key in the query settings object. This indicates the parameter for the first request (e.g. `1` for page 1).

### 2. `getNextPageParam`

This callback parses the response of the _most recently loaded page_ (`lastPage`) to compute the query parameter for the _next_ request.

- Our mock API (JSON-Server v1) returns:
  `{ first: 1, prev: null, next: 2, last: 4, pages: 4, data: [...] }`
- We check if `lastPage.next` is not `null`. If it is a number, we return `lastPage.next` (e.g. `2`). If it is `null`, we return `undefined` to indicate the end of the data.

### 3. Rendering Flat Data

The returned `data` object has a structure of:
`{ pages: [Page1Response, Page2Response, ...], pageParams: [1, 2, ...] }`
To render a unified grid of cards, we flatten the items array across all loaded pages:

```typescript
const allProducts = data ? data.pages.flatMap((page) => page.data) : [];
```

### 4. Non-Intrusive Intersection Observer

Instead of installing heavy wrapper packages, we implement a lightweight scroll listener using a simple React `ref` and the browser's native `IntersectionObserver` API:

```typescript
const observerTarget = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  const target = observerTarget.current;
  if (!target || !hasNextPage || isFetchingNextPage) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage(); // Trigger next fetch when sentinel is scrolled into view
      }
    },
    { threshold: 0.1 },
  );

  observer.observe(target);
  return () => {
    if (target) observer.unobserve(target);
  };
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

### 5. Caching and Route Preservation

Because `staleTime` is set to 5 minutes:

- When a user scrolls to page 3 and clicks on **Directory & Slices**, the `/products` component is unmounted.
- However, the `products` query is marked as `inactive` in TanStack Query's cache and remains in memory (by default, `gcTime` is 5 minutes).
- When the user navigates back to **Infinite Catalog**, the component mounts, matching the cached `["products"]` key.
- Since the data is fresh (within `staleTime`), it instantly restores pages 1, 2, and 3 from memory, maintaining the user's scroll state without showing any loading indicators or refetching from the network.
