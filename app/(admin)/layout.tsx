import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Payments", href: "/admin/payments" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="w-56 shrink-0 bg-onyx text-white/90">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-lg tracking-widest">ZIORA</p>
          <p className="mt-1 text-xs text-white/50">Admin Panel</p>
        </div>
        <nav className="px-3 py-4">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-6 py-4 text-xs text-white/40">{user.email}</div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
