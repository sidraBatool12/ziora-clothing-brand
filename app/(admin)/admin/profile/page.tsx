import { requireAdmin } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile-editor";

export default async function AdminProfilePage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="mb-6 text-2xl tracking-tight text-onyx">Admin Profile</h1>
      <ProfileEditor />
    </div>
  );
}
