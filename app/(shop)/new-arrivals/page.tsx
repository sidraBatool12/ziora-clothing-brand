import { getNewArrivals } from "@/features/products/queries";
import { ProductCard } from "@/components/storefront-ui";
import { Reveal, Stagger, StaggerItem } from "@/components/motion-reveal";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({
  title: "New Arrivals",
  description: "Discover the latest ZIORA modest fashion arrivals — fresh cuts, fabrics, and seasonal silhouettes.",
  path: "/new-arrivals",
});

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24);

  return (
    <main className="page-shell py-12 md:py-16">
      <Reveal>
        <div className="mb-10 border-b border-onyx/10 pb-8 md:mb-12">
          <p className="eyebrow mb-3">Just In</p>
          <h1 className="text-4xl tracking-tight text-onyx md:text-5xl">New Arrivals</h1>
          <p className="mt-3 max-w-md text-sm text-onyx/55">
            Fresh cuts and fabrics for the current season — updated as pieces land.
          </p>
        </div>
      </Reveal>

      {products.length === 0 ? (
        <p className="py-24 text-center text-onyx/55">New pieces are on the way.</p>
      ) : (
        <Stagger className="grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 lg:grid-cols-4 lg:gap-y-14">
          {products.map((p, i) => (
            <StaggerItem key={p._id}>
              <ProductCard product={p} index={i} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </main>
  );
}
