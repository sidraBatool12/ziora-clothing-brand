import bcrypt from "bcryptjs";
import { User } from "@/models/user";

let pending: Promise<void> | null = null;

/**
 * Upserts the administrator from ADMIN_EMAIL / ADMIN_PASSWORD so login works
 * against MongoDB, not only the env file.
 */
export function ensureAdminFromEnv() {
  if (!pending) pending = upsertAdmin().catch((error) => {
    pending = null;
    console.error("[auth] Could not store admin credentials:", error);
  });
  return pending;
}

async function upsertAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = (process.env.ADMIN_NAME || "ZIORA Administrator").trim();

  if (!email || !password) {
    console.warn("[auth] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin bootstrap.");
    return;
  }
  if (password.length < 8) {
    console.warn("[auth] ADMIN_PASSWORD must be at least 8 characters — skipping admin bootstrap.");
    return;
  }

  const existing = await User.findOne({ email }).select("+passwordHash");
  if (existing) {
    const passwordMatches = existing.passwordHash
      ? await bcrypt.compare(password, existing.passwordHash)
      : false;
    existing.name = name;
    existing.role = "admin";
    existing.isVerified = true;
    existing.providers = Array.from(new Set([...(existing.providers || []), "credentials"])) as typeof existing.providers;
    if (!passwordMatches) {
      existing.passwordHash = await bcrypt.hash(password, 12);
      existing.sessionVersion = (existing.sessionVersion || 0) + 1;
    }
    await existing.save();
    console.info(`[auth] Admin account ready in database: ${email}`);
    return;
  }

  await User.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "admin",
    isVerified: true,
    providers: ["credentials"],
    sessionVersion: 0,
  });
  console.info(`[auth] Created admin account in database: ${email}`);
}
