"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { useAuth } from "@/providers/AuthProvider";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { DemoLoginButtons } from "@/components/auth/DemoLoginButtons";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

// useSearchParams() below requires this page to be dynamically rendered
// rather than statically prerendered at build time.
export const dynamic = "force-dynamic";

const ROLE_HOME: Record<string, string> = {
  CANDIDATE: "/candidate/dashboard",
  COMPANY: "/company/dashboard",
  ADMIN: "/admin/dashboard",
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      const user = await login(values);
      const next = searchParams.get("next");
      router.push(next ?? ROLE_HOME[user.role] ?? "/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldErrors = err.fieldErrors();
        let matched = false;
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field === "email" || field === "password") {
            setError(field, { message });
            matched = true;
          }
        }
        if (!matched) setFormError(err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back 👋</CardTitle>
        <p className="mt-1 text-sm text-gray-500">Log in to your account</p>
      </CardHeader>
      <CardContent>
        {formError && (
          <div className="mb-4">
            <Alert variant="error">{formError}</Alert>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
            <FieldError message={errors.password?.message} />
          </div>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            🔐 Log in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="my-5 flex items-center gap-3 text-xs font-medium text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          OR
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <DemoLoginButtons onNavigate={(path) => router.push(path)} />

        <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="h-px flex-1 bg-gray-200" />
        </div>
        <GoogleSignInButton
          role="CANDIDATE"
          onSuccess={(user) => {
            queryClient.setQueryData(["me"], user);
            router.push(ROLE_HOME[user.role] ?? "/");
          }}
        />
        <p className="mt-2 text-center text-xs text-gray-400">
          Signing in with Google registers a candidate account by default.
        </p>
      </CardContent>
    </Card>
  );
}
