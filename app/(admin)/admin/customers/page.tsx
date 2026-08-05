import { redirect } from "next/navigation";

export default async function AdminCustomersPage() {
  redirect("/admin/users");
}
