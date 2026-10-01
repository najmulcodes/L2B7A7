import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Services — CodeRank",
  description: "What CodeRank does for hiring teams and for the candidates they invite: problem banks, timed assessments, and grading.",
};

const COMPANY_SERVICES = [
  {
    title: "Problem bank",
    body: "Multiple-choice, coding, and written problems, each with its own difficulty, point value, and tags. Write once, attach to as many assessments as you like.",
  },
  {
    title: "Assessment builder",
    body: "Group problems into a draft assessment with a duration and passing score. Attach or detach problems freely until you publish.",
  },
  {
    title: "Publish & invite",
    body: "Publishing locks the problem set and spends one assessment credit. From there, invite candidates by email — each invite carries its own expiry.",
  },
  {
    title: "Manual grading",
    body: "Score written and coding submissions by hand with attached feedback. Multiple-choice is scored automatically the moment a candidate submits.",
  },
  {
    title: "Credits & billing",
    body: "Buy assessment credits in bundles, paid through Stripe Checkout. Every purchase and its status is on your billing page.",
  },
];

const CANDIDATE_SERVICES = [
  {
    title: "One inbox for invitations",
    body: "See every assessment you've been invited to, each with a clear expiry, and accept or decline in one click.",
  },
  {
    title: "Timed attempts",
    body: "Accepting an invite starts a real countdown. Work through each question at your own pace within the time you're given.",
  },
  {
    title: "Autosave",
    body: "Every answer saves as you type — multiple choice, written answers, and code. Nothing is lost if you close the tab by accident.",
  },
  {
    title: "Results & feedback",
    body: "After grading, see your score broken down question by question, with any feedback the reviewer left on written or coding answers.",
  },
];

export default function ServicesPage() {
  return (
    <div className="bg-white">
      <MarketingNav />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          One platform, two very different jobs to do.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">
          Everything below is real functionality in the product today — not a roadmap.
        </p>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">For hiring teams</h2>
            <ul className="mt-6 space-y-6">
              {COMPANY_SERVICES.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                  <div>
                    <p className="font-medium text-gray-900">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">For candidates</h2>
            <ul className="mt-6 space-y-6">
              {CANDIDATE_SERVICES.map((s) => (
                <li key={s.title} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap gap-3">
          <Link href="/register" className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800">
            Create an account
          </Link>
          <Link href="/faq" className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Read the FAQ
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
