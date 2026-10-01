"use client";

import type { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </QueryProvider>
  );
}
