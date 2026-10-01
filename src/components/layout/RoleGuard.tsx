"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";
import type { Role } from "@/types/api";

const ROLE_HOME: Record<Role, string> = {
  CANDIDATE: "/candidate/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

/**
 * Client-side authorization gate. The middleware (src/middleware.ts) already
 * does a cheap cookie-based redirect for UX, but that cookie isn't a
 * credential — this is the real check, driven by GET /users/me, which is
 * itself just a UI convenience: the backend enforces role/ownership on every
 * request regardless of what this component allows through.
 */
export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== role) {
      router.replace(ROLE_HOME[user.role] ?? "/login");
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user || user.role !== role) {
    return <Spinner label="Checking your session…" />;
  }

  return <>{children}</>;
}
