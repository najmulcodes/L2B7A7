"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";

export default function AdminAuditLogsPage() {
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin-audit-logs", { entity, action, page }],
    queryFn: () => adminApi.auditLogs({ entity: entity || undefined, action: action || undefined, page, limit: 20 }),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Audit log</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Filter by entity (e.g. Assessment)"
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by action (e.g. USER_LOGIN)"
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardContent className="!p-0">
          {query.isLoading ? (
            <Spinner />
          ) : query.data && query.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {query.data.data.map((log) => (
                <li key={log.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-400">{formatDate(log.createdAt)}</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {log.entity}
                    {log.entityId ? ` · ${log.entityId}` : ""} — by {log.actor ? `${log.actor.name} (${log.actor.role})` : "system"}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState title="No audit log entries match these filters" />
            </div>
          )}
          <Pagination meta={query.data?.meta} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
