"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Navbar-only brand mark (transparent PNG). Other surfaces keep text/branding separately. */
export function NavBrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href="/" className={cn("inline-flex shrink-0 items-center", className)} aria-label="ZIORA home">
      <Image
        src="/brand/ziora-logo-nav.png"
        alt="ZIORA — Grace Beyond Modesty"
        width={80}
        height={80}
        priority={priority}
        sizes="(max-width: 640px) 40px, (max-width: 768px) 44px, (max-width: 1024px) 48px, 52px"
        className="h-10 w-auto object-contain object-center sm:h-11 md:h-12"
      />
    </Link>
  );
}
