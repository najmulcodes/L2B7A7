import Link from "next/link";
import Image from "next/image";
import { InteractiveDemo } from "./InteractiveDemo";
import { MarketingNav } from "./MarketingNav";
import { MarketingFooter } from "./MarketingFooter";

const STAGES = [
  {
    n: "1",
    title: "Build the assessment",
    body: "Draft multiple-choice, coding, and written problems in a shared bank, then group the ones you want into an assessment.",
  },
  {
    n: "2",
    title: "Publish and invite",
    body: "Publishing spends one credit and locks the problem set. Invite candidates by email — each invite is good until it expires.",
  },
  {
    n: "3",
    title: "Candidate takes a timed attempt",
    body: "Accepting an invite starts the clock. Answers save as the candidate works; multiple-choice is scored the moment they submit.",
  },
  {
    n: "4",
    title: "Review and decide",
    body: "Written and coding answers wait for your team to score them. Once everything's graded, the attempt closes with a pass or fail.",
  },
];

const COMPANY_POINTS = [
  "A reusable problem bank shared across every assessment you run",
  "Assessments stay editable while they're a draft; publishing locks them in",
  "Score written and coding submissions by hand, with feedback attached",
  "Track credits, payment history, and every invitation in one place",
];

const CANDIDATE_POINTS = [
  "One inbox for every invitation, with a clear expiry on each",
  "A visible countdown once an attempt starts — no surprise cutoffs",
  "Answers save as you go, so a dropped connection doesn't cost you the attempt",
  "A full breakdown after grading: what you scored, question by question",
];

export function LandingPage() {
  return (
    <div className="bg-white">
      <MarketingNav />

      {/* ---------- Hero ---------- */}
      <section className="surface-grain bg-ink">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-28">
          <div>
            <h1 className="max-w-lg font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Assess developers the way you&apos;ll actually hire them.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/60">
              CodeRank gives you one problem bank, timed candidate attempts, and a clear pass or fail — instead of a
              spreadsheet of take-home links and half-graded submissions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-signal-500 px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-signal-600"
              >
                Start as a company
              </Link>
              <Link
                href="/register"
                className="rounded-lg border border-white/15 px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/5"
              >
                Start as a candidate
              </Link>
            </div>
            <div className="mt-10 flex gap-6 font-mono text-xs text-white/30">
              {/* Real backend enum values (ProblemType), not invented labels */}
              <span>MCQ</span>
              <span>CODING</span>
              <span>WRITTEN</span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* ---------- Product snapshot ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-gray-900">
              Every submission gets reviewed the same way
            </h2>
            <p className="mt-3 max-w-md text-gray-500">
              Multiple-choice is scored the instant a candidate submits. Written and coding answers wait in your
              review queue until someone on your team grades them — so a pass or fail always means a human looked at
              it, not just an autograder.
            </p>
          </div>
          <div className="flex justify-center">
            {/* Eager-loaded (priority): this is the first real product visual
                a visitor scrolls to, so it should paint immediately rather
                than lazy-load like the illustrations further down the page. */}
            <Image
              src="/images/hero-assessment.svg"
              alt="An assessment panel with reviewed code lines next to a pass badge"
              width={560}
              height={440}
              priority
              className="h-auto w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* ---------- Two sides ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-8">
            {/* Below the fold by this point — next/image lazy-loads these by
                default (no `priority`), so neither one competes with the
                hero image or the interactive demo for bandwidth on load. */}
            <Image
              src="/images/illustration-problem-bank.svg"
              alt="A stack of problem cards representing a reusable problem bank"
              width={320}
              height={240}
              className="h-auto w-full max-w-[220px]"
            />
            <h2 className="mt-6 font-display text-xl font-semibold text-gray-900">For hiring teams</h2>
            <p className="mt-2 text-gray-500">Run a consistent process across every role you&apos;re hiring for.</p>
            <ul className="mt-6 space-y-3">
              {COMPANY_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal-500" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-200 p-8">
            <Image
              src="/images/illustration-timed-attempt.svg"
              alt="A countdown timer with a progress ring representing a timed candidate attempt"
              width={320}
              height={240}
              className="h-auto w-full max-w-[220px]"
            />
            <h2 className="mt-6 font-display text-xl font-semibold text-gray-900">For candidates</h2>
            <p className="mt-2 text-gray-500">Know exactly what you&apos;re walking into before the clock starts.</p>
            <ul className="mt-6 space-y-3">
              {CANDIDATE_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- How it moves ---------- */}
      <section className="border-y border-gray-200 bg-[#F6F7F9]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-gray-900">How an assessment moves</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((stage) => (
              <div key={stage.n}>
                <span className="font-mono text-sm text-signal-600">{stage.n}</span>
                <h3 className="mt-2 font-medium text-gray-900">{stage.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{stage.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA band ---------- */}
      <section className="bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
          <h2 className="max-w-md font-display text-2xl font-semibold tracking-tight text-white">
            Set up your first assessment in a few minutes.
          </h2>
          <Link
            href="/register"
            className="shrink-0 rounded-lg bg-signal-500 px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-signal-600"
          >
            Create an account
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
