import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/catalog";
import { getAdminOrNull } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export async function GET() {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return NextResponse.json({ categories: JSON.parse(JSON.stringify(categories)) });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Invalid collection." },
      { status: 400 }
    );
  }

  await connectDB();
  try {
    const category = await Category.create(parsed.data);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "A collection with this slug already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Collection could not be created." }, { status: 500 });
  }
}
