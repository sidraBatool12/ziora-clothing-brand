import { getFeaturedProducts, getNewArrivals, getStorefrontCategories } from "@/features/products/queries";
import {
  Hero,
  buildHeroSlidesFromNewArrivals,
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
    getNewArrivals(12),
    getStorefrontCategories(),
  ]);

  // Exact product thumbnails from the New Arrivals grid — one slide per product.
  const heroSlides = buildHeroSlidesFromNewArrivals(newArrivals);

  return (
    <main>
      <Hero slides={heroSlides} />
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
