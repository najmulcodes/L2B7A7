"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";
import { useAuth } from "@/providers/AuthProvider";
import { ApiClientError } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { cn } from "@/lib/utils";

const ROLE_HOME: Record<string, string> = {
  CANDIDATE: "/candidate/dashboard",
  COMPANY: "/company/dashboard",
};

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CANDIDATE" },
  });

  const role = watch("role");

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        ...(values.role === "COMPANY" ? { companyName: values.companyName } : {}),
      };
      const user = await registerUser(payload);
      router.push(ROLE_HOME[user.role] ?? "/");
    } catch (err) {
      if (err instanceof ApiClientError) {
        const fieldErrors = err.fieldErrors();
        let matched = false;
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (["name", "email", "password", "companyName"].includes(field)) {
            setError(field as keyof RegisterFormValues, { message });
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
        <CardTitle>Create your CodeRank account</CardTitle>
      </CardHeader>
      <CardContent>
        {formError && (
          <div className="mb-4">
            <Alert variant="error">{formError}</Alert>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>I am a…</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["CANDIDATE", "COMPANY"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setValue("role", r)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium",
                    role === r
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50",
                  )}
                >
                  {r === "CANDIDATE" ? "Candidate" : "Company"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" autoComplete="name" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </div>

          {role === "COMPANY" && (
            <div>
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" {...register("companyName")} />
              <FieldError message={errors.companyName?.message} />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register("email")} />
            <FieldError message={errors.email?.message} />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            <p className="mt-1 text-xs text-gray-400">
              At least 8 characters, with one uppercase letter, one lowercase letter, and one number.
            </p>
            <FieldError message={errors.password?.message} />
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
