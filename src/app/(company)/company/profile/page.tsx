"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "@/lib/api/profile";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";

interface FormValues {
  companyName: string;
  website: string;
  industry: string;
  about: string;
  logoUrl: string;
}

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["company-me"], queryFn: () => companiesApi.me() });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>();

  useEffect(() => {
    if (query.data) {
      const p = query.data.data;
      reset({
        companyName: p.companyName,
        website: p.website ?? "",
        industry: p.industry ?? "",
        about: p.about ?? "",
        logoUrl: p.logoUrl ?? "",
      });
    }
  }, [query.data, reset]);

  const update = useMutation({
    mutationFn: (body: FormValues) =>
      companiesApi.updateMe({
        companyName: body.companyName || undefined,
        website: body.website || undefined,
        industry: body.industry || undefined,
        about: body.about || undefined,
        logoUrl: body.logoUrl || undefined,
      }),
    onSuccess: () => {
      toast("Company profile updated", "success");
      queryClient.invalidateQueries({ queryKey: ["company-me"] });
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not update profile", "error"),
  });

  if (query.isLoading) return <Spinner />;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Company profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit((v) => update.mutate(v))}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company name</Label>
            <Input id="companyName" {...register("companyName")} />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" type="url" placeholder="https://…" {...register("website")} />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" {...register("industry")} />
          </div>
          <div>
            <Label htmlFor="about">About</Label>
            <Textarea id="about" rows={4} {...register("about")} />
          </div>
          <div>
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" type="url" placeholder="https://…" {...register("logoUrl")} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting || update.isPending}>
            Save changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
