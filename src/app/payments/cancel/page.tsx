import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export default function PaymentCancelPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Checkout cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="info">No charge was made. You can try again anytime.</Alert>
          <Link href="/company/billing">
            <Button className="w-full">Back to billing</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
