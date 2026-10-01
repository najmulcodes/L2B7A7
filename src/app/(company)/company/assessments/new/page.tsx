"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { assessmentsApi } from "@/lib/api/assessments";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ApiClientError } from "@/lib/api-client";

export default function NewAssessmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [passingScore, setPassingScore] = useState(60);
  const [formError, setFormError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => assessmentsApi.create({ title, description, durationMinutes, passingScore }),
    onSuccess: (result) => router.push(`/company/assessments/${result.data.id}`),
    onError: (err) => setFormError(err instanceof ApiClientError ? err.message : "Could not create assessment"),
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>New assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formError && <Alert variant="error">{formError}</Alert>}
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Backend Engineer — Round 1" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              min={5}
              max={600}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>
          <div>
            <Label>Passing score (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
            />
          </div>
        </div>
        <Alert variant="info">
          Assessments start as drafts. Attach problems, then publish when ready — publishing spends 1 assessment
          credit.
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button isLoading={create.isPending} onClick={() => create.mutate()} disabled={!title || !description}>
          Create draft
        </Button>
      </CardFooter>
    </Card>
  );
}
