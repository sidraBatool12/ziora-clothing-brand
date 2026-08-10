"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store";
import { formatPrice } from "@/lib/utils";
import { useStoreSettings } from "@/hooks/use-store-settings";

type Address = { fullName: string; phone: string; line1: string; city: string; state: string; postalCode: string; country: string; };
const emptyAddress: Address = { fullName: "", phone: "", line1: "", city: "", state: "", postalCode: "", country: "Pakistan" };
const inputClass = "w-full border border-onyx/10 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus-visible:border-rose";

type PaymentMethod = "cod" | "easypaisa" | "jazzcash" | "bank_transfer";

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  easypaisa: "EasyPaisa",
  jazzcash: "JazzCash",
  bank_transfer: "Bank Transfer",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const { items, subtotal, clear } = useCartStore();
  const storeSettings = useStoreSettings();
  const [step, setStep] = useState(0); // 0 address, 1 payment, 2 review
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [transactionId, setTransactionId] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?redirect=/checkout");
    }
  }, [status, router]);

  const availableMethods: PaymentMethod[] = [
    storeSettings.codEnabled && "cod",
    storeSettings.easypaisaEnabled && "easypaisa",
    storeSettings.jazzcashEnabled && "jazzcash",
    storeSettings.bankTransferEnabled && "bank_transfer",
  ].filter(Boolean) as PaymentMethod[];

  const manualAccounts: Record<Exclude<PaymentMethod, "cod">, { label: string; value: string }[]> = {
    easypaisa: [
      { label: "Account title", value: storeSettings.easypaisaAccountName },
      { label: "Account number", value: storeSettings.easypaisaAccountNumber },
    ],
    jazzcash: [
      { label: "Account title", value: storeSettings.jazzcashAccountName },
      { label: "Account number", value: storeSettings.jazzcashAccountNumber },
    ],
    bank_transfer: [
      { label: "Bank", value: storeSettings.bankName },
      { label: "Account title", value: storeSettings.bankAccountName },
      { label: "Account number", value: storeSettings.bankAccountNumber },
      { label: "IBAN", value: storeSettings.bankIban },
    ],
  };

  const firstAvailable = availableMethods[0];
  useEffect(() => {
    if (availableMethods.includes(paymentMethod) || !firstAvailable) return;
    setPaymentMethod(firstAvailable);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod, firstAvailable, availableMethods.join(",")]);

  const sub = subtotal();
  const shipping =
    sub >= storeSettings.freeShippingThreshold ? 0 : storeSettings.shippingFee;
  const total = sub + shipping;

  function update(field: keyof Address, val: string) {
    setAddress((a) => ({ ...a, [field]: val }));
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function placeOrder() {
    if (paymentMethod !== "cod" && !proofFile) {
      setError("Please upload your payment screenshot.");
      return;
    }

    setPlacing(true);
    setError(null);

    let paymentProof: { url: string; publicId: string } | undefined;
    try {
      if (paymentMethod !== "cod" && proofFile) {
        const base64 = await fileToBase64(proofFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, folder: "ziora/payment-proofs" }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Failed to upload payment proof.");
        paymentProof = { url: uploadData.url, publicId: uploadData.publicId };
      }

      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            imagePublicId: item.imagePublicId,
          })),
          address,
          paymentMethod,
          transactionId: transactionId || undefined,
          paymentProof,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order.");

      setOrderNumber(data.orderNumber);
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPlacing(false);
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return <main className="mx-auto max-w-lg px-6 py-24 text-center"><p className="text-onyx/70">Checking your session…</p></main>;
  }

  if (orderNumber) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-3xl text-onyx">Order Placed</h1>
        <p className="mt-4 text-onyx/70">Your order number is</p>
        <p className="mt-1 text-xl text-gold">{orderNumber}</p>
        {paymentMethod !== "cod" && <p className="mt-4 text-sm text-onyx/60">Your payment proof is under review. We'll notify you once it's verified.</p>}
        <button onClick={() => router.push("/dashboard/orders")} className="mt-8 bg-onyx px-8 py-3 text-xs uppercase tracking-widest text-white">View My Orders</button>
      </main>
    );
  }

  if (items.length === 0) {
    return <main className="mx-auto max-w-lg px-6 py-24 text-center"><p className="text-onyx/70">Your cart is empty.</p></main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 md:px-12">
      <div className="mb-10 flex justify-center gap-4 text-xs uppercase tracking-widest">
        {["Shipping Address", "Payment Method", "Review"].map((s, i) => (
          <span key={s} className={i === step ? "text-gold" : i < step ? "text-onyx" : "text-onyx/30"}>{i + 1}. {s}</span>
        ))}
      </div>

      <div className="grid gap-10 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {step === 0 && (
            <div>
              <h2 className="mb-4 text-lg text-onyx">Shipping Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <input placeholder="Full name" value={address.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} />
                <input placeholder="Phone" value={address.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
                <input placeholder="Address line" value={address.line1} onChange={(e) => update("line1", e.target.value)} className={`${inputClass} sm:col-span-2`} />
                <input placeholder="City" value={address.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
                <input placeholder="State/Province" value={address.state} onChange={(e) => update("state", e.target.value)} className={inputClass} />
                <input placeholder="Postal code" value={address.postalCode} onChange={(e) => update("postalCode", e.target.value)} className={inputClass} />
                <input placeholder="Country" value={address.country} onChange={(e) => update("country", e.target.value)} className={inputClass} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg text-onyx">Payment Method</h2>

              {availableMethods.length === 0 && (
                <p className="border border-rose/20 bg-rose/[0.05] p-4 text-sm text-rose">
                  Checkout is temporarily unavailable. Please contact ZIORA support.
                </p>
              )}

              {availableMethods.map((method) => (
                <div key={method}>
                  <label className={`block border p-4 text-sm ${paymentMethod === method ? "border-gold" : "border-onyx/15"}`}>
                    <span className="flex items-center gap-3">
                      <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                      {PAYMENT_LABELS[method]}
                    </span>
                  </label>

                  {method !== "cod" && paymentMethod === method && (
                    <div className="ml-7 mt-3 space-y-3 border-l-2 border-gold/30 pl-4 text-sm">
                      <dl className="space-y-1 text-onyx/70">
                        {manualAccounts[method]
                          .filter((detail) => detail.value)
                          .map((detail) => (
                            <div key={detail.label} className="flex gap-2">
                              <dt className="min-w-28 text-onyx/50">{detail.label}</dt>
                              <dd className="font-medium text-onyx">{detail.value}</dd>
                            </div>
                          ))}
                      </dl>
                      {storeSettings.paymentInstructions && (
                        <p className="text-xs leading-relaxed text-onyx/60">{storeSettings.paymentInstructions}</p>
                      )}
                      <input placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className={inputClass} />
                      <div>
                        <label className="block text-xs text-onyx/60">
                          Payment screenshot (required)
                          <input type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="mt-1 block text-xs" />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-sm">
              <h2 className="text-lg text-onyx">Review Your Order</h2>
              <div><strong>Ship to:</strong> {address.fullName}, {address.line1}, {address.city}</div>
              <div><strong>Payment:</strong> {PAYMENT_LABELS[paymentMethod]}</div>
              <ul className="divide-y divide-onyx/10 border-t border-onyx/10">
                {items.map((i) => (
                  <li key={`${i.productId}-${i.size}`} className="flex justify-between py-2">
                    <span>{i.name} × {i.quantity}</span><span>{formatPrice(i.price * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              {error && <p className="text-red-600">{error}</p>}
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 0 ? <button onClick={() => setStep((s) => s - 1)} className="text-sm underline">Back</button> : <span />}
            {step < 2 ? (
              <button onClick={() => setStep((s) => s + 1)} className="bg-onyx px-8 py-3 text-xs uppercase tracking-widest text-white">Continue</button>
            ) : (
              <button onClick={placeOrder} disabled={placing} className="bg-onyx px-8 py-3 text-xs uppercase tracking-widest text-white disabled:opacity-50">
                {placing ? "Placing Order…" : "Place Order"}
              </button>
            )}
          </div>
        </div>

        <div className="h-fit border border-onyx/10 p-6">
          <h2 className="mb-4 text-sm uppercase tracking-widest text-onyx/60">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(sub)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span></div>
            <div className="mt-3 flex justify-between border-t border-onyx/10 pt-3 text-base font-medium"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
