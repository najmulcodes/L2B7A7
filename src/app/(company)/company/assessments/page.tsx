"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { assessmentsApi } from "@/lib/api/assessments";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { Plus } from "lucide-react";
import type { AssessmentStatus } from "@/types/api";

export const dynamic = "force-dynamic";

export default function CompanyAssessmentsPage() {
  const [filters, setFilters] = useUrlFilters({ status: "", q: "", page: "1" });
  const setSearch = useDebouncedCallback((q: string) => setFilters({ q }), 400);
  const page = Number(filters.page) || 1;

  const query = useQuery({
    queryKey: ["assessments-mine", filters],
    queryFn: () =>
      assessmentsApi.list({
        status: (filters.status || undefined) as AssessmentStatus | undefined,
        q: filters.q || undefined,
        page,
        limit: 10,
        sortOrder: "desc",
      }),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
        <Link href="/company/assessments/new">
          <Button>
            <Plus className="h-4 w-4" /> New assessment
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search…" defaultValue={filters.q} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select className="max-w-[160px]" value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </div>

      <Card>
        <CardContent className="!p-0">
          {query.isLoading ? (
            <Spinner />
          ) : query.data && query.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {query.data.data.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{a.title}</p>
                      <Badge status={a.status}>{a.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {a.durationMinutes} min · Passing {a.passingScore}% · {a._count?.problems ?? 0} problems ·{" "}
                      {a._count?.invitations ?? 0} invited · {a._count?.attempts ?? 0} attempts
                    </p>
                  </div>
                  <Link href={`/company/assessments/${a.id}`}>
                    <Button size="sm" variant="outline">
                      Open
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                title="No assessments yet"
                action={
                  <Link href="/company/assessments/new">
                    <Button size="sm">
                      <Plus className="h-4 w-4" /> New assessment
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
