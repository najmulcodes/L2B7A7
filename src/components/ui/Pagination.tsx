import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PaginationMeta } from "@/types/api";

export function Pagination({ meta, onPageChange }: { meta?: PaginationMeta; onPageChange: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
      <p className="text-sm text-gray-500">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
