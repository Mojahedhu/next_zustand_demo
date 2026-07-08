# Module 2: Mutations & Cache Sync (Modifying Remote State)

## Now, let's proceed to Module 2.

While useQuery is used for fetching data, useMutation is used to create, update, or delete data on the server (like POST, PUT, DELETE requests).

### Concept 1: The useMutation Hook

Unlike useQuery, which runs automatically on mount, useMutation is lazy. It returns a mutate function that you trigger manually (e.g., on form submission).

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
interface NewUser {
  name: string;
}
const createUser = async (newUser: NewUser) => {
  const res = await fetch("https://jsonplaceholder.typicode.com/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};
// Inside component:
const mutation = useMutation({
  mutationFn: createUser,
});
// Triggering the mutation:
mutation.mutate({ name: "Alice" });
```

### Concept 2: Cache Invalidation

When you mutate data on the server, the client's cache is now out-of-date (stale). To sync it, we use useQueryClient() and call invalidateQueries to mark the queries as stale, forcing TanStack Query to refetch them in the background.

```typescript
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    // Invalidate the 'users' cache and trigger a background refetch
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

### Concept 3: Optimistic Updates

In production apps, waiting for the server response (which can take 1-2 seconds) makes the app feel sluggish.

Optimistic Updates solve this by updating the client-side cache instantly before the server responds, with a built-in rollback if the server request fails.

Here is the exact lifecycle blueprint:

```typescript
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: createUser,

  // 1. When the mutation is triggered:
  onMutate: async (newUser) => {
    // Cancel any outgoing refetches so they don't overwrite our optimistic update
    await queryClient.cancelQueries({ queryKey: ["users"] });
    // Snapshot the previous value in the cache to roll back to if things go wrong
    const previousUsers = queryClient.getQueryData<User[]>(["users"]);
    // Optimistically update the cache with the new user
    queryClient.setQueryData<User[]>(["users"], (old) => {
      const fallbackOld = old ?? [];
      const syntheticUser = { id: Date.now(), name: newUser.name };
      return [...fallbackOld, syntheticUser];
    });
    // Return the snapshot context
    return { previousUsers };
  },
  // 2. If the mutation fails:
  onError: (err, newUser, context) => {
    // Roll back to the saved snapshot
    if (context?.previousUsers) {
      queryClient.setQueryData(["users"], context.previousUsers);
    }
  },
  // 3. Always run this when it finishes (success or error):
  onSettled: () => {
    // Sync the cache with the actual server database state
    queryClient.invalidateQueries({ queryKey: ["users"] });
  },
});
```

### Module 2: Your Practice Challenge

Let's implement a form to add new users using useMutation with Optimistic Updates:

In src/components/userList.tsx, add a form with a text input and a submit button to add a new user.
Setup a useMutation hook to handle the POST request to https://jsonplaceholder.typicode.com/users.
Implement Optimistic Updates using the onMutate, onError, and onSettled callback pipeline shown above.
Practice Error Rollback: Simulate a network error inside your mutation function (e.g. if the input name is "error", throw a new Error). Test that entering "error" adds the name to the list instantly (optimistically), but then rolls back and disappears once the mock request fails.
No files will be modified on your workspace. Go ahead and write these modifications yourself, and let me know when you are ready for me to verify it!
