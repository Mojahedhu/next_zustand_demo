# Welcome to Module 1: The Core Query Lifecycle (The "Why" and "How")!

Let's begin by understanding why we need a dedicated tool like TanStack Query when we already have state managers like Zustand.

## Concept 1: Client State vs. Server State

**Historically**, developers stored all application data in a single global store (like Redux or Zustand). However, data in an application actually falls into two very different categories:

### Client State:

**Definition**: State that is created locally and owned entirely by the browser (e.g., whether a sidebar is open, the current dark mode theme, page input forms).
**Characteristics**: Synchronous, easily updated, and always up-to-date.
**Best Tool**: Zustand, Recoil, or React useState.

## Server State:

**Definition**: State that resides on a remote server/database (e.g., user profiles, list of posts, product details).
**Characteristics**: Asynchronous, needs to be fetched, can be mutated by other users, and goes stale the moment it is fetched.
**Best Tool**: TanStack Query (React Query).
**TanStack Query** is not a state manager in the traditional sense; it is a **server-state cache**. It handles caching, background refetching, deduplicating network requests, and garbage collection automatically.

## Concept 2: The Core Setup

To use TanStack Query, we must initialize a **QueryClient** (the cache engine) and wrap our application in a **QueryClientProvider** (to share the engine).

### 1. Installation

First, install the core library:

```bash
pnpm add @tanstack/react-query
```

### 2. The Provider Setup (src/store/query-provider.tsx)

In Next.js App Router, the provider must be a Client Component:

```typescript
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
export default function QueryProvider({ children }: { children: React.ReactNode }) {
// We use useState to ensure the QueryClient is only created ONCE per session
// and not recreated on every render.
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 \* 1000, // Data is fresh for 1 minute before refetching in background
            },
        },
    }));
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
```

### Concept 3: Fetching Data with useQuery

To fetch data, we use the **useQuery** hook. It requires two main options:

**queryKey**: An array that uniquely identifies this query in the cache (e.g., ['products'] or ['product', productId]).
**queryFn**: A function that returns a Promise resolving the data or throwing an error.

```typescript
import { useQuery } from "@tanstack/react-query";
interface User {
    id: number;
    name: string;
}
const fetchUsers = async (): Promise<User[]> => {
    const res = await fetch("https://jsonplaceholder.typicode.com/users");
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
};
function UserList() {
    const { data, error, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ["users"],
        queryFn: fetchUsers,
    });
    if (isLoading) return <div>Loading users...</div>;
    if (isError) return <div>Error: {error.message}</div>;
    return (
        <div>
            <ul>
                {data?.map(user => <li key={user.id}>{user.name}</li>)}
            </ul>
            <button onClick={() => refetch()}>Force Refresh</button>
            {isFetching && <div>Refetching in background...</div>}
        </div>
    );
}
```

### Module 1: Your First Interactive Task

To start practicing, let's set up the core provider and fetch some mock data:

**Install the @tanstack/react-query package**:

```bash
pnpm add @tanstack/react-query
```

**Create the file src/components/query-provider.tsx** and implement the QueryProvider as shown above.

**Import this QueryProvider in layout.tsx**
and nest it inside the existing StoreProvider.
Create a mock fetch component to fetch a list of users from https://jsonplaceholder.typicode.com/users using useQuery and display them on
page.tsx
.

**Question for you:**

What is the difference between isLoading (or isPending in v5) and isFetching in the useQuery return object? (Hint: Think about what happens when you click "Force Refresh" or when data is updated in the background).

**Answer:**

- **isLoading** (or **isPending** in v5): This is true only when the query is fetching data for the _very first time_ and there is no cached data yet. It is false during background refetches.

- **isFetching**: This is true whenever a fetch is in progress, regardless of whether there is cached data. This includes:
  - The initial fetch.
  - Background refetches (triggered by `refetch`, window focus, or automatic polling).
  - Re-fetches triggered by changes in the `queryKey`.

**In short:**

- isPending: True only on the very first load when the cache is empty.
- isFetching: True on every request (including background syncs and manual refetches).
