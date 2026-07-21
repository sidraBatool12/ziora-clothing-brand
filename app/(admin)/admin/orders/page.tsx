import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { formatPrice } from "@/lib/utils";
import { AdminOrderRow } from "@/components/admin-order-row";

export default async function AdminOrdersPage() {
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).limit(100).lean();

  return (
    <div>
      <h1 className="mb-8 text-2xl text-onyx">Orders</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <AdminOrderRow
            key={o._id.toString()}
            order={{
              id: o._id.toString(),
              orderNumber: o.orderNumber,
              status: o.status,
              paymentMethod: o.paymentMethod,
              paymentStatus: o.paymentStatus,
              totalAmount: o.totalAmount,
              shippingDetails: o.shippingDetails,
            }}
          />
        ))}
      </div>
    </div>
  );
}
