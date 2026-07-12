/* eslint-disable react-hooks/refs */
"use client";

import { useHasHydrated } from "@/hooks/use-has-hydrated";
import AuthenticationCard from "./authentication-card";
import ShoppingCart from "./shoppingCard";
import { useRef } from "react";

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
    </main>
  );
}
