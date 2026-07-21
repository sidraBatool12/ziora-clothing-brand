export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-20 md:px-12">
      <p className="eyebrow mb-3">Get In Touch</p>
      <h1 className="mb-8 text-3xl text-onyx md:text-4xl">Contact Us</h1>
      <form className="space-y-4" action="#" method="post">
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-onyx/60">Name</label>
          <input type="text" required className="w-full border border-onyx/15 px-4 py-3 text-sm outline-none focus-visible:border-gold" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-onyx/60">Email</label>
          <input type="email" required className="w-full border border-onyx/15 px-4 py-3 text-sm outline-none focus-visible:border-gold" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs uppercase tracking-widest text-onyx/60">Message</label>
          <textarea rows={5} required className="w-full border border-onyx/15 px-4 py-3 text-sm outline-none focus-visible:border-gold" />
        </div>
        <button type="submit" className="bg-onyx px-8 py-3 text-xs uppercase tracking-widest text-white hover:bg-onyx/90">
          Send Message
        </button>
      </form>
      <p className="mt-6 text-xs text-onyx/40">
        This form is front-end only in this build — wire it to a Server Action or API route that
        emails your support inbox via the existing Nodemailer setup in lib/email.ts.
      </p>
    </main>
  );
}
