"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOut,
  CaretDown,
  Check,
  Clock,
  MagnifyingGlass,
  MapPin,
  Package,
  Receipt,
  SpinnerGap,
  Truck,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
  "refunded",
] as const;

interface AdminOrder {
  _id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  transactionId?: string;
  paymentProof?: { url: string; publicId: string };
  customer?: { name: string; email: string; phone?: string; avatar?: string } | null;
  items: {
    name: string;
    image: string;
    size?: string;
    color?: string;
    quantity: number;
    unitPrice: number;
    sku?: string;
  }[];
  address: {
    fullName: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shippingDetails: {
    courierName?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
  };
  statusHistory: { status: string; at: string; note?: string }[];
  createdAt: string;
}

function statusTone(status: string) {
  if (["cancelled", "returned", "refunded", "rejected"].includes(status)) {
    return "bg-rose/[0.08] text-rose";
  }
  if (["delivered", "paid", "confirmed"].includes(status)) {
    return "bg-emerald-700/[0.08] text-emerald-800";
  }
  if (["pending", "verification_pending"].includes(status)) {
    return "bg-amber-600/[0.09] text-amber-800";
  }
  return "bg-onyx/[0.055] text-onyx/55";
}

export function OrderOperations({ orders }: { orders: AdminOrder[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, {
    status: string;
    courierName: string;
    trackingNumber: string;
    estimatedDelivery: string;
    note: string;
  }>>({});

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matches =
        !search ||
        order.orderNumber.toLowerCase().includes(search) ||
        order.customer?.name.toLowerCase().includes(search) ||
        order.customer?.email.toLowerCase().includes(search);
      const statusMatches =
        filter === "all" ||
        order.status === filter ||
        order.paymentStatus === filter ||
        (filter === "needs_action" &&
          (order.status === "pending" || order.paymentStatus === "verification_pending"));
      return matches && statusMatches;
    });
  }, [filter, orders, query]);

  function getDraft(order: AdminOrder) {
    return drafts[order._id] || {
      status: order.status,
      courierName: order.shippingDetails?.courierName || "",
      trackingNumber: order.shippingDetails?.trackingNumber || "",
      estimatedDelivery: order.shippingDetails?.estimatedDelivery
        ? new Date(order.shippingDetails.estimatedDelivery).toISOString().slice(0, 10)
        : "",
      note: "",
    };
  }

  function updateDraft(order: AdminOrder, field: string, value: string) {
    setDrafts((current) => ({
      ...current,
      [order._id]: { ...getDraft(order), [field]: value },
    }));
  }

  async function request(
    order: AdminOrder,
    url: string,
    method: "PATCH",
    body: Record<string, unknown>
  ) {
    setBusyId(order._id);
    setError(null);
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    setBusyId(null);
    if (!response.ok) {
      setError(data.error || "The order could not be updated.");
      return false;
    }
    router.refresh();
    return true;
  }

  async function decide(order: AdminOrder, decision: "accept" | "reject") {
    if (order.paymentStatus === "verification_pending") {
      await request(
        order,
        `/api/admin/payments/${order._id}`,
        "PATCH",
        { action: decision === "accept" ? "approve" : "reject" }
      );
      return;
    }
    await request(
      order,
      `/api/orders/${order._id}/status`,
      "PATCH",
      {
        status: decision === "accept" ? "confirmed" : "cancelled",
        note: decision === "accept" ? "Order accepted by administrator." : "Order rejected by administrator.",
      }
    );
  }

  async function saveTracking(order: AdminOrder) {
    const draft = getDraft(order);
    await request(order, `/api/orders/${order._id}/status`, "PATCH", {
      status: draft.status,
      courierName: draft.courierName,
      trackingNumber: draft.trackingNumber,
      estimatedDelivery: draft.estimatedDelivery || undefined,
      note: draft.note || undefined,
    });
  }

  return (
    <section>
      <div className="flex flex-col gap-3 border-y border-onyx/[0.07] py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-md">
          <MagnifyingGlass size={17} weight="light" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-onyx/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order, customer or email"
            className="w-full rounded-full bg-white py-3 pl-10 pr-4 text-sm outline-none ring-1 ring-inset ring-onyx/[0.08] placeholder:text-onyx/30 focus:ring-rose/45"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {[
            ["all", "All"],
            ["needs_action", "Needs action"],
            ["pending", "Pending"],
            ["confirmed", "Accepted"],
            ["shipped", "Shipped"],
            ["delivered", "Delivered"],
            ["cancelled", "Rejected"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-[10px] uppercase tracking-[0.12em] transition-all active:scale-[0.98]",
                filter === value ? "bg-onyx text-white" : "bg-white text-onyx/50 ring-1 ring-inset ring-onyx/[0.07]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-rose/[0.07] px-4 py-3 text-sm text-rose ring-1 ring-inset ring-rose/15">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
          <Package size={25} weight="light" className="text-onyx/28" />
          <p className="mt-4 text-sm font-medium">No orders in this view</p>
          <p className="mt-1 text-xs text-onyx/38">New storefront orders will appear here.</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-onyx/[0.07]">
          {filtered.map((order) => {
            const expanded = expandedId === order._id;
            const draft = getDraft(order);
            const needsDecision =
              order.status === "pending" || order.paymentStatus === "verification_pending";
            return (
              <article key={order._id} className="py-4">
                <div className="grid gap-3 sm:grid-cols-[1.2fr_0.9fr_0.75fr_auto] sm:items-center">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : order._id)}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-onyx/45 ring-1 ring-inset ring-onyx/[0.07]">
                      <Receipt size={18} weight="light" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{order.orderNumber}</span>
                      <span className="mt-0.5 block truncate text-[10px] text-onyx/38">
                        {order.customer?.name || order.address.fullName} · {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </button>
                  <div className="flex flex-wrap gap-1.5">
                    <span className={cn("rounded-full px-2.5 py-1 text-[9px] capitalize", statusTone(order.status))}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className={cn("rounded-full px-2.5 py-1 text-[9px] capitalize", statusTone(order.paymentStatus))}>
                      {order.paymentStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatPrice(order.totalAmount)}</p>
                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-onyx/35">
                      {order.paymentMethod.replace(/_/g, " ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : order._id)}
                    className="flex h-9 items-center justify-center gap-1.5 rounded-full bg-white px-3 text-[10px] text-onyx/50 ring-1 ring-inset ring-onyx/[0.07]"
                  >
                    Details
                    <CaretDown size={12} className={cn("transition-transform", expanded && "rotate-180")} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-4 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-inset ring-onyx/[0.07]"
                    >
                      <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="p-5 sm:p-6">
                          <p className="text-[9px] uppercase tracking-[0.18em] text-rose">Order contents</p>
                          <div className="mt-4 divide-y divide-onyx/[0.06]">
                            {order.items.map((item, index) => (
                              <div key={`${item.sku}-${index}`} className="flex gap-3 py-3 first:pt-0">
                                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">
                                  {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium">{item.name}</p>
                                  <p className="mt-1 text-[10px] text-onyx/38">
                                    {[item.size, item.color, item.sku].filter(Boolean).join(" · ") || "Standard"}
                                  </p>
                                  <p className="mt-1 text-[10px] text-onyx/55">
                                    {item.quantity} × {formatPrice(item.unitPrice)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-5 grid gap-4 border-t border-onyx/[0.07] pt-5 sm:grid-cols-2">
                            <div>
                              <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-onyx/35">
                                <MapPin size={13} weight="light" />
                                Delivery address
                              </p>
                              <div className="mt-2 text-xs leading-relaxed text-onyx/65">
                                <p className="font-medium text-onyx">{order.address.fullName}</p>
                                <p>{order.address.phone}</p>
                                <p>{order.address.line1}</p>
                                <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                                <p>{order.address.country}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase tracking-[0.16em] text-onyx/35">Customer account</p>
                              <div className="mt-2 text-xs leading-relaxed text-onyx/65">
                                <p className="font-medium text-onyx">{order.customer?.name || "Customer"}</p>
                                <p>{order.customer?.email || "No email"}</p>
                                <p>{order.customer?.phone || order.address.phone}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-onyx/[0.07] bg-[#F8F6F2] p-5 sm:p-6 lg:border-l lg:border-t-0">
                          <p className="text-[9px] uppercase tracking-[0.18em] text-rose">Payment review</p>
                          {order.paymentProof ? (
                            <div className="mt-4">
                              <a
                                href={order.paymentProof.url}
                                target="_blank"
                                rel="noreferrer"
                                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-beige ring-1 ring-inset ring-onyx/[0.08]"
                              >
                                <Image src={order.paymentProof.url} alt={`Payment proof for ${order.orderNumber}`} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
                                <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-onyx/70 px-3 py-2 text-[10px] text-white backdrop-blur-md">
                                  Full image
                                  <ArrowSquareOut size={12} />
                                </span>
                              </a>
                              <p className="mt-2 text-[10px] text-onyx/40">Transaction · {order.transactionId || "Not supplied"}</p>
                            </div>
                          ) : (
                            <div className="mt-4 flex min-h-28 flex-col items-center justify-center rounded-2xl bg-white text-center ring-1 ring-inset ring-onyx/[0.07]">
                              <Receipt size={19} weight="light" className="text-onyx/25" />
                              <p className="mt-2 text-[11px] text-onyx/38">
                                {order.paymentMethod === "cod" ? "Cash on delivery" : "No payment screenshot"}
                              </p>
                            </div>
                          )}

                          {needsDecision && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                disabled={busyId === order._id}
                                onClick={() => decide(order, "accept")}
                                className="flex items-center justify-center gap-2 rounded-full bg-emerald-800 px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-white transition-transform active:scale-[0.98] disabled:opacity-45"
                              >
                                {busyId === order._id ? <SpinnerGap size={14} className="animate-spin" /> : <Check size={14} weight="bold" />}
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={busyId === order._id}
                                onClick={() => decide(order, "reject")}
                                className="flex items-center justify-center gap-2 rounded-full bg-rose px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-white transition-transform active:scale-[0.98] disabled:opacity-45"
                              >
                                <X size={14} weight="bold" />
                                Reject
                              </button>
                            </div>
                          )}

                          <div className="mt-6 border-t border-onyx/[0.07] pt-5">
                            <p className="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-rose">
                              <Truck size={13} weight="light" />
                              Status and tracking
                            </p>
                            <div className="mt-3 grid gap-2">
                              <select
                                value={draft.status}
                                onChange={(event) => updateDraft(order, "status", event.target.value)}
                                className="rounded-xl bg-white px-3 py-2.5 text-xs outline-none ring-1 ring-inset ring-onyx/[0.08]"
                              >
                                {STATUSES.map((status) => (
                                  <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                                ))}
                              </select>
                              <input
                                value={draft.courierName}
                                onChange={(event) => updateDraft(order, "courierName", event.target.value)}
                                placeholder="Courier name"
                                className="rounded-xl bg-white px-3 py-2.5 text-xs outline-none ring-1 ring-inset ring-onyx/[0.08]"
                              />
                              <input
                                value={draft.trackingNumber}
                                onChange={(event) => updateDraft(order, "trackingNumber", event.target.value)}
                                placeholder="Tracking number"
                                className="rounded-xl bg-white px-3 py-2.5 text-xs outline-none ring-1 ring-inset ring-onyx/[0.08]"
                              />
                              <input
                                type="date"
                                value={draft.estimatedDelivery}
                                onChange={(event) => updateDraft(order, "estimatedDelivery", event.target.value)}
                                className="rounded-xl bg-white px-3 py-2.5 text-xs outline-none ring-1 ring-inset ring-onyx/[0.08]"
                              />
                              <input
                                value={draft.note}
                                onChange={(event) => updateDraft(order, "note", event.target.value)}
                                placeholder="Internal/customer update note"
                                className="rounded-xl bg-white px-3 py-2.5 text-xs outline-none ring-1 ring-inset ring-onyx/[0.08]"
                              />
                              <button
                                type="button"
                                disabled={busyId === order._id}
                                onClick={() => saveTracking(order)}
                                className="mt-1 flex items-center justify-center gap-2 rounded-full bg-onyx px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-white active:scale-[0.98] disabled:opacity-45"
                              >
                                {busyId === order._id ? <SpinnerGap size={14} className="animate-spin" /> : <Clock size={14} />}
                                Save update
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
