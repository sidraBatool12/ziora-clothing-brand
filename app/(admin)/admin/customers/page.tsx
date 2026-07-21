import { connectDB } from "@/lib/db";
import { User } from "@/models/user";

export default async function AdminCustomersPage() {
  await connectDB();
  const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 }).limit(200).lean();

  return (
    <div>
      <h1 className="mb-8 text-2xl text-onyx">Customers</h1>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-onyx/10 text-left text-xs uppercase tracking-widest text-onyx/50">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Phone</th>
            <th className="py-2">Verified</th>
            <th className="py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id.toString()} className="border-b border-onyx/5">
              <td className="py-3">{c.name}</td>
              <td className="py-3">{c.email}</td>
              <td className="py-3">{c.phone}</td>
              <td className="py-3">{c.isVerified ? "Yes" : "No"}</td>
              <td className="py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
