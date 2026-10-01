// Mirrors backend enums/models exactly — see prisma/schema.prisma in the
// backend repo. Field names/casing must match; do not "clean up" casing.

export type Role = "CANDIDATE" | "COMPANY" | "ADMIN";
export type AuthProvider = "LOCAL" | "GOOGLE";
export type ProblemType = "MCQ" | "CODING" | "WRITTEN";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "COMPLETED";
export type AttemptStatus = "IN_PROGRESS" | "SUBMITTED" | "EVALUATED" | "EXPIRED";
export type SubmissionStatus = "PENDING" | "AUTO_EVALUATED" | "MANUALLY_EVALUATED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";
export type CreditPackageKey = "SMALL" | "MEDIUM" | "LARGE";

export interface ApiSuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  errors: Array<{ path?: string; message: string } | Record<string, unknown>>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CompanyProfile {
  id: string;
  userId: string;
  companyName: string;
  website: string | null;
  industry: string | null;
  about: string | null;
  logoUrl: string | null;
  verified: boolean;
  assessmentCredits: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicCompanyProfile {
  id: string;
  companyName: string;
  website: string | null;
  industry: string | null;
  about: string | null;
  logoUrl: string | null;
  verified: boolean;
  createdAt: string;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline: string | null;
  bio: string | null;
  skills: string[];
  experienceYears: number | null;
  resumeUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  isActive: boolean;
  provider?: AuthProvider;
  createdAt: string;
  updatedAt?: string;
  candidateProfile?: CandidateProfile | null;
  companyProfile?: CompanyProfile | null;
}

export interface McqOption {
  id: string;
  text: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Problem {
  id: string;
  companyId: string;
  createdById: string;
  title: string;
  description: string;
  type: ProblemType;
  difficulty: Difficulty;
  points: number;
  tags: string[];
  options?: McqOption[] | null;
  correctOption?: string | null;
  starterCode?: string | null;
  language?: string | null;
  testCases?: TestCase[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentProblemLink {
  id: string;
  assessmentId: string;
  problemId: string;
  order: number;
  pointsOverride: number | null;
  createdAt: string;
  problem?: Problem;
}

export interface Assessment {
  id: string;
  companyId: string;
  createdById: string;
  title: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
  problems?: AssessmentProblemLink[];
  company?: CompanyProfile;
  _count?: { problems: number; invitations: number; attempts: number };
}

export interface Invitation {
  id: string;
  assessmentId: string;
  candidateId: string;
  invitedById: string;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  candidate?: { id: string; name: string; email: string };
  assessment?: {
    id: string;
    title: string;
    durationMinutes: number;
    passingScore: number;
    company: { companyName: string };
  };
}

export interface Submission {
  id: string;
  attemptId: string;
  problemId: string;
  answerText: string | null;
  selectedOption: string | null;
  code: string | null;
  language: string | null;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  evaluatedById: string | null;
  evaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  problem?: Pick<Problem, "id" | "title" | "type" | "points"> & Partial<Problem>;
}

export interface Attempt {
  id: string;
  assessmentId: string;
  candidateId: string;
  invitationId: string;
  status: AttemptStatus;
  startedAt: string;
  deadlineAt: string;
  submittedAt: string | null;
  totalScore: number | null;
  maxScore: number | null;
  passed: boolean | null;
  createdAt: string;
  updatedAt: string;
  assessment?: Assessment;
  submissions?: Submission[];
  candidate?: { id: string; name: string; email: string };
}

export interface AttemptReportBreakdownItem {
  problemId: string;
  problemTitle: string;
  type: ProblemType;
  status: SubmissionStatus;
  score: number | null;
  maxPoints: number;
  feedback: string | null;
}

export interface AttemptReport {
  attemptId: string;
  assessment: { id: string; title: string; passingScore: number; companyId: string };
  status: AttemptStatus;
  totalScore: number | null;
  maxScore: number | null;
  passed: boolean | null;
  submittedAt: string | null;
  breakdown: AttemptReportBreakdownItem[];
}

export interface Payment {
  id: string;
  userId: string;
  provider: "STRIPE";
  purpose: "CREDIT_PURCHASE";
  amount: number;
  currency: string;
  status: PaymentStatus;
  creditsPurchased: number;
  providerSessionId: string | null;
  providerRef: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  previousState: Record<string, unknown> | null;
  newState: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  actor?: { id: string; name: string; email: string; role: Role } | null;
}

export interface AdminDashboardStats {
  users: { total: number; candidates: number; companies: number };
  assessments: { total: number; published: number };
  attempts: { total: number; completed: number };
  payments: { successfulCount: number; totalRevenueCents: number };
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  provider: AuthProvider;
  createdAt: string;
}
