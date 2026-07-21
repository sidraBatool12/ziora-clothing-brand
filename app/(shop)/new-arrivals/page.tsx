import { getNewArrivals } from "@/features/products/queries";
import { ProductCard } from "@/components/storefront-ui";

export const metadata = { title: "New Arrivals" };
export const dynamic = "force-dynamic"; // swap to `export const revalidate = 300;` once deployed with a real MONGODB_URI, for ISR caching

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24);
  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:px-12">
      <p className="eyebrow mb-2">Just In</p>
      <h1 className="mb-8 text-3xl text-onyx md:text-4xl">New Arrivals</h1>
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </main>
  );
}
