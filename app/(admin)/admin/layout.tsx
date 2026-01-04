"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  MessageSquare,
  Activity,
  Calendar,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { Providers } from "@/components/providers/Providers";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const adminPinFallback = "1111";
const adminPinValue =
  (process.env.NEXT_PUBLIC_ADMIN_PIN || adminPinFallback).trim() ||
  adminPinFallback;
const adminPinLength = adminPinValue.length;
const adminPinStorageKey = "ggs-admin-pin-auth";

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
    label: "Packages",
    href: "/admin/packages",
    icon: Tags,
  },
  {
    label: "Trainings",
    href: "/admin/trainings",
    icon: Activity,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: Calendar,
  },
  {
    label: "Inquiries",
    href: "/admin/contact",
    icon: MessageSquare,
  },
];

function AdminPinGate({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: adminPinLength }, () => ""),
  );
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    try {
      setIsAuthed(localStorage.getItem(adminPinStorageKey) === "1");
    } catch {
      setIsAuthed(false);
    }
  }, []);

  const resetDigits = (keepError = false) => {
    setDigits(Array.from({ length: adminPinLength }, () => ""));
    if (!keepError) {
      setError(null);
    }
    inputRefs.current[0]?.focus();
  };

  const handleSuccess = () => {
    try {
      localStorage.setItem(adminPinStorageKey, "1");
    } catch {
      // Ignore storage errors; still unlock in-memory for this session.
    }
    setIsAuthed(true);
  };

  const verifyPin = (pin: string) => {
    if (pin === adminPinValue) {
      handleSuccess();
    } else {
      setError("Incorrect PIN. Try again.");
      resetDigits(true);
    }
  };

  const handleChange = (index: number, value: string) => {
    setError(null);
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    const next = [...digits];
    if (clean.length === 1) {
      next[index] = clean;
      setDigits(next);
      inputRefs.current[index + 1]?.focus();
      return;
    }

    const chunk = clean.slice(0, adminPinLength - index);
    chunk.split("").forEach((char, offset) => {
      next[index + offset] = char;
    });
    setDigits(next);
    const nextIndex = Math.min(index + chunk.length, adminPinLength - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Backspace") return;
    if (digits[index]) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>,
  ) => {
    setError(null);
    const pasted = event.clipboardData.getData("text");
    const clean = pasted.replace(/\D/g, "").slice(0, adminPinLength - index);
    if (!clean) return;
    event.preventDefault();
    const next = [...digits];
    clean.split("").forEach((char, offset) => {
      next[index + offset] = char;
    });
    setDigits(next);
    const nextIndex = Math.min(index + clean.length, adminPinLength - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  useEffect(() => {
    if (!digits.every((digit) => digit.length === 1)) return;
    verifyPin(digits.join(""));
  }, [digits]);

  if (isAuthed === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="rounded-xl border border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          Checking access...
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Enter Admin PIN
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Enter the {adminPinLength}-digit code to access admin tools.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            {digits.map((digit, index) => (
              <input
                key={`admin-pin-${index}`}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => handlePaste(index, event)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                aria-label={`PIN digit ${index + 1}`}
                className="h-12 w-12 rounded-lg border border-zinc-300 bg-white text-center text-xl font-semibold text-zinc-900 outline-none ring-0 transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-zinc-100 dark:focus:ring-zinc-800"
              />
            ))}
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-center">
            <Button type="button" variant="outline" onClick={() => resetDigits()}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleLogout = () => {
    try {
      localStorage.removeItem(adminPinStorageKey);
    } catch {
      // Ignore storage errors.
    }
    window.location.reload();
  };

  return (
    <AdminPinGate>
      <Providers>
        <div className="dark">
          <div className="flex min-h-screen bg-zinc-50 text-zinc-100 dark:bg-zinc-950">
          {/* Mobile Header */}
          <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 lg:hidden">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
                <Image
                  src="/goldgymshop.png"
                  alt="Gold Gym Shop"
                  fill
                  sizes="32px"
                  className="object-contain p-1"
                />
              </div>
              <span className="font-heading text-xl uppercase tracking-[0.2em] text-white">
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
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-white ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
                    <Image
                      src="/goldgymshop.png"
                      alt="Gold Gym Shop"
                      fill
                      sizes="32px"
                      className="object-contain p-1"
                    />
                  </div>
                  <span className="font-heading text-xl uppercase tracking-[0.2em] text-white">
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
                          ? "bg-primary/15 text-primary"
                          : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white",
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
                  className="flex items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  Open GGS Studio
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <Link
                  href="/"
                  onClick={() => setSidebarOpen(false)}
                  className="block px-3 text-sm text-zinc-400 hover:text-white"
                >
                  ← Back to Store
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 px-3 text-sm text-zinc-400 transition hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 pt-14 lg:ml-64 lg:pt-0">
            <div className="p-4 lg:p-8">{children}</div>
          </main>
        </div>
        </div>
      </Providers>
    </AdminPinGate>
  );
}

export default AdminLayout;
