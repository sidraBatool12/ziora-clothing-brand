"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  url: string;
  alt: string;
  href?: string;
  label?: string;
};

const AUTO_MS = 4500;

export function HeroClient({ slides }: { slides: HeroSlide[] }) {
  const safeSlides = slides.length
    ? slides
    : [{ url: "/hero/ziora-hero.jpg", alt: "ZIORA — Grace Beyond Modesty" }];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = safeSlides.length;
  const current = safeSlides[index % count];

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count);
  }

  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden bg-onyx"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {/* Keep every slide mounted so images are already decoded when the carousel advances. */}
      <div className="absolute inset-0">
        {safeSlides.map((slide, i) => (
          <div
            key={`${slide.url}-${i}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-500 ease-out",
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-hidden={i !== index}
          >
            <Image
              src={slide.url}
              alt={slide.alt}
              fill
              priority={i <= 1}
              loading={i <= 1 ? "eager" : "lazy"}
              sizes="100vw"
              className="object-cover object-[center_25%]"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-onyx/90 via-onyx/45 to-onyx/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-onyx/65 via-transparent to-onyx/25" />
      </div>

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

          {current.label && (
            <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-rose-light transition-opacity duration-300">
              New · {current.label}
            </p>
          )}

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.52 }}
          >
            <Link
              href={current.href || "/shop"}
              className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-onyx transition-transform duration-300 active:scale-[0.98]"
            >
              {current.href ? "View Piece" : "Shop Collection"}
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

      {count > 1 && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden items-center gap-2 pr-4 md:flex lg:pr-8">
            <div className="pointer-events-auto flex flex-col gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => go(-1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-onyx/30 text-white backdrop-blur-md transition-colors hover:border-white/50 hover:bg-onyx/50"
              >
                <ArrowLeft size={18} weight="light" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => go(1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-onyx/30 text-white backdrop-blur-md transition-colors hover:border-white/50 hover:bg-onyx/50"
              >
                <ArrowRight size={18} weight="light" />
              </button>
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-10">
            {safeSlides.map((slide, i) => (
              <button
                key={`${slide.url}-${i}`}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-8 bg-white" : "w-1.5 bg-white/35 hover:bg-white/60"
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
