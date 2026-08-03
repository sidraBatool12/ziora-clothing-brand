import { NextResponse } from "next/server";
import { ensureMockCatalog } from "@/lib/seed-catalog";
import { Product, Category } from "@/models/catalog";
import { connectDB } from "@/lib/db";

/** Seeds Bonanza-style mock products. Pass ?force=1 to replace ZR- mock SKUs. */
export async function POST(req: Request) {
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
  await connectDB();
  const [products, categories] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
  ]);
  return NextResponse.json({ products, categories });
}
