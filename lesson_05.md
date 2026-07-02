# Module 5: Polishing, Optimization & Production Audit

We are now entering the final module of the course curriculum: Module 5: Polishing, Optimization & Production Audit.

In this module, we will explore:

- Schema Validation inside Actions (Zod): Why we should validate incoming inputs/API data at runtime before committing them to the state.
- Unit Testing Zustand Stores: How to write unit tests for stores without needing to mount React components.
- Concept 1: Runtime Validation with Zod
  TypeScript only provides compile-time safety. If a malicious user inputs an empty string, or an API returns corrupt payload types, your store will accept it and corrupt your UI state.

To prevent this, we use Zod to validate state transitions at runtime inside our actions.

Step-by-Step implementation pattern:
Install Zod (if not already installed, though it is usually in modern templates. Let's assume you'll add it or already have it).
Define a Schema for the input:

```typescript
import { z } from "zod";
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters long")
  .max(20, "Username cannot exceed 20 characters");
// Parse and handle errors inside the action:
// typescript

login: (name: string) => {
  const validation = usernameSchema.safeParse(name);
  if (!validation.success) {
    // Throw error or set a local validation error state
    throw new Error(validation.error.errors[0].message);
  }
  set({ username: validation.data });
};
```

Concept 2: Writing Unit Tests for Slices
Since we decoupled our store creation into a factory function (createAppStore), writing unit tests is extremely simple! We do not need to wrap our test in a React testing container or mount components. We can test the vanilla store directly:

```typescript
import { createAppStore } from "./store";
describe("AuthSlice", () => {
  it("should initialize with an empty username", () => {
    const store = createAppStore();
    expect(store.getState().username).toBe("");
  });
  it("should update username on login", () => {
    const store = createAppStore();
    store.getState().login("John");
    expect(store.getState().username).toBe("John");
  });
  it("should clear username and cart on logout", () => {
    const store = createAppStore();
    store.getState().login("John");
    store.getState().addItem("Keyboard");

    store.getState().logout();

    expect(store.getState().username).toBe("");
    expect(store.getState().items).toEqual([]); // Verify cross-slice interaction
  });
});
```

Module 5: Your Practice Challenge
Let's implement runtime Zod validation for our username login flow:

Check if zod is installed in the project (if not, you can run pnpm add zod).
Update authSlice.ts to include a validation schema for the username. It must be between 3 and 20 characters.
In authSlice.ts, update login to validate the username. If validation fails, throw an error or handle it.
Update AuthenticationCard in
page.tsx
to catch any validation errors thrown during login(inputName) and display the error message in red text below the input field.
As requested, I will not modify any files on your workspace. Go ahead and write these modifications yourself, and let me know when you are ready for me to verify it!

# Testing Implementation steps:

# 1. File Naming Conventions

In TypeScript/Next.js projects, tests should follow one of these conventions:

Colocation (Recommended): Keep the test file right next to the code file it tests.
Store file: src/store/store.ts
Test file: src/store/store.test.ts (or store.spec.ts)
Dedicated Test Directory: Group all tests in a nested **tests** folder.
Store file: src/store/store.ts
Test file: src/store/**tests**/store.test.ts 2. Step-by-Step Setup Guide
Since your project currently does not have testing libraries installed, here are the steps to set them up:

Step A: Install Vitest
Run the following command in your terminal to install Vitest as a development dependency:

```bash


pnpm add -D vitest
```

Step B: Add Test Scripts to package.json
Open your
package.json
file and add the following scripts to the "scripts" block:

```json


"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",       // Runs all tests once and exits (useful for CI/CD)
  "test:watch": "vitest"      // Runs tests in interactive watch mode (useful during dev)
}
```

Step C: Create the Test File (src/store/store.test.ts)
Create a new file src/store/store.test.ts and add the test suite we discussed earlier:

```typescript
import { describe, it, expect } from "vitest";
import { createAppStore } from "./store";
describe("Application Store Slices", () => {
  it("should initialize with default empty values", () => {
    const store = createAppStore();
    expect(store.getState().username).toBe("");
    expect(store.getState().items).toEqual([]);
  });
  it("should update username on successful login", () => {
    const store = createAppStore();
    store.getState().login("Mojahed");
    expect(store.getState().username).toBe("Mojahed");
  });
  it("should throw an error on Zod validation failure for short usernames", () => {
    const store = createAppStore();
    // Verify that login throws an error when the username is too short (< 3 chars)
    expect(() => store.getState().login("Mo")).toThrow();
  });
  it("should clear the cart and username on logout", () => {
    const store = createAppStore();

    // Simulate user state
    store.getState().login("Mojahed");
    store.getState().addItem("⌨️ Mechanical Keyboard");

    // Trigger cross-slice logout action
    store.getState().logout();

    expect(store.getState().username).toBe("");
    expect(store.getState().items).toEqual([]);
  });
});
```

Step D: Run Your Tests
To run your test suite, use the following commands in your terminal:

To run tests once:

```bash

pnpm test
```

To run in watch mode (reruns tests automatically as you edit files):

```bash

pnpm run test:watch
```

🔴 Why it happens
Because Vitest runs your tests in a Node.js server environment by default (where window and localStorage do not exist), Zustand’s persist middleware warns you that it can't save the state.

🟢 How to silence them
If you want to mock a browser environment for your store tests, you can tell Vitest to run the test file in a jsdom environment.

Install jsdom:

```bash

pnpm add -D jsdom
```

Add this special comment at the very top (first line) of your
store.test.ts
file:

```typescript
// @vitest-environment jsdom
```

This will automatically mock window and localStorage for your store tests, silencing all warnings and making the environment match the browser!

## The get parameter is one of the most useful utilities in Zustand. It is a function that, when called as get(), returns the current snapshot of the entire store state.

# Here are the 4 primary use cases where you must use get() in production:

# Use Case 1: Reading State without Mutating It (Asynchronous Actions)

When an action needs to read a state variable—especially before performing an asynchronous operation (like an API call)—we use get().

Since set() is for merging changes, it is not suitable for just reading:

```typescript
fetchUserData: async () => {
  // 1. Grab the current token from the state using get()
  const token = get().authToken;

  if (!token) return;
  // 2. Perform the async side effect
  const response = await fetch("/api/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  // 3. Commit the result to the store
  set({ profile: data });
};
```

# Use Case 2: Action Guards and Conditional Logic

You often need to check the current value of a store variable before deciding whether to run an action. get() allows you to inspect the store's current values to create "guards":

```typescript
addItem: (item: string) => {
  const currentItems = get().items;

  // Guard 1: Prevent duplicates
  if (currentItems.includes(item)) return;
  // Guard 2: Prevent exceeding a limit
  if (currentItems.length >= 10) {
    throw new Error("Cart is full!");
  }
  set({ items: [...currentItems, item] });
};
```

# Use Case 3: Cross-Slice State Reading

In a sliced architecture (like our AuthSlice & CartSlice), slices are developed separately but merged into one store under the hood.

Because get() returns the entire combined state, actions inside CartSlice can read variables inside AuthSlice:

```typescript
// Inside createCartSlice:
addItem: (item: string) => {
  // Read 'username' (which lives in AuthSlice) from CartSlice using get()!
  const username = get().username;
  if (!username) {
    throw new Error("You must log in to add items to the cart.");
  }
  set((state) => ({ items: [...state.items, item] }));
};
```

# Use Case 4: Debouncing or Preventing Duplicate Requests

If you want to prevent triggering an API request if one is already loading, get() can check the loading status:

```typescript
fetchProducts: async () => {
  // Guard: If we are already fetching, exit immediately
  if (get().isLoading) return;
  set({ isLoading: true });
  const products = await api.getProducts();
  set({ products, isLoading: false });
};
```

Summary Table
Code Pattern When to Use
set((state) => ({ count: state.count + 1 })) When you only need to write (or update) a value relative to its previous state.
get().value When you need to read a value to use in conditions, API headers, logging, or cross-slice logic.

```

```
