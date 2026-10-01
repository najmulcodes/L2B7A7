import { api } from "@/lib/api-client";
import type { Difficulty, McqOption, Problem, ProblemType, TestCase } from "@/types/api";

export interface CreateProblemInput {
  title: string;
  description: string;
  type: ProblemType;
  difficulty: Difficulty;
  points: number;
  tags: string[];
  options?: McqOption[];
  correctOption?: string;
  starterCode?: string;
  language?: string;
  testCases?: TestCase[];
}

export type UpdateProblemInput = Partial<Omit<CreateProblemInput, "type">>;

export interface ListProblemsQuery {
  page?: number;
  limit?: number;
  type?: ProblemType;
  difficulty?: Difficulty;
  q?: string;
  sortBy?: "createdAt" | "points" | "title";
  sortOrder?: "asc" | "desc";
}

export const problemsApi = {
  list: (query: ListProblemsQuery = {}) => api.get<Problem[]>("/problems", query),
  getById: (id: string) => api.get<Problem>(`/problems/${id}`),
  create: (body: CreateProblemInput) => api.post<Problem>("/problems", body),
  update: (id: string, body: UpdateProblemInput) => api.patch<Problem>(`/problems/${id}`, body),
  remove: (id: string) => api.delete<null>(`/problems/${id}`),
};
