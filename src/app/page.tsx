/* eslint-disable react-hooks/refs */
"use client";

import UserList from "@/components/userList";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { useAppStore } from "@/store/store-provider";

import { useState, useRef } from "react";

// Sibling Component A: Authentication Card (subscribes only to Auth slice)
function AuthenticationCard() {
  const hasHydrated = useHasHydrated();

  // Select state and actions directly inside the component
  const username = useAppStore((state) => state.username);
  const login = useAppStore((state) => state.login);
  const logout = useAppStore((state) => state.logout);

  const authRenderCount = useRef(0);
  authRenderCount.current++;

  const [inputName, setInputName] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

// Sibling Component B: Shopping Cart (subscribes only to Cart slice + username check)
function ShoppingCart() {
  const hasHydrated = useHasHydrated();

  // Select state and actions directly inside the component
  const username = useAppStore((state) => state.username);
  const items = useAppStore((state) => state.items);
  const addItem = useAppStore((state) => state.addItem);
  const clearCart = useAppStore((state) => state.clearCart);

  const cartRenderCount = useRef(0);
  cartRenderCount.current++;

  const mockProducts = [
    { id: "kb", name: "⌨️ Mechanical Keyboard" },
    { id: "ms", name: "🖱️ Wireless Mouse" },
    { id: "mon", name: "🖥️ UltraWide Monitor" },
  ];

  return (
    <section className="flex flex-col p-8 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl transition-all duration-300 hover:border-zinc-700">
      <div className="flex justify-between items-start mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Slice B
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">Shopping Cart</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-300 font-medium font-mono">
            Renders: {hasHydrated ? cartRenderCount.current : "Loading..."}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[160px]">
        {!username ? (
          <div className="text-center p-6 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg">
              🔒
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-300">
                Cart is locked
              </h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto">
                Please log in using the profile card to unlock shopping actions.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Cart Items List */}
            <div className="flex-1 max-h-[140px] overflow-y-auto pr-1">
              {items.length === 0 ? (
                <div className="text-center py-6 text-zinc-600 text-xs font-medium">
                  Your cart is empty. Click below to add some tools!
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 font-mono"
                    >
                      <span>{item}</span>
                      <span className="text-[10px] text-zinc-500">qty: 1</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add Product Controls */}
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-2">
                {mockProducts.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => addItem(prod.name)}
                    className="py-2.5 px-2 bg-zinc-800 text-[11px] border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:text-white transition-all font-semibold active:scale-95 cursor-pointer truncate"
                    title={prod.name}
                  >
                    {prod.name.split(" ")[0]} Add
                  </button>
                ))}
              </div>
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs rounded-xl transition-all cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-zinc-500 mt-6 leading-relaxed">
        Subscribes to{" "}
        <code className="bg-zinc-950 px-1 py-0.5 rounded text-zinc-400">
          items
        </code>
        . Notice that adding items here{" "}
        <strong className="text-emerald-400">does not re-render</strong> the
        User Profile!
      </p>
    </section>
  );
}

// Shell/Container Component (Static layout, never re-renders after mount)
export default function Home() {
  const hasHydrated = useHasHydrated();
  const shellRenderCount = useRef(0);
  shellRenderCount.current++;

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center p-6 sm:p-24 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      <div className="max-w-5xl w-full flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <div className="inline-flex self-center sm:self-start items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
            <span>Module 3</span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>Slicing & Scaling (Render Isolation)</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Enterprise Slice Sandbox
            </h1>
            <div className="inline-flex self-center sm:self-start items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <span className="text-xs text-zinc-400 font-mono">
                Shell Renders:{" "}
                {hasHydrated ? shellRenderCount.current : "Loading..."}
              </span>
            </div>
          </div>
          <p className="text-zinc-400 max-w-2xl text-base sm:text-lg leading-relaxed">
            We have refactored the selectors directly into{" "}
            <code className="text-violet-400 font-mono">
              AuthenticationCard
            </code>{" "}
            and <code className="text-emerald-400 font-mono">ShoppingCart</code>
            . Updates inside a slice now isolate renders completely to its
            respective component.
          </p>
        </div>

        {/* Dashboard Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AuthenticationCard />
          <ShoppingCart />
        </div>

        {/* Technical Explainer */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            How Render Isolation works here:
          </h3>
          <ul className="list-disc list-inside text-zinc-400 space-y-2.5 text-sm leading-relaxed">
            <li>
              When you add an item to the cart, the cart slice updates. Only the{" "}
              <code className="text-emerald-400 font-mono">ShoppingCart</code>{" "}
              component re-renders. The{" "}
              <code className="text-violet-400 font-mono">
                AuthenticationCard
              </code>{" "}
              and the parent{" "}
              <code className="text-zinc-400 font-mono">Home</code> shell remain
              completely unaffected.
            </li>
            <li>
              When you log out, it triggers a cross-slice update that wipes the
              cart. Because{" "}
              <code className="text-zinc-300 font-mono">username</code> and{" "}
              <code className="text-zinc-300 font-mono">items</code> both
              change, both sub-components re-render, showing state coordination
              without parent component overhead.
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full mt-6 flex justify-center">
        <UserList />
      </div>
    </main>
  );
}
