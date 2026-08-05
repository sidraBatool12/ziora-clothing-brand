import { requireAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <AdminShell
      admin={{ name: user.name, email: user.email, image: user.avatar }}
    >
      {children}
    </AdminShell>
  );
}
