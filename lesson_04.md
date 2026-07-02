# Module 4: The Next.js 16 Server-Client Data Sync.

This is one of the most critical parts of using Zustand in modern Next.js applications, covering:

- Per-Request Stores: Why sharing a single global store instance on the server is dangerous (cross-request state pollution).
- The Store Provider Pattern: Creating stores per-request and passing them via React Context.
- Server-to-Client Sync: Ingesting server-side database payloads (SSR data) directly into client-side Zustand stores on mount.

# Implementation Plan: Module 4 - Server-Client Data Sync (Store Provider Pattern)

We will refactor the application to instantiate the Zustand store **per request** instead of using a global singleton. This is a critical production pattern for Next.js SSR to avoid cross-request state pollution. We will also demonstrate how to seed initial server-side fetched data into the client store.

## Proposed Architecture

### 1. [NEW] Vanilla Store Creator

File: `src/store/store.ts`

- Moves the store definition to a creator function `createAppStore(initialValues?: Partial<StoreState>)`.
- Uses `createStore` from `"zustand"` (vanilla) instead of `create` (React-bound).

### 2. [NEW] Store Provider & Custom Context Hook

File: `src/store/store-provider.tsx`

- **`StoreProvider`**: Creates a React Context. Uses a `useRef` to instantiate `createAppStore(initialValues)` exactly once per request.
- **`useAppStore`**: Custom React hook wrapping `useContext(StoreContext)` and `useSyncExternalStore` (via `useStore` from `"zustand"`) to extract isolated slices of state.
- **`useAppStoreApi`**: Hook to get raw access to the store API (e.g. for manual rehydration).

### 3. [MODIFY] Hydration Hook

File: `src/hooks/use-has-hydrated.ts`

- Accesses the per-request store via `useAppStoreApi()` and triggers `rehydrate()` upon mounting on the client.

### 4. [MODIFY] App Layout (Server Component)

File: `src/app/layout.tsx`

- Simulates a server-side fetch (e.g., retrieving a logged-in user session from database/cookies).
- Wraps the application children in `<StoreProvider initialValues={{ username: serverFetchedUser }}>`.

### 5. [MODIFY] Main Page

File: `src/app/page.tsx`

- Refactors all selectors to use the new `useAppStore` hook instead of `useStore`.

---

# Implementation Plan: Module 4 - Server-Client Data Sync (Exhaustive Guide)

To prevent cross-request state pollution during Server-Side Rendering (SSR) in Next.js, we must instantiate our Zustand store **once per request**.

This plan details the full implementation steps, file structure, and code blocks needed to refactor our store into a per-request Context-based store. **No project files will be modified by the assistant; you will write these yourself for practice.**

---

## 1. Create the Vanilla Store Creator (`src/store/store.ts`)

Instead of exporting a global hook directly (`export const useStore = create(...)`), we export a factory function `createAppStore` using Zustand's vanilla `createStore`. This allows us to instantiate a unique store instance on every request.

### Code Implementation:

```typescript
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice, AuthSlice } from "./slices/auth-slice";
import { createCartSlice, CartSlice } from "./slices/cart-slice";

// 1. Combine our slice interfaces
export type StoreState = AuthSlice & CartSlice;

// 2. Define a factory function to instantiate the store per-request
export const createAppStore = (initProps?: Partial<StoreState>) => {
  return createStore<StoreState>()(
    persist(
      (...a) => ({
        ...createAuthSlice(...a),
        ...createCartSlice(...a),
        ...initProps, // Inject initial server-fetched values
      }),
      {
        name: "app-storage",
        skipHydration: true, // Let useHasHydrated trigger rehydration on the client
      },
    ),
  );
};

// 3. Extract the store type helper
export type AppStore = ReturnType<typeof createAppStore>;
```

---

## 2. Create the Store Provider (`src/store/store-provider.tsx`)

This file sets up a React Context to hold the store instance and exposes a provider component and hooks to subscribe to state slices in client components.

### Code Implementation:

```typescript
"use client";

import { createContext, useContext, useRef } from "react";
import { useStore as useZustandStore } from "zustand";
import { createAppStore, AppStore, StoreState } from "./store";

// 1. Create the React Context
export const StoreContext = createContext<AppStore | null>(null);

interface StoreProviderProps {
  children: React.ReactNode;
  initialValues?: Partial<StoreState>;
}

// 2. The Provider Component
export function StoreProvider({ children, initialValues }: StoreProviderProps) {
  // We use useRef to guarantee the store is only instantiated ONCE
  // per component tree mount (i.e. once per request)
  const storeRef = useRef<AppStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = createAppStore(initialValues);
  }

  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
}

// 3. Hook to select state slices from the context-bound store
export function useAppStore<T>(selector: (state: StoreState) => T): T {
  const storeContext = useContext(StoreContext);
  if (!storeContext) {
    throw new Error("useAppStore must be used within a StoreProvider");
  }

  // useZustandStore connects a vanilla store instance to React's rendering lifecycle
  return useZustandStore(storeContext, selector);
}

// 4. Hook to obtain the raw store API (needed for rehydration/listeners)
export function useAppStoreApi() {
  const storeContext = useContext(StoreContext);
  if (!storeContext) {
    throw new Error("useAppStoreApi must be used within a StoreProvider");
  }
  return storeContext;
}
```

---

## 3. Update the Hydration Hook (`src/hooks/use-has-hydrated.ts`)

Since the store is now provided per-request via context, the hydration hook must obtain the store instance from the context rather than importing a global singleton.

### Code Implementation:

```typescript
import { useEffect, useState } from "react";
import { useAppStoreApi } from "@/store/store-provider";

export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const store = useAppStoreApi(); // Grab the request-scoped store API

  useEffect(() => {
    // Manually trigger rehydration for this request's store
    store.persist.rehydrate();
    setHasHydrated(true);
  }, [store]);

  return hasHydrated;
}
```

---

## 4. Inject Server Data in Layout (`src/app/layout.tsx`)

`layout.tsx` is a Server Component. Here, we can simulate fetching user data from a session, cookie, or database on the server, and inject it directly into the `StoreProvider` as initial values.

### Code Implementation:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/store/store-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zustand Masterclass",
  description: "Module 4 - Server-Client Data Sync",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // ⚡ SIMULATE SERVER FETCH (e.g. database query or session retrieval)
  // In a real application, you would do: const user = await db.getUser()
  const mockServerFetchedUser = "DatabaseUser_42";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* We seed the store with the server-fetched user name */}
        <StoreProvider initialValues={{ username: mockServerFetchedUser }}>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

---

## 5. Refactor Page Selectors (`src/app/page.tsx`)

In `page.tsx`, we swap out the global `useStore` hook for our new context-bound `useAppStore` hook inside the sub-components.

### Code Implementation Checkpoints:

#### Inside `AuthenticationCard`:

```typescript
// Replace the old useStore hook calls:
const username = useAppStore((state) => state.username);
const login = useAppStore((state) => state.login);
const logout = useAppStore((state) => state.logout);
```

#### Inside `ShoppingCart`:

```typescript
// Replace the old useStore hook calls:
const username = useAppStore((state) => state.username);
const items = useAppStore((state) => state.items);
const addItem = useAppStore((state) => state.addItem);
const clearCart = useAppStore((state) => state.clearCart);
```

---

## Verification & Key Concept Checks

After implementing the files above:

1. **Initial Mount Check**: When the page loads, the User Profile should immediately show **"DatabaseUser_42"** (the value fetched on the server), demonstrating successful data sync from server to client.
2. **Persistence Check**: If you log in as another user (e.g. "Alice") and refresh, the browser should first render the server fallback during hydration, and then rehydrate to "Alice" from `localStorage` on mount (thanks to `rehydrate()` inside `useHasHydrated`).
3. **No Mismatch Warning**: Verify that the Next.js terminal and browser console are free of hydration errors.

Cross-request state pollution (also known as state leakage) is a critical security vulnerability and bug category that occurs in Server-Side Rendered (SSR) environments like Next.js.

Here is exactly how it happens:

The Problem: Global Singletons on a Long-Running Server
In a client-only React app (like a standard Vite React app), the entire application runs inside a single user's browser. Having a global store singleton is perfectly safe:

typescript

// ❌ Dangerous in SSR / Safe in CSR
export const useStore = create((set) => ({ username: null }));
However, in Next.js, pages are pre-rendered on a Node.js server. The Node.js server is a long-running process that stays alive in memory to serve thousands of different users.

If you use a global singleton store, every single user request shares the exact same store instance in the server's memory.

A Step-by-Step Scenario of the Leak
Imagine User A and User B request the website at almost the same time:

Mermaid diagram
User A ("Alice") hits the server. The server fetches Alice's session, sets the global store's username to "Alice", renders the page to HTML, and sends it to Alice.
User B ("Bob") hits the server a millisecond later. Because the server process never restarted, the global store in the server memory still has username: "Alice".
If Bob's request doesn't overwrite it immediately (or if there is an asynchronous delay/race condition), the server will pre-render Bob's page using Alice's data.
Bob sees Alice's private data.
How the Store Provider Pattern Fixes This
Instead of exporting a global singleton, we use a factory function (createAppStore) to generate a new store, and wrap it in a React Context Provider using a useRef:

typescript

export function StoreProvider({ children }) {
const storeRef = useRef();
if (!storeRef.current) {
storeRef.current = createAppStore(); // Created once per request!
}
return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>
}
Isolated Memory: When Next.js renders the page for User A, React creates a component tree for that request. The useRef instantiates a brand new, isolated store instance.
No Shared State: When Next.js renders the page for User B, it renders a separate component tree. React instantiates another completely separate store instance.
Garbage Collection: Once the server finishes rendering the HTML for a request and sends it to the browser, that specific React component tree (and its store instance) is discarded and garbage-collected, leaving zero trace in the server's global memory.
