/**
 * Create or promote an admin user.
 *
 * Usage:
 *   node --env-file=.env.local ./scripts/create-admin.mjs
 *
 * Required env:
 *   MONGODB_URI
 *   ADMIN_EMAIL
 *   ADMIN_PASSWORD
 *   ADMIN_NAME (optional)
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "ZIORA Admin";

if (!uri || !email || !password) {
  console.error("Missing MONGODB_URI, ADMIN_EMAIL, or ADMIN_PASSWORD.");
  process.exit(1);
}

if (password.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    isVerified: Boolean,
    providers: [String],
    sessionVersion: { type: Number, default: 0 },
    lastLoginAt: Date,
    addresses: { type: Array, default: [] },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

await mongoose.connect(uri);
const passwordHash = await bcrypt.hash(password, 12);
const existing = await User.findOne({ email });

if (existing) {
  existing.name = name;
  existing.passwordHash = passwordHash;
  existing.role = "admin";
  existing.isVerified = true;
  existing.providers = Array.from(new Set([...(existing.providers || []), "credentials"]));
  existing.sessionVersion = (existing.sessionVersion || 0) + 1;
  await existing.save();
  console.log(`Updated existing user to admin: ${email}`);
} else {
  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    isVerified: true,
    providers: ["credentials"],
    sessionVersion: 0,
  });
  console.log(`Created admin user: ${email}`);
}

await mongoose.disconnect();
