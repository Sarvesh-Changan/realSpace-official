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
          /* REALSPACE Brand Colors */
          red: "#990000",
          yellow: "#FECC00",
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
