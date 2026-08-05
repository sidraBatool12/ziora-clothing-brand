import { requireUser } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile-editor";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await requireUser();
  await connectDB();
  const recentOrders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(5).lean();

  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-6 text-lg text-onyx">Profile</h2>
        <ProfileEditor />
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg text-onyx">Recent orders</h2>
          <Link href="/dashboard/orders" className="text-[11px] uppercase tracking-[0.16em] text-gold underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-onyx/55">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-onyx/10 border border-onyx/10 bg-white">
            {recentOrders.map((order) => (
              <li key={String(order._id)} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-onyx">{order.orderNumber}</p>
                  <p className="text-xs text-onyx/50">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p>{formatPrice(order.totalAmount)}</p>
                  <p className="text-xs uppercase tracking-wider text-onyx/50">{order.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
