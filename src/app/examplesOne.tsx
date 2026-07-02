"use client";

import { useCounterStore } from "@/store_01/counter-store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { useEffect, useState, useRef } from "react";

// Sibling Component 1: Only displays the count (Uses hydration guard)
function CountDisplay() {
  const count = useCounterStore((state) => state.count);
  const hasHydrated = useHasHydrated();

  // useEffect(() => {
  //   console.log("CountDisplay rendered");
  //   if (hasHydrated) {
  //     useCounterStore.persist.rehydrate();
  //   }
  // }, [hasHydrated]);

  // Safely track renders without causing hydration mismatch
  const renderCount = useRef(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  renderCount.current += 1;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl transition-all duration-300 hover:border-zinc-700">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
        Component A: State Consumer
      </span>

      <h2 className="text-6xl font-bold font-mono tracking-tight text-white my-4 select-none animate-fade-in">
        {count}
      </h2>
      {/* {hasHydrated ? (
        <h2 className="text-6xl font-bold font-mono tracking-tight text-white my-4 select-none animate-fade-in">
          {count}
        </h2>
      ) : (
        <div className="h-[88px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        </div>
      )} */}

      <div className="flex items-center gap-2 mt-4 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
        <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        <span className="text-xs text-violet-300 font-medium">
          Renders:{" "}
          <strong className="font-mono text-white">
            {hasHydrated ? renderCount.current : "Loading..."}
          </strong>
        </span>
      </div>
      <p className="text-xs text-zinc-400 mt-3 text-center max-w-[250px]">
        Subscribed to{" "}
        <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">
          state.count
        </code>
        . Re-renders whenever the counter changes.
      </p>
    </div>
  );
}

// Sibling Component 2: Only triggers actions (No state variable subscriptions)
function CountControls() {
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);
  const reset = useCounterStore((state) => state.reset);
  const hasHydrated = useHasHydrated();

  // Safely track renders without causing hydration mismatch
  const renderCount = useRef(0);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  renderCount.current += 1;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl transition-all duration-300 hover:border-zinc-700">
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-6">
        Component B: Action Dispatcher
      </span>
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mb-6">
        <button
          onClick={decrement}
          className="px-5 py-3 bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl hover:bg-zinc-700 active:scale-95 transition-all font-semibold font-mono cursor-pointer"
        >
          - Decrement
        </button>
        <button
          onClick={increment}
          className="px-5 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-500 active:scale-95 transition-all font-semibold font-mono shadow-lg shadow-violet-600/20 cursor-pointer"
        >
          + Increment
        </button>
        <button
          onClick={reset}
          className="px-5 py-3 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-xl hover:text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all font-medium cursor-pointer"
        >
          Reset
        </button>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-emerald-300 font-medium">
          Renders:{" "}
          <strong className="font-mono text-white">
            {hasHydrated ? renderCount.current : "Loading..."}
          </strong>
        </span>
      </div>
      <p className="text-xs text-zinc-400 mt-3 text-center max-w-[250px]">
        Subscribed to stable actions.{" "}
        <strong className="text-emerald-400">Never re-renders</strong> when
        count changes!
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center p-6 sm:p-24 font-sans">
      <div className="max-w-4xl w-full flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <div className="inline-flex self-center sm:self-start items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-semibold text-violet-400">
            <span>Module 2</span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span>The SSR Hydration Guard & Persistence</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Persisted Zustand Store
          </h1>
          <p className="text-zinc-400 max-w-xl text-base sm:text-lg leading-relaxed">
            The counter value below is now persisted in{" "}
            <code className="text-violet-400 font-mono">localStorage</code>.
            Refresh the page to see it retain its state without triggering
            hydration errors!
          </p>
        </div>

        {/* Demo Playground */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CountDisplay />
          <CountControls />
        </div>

        {/* Technical Explainer */}
        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            What changed in Module 2:
          </h3>
          <ul className="list-disc list-inside text-zinc-400 space-y-2 text-sm leading-relaxed">
            <li>
              We wrapped the store with{" "}
              <code className="text-violet-400 font-mono">persist</code>{" "}
              middleware to store state in local storage.
            </li>
            <li>
              We configured{" "}
              <code className="text-violet-400 font-mono">
                skipHydration: true
              </code>{" "}
              in the store options to prevent auto-hydrating during React's
              initial render.
            </li>
            <li>
              We manually call{" "}
              <code className="text-violet-400 font-mono">rehydrate()</code>{" "}
              inside the client-side{" "}
              <code className="text-violet-400 font-mono">useEffect</code> of
              our hydration guard, preventing hook-level mismatches.
            </li>
            <li>
              We refactored render tracking to be completely hydration-safe.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
