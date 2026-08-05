import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/db";
import { removeImage, storeImage } from "@/lib/storage";
import { User } from "@/models/user";

async function requireSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
  phone: z.string().trim().max(30).optional(),
  currentPassword: z.string().min(1).max(128).optional(),
  newPassword: z.string().min(8).max(128).optional(),
});

export async function GET() {
  const sessionUser = await requireSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findById(sessionUser.id).lean();
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  return NextResponse.json({
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      avatar: user.avatar || null,
      providers: user.providers || [],
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || null,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const sessionUser = await requireSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message || "Invalid request." }, { status: 400 });
  }

  await connectDB();
  const user = await User.findById(sessionUser.id).select("+passwordHash");
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const data = parsed.data;

  if (data.name) user.name = data.name;
  if (typeof data.phone === "string") user.phone = data.phone;

  if (data.email && data.email !== user.email) {
    const exists = await User.exists({ email: data.email, _id: { $ne: user._id } });
    if (exists) return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    user.email = data.email;
    if (!user.providers.includes("google")) user.isVerified = false;
  }

  if (data.newPassword) {
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Set a password only after linking email credentials, or contact support." },
        { status: 400 }
      );
    }
    if (!data.currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    const matches = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!matches) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    user.passwordHash = await bcrypt.hash(data.newPassword, 12);
    user.sessionVersion += 1;
    if (!user.providers.includes("credentials")) user.providers.push("credentials");
  }

  await user.save();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const sessionUser = await requireSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (sessionUser.role === "admin") {
    return NextResponse.json({ error: "Admin accounts cannot be deleted from the customer settings." }, { status: 403 });
  }

  await connectDB();
  const user = await User.findById(sessionUser.id);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  if (user.avatarPublicId) {
    await removeImage(user.avatarPublicId).catch(() => undefined);
  }

  user.sessionVersion += 1;
  await user.save();
  await User.findByIdAndDelete(user._id);

  return NextResponse.json({ success: true });
}

const avatarSchema = z.object({
  file: z.string().min(1),
});

export async function PUT(request: NextRequest) {
  const sessionUser = await requireSessionUser();
  if (!sessionUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = avatarSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "No file provided." }, { status: 400 });

  await connectDB();
  const user = await User.findById(sessionUser.id);
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });

  const uploaded = await storeImage(parsed.data.file, "ziora/avatars");
  if (user.avatarPublicId) {
    await removeImage(user.avatarPublicId).catch(() => undefined);
  }

  user.avatar = uploaded.url;
  user.avatarPublicId = uploaded.publicId;
  await user.save();

  return NextResponse.json({ success: true, avatar: uploaded.url });
}
