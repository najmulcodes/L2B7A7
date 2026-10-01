import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatCents(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}

export const ROLE_LABELS: Record<string, string> = {
  CANDIDATE: "Candidate",
  COMPANY: "Company",
  ADMIN: "Admin",
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  DECLINED: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  SUBMITTED: "bg-amber-100 text-amber-700",
  EVALUATED: "bg-emerald-100 text-emerald-700",
  AUTO_EVALUATED: "bg-emerald-100 text-emerald-700",
  MANUALLY_EVALUATED: "bg-emerald-100 text-emerald-700",
  SUCCESS: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};
