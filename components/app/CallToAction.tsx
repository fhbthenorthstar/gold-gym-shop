"use client";

import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="mt-16 border-t border-zinc-800 bg-black py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-primary px-6 py-10 text-center text-black">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-primary">
            <Phone className="h-5 w-5" />
          </div>
          <h3 className="font-heading text-lg">Call Us Now</h3>
          <p className="text-sm">+880 1704 112385</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h4 className="font-heading text-sm text-white">Get a Training Call Back</h4>
          <p className="mt-2 text-xs text-zinc-400">
            Tell us what you want to achieve and our team will guide you to the
            right plan, gear, or membership.
          </p>
          <form className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Phone"
              className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="email"
              placeholder="Email"
              className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Training focus"
              className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Preferred time"
              className="h-10 rounded-md border border-zinc-800 bg-black px-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button className="h-10 rounded-md bg-primary text-xs font-semibold text-black hover:bg-primary/90">
              Request Callback
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
