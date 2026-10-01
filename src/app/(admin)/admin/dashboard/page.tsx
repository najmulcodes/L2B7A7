"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { StatsChart } from "@/components/admin/StatsChart";
import { formatCents } from "@/lib/utils";
import { Users, Building2, FileStack, ClipboardCheck, CreditCard } from "lucide-react";

export default function AdminDashboardPage() {
  const query = useQuery({ queryKey: ["admin-dashboard-stats"], queryFn: () => adminApi.dashboardStats() });

  if (query.isLoading) return <Spinner label="Loading platform stats…" />;
  if (!query.data) return null;

  const stats = query.data.data;

  const cards = [
    { label: "Total users", value: stats.users.total, icon: Users },
    { label: "Candidates", value: stats.users.candidates, icon: Users },
    { label: "Companies", value: stats.users.companies, icon: Building2 },
    { label: "Assessments", value: `${stats.assessments.published} / ${stats.assessments.total}`, sub: "published / total", icon: FileStack },
    { label: "Attempts", value: `${stats.attempts.completed} / ${stats.attempts.total}`, sub: "completed / total", icon: ClipboardCheck },
    {
      label: "Revenue",
      value: formatCents(stats.payments.totalRevenueCents),
      sub: `${stats.payments.successfulCount} successful payments`,
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Platform overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className="text-2xl font-bold text-gray-900">{c.value}</p>
                {c.sub && <p className="text-xs text-gray-400">{c.sub}</p>}
              </div>
              <c.icon className="h-7 w-7 text-brand-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users, assessments, and attempts at a glance</CardTitle>
        </CardHeader>
        <CardContent>
          <StatsChart stats={stats} />
        </CardContent>
      </Card>
    </div>
  );
}
