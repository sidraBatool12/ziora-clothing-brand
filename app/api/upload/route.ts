import { NextRequest, NextResponse } from "next/server";
import { getUserOrNull } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  const user = await getUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { file, folder } = await req.json();
  if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  try {
    const result = await uploadImage(file, folder || "ziora/payment-proofs");
    return NextResponse.json({ success: true, ...result });
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
