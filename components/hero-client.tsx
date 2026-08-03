"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "@phosphor-icons/react";

export function HeroClient({ imageUrl, imageAlt }: { imageUrl: string; imageAlt: string }) {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-onyx">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
      >
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-onyx/100 via-onyx/45 to-onyx/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/55 via-transparent to-onyx/20" />
      </motion.div>

      <div className="page-shell relative flex min-h-[100dvh] items-end pb-16 pt-28 md:items-center md:pb-24 md:pt-20">
        <div className="max-w-xl text-white">
          <motion.p
            className="text-[2.75rem] font-semibold tracking-[0.32em] md:text-6xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.15 }}
          >
            ZIORA
          </motion.p>

          <motion.h1
            className="mt-5 text-3xl font-medium tracking-tight text-white/95 md:text-5xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.28 }}
          >
            Grace Beyond Modesty
          </motion.h1>

          <motion.p
            className="mt-4 max-w-[38ch] text-sm leading-relaxed text-white/65 md:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.4 }}
          >
            Ready-to-wear and curated collections for the woman who prefers presence over spectacle.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.52 }}
          >
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-onyx transition-transform duration-300 active:scale-[0.98]"
            >
              Shop Collection
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-onyx/5 transition-transform duration-500 ease-soft group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight size={13} weight="bold" />
              </span>
            </Link>
            <Link
              href="/new-arrivals"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition-all duration-500 hover:border-white hover:bg-white/10 active:scale-[0.98]"
            >
              New Arrivals
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
