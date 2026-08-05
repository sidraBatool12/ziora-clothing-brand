import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Package,
  TShirt,
  Truck,
  UserList,
} from "@phosphor-icons/react/dist/ssr";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/order";
import { User } from "@/models/user";
import { Product } from "@/models/catalog";
import { ContactMessage } from "@/models/admin";
import { formatPrice } from "@/lib/utils";

export default async function AdminDashboard() {
  await connectDB();
  const [
    paidOrders,
    orderCount,
    customerCount,
    productCount,
    pendingOrders,
    inTransit,
    lowStock,
    unreadMessages,
    recentOrders,
  ] = await Promise.all([
    Order.find({ paymentStatus: "paid" }).select("totalAmount").lean(),
    Order.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Product.countDocuments(),
    Order.countDocuments({
      $or: [{ status: "pending" }, { paymentStatus: "verification_pending" }],
    }),
    Order.countDocuments({ status: { $in: ["packed", "shipped", "out_for_delivery"] } }),
    Product.countDocuments({ stockQuantity: { $gte: 0, $lte: 5 } }),
    ContactMessage.countDocuments({ status: "unread" }),
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
  ]);

  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const metrics = [
    { label: "Paid revenue", value: formatPrice(totalRevenue), detail: `${paidOrders.length} paid orders` },
    { label: "Orders", value: orderCount, detail: `${pendingOrders} need attention` },
    { label: "Customers", value: customerCount, detail: "Registered accounts" },
    { label: "Clothing cards", value: productCount, detail: `${lowStock} low or out of stock` },
  ];

  const actions = [
    { href: "/admin/orders", label: "Review orders", detail: `${pendingOrders} waiting`, icon: Package },
    { href: "/admin/clothing", label: "Manage clothing", detail: `${lowStock} stock alerts`, icon: TShirt },
    { href: "/admin/tracking", label: "Track delivery", detail: `${inTransit} in transit`, icon: Truck },
    { href: "/admin/contact", label: "Contact inbox", detail: `${unreadMessages} unread`, icon: Bell },
  ];

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-rose">Operations overview</p>
          <h1 className="mt-2 text-3xl font-medium tracking-[-0.04em] sm:text-4xl">Dashboard</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-onyx/48">
            A live view of sales, customer activity and fulfilment across ZIORA.
          </p>
        </div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-onyx/32">
          Updated {new Date().toLocaleString()}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-x-5 gap-y-7 border-y border-onyx/[0.07] py-7 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <div key={metric.label} className={index > 0 ? "lg:border-l lg:border-onyx/[0.07] lg:pl-6" : ""}>
            <p className="text-2xl font-medium tracking-[-0.03em] sm:text-3xl">{metric.value}</p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.16em] text-onyx/38">{metric.label}</p>
            <p className="mt-1 text-[10px] text-onyx/30">{metric.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-rose">Recent activity</p>
              <h2 className="mt-1 text-xl font-medium tracking-tight">Latest orders</h2>
            </div>
            <Link href="/admin/orders" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-onyx/42 hover:text-onyx">
              View all
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-onyx/[0.07] border-y border-onyx/[0.07]">
            {recentOrders.length === 0 ? (
              <div className="py-14 text-center">
                <Package size={21} weight="light" className="mx-auto text-onyx/25" />
                <p className="mt-3 text-xs text-onyx/38">No storefront orders yet.</p>
              </div>
            ) : (
              recentOrders.map((order) => {
                const customer = order.user as unknown as { name?: string; email?: string } | null;
                return (
                  <Link
                    key={order._id.toString()}
                    href="/admin/orders"
                    className="grid gap-2 py-4 transition-colors hover:bg-white/50 sm:grid-cols-[1fr_0.8fr_auto] sm:items-center sm:px-2"
                  >
                    <div>
                      <p className="text-xs font-medium">{order.orderNumber}</p>
                      <p className="mt-0.5 text-[10px] text-onyx/35">{customer?.name || order.address.fullName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] capitalize text-onyx/50">{order.status.replace(/_/g, " ")}</p>
                      <p className="mt-0.5 text-[9px] capitalize text-onyx/30">{order.paymentStatus.replace(/_/g, " ")}</p>
                    </div>
                    <p className="text-xs font-medium">{formatPrice(order.totalAmount)}</p>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <aside>
          <p className="text-[10px] uppercase tracking-[0.2em] text-rose">Attention queue</p>
          <h2 className="mt-1 text-xl font-medium tracking-tight">Continue working</h2>
          <div className="mt-4 space-y-2">
            {actions.map(({ href, label, detail, icon: ActionIcon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-2xl bg-white p-3.5 ring-1 ring-inset ring-onyx/[0.07] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:bg-[#FCFBF9] active:scale-[0.99]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1EEEA] text-onyx/48">
                  <ActionIcon size={18} weight="light" />
                </span>
                <span className="flex-1">
                  <span className="block text-xs font-medium">{label}</span>
                  <span className="mt-0.5 block text-[10px] text-onyx/35">{detail}</span>
                </span>
                <ArrowRight size={14} className="text-onyx/25 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
          <Link href="/admin/users" className="mt-3 flex items-center gap-2 px-2 py-2 text-[10px] uppercase tracking-[0.13em] text-onyx/38 hover:text-onyx">
            <UserList size={14} weight="light" />
            Open user directory
          </Link>
        </aside>
      </section>
    </div>
  );
}
