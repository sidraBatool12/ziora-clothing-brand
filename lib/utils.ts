import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatPrice(amount: number, currency = "PKR") {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}
export function generateOrderNumber() {
  return `ZR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
export const LOW_STOCK_THRESHOLD = 5;
