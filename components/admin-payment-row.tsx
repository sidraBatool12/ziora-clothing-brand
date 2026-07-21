"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";

interface PaymentRowProps {
  order: {
    id: string; orderNumber: string; totalAmount: number; paymentMethod: string;
    transactionId?: string; paymentProof?: { url: string; publicId: string };
  };
}

export function AdminPaymentRow({ order }: PaymentRowProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    await fetch(`/api/admin/payments/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-4 border border-onyx/10 bg-white p-5">
      {order.paymentProof && (
        <a href={order.paymentProof.url} target="_blank" rel="noreferrer" className="relative h-20 w-20 shrink-0 overflow-hidden bg-beige/40">
          <Image src={order.paymentProof.url} alt="Payment proof" fill className="object-cover" />
        </a>
      )}
      <div className="flex-1 text-sm">
        <p className="font-medium">{order.orderNumber}</p>
        <p className="text-xs text-onyx/50">
          {order.paymentMethod.toUpperCase()} — Txn: {order.transactionId || "—"}
        </p>
        <p className="mt-1">{formatPrice(order.totalAmount)}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => act("approve")} disabled={busy} className="border border-green-600 px-4 py-1.5 text-xs uppercase tracking-widest text-green-700 hover:bg-green-50">
          Approve
        </button>
        <button onClick={() => act("reject")} disabled={busy} className="border border-red-500 px-4 py-1.5 text-xs uppercase tracking-widest text-red-600 hover:bg-red-50">
          Reject
        </button>
      </div>
    </div>
  );
}
