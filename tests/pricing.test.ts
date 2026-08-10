import { describe, expect, it } from "vitest";
import { resolveUnitPrice } from "@/lib/pricing";

const product = {
  price: 5000,
  discountPrice: 4000,
  sizePrices: [
    { size: "S", price: 3800 },
    { size: "L", price: 4500 },
  ],
  thumbnail: { publicId: "thumb", price: 4200 },
  images: [
    {
      publicId: "img-a",
      price: 4300,
      sizePrices: [
        { size: "M", price: 4600 },
        { size: "L", price: 4900 },
      ],
    },
    { publicId: "img-b", price: 4100 },
  ],
};

describe("resolveUnitPrice", () => {
  it("falls back to sale price", () => {
    expect(resolveUnitPrice({ price: 5000, discountPrice: 4000 })).toBe(4000);
  });

  it("uses product size price when no image override", () => {
    expect(resolveUnitPrice(product, { size: "S" })).toBe(3800);
  });

  it("uses image price when selected", () => {
    expect(resolveUnitPrice(product, { imagePublicId: "img-b" })).toBe(4100);
  });

  it("prefers image+size over image price", () => {
    expect(resolveUnitPrice(product, { imagePublicId: "img-a", size: "M" })).toBe(4600);
    expect(resolveUnitPrice(product, { imagePublicId: "img-a", size: "L" })).toBe(4900);
  });

  it("uses image price when size has no image-specific or product-size override", () => {
    expect(resolveUnitPrice(product, { imagePublicId: "img-b", size: "M" })).toBe(4100);
  });

  it("prefers product size over image price when image has no size override", () => {
    expect(resolveUnitPrice(product, { imagePublicId: "img-a", size: "S" })).toBe(3800);
  });
});
