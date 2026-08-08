import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          /* PLACEHOLDER HEX VALUES — Pending client's actual REALSPACE logo file */
          red: "#D6342C",
          yellow: "#F2B705",
          bg: "#FFFFFF",
          bgAlt: "#F7F7F5",
          text: "#1F1F1F",
        },
      },
    },
  },
  plugins: [],
};

export default config;
