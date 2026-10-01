"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { invitationsApi } from "@/lib/api/invitations";
import { attemptsApi } from "@/lib/api/attempts";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Inbox, ListChecks } from "lucide-react";

export default function CandidateDashboardPage() {
  const { user } = useAuth();

  const invitationsQuery = useQuery({
    queryKey: ["invitations-mine", { status: "PENDING" }],
    queryFn: () => invitationsApi.listMine({ status: "PENDING", limit: 5 }),
  });

  const attemptsQuery = useQuery({
    queryKey: ["attempts-mine"],
    queryFn: () => attemptsApi.listMine({ limit: 5 }),
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-gray-500">Here&apos;s what needs your attention.</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending invitations</CardTitle>
          <Link href="/candidate/invitations" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {invitationsQuery.isLoading ? (
            <Spinner />
          ) : invitationsQuery.data && invitationsQuery.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {invitationsQuery.data.data.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{inv.assessment?.title}</p>
                    <p className="text-sm text-gray-500">
                      {inv.assessment?.company.companyName} · Expires {formatDate(inv.expiresAt)}
                    </p>
                  </div>
                  <Link href="/candidate/invitations">
                    <Button size="sm" variant="outline">
                      Respond
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={<Inbox className="h-8 w-8 text-gray-300" />} title="No pending invitations" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent attempts</CardTitle>
        </CardHeader>
        <CardContent>
          {attemptsQuery.isLoading ? (
            <Spinner />
          ) : attemptsQuery.data && attemptsQuery.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {attemptsQuery.data.data.map((attempt) => (
                <li key={attempt.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{attempt.assessment?.title}</p>
                    <p className="text-sm text-gray-500">Started {formatDate(attempt.startedAt)}</p>
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
            <EmptyState icon={<ListChecks className="h-8 w-8 text-gray-300" />} title="No attempts yet" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
