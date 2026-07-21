"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

interface OrderRowProps {
  order: {
    id: string; orderNumber: string; status: string; paymentMethod: string;
    paymentStatus: string; totalAmount: number;
    shippingDetails: { courierName?: string; trackingNumber?: string; estimatedDelivery?: Date | string };
  };
}

export function AdminOrderRow({ order }: OrderRowProps) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status);
  const [courierName, setCourierName] = useState(order.shippingDetails?.courierName || "");
  const [trackingNumber, setTrackingNumber] = useState(order.shippingDetails?.trackingNumber || "");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function save() {
    setSaving(true);
    await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, courierName, trackingNumber }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="border border-onyx/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <button onClick={() => setExpanded((e) => !e)} className="font-medium underline">
          {order.orderNumber}
        </button>
        <span>{formatPrice(order.totalAmount)}</span>
        <span className="text-xs uppercase tracking-widest text-onyx/50">
          {order.paymentMethod} · {order.paymentStatus.replace(/_/g, " ")}
        </span>
        <span className="rounded-full bg-onyx/5 px-3 py-1 text-xs capitalize">{status.replace(/_/g, " ")}</span>
      </div>

      {expanded && (
        <div className="mt-4 grid gap-3 border-t border-onyx/10 pt-4 sm:grid-cols-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-onyx/15 px-3 py-2 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <input placeholder="Courier name" value={courierName} onChange={(e) => setCourierName(e.target.value)} className="border border-onyx/15 px-3 py-2 text-sm" />
          <input placeholder="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="border border-onyx/15 px-3 py-2 text-sm sm:col-span-2" />
          <button onClick={save} disabled={saving} className="bg-onyx px-6 py-2 text-xs uppercase tracking-widest text-white sm:col-span-2">
            {saving ? "Saving…" : "Update Order"}
          </button>
        </div>
      )}
    </div>
  );
}
