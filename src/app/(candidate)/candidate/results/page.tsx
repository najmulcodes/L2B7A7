"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { attemptsApi } from "@/lib/api/attempts";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { formatDate } from "@/lib/utils";
import { ListChecks } from "lucide-react";
import type { AttemptStatus } from "@/types/api";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: Array<{ value: AttemptStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "SUBMITTED", label: "Awaiting review" },
  { value: "EVALUATED", label: "Evaluated" },
  { value: "EXPIRED", label: "Expired" },
];

export default function CandidateResultsPage() {
  const [filters, setFilters] = useUrlFilters({ status: "", page: "1" });
  const page = Number(filters.page) || 1;

  const query = useQuery({
    queryKey: ["attempts-mine-all", filters],
    queryFn: () => attemptsApi.listMine({ status: (filters.status || undefined) as AttemptStatus | undefined, page, limit: 10 }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your results</h1>
          <p className="text-gray-500">Every assessment attempt you&apos;ve started, in one place.</p>
        </div>
        <div className="w-48">
          <Select value={filters.status} onChange={(e) => setFilters({ status: e.target.value })}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="!p-0">
          {query.isLoading ? (
            <Spinner />
          ) : query.data && query.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {query.data.data.map((attempt) => (
                <li key={attempt.id} className="flex items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{attempt.assessment?.title}</p>
                    <p className="text-sm text-gray-500">
                      Started {formatDate(attempt.startedAt)}
                      {attempt.totalScore !== null && ` · ${attempt.totalScore}/${attempt.maxScore} pts`}
                      {attempt.passed !== null && (
                        <span className={attempt.passed ? "ml-1 text-emerald-600" : "ml-1 text-red-600"}>
                          · {attempt.passed ? "Passed" : "Did not pass"}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={attempt.status}>{attempt.status.replace("_", " ")}</Badge>
                    <Link
                      href={
                        attempt.status === "IN_PROGRESS"
                          ? `/candidate/attempts/${attempt.id}`
                          : `/candidate/attempts/${attempt.id}/report`
                      }
                    >
                      <Button size="sm" variant="outline">
                        {attempt.status === "IN_PROGRESS" ? "Continue" : "View report"}
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState icon={<ListChecks className="h-8 w-8 text-gray-300" />} title="No attempts yet" />
            </div>
          )}
          <Pagination meta={query.data?.meta} onPageChange={(p) => setFilters({ page: String(p) })} />
        </CardContent>
      </Card>
    </div>
  );
}
