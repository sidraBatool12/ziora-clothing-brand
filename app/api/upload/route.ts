import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUserOrNull } from "@/lib/auth";
import { storeImage } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

const CUSTOMER_FOLDERS = new Set(["ziora/payment-proofs", "ziora/avatars", "ziora/reviews"]);
const ADMIN_FOLDERS = new Set([
  "ziora/payment-proofs",
  "ziora/avatars",
  "ziora/reviews",
  "ziora/products",
]);

const schema = z.object({
  // An 8 MB binary image expands to roughly 10.7 MB as a base64 data URL.
  file: z.string().min(1).max(12_000_000),
  folder: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`upload:${user._id}`, 20, 10 * 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Upload rate limit exceeded." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "No valid file provided." }, { status: 400 });

  if (!parsed.data.file.startsWith("data:image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
  }

  const requestedFolder = parsed.data.folder || "ziora/payment-proofs";
  const allowed = user.role === "admin" ? ADMIN_FOLDERS : CUSTOMER_FOLDERS;
  if (!allowed.has(requestedFolder)) {
    return NextResponse.json({ error: "Upload folder is not allowed." }, { status: 403 });
  }

  try {
    const result = await storeImage(parsed.data.file, requestedFolder);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[upload] failed", error);

    const message = error instanceof Error ? error.message : "";
    if (message === "IMAGE_STORAGE_NOT_CONFIGURED") {
      return NextResponse.json(
        { error: "Image storage is not configured. Set the CLOUDINARY_* environment variables." },
        { status: 503 }
      );
    }
    if (message === "UNSUPPORTED_IMAGE_FORMAT") {
      return NextResponse.json(
        { error: "Unsupported image format. Use JPG, PNG, WEBP, or GIF." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
