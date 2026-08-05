import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { UserDirectory } from "@/components/admin/user-directory";

export default async function AdminUsersPage() {
  await connectDB();
  const users = await User.find()
    .select("name email phone avatar role isVerified providers lastLoginAt createdAt")
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  const verified = users.filter((user) => user.isVerified).length;
  const recentlyActive = users.filter(
    (user) => user.lastLoginAt && Date.now() - new Date(user.lastLoginAt).getTime() < 30 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="space-y-9">
      <header className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-rose">Identity directory</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Users</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-onyx/48">
          Review every authenticated customer and administrator, including provider, verification and recent access.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-x-5 gap-y-6 border-y border-onyx/[0.07] py-6 md:grid-cols-4">
        {[
          ["Registered", users.length],
          ["Verified", verified],
          ["Active · 30 days", recentlyActive],
          ["Administrators", users.filter((user) => user.role === "admin").length],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-2xl font-medium tracking-tight">{value}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-onyx/35">{label}</p>
          </div>
        ))}
      </section>

      <UserDirectory users={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}
