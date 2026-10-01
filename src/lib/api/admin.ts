import { api } from "@/lib/api-client";
import type { AdminDashboardStats, AdminUserRow, AuditLog, Role } from "@/types/api";

export interface ListAdminUsersQuery {
  page?: number;
  limit?: number;
  role?: Role;
  q?: string;
  isActive?: "true" | "false";
  [key: string]: string | number | undefined;
}

export interface ListAuditLogsQuery {
  page?: number;
  limit?: number;
  entity?: string;
  action?: string;
  actorId?: string;
  [key: string]: string | number | undefined;
}

export const adminApi = {
  listUsers: (query: ListAdminUsersQuery = {}) => api.get<AdminUserRow[]>("/admin/users", query),
  updateUserRole: (id: string, role: Role) => api.patch<AdminUserRow>(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id: string, isActive: boolean) =>
    api.patch<AdminUserRow>(`/admin/users/${id}/status`, { isActive }),
  dashboardStats: () => api.get<AdminDashboardStats>("/admin/dashboard-stats"),
  auditLogs: (query: ListAuditLogsQuery = {}) => api.get<AuditLog[]>("/admin/audit-logs", query),
};
