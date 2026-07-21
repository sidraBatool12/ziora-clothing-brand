import Link from "next/link";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:px-12">
      <div className="mb-8 flex items-center justify-between border-b border-onyx/10 pb-6">
        <div><p className="eyebrow">My Account</p><h1 className="text-2xl text-onyx">{user.name}</h1></div>
        <nav className="flex gap-6 text-xs uppercase tracking-widest text-onyx/60">
          <Link href="/dashboard" className="hover:text-gold">Profile</Link>
          <Link href="/dashboard/orders" className="hover:text-gold">Orders</Link>
          <Link href="/dashboard/wishlist" className="hover:text-gold">Wishlist</Link>
          <Link href="/dashboard/addresses" className="hover:text-gold">Addresses</Link>
          <Link href="/dashboard/notifications" className="hover:text-gold">Notifications</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
