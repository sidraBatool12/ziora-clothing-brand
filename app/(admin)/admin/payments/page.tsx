import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { formatPrice } from "@/lib/utils";
import { AdminPaymentRow } from "@/components/admin-payment-row";

export default async function AdminPaymentsPage() {
  await connectDB();

  const [pending, paidOrders, codOrders] = await Promise.all([
    Order.find({ paymentStatus: "verification_pending" }).sort({ createdAt: -1 }).lean(),
    Order.find({ paymentStatus: "paid" }).lean(),
    Order.countDocuments({ paymentMethod: "cod" }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue) },
    { label: "Pending Verification", value: pending.length },
    { label: "Paid Orders", value: paidOrders.length },
    { label: "COD Orders", value: codOrders },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl text-onyx">Payments</h1>
      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="border border-onyx/10 bg-white p-6">
            <p className="text-2xl text-onyx">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-onyx/50">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 text-sm uppercase tracking-widest text-onyx/60">Awaiting Verification</h2>
      {pending.length === 0 ? (
        <p className="text-onyx/60">No payments waiting for verification.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((o) => (
            <AdminPaymentRow
              key={o._id.toString()}
              order={{
                id: o._id.toString(),
                orderNumber: o.orderNumber,
                totalAmount: o.totalAmount,
                paymentMethod: o.paymentMethod,
                transactionId: o.transactionId,
                paymentProof: o.paymentProof,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
