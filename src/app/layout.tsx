import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeRank — Developer Assessment Platform",
  description: "Build, send, and evaluate developer assessments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
