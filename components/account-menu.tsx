"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  CaretDown,
  ChartLine,
  Gear,
  Heart,
  MapPin,
  Package,
  ShieldCheck,
  SignOut,
  SquaresFour,
  Storefront,
  User,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

type MenuItem = { href: string; label: string; icon: Icon };

const CUSTOMER_ITEMS: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
  { href: "/dashboard/orders", label: "My Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/settings", label: "Settings", icon: Gear },
];

const ADMIN_ITEMS: MenuItem[] = [
  { href: "/admin", label: "Admin Dashboard", icon: SquaresFour },
  { href: "/admin/clothing", label: "Clothing", icon: Storefront },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/analytics", label: "Analytics", icon: ChartLine },
  { href: "/admin/profile", label: "My Profile", icon: User },
  { href: "/admin/settings", label: "Settings", icon: Gear },
];

export function AccountMenu({
  name,
  email,
  image,
  isAdmin,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const items = isAdmin ? ADMIN_ITEMS : CUSTOMER_ITEMS;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "group flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 transition-all duration-300",
          "hover:bg-onyx/[0.04]",
          open && "bg-onyx/[0.06]"
        )}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className={cn(
            "rounded-full ring-2 transition-all duration-300",
            open ? "ring-rose" : "ring-transparent group-hover:ring-rose/30"
          )}
        >
          <UserAvatar name={name} image={image} size={34} ring={false} />
        </span>
        <CaretDown
          size={12}
          weight="bold"
          className={cn(
            "text-onyx/40 transition-transform duration-300",
            open && "rotate-180 text-onyx/70"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[17rem] origin-top-right overflow-hidden rounded-2xl border border-onyx/10 bg-white shadow-[0_18px_50px_-12px_rgba(20,20,20,0.28)]"
          >
            <div className="flex items-center gap-3 border-b border-onyx/[0.07] bg-ivory/70 px-4 py-3.5">
              <UserAvatar name={name} image={image} size={42} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-onyx">{name || "ZIORA Member"}</p>
                <p className="truncate text-[11px] text-onyx/50">{email}</p>
              </div>
            </div>

            {isAdmin && (
              <div className="border-b border-onyx/[0.07] px-4 py-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-rose">
                  <ShieldCheck size={11} weight="fill" />
                  Administrator
                </span>
              </div>
            )}

            <nav className="p-1.5">
              {items.map(({ href, label, icon: ItemIcon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-onyx/80 transition-colors hover:bg-ivory hover:text-onyx"
                >
                  <ItemIcon size={17} weight="light" className="text-onyx/45" />
                  {label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-onyx/[0.07] p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose transition-colors hover:bg-rose/[0.07]"
              >
                <SignOut size={17} weight="light" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
