"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invitationsApi } from "@/lib/api/invitations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";

export function InviteCandidateForm({ assessmentId }: { assessmentId: string }) {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invite = useMutation({
    mutationFn: () => invitationsApi.createForAssessment(assessmentId, { candidateEmail: email }),
    onSuccess: () => {
      toast(`Invited ${email}`, "success");
      setEmail("");
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["invitations-for-assessment", assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["assessments-mine"] });
    },
    onError: (err) => {
      setFormError(err instanceof ApiClientError ? err.message : "Could not send invitation");
    },
  });

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        invite.mutate();
      }}
    >
      {formError && <Alert variant="error">{formError}</Alert>}
      <div className="flex gap-2">
        <Input
          type="email"
          required
          placeholder="candidate@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" isLoading={invite.isPending}>
          Invite
        </Button>
      </div>
      <p className="text-xs text-gray-400">
        The candidate must already have a CodeRank candidate account with this email.
      </p>
    </form>
  );
}
