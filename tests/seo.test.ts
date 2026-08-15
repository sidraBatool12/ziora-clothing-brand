import { describe, expect, it } from "vitest";
import { absoluteUrl, getSiteUrl, pageMetadata } from "@/lib/seo";

describe("seo helpers", () => {
  it("builds absolute URLs from the site origin", () => {
    expect(absoluteUrl("/shop")).toBe(`${getSiteUrl()}/shop`);
  });

  it("marks private pages as noindex", () => {
    const meta = pageMetadata({
      title: "Cart",
      description: "Private",
      path: "/cart",
      index: false,
    });
    expect(meta.robots).toMatchObject({ index: false, follow: false });
  });

  it("sets a canonical path for public pages", () => {
    const meta = pageMetadata({
      title: "About ZIORA",
      description: "Our story",
      path: "/about",
    });
    expect(meta.alternates).toMatchObject({ canonical: "/about" });
  });
});
