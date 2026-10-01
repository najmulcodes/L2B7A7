"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invitationsApi } from "@/lib/api/invitations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { Inbox } from "lucide-react";
import type { InvitationStatus } from "@/types/api";

export const dynamic = "force-dynamic";

const STATUS_OPTIONS: Array<{ value: InvitationStatus | ""; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
  { value: "EXPIRED", label: "Expired" },
];

export default function CandidateInvitationsPage() {
  const [filters, setFilters] = useUrlFilters({ status: "", page: "1" });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const page = Number(filters.page) || 1;

  const query = useQuery({
    queryKey: ["invitations-mine", filters],
    queryFn: () => invitationsApi.listMine({ status: (filters.status || undefined) as InvitationStatus | undefined, page, limit: 10 }),
  });

  const accept = useMutation({
    mutationFn: (id: string) => invitationsApi.accept(id),
    onSuccess: (result) => {
      toast("Invitation accepted — your attempt has started.", "success");
      queryClient.invalidateQueries({ queryKey: ["invitations-mine"] });
      router.push(`/candidate/attempts/${result.data.id}`);
    },
    onError: (err) => {
      toast(err instanceof ApiClientError ? err.message : "Could not accept invitation", "error");
    },
  });

  const decline = useMutation({
    mutationFn: (id: string) => invitationsApi.decline(id),
    onSuccess: () => {
      toast("Invitation declined", "success");
      queryClient.invalidateQueries({ queryKey: ["invitations-mine"] });
    },
    onError: (err) => {
      toast(err instanceof ApiClientError ? err.message : "Could not decline invitation", "error");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
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
        <CardHeader>
          <CardTitle>Your invitations</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          {query.isLoading ? (
            <Spinner />
          ) : query.data && query.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {query.data.data.map((inv) => (
                <li key={inv.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{inv.assessment?.title}</p>
                      <Badge status={inv.status}>{inv.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {inv.assessment?.company.companyName} · {inv.assessment?.durationMinutes} min · Passing score{" "}
                      {inv.assessment?.passingScore}% · Expires {formatDate(inv.expiresAt)}
                    </p>
                  </div>
                  {inv.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={decline.isPending && decline.variables === inv.id}
                        onClick={() => decline.mutate(inv.id)}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        isLoading={accept.isPending && accept.variables === inv.id}
                        onClick={() => accept.mutate(inv.id)}
                      >
                        Accept &amp; start
                      </Button>
                    </div>
                  )}
                  {inv.status === "ACCEPTED" && (
                    <Badge status="IN_PROGRESS">Attempt in progress — check dashboard</Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState icon={<Inbox className="h-8 w-8 text-gray-300" />} title="No invitations here" />
            </div>
          )}
          <Pagination meta={query.data?.meta} onPageChange={(p) => setFilters({ page: String(p) })} />
        </CardContent>
      </Card>
    </div>
  );
}
