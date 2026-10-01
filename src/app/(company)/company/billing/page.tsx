"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { paymentsApi, CREDIT_PACKAGES } from "@/lib/api/payments";
import { companiesApi } from "@/lib/api/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { formatCents, formatDate } from "@/lib/utils";
import { CreditCard } from "lucide-react";
import type { CreditPackageKey } from "@/types/api";

export default function BillingPage() {
  const { toast } = useToast();
  const [pending, setPending] = useState<CreditPackageKey | null>(null);

  const companyQuery = useQuery({ queryKey: ["company-me"], queryFn: () => companiesApi.me() });
  const paymentsQuery = useQuery({ queryKey: ["payments-mine"], queryFn: () => paymentsApi.listMine({ limit: 20 }) });

  const initiate = useMutation({
    mutationFn: (pkg: CreditPackageKey) => paymentsApi.initiate(pkg),
    onMutate: (pkg) => setPending(pkg),
    onSuccess: (result) => {
      // Stripe Checkout — a full browser redirect, not an embedded form.
      window.location.href = result.data.checkoutUrl;
    },
    onError: (err) => {
      setPending(null);
      toast(err instanceof ApiClientError ? err.message : "Could not start checkout", "error");
    },
  });

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500">
          Current balance:{" "}
          <span className="font-semibold text-gray-900">
            {companyQuery.isLoading ? "…" : companyQuery.data?.data.assessmentCredits} credits
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {(Object.entries(CREDIT_PACKAGES) as [CreditPackageKey, (typeof CREDIT_PACKAGES)[CreditPackageKey]][]).map(
          ([key, pkg]) => (
            <Card key={key}>
              <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                <CreditCard className="h-8 w-8 text-brand-500" />
                <p className="text-2xl font-bold text-gray-900">{pkg.credits}</p>
                <p className="text-sm text-gray-500">credits</p>
                <p className="text-lg font-semibold text-gray-700">{pkg.priceLabel}</p>
                <Button
                  className="mt-2 w-full"
                  isLoading={initiate.isPending && pending === key}
                  onClick={() => initiate.mutate(key)}
                >
                  Buy
                </Button>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <Alert variant="info">
        You&apos;ll be redirected to Stripe Checkout to complete payment. After paying, we confirm success by polling
        your payment status — the redirect back alone never confirms a purchase.
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          {paymentsQuery.isLoading ? (
            <Spinner />
          ) : paymentsQuery.data && paymentsQuery.data.data.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {paymentsQuery.data.data.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {p.creditsPurchased} credits · {formatCents(p.amount, p.currency.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
                  </div>
                  <Badge status={p.status}>{p.status}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState title="No payments yet" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
