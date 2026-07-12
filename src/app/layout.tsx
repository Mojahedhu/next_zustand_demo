import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/store-provider";
import QueryProvider from "@/components/query-provider";
import Link from "next/link"; // Import Link for fast client-side transitions

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zustand & TanStack Sandbox",
  description: "Advanced client and server-state sandbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ⚡ SIMULATE SERVER FETCH
  const mockServerFetchedUser = "Mojahed Mohammed Hussien";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100 font-sans">
        <StoreProvider initialState={{ username: mockServerFetchedUser }}>
          <QueryProvider>
            {/* Enterprise Header Navigation */}
            <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
              <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                <span className="text-base font-bold bg-linear-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  <Link href="/">Server-State Sandbox</Link>
                </span>

                <nav className="flex items-center gap-6">
                  <Link
                    href="/slices"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    Directory & Slices
                  </Link>
                  <Link
                    href="/users"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 transition-colors"
                  >
                    Users (Directory)
                  </Link>
                  <Link
                    href="/todos"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 transition-colors border-l border-zinc-800 pl-6"
                  >
                    Todo Dashboard
                  </Link>
                  <Link
                    href="/products"
                    className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 transition-colors border-l border-zinc-800 pl-6"
                  >
                    Infinite Catalog
                  </Link>
                </nav>
              </div>
            </header>

            {/* Page Content */}
            <div className="flex-1 flex flex-col">{children}</div>
          </QueryProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
