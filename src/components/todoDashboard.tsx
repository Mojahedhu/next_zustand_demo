import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

// Fetch todos from the JSON-server backend
async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch("http://localhost:4000/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
}

// Add a new todo (POST request)
async function postTodo(newTodo: {
  title: string;
  completed: boolean;
  simulateError?: boolean;
}): Promise<Todo> {
  // Simulate network delay to make the optimistic update visible
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (newTodo.simulateError) {
    throw new Error(
      "Simulated Database Error (Integrity Constraint Violation)",
    );
  }

  const res = await fetch("http://localhost:4000/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: newTodo.title,
      completed: newTodo.completed,
    }),
  });

  if (!res.ok) throw new Error("Failed to write to database");
  return res.json();
}

// Update todo (PATCH request)
async function patchTodo(
  id: string,
  updates: { title?: string; completed?: boolean },
  simulateError?: boolean,
): Promise<Todo> {
  // Simulate network delay to make the optimistic update visible
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (simulateError) {
    throw new Error(
      "Simulated Database Error (Integrity Constraint Violation)",
    );
  }

  const res = await fetch(`http://localhost:4000/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error("Failed to write to database");
  return res.json();
}

// Delete a todo (DELETE request)
async function deleteTodo(
  id: string,
  simulateError?: boolean,
): Promise<{ id: string }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (simulateError) {
    throw new Error("Simulated Authorization Error (Access Denied)");
  }

  const res = await fetch(`http://localhost:4000/todos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Failed to delete record");
  return { id };
}

export default function TodoDashboard() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [simulateError, setSimulateError] = useState(false);

  // 1. QUERY: Read Server State
  const {
    data: todos = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<Todo[], Error>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  // 2. MUTATION: Add Todo (with Optimistic Updates & Rollback)
  const addMutation = useMutation<
    Todo,
    Error,
    { title: string; completed: boolean },
    { previousTodos: Todo[] | undefined } // Context type for rollback
  >({
    mutationFn: (newTodo) => postTodo({ ...newTodo, simulateError }),

    // Step A: Runs immediately when mutate() is called
    onMutate: async (newTodo) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["todos"] });

      // 2. Snapshot the current cache values
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // 3. Optimistically update the cache with a synthetic record
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => [
        ...old,
        {
          id: `temp-add-${Date.now()}`, // Temporary string ID matching schema
          title: newTodo.title,
          completed: newTodo.completed,
        },
      ]);

      // 4. Return context containing the snapshot to pass to onError
      return { previousTodos };
    },

    // Step B: Runs if the server request fails
    onError: (err, newTodo, context) => {
      // Rollback the cache to the snapshot saved in onMutate
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
      alert(
        `⚠️ Add Failed: ${err.message}\n\n[CACHE ROLLBACK EXECUTED] The UI has reverted.`,
      );
    },

    // Step C: Runs after success or failure to ensure client/server sync
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // 3. MUTATION: Delete Todo (with Optimistic Updates & Rollback)
  const deleteMutation = useMutation<
    { id: string },
    Error,
    string,
    { previousTodos: Todo[] | undefined } // Context type for rollback
  >({
    mutationFn: (id) => deleteTodo(id, simulateError),

    // Step A: Runs immediately when mutate() is called
    onMutate: async (idToDelete) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Optimistically remove the item from the cache
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.filter((todo) => todo.id !== idToDelete),
      );

      return { previousTodos };
    },

    // Step B: Runs if the server request fails
    onError: (err, id, context) => {
      // Rollback to the previous snapshot, returning the item back to the UI list
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
      alert(
        `⚠️ Delete Failed: ${err.message}\n\n[CACHE ROLLBACK EXECUTED] Item restored.`,
      );
    },

    // Step C: Always refetch to sync with true DB state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  // 4- Mutation: update todo
  const updateMutation = useMutation<
    Todo,
    Error,
    { id: string; title?: string; completed?: boolean },
    { previousTodos: Todo[] | undefined }
  >({
    mutationFn: ({ id, title, completed }) =>
      patchTodo(id, { title, completed }, simulateError),

    //Step A: Runs immediately when mutate() is called
    onMutate: async ({ id, title, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

      // Optimistically update the cache with a synthetic record
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => {
        return old.map((todo) => {
          if (todo.id !== id) return todo;
          return {
            ...todo,
            ...(title !== undefined ? { title } : {}),
            ...(completed !== undefined ? { completed } : {}),
          };
        });
      });

      return { previousTodos };
    },

    // Step B: Runs if the server request fails
    onError: (err, variables, context) => {
      // Rollback to the previous snapshot, returning the item back to the UI list
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos"], context.previousTodos);
      }
      alert(
        `⚠️ Update Failed: ${err.message}\n\n[CACHE ROLLBACK EXECUTED] Item restored.`,
      );
    },

    // Step C: Always refetch to sync with true DB state
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addMutation.mutate({ title: title.trim(), completed: false });
    setTitle("");
  };

  const handleToggleComplete = (
    id: string,
    currentCompletedStatus: boolean,
  ) => {
    updateMutation.mutate({ id, completed: !currentCompletedStatus });
  };

  const handleTitleSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editingTitle.trim()) return;
    updateMutation.mutate({ id, title: editingTitle.trim() });
    setEditingTitle("");
    setEditingId(null);
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  // UI statistics helpers
  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;
  const percentComplete =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 border border-zinc-800 rounded-3xl min-h-[300px] w-full">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Loading Tasks...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-red-950/20 border border-red-900/50 rounded-3xl text-center w-full">
        <span className="text-2xl mb-2 block">⚠️</span>
        <h3 className="text-lg font-semibold text-red-400">
          Failed to load tasks
        </h3>
        <p className="text-sm text-red-300/70 mt-1">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          Retry Fetch
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto p-4 sm:p-6">
      {/* Simulation Controls & Status */}
      <section className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-zinc-700 transition-colors">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Testing Lab
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Error Simulator</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Toggle simulated network and database errors to test TanStack Query
            rollbacks.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-950/60 border border-zinc-800 px-4 py-3 rounded-2xl shrink-0">
          <input
            id="simulate-error-toggle"
            type="checkbox"
            checked={simulateError}
            onChange={(e) => setSimulateError(e.target.checked)}
            className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-rose-500 focus:ring-rose-500/20 cursor-pointer"
          />
          <label
            htmlFor="simulate-error-toggle"
            className="text-xs font-semibold text-zinc-300 cursor-pointer select-none"
          >
            Simulate Server Write Failures
          </label>
        </div>
      </section>

      {/* Main Todo Card */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700">
        {/* Header and Background Sync Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Server State
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Todo Dashboard
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Optimistic Updates Demo
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isFetching && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[10px] text-violet-300 font-medium tracking-wide uppercase">
                  Refetching
                </span>
              </div>
            )}
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Dashboard Progress Ring/Bar */}
        <div className="p-4 bg-zinc-950/40 border border-zinc-800 rounded-2xl mb-6 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-zinc-400">
              Milestone Progress
            </span>
            <span className="text-xs font-mono font-bold text-violet-400">
              {percentComplete}% Complete
            </span>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
            <div
              className="bg-linear-to-r from-violet-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 font-mono">
            Finished: {completedCount} / Total: {totalCount}
          </p>
        </div>

        {/* Todo List */}
        <div className="flex flex-col gap-3">
          {todos.map((todo) => {
            const isOptimisticAdd = todo.id.startsWith("temp-add-");
            const isDeleting =
              deleteMutation.isPending && deleteMutation.variables === todo.id;
            const isUpdating =
              updateMutation.isPending &&
              updateMutation.variables?.id === todo.id;

            const isEditing = editingId === todo.id;

            return (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl transition-all hover:bg-zinc-950 hover:border-zinc-700 ${
                  isOptimisticAdd
                    ? "opacity-60 border-dashed border-violet-500/40 bg-violet-950/5"
                    : ""
                } ${isDeleting ? "opacity-30 scale-95" : ""} ${isUpdating ? "opacity-75 border-zinc-600/50" : ""}`}
              >
                <div className="flex items-center gap-3 text-left flex-1 mr-4">
                  {/* Status Indicator */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      todo.completed
                        ? "bg-emerald-400"
                        : isOptimisticAdd
                          ? "bg-violet-400 animate-pulse"
                          : "bg-zinc-600"
                    }`}
                  />

                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleTitleSubmit(e, todo.id)}
                      className="flex items-center gap-2 flex-1 animate-fade-in"
                    >
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-850 rounded-xl text-zinc-200 text-sm focus:border-violet-500 focus:outline-none transition-colors"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div>
                      <p
                        onDoubleClick={() =>
                          !isOptimisticAdd &&
                          !isDeleting &&
                          startEditing(todo.id, todo.title)
                        }
                        title="Double-click to edit task title"
                        className={`text-sm font-medium ${todo.completed ? "line-through text-zinc-600" : "text-zinc-200"}`}
                      >
                        {todo.title}
                      </p>
                      {(isOptimisticAdd || isUpdating) && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-violet-400 font-mono">
                          {isOptimisticAdd
                            ? "Saving to Server..."
                            : "Syncing status..."}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Update button */}
                    <button
                      onClick={() =>
                        handleToggleComplete(todo.id, todo.completed)
                      }
                      disabled={isOptimisticAdd || isDeleting || isUpdating}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                        todo.completed
                          ? "bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                          : "bg-violet-950/20 border-violet-900/30 text-violet-400 hover:bg-violet-950/50 hover:border-violet-900/60"
                      }`}
                    >
                      {todo.completed ? "Undo" : "Complete"}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(todo.id)}
                      disabled={isOptimisticAdd || isDeleting}
                      className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 hover:border-red-900/60 disabled:opacity-30 disabled:cursor-not-allowed text-red-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {todos.length === 0 && (
            <div className="text-center py-12 text-zinc-600 text-sm font-medium">
              No tasks left. Complete the milestone by adding a todo below!
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddSubmit} className="mt-8 flex gap-3 text-left">
          <div className="flex-1">
            <input
              type="text"
              required
              placeholder="Add a new task (e.g., Implement optimistic deletions)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-violet-500 focus:outline-none text-zinc-200 text-sm placeholder:text-zinc-700 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={addMutation.isPending || !title.trim()}
            className="px-6 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-zinc-700 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-lg shadow-violet-600/10 active:scale-[0.98] transition-all text-sm shrink-0 cursor-pointer flex items-center justify-center gap-2"
          >
            {addMutation.isPending ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Adding...
              </>
            ) : (
              "Add Task"
            )}
          </button>
        </form>
      </section>

      {/* Explainer Panel for Study */}
      <section className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-left">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
          How Optimistic Updates and Rollbacks work in this code:
        </h3>
        <ol className="list-decimal list-inside text-zinc-400 space-y-3.5 text-xs sm:text-sm leading-relaxed">
          <li>
            <strong className="text-zinc-200 font-semibold">
              onMutate (Triggered Instantly):
            </strong>{" "}
            We cancel current outgoing fetches using{" "}
            <code className="bg-zinc-950 px-1 py-0.5 rounded text-zinc-400 font-mono text-xs">
              cancelQueries
            </code>
            , snapshot the existing state with{" "}
            <code className="bg-zinc-950 px-1 py-0.5 rounded text-zinc-400 font-mono text-xs">
              getQueryData
            </code>
            , and optimistically write the new values into the cache using{" "}
            <code className="bg-zinc-950 px-1 py-0.5 rounded text-zinc-400 font-mono text-xs">
              setQueryData
            </code>
            .
          </li>
          <li>
            <strong className="text-zinc-200 font-semibold">
              onError (Rollback on Failure):
            </strong>{" "}
            If the network request fails (e.g. database write failure or
            simulated error), we read the saved snapshot context and restore it
            instantly, causing the failed todo to vanish (or deleted todo to
            reappear) without page reloads.
          </li>
          <li>
            <strong className="text-zinc-200 font-semibold">
              onSettled (Sync Verification):
            </strong>{" "}
            Once complete (regardless of success or failure), we trigger{" "}
            <code className="bg-zinc-950 px-1 py-0.5 rounded text-zinc-400 font-mono text-xs">
              invalidateQueries
            </code>{" "}
            to force a background refetch, syncing the UI with the final
            server-side source of truth.
          </li>
        </ol>
      </section>
    </div>
  );
}
