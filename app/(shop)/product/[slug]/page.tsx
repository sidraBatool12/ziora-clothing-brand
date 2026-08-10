import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/features/products/queries";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductSection } from "@/components/storefront-ui";
import { Reveal } from "@/components/motion-reveal";

interface PageProps {
  params: Promise<{ slug: string }>;
}
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryId =
    typeof product.category === "string"
      ? product.category
      : (product.category as unknown as { _id: string })._id;
  const related = await getRelatedProducts(categoryId, product._id);

  return (
    <main>
      <div className="page-shell py-10 md:py-16">
        <Reveal>
          <ProductPurchase product={product} />
        </Reveal>
      </div>
      <ProductSection
        eyebrow="You May Also Like"
        title="Related Products"
        viewAllHref="/shop"
        products={related}
      />
    </main>
  );
}
