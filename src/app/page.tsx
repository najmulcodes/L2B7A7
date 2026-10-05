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

// A genuine Server Component — no auth check here at all, on purpose.
// This used to redirect an "already logged in" visitor straight to their
// dashboard (first client-side, then via middleware reading a cookie), but
// both versions could bounce someone with a stale/expired session cookie
// through a dashboard that immediately rejects it and back out to /login —
// confusing, and looked like "/ redirects to /login" with no explanation.
// Simplest fix: / always just renders the marketing page, full stop. A
// logged-in visitor can use the nav or the Log in link like anyone else.
export default function HomePage() {
  return <LandingPage />;
}
