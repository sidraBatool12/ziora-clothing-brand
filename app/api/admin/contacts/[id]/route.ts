import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/admin";
import { getAdminOrNull } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["unread", "read", "resolved"]).optional(),
  adminNote: z.string().trim().max(1000).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact update." }, { status: 400 });
  }

  await connectDB();
  const { id } = await params;
  const message = await ContactMessage.findByIdAndUpdate(id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!message) return NextResponse.json({ error: "Message not found." }, { status: 404 });
  return NextResponse.json({ success: true, message });
}
