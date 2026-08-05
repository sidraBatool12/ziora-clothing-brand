"use client";

import Image from "next/image";
import { getAvatarColor, getInitials } from "@/lib/avatar";
import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  image,
  size = 40,
  className = "",
  ring = true,
}: {
  name?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  const initials = getInitials(name);
  const color = getAvatarColor(name || image);
  const ringClass = ring ? "ring-1 ring-onyx/10" : "";

  if (image) {
    return (
      <Image
        src={image}
        alt={name || "Profile"}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", ringClass, className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-serif tracking-[0.06em] text-white",
        color,
        ringClass,
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size / 2.6)) }}
      aria-label={name || "User avatar"}
    >
      {initials}
    </span>
  );
}
