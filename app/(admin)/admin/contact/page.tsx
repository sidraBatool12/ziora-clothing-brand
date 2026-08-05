import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/models/admin";
import { ContactInbox } from "@/components/admin/contact-inbox";

export default async function AdminContactPage() {
  await connectDB();
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(300).lean();

  return (
    <div className="space-y-9">
      <header className="max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.22em] text-rose">Customer care</p>
        <h1 className="mt-2 text-3xl font-medium tracking-[-0.035em] sm:text-4xl">Contact inbox</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-onyx/48">
          Read messages sent from the storefront, keep internal context and close resolved conversations.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-x-5 gap-y-6 border-y border-onyx/[0.07] py-6 md:grid-cols-4">
        {[
          ["All messages", messages.length],
          ["Unread", messages.filter((message) => message.status === "unread").length],
          ["In review", messages.filter((message) => message.status === "read").length],
          ["Resolved", messages.filter((message) => message.status === "resolved").length],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-2xl font-medium tracking-tight">{value}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-onyx/35">{label}</p>
          </div>
        ))}
      </section>

      <ContactInbox messages={JSON.parse(JSON.stringify(messages))} />
    </div>
  );
}
