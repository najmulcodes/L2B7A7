"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";
import type { AssessmentStatus } from "@/types/api";

export default function CompanyAssessmentsPage() {
  const [status, setStatus] = useState<AssessmentStatus | "">("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["assessments-mine", { status, q, page }],
    queryFn: () =>
      assessmentsApi.list({ status: status || undefined, q: q || undefined, page, limit: 10, sortOrder: "desc" }),
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
        <Input
          placeholder="Search…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          className="max-w-[160px]"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as AssessmentStatus | "");
            setPage(1);
          }}
        >
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
          <Pagination meta={query.data?.meta} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
