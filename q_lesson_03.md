# Module 3: Advanced Query Configuration (Performance & UX)

## Let's move on to Module 3.

### In this module, we learn how to control cache lifetime, configure refetching behaviors, and implement seamless pagination.

##### Concept 1: staleTime vs. gcTime

These are the two most important time configurations in TanStack Query:

##### staleTime (Freshness):

- Definition: The duration in milliseconds that data is considered fresh (up-to-date).
- Behavior: If the data is fresh, TanStack Query will return it from the cache and will not make a network request when a component mounts or when the window gains focus.
- Default: 0 (meaning data goes stale immediately).

##### gcTime (Garbage Collection Time - formerly cacheTime):

- Definition: The duration in milliseconds that inactive data (data with no active component subscribing to it) remains in the cache memory.
- Behavior: Once a component unmounts and the query becomes inactive, TanStack Query starts a timer. When the timer hits gcTime, it deletes the data from memory.
- Default: 5 _ 60 _ 1000 (5 minutes).

##### Concept 2: Refetch Options

You can control when the cache automatically syncs with the server using these options inside useQuery:

- refetchOnWindowFocus: Refetches when you click back into the browser window (default: true).
- refetchOnMount: Refetches when the component mounts if the data is stale (default: true).
- refetchOnReconnect: Refetches if the network goes down and comes back online (default: true).
- retry: Number of retry attempts if a query fails before showing the error screen (default: 3 with exponential backoff).

##### Concept 3: Paginated Queries (keepPreviousData)

In standard pagination, when a user clicks "Next Page", the cache changes key (e.g. from ['users', 1] to ['users', 2]). Since page 2 is not in the cache, the screen would flash a loading spinner.

To prevent this layout shift, TanStack Query v5 provides the keepPreviousData utility imported from @tanstack/react-query:

```typescript
import { keepPreviousData, useQuery } from "@tanstack/react-query";
const { data, isPending } = useQuery({
  queryKey: ["users", page],
  queryFn: () => fetchUsersPage(page),
  placeholderData: keepPreviousData, // 👈 Keeps page 1 visible while page 2 loads!
});
```

Because of keepPreviousData, the old page remains interactive on the screen until the new page's request is completed, making page transitions feel instant.

##### Module 3: Your Practice Challenge

Let's implement Pagination with JSON-Server and keepPreviousData:

1- **JSON-Server Pagination**: JSON-server supports pagination using the query parameters \_page and \_limit. Update fetchUser in src/components/userList.tsx to take a page number and request a limit of 3 users per page (e.g. http://localhost:4000/users?\_page=${page}&\_limit=3).

2- **Page State**: Add a const [page, setPage] = useState(1) state in your component.

3- **Query Key Dependency**: Update the query key to ['users', page]. (This is crucial: when page changes, the query key changes, automatically triggering a refetch!).

4- **Smooth Transitions**: Implement placeholderData: keepPreviousData in the query configuration.

5- **UI Controls**: Add "Previous" and "Next" buttons below the list to increment/decrement the page state. Disable the "Previous" button if page === 1.

6- **Background indicator**: Highlight to the user that a fetch is happening in the background during page transition by using the isPlaceholderData property from the query result.
