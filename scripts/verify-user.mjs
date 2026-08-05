/**
 * Manually verify an account when OTP email cannot be delivered.
 * Also backfills the `providers` array on legacy accounts created before that
 * field existed, which the profile UI relies on to show password controls.
 *
 * Usage: npm run verify-user -- someone@example.com
 *        npm run verify-user -- --all-unverified
 */
import mongoose from "mongoose";

const arg = process.argv[2]?.trim().toLowerCase();
const bulk = arg === "--all-unverified";

if (!arg || (!bulk && !arg.includes("@"))) {
  console.error("Usage: npm run verify-user -- <email>\n       npm run verify-user -- --all-unverified");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

const User = mongoose.model("VerifyUser", new mongoose.Schema({}, { strict: false, collection: "users" }));

await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

// Only password accounts are eligible: an OAuth-only account has nothing to unlock.
const filter = bulk
  ? { isVerified: { $ne: true }, passwordHash: { $exists: true, $ne: null } }
  : { email: arg };

const users = await User.find(filter);

if (users.length === 0) {
  console.log(bulk ? "No unverified password accounts found." : `No account found for ${arg}`);
  await mongoose.disconnect();
  process.exit(bulk ? 0 : 1);
}

for (const user of users) {
  const update = { isVerified: true };
  if (user.get("passwordHash") && !(user.get("providers") ?? []).length) {
    update.providers = ["credentials"];
  }
  if (user.get("sessionVersion") === undefined) {
    update.sessionVersion = 0;
  }

  await User.updateOne({ _id: user._id }, { $set: update });
  console.log(`Verified ${user.get("email")}${update.providers ? " (backfilled providers)" : ""}`);
}

await mongoose.disconnect();
