import { api } from "@/lib/api-client";
import type { CandidateProfile, CompanyProfile, PublicCompanyProfile, User } from "@/types/api";

export const usersApi = {
  me: () => api.get<User>("/users/me"),
  updateMe: (body: { name?: string; avatarUrl?: string }) => api.patch<User>("/users/me", body),
  updatePassword: (body: { currentPassword: string; newPassword: string }) =>
    api.patch<null>("/users/me/password", body),
};

export const companiesApi = {
  me: () => api.get<CompanyProfile>("/companies/me"),
  updateMe: (body: Partial<Pick<CompanyProfile, "companyName" | "website" | "industry" | "about" | "logoUrl">>) =>
    api.patch<CompanyProfile>("/companies/me", body),
  getPublic: (id: string) => api.get<PublicCompanyProfile>(`/companies/${id}`),
};

export const candidatesApi = {
  updateMe: (
    body: Partial<{
      headline: string;
      bio: string;
      skills: string[];
      experienceYears: number;
      resumeUrl: string;
      githubUrl: string;
      portfolioUrl: string;
    }>,
  ) => api.patch<CandidateProfile>("/candidates/me", body),
  getById: (id: string) =>
    api.get<{ id: string; name: string; avatarUrl: string | null; role: string; candidateProfile: CandidateProfile }>(
      `/candidates/${id}`,
    ),
};
