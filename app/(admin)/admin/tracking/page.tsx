import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { OrderOperations } from "@/components/admin/order-operations";

export default async function AdminTrackingPage() {
  await connectDB();
  const orders = await Order.find({
    status: { $in: ["confirmed", "processing", "packed", "shipped", "out_for_delivery"] },
  })
    .populate("user", "name email phone avatar")
    .sort({ updatedAt: -1 })
    .limit(200)
    .lean();

  const serialized = JSON.parse(
    JSON.stringify(
      orders.map((order) => ({
        ...order,
        customer: order.user,
        user: undefined,
      }))
    )
  );

  const tracked = orders.filter((order) => Boolean(order.shippingDetails?.trackingNumber)).length;

  return (
    <div className="space-y-9">
      <header className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-rose">Fulfilment lane</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Order tracking</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-onyx/48">
          Assign couriers and tracking numbers, set delivery estimates and move active orders through dispatch.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-x-5 gap-y-6 border-y border-onyx/[0.07] py-6 md:grid-cols-4">
        {[
          ["Active fulfilment", orders.length],
          ["Tracking assigned", tracked],
          ["Awaiting tracking", orders.length - tracked],
          ["Out for delivery", orders.filter((order) => order.status === "out_for_delivery").length],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-2xl font-medium tracking-tight">{value}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-onyx/35">{label}</p>
          </div>
        ))}
      </section>

      <OrderOperations orders={serialized} />
    </div>
  );
}
