"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { companiesApi } from "@/lib/api/profile";
import { assessmentsApi } from "@/lib/api/assessments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { CreditCard, FileStack, Plus } from "lucide-react";

export default function CompanyDashboardPage() {
  const companyQuery = useQuery({ queryKey: ["company-me"], queryFn: () => companiesApi.me() });
  const assessmentsQuery = useQuery({
    queryKey: ["assessments-mine", { limit: 5 }],
    queryFn: () => assessmentsApi.list({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
  });

  const credits = companyQuery.data?.data.assessmentCredits;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {companyQuery.data?.data.companyName ?? "Company dashboard"}
          </h1>
          <p className="text-gray-500">Manage your problem bank, assessments, and candidates.</p>
        </div>
        <Link href="/company/assessments/new">
          <Button>
            <Plus className="h-4 w-4" /> New assessment
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-sm text-gray-500">Assessment credits</p>
              <p className="text-3xl font-bold text-gray-900">
                {companyQuery.isLoading ? "…" : credits}
              </p>
            </div>
            <CreditCard className="h-8 w-8 text-brand-500" />
          </CardContent>
          {typeof credits === "number" && credits === 0 && (
            <CardContent className="pt-0">
              <Alert variant="warning" title="You're out of credits">
                Publishing costs 1 credit.{" "}
                <Link href="/company/billing" className="font-medium underline">
                  Buy more
                </Link>
                .
              </Alert>
            </CardContent>
          )}
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="text-sm text-gray-500">Total assessments</p>
              <p className="text-3xl font-bold text-gray-900">
                {assessmentsQuery.isLoading ? "…" : assessmentsQuery.data?.meta?.total ?? 0}
              </p>
            </div>
            <FileStack className="h-8 w-8 text-brand-500" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent assessments</CardTitle>
          <Link href="/company/assessments" className="text-sm font-medium text-brand-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {assessmentsQuery.isLoading ? (
            <Spinner />
          ) : assessmentsQuery.data && assessmentsQuery.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {assessmentsQuery.data.data.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-500">
                      {a._count?.problems ?? 0} problems · {a._count?.invitations ?? 0} invitations
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge status={a.status}>{a.status}</Badge>
                    <Link href={`/company/assessments/${a.id}`}>
                      <Button size="sm" variant="outline">
                        Open
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No assessments yet" description="Create one to start inviting candidates." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
