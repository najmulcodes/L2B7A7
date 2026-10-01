"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";
import { authApi } from "@/lib/api/auth";
import { useToast } from "@/providers/ToastProvider";
import type { Role } from "@/types/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (resp: { credential: string }) => void }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/**
 * Renders Google's own GIS button, which obtains a Google-issued ID token
 * entirely client-side (google.accounts.id) — there is no OAuth redirect
 * flow. The token is then POSTed to our /api/auth/google route handler,
 * which forwards it to the backend's POST /auth/google.
 */
export function GoogleSignInButton({
  role,
  companyName,
  onSuccess,
}: {
  role: Role;
  companyName?: string;
  onSuccess: (user: { role: Role }) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const initialize = useCallback(() => {
    if (!clientId || !window.google || !containerRef.current) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (resp) => {
        try {
          const { user } = await authApi.google({
            idToken: resp.credential,
            role,
            companyName: role === "COMPANY" ? companyName : undefined,
          });
          onSuccess(user);
        } catch {
          toast("Google sign-in failed. Please try again.", "error");
        }
      },
    });
    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
    });
  }, [clientId, role, companyName, onSuccess, toast]);

  if (!clientId) return null;

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={initialize} />
      <div ref={containerRef} className="flex justify-center" />
    </>
  );
}
