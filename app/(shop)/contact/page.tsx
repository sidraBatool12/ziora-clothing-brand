import { Reveal } from "@/components/motion-reveal";
import { ContactForm } from "@/components/contact-form";
import { connectDB } from "@/lib/db";
import { StoreSettings } from "@/models/admin";
import { BRAND_EMAIL, BRAND_HOURS, BRAND_PHONE, BRAND_PHONE_TEL } from "@/lib/brand-contact";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Get in touch with ZIORA for sizing, orders, and wholesale. Email ${BRAND_EMAIL} or call ${BRAND_PHONE}.`,
  path: "/contact",
});

export default async function ContactPage() {
  await connectDB();
  const settings = await StoreSettings.findOne({ key: "primary" }).lean();
  const supportEmail = BRAND_EMAIL;
  const supportPhone = BRAND_PHONE;
  const businessHours = settings?.businessHours || BRAND_HOURS;

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
              <a href={`mailto:${supportEmail}`} className="mt-1 block transition-colors hover:text-rose">
                {supportEmail}
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/40">Phone</p>
              <a href={`tel:${BRAND_PHONE_TEL}`} className="mt-1 block transition-colors hover:text-rose">
                {supportPhone}
              </a>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-onyx/40">Hours</p>
              <p className="mt-1">{businessHours}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <ContactForm />
        </Reveal>
      </div>
    </main>
  );
}
