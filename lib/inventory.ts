import mongoose from "mongoose";
import { Product } from "@/models/catalog";
import type { IOrderItem } from "@/models/order";
import { baseUnitPrice } from "@/lib/pricing";
import { sendLowStockAlertEmail, sendOutOfStockAlertEmail } from "@/lib/email";
import { notifyLater } from "@/lib/notify";

export const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD || 5);

export function queueStockAlerts(
  products: { name: string; sku?: string; stockQuantity: number }[]
) {
  for (const product of products) {
    if (product.stockQuantity <= 0) {
      notifyLater("out-of-stock", sendOutOfStockAlertEmail({ name: product.name, sku: product.sku }));
    } else if (product.stockQuantity <= LOW_STOCK_THRESHOLD) {
      notifyLater(
        "low-stock",
        sendLowStockAlertEmail({
          name: product.name,
          sku: product.sku,
          stockQuantity: product.stockQuantity,
        })
      );
    }
  }
}

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
