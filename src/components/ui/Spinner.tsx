import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, label = "Loading…" }: { className?: string; label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
      <Loader2 className={cn("h-5 w-5 animate-spin", className)} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
