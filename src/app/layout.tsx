import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

// next/font self-hosts these at build time (downloads once, then serves
// locally — no runtime Google Fonts request). Space Grotesk carries
// headline weight/character; JetBrains Mono is used deliberately for
// data — stats, timestamps, status labels — not as decoration.
const displayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeRank — Developer Assessment Platform",
  description: "Build, send, and evaluate developer assessments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${monoFont.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
