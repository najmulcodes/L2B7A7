"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { problemsApi } from "@/lib/api/problems";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import { Plus, Trash2 } from "lucide-react";
import type { Difficulty, McqOption, Problem, ProblemType, TestCase } from "@/types/api";

export function ProblemForm({ existing }: { existing?: Problem }) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [type, setType] = useState<ProblemType>(existing?.type ?? "MCQ");
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? "MEDIUM");
  const [points, setPoints] = useState(existing?.points ?? 10);
  const [tagsInput, setTagsInput] = useState((existing?.tags ?? []).join(", "));
  const [options, setOptions] = useState<McqOption[]>(existing?.options ?? [{ id: "a", text: "" }, { id: "b", text: "" }]);
  const [correctOption, setCorrectOption] = useState(existing?.correctOption ?? "");
  const [starterCode, setStarterCode] = useState(existing?.starterCode ?? "");
  const [language, setLanguage] = useState(existing?.language ?? "");
  const [testCases, setTestCases] = useState<TestCase[]>(existing?.testCases ?? [{ input: "", expectedOutput: "" }]);
  const [formError, setFormError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      if (existing) {
        return problemsApi.update(existing.id, {
          title,
          description,
          difficulty,
          points,
          tags,
          ...(type === "MCQ" ? { options, correctOption } : {}),
          ...(type === "CODING" ? { starterCode, language, testCases } : {}),
        });
      }
      return problemsApi.create({
        title,
        description,
        type,
        difficulty,
        points,
        tags,
        ...(type === "MCQ" ? { options, correctOption } : {}),
        ...(type === "CODING" ? { starterCode, language, testCases } : {}),
      });
    },
    onSuccess: () => {
      toast(existing ? "Problem updated" : "Problem created", "success");
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      router.push("/company/problems");
    },
    onError: (err) => {
      setFormError(err instanceof ApiClientError ? err.message : "Could not save problem");
    },
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{existing ? "Edit problem" : "New problem"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formError && <Alert variant="error">{formError}</Alert>}

        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type</Label>
            <Select value={type} disabled={!!existing} onChange={(e) => setType(e.target.value as ProblemType)}>
              <option value="MCQ">Multiple choice</option>
              <option value="CODING">Coding</option>
              <option value="WRITTEN">Written</option>
            </Select>
            {existing && <p className="mt-1 text-xs text-gray-400">Type can&apos;t be changed after creation.</p>}
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Points</Label>
            <Input type="number" min={1} max={1000} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="arrays, sql" />
          </div>
        </div>

        {type === "MCQ" && (
          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <Label>Options</Label>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={correctOption === opt.id}
                  onChange={() => setCorrectOption(opt.id)}
                  title="Mark as correct answer"
                />
                <Input
                  className="w-16"
                  value={opt.id}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = { ...opt, id: e.target.value };
                    setOptions(next);
                  }}
                  placeholder="id"
                />
                <Input
                  value={opt.text}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = { ...opt, text: e.target.value };
                    setOptions(next);
                  }}
                  placeholder="Option text"
                />
                <button
                  type="button"
                  onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setOptions([...options, { id: String.fromCharCode(97 + options.length), text: "" }])}
            >
              <Plus className="h-4 w-4" /> Add option
            </Button>
            <p className="text-xs text-gray-400">Select the radio button next to the correct option.</p>
          </div>
        )}

        {type === "CODING" && (
          <div className="space-y-3 rounded-lg border border-gray-200 p-4">
            <div>
              <Label>Language</Label>
              <Input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="javascript" />
            </div>
            <div>
              <Label>Starter code</Label>
              <Textarea rows={5} className="font-mono text-xs" value={starterCode} onChange={(e) => setStarterCode(e.target.value)} />
            </div>
            <div>
              <Label>Test cases</Label>
              {testCases.map((tc, i) => (
                <div key={i} className="mb-2 grid grid-cols-2 gap-2">
                  <Textarea
                    rows={2}
                    placeholder="Input"
                    value={tc.input}
                    onChange={(e) => {
                      const next = [...testCases];
                      next[i] = { ...tc, input: e.target.value };
                      setTestCases(next);
                    }}
                  />
                  <div className="flex gap-2">
                    <Textarea
                      rows={2}
                      placeholder="Expected output"
                      value={tc.expectedOutput}
                      onChange={(e) => {
                        const next = [...testCases];
                        next[i] = { ...tc, expectedOutput: e.target.value };
                        setTestCases(next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setTestCases(testCases.filter((_, idx) => idx !== i))}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setTestCases([...testCases, { input: "", expectedOutput: "" }])}
              >
                <Plus className="h-4 w-4" /> Add test case
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button isLoading={save.isPending} onClick={() => save.mutate()}>
          {existing ? "Save changes" : "Create problem"}
        </Button>
      </CardFooter>
    </Card>
  );
}
