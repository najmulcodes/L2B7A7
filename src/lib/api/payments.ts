import { api } from "@/lib/api-client";
import type { CreditPackageKey, Payment, PaymentStatus } from "@/types/api";

export const CREDIT_PACKAGES: Record<CreditPackageKey, { credits: number; priceLabel: string }> = {
  SMALL: { credits: 5, priceLabel: "$25" },
  MEDIUM: { credits: 15, priceLabel: "$60" },
  LARGE: { credits: 50, priceLabel: "$180" },
};

export interface ListPaymentsQuery {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
}

export const paymentsApi = {
  initiate: (packageKey: CreditPackageKey) =>
    api.post<{ payment: Payment; checkoutUrl: string }>("/payments/initiate", { package: packageKey }),
  listMine: (query: ListPaymentsQuery = {}) => api.get<Payment[]>("/payments/me", query),
  getById: (id: string) => api.get<Payment>(`/payments/${id}`),
};
