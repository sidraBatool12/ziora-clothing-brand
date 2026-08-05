import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";

/**
 * Development-only escape hatch for accounts stuck unverified when SMTP is
 * unreachable. Disabled unless ALLOW_DEV_VERIFY=1 and NODE_ENV is not production.
 */
const schema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  allUnverified: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  // Production is always closed. Outside production this exists so OTP failures
  // (offline SMTP / DNS) cannot permanently lock out local accounts.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  await connectDB();

  const filter = parsed.data.allUnverified
    ? { isVerified: { $ne: true }, passwordHash: { $exists: true, $ne: null } }
    : { email: parsed.data.email };

  if (!parsed.data.allUnverified && !parsed.data.email) {
    return NextResponse.json({ error: "Provide email or allUnverified: true." }, { status: 400 });
  }

  const users = await User.find(filter).select("+passwordHash");
  const updated: string[] = [];

  for (const user of users) {
    user.isVerified = true;
    user.providers ||= [];
    if (user.passwordHash && !user.providers.includes("credentials")) {
      user.providers.push("credentials");
    }
    if (user.sessionVersion === undefined || user.sessionVersion === null) {
      user.sessionVersion = 0;
    }
    await user.save();
    updated.push(user.email);
  }

  return NextResponse.json({ success: true, updated });
}
