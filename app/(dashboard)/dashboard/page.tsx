import { requireUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg text-onyx">Profile</h2>
      <div className="space-y-1 text-sm">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
      <form action="/api/auth/logout" method="post">
        <button className="border border-onyx/20 px-6 py-2 text-xs uppercase tracking-widest hover:border-gold">Sign Out</button>
      </form>
    </div>
  );
}
