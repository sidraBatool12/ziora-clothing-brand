import { getFeaturedProducts, getNewArrivals, getStorefrontCategories } from "@/features/products/queries";
import {
  Hero,
  ProductSection,
  Newsletter,
  CategoryPanels,
  CategoryRail,
  EditorialStrip,
} from "@/components/storefront-ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, newArrivals, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewArrivals(),
    getStorefrontCategories(),
  ]);

  const heroImage = featured[0]?.thumbnail?.url;

  return (
    <main>
      <Hero imageUrl={heroImage} imageAlt={featured[0]?.name || "ZIORA collection"} />
      <CategoryRail categories={categories} />
      <ProductSection
        eyebrow="Curated"
        title="Featured"
        viewAllHref="/shop"
        products={featured}
      />
      <CategoryPanels />
      <EditorialStrip />
      <ProductSection
        eyebrow="Just In"
        title="New Arrivals"
        viewAllHref="/new-arrivals"
        products={newArrivals}
      />
      <Newsletter />
    </main>
  );
}
