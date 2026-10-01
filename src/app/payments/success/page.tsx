"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

// Stripe redirects the browser here after checkout, but per the backend's
// own guidance a redirect is NEVER proof of payment — webhook processing is
// asynchronous. We poll GET /payments/me (matching by Stripe's
// `session_id` query param against each payment's providerSessionId) until
// the matching payment's status flips out of PENDING.
export const dynamic = "force-dynamic";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [attempts, setAttempts] = useState(0);

  const query = useQuery({
    queryKey: ["payments-mine-poll"],
    queryFn: () => paymentsApi.listMine({ limit: 20 }),
    refetchInterval: (q) => {
      const payment = q.state.data?.data.find((p) => p.providerSessionId === sessionId);
      return payment && payment.status !== "PENDING" ? false : 2500;
    },
  });

  useEffect(() => {
    const id = setInterval(() => setAttempts((a) => a + 1), 2500);
    return () => clearInterval(id);
  }, []);

  const payment = query.data?.data.find((p) => p.providerSessionId === sessionId);
  const stillWaiting = !payment || payment.status === "PENDING";
  const timedOut = attempts > 24 && stillWaiting; // ~1 minute

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Payment confirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!sessionId && <Alert variant="warning">No checkout session found in the URL.</Alert>}

          {sessionId && stillWaiting && !timedOut && (
            <>
              <Spinner label="Confirming your payment with Stripe…" />
              <p className="text-sm text-gray-500">This usually takes a few seconds.</p>
            </>
          )}

          {sessionId && timedOut && (
            <Alert variant="warning" title="Still processing">
              This is taking longer than expected. Your credits will appear on the billing page once processing
              completes — no need to pay again.
            </Alert>
          )}

          {payment && payment.status === "SUCCESS" && (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="font-semibold text-gray-900">{payment.creditsPurchased} credits added</p>
            </div>
          )}

          {payment && (payment.status === "FAILED" || payment.status === "CANCELLED") && (
            <Alert variant="error">This payment did not complete ({payment.status.toLowerCase()}).</Alert>
          )}

          <Link href="/company/billing">
            <Button variant="outline" className="w-full">
              Back to billing
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
