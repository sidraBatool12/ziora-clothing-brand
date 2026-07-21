import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();
  await connectDB();
  const orders = await Order.find({ user: user._id }).sort({ updatedAt: -1 }).limit(10).lean();

  return (
    <div className="space-y-4">
      <h2 className="text-lg text-onyx">Notifications</h2>
      {orders.length === 0 ? (
        <p className="text-onyx/60">No notifications yet.</p>
      ) : (
        <ul className="divide-y divide-onyx/10 border-t border-onyx/10">
          {orders.map((o) => (
            <li key={o._id.toString()} className="py-3 text-sm">
              <span className="text-gold">{o.orderNumber}</span> is now{" "}
              <strong className="capitalize">{o.status.replace(/_/g, " ")}</strong>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-onyx/40">
        This view is derived from your order history. A dedicated notifications collection
        (promotions, new-arrival alerts) is a natural next addition on top of this.
      </p>
    </div>
  );
}
