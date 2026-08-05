import { requireUser } from "@/lib/auth";
import { CustomerSettingsPanel } from "@/components/customer-settings";

export default async function SettingsPage() {
  await requireUser();
  return (
    <div>
      <h2 className="mb-6 text-lg text-onyx">Settings</h2>
      <CustomerSettingsPanel />
    </div>
  );
}
