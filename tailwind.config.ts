import type { Config } from "tailwindcss";

const config: Config = {
  // "class" (not the default "media") so dark: variants only activate once
  // a theme toggle actually adds a .dark class to <html> — otherwise every
  // dark: utility already in use (e.g. the Logo wordmark) would silently
  // flip on for anyone with OS-level dark mode enabled, before the rest of
  // the app has any dark-mode-aware styling to go with it.
  darkMode: "class",
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
        // Single committed accent for dark/marketing surfaces — the
        // "precision instrument" identity. Continuous with the violet end
        // of the logo gradient rather than introducing a second accent.
        signal: {
          50: "#f2efff",
          100: "#e4ddff",
          200: "#c7baff",
          300: "#a68eff",
          400: "#8c6bff",
          500: "#7b61ff",
          600: "#6440f0",
          700: "#5230c4",
          800: "#412798",
          900: "#352270",
        },
        ink: {
          DEFAULT: "#0a0a0d",
          raised: "#121216",
          panel: "#15151b",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
