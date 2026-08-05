import mongoose from "mongoose";
import { Product } from "@/models/catalog";
import type { IOrderItem } from "@/models/order";

export async function restoreOrderStock(
  items: IOrderItem[],
  session?: mongoose.ClientSession
) {
  for (const item of items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stockQuantity: item.quantity } },
      session ? { session } : undefined
    );
  }
}

export function unitPriceFromProduct(product: {
  price: number;
  discountPrice?: number;
}) {
  if (product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price) {
    return product.discountPrice;
  }
  return product.price;
}
