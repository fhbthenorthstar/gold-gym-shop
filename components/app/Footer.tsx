"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, MapPin, Phone, Mail, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-12">
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
            <h3 className="font-heading text-sm text-white">Follow Us</h3>
            <p className="mt-4 text-sm text-zinc-400">
              Stay connected with Gold’s Gym Bangladesh on social media.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.facebook.com/"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-black text-zinc-300 transition hover:border-lime-300/60 hover:text-lime-300"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/goldsgymbangladesh/"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-black text-zinc-300 transition hover:border-lime-300/60 hover:text-lime-300"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@GoldsGymBangladesh"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-black text-zinc-300 transition hover:border-lime-300/60 hover:text-lime-300"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-4 text-center text-xs text-zinc-500">
          © 2026 Fitfinity. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
