"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error: unknown) => {
              const status = (error as { status?: number })?.status;
              // Don't retry on auth/permission/not-found/validation errors —
              // only on transient network/5xx failures.
              if (status && [400, 401, 403, 404, 409, 422].includes(status)) return false;
              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            staleTime: 15_000,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
