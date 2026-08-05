import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { OrderOperations } from "@/components/admin/order-operations";

export default async function AdminOrdersPage() {
  await connectDB();
  const orders = await Order.find()
    .populate("user", "name email phone avatar")
    .sort({ createdAt: -1 })
    .limit(250)
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

  const needsAction = orders.filter(
    (order) => order.status === "pending" || order.paymentStatus === "verification_pending"
  ).length;
  const inTransit = orders.filter((order) =>
    ["packed", "shipped", "out_for_delivery"].includes(order.status)
  ).length;

  return (
    <div className="space-y-9">
      <header className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-rose">Order desk</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Orders</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-onyx/48">
          Accept or reject requests, inspect every item and payment screenshot, then move approved orders through fulfilment.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-x-5 gap-y-6 border-y border-onyx/[0.07] py-6 md:grid-cols-4">
        {[
          ["All orders", orders.length],
          ["Needs action", needsAction],
          ["In transit", inTransit],
          ["Delivered", orders.filter((order) => order.status === "delivered").length],
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
