import { api } from "@/lib/api-client";
import type { Assessment, AssessmentProblemLink, AssessmentStatus } from "@/types/api";

export interface CreateAssessmentInput {
  title: string;
  description: string;
  durationMinutes?: number;
  passingScore?: number;
}

export type UpdateAssessmentInput = Partial<CreateAssessmentInput>;

export interface ListAssessmentsQuery {
  page?: number;
  limit?: number;
  status?: AssessmentStatus;
  q?: string;
  sortBy?: "createdAt" | "title" | "durationMinutes";
  sortOrder?: "asc" | "desc";
  [key: string]: string | number | undefined;
}

export const assessmentsApi = {
  list: (query: ListAssessmentsQuery = {}) => api.get<Assessment[]>("/assessments", query),
  getById: (id: string) => api.get<Assessment>(`/assessments/${id}`),
  create: (body: CreateAssessmentInput) => api.post<Assessment>("/assessments", body),
  update: (id: string, body: UpdateAssessmentInput) => api.patch<Assessment>(`/assessments/${id}`, body),
  remove: (id: string) => api.delete<null>(`/assessments/${id}`),
  attachProblem: (id: string, body: { problemId: string; order?: number; pointsOverride?: number }) =>
    api.post<AssessmentProblemLink>(`/assessments/${id}/problems`, body),
  detachProblem: (id: string, problemId: string) => api.delete<null>(`/assessments/${id}/problems/${problemId}`),
  // Publish spends 1 credit; a 403 here means "no credits remaining" and a
  // 400 means "attach at least one problem first" — both must be handled by
  // callers, see CompanyPublishButton.
  publish: (id: string) => api.patch<Assessment>(`/assessments/${id}/publish`, {}),
};
