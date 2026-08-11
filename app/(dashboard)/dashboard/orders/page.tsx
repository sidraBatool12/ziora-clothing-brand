"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { OrderItemReviewForm } from "@/components/order-item-review-form";

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  unitPrice: number;
  size: string;
  color: string;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  shippingDetails: { courierName?: string; trackingNumber?: string; estimatedDelivery?: string };
}

const TRACKING_STEPS = ["pending", "confirmed", "packed", "shipped", "delivered"];
const CANCELLABLE = ["pending", "confirmed"];
const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewedByOrder, setReviewedByOrder] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const loadReviewsForDelivered = useCallback(async (list: Order[]) => {
    const delivered = list.filter((order) => order.status === "delivered");
    const entries = await Promise.all(
      delivered.map(async (order) => {
        const response = await fetch(`/api/reviews?orderId=${order._id}`);
        const data = await response.json();
        return [order._id, (data.reviewedProductIds as string[]) || []] as const;
      })
    );
    setReviewedByOrder(Object.fromEntries(entries));
  }, []);

  async function load() {
    const res = await fetch("/api/orders");
    const data = await res.json();
    const list = (data.orders || []) as Order[];
    setOrders(list);
    await loadReviewsForDelivered(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function cancelOrder(id: string) {
    setCancelling(id);
    const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
    const data = await res.json();
    setCancelling(null);
    if (res.ok) load();
    else alert(data.error || "Could not cancel this order.");
  }

  if (loading) return <p className="text-onyx/60">Loading your orders…</p>;
  if (orders.length === 0) return <p className="text-onyx/60">You haven&apos;t placed any orders yet.</p>;

  return (
    <div className="space-y-8">
      {orders.map((order) => {
        const stepIndex = TRACKING_STEPS.indexOf(order.status);
        const isCancelled = order.status === "cancelled";
        const withinWindow = Date.now() - new Date(order.createdAt).getTime() <= CANCEL_WINDOW_MS;
        const canCancel = CANCELLABLE.includes(order.status) && withinWindow;
        const isDelivered = order.status === "delivered";
        const reviewedIds = new Set(reviewedByOrder[order._id] || []);
        const pendingReviewItems = isDelivered
          ? order.items.filter((item) => item.product && !reviewedIds.has(String(item.product)))
          : [];

        return (
          <div key={order._id} className="border border-onyx/10 p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="font-medium">{order.orderNumber}</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>

            <ul className="mb-3 space-y-1 text-xs text-onyx/60">
              {order.items.map((item, i) => (
                <li key={i}>
                  {item.name} ({item.color}/{item.size}) × {item.quantity}
                  {isDelivered && item.product && (
                    <span className="ml-2 uppercase tracking-widest text-[9px]">
                      {reviewedIds.has(String(item.product)) ? (
                        <span className="text-emerald-700">Reviewed</span>
                      ) : (
                        <span className="text-rose">Review required</span>
                      )}
                    </span>
                  )}
                </li>
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

            {isDelivered && pendingReviewItems.length > 0 && (
              <div className="mt-5 space-y-4 border-t border-onyx/10 pt-4">
                <p className="text-sm text-onyx">
                  This order is delivered. Please submit a star rating and product photo for each item.
                </p>
                {pendingReviewItems.map((item) => (
                  <OrderItemReviewForm
                    key={`${order._id}-${item.product}`}
                    orderId={order._id}
                    productId={String(item.product)}
                    productName={item.name}
                    onSubmitted={() => {
                      setReviewedByOrder((current) => ({
                        ...current,
                        [order._id]: [...(current[order._id] || []), String(item.product)],
                      }));
                    }}
                  />
                ))}
              </div>
            )}

            {isDelivered && pendingReviewItems.length === 0 && (
              <p className="mt-4 text-xs uppercase tracking-widest text-emerald-700">
                All items reviewed — thank you
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
