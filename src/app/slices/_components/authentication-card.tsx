"use client";
/* eslint-disable react-hooks/refs */
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { useAppStore } from "@/store/store-provider";
import { useRef, useState } from "react";

// Sibling Component A: Authentication Card (subscribes only to Auth slice)
export default function AuthenticationCard() {
  const hasHydrated = useHasHydrated();

  // Select state and actions directly inside the component
  const username = useAppStore((state) => state.username);
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);

  const authRenderCount = useRef(0);

  authRenderCount.current++;

  const [inputName, setInputName] = useState("");

  const handleLoginSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (inputName.trim()) {
        login(inputName.trim());
        setInputName("");
      }
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  return (
    <section className="flex flex-col p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl transition-all duration-300 hover:border-zinc-700">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
            Slice A
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">User Profile</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs text-violet-300 font-medium font-mono">
            Renders: {hasHydrated ? authRenderCount.current : "Loading..."}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[160px]">
        {username ? (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center gap-4 p-4 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-linear-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-violet-500/20">
                {username[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">
                  Logged in as
                </p>
                <h3 className="text-lg font-bold text-zinc-100">{username}</h3>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-3 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl hover:bg-zinc-700 active:scale-[0.98] transition-all font-semibold cursor-pointer"
            >
              Log Out
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleLoginSubmit}
            className="flex flex-col gap-3 animate-fade-in"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="username"
                className="text-xs text-zinc-400 font-medium"
              >
                Enter username to begin
              </label>
              <input
                id="username"
                type="text"
                placeholder="e.g. John Doe"
                value={inputName}
                onChange={async (e) => {
                  setInputName(e.target.value);
                }}
                className="px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl focus:border-violet-500 focus:outline-none text-zinc-200 text-sm placeholder:text-zinc-600 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-500 active:scale-[0.98] transition-all font-semibold shadow-lg shadow-violet-600/20 cursor-pointer"
            >
              Log In
            </button>
          </form>
        )}
      </div>

      <p className="text-[11px] text-zinc-500 mt-6 leading-relaxed">
        Subscribes to{" "}
        <code className="bg-zinc-950 px-1 py-0.5 rounded text-zinc-400">
          username
        </code>
        . This card only re-renders on login/logout.
      </p>
    </section>
  );
}
