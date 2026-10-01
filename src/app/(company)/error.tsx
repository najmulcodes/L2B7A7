"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RoleSectionError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <h2 className="text-xl font-bold text-gray-900">This page hit an error</h2>
      <p className="max-w-sm text-gray-500">Something went wrong loading this page. You can try again.</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
