import { getFeaturedProducts, getNewArrivals } from "@/features/products/queries";
import { Hero, ProductSection, Newsletter } from "@/components/storefront-ui";

export const dynamic = "force-dynamic"; // swap to `export const revalidate = 300;` once deployed with a real MONGODB_URI, for ISR caching

export default async function HomePage() {
  const [featured, newArrivals] = await Promise.all([getFeaturedProducts(), getNewArrivals()]);
  return (
    <main>
      <Hero />
      <ProductSection eyebrow="Curated" title="Featured" viewAllHref="/shop" products={featured} />
      <ProductSection eyebrow="Just In" title="New Arrivals" viewAllHref="/new-arrivals" products={newArrivals} />
      <Newsletter />
    </main>
  );
}
