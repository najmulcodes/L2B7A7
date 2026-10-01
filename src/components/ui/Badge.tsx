import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: string;
}

export function Badge({ className, status, children, ...props }: BadgeProps) {
  const colorClass = status ? STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700" : "bg-gray-100 text-gray-700";
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", colorClass, className)}
      {...props}
    >
      {children}
    </span>
  );
}
