import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User, OtpToken } from "@/models/user";
import { generateOtp } from "@/lib/utils";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  adminSecretKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  const { name, email, password, adminSecretKey } = parsed.data;

  if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: "Invalid admin secret key." }, { status: 403 });
  }

  await connectDB();
  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, phone: "", passwordHash, role: "admin", isVerified: false });

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRY_MINUTES || 10) * 60_000);
  await OtpToken.create({ email, otpHash, purpose: "verify", expiresAt });
  await sendOtpEmail(email, otp, "verify");

  return NextResponse.json({ success: true, email });
}
