/* eslint-disable react-hooks/refs */
"uce client";

import { useHasHydrated } from "@/hooks/useHasHydrated";
import { useAppStore } from "@/store/store-provider";
import { useRef } from "react";

// Sibling Component B: Shopping Cart (subscribes only to Cart slice + username check)
export default function ShoppingCart() {
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
