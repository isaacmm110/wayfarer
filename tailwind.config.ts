import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "accent-blue": "var(--accent-blue)",
        "accent-green": "var(--accent-green)",
        "accent-amber": "var(--accent-amber)",
        "accent-cyan": "var(--accent-cyan)",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "Inter",
          ...defaultTheme.fontFamily.sans,
        ],
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.28)",
        card: "0 16px 48px rgba(0, 0, 0, 0.22)",
        "glow-blue": "0 0 36px rgba(59, 130, 246, 0.2)",
        "glow-green": "0 0 36px rgba(34, 197, 94, 0.18)",
        "glow-amber": "0 0 36px rgba(245, 158, 11, 0.18)",
        "glow-cyan": "0 0 36px rgba(34, 211, 238, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
