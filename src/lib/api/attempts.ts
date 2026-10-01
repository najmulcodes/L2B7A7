import { api } from "@/lib/api-client";
import type { Attempt, AttemptReport, AttemptStatus, Submission } from "@/types/api";

export interface ListAttemptsQuery {
  page?: number;
  limit?: number;
  status?: AttemptStatus;
}

export interface SubmitAnswerInput {
  problemId: string;
  selectedOption?: string;
  answerText?: string;
  code?: string;
  language?: string;
}

export const attemptsApi = {
  // CANDIDATE
  listMine: (query: ListAttemptsQuery = {}) => api.get<Attempt[]>("/attempts/me", query),
  // CANDIDATE / COMPANY / ADMIN (ownership enforced server-side)
  getById: (id: string) => api.get<Attempt>(`/attempts/${id}`),
  report: (id: string) => api.get<AttemptReport>(`/attempts/${id}/report`),
  // CANDIDATE — can be called repeatedly before submit to update an answer.
  submitAnswer: (attemptId: string, body: SubmitAnswerInput) =>
    api.post<Submission>(`/attempts/${attemptId}/answers`, body),
  finalize: (attemptId: string) => api.post<Attempt>(`/attempts/${attemptId}/submit`, {}),

  // COMPANY — attempts for one of their assessments.
  listForAssessment: (assessmentId: string, query: ListAttemptsQuery = {}) =>
    api.get<Attempt[]>(`/assessments/${assessmentId}/attempts`, query),
};
