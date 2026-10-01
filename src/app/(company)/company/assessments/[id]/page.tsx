"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assessmentsApi } from "@/lib/api/assessments";
import { invitationsApi } from "@/lib/api/invitations";
import { attemptsApi } from "@/lib/api/attempts";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { PublishButton } from "@/components/company/PublishButton";
import { AttachProblemModal } from "@/components/company/AttachProblemModal";
import { InviteCandidateForm } from "@/components/company/InviteCandidateForm";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

export default function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [attachOpen, setAttachOpen] = useState(false);

  const query = useQuery({ queryKey: ["assessment", id], queryFn: () => assessmentsApi.getById(id) });
  const invitationsQuery = useQuery({
    queryKey: ["invitations-for-assessment", id],
    queryFn: () => invitationsApi.listForAssessment(id, { limit: 20 }),
  });
  const attemptsQuery = useQuery({
    queryKey: ["attempts-for-assessment", id],
    queryFn: () => attemptsApi.listForAssessment(id, { limit: 20 }),
  });

  const detach = useMutation({
    mutationFn: (problemId: string) => assessmentsApi.detachProblem(id, problemId),
    onSuccess: () => {
      toast("Problem removed", "success");
      queryClient.invalidateQueries({ queryKey: ["assessment", id] });
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not remove problem", "error"),
  });

  const remove = useMutation({
    mutationFn: () => assessmentsApi.remove(id),
    onSuccess: () => {
      toast("Assessment deleted", "success");
      router.push("/company/assessments");
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not delete assessment", "error"),
  });

  if (query.isLoading) return <Spinner label="Loading assessment…" />;
  if (query.isError || !query.data) return <Alert variant="error">Assessment not found.</Alert>;

  const assessment = query.data.data;
  const isDraft = assessment.status === "DRAFT";
  const problems = assessment.problems ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/company/assessments")}>
        <ArrowLeft className="h-4 w-4" /> All assessments
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{assessment.title}</CardTitle>
            <p className="text-sm text-gray-500">
              {assessment.durationMinutes} min · Passing score {assessment.passingScore}%
            </p>
          </div>
          <Badge status={assessment.status}>{assessment.status}</Badge>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-gray-700">{assessment.description}</p>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          {isDraft ? (
            <PublishButton assessmentId={id} disabled={problems.length === 0} />
          ) : (
            <p className="text-sm text-gray-400">Only draft assessments can be published or edited.</p>
          )}
          {isDraft && (
            <Button
              variant="outline"
              onClick={() => {
                if (confirm("Delete this draft assessment?")) remove.mutate();
              }}
              isLoading={remove.isPending}
            >
              <Trash2 className="h-4 w-4" /> Delete draft
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Problems ({problems.length})</CardTitle>
          {isDraft && (
            <Button size="sm" onClick={() => setAttachOpen(true)}>
              <Plus className="h-4 w-4" /> Attach problem
            </Button>
          )}
        </CardHeader>
        <CardContent className="!p-0">
          {problems.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {problems
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((link) => (
                  <li key={link.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{link.problem?.title}</p>
                        <Badge>{link.problem?.type}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{link.pointsOverride ?? link.problem?.points} pts</p>
                    </div>
                    {isDraft && (
                      <Button
                        size="sm"
                        variant="ghost"
                        isLoading={detach.isPending && detach.variables === link.problemId}
                        onClick={() => detach.mutate(link.problemId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </li>
                ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState title="No problems attached yet" />
            </div>
          )}
        </CardContent>
      </Card>

      {!isDraft && (
        <Card>
          <CardHeader>
            <CardTitle>Invite a candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteCandidateForm assessmentId={id} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          {invitationsQuery.isLoading ? (
            <Spinner />
          ) : invitationsQuery.data && invitationsQuery.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {invitationsQuery.data.data.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.candidate?.name}</p>
                    <p className="text-xs text-gray-500">
                      {inv.candidate?.email} · Expires {formatDate(inv.expiresAt)}
                    </p>
                  </div>
                  <Badge status={inv.status}>{inv.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState title="No invitations sent yet" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attempts</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          {attemptsQuery.isLoading ? (
            <Spinner />
          ) : attemptsQuery.data && attemptsQuery.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {attemptsQuery.data.data.map((attempt) => (
                <li key={attempt.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{attempt.candidate?.name}</p>
                    <p className="text-xs text-gray-500">
                      {attempt.candidate?.email} ·{" "}
                      {attempt.totalScore !== null ? `${attempt.totalScore}/${attempt.maxScore}` : "Not scored yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={attempt.status}>{attempt.status.replace("_", " ")}</Badge>
                    {(attempt.status === "SUBMITTED" || attempt.status === "EVALUATED") && (
                      <Link href={`/company/assessments/${id}/attempts/${attempt.id}`}>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState title="No attempts yet" />
            </div>
          )}
        </CardContent>
      </Card>

      <AttachProblemModal
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        assessmentId={id}
        alreadyAttached={problems}
      />
    </div>
  );
}
