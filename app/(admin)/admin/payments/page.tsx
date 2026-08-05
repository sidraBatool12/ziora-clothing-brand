import { redirect } from "next/navigation";

/** Payment proof review now lives inside the Orders desk. */
export default function AdminPaymentsPage() {
  redirect("/admin/orders");
}
