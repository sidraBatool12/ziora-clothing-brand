"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

interface OrderItem { name: string; quantity: number; unitPrice: number; size: string; color: string; }
interface Order {
  _id: string; orderNumber: string; items: OrderItem[]; totalAmount: number;
  status: string; paymentMethod: string; paymentStatus: string; createdAt: string;
  shippingDetails: { courierName?: string; trackingNumber?: string; estimatedDelivery?: string };
}

const TRACKING_STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"];
const CANCELLABLE = ["pending", "confirmed"];
const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function cancelOrder(id: string) {
    setCancelling(id);
    const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
    const data = await res.json();
    setCancelling(null);
    if (res.ok) load();
    else alert(data.error || "Could not cancel this order.");
  }

  if (loading) return <p className="text-onyx/60">Loading your orders…</p>;
  if (orders.length === 0) return <p className="text-onyx/60">You haven't placed any orders yet.</p>;

  return (
    <div className="space-y-8">
      {orders.map((order) => {
        const stepIndex = TRACKING_STEPS.indexOf(order.status);
        const isCancelled = order.status === "cancelled";
        const withinWindow = Date.now() - new Date(order.createdAt).getTime() <= CANCEL_WINDOW_MS;
        const canCancel = CANCELLABLE.includes(order.status) && withinWindow;

        return (
          <div key={order._id} className="border border-onyx/10 p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium">{order.orderNumber}</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>

            <ul className="mb-3 space-y-1 text-xs text-onyx/60">
              {order.items.map((item, i) => (
                <li key={i}>{item.name} ({item.color}/{item.size}) × {item.quantity}</li>
              ))}
            </ul>

            {!isCancelled ? (
              <>
                <div className="flex gap-1">
                  {TRACKING_STEPS.map((step, i) => (
                    <div key={step} className={`h-1 flex-1 ${i <= stepIndex ? "bg-gold" : "bg-onyx/10"}`} />
                  ))}
                </div>
                <p className="mt-2 text-xs uppercase tracking-widest text-onyx/60">
                  {order.status.replace(/_/g, " ")}
                </p>
              </>
            ) : (
              <p className="text-xs uppercase tracking-widest text-red-600">Cancelled</p>
            )}

            {order.shippingDetails?.trackingNumber && (
              <p className="mt-2 text-xs text-onyx/50">
                {order.shippingDetails.courierName} — Tracking: {order.shippingDetails.trackingNumber}
              </p>
            )}

            <p className="mt-2 text-xs text-onyx/50">
              Payment: {order.paymentMethod.toUpperCase()} — {order.paymentStatus.replace(/_/g, " ")}
            </p>

            {canCancel && (
              <button
                onClick={() => cancelOrder(order._id)}
                disabled={cancelling === order._id}
                className="mt-3 border border-red-300 px-4 py-1.5 text-xs uppercase tracking-widest text-red-600 hover:border-red-500 disabled:opacity-50"
              >
                {cancelling === order._id ? "Cancelling…" : "Cancel Order"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
