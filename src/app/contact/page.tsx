import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Mail, MessageSquare, Building2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — CodeRank",
  description: "Get in touch about a company account, a candidate issue, or anything else.",
};

const CHANNELS = [
  {
    icon: Building2,
    title: "Setting up a company account",
    body: "Questions about credits, publishing, or inviting candidates.",
    email: "sales@coderank.example",
  },
  {
    icon: MessageSquare,
    title: "Candidate support",
    body: "Trouble with an invitation, an attempt, or your results.",
    email: "support@coderank.example",
  },
  {
    icon: Mail,
    title: "Everything else",
    body: "Press, partnerships, or anything that doesn't fit above.",
    email: "hello@coderank.example",
  },
];

// A contact form with no backend endpoint to receive it would just be a
// fake success message — this platform's API has no /contact route. A
// plain mailto: link is the honest version: it actually opens the
// visitor's own email client with a real address, instead of pretending
// to submit somewhere.
export default function ContactPage() {
  return (
    <div className="bg-white">
      <MarketingNav />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Get in touch</h1>
        <p className="mt-4 text-lg text-gray-600">Pick the address that fits what you need — we read all three.</p>

        <div className="mt-12 space-y-4">
          {CHANNELS.map((c) => (
            <a
              key={c.email}
              href={`mailto:${c.email}`}
              className="flex items-start gap-4 rounded-xl border border-gray-200 p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <c.icon className="mt-0.5 h-6 w-6 shrink-0 text-brand-600" />
              <div>
                <p className="font-medium text-gray-900">{c.title}</p>
                <p className="mt-1 text-sm text-gray-500">{c.body}</p>
                <p className="mt-1 text-sm font-medium text-brand-600">{c.email}</p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
