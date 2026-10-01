import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dbe6ff",
          200: "#b8cdff",
          300: "#8babff",
          400: "#5c82ff",
          500: "#3a5cf5",
          600: "#2941d6",
          700: "#2233ac",
          800: "#1f2c88",
          900: "#1e296e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
