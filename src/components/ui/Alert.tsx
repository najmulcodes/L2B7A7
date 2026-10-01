import type { ReactNode } from "react";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "info" | "warning" | "error" | "success";

const STYLES: Record<Variant, string> = {
  info: "border-brand-200 bg-brand-50 text-brand-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const ICONS: Record<Variant, ReactNode> = {
  info: <Info className="h-4 w-4 shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 shrink-0" />,
  error: <XCircle className="h-4 w-4 shrink-0" />,
  success: <CheckCircle2 className="h-4 w-4 shrink-0" />,
};

export function Alert({
  variant = "info",
  title,
  children,
  action,
}: {
  variant?: Variant;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border p-3 text-sm", STYLES[variant])}>
      {ICONS[variant]}
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-0.5")}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
