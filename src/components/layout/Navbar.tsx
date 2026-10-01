"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavLink {
  href: string;
  label: string;
}

const LINKS_BY_ROLE: Record<string, NavLink[]> = {
  CANDIDATE: [
    { href: "/candidate/dashboard", label: "Dashboard" },
    { href: "/candidate/invitations", label: "Invitations" },
    { href: "/candidate/results", label: "Results" },
    { href: "/candidate/profile", label: "Profile" },
  ],
  COMPANY: [
    { href: "/company/dashboard", label: "Dashboard" },
    { href: "/company/problems", label: "Problem Bank" },
    { href: "/company/assessments", label: "Assessments" },
    { href: "/company/billing", label: "Billing" },
    { href: "/company/profile", label: "Company" },
  ],
  ADMIN: [
    { href: "/admin/dashboard", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/audit-logs", label: "Audit Log" },
  ],
};

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  if (!user) return null;

  const links = LINKS_BY_ROLE[user.role] ?? [];

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-brand-700">
            CodeRank
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  pathname.startsWith(link.href) && "bg-brand-50 text-brand-700 hover:bg-brand-50",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-sm text-gray-600 sm:flex">
            <UserIcon className="h-4 w-4" />
            <span>{user.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => logout()}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-1.5 sm:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-md px-3 py-1 text-sm font-medium text-gray-600",
              pathname.startsWith(link.href) && "bg-brand-50 text-brand-700",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
