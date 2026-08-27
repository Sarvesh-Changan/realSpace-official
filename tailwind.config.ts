import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Arial", "Helvetica", "sans-serif"],
      },
      colors: {
        brand: {
          /* REALSPACE Primary & Extended Brand Colors */
          red: "#990000",
          redHover: "#7A0000",
          redMuted: "#F5E6E6",
          yellow: "#FECC00",
          yellowMuted: "#FFF9E0",
          bg: "#FFFFFF",
          bgAlt: "#F7F7F5",
          warmWhite: "#FDFCFA",
          cream: "#F9F6F0",
          text: "#1F1F1F",
          dark: "#141414",
          muted: "#666666",
          lightMuted: "#8E8E8E",
          border: "#E5E5E0",
          borderLight: "#F0F0EC",
        },
      },
      spacing: {
        "section-sm": "3rem",
        "section-md": "5rem",
        "section-lg": "7.5rem",
      },
      maxWidth: {
        narrow: "48rem",
        standard: "80rem",
        wide: "90rem",
        fullBleed: "100rem",
      },
    },
  },
  plugins: [],
};

export default config;
