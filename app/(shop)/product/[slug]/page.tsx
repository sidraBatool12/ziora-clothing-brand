import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/features/products/queries";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductReviews } from "@/components/product-reviews";
import { ProductSection } from "@/components/storefront-ui";
import { Reveal } from "@/components/motion-reveal";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, getSiteUrl, pageMetadata } from "@/lib/seo";
import { baseUnitPrice } from "@/lib/pricing";

interface PageProps {
  params: Promise<{ slug: string }>;
}
export const dynamic = "force-dynamic";

function productDescription(product: { seoDescription?: string; shortDescription?: string; description: string }) {
  return (
    product.seoDescription ||
    product.shortDescription ||
    product.description.replace(/\s+/g, " ").trim().slice(0, 160)
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return pageMetadata({ title: "Product", description: "This piece is no longer available.", path: `/product/${slug}`, index: false });

  return pageMetadata({
    title: product.seoTitle || product.name,
    description: productDescription(product),
    path: `/product/${slug}`,
    image: product.thumbnail?.url,
    keywords: product.seoKeywords,
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryId =
    typeof product.category === "string"
      ? product.category
      : (product.category as unknown as { _id: string })._id;
  const related = await getRelatedProducts(categoryId, product._id);
  const price = baseUnitPrice(product);
  const inStock = product.stockQuantity > 0;
  const productUrl = absoluteUrl(`/product/${slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: productDescription(product),
    sku: product.sku,
    image: product.images?.map((image) => image.url).filter(Boolean).slice(0, 8) || [product.thumbnail?.url],
    brand: { "@type": "Brand", name: product.brand || "ZIORA" },
    url: productUrl,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "PKR",
      price,
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.ratingAverage.toFixed(1)),
            reviewCount: product.ratingCount,
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: getSiteUrl() },
      { "@type": "ListItem", position: 2, name: "Shop", item: absoluteUrl("/shop") },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <main>
      <JsonLd data={[jsonLd, breadcrumbLd]} />
      <div className="page-shell py-10 md:py-16">
        <Reveal>
          <ProductPurchase product={product} />
        </Reveal>
      </div>
      <ProductReviews productId={product._id} />
      <ProductSection
        eyebrow="You May Also Like"
        title="Related Products"
        viewAllHref="/shop"
        products={related}
      />
    </main>
  );
}
