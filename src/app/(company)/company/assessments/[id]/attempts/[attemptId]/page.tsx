"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { attemptsApi } from "@/lib/api/attempts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

export default function CompanyAttemptReviewPage() {
  const { attemptId } = useParams<{ id: string; attemptId: string }>();
  const router = useRouter();

  const query = useQuery({ queryKey: ["attempt", attemptId], queryFn: () => attemptsApi.getById(attemptId) });

  if (query.isLoading) return <Spinner label="Loading attempt…" />;
  if (query.isError || !query.data) return <Alert variant="error">Attempt not found.</Alert>;

  const attempt = query.data.data;
  const submissions = attempt.submissions ?? [];

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{attempt.candidate?.name}</CardTitle>
            <p className="text-sm text-gray-500">{attempt.candidate?.email}</p>
          </div>
          <Badge status={attempt.status}>{attempt.status.replace("_", " ")}</Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {attempt.totalScore !== null ? `Score: ${attempt.totalScore} / ${attempt.maxScore}` : "Not fully scored yet"}
            {attempt.passed !== null && (
              <span className={attempt.passed ? "ml-2 text-emerald-600" : "ml-2 text-red-600"}>
                {attempt.passed ? "Passed" : "Did not pass"}
              </span>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          <ul className="divide-y divide-gray-100">
            {submissions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.problem?.title ?? s.problemId}</p>
                  <p className="text-xs text-gray-500">
                    {s.problem?.type} {s.score !== null && `· ${s.score} pts`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={s.status}>{s.status.replace("_", " ")}</Badge>
                  {s.problem?.type !== "MCQ" && (
                    <Link href={`/company/submissions/${s.id}`}>
                      <Button size="sm" variant="outline">
                        {s.status === "PENDING" ? "Evaluate" : "View"}
                      </Button>
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
