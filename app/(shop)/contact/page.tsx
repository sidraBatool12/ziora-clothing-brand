import { Reveal } from "@/components/motion-reveal";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <main className="page-shell py-14 md:py-20">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <p className="eyebrow mb-3">Get In Touch</p>
          <h1 className="text-4xl tracking-tight text-onyx md:text-5xl">Contact</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-onyx/55">
            Questions on sizing, orders, or wholesale? Send a note — we reply within one business day.
          </p>
          <div className="mt-10 space-y-5 text-sm text-onyx/70">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/40">Email</p>
              <p className="mt-1">hello@ziora.pk</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/40">Phone</p>
              <p className="mt-1">+92 300 0000000</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/40">Hours</p>
              <p className="mt-1">Mon–Fri 9:30–18:00 PKT</p>
              <p>Sat 10:30–17:30 PKT</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <form className="space-y-5 border border-onyx/10 bg-white p-6 md:p-10" action="#" method="post">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Name</label>
                <input type="text" required className="input-field" />
                <p className="text-[11px] text-onyx/35">As it should appear on replies</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Email</label>
                <input type="email" required className="input-field" />
                <p className="text-[11px] text-onyx/35">We never share your inbox</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.18em] text-onyx/45">Message</label>
              <textarea rows={6} required className="input-field resize-y" />
              <p className="text-[11px] text-onyx/35">Include order numbers if relevant</p>
            </div>
            <button type="submit" className="btn-primary">
              Send Message
            </button>
            <p className="text-xs text-onyx/35">
              Front-end form in this build — wire to Nodemailer in lib/email.ts when ready.
            </p>
          </form>
        </Reveal>
      </div>
    </main>
  );
}
