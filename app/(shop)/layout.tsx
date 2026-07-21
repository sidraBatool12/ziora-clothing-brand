import { SiteNav, SiteFooter } from "@/components/storefront-ui";
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (<><SiteNav />{children}<SiteFooter /></>);
}
