"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowSquareOut,
  Bell,
  CaretRight,
  ChartLineUp,
  Gear,
  List,
  Package,
  SignOut,
  Storefront,
  TShirt,
  Truck,
  UserList,
  X,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: Icon; exact?: boolean };

const NAVIGATION: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: ChartLineUp, exact: true },
  { href: "/admin/clothing", label: "Clothing", icon: TShirt },
  { href: "/admin/users", label: "Users", icon: UserList },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/tracking", label: "Order tracking", icon: Truck },
  { href: "/admin/contact", label: "Contact inbox", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Gear },
];

function AdminNavigation({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin navigation" className="space-y-1">
      {NAVIGATION.map(({ href, label, icon: ItemIcon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]",
              active
                ? "bg-white/[0.09] text-white"
                : "text-white/52 hover:bg-white/[0.05] hover:text-white/90"
            )}
          >
            <span
              className={cn(
                "absolute inset-y-2 left-0 w-0.5 rounded-full bg-rose transition-opacity",
                active ? "opacity-100" : "opacity-0"
              )}
            />
            <ItemIcon size={18} weight={active ? "fill" : "light"} />
            <span className="flex-1">{label}</span>
            <CaretRight
              size={12}
              className={cn(
                "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                active ? "translate-x-0 opacity-60" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-40"
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string; image?: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-[100dvh] bg-[#F3F1ED] font-sans text-onyx">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[17rem] flex-col bg-[#171716] text-white lg:flex">
        <div className="px-6 pb-5 pt-7">
          <Link href="/admin" className="inline-flex items-end gap-3">
            <span className="text-xl font-semibold tracking-[0.28em]">ZIORA</span>
            <span className="mb-0.5 rounded-full bg-rose/20 px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-[#D9A0A8]">
              Admin
            </span>
          </Link>
          <p className="mt-3 text-[11px] leading-relaxed text-white/35">
            Store operations and customer care
          </p>
        </div>

        <div className="mx-4 h-px bg-white/[0.07]" />
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <AdminNavigation pathname={pathname} />
        </div>

        <div className="m-3 rounded-2xl bg-white/[0.055] p-3 ring-1 ring-inset ring-white/[0.06]">
          <div className="flex items-center gap-3">
            <UserAvatar name={admin.name} image={admin.image} size={38} ring={false} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/90">{admin.name}</p>
              <p className="truncate text-[10px] text-white/35">{admin.email}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] px-2 py-2 text-[10px] text-white/55 transition-colors hover:text-white"
            >
              <Storefront size={14} weight="light" />
              Store
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] px-2 py-2 text-[10px] text-white/55 transition-colors hover:bg-rose/15 hover:text-[#D9A0A8]"
            >
              <SignOut size={14} weight="light" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[17rem]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-onyx/[0.07] bg-[#F3F1ED]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-9">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-inset ring-onyx/10 lg:hidden"
            aria-label="Open admin navigation"
          >
            <List size={19} weight="light" />
          </button>
          <div className="hidden lg:block">
            <p className="text-[10px] uppercase tracking-[0.2em] text-onyx/35">Administration</p>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] text-onyx/60 ring-1 ring-inset ring-onyx/10 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-onyx active:scale-[0.98] sm:flex"
            >
              View storefront
              <ArrowSquareOut size={14} weight="light" />
            </Link>
            <UserAvatar name={admin.name} image={admin.image} size={34} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close admin navigation"
              className="fixed inset-0 z-30 bg-onyx/45 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-40 flex w-[min(19rem,88vw)] flex-col bg-[#171716] p-4 text-white lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 220, damping: 26 }}
            >
              <div className="mb-6 flex items-center justify-between px-2 pt-2">
                <span className="text-lg font-semibold tracking-[0.25em]">ZIORA</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.07]"
                  aria-label="Close"
                >
                  <X size={18} weight="light" />
                </button>
              </div>
              <AdminNavigation pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <div className="mt-auto rounded-2xl bg-white/[0.055] p-3 ring-1 ring-inset ring-white/[0.06]">
                <div className="flex items-center gap-3">
                  <UserAvatar name={admin.name} image={admin.image} size={38} ring={false} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-white/90">{admin.name}</p>
                    <p className="truncate text-[10px] text-white/35">{admin.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/admin/login" })}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/[0.07] py-2.5 text-xs text-white/65"
                >
                  <SignOut size={15} />
                  Sign out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
