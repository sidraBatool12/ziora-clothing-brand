"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BagSimple,
  Heart,
  MagnifyingGlass,
  User,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/new-arrivals", label: "New Arrivals" },
  { href: "/categories", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function PromoBar() {
  return (
    <div className="relative overflow-hidden bg-onyx text-white">
      <div className="flex whitespace-nowrap py-2.5 text-[10px] uppercase tracking-[0.22em] animate-marquee">
        <span className="mx-8">Free shipping over PKR 10,000</span>
        <span className="mx-8 text-rose-light">New season edit is live</span>
        <span className="mx-8">EasyPaisa &amp; bank transfer accepted</span>
        <span className="mx-8">Grace Beyond Modesty</span>
        <span className="mx-8">Free shipping over PKR 10,000</span>
        <span className="mx-8 text-rose-light">New season edit is live</span>
        <span className="mx-8">EasyPaisa &amp; bank transfer accepted</span>
        <span className="mx-8">Grace Beyond Modesty</span>
      </div>
    </div>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500 ease-soft",
          scrolled
            ? "border-b border-onyx/10 bg-ivory/85 backdrop-blur-xl"
            : "border-b border-transparent bg-ivory/70 backdrop-blur-md"
        )}
      >
        <nav className="page-shell flex h-16 items-center justify-between md:h-[4.5rem]">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative h-4 w-5">
              <span
                className={cn(
                  "absolute left-0 top-0 h-[1.5px] w-full bg-onyx transition-all duration-500 ease-soft",
                  open && "top-1/2 -translate-y-1/2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-onyx transition-all duration-300",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-[1.5px] w-full bg-onyx transition-all duration-500 ease-soft",
                  open && "bottom-auto top-1/2 -translate-y-1/2 -rotate-45"
                )}
              />
            </span>
          </button>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-[1.35rem] font-semibold tracking-[0.28em] text-onyx md:static md:translate-x-0"
          >
            ZIORA
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] uppercase tracking-[0.18em] transition-colors duration-300",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-rose"
                    : "text-onyx/60 hover:text-onyx"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              href="/shop"
              className="hidden h-10 w-10 items-center justify-center text-onyx/70 transition-colors hover:text-onyx sm:flex"
              aria-label="Search products"
            >
              <MagnifyingGlass size={20} weight="light" />
            </Link>
            <Link
              href="/dashboard/wishlist"
              className="flex h-10 w-10 items-center justify-center text-onyx/70 transition-colors hover:text-onyx"
              aria-label="Wishlist"
            >
              <Heart size={20} weight="light" />
            </Link>
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center text-onyx/70 transition-colors hover:text-onyx"
              aria-label="Cart"
            >
              <BagSimple size={20} weight="light" />
              {mounted && itemCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[9px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center text-onyx/70 transition-colors hover:text-onyx"
              aria-label="Account"
            >
              <User size={20} weight="light" />
            </Link>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-onyx/50 backdrop-blur-2xl"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto bg-ivory px-6 pb-10 pt-6"
              initial={{ y: -24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="text-lg font-semibold tracking-[0.28em]">ZIORA</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-10 w-10 items-center justify-center"
                  aria-label="Close"
                >
                  <X size={22} weight="light" />
                </button>
              </div>
              <ul className="space-y-1">
                {LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, type: "spring", stiffness: 100, damping: 18 }}
                  >
                    <Link
                      href={link.href}
                      className="block border-b border-onyx/10 py-4 text-2xl tracking-tight text-onyx"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Link href="/login" className="btn-primary flex-1">
                  Account
                </Link>
                <Link href="/cart" className="btn-secondary flex-1">
                  Cart{mounted && itemCount > 0 ? ` (${itemCount})` : ""}
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
