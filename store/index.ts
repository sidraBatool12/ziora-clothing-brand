"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  imagePublicId?: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string, imagePublicId?: string) => void;
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number,
    imagePublicId?: string
  ) => void;
  clear: () => void;
  subtotal: () => number;
}

function sameLine(a: CartItem, b: Pick<CartItem, "productId" | "size" | "color" | "imagePublicId">) {
  return (
    a.productId === b.productId &&
    a.size === b.size &&
    a.color === b.color &&
    (a.imagePublicId || "") === (b.imagePublicId || "")
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => sameLine(i, item));
          if (existing) {
            const nextQty = Math.min(existing.quantity + item.quantity, existing.maxStock);
            return {
              items: state.items.map((i) =>
                i === existing ? { ...i, quantity: nextQty, price: item.price, image: item.image } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId, size, color, imagePublicId) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !sameLine(i, { productId, size, color, imagePublicId })
          ),
        })),
      updateQuantity: (productId, size, color, quantity, imagePublicId) =>
        set((state) => ({
          items: state.items.map((i) =>
            sameLine(i, { productId, size, color, imagePublicId })
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "ziora-cart" }
  )
);

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      has: (productId) => get().productIds.includes(productId),
    }),
    { name: "ziora-wishlist" }
  )
);
