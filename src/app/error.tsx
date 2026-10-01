"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
      <p className="max-w-sm text-gray-500">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go home
        </Button>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </main>
  );
}
