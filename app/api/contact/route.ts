import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/admin";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10).max(4000),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`contact:${ip}`, 5, 10 * 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message || "Please check your message." },
      { status: 400 }
    );
  }

  await connectDB();
  await ContactMessage.create(parsed.data);
  return NextResponse.json({ success: true }, { status: 201 });
}
