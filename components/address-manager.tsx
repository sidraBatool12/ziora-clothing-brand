"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Address {
  _id?: string; label: string; fullName: string; phone: string; line1: string;
  city: string; state: string; postalCode: string; country: string; isDefault: boolean;
}

const inputClass = "w-full border border-onyx/15 px-3 py-2 text-sm outline-none focus-visible:border-gold";
const empty: Address = { label: "Home", fullName: "", phone: "", line1: "", city: "", state: "", postalCode: "", country: "Pakistan", isDefault: false };

export function AddressManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Address>(empty);
  const [saving, setSaving] = useState(false);

  function update(field: keyof Address, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setAddresses(data.addresses);
      setForm(empty);
      setShowForm(false);
      router.refresh();
    }
  }

  async function remove(addressId: string) {
    await fetch("/api/addresses", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addressId }),
    });
    setAddresses((a) => a.filter((x) => x._id !== addressId));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div key={a._id} className="border border-onyx/10 p-4 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{a.label}</span>
              {a.isDefault && <span className="text-xs text-gold">Default</span>}
            </div>
            <p className="mt-1 text-onyx/70">{a.fullName} — {a.phone}</p>
            <p className="text-onyx/70">{a.line1}, {a.city}, {a.state} {a.postalCode}</p>
            <button onClick={() => a._id && remove(a._id)} className="mt-2 text-xs text-onyx/50 underline">Remove</button>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="border border-onyx/20 px-6 py-2 text-xs uppercase tracking-widest hover:border-gold">
          + Add Address
        </button>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-3 border border-onyx/10 p-6 sm:grid-cols-2">
          <input placeholder="Label (Home/Office)" value={form.label} onChange={(e) => update("label", e.target.value)} className={inputClass} />
          <input placeholder="Full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className={inputClass} required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} required />
          <input placeholder="Address line" value={form.line1} onChange={(e) => update("line1", e.target.value)} className={`${inputClass} sm:col-span-2`} required />
          <input placeholder="City" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} required />
          <input placeholder="State/Province" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} required />
          <input placeholder="Postal code" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} className={inputClass} required />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => update("isDefault", e.target.checked)} />
            Set as default address
          </label>
          <div className="flex gap-3 sm:col-span-2">
            <button type="submit" disabled={saving} className="bg-onyx px-6 py-2 text-xs uppercase tracking-widest text-white">
              {saving ? "Saving…" : "Save Address"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs underline">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
