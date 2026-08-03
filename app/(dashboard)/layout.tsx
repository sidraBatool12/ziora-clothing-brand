import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PromoBar, SiteNav, SiteFooter } from "@/components/storefront-ui";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/dashboard", label: "Profile" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/wishlist", label: "Wishlist" },
  { href: "/dashboard/addresses", label: "Addresses" },
  { href: "/dashboard/notifications", label: "Notifications" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <PromoBar />
      <SiteNav />
      <div className="page-shell py-10 md:py-14">
        <div className="mb-10 flex flex-col gap-6 border-b border-onyx/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">My Account</p>
            <h1 className="mt-2 text-3xl tracking-tight text-onyx">{user.name}</h1>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-onyx/50">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors hover:text-rose">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {children}
      </div>
      <SiteFooter />
    </>
  );
}
