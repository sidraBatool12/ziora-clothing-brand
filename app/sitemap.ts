import type { MetadataRoute } from "next";
import { getPublishedSitemapProducts } from "@/features/products/queries";
import { getSiteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const now = new Date();
  const products = await getPublishedSitemapProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${site}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${site}/new-arrivals`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${site}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${site}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${site}/product/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
