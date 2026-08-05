import { connectDB } from "@/lib/db";
import { Category, Product } from "@/models/catalog";
import { AdminProductForm } from "@/components/admin-product-form";
import { ClothingCatalog } from "@/components/admin/clothing-catalog";

export default async function AdminClothingPage() {
  await connectDB();
  const [products, categories] = await Promise.all([
    Product.find().populate("category", "name slug").sort({ createdAt: -1 }).limit(250).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-rose">Catalog studio</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.035em] text-onyx sm:text-4xl">
          Clothing
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-onyx/48">
          Build storefront cards, arrange image galleries, assign collections and control where each piece appears.
        </p>
      </header>

      <section className="rounded-[2rem] bg-onyx/[0.035] p-1.5 ring-1 ring-inset ring-onyx/[0.05]">
        <div className="rounded-[calc(2rem-0.375rem)] bg-[#FAF9F7] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:p-7 lg:p-9">
          <AdminProductForm categories={serializedCategories} />
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-rose">Storefront inventory</p>
            <h2 className="mt-1 text-xl font-medium tracking-tight">Clothing cards</h2>
          </div>
          <p className="text-xs text-onyx/38">{products.length} total</p>
        </div>
        <ClothingCatalog products={serializedProducts} />
      </section>
    </div>
  );
}
