# Curriculum Roadmap: Mastering TanStack Query (React Query)

This roadmap is designed to take you from a complete beginner to an enterprise-grade expert in server-state management using **TanStack Query v5** inside Next.js 16 (App Router).

---

## Module 1: The Core Query Lifecycle (The "Why" and "How")

### Learning Objectives:

- Understand the core problem: **Client State** (Zustand/Redux) vs. **Server State** (caching, synchronization, and remote data ownership).
- Master the Query Lifecycle states: `fresh`, `stale`, `fetching`, `inactive`, and `paused`.
- Configure the root setup: `QueryClient`, `QueryClientProvider`, and TanStack Query Devtools.

### Key Concepts:

- **The `useQuery` Hook**: Deep dive into `queryKey` (arrays for dependency tracking) and `queryFn` (promises).
- **Destructured States**: Understanding `isPending`, `isFetching`, `isError`, `error`, and `data`.
- **Semantic Query Keys**: How nested arrays `['users', userId]` manage isolated cache scopes.

### Interactive Milestone:

Build a simple dashboard that fetches a list of items from a mock API, displaying loading spinners, elegant error messages with manual refetch triggers, and showcasing how caching prevents duplicate network requests.

---

## Module 2: Mutations & Cache Sync (Modifying Remote State)

### Learning Objectives:

- Learn how to modify server data and sync the local cache immediately.
- Master the hooks and options for POST, PUT, and DELETE actions.

### Key Concepts:

- **The `useMutation` Hook**: `mutate` vs. `mutateAsync`, and the callback pipeline (`onMutate`, `onSuccess`, `onError`, `onSettled`).
- **Cache Invalidation**: Using `queryClient.invalidateQueries` to automatically trigger refetches of stale data.
- **Optimistic Updates**: Updating the UI instantly _before_ the server responds, handling rollback mechanisms on failure, and cleaning up cache records.

### Interactive Milestone:

Create a todo dashboard. Implement a form to add/delete tasks. When adding a task, update the UI optimistically. If the mock API throws a random error, roll back the UI to its previous state safely without page reloads.

---

## Module 3: Advanced Query Configuration (Performance & UX)

### Learning Objectives:

- Control exactly when and how queries refetch to save server bandwidth and improve user experience.
- Implement advanced fetching patterns (pagination, infinite scroll).

### Key Concepts:

- **Cache Control**: Master the difference between `staleTime` (when data is considered old) and `gcTime` (garbage collection time, formerly `cacheTime`).
- **Refetch Behaviors**: Toggling `refetchOnWindowFocus`, `refetchOnMount`, `refetchOnReconnect`, and configuring `retry` delay algorithms.
- **Paginated Queries**: Keeping the previous layout smooth using `placeholderData: keepPreviousData`.
- **Infinite Queries**: Implementing pagination with `useInfiniteQuery` (managing `getNextPageParam` and `fetchNextPage`).

### Interactive Milestone:

Build an infinite-scrolling product grid with a "Load More" button or intersection observer. The feed must fetch pages sequentially, cache them, and allow the user to navigate away and return without losing their scroll pagination cache.

---

## Module 4: Next.js 16 SSR Integration (Pre-fetching & Hydration)

### Learning Objectives:

- Solve the SSR data gap: rendering SEO-friendly HTML on the server and passing it to client-side TanStack queries seamlessly.
- Avoid double-fetching data on server and client.

### Key Concepts:

- **Initial Data Pattern**: Passing pre-fetched server component data directly to client components via props.
- **Dehydrate & Hydrate Pattern (The Enterprise Way)**:
  - Using Next.js Server Components to pre-fetch queries via `queryClient.prefetchQuery`.
  - Wrapping client trees inside a `<HydrationBoundary>` to dehydrate the query cache into HTML.
  - How client-side queries immediately adopt the pre-fetched state on mount.

### Interactive Milestone:

Create a product detail page in Next.js. Pre-fetch the product details inside a Server Component, dehydrate the state, and render a Client Component that consumes the data via `useQuery` immediately without a client-side loading flash.

---

## Module 5: Scalable Architecture & Testing

### Learning Objectives:

- Organize TanStack Query in a large-scale project.
- Write robust unit tests for your query/mutation hooks.

### Key Concepts:

- **Query Key Factories**: Standardizing query keys centrally (`userKeys.all`, `userKeys.detail(id)`) to avoid typos.
- **Custom Query Hooks**: Abstracting query logic into modular custom hooks (e.g., `useUserQuery(id)`).
- **Global Error Handling**: Setting up global error boundaries or global toast notifications using the `QueryCache` event callbacks.
- **Testing Queries**: Mocking network requests using **MSW (Mock Service Worker)** and testing custom hooks using `@testing-library/react-hooks`.

### Interactive Milestone:

Refactor your project hooks into a clean query factory structure. Write a comprehensive Vitest unit test for a custom hook (`useCreateTodo`), mocking API mutations with MSW and asserting cache updates.
