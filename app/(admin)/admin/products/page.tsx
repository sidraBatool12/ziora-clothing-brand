import { connectDB } from "@/lib/db";
import { Product, Category } from "@/models/catalog";
import { formatPrice, LOW_STOCK_THRESHOLD } from "@/lib/utils";
import { AdminProductForm } from "@/components/admin-product-form";

export default async function AdminProductsPage() {
  await connectDB();
  const [products, categories] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).limit(100).lean(),
    Category.find().lean(),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl text-onyx">Products</h1>

      <div className="mb-10 border border-onyx/10 bg-white p-6">
        <h2 className="mb-4 text-sm uppercase tracking-widest text-onyx/60">Add Product</h2>
        <AdminProductForm categories={JSON.parse(JSON.stringify(categories))} />
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-onyx/10 text-left text-xs uppercase tracking-widest text-onyx/50">
            <th className="py-2">Name</th>
            <th className="py-2">SKU</th>
            <th className="py-2">Price</th>
            <th className="py-2">Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const isLow = p.stockQuantity > 0 && p.stockQuantity <= LOW_STOCK_THRESHOLD;
            const isOut = p.stockQuantity === 0;
            return (
              <tr key={p._id.toString()} className="border-b border-onyx/5">
                <td className="py-3">{p.name}</td>
                <td className="py-3">{p.sku}</td>
                <td className="py-3">{formatPrice(p.price)}</td>
                <td className="py-3">
                  <span className={isOut ? "badge-out-stock px-2 py-0.5 text-xs" : isLow ? "badge-low-stock px-2 py-0.5 text-xs" : ""}>
                    {p.stockQuantity}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-6 text-xs text-onyx/40">
        Category management follows the same list+form pattern as this products page.
      </p>
    </div>
  );
}
