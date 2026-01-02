"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="space-y-4">
            <Image
              src="https://dt-fitfinity.myshopify.com/cdn/shop/files/new-logo_1.png?v=1701161823"
              alt="Fitfinity"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
            <p className="text-sm text-zinc-400">
              Fitfinity delivers premium gym wear, supplements, and equipment for
              athletes, trainers, and fitness enthusiasts.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm text-white">Information</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/contact" className="hover:text-lime-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-lime-300">
                  Order Status
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping" className="hover:text-lime-300">
                  Delivery Choice
                </Link>
              </li>
              <li>
                <Link href="/pages/returns" className="hover:text-lime-300">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm text-white">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-lime-300" />
                No: 58 A, East Madison Street, Baltimore, MD, USA
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-lime-300" />
                (000) 123 - 456789
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-lime-300" />
                info@example.com
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm text-white">Subscribe Us</h3>
            <p className="mt-4 text-sm text-zinc-400">
              Subscribe us to get latest news & useful tips.
            </p>
            <form className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="h-10 flex-1 rounded-full border border-zinc-800 bg-black px-4 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-lime-300"
              />
              <Button className="h-10 rounded-full bg-lime-300 px-4 text-xs font-semibold text-black hover:bg-lime-200">
                Sign Up
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-xs text-zinc-500">
          © 2026 Fitfinity. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
