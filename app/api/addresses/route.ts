import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { getUserOrNull } from "@/lib/auth";

const addressSchema = z.object({
  label: z.string().default("Home"),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default("Pakistan"),
  isDefault: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = addressSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid address." }, { status: 400 });

  await connectDB();
  const dbUser = await User.findById(user._id);
  if (!dbUser) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  if (parsed.data.isDefault) {
    dbUser.addresses.forEach((a) => { a.isDefault = false; });
  }
  dbUser.addresses.push(parsed.data as any);
  await dbUser.save();

  return NextResponse.json({ success: true, addresses: dbUser.addresses });
}

const deleteSchema = z.object({ addressId: z.string() });

export async function DELETE(req: NextRequest) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = deleteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  await connectDB();
  const dbUser = await User.findById(user._id);
  if (!dbUser) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  dbUser.addresses = dbUser.addresses.filter((a) => a._id?.toString() !== parsed.data.addressId) as any;
  await dbUser.save();

  return NextResponse.json({ success: true });
}
