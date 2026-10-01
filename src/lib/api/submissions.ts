import { api } from "@/lib/api-client";
import type { Submission } from "@/types/api";

export const submissionsApi = {
  getById: (id: string) => api.get<Submission>(`/submissions/${id}`),
  evaluate: (id: string, body: { score: number; feedback?: string }) =>
    api.patch<Submission>(`/submissions/${id}/evaluate`, body),
};
