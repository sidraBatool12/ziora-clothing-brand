import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        onyx: "#0F0F0F",
        gold: { DEFAULT: "#D4AF37", light: "#E4C765" },
        ivory: "#F8F5F0",
        beige: "#E8DDCF",
      },
      fontFamily: {
        serif: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
