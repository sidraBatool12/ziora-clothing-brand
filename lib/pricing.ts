export type PriceableImage = {
  publicId: string;
  price?: number;
  sizePrices?: { size: string; price: number }[];
};

export type PriceableProduct = {
  price: number;
  discountPrice?: number;
  sizePrices?: { size: string; price: number }[];
  images?: PriceableImage[];
  thumbnail?: PriceableImage;
};

export function baseUnitPrice(product: { price: number; discountPrice?: number }) {
  if (product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price) {
    return product.discountPrice;
  }
  return product.price;
}

/**
 * Resolve storefront unit price for a selected image/style and size.
 * Priority: image+size → product size → image price → base sale/MRP.
 */
export function resolveUnitPrice(
  product: PriceableProduct,
  selection?: { size?: string; imagePublicId?: string | null }
) {
  const size = selection?.size?.trim();
  const imagePublicId = selection?.imagePublicId?.trim();

  const gallery = [...(product.images || [])];
  if (product.thumbnail?.publicId) {
    const already = gallery.some((img) => img.publicId === product.thumbnail!.publicId);
    if (!already) gallery.unshift(product.thumbnail);
  }

  const image = imagePublicId
    ? gallery.find((img) => img.publicId === imagePublicId)
    : product.thumbnail || gallery[0];

  if (image && size) {
    const sized = image.sizePrices?.find((entry) => entry.size === size)?.price;
    if (typeof sized === "number" && sized > 0) return sized;
  }

  if (size) {
    const sized = product.sizePrices?.find((entry) => entry.size === size)?.price;
    if (typeof sized === "number" && sized > 0) return sized;
  }

  if (image && typeof image.price === "number" && image.price > 0) {
    return image.price;
  }

  return baseUnitPrice(product);
}

export function findProductImage(
  product: { images?: { url: string; publicId: string }[]; thumbnail?: { url: string; publicId: string } },
  imagePublicId?: string | null
) {
  if (imagePublicId) {
    const match =
      product.images?.find((img) => img.publicId === imagePublicId) ||
      (product.thumbnail?.publicId === imagePublicId ? product.thumbnail : undefined);
    if (match) return match;
  }
  return product.thumbnail || product.images?.[0];
}
