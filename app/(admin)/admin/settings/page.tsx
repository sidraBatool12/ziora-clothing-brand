import { connectDB } from "@/lib/db";
import { StoreSettings } from "@/models/admin";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";

export default async function AdminSettingsPage() {
  await connectDB();
  const settings = await StoreSettings.findOneAndUpdate(
    { key: "primary" },
    { $setOnInsert: { key: "primary" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  // Documents created before the payment-details fields existed lack them entirely.
  const initial = {
    storeName: settings?.storeName ?? "ZIORA",
    supportEmail: settings?.supportEmail ?? "zioracollections137@gmail.com",
    supportPhone: settings?.supportPhone ?? "03144430551",
    businessHours: settings?.businessHours ?? "",
    currency: settings?.currency ?? "PKR",
    shippingFee: settings?.shippingFee ?? 350,
    freeShippingThreshold: settings?.freeShippingThreshold ?? 10000,
    codEnabled: settings?.codEnabled ?? true,
    easypaisaEnabled: settings?.easypaisaEnabled ?? false,
    easypaisaAccountName: settings?.easypaisaAccountName ?? "",
    easypaisaAccountNumber: settings?.easypaisaAccountNumber ?? "",
    jazzcashEnabled: settings?.jazzcashEnabled ?? false,
    jazzcashAccountName: settings?.jazzcashAccountName ?? "",
    jazzcashAccountNumber: settings?.jazzcashAccountNumber ?? "",
    bankTransferEnabled: settings?.bankTransferEnabled ?? false,
    bankName: settings?.bankName ?? "",
    bankAccountName: settings?.bankAccountName ?? "",
    bankAccountNumber: settings?.bankAccountNumber ?? "",
    bankIban: settings?.bankIban ?? "",
    paymentInstructions: settings?.paymentInstructions ?? "",
    orderPrefix: settings?.orderPrefix ?? "ZIO",
  };

  return (
    <div className="space-y-9">
      <header className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-rose">Store controls</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Settings</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-onyx/48">
          Manage public contact details, shipping defaults, order identifiers and checkout methods. Provider secrets remain in environment variables.
        </p>
      </header>

      <section className="rounded-[2rem] bg-onyx/[0.035] p-1.5 ring-1 ring-inset ring-onyx/[0.05]">
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#FAF9F7] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7 lg:p-9">
          <StoreSettingsForm initial={initial} />
        </div>
      </section>
    </div>
  );
}
