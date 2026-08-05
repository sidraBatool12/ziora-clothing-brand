import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { StoreSettings } from "@/models/admin";

const PUBLIC_FIELDS = [
  "shippingFee",
  "freeShippingThreshold",
  "currency",
  "codEnabled",
  "easypaisaEnabled",
  "easypaisaAccountName",
  "easypaisaAccountNumber",
  "jazzcashEnabled",
  "jazzcashAccountName",
  "jazzcashAccountNumber",
  "bankTransferEnabled",
  "bankName",
  "bankAccountName",
  "bankAccountNumber",
  "bankIban",
  "paymentInstructions",
].join(" ");

const defaults = {
  shippingFee: 250,
  freeShippingThreshold: 10000,
  currency: "PKR",
  codEnabled: true,
  easypaisaEnabled: false,
  jazzcashEnabled: false,
  bankTransferEnabled: false,
};

export async function GET() {
  await connectDB();
  const settings = await StoreSettings.findOne({ key: "primary" }).select(PUBLIC_FIELDS).lean();
  return NextResponse.json({ settings: settings || defaults });
}
