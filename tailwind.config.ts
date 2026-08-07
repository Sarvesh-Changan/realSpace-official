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
          /* PLACEHOLDER HEX VALUES — Replace with actual REALSPACE logo brand colors */
          red: "#E53E3E", // placeholder red
          yellow: "#ECC94B", // placeholder yellow
          bg: "#FAFAFA", // near-white placeholder background
          bgAlt: "#F7FAFC", // light grey placeholder secondary background
          text: "#1A202C", // dark grey / near-black placeholder text
        },
      },
    },
  },
  plugins: [],
};

export default config;
