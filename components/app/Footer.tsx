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
            <div className="flex items-center gap-3">
              <Image
                src="/Gold's_Gym_logo.png"
                alt="Gold's Gym BD"
                width={44}
                height={44}
                className="h-11 w-11 rounded-full"
              />
              <span className="font-heading text-3xl uppercase tracking-[0.32em] text-white lg:text-4xl">
                SHOP
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Gold's Gym BD delivers premium apparel, supplements, and training gear
              built for athletes across Bangladesh.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-sm text-white">Information</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-primary">
                  Order Status
                </Link>
              </li>
              <li>
                <Link href="/pages/shipping" className="hover:text-primary">
                  Delivery Choice
                </Link>
              </li>
              <li>
                <Link href="/pages/returns" className="hover:text-primary">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm text-white">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +880 1704 112385
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                info@goldsgym.com.bd
              </li>
               <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Bashundhara Shopping Mall, Level 8
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Bashundhara Residential Area, Block N
              </li>
             
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm text-white">Follow Us</h3>
            <p className="mt-4 text-sm text-zinc-400">
              Stay connected with Gold's Gym Bangladesh on social media.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.facebook.com/"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-black text-zinc-300 transition hover:border-primary/60 hover:text-primary"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.instagram.com/goldsgymbangladesh/"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-black text-zinc-300 transition hover:border-primary/60 hover:text-primary"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.youtube.com/@GoldsGymBangladesh"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-black text-zinc-300 transition hover:border-primary/60 hover:text-primary"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-zinc-800 pt-3 text-center text-xs text-zinc-500">
          ©2026 Gold's Gym Bangladesh || Master Franchise by{" "}
          <a className="text-primary" href="https://www.bashundharagroup.com/" target="_blank">
            Bashundhara Group
          </a>{" "}
          || Made with ❣️☘️ by{" "}
          <a className="text-primary" href="https://fhbthenorthstar.github.io/" target="_blank">
            TheGreatFHB.
          </a>
        </div>
      </div>
    </footer>
  );
}
