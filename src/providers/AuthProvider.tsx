"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api/profile";
import { authApi, type LoginInput, type RegisterInput } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api-client";
import type { User } from "@/types/api";
import { useToast } from "@/providers/ToastProvider";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refetch: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const { data } = await usersApi.me();
        return data;
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 60_000,
  });

  useEffect(() => {
    function onExpired() {
      queryClient.setQueryData(["me"], null);
      toast("Your session expired. Please log in again.", "error");
      router.push("/login");
    }
    window.addEventListener("coderank:session-expired", onExpired);
    return () => window.removeEventListener("coderank:session-expired", onExpired);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    login: async (input) => {
      const { user: loggedInUser } = await authApi.login(input);
      queryClient.setQueryData(["me"], loggedInUser);
      return loggedInUser;
    },
    register: async (input) => {
      const { user: newUser } = await authApi.register(input);
      queryClient.setQueryData(["me"], newUser);
      return newUser;
    },
    logout: async () => {
      await authApi.logout().catch(() => null);
      queryClient.setQueryData(["me"], null);
      queryClient.clear();
      router.push("/login");
    },
    refetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
