import { redirect } from "next/navigation";

/** Stock levels and low-stock filters live on the Clothing studio. */
export default function AdminInventoryPage() {
  redirect("/admin/clothing");
}
