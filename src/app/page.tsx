import type { Metadata } from "next";
import { LandingPage } from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: "CodeRank — Assess developers the way you'll actually hire them",
  description:
    "Build a reusable problem bank, publish timed assessments, and review candidate results in one place — for companies hiring developers and the candidates they're evaluating.",
  openGraph: {
    title: "CodeRank",
    description: "Timed developer assessments with a reusable problem bank and a clear pass or fail.",
    type: "website",
  },
};

// A genuine Server Component: the "am I already logged in?" redirect now
// happens in src/middleware.ts (reading the same non-httpOnly role cookie
// it already uses for /login and /register), so this page never ships a
// client-side auth check or a loading spinner — it just renders.
export default function HomePage() {
  return <LandingPage />;
}
