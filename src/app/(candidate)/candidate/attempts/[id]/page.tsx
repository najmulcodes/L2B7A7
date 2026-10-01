"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { attemptsApi } from "@/lib/api/attempts";
import { ProblemAnswer } from "@/components/candidate/ProblemAnswer";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useCountdown } from "@/hooks/useCountdown";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { Clock } from "lucide-react";

export default function AttemptTakingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expiredLocally, setExpiredLocally] = useState(false);

  const query = useQuery({
    queryKey: ["attempt", id],
    queryFn: () => attemptsApi.getById(id),
    refetchInterval: 30_000,
  });

  const attempt = query.data?.data;
  const { label, isExpired } = useCountdown(attempt?.deadlineAt);
  const locked = isExpired || expiredLocally || attempt?.status !== "IN_PROGRESS";

  const finalize = useMutation({
    mutationFn: () => attemptsApi.finalize(id),
    onSuccess: () => {
      toast("Attempt submitted successfully.", "success");
      queryClient.invalidateQueries({ queryKey: ["attempts-mine"] });
      router.push(`/candidate/attempts/${id}/report`);
    },
    onError: (err) => {
      toast(err instanceof ApiClientError ? err.message : "Could not submit attempt", "error");
      setConfirmOpen(false);
      query.refetch();
    },
  });

  if (query.isLoading) return <Spinner label="Loading attempt…" />;

  if (query.isError || !attempt) {
    return <Alert variant="error" title="Attempt not found">You may not have access to this attempt.</Alert>;
  }

  if (attempt.status !== "IN_PROGRESS") {
    return (
      <div className="space-y-4">
        <Alert variant="info" title={`This attempt is ${attempt.status.toLowerCase()}`}>
          You can no longer edit answers.
        </Alert>
        <Button onClick={() => router.push(`/candidate/attempts/${id}/report`)}>View report</Button>
      </div>
    );
  }

  const links = (attempt.assessment?.problems ?? []).slice().sort((a, b) => a.order - b.order);
  const submissionsByProblem = new Map((attempt.submissions ?? []).map((s) => [s.problemId, s]));

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{attempt.assessment?.title}</h1>
          <p className="text-sm text-gray-500">Answers save automatically as you type.</p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ${
            isExpired ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700"
          }`}
        >
          <Clock className="h-4 w-4" />
          {isExpired ? "Time's up" : label}
        </div>
      </div>

      {isExpired && (
        <Alert variant="warning" title="Time is up">
          Your deadline has passed. Any further edits may be rejected by the server — submit now if you haven&apos;t
          already, or refresh to see the final status.
        </Alert>
      )}

      {links.map((link, i) => (
        <ProblemAnswer
          key={link.id}
          attemptId={id}
          link={link}
          index={i}
          existing={submissionsByProblem.get(link.problemId)}
          disabled={locked}
          onExpired={() => setExpiredLocally(true)}
        />
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => setConfirmOpen(true)} disabled={locked}>
          Submit attempt
        </Button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Submit this attempt?">
        <p className="text-sm text-gray-600">
          Once submitted you won&apos;t be able to change your answers. Multiple-choice questions are scored
          immediately; written and coding answers will be reviewed by the company.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Keep working
          </Button>
          <Button isLoading={finalize.isPending} onClick={() => finalize.mutate()}>
            Yes, submit
          </Button>
        </div>
      </Modal>
    </div>
  );
}
