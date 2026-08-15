import { PromoBar, SiteNav, SiteFooter } from "@/components/storefront-ui";
import { JsonLd } from "@/components/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <PromoBar />
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  );
}
