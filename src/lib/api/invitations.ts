import { api } from "@/lib/api-client";
import type { Attempt, Invitation, InvitationStatus } from "@/types/api";

export interface ListInvitationsQuery {
  page?: number;
  limit?: number;
  status?: InvitationStatus;
  [key: string]: string | number | undefined;
}

export const invitationsApi = {
  // COMPANY: create/list invitations for one of their assessments.
  createForAssessment: (assessmentId: string, body: { candidateEmail: string; expiresInDays?: number }) =>
    api.post<Invitation>(`/assessments/${assessmentId}/invitations`, body),
  listForAssessment: (assessmentId: string, query: ListInvitationsQuery = {}) =>
    api.get<Invitation[]>(`/assessments/${assessmentId}/invitations`, query),

  // CANDIDATE: their own invitations.
  listMine: (query: ListInvitationsQuery = {}) => api.get<Invitation[]>("/invitations/me", query),
  // Accepting CREATES an Attempt, returned directly.
  accept: (id: string) => api.post<Attempt>(`/invitations/${id}/accept`, {}),
  decline: (id: string) => api.post<Invitation>(`/invitations/${id}/decline`, {}),
};
