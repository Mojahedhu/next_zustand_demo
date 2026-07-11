"use client";

import TodoDashboard from "@/components/todoDashboard";

export default function TodosPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-start py-12 px-4 sm:px-6">
      <div className="max-w-5xl w-full flex flex-col gap-6 text-center sm:text-left">
        {/* Header Indicator */}
        <div className="inline-flex self-center sm:self-start items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-400">
          <span>Module 2 Milestone</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span>Mutations & Cache Rollback Sandbox</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight mt-2">
          Milestone: Optimistic Updates
        </h1>
        <p className="text-zinc-400 max-w-2xl text-sm sm:text-base leading-relaxed">
          This dashboard shows how we can modify server state and reflect
          changes in the client cache instantly. Use the Error Simulator above
          to verify that failures rollback the cache cleanly.
        </p>
      </div>

      <div className="w-full mt-8">
        <TodoDashboard />
      </div>
    </main>
  );
}
