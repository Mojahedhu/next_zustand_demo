import Link from "next/link";
import React from "react";

function Page() {
  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-center items-center p-6 sm:p-24 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      <div className="mx-auto max-w-xl w-full flex flex-col">
        <h1 className="text-2xl mb-6">
          Advanced client and server-state sandbox
        </h1>
        <div className="mt-2">
          <section className="leading-relaxed font-bold bg-linear-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent max-w-sm">
            <Link
              className="hover:text-zinc-100 transition-colors flex justify-between"
              href="/slices"
            >
              Directory & Slices
              <span>&rarr;</span>
            </Link>
            <br />
            <Link
              className="hover:text-zinc-100 transition-colors flex justify-between"
              href="/users"
            >
              Users (Directory)
              <span>&rarr;</span>
            </Link>
            <br />
            <Link
              className="hover:text-zinc-100 transition-colors flex justify-between"
              href="/todos"
            >
              Todos
              <span>&rarr;</span>
            </Link>
            <br />
            <Link
              className="hover:text-zinc-100 transition-colors flex justify-between"
              href="/products"
            >
              Products
              <span>&rarr;</span>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Page;
