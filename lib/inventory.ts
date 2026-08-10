import mongoose from "mongoose";
import { Product } from "@/models/catalog";
import type { IOrderItem } from "@/models/order";
import { baseUnitPrice } from "@/lib/pricing";

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

/** @deprecated Prefer resolveUnitPrice from @/lib/pricing for image/size-aware pricing. */
export function unitPriceFromProduct(product: {
  price: number;
  discountPrice?: number;
}) {
  return baseUnitPrice(product);
}
