import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: "FAQ — CodeRank",
  description: "Answers to common questions about credits, question types, timing, and grading on CodeRank.",
};

const FAQS = [
  {
    q: "What does publishing an assessment actually do?",
    a: "It locks the attached problems in place — you can no longer edit or attach/detach problems once published — and spends one assessment credit from your company's balance. Only published assessments can receive invitations.",
  },
  {
    q: "What happens if I run out of credits?",
    a: "Publishing is blocked until you buy more. The publish button on a draft assessment will tell you exactly that and link straight to billing — there's no silent failure.",
  },
  {
    q: "How are the three question types scored?",
    a: "Multiple-choice is scored automatically the instant a candidate submits their attempt. Written and coding answers are scored manually by your team, with an optional feedback note attached to each one.",
  },
  {
    q: "What happens when the timer runs out on a candidate's attempt?",
    a: "The attempt's deadline is enforced by the server, not just the UI countdown — once it passes, further answer or submit calls are rejected. Whatever was saved before the deadline is what gets graded.",
  },
  {
    q: "Can a candidate lose their answers if their connection drops?",
    a: "No — each answer saves automatically as the candidate works, not only when they hit the final submit button. Reopening the attempt shows whatever was last saved.",
  },
  {
    q: "Does a candidate see the correct answer to a multiple-choice question?",
    a: "No. Correct answers are never sent to a candidate's browser at any point — not during the attempt, not in the results afterward. They only see their own score.",
  },
  {
    q: "What payment method does CodeRank use for buying credits?",
    a: "Stripe Checkout, in test mode for evaluation. You're redirected to Stripe to pay, then back to CodeRank, which confirms the purchase by checking payment status rather than trusting the redirect alone.",
  },
  {
    q: "Can I edit a problem that's already attached to a published assessment?",
    a: "Editing a problem in your bank (title, points, tags, and so on) is always allowed — but you can only attach or detach problems on an assessment while it's still a draft.",
  },
];

export default function FaqPage() {
  return (
    <div className="bg-white">
      <MarketingNav />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Frequently asked questions</h1>
        <p className="mt-4 text-lg text-gray-600">How credits, timing, and grading actually work.</p>

        <dl className="mt-12 divide-y divide-gray-200">
          {FAQS.map((item) => (
            <div key={item.q} className="py-6">
              <dt className="font-medium text-gray-900">{item.q}</dt>
              <dd className="mt-2 leading-relaxed text-gray-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <MarketingFooter />
    </div>
  );
}
