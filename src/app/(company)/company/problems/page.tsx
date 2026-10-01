"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api/problems";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { Plus, Trash2, Pencil } from "lucide-react";
import type { Difficulty, ProblemType } from "@/types/api";

// This page's filters/search/pagination live in the URL (useUrlFilters
// below), which requires dynamic rendering rather than static prerendering.
export const dynamic = "force-dynamic";

export default function CompanyProblemsPage() {
  const [filters, setFilters] = useUrlFilters({ type: "", difficulty: "", q: "", page: "1" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const page = Number(filters.page) || 1;

  const setSearch = useDebouncedCallback((q: string) => setFilters({ q }), 400);

  const query = useQuery({
    queryKey: ["problems", filters],
    queryFn: () =>
      problemsApi.list({
        type: (filters.type || undefined) as ProblemType | undefined,
        difficulty: (filters.difficulty || undefined) as Difficulty | undefined,
        q: filters.q || undefined,
        page,
        limit: 10,
      }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => problemsApi.remove(id),
    onSuccess: () => {
      toast("Problem deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not delete problem", "error"),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Problem bank</h1>
        <Link href="/company/problems/new">
          <Button>
            <Plus className="h-4 w-4" /> New problem
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search title or description…"
          defaultValue={filters.q}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select className="max-w-[160px]" value={filters.type} onChange={(e) => setFilters({ type: e.target.value })}>
          <option value="">All types</option>
          <option value="MCQ">MCQ</option>
          <option value="CODING">Coding</option>
          <option value="WRITTEN">Written</option>
        </Select>
        <Select
          className="max-w-[160px]"
          value={filters.difficulty}
          onChange={(e) => setFilters({ difficulty: e.target.value })}
        >
          <option value="">All difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </Select>
      </div>

      <Card>
        <CardContent className="!p-0">
          {query.isLoading ? (
            <Spinner />
          ) : query.data && query.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {query.data.data.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{p.title}</p>
                      <Badge>{p.type}</Badge>
                      <Badge>{p.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{p.points} pts{p.tags.length > 0 && ` · ${p.tags.join(", ")}`}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/company/problems/${p.id}`}>
                      <Button size="sm" variant="outline">
                        <Pencil className="h-4 w-4" /> Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      isLoading={remove.isPending && remove.variables === p.id}
                      onClick={() => {
                        if (confirm(`Delete "${p.title}"?`)) remove.mutate(p.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No problems yet"
                description="Add multiple-choice, coding, or written problems to your bank so you can attach them to assessments."
                action={
                  <Link href="/company/problems/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4" /> New problem
                    </Button>
                  </Link>
                }
              />
            </div>
          )}
          <Pagination meta={query.data?.meta} onPageChange={(p) => setFilters({ page: String(p) })} />
        </CardContent>
      </Card>
    </div>
  );
}
