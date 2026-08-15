/**
 * Read-only auth diagnostics. Prints NO secret values — only presence booleans
 * and account state, so it is safe to run and paste into an issue.
 *
 * Usage: npm run diagnose:auth
 */
import mongoose from "mongoose";

const REQUIRED = ["MONGODB_URI", "NEXTAUTH_SECRET"];
const OPTIONAL = [
  "NEXT_PUBLIC_APP_URL",
  "NEXTAUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "ADMIN_NAME",
  "AUTH_SECRET",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

console.log("\n=== ENV PRESENCE (values never printed) ===");
for (const key of [...REQUIRED, ...OPTIONAL]) {
  const present = Boolean(process.env[key]);
  const flag = REQUIRED.includes(key) && !present ? "MISSING (required)" : present ? "set" : "not set";
  console.log(`${key.padEnd(22)} ${flag}`);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("\nCannot inspect accounts: MONGODB_URI is not set.\n");
  process.exit(1);
}

const userSchema = new mongoose.Schema({}, { strict: false, collection: "users" });
const User = mongoose.models.DiagUser || mongoose.model("DiagUser", userSchema);

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
} catch (error) {
  console.log(`\nMongoDB connection FAILED: ${error.message}\n`);
  process.exit(1);
}

const users = await User.find({}, { email: 1, role: 1, isVerified: 1, providers: 1, passwordHash: 1 }).lean();

console.log("\n=== ACCOUNTS ===");
console.log(`total: ${users.length}`);

if (users.length === 0) {
  console.log("No accounts exist yet. Register one, or run: npm run create-admin");
} else {
  const masked = (email) => {
    const [name, domain] = String(email).split("@");
    return `${name.slice(0, 2)}***@${domain ?? "?"}`;
  };
  for (const user of users) {
    console.log(
      [
        masked(user.email).padEnd(24),
        `role=${user.role ?? "?"}`.padEnd(16),
        `verified=${user.isVerified === true}`.padEnd(16),
        `hasPassword=${Boolean(user.passwordHash)}`.padEnd(18),
        `providers=${(user.providers ?? []).join("|") || "none"}`,
      ].join(" ")
    );
  }

  const blocked = users.filter((u) => u.passwordHash && u.isVerified !== true);
  if (blocked.length) {
    console.log(
      `\n${blocked.length} password account(s) cannot log in because isVerified=false.` +
        `\nFix with: npm run verify-user -- <email>`
    );
  }
}

await mongoose.disconnect();
console.log("");
