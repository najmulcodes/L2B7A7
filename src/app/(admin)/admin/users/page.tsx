"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/providers/AuthProvider";
import { formatDate } from "@/lib/utils";
import type { Role } from "@/types/api";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [role, setRole] = useState<Role | "">("");
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["admin-users", { role, isActive, q, page }],
    queryFn: () =>
      adminApi.listUsers({
        role: role || undefined,
        isActive: isActive || undefined,
        q: q || undefined,
        page,
        limit: 15,
      }),
  });

  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => adminApi.updateUserRole(id, role),
    onSuccess: () => {
      toast("Role updated", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not update role", "error"),
  });

  const changeStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminApi.updateUserStatus(id, isActive),
    onSuccess: () => {
      toast("Status updated", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not update status", "error"),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Users</h1>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          className="max-w-[160px]"
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role | "");
            setPage(1);
          }}
        >
          <option value="">All roles</option>
          <option value="CANDIDATE">Candidate</option>
          <option value="COMPANY">Company</option>
          <option value="ADMIN">Admin</option>
        </Select>
        <Select
          className="max-w-[160px]"
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value as "" | "true" | "false");
            setPage(1);
          }}
        >
          <option value="">Any status</option>
          <option value="true">Active</option>
          <option value="false">Deactivated</option>
        </Select>
      </div>

      <Card>
        <CardContent className="!p-0">
          {query.isLoading ? (
            <Spinner />
          ) : query.data && query.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {query.data.data.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        {!u.isActive && <Badge status="CANCELLED">Deactivated</Badge>}
                      </div>
                      <p className="text-xs text-gray-500">
                        {u.email} · Joined {formatDate(u.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        className="w-32"
                        value={u.role}
                        disabled={isSelf || changeRole.isPending}
                        onChange={(e) => changeRole.mutate({ id: u.id, role: e.target.value as Role })}
                      >
                        <option value="CANDIDATE">Candidate</option>
                        <option value="COMPANY">Company</option>
                        <option value="ADMIN">Admin</option>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isSelf}
                        isLoading={changeStatus.isPending && changeStatus.variables?.id === u.id}
                        onClick={() => changeStatus.mutate({ id: u.id, isActive: !u.isActive })}
                      >
                        {u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState title="No users match these filters" />
            </div>
          )}
          <Pagination meta={query.data?.meta} onPageChange={setPage} />
        </CardContent>
      </Card>
    </div>
  );
}
