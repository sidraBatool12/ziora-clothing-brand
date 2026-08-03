import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Cool chalk retail palette — single rose accent */
        onyx: "#141414",
        gold: { DEFAULT: "#8F3D4A", light: "#A85A66" },
        ivory: "#F6F5F3",
        beige: "#E6E4E0",
        chalk: "#FAFAF8",
        ink: "#141414",
        mist: "#E6E4E0",
        rose: { DEFAULT: "#8F3D4A", light: "#A85A66" },
      },
      fontFamily: {
        serif: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "sans-serif"],
      },
      maxWidth: {
        store: "1400px",
      },
      transitionTimingFunction: {
        outExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
        soft: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        floatSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        shimmer: "shimmer 2.4s ease-in-out infinite",
        floatSoft: "floatSoft 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
