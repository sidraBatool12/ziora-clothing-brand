import { redirect } from "next/navigation";

/** Collections are created and assigned from the Clothing studio. */
export default function AdminCategoriesPage() {
  redirect("/admin/clothing");
}
