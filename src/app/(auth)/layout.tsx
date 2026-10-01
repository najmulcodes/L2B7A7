import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

// login/page.tsx and register/page.tsx are both "use client" (they need
// react-hook-form and live auth state), and metadata can only be exported
// from a Server Component — so it lives here in the shared layout instead.
export const metadata: Metadata = {
  title: "Log in or sign up — CodeRank",
  description: "Access your CodeRank candidate, company, or admin account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="mb-8">
        <Logo size="lg" />
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
