import { NextResponse } from "next/server";
import { ensureMockCatalog } from "@/lib/seed-catalog";
import { Product, Category } from "@/models/catalog";
import { connectDB } from "@/lib/db";
import { getAdminOrNull } from "@/lib/auth";

/** Seeds Bonanza-style mock products. Pass ?force=1 to replace ZR- mock SKUs. Admin-only. */
export async function POST(req: Request) {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "1") {
    return NextResponse.json(
      { ok: false, error: "Seeding is disabled in production." },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "1";
    await ensureMockCatalog({ force });
    await connectDB();
    const [products, categories] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
    ]);
    return NextResponse.json({
      ok: true,
      force,
      products,
      categories,
      message: force
        ? "Mock catalog re-seeded."
        : "Mock catalog ready (seeded only if empty).",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  const admin = await getAdminOrNull();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const [products, categories] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
  ]);
  return NextResponse.json({ products, categories });
}
