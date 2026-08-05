import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { StoreSettings } from "@/models/admin";
import { getAdminOrNull } from "@/lib/auth";

const accountName = z.string().trim().max(80).default("");
const accountNumber = z.string().trim().max(40).default("");

const schema = z
  .object({
    storeName: z.string().trim().min(2).max(60),
    supportEmail: z.string().trim().email(),
    supportPhone: z.string().trim().max(30),
    businessHours: z.string().trim().max(120),
    currency: z.string().trim().min(3).max(3).transform((value) => value.toUpperCase()),
    shippingFee: z.number().min(0),
    freeShippingThreshold: z.number().min(0),
    codEnabled: z.boolean(),
    easypaisaEnabled: z.boolean(),
    easypaisaAccountName: accountName,
    easypaisaAccountNumber: accountNumber,
    jazzcashEnabled: z.boolean(),
    jazzcashAccountName: accountName,
    jazzcashAccountNumber: accountNumber,
    bankTransferEnabled: z.boolean(),
    bankName: accountName,
    bankAccountName: accountName,
    bankAccountNumber: accountNumber,
    bankIban: z.string().trim().max(40).default(""),
    paymentInstructions: z.string().trim().max(500).default(""),
    orderPrefix: z.string().trim().min(2).max(8).regex(/^[A-Za-z0-9]+$/).transform((value) => value.toUpperCase()),
  })
  // Customers can only pay into an account they can actually see, so an enabled
  // manual method without its details would silently break checkout.
  .superRefine((value, ctx) => {
    const required: [boolean, string, string][] = [
      [value.easypaisaEnabled, "easypaisaAccountNumber", "Add an EasyPaisa account number before enabling it."],
      [value.jazzcashEnabled, "jazzcashAccountNumber", "Add a JazzCash account number before enabling it."],
      [value.bankTransferEnabled, "bankAccountNumber", "Add a bank account number or IBAN before enabling bank transfer."],
    ];
    for (const [enabled, field, message] of required) {
      const filled =
        Boolean(value[field as keyof typeof value]) ||
        (field === "bankAccountNumber" && Boolean(value.bankIban));
      if (enabled && !filled) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
      }
    }
  });

export async function GET() {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const settings = await StoreSettings.findOneAndUpdate(
    { key: "primary" },
    { $setOnInsert: { key: "primary" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid settings." },
      { status: 400 }
    );
  }

  await connectDB();
  const settings = await StoreSettings.findOneAndUpdate(
    { key: "primary" },
    { $set: parsed.data, $setOnInsert: { key: "primary" } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json({ success: true, settings });
}
