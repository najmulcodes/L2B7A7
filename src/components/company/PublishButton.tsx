"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assessmentsApi } from "@/lib/api/assessments";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { Rocket } from "lucide-react";

export function PublishButton({ assessmentId, disabled }: { assessmentId: string; disabled?: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [noCredits, setNoCredits] = useState(false);
  const [noProblems, setNoProblems] = useState(false);

  const publish = useMutation({
    mutationFn: () => assessmentsApi.publish(assessmentId),
    onMutate: () => {
      setNoCredits(false);
      setNoProblems(false);
    },
    onSuccess: () => {
      toast("Assessment published — you can now invite candidates.", "success");
      queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["company-me"] });
    },
    onError: (err) => {
      if (err instanceof ApiClientError && err.status === 403) {
        setNoCredits(true);
        return;
      }
      if (err instanceof ApiClientError && err.status === 400) {
        setNoProblems(true);
        return;
      }
      toast(err instanceof ApiClientError ? err.message : "Could not publish assessment", "error");
    },
  });

  return (
    <div className="space-y-3">
      {noCredits && (
        <Alert
          variant="warning"
          title="No assessment credits remaining"
          action={
            <Link href="/company/billing">
              <Button size="sm">Buy credits</Button>
            </Link>
          }
        >
          Publishing spends 1 credit. Purchase more to continue.
        </Alert>
      )}
      {noProblems && <Alert variant="warning">Attach at least one problem before publishing.</Alert>}
      <Button onClick={() => publish.mutate()} isLoading={publish.isPending} disabled={disabled}>
        <Rocket className="h-4 w-4" /> Publish assessment
      </Button>
    </div>
  );
}
