import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Inactive" | "Suspended";
  createdAt: string;
}

interface UserResponse {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: User[];
}

interface NewUser {
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Inactive" | "Suspended";
}

async function fetchUser(page: number): Promise<UserResponse> {
  const res = await fetch(
    `http://localhost:4000/users?_page=${page}&_per_page=3`,
  );
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function createUser(newUser: NewUser): Promise<User> {
  const res = await fetch("http://localhost:4000/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...newUser,
      createdAt: new Date().toISOString().split("T")[0],
    }),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarBg(name: string) {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    "from-violet-600 to-indigo-600",
    "from-emerald-600 to-teal-600",
    "from-pink-600 to-rose-600",
    "from-amber-500 to-orange-600",
    "from-cyan-500 to-blue-600",
  ];
  return gradients[hash % gradients.length];
}

const UserList = () => {
  const [page, setPage] = useState<number>(1);
  const queryClient = useQueryClient();

  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
    isFetching,
    isPlaceholderData,
  } = useQuery<UserResponse, Error>({
    queryKey: ["users", page],
    queryFn: () => fetchUser(page),
    placeholderData: keepPreviousData,
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [status, setStatus] = useState<"Active" | "Inactive" | "Suspended">(
    "Active",
  );

  const { mutate, isPending } = useMutation<
    User,
    Error,
    NewUser,
    { previousUsers: UserResponse | undefined }
  >({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      const previousUsers = queryClient.getQueryData<UserResponse>([
        "users",
        page,
      ]);

      queryClient.setQueryData<UserResponse>(["users", page], (old) => {
        if (!old) return old;

        const syntheticUser: User = {
          id: `temp-${Date.now()}`,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department: newUser.department,
          status: newUser.status,
          createdAt: new Date().toISOString().split("T")[0],
        };

        return {
          ...old,
          items: old.items + 1,
          data: [...old.data, syntheticUser],
        };
      });

      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(["users", page], context.previousUsers);
      }
      alert(err.message + `\n Failed to add ${newUser.name}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role.trim()) return;

    mutate({
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department,
      status,
    });

    setName("");
    setEmail("");
    setRole("");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 border border-zinc-800 rounded-3xl min-h-[300px] w-full">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">
          Loading Directory...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-red-950/20 border border-red-900/50 rounded-3xl text-center w-full">
        <span className="text-2xl mb-2 block">⚠️</span>
        <h3 className="text-lg font-semibold text-red-400">Connection Error</h3>
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

  const hasNextPage = page < (data?.pages ?? 1);
  const hasPreviousPage = page > 1;

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Directory Table Card */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700">
        {/* Sync Indicator */}
        <div className="absolute top-6 right-8 flex items-center gap-2">
          {isFetching && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] text-violet-300 font-medium tracking-wide uppercase">
                Syncing
              </span>
            </div>
          )}
        </div>

        <div className="mb-6 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
            Database State
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Enterprise Directory
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Showing {data?.data.length || 0} of {data?.items || 0} employees
          </p>
        </div>

        {/* Directory List / Table */}
        <div
          className={`transition-opacity duration-200 ${isPlaceholderData ? "opacity-40 pointer-events-none" : "opacity-100"}`}
        >
          <div className="flex flex-col gap-3">
            {data?.data.map((user) => {
              const initials = getInitials(user.name);
              const avatarBg = getAvatarBg(user.name);

              const statusColors = {
                Active:
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                Inactive: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
                Suspended: "bg-red-500/10 text-red-400 border-red-500/20",
              };

              return (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl transition-all hover:bg-zinc-950 hover:border-zinc-700"
                >
                  <div className="flex items-center gap-4 text-left">
                    {/* Dynamic Initials Avatar */}
                    <div
                      className={`w-11 h-11 rounded-full bg-linear-to-tr ${avatarBg} flex items-center justify-center text-white text-sm font-bold shadow-md shadow-black/40 shrink-0`}
                    >
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">
                        {user.name}
                      </h4>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                    {/* Role & Department */}
                    <div className="text-left sm:text-right min-w-[140px]">
                      <p className="text-xs font-semibold text-zinc-300">
                        {user.role}
                      </p>
                      <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-violet-400 mt-0.5">
                        {user.department}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusColors[user.status] || statusColors.Active}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-400 animate-pulse" : user.status === "Suspended" ? "bg-red-400" : "bg-zinc-400"}`}
                        />
                        {user.status}
                      </span>
                    </div>

                    {/* Date Joined */}
                    <div className="hidden md:block text-right min-w-[80px]">
                      <span className="text-[10px] text-zinc-600 block uppercase font-bold tracking-wider">
                        Joined
                      </span>
                      <span className="text-xs text-zinc-400 font-mono mt-0.5">
                        {user.createdAt}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {data?.data.length === 0 && (
              <div className="text-center py-12 text-zinc-600 text-sm font-medium">
                No employees found in directory.
              </div>
            )}
          </div>
        </div>

        {/* Footer controls & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-zinc-800">
          <button
            onClick={() => refetch()}
            className="self-start sm:self-center px-4 py-2 border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2"
          >
            🔄 Force Sync Cache
          </button>

          <Pagination
            page={page}
            pages={data?.pages}
            setPage={setPage}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            isPlaceholderData={isPlaceholderData}
          />
        </div>
      </section>

      {/* Add User Panel Form */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 hover:border-zinc-700">
        <div className="mb-6 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Action Center
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">
            Onboard New Employee
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Add details below to instantly seed the backend database and query
            cache.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name-input"
                className="text-xs text-zinc-400 font-semibold"
              >
                Full Name
              </label>
              <input
                id="name-input"
                type="text"
                required
                placeholder="e.g. Katherine Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:outline-none text-zinc-200 text-sm placeholder:text-zinc-700 transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email-input"
                className="text-xs text-zinc-400 font-semibold"
              >
                Corporate Email
              </label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="e.g. k.johnson@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:outline-none text-zinc-200 text-sm placeholder:text-zinc-700 transition-colors"
              />
            </div>

            {/* Job Title */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="role-input"
                className="text-xs text-zinc-400 font-semibold"
              >
                Job Title
              </label>
              <input
                id="role-input"
                type="text"
                required
                placeholder="e.g. Senior Security Analyst"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:outline-none text-zinc-200 text-sm placeholder:text-zinc-700 transition-colors"
              />
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dept-select"
                className="text-xs text-zinc-400 font-semibold"
              >
                Department
              </label>
              <select
                id="dept-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:outline-none text-zinc-300 text-sm transition-colors cursor-pointer"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Security">Security</option>
                <option value="People">People</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            {/* Account Status */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="status-select"
                className="text-xs text-zinc-400 font-semibold"
              >
                Account Status
              </label>
              <select
                id="status-select"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "Active" | "Inactive" | "Suspended",
                  )
                }
                className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-emerald-500 focus:outline-none text-zinc-300 text-sm transition-colors cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-zinc-700 disabled:cursor-not-allowed text-white rounded-xl active:scale-[0.99] transition-all font-semibold shadow-lg shadow-emerald-600/10 cursor-pointer text-sm flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Adding Member...
              </>
            ) : (
              "Add Member to Directory"
            )}
          </button>
        </form>
      </section>
    </div>
  );
};

export default UserList;

interface PaginationProps {
  page: number;
  pages?: number;
  setPage: Dispatch<SetStateAction<number>>;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isPlaceholderData: boolean;
}

function Pagination({
  page,
  pages,
  setPage,
  hasNextPage,
  hasPreviousPage,
  isPlaceholderData,
}: PaginationProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        disabled={!hasPreviousPage || isPlaceholderData}
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        className="px-3.5 py-2 border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        <span>←</span> Previous
      </button>

      <span className="text-xs text-zinc-400 font-medium font-mono min-w-[70px] text-center">
        Page {page} of {pages || 1}
      </span>

      <button
        disabled={!hasNextPage || isPlaceholderData}
        onClick={() => setPage((p) => p + 1)}
        className="px-3.5 py-2 border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-zinc-800 text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
      >
        Next <span>→</span>
      </button>
    </div>
  );
}
