"use client";

import { useState } from "react";
import { Check, FloppyDisk, SpinnerGap } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Settings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  currency: string;
  shippingFee: number;
  freeShippingThreshold: number;
  codEnabled: boolean;
  easypaisaEnabled: boolean;
  easypaisaAccountName: string;
  easypaisaAccountNumber: string;
  jazzcashEnabled: boolean;
  jazzcashAccountName: string;
  jazzcashAccountNumber: string;
  bankTransferEnabled: boolean;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIban: string;
  paymentInstructions: string;
  orderPrefix: string;
}

const fieldClass =
  "w-full rounded-xl bg-white px-3.5 py-3 text-sm text-onyx outline-none ring-1 ring-inset ring-onyx/[0.09] transition-all focus:ring-rose/45";

type AccountField = { field: keyof Settings; label: string; placeholder: string };

const WALLET_ACCOUNTS: { toggle: keyof Settings; title: string; hint: string; fields: AccountField[] }[] = [
  {
    toggle: "easypaisaEnabled",
    title: "EasyPaisa",
    hint: "Customers send the amount to this wallet and upload a screenshot.",
    fields: [
      { field: "easypaisaAccountName", label: "Account title", placeholder: "ZIORA Official" },
      { field: "easypaisaAccountNumber", label: "Account number", placeholder: "03XX-XXXXXXX" },
    ],
  },
  {
    toggle: "jazzcashEnabled",
    title: "JazzCash",
    hint: "Same manual flow as EasyPaisa, verified from the orders page.",
    fields: [
      { field: "jazzcashAccountName", label: "Account title", placeholder: "ZIORA Official" },
      { field: "jazzcashAccountNumber", label: "Account number", placeholder: "03XX-XXXXXXX" },
    ],
  },
  {
    toggle: "bankTransferEnabled",
    title: "Bank transfer",
    hint: "Shown at checkout when the customer picks bank transfer.",
    fields: [
      { field: "bankName", label: "Bank name", placeholder: "Meezan Bank" },
      { field: "bankAccountName", label: "Account title", placeholder: "ZIORA Official" },
      { field: "bankAccountNumber", label: "Account number", placeholder: "0123456789012" },
      { field: "bankIban", label: "IBAN", placeholder: "PK00 MEZN 0000 0000 0000 0000" },
    ],
  },
];

export function StoreSettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof Settings>(field: K, value: Settings[K]) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(data.error || "Settings could not be saved.");
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={submit} className="space-y-9">
      <section>
        <p className="text-[10px] uppercase tracking-[0.2em] text-rose">Store identity</p>
        <h2 className="mt-1 text-lg font-medium tracking-tight">Contact and storefront</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            ["storeName", "Store name", "ZIORA", "text"],
            ["supportEmail", "Support email", "hello@ziora.pk", "email"],
            ["supportPhone", "Support phone", "+92...", "tel"],
            ["businessHours", "Business hours", "Mon–Fri 9:30–18:00 PKT", "text"],
          ].map(([field, label, placeholder, type]) => (
            <label key={field} className="space-y-2">
              <span className="block text-[10px] uppercase tracking-[0.16em] text-onyx/40">{label}</span>
              <input
                type={type}
                required={field !== "supportPhone"}
                value={String(form[field as keyof Settings])}
                onChange={(event) => update(field as keyof Settings, event.target.value as never)}
                placeholder={placeholder}
                className={fieldClass}
              />
            </label>
          ))}
        </div>
      </section>

      <div className="h-px bg-onyx/[0.07]" />

      <section>
        <p className="text-[10px] uppercase tracking-[0.2em] text-rose">Orders and delivery</p>
        <h2 className="mt-1 text-lg font-medium tracking-tight">Commercial defaults</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-onyx/40">Currency</span>
            <input required maxLength={3} value={form.currency} onChange={(e) => update("currency", e.target.value.toUpperCase())} className={fieldClass} />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-onyx/40">Shipping fee</span>
            <input required min="0" type="number" value={form.shippingFee} onChange={(e) => update("shippingFee", Number(e.target.value))} className={fieldClass} />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-onyx/40">Free shipping from</span>
            <input required min="0" type="number" value={form.freeShippingThreshold} onChange={(e) => update("freeShippingThreshold", Number(e.target.value))} className={fieldClass} />
          </label>
          <label className="space-y-2">
            <span className="block text-[10px] uppercase tracking-[0.16em] text-onyx/40">Order prefix</span>
            <input required value={form.orderPrefix} onChange={(e) => update("orderPrefix", e.target.value.toUpperCase())} className={fieldClass} />
          </label>
        </div>
      </section>

      <div className="h-px bg-onyx/[0.07]" />

      <section>
        <p className="text-[10px] uppercase tracking-[0.2em] text-rose">Checkout availability</p>
        <h2 className="mt-1 text-lg font-medium tracking-tight">Payment methods</h2>

        <button
          type="button"
          onClick={() => update("codEnabled", !form.codEnabled)}
          className={cn(
            "mt-5 flex w-full items-center gap-3 rounded-2xl p-4 text-left ring-1 ring-inset transition-all active:scale-[0.99] sm:w-1/2",
            form.codEnabled ? "bg-rose/[0.055] ring-rose/18" : "bg-white ring-onyx/[0.08]"
          )}
        >
          <span className={cn("flex h-6 w-6 items-center justify-center rounded-lg", form.codEnabled ? "bg-rose text-white" : "bg-onyx/[0.06] text-transparent")}>
            <Check size={13} weight="bold" />
          </span>
          <span>
            <span className="block text-xs font-medium">Cash on delivery</span>
            <span className="mt-0.5 block text-[10px] text-onyx/37">Accept payment at delivery</span>
          </span>
        </button>

        <div className="mt-4 space-y-3">
          {WALLET_ACCOUNTS.map((account) => {
            const enabled = form[account.toggle] as boolean;
            return (
              <div
                key={account.toggle}
                className={cn(
                  "rounded-2xl p-4 ring-1 ring-inset transition-all",
                  enabled ? "bg-rose/[0.04] ring-rose/18" : "bg-white ring-onyx/[0.08]"
                )}
              >
                <button
                  type="button"
                  onClick={() => update(account.toggle, !enabled as never)}
                  className="flex w-full items-center gap-3 text-left active:scale-[0.995]"
                >
                  <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg", enabled ? "bg-rose text-white" : "bg-onyx/[0.06] text-transparent")}>
                    <Check size={13} weight="bold" />
                  </span>
                  <span>
                    <span className="block text-xs font-medium">{account.title}</span>
                    <span className="mt-0.5 block text-[10px] text-onyx/37">{account.hint}</span>
                  </span>
                </button>

                {enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid gap-4 border-t border-onyx/[0.07] pt-4 sm:grid-cols-2">
                      {account.fields.map(({ field, label, placeholder }) => (
                        <label key={field} className="space-y-2">
                          <span className="block text-[10px] uppercase tracking-[0.16em] text-onyx/40">{label}</span>
                          <input
                            value={String(form[field] ?? "")}
                            onChange={(event) => update(field, event.target.value as never)}
                            placeholder={placeholder}
                            className={fieldClass}
                          />
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <label className="mt-4 block space-y-2">
          <span className="block text-[10px] uppercase tracking-[0.16em] text-onyx/40">
            Payment instructions (shown at checkout)
          </span>
          <textarea
            rows={3}
            maxLength={500}
            value={form.paymentInstructions}
            onChange={(event) => update("paymentInstructions", event.target.value)}
            placeholder="Send the exact total and upload the screenshot. Orders are dispatched once payment is verified."
            className={cn(fieldClass, "resize-none")}
          />
        </label>
      </section>

      {error && <p role="alert" className="rounded-xl bg-rose/[0.07] px-4 py-3 text-sm text-rose">{error}</p>}
      {saved && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-emerald-800">
          <Check size={15} weight="bold" />
          Settings saved
        </motion.p>
      )}

      <div className="flex justify-end border-t border-onyx/[0.07] pt-6">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-full bg-onyx px-5 py-3 text-[10px] uppercase tracking-[0.14em] text-white active:scale-[0.98] disabled:opacity-45"
        >
          {saving ? <SpinnerGap size={15} className="animate-spin" /> : <FloppyDisk size={15} />}
          {saving ? "Saving" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
