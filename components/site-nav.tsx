"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import {
  BagSimple,
  Bell,
  Heart,
  MagnifyingGlass,
  User,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "@/store";
import { cn } from "@/lib/utils";
import { AccountMenu } from "@/components/account-menu";
import { NavBrandLogo } from "@/components/nav-brand-logo";
import { UserAvatar } from "@/components/user-avatar";
import { useGoogleProvider } from "@/hooks/use-google-provider";

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
  const { data: session, status } = useSession();
  const googleEnabled = useGoogleProvider();
  const currentUser = session?.user;
  const isAdmin = currentUser?.role === "admin";
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
        <nav className="page-shell flex h-[4.25rem] items-center justify-between md:h-[4.75rem]">
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

          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
            <NavBrandLogo priority />
          </div>

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
            {status === "authenticated" && currentUser ? (
              <>
                {!isAdmin && (
                  <>
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
                  </>
                )}
                <Link
                  href={isAdmin ? "/admin" : "/dashboard/notifications"}
                  className="flex h-10 w-10 items-center justify-center text-onyx/70 transition-colors hover:text-onyx"
                  aria-label="Notifications"
                >
                  <Bell size={20} weight="light" />
                </Link>
                <AccountMenu
                  name={currentUser.name}
                  email={currentUser.email}
                  image={currentUser.image}
                  isAdmin={isAdmin}
                />
              </>
            ) : status === "unauthenticated" ? (
              <>
                <Link href="/login" className="hidden text-[10px] uppercase tracking-[0.15em] text-onyx/70 lg:block">Login</Link>
                <Link href="/signup" className="hidden text-[10px] uppercase tracking-[0.15em] text-onyx/70 lg:block">Register</Link>
                {googleEnabled && (
                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="hidden rounded-full border border-onyx/15 px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-onyx/70 xl:block"
                  >
                    Continue with Google
                  </button>
                )}
                <Link
                  href="/login"
                  className="flex h-10 w-10 items-center justify-center text-onyx/70 transition-colors hover:text-onyx lg:hidden"
                  aria-label="Login"
                >
                  <User size={20} weight="light" />
                </Link>
              </>
            ) : (
              <span className="h-8 w-8 animate-pulse rounded-full bg-onyx/10" aria-hidden />
            )}
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
                <NavBrandLogo />
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
              {currentUser && (
                <Link
                  href={isAdmin ? "/admin/profile" : "/dashboard/profile"}
                  className="mt-8 flex items-center gap-3 rounded-2xl border border-onyx/10 bg-white px-4 py-3.5"
                >
                  <UserAvatar name={currentUser.name} image={currentUser.image} size={44} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-onyx">
                      {currentUser.name || "ZIORA Member"}
                    </span>
                    <span className="block truncate text-[11px] text-onyx/50">{currentUser.email}</span>
                  </span>
                  {isAdmin && (
                    <span className="rounded-full bg-rose/10 px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-rose">
                      Admin
                    </span>
                  )}
                </Link>
              )}

              <div className={cn("flex gap-3", currentUser ? "mt-3" : "mt-8")}>
                <Link href={currentUser ? (isAdmin ? "/admin" : "/dashboard") : "/login"} className="btn-primary flex-1">
                  {currentUser ? "Dashboard" : "Login"}
                </Link>
                <Link href="/cart" className="btn-secondary flex-1">
                  Cart{mounted && itemCount > 0 ? ` (${itemCount})` : ""}
                </Link>
              </div>
              {!currentUser && (
                <div className={cn("mt-3 grid gap-3", googleEnabled ? "grid-cols-2" : "grid-cols-1")}>
                  <Link href="/signup" className="btn-secondary">Register</Link>
                  {googleEnabled && (
                    <button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="btn-secondary">
                      Google
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
