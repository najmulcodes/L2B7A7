"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdminDashboardStats } from "@/types/api";

// Every bar here is derived directly from GET /admin/dashboard-stats — no
// fabricated or placeholder series. Draft assessments and "other" attempts
// are simple differences (total - published, total - completed) since the
// endpoint only returns those two counts per category.
export function StatsChart({ stats }: { stats: AdminDashboardStats }) {
  const data = [
    { name: "Candidates", value: stats.users.candidates, group: "Users" },
    { name: "Companies", value: stats.users.companies, group: "Users" },
    { name: "Published", value: stats.assessments.published, group: "Assessments" },
    { name: "Draft", value: Math.max(0, stats.assessments.total - stats.assessments.published), group: "Assessments" },
    { name: "Completed", value: stats.attempts.completed, group: "Attempts" },
    { name: "In progress", value: Math.max(0, stats.attempts.total - stats.attempts.completed), group: "Attempts" },
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "#F3F4F6" }}
            contentStyle={{ borderRadius: 8, borderColor: "#E5E7EB", fontSize: 13 }}
          />
          <Bar dataKey="value" fill="#3a5cf5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
