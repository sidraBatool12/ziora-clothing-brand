export function getInitials(name?: string | null) {
  if (!name?.trim()) return "ZI";
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** Muted, brand-adjacent gradients so initials read as intentional, not placeholder. */
const AVATAR_COLORS = [
  "bg-gradient-to-br from-[#A85A66] to-[#7A2F3C]",
  "bg-gradient-to-br from-[#3A3A3A] to-[#141414]",
  "bg-gradient-to-br from-[#A8785E] to-[#7A5340]",
  "bg-gradient-to-br from-[#5E7A55] to-[#3D5636]",
  "bg-gradient-to-br from-[#4E6E96] to-[#33496A]",
  "bg-gradient-to-br from-[#83648B] to-[#5A4162]",
];

export function getAvatarColor(seed?: string | null) {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}
