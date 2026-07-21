import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Category, Product } from "@/models/catalog";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await connectDB();
  const categories = await Category.find().lean();
  const counts = await Promise.all(
    categories.map((c) => Product.countDocuments({ category: c._id }))
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-12">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-2">Explore</p>
        <h1 className="text-3xl text-onyx md:text-4xl">Categories</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((cat, i) => (
          <Link
            key={cat._id.toString()}
            href={`/shop?category=${cat._id}`}
            className="group flex aspect-square flex-col items-center justify-center gap-2 bg-beige/40 text-center transition-transform hover:-translate-y-1"
          >
            <span className="text-sm uppercase tracking-widest text-onyx group-hover:text-gold">{cat.name}</span>
            <span className="text-xs text-onyx/50">{counts[i]} items</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
