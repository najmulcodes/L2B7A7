"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { attemptsApi } from "@/lib/api/attempts";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { ApiClientError } from "@/lib/api-client";
import { Check, Loader2, AlertCircle } from "lucide-react";
import type { AssessmentProblemLink, Submission } from "@/types/api";

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProblemAnswer({
  attemptId,
  link,
  index,
  existing,
  disabled,
  onExpired,
}: {
  attemptId: string;
  link: AssessmentProblemLink;
  index: number;
  existing?: Submission;
  disabled: boolean;
  onExpired: () => void;
}) {
  const problem = link.problem!;
  const [selectedOption, setSelectedOption] = useState(existing?.selectedOption ?? "");
  const [answerText, setAnswerText] = useState(existing?.answerText ?? "");
  const [code, setCode] = useState(existing?.code ?? problem.starterCode ?? "");
  const [language, setLanguage] = useState(existing?.language ?? problem.language ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const save = useMutation({
    mutationFn: (body: Parameters<typeof attemptsApi.submitAnswer>[1]) => attemptsApi.submitAnswer(attemptId, body),
    onMutate: () => setSaveState("saving"),
    onSuccess: () => setSaveState("saved"),
    onError: (err) => {
      setSaveState("error");
      if (err instanceof ApiClientError && err.status === 409) onExpired();
    },
  });

  const debouncedSave = useDebouncedCallback((body: Parameters<typeof attemptsApi.submitAnswer>[1]) => {
    save.mutate(body);
  }, 900);

  const points = link.pointsOverride ?? problem.points;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Question {index + 1} · {problem.type} · {points} pts
          </p>
          <h3 className="text-lg font-semibold text-gray-900">{problem.title}</h3>
        </div>
        <SaveIndicator state={saveState} />
      </div>
      <p className="mb-4 whitespace-pre-wrap text-sm text-gray-700">{problem.description}</p>

      {problem.type === "MCQ" && (
        <div className="space-y-2">
          {(problem.options ?? []).map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50 has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50"
            >
              <input
                type="radio"
                name={`mcq-${problem.id}`}
                disabled={disabled}
                checked={selectedOption === opt.id}
                onChange={() => {
                  setSelectedOption(opt.id);
                  debouncedSave({ problemId: problem.id, selectedOption: opt.id });
                }}
              />
              {opt.text}
            </label>
          ))}
        </div>
      )}

      {problem.type === "WRITTEN" && (
        <Textarea
          rows={6}
          disabled={disabled}
          value={answerText}
          placeholder="Write your answer…"
          onChange={(e) => {
            setAnswerText(e.target.value);
            debouncedSave({ problemId: problem.id, answerText: e.target.value });
          }}
        />
      )}

      {problem.type === "CODING" && (
        <div className="space-y-2">
          <Input
            disabled={disabled}
            value={language}
            placeholder="Language (e.g. javascript, python)"
            onChange={(e) => {
              setLanguage(e.target.value);
              debouncedSave({ problemId: problem.id, code, language: e.target.value });
            }}
          />
          <Textarea
            rows={12}
            disabled={disabled}
            value={code}
            className="font-mono text-xs"
            onChange={(e) => {
              setCode(e.target.value);
              debouncedSave({ problemId: problem.id, code: e.target.value, language });
            }}
          />
        </div>
      )}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <Check className="h-3 w-3" /> Saved
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="h-3 w-3" /> Not saved
      </span>
    );
  }
  return null;
}
