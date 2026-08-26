import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#e11d48", // A premium vibrant rose/red for the movie vibe
          hover: "#be123c",
        },
        surface: "#18181b", // zinc-900 for dark mode cards
      },
    },
  },
  plugins: [],
};
export default config;
