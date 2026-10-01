"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { attemptsApi } from "@/lib/api/attempts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { ApiClientError } from "@/lib/api-client";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function AttemptReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["attempt-report", id],
    queryFn: () => attemptsApi.report(id),
  });

  if (query.isLoading) return <Spinner label="Loading report…" />;

  if (query.isError) {
    const err = query.error;
    const message =
      err instanceof ApiClientError
        ? err.status === 409
          ? "This attempt hasn't been submitted yet, so there's no report."
          : err.message
        : "Could not load this report.";
    return (
      <div className="space-y-4">
        <Alert variant="warning" title="Report unavailable">
          {message}
        </Alert>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
    );
  }

  const report = query.data!.data;
  const percent = report.maxScore ? Math.round(((report.totalScore ?? 0) / report.maxScore) * 100) : null;
  const pending = report.status === "SUBMITTED";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{report.assessment.title}</CardTitle>
            <p className="text-sm text-gray-500">Submitted {formatDate(report.submittedAt)}</p>
          </div>
          <Badge status={report.status}>{report.status}</Badge>
        </CardHeader>
        <CardContent>
          {pending ? (
            <Alert variant="info">
              Some questions require manual review. Your final score will appear here once the company finishes
              evaluating your submission.
            </Alert>
          ) : (
            <div className="flex items-center gap-4">
              {report.passed ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {report.totalScore} / {report.maxScore} {percent !== null && <span className="text-gray-400">({percent}%)</span>}
                </p>
                <p className={`text-sm font-medium ${report.passed ? "text-emerald-600" : "text-red-600"}`}>
                  {report.passed ? "Passed" : "Did not pass"} · Passing score {report.assessment.passingScore}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Question breakdown</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          <ul className="divide-y divide-gray-100">
            {report.breakdown.map((item) => (
              <li key={item.problemId} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.problemTitle}</p>
                    <p className="text-xs text-gray-500">{item.type}</p>
                  </div>
                  <div className="text-right">
                    {item.status === "PENDING" ? (
                      <Badge status="PENDING">Awaiting review</Badge>
                    ) : (
                      <p className="font-semibold text-gray-900">
                        {item.score ?? 0} / {item.maxPoints}
                      </p>
                    )}
                  </div>
                </div>
                {item.feedback && <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{item.feedback}</p>}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
