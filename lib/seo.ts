import type { Metadata } from "next";
import { BRAND_EMAIL, BRAND_PHONE_TEL } from "@/lib/brand-contact";
import { absoluteUrl, getAppUrl } from "@/lib/app-url";

export const SITE_NAME = "ZIORA";
export const SITE_TAGLINE = "Grace Beyond Modesty";
export const DEFAULT_TITLE = "ZIORA — Grace Beyond Modesty";
export const DEFAULT_DESCRIPTION =
  "ZIORA is a premium modest fashion brand from Gilgit, Pakistan. Shop elegant ready-to-wear, new arrivals, and curated collections — Grace Beyond Modesty.";

export { absoluteUrl };
export const getSiteUrl = getAppUrl;

export const defaultOpenGraphImage = "/brand/ziora-logo-nav.png";

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  image?: string;
  keywords?: string[];
}): Metadata {
  const index = input.index ?? true;
  const url = absoluteUrl(input.path);
  const image = input.image || defaultOpenGraphImage;
  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: input.path },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
    openGraph: {
      type: "website",
      locale: "en_PK",
      url,
      siteName: SITE_NAME,
      title: `${input.title} — ${SITE_NAME}`,
      description: input.description,
      images: [{ url: image, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${input.title} — ${SITE_NAME}`,
      description: input.description,
      images: [image],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: "ZIORA",
    url: getSiteUrl(),
    logo: absoluteUrl("/brand/ziora-logo-nav.png"),
    email: BRAND_EMAIL,
    telephone: BRAND_PHONE_TEL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Gilgit",
      addressCountry: "PK",
    },
    founder: {
      "@type": "Person",
      name: "Sidra Batool",
      jobTitle: "Founder & Full Stack Developer",
    },
    slogan: SITE_TAGLINE,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
