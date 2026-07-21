import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { User } from "@/models/user";
import { Product } from "@/models/catalog";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/utils";

export default async function AdminDashboard() {
  await connectDB();

  const [orders, customerCount, productCount, lowStockCount, outOfStockCount, pendingPayments] =
    await Promise.all([
      Order.find({ paymentStatus: "paid" }).lean(),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments(),
      Product.countDocuments({ stockQuantity: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
      Product.countDocuments({ stockQuantity: 0 }),
      Order.countDocuments({ paymentStatus: "verification_pending" }),
    ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = await Order.countDocuments();

  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue) },
    { label: "Total Orders", value: totalOrders },
    { label: "Customers", value: customerCount },
    { label: "Products", value: productCount },
    { label: "Pending Payments", value: pendingPayments, warn: pendingPayments > 0 },
    { label: "Low Stock Products", value: lowStockCount, warn: lowStockCount > 0 },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl text-onyx">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className={`border p-6 ${s.warn ? "border-amber-300 bg-amber-50" : "border-onyx/10 bg-white"}`}>
            <p className="text-2xl text-onyx">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-onyx/50">{s.label}</p>
          </div>
        ))}
      </div>

      {outOfStockCount > 0 && (
        <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {outOfStockCount} product{outOfStockCount === 1 ? " is" : "s are"} completely out of stock.
        </p>
      )}

      <p className="mt-8 text-xs text-onyx/40">
        Chart-based sales/revenue/customer-growth analytics are a natural next addition on top of
        these aggregate stats — this build gives you the real underlying numbers to chart from.
      </p>
    </div>
  );
}
