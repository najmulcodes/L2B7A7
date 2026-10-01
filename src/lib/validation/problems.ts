import { z } from "zod";

const mcqOptionSchema = z.object({
  id: z.string().min(1).max(10),
  text: z.string().min(1).max(500),
});

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
});

export const problemSchema = z
  .object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).max(10000),
    type: z.enum(["MCQ", "CODING", "WRITTEN"]),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    points: z.coerce.number().int().min(1).max(1000),
    tagsRaw: z.string().optional(),
    options: z.array(mcqOptionSchema).max(10).optional(),
    correctOption: z.string().max(10).optional(),
    starterCode: z.string().max(20000).optional(),
    language: z.string().trim().max(30).optional(),
    testCases: z.array(testCaseSchema).max(50).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "MCQ") {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "MCQ problems require at least 2 options" });
      }
      if (!data.correctOption) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["correctOption"], message: "Select the correct option" });
      } else if (data.options && !data.options.some((o) => o.id === data.correctOption)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["correctOption"], message: "correctOption must match one of the provided option ids" });
      }
    }
    if (data.type === "CODING" && (!data.testCases || data.testCases.length === 0)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["testCases"], message: "CODING problems require at least 1 test case" });
    }
  });

export type ProblemFormValues = z.infer<typeof problemSchema>;
