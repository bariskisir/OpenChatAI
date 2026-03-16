import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#212121",
        surface: "#171717",
        "surface-hover": "#2a2a2a",
        "surface-active": "#333333",
        border: "#383838",
        "text-primary": "#ececec",
        "text-secondary": "#9a9a9a",
        "text-muted": "#666666",
        accent: "#10a37f",
        "accent-hover": "#0d8c6d",
        "user-bubble": "#2e2e2e",
        error: "#ef4444",
        sidebar: "#171717",
        scrollbar: "#444444",
        "scrollbar-hover": "#555555",
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
