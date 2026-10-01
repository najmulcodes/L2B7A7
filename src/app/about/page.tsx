import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export const metadata: Metadata = {
  title: "About — CodeRank",
  description: "Why CodeRank exists: a shared, timed process for assessing developers instead of scattered take-home links.",
};

const PRINCIPLES = [
  {
    title: "The problem bank is the asset, not the assessment",
    body: "Problems live independently of any single assessment. Write a coding question once, reuse it across every role you hire for, and its difficulty and scoring stay consistent every time.",
  },
  {
    title: "A clock a candidate can see is a fair clock",
    body: "Every attempt has a real deadline the candidate can watch counting down, not a soft honor-system time limit. Answers save automatically as they work, so a slow connection never costs them the attempt.",
  },
  {
    title: "Auto-scoring where it's honest, human review where it matters",
    body: "Multiple-choice is scored the instant a candidate submits — there's nothing subjective to decide. Written and coding answers wait for a real reviewer, with room for feedback, not just a number.",
  },
  {
    title: "Publishing is a deliberate act",
    body: "An assessment stays editable as a draft for as long as you need. Publishing locks the problem set and spends a credit — so what a candidate sees is exactly what you meant to send.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <MarketingNav />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
          Built around how hiring for engineering roles actually works.
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-600">
          Most technical hiring runs on a patchwork of shared docs, one-off take-home emails, and spreadsheets
          tracking who still needs grading. CodeRank replaces that with one place to build a problem bank, run timed
          assessments against it, and review results — for both the company running the process and the candidate
          going through it.
        </p>
      </section>

      <section className="border-y border-gray-200 bg-[#F6F7F9]">
        <div className="mx-auto max-w-3xl space-y-10 px-6 py-16">
          {PRINCIPLES.map((p) => (
            <div key={p.title}>
              <h2 className="text-lg font-semibold text-gray-900">{p.title}</h2>
              <p className="mt-2 leading-relaxed text-gray-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
