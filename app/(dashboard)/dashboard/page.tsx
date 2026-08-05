import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { Wishlist } from "@/models/misc";
import { formatPrice } from "@/lib/utils";

export default async function CustomerDashboardPage() {
  const user = await requireUser();
  await connectDB();

  const [orderCount, recentOrders, wishlist] = await Promise.all([
    Order.countDocuments({ user: user._id }),
    Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(3).lean(),
    Wishlist.findOne({ user: user._id }).lean(),
  ]);

  return (
    <div className="space-y-10">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="border border-onyx/10 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Orders</p>
          <p className="mt-2 text-3xl text-onyx">{orderCount}</p>
        </div>
        <div className="border border-onyx/10 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Wishlist</p>
          <p className="mt-2 text-3xl text-onyx">{wishlist?.products?.length || 0}</p>
        </div>
        <div className="border border-onyx/10 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Addresses</p>
          <p className="mt-2 text-3xl text-onyx">{user.addresses?.length || 0}</p>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-onyx">Recent activity</h2>
          <Link href="/dashboard/orders" className="text-[11px] uppercase tracking-[0.16em] text-gold underline">
            Orders
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-onyx/55">No recent orders. <Link href="/shop" className="underline">Start shopping</Link></p>
        ) : (
          <ul className="divide-y divide-onyx/10 border border-onyx/10 bg-white">
            {recentOrders.map((order) => (
              <li key={String(order._id)} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{order.orderNumber}</span>
                <span>{formatPrice(order.totalAmount)}</span>
                <span className="uppercase tracking-wider text-xs text-onyx/50">{order.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
