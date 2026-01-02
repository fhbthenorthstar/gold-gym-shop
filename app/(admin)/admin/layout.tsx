"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Providers } from "@/components/providers/Providers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { projectId } from "@/sanity/env";

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Package,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
];

function StudioAuthGate({ children }: { children: React.ReactNode }) {
  const [hasStudioToken, setHasStudioToken] = useState<boolean | null>(null);

  const checkStudioToken = () => {
    try {
      const storageKey = `__studio_auth_token_${projectId}`;
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setHasStudioToken(false);
        return;
      }
      const parsed = JSON.parse(raw) as { token?: string } | null;
      setHasStudioToken(Boolean(parsed?.token));
    } catch {
      setHasStudioToken(false);
    }
  };

  useEffect(() => {
    checkStudioToken();
  }, []);

  if (hasStudioToken === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Checking admin session...
        </div>
      </div>
    );
  }

  if (!hasStudioToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Studio sign-in required
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Open Studio in a new tab, sign in, then come back here.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <a
              href="/studio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Open Studio
            </a>
            <button
              type="button"
              onClick={checkStudioToken}
              className="inline-flex items-center justify-center rounded-md border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              I'm signed in
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            If you just signed in, click “I’m signed in” to continue.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <StudioAuthGate>
      <Providers>
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
          {/* Mobile Header */}
          <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                <span className="text-sm font-bold text-white dark:text-zinc-900">
                  A
                </span>
              </div>
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Admin
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={cn(
              "fixed left-0 top-0 z-50 h-screen w-64 border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900",
              // Mobile: slide in/out
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
              // Desktop: always visible
              "lg:translate-x-0",
            )}
          >
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 items-center border-b border-zinc-200 px-6 dark:border-zinc-800">
                <Link
                  href="/admin"
                  className="flex items-center gap-2"
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                    <span className="text-sm font-bold text-white dark:text-zinc-900">
                      A
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Admin
                  </span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="space-y-3 border-t border-zinc-200 px-3 py-4 dark:border-zinc-800">
                <Link
                  href="/studio"
                  target="_blank"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  Open Studio
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-3 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  ← Back to Store
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 pt-14 lg:ml-64 lg:pt-0">
            <div className="p-4 lg:p-8">{children}</div>
          </main>
        </div>
      </Providers>
    </StudioAuthGate>
  );
}

export default AdminLayout;
