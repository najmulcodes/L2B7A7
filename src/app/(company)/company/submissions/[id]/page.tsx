"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { submissionsApi } from "@/lib/api/submissions";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { ArrowLeft } from "lucide-react";

export default function EvaluateSubmissionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({ queryKey: ["submission", id], queryFn: () => submissionsApi.getById(id) });
  const submission = query.data?.data;
  const maxPoints = submission?.problem?.points ?? 0;

  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (submission) {
      setScore(submission.score ?? 0);
      setFeedback(submission.feedback ?? "");
    }
  }, [submission]);

  const evaluate = useMutation({
    mutationFn: () => submissionsApi.evaluate(id, { score, feedback: feedback || undefined }),
    onSuccess: () => {
      toast("Submission evaluated", "success");
      queryClient.invalidateQueries({ queryKey: ["submission", id] });
      queryClient.invalidateQueries({ queryKey: ["attempt"] });
      router.back();
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not evaluate submission", "error"),
  });

  if (query.isLoading) return <Spinner label="Loading submission…" />;
  if (query.isError || !submission) return <Alert variant="error">Submission not found.</Alert>;

  const alreadyEvaluated = submission.status !== "PENDING";

  return (
    <div className="max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{submission.problem?.title}</CardTitle>
          <Badge status={submission.status}>{submission.status.replace("_", " ")}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm text-gray-700">{submission.problem?.description}</p>

          {submission.problem?.type === "CODING" && (
            <div>
              <Label>Candidate&apos;s code {submission.language && `(${submission.language})`}</Label>
              <pre className="max-h-96 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100">
                {submission.code || "— no code submitted —"}
              </pre>
              {submission.problem.testCases && submission.problem.testCases.length > 0 && (
                <div className="mt-3">
                  <Label>Test cases</Label>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {submission.problem.testCases.map((tc, i) => (
                      <li key={i} className="rounded bg-gray-50 p-2">
                        <span className="font-medium">Input:</span> {tc.input} —{" "}
                        <span className="font-medium">Expected:</span> {tc.expectedOutput}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {submission.problem?.type === "WRITTEN" && (
            <div>
              <Label>Candidate&apos;s answer</Label>
              <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
                {submission.answerText || "— no answer submitted —"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{alreadyEvaluated ? "Evaluation" : "Evaluate this submission"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Score (out of {maxPoints})</Label>
            <Input
              type="number"
              min={0}
              max={maxPoints}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Feedback (optional)</Label>
            <Textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button isLoading={evaluate.isPending} onClick={() => evaluate.mutate()}>
            {alreadyEvaluated ? "Update evaluation" : "Submit evaluation"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
