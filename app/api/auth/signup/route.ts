import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User, OtpToken } from "@/models/user";
import { generateOtp } from "@/lib/utils";
import { sendOtpEmail } from "@/lib/email";
import { deliverOtp } from "@/lib/otp-delivery";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`signup:${ip}`, 8, 10 * 60_000);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many signup attempts. Try again later." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const { name, email, password } = parsed.data;

  await connectDB();
  const existing = await User.exists({ email });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await User.create({
      name,
      email,
      passwordHash,
      providers: ["credentials"],
      role: "customer",
      isVerified: false,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    throw error;
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60_000);
  await OtpToken.create({ email, otpHash, purpose: "verify", expiresAt });
  const { delivered } = await deliverOtp(email, otp, "verify", sendOtpEmail);

  return NextResponse.json({ success: true, email, emailDelivered: delivered });
}
