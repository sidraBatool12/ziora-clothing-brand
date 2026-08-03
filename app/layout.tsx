import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "ZIORA — Grace Beyond Modesty", template: "%s — ZIORA" },
  description:
    "ZIORA: premium modest fashion for Pakistan. Ready to wear, new arrivals, and curated collections — Grace Beyond Modesty.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans antialiased">
        <div className="grain-overlay" aria-hidden />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
