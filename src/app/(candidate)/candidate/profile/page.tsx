"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidatesApi } from "@/lib/api/profile";
import { usersApi } from "@/lib/api/profile";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/FieldError";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { useAuth } from "@/providers/AuthProvider";
import { updatePasswordSchema, type UpdatePasswordFormValues } from "@/lib/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

interface ProfileFormValues {
  headline: string;
  bio: string;
  experienceYears: string;
  resumeUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export default function CandidateProfilePage() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfileFormValues>();

  useEffect(() => {
    if (user?.candidateProfile) {
      reset({
        headline: user.candidateProfile.headline ?? "",
        bio: user.candidateProfile.bio ?? "",
        experienceYears: String(user.candidateProfile.experienceYears ?? 0),
        resumeUrl: user.candidateProfile.resumeUrl ?? "",
        githubUrl: user.candidateProfile.githubUrl ?? "",
        portfolioUrl: user.candidateProfile.portfolioUrl ?? "",
      });
      setSkills(user.candidateProfile.skills ?? []);
    }
  }, [user, reset]);

  const updateProfile = useMutation({
    mutationFn: (body: Parameters<typeof candidatesApi.updateMe>[0]) => candidatesApi.updateMe(body),
    onSuccess: () => {
      toast("Profile updated", "success");
      refetch();
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not update profile", "error"),
  });

  const onSubmit = (values: ProfileFormValues) => {
    const body: Parameters<typeof candidatesApi.updateMe>[0] = {
      headline: values.headline || undefined,
      bio: values.bio || undefined,
      experienceYears: values.experienceYears ? Number(values.experienceYears) : undefined,
      resumeUrl: values.resumeUrl || undefined,
      githubUrl: values.githubUrl || undefined,
      portfolioUrl: values.portfolioUrl || undefined,
      skills,
    };
    updateProfile.mutate(body);
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed) && skills.length < 50) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  if (!user) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Your profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Candidate details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" placeholder="Senior Backend Engineer" {...register("headline")} />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} {...register("bio")} />
            </div>
            <div>
              <Label htmlFor="experienceYears">Years of experience</Label>
              <Input id="experienceYears" type="number" min={0} max={60} {...register("experienceYears")} />
            </div>
            <div>
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 p-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
                  >
                    {skill}
                    <button type="button" onClick={() => setSkills(skills.filter((s) => s !== skill))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  onBlur={addSkill}
                  placeholder="Type a skill and press Enter"
                  className="min-w-[140px] flex-1 border-none text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="resumeUrl">Resume URL</Label>
              <Input id="resumeUrl" type="url" placeholder="https://…" {...register("resumeUrl")} />
            </div>
            <div>
              <Label htmlFor="githubUrl">GitHub URL</Label>
              <Input id="githubUrl" type="url" placeholder="https://github.com/…" {...register("githubUrl")} />
            </div>
            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL</Label>
              <Input id="portfolioUrl" type="url" placeholder="https://…" {...register("portfolioUrl")} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting || updateProfile.isPending}>
              Save changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AccountSection />
      <PasswordSection />
    </div>
  );
}

function AccountSection() {
  const { user, refetch } = useAuth();
  const { toast } = useToast();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ name: string }>({
    defaultValues: { name: user?.name ?? "" },
  });

  const updateMe = useMutation({
    mutationFn: (body: { name: string }) => usersApi.updateMe(body),
    onSuccess: () => {
      toast("Name updated", "success");
      refetch();
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not update name", "error"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit((v) => updateMe.mutate(v))}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" {...register("name")} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" variant="outline" isLoading={isSubmitting || updateMe.isPending}>
            Save
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function PasswordSection() {
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({ resolver: zodResolver(updatePasswordSchema) });

  const updatePassword = useMutation({
    mutationFn: (body: UpdatePasswordFormValues) => usersApi.updatePassword(body),
    onSuccess: () => {
      toast("Password updated. Please log in again next time with your new password.", "success");
      reset();
    },
    onError: (err) => toast(err instanceof ApiClientError ? err.message : "Could not update password", "error"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit((v) => updatePassword.mutate(v))}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" type="password" {...register("currentPassword")} />
            <FieldError message={errors.currentPassword?.message} />
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" {...register("newPassword")} />
            <FieldError message={errors.newPassword?.message} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" variant="outline" isLoading={isSubmitting || updatePassword.isPending}>
            Update password
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
