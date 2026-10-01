"use client";

import { useState } from "react";
import { Shield, User, Building2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import type { Role } from "@/types/api";

// Real demo accounts, configured per deployment via env vars — never
// hardcoded credentials in source. Seed these three users (one per role)
// on your backend, then set the matching NEXT_PUBLIC_DEMO_* vars. See
// .env.example. A role with no configured demo account simply shows a
// disabled button instead of silently failing.
const DEMO_ACCOUNTS: Array<{
  role: Role;
  label: string;
  icon: typeof Shield;
  email?: string;
  password?: string;
}> = [
  {
    role: "ADMIN",
    label: "Admin",
    icon: Shield,
    email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD,
  },
  {
    role: "CANDIDATE",
    label: "Candidate",
    icon: User,
    email: process.env.NEXT_PUBLIC_DEMO_CANDIDATE_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_CANDIDATE_PASSWORD,
  },
  {
    role: "COMPANY",
    label: "Company",
    icon: Building2,
    email: process.env.NEXT_PUBLIC_DEMO_COMPANY_EMAIL,
    password: process.env.NEXT_PUBLIC_DEMO_COMPANY_PASSWORD,
  },
];

const ROLE_HOME: Record<Role, string> = {
  CANDIDATE: "/candidate/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

export function DemoLoginButtons({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<Role | null>(null);

  const handleDemoLogin = async (account: (typeof DEMO_ACCOUNTS)[number]) => {
    if (!account.email || !account.password) return;
    setPending(account.role);
    try {
      const user = await login({ email: account.email, password: account.password });
      onNavigate(ROLE_HOME[user.role] ?? "/");
    } catch (err) {
      toast(err instanceof ApiClientError ? err.message : "Demo login failed", "error");
    } finally {
      setPending(null);
    }
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">🚀 Quick demo login</div>
      <div className="grid grid-cols-2 gap-2">
        {DEMO_ACCOUNTS.slice(0, 2).map((account) => (
          <DemoButton key={account.role} account={account} pending={pending} onClick={handleDemoLogin} />
        ))}
      </div>
      <div className="mt-2">
        <DemoButton account={DEMO_ACCOUNTS[2]} pending={pending} onClick={handleDemoLogin} full />
      </div>
    </div>
  );
}

function DemoButton({
  account,
  pending,
  onClick,
  full,
}: {
  account: (typeof DEMO_ACCOUNTS)[number];
  pending: Role | null;
  onClick: (account: (typeof DEMO_ACCOUNTS)[number]) => void;
  full?: boolean;
}) {
  const Icon = account.icon;
  const configured = Boolean(account.email && account.password);
  return (
    <button
      type="button"
      disabled={!configured || pending !== null}
      onClick={() => onClick(account)}
      title={configured ? undefined : "Set the matching NEXT_PUBLIC_DEMO_* env vars to enable this button"}
      className={`flex ${full ? "w-full" : ""} flex-col items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-transparent`}
    >
      <Icon className="h-5 w-5 text-brand-600" />
      {pending === account.role ? "Signing in…" : `${account.label} demo`}
    </button>
  );
}
