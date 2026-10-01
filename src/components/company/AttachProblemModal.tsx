"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api/problems";
import { assessmentsApi } from "@/lib/api/assessments";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import type { AssessmentProblemLink } from "@/types/api";

export function AttachProblemModal({
  open,
  onClose,
  assessmentId,
  alreadyAttached,
}: {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
  alreadyAttached: AssessmentProblemLink[];
}) {
  const [q, setQ] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["problems-for-attach", q],
    queryFn: () => problemsApi.list({ q: q || undefined, limit: 20 }),
    enabled: open,
  });

  const attach = useMutation({
    mutationFn: (problemId: string) => assessmentsApi.attachProblem(assessmentId, { problemId }),
    onSuccess: () => {
      toast("Problem attached", "success");
      queryClient.invalidateQueries({ queryKey: ["assessment", assessmentId] });
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not attach problem", "error"),
  });

  const attachedIds = new Set(alreadyAttached.map((l) => l.problemId));

  return (
    <Modal open={open} onClose={onClose} title="Attach a problem">
      <div className="space-y-3">
        <Input placeholder="Search your problem bank…" value={q} onChange={(e) => setQ(e.target.value)} />
        {query.isLoading ? (
          <Spinner />
        ) : (
          <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
            {(query.data?.data ?? []).map((p) => {
              const isAttached = attachedIds.has(p.id);
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">{p.title}</p>
                      <Badge>{p.type}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{p.points} pts · {p.difficulty}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAttached}
                    isLoading={attach.isPending && attach.variables === p.id}
                    onClick={() => attach.mutate(p.id)}
                  >
                    {isAttached ? "Attached" : "Attach"}
                  </Button>
                </li>
              );
            })}
            {query.data?.data.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">No problems match your search.</p>
            )}
          </ul>
        )}
      </div>
    </Modal>
  );
}
