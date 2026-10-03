import { z } from "zod";
export const DEFAULT_MODEL = "gemma3:4b";
export const Profile = z
  .object({
    role: z.string().trim().min(3).max(120),
    job: z.string().max(6000),
    type: z.enum(["mixed", "behavioral", "technical"]),
  })
  .strict();
export type Profile = z.infer<typeof Profile>;
const Text = z.string().trim().min(1).max(650);
export const Question = z
  .object({
    question: Text,
    focus: z.enum([
      "projects",
      "fundamentals",
      "problem-solving",
      "teamwork",
      "communication",
    ]),
  })
  .strict();
export type Question = z.infer<typeof Question>;
export const Feedback = z
  .object({
    strength: Text,
    improvement: Text,
    suggestion: Text,
    evidence: z.string().min(1).max(240),
    structure: z.string().max(300).nullable(),
    followUp: z.string().min(1).max(400).nullable(),
    rubric: z
      .object({
        relevance: z.number().int().min(1).max(5),
        structure: z.number().int().min(1).max(5),
        specificity: z.number().int().min(1).max(5),
        clarity: z.number().int().min(1).max(5),
      })
      .strict(),
  })
  .strict();
export type Feedback = z.infer<typeof Feedback>;
export const QuestionRequest = z
  .object({
    profile: Profile,
    index: z.number().int().min(0).max(4),
    previous: z.array(z.string().max(650)).max(4),
  })
  .strict()
  .refine(
    (v) => v.previous.length === v.index,
    "Question history must match progress",
  );
export const FeedbackRequest = z
  .object({
    profile: Profile,
    question: z.string().min(1).max(650),
    answer: z.string().trim().min(10).max(4000),
    followUp: z.boolean(),
  })
  .strict();
export const Status = z.object({
  available: z.boolean(),
  model: z.string(),
  message: z.string(),
  testOnly: z.boolean(),
});
export type Status = z.infer<typeof Status>;
export const Entry = z.object({
  question: Question,
  answer: z.string().max(4000),
  feedback: Feedback.nullable(),
  skipped: z.boolean(),
  followUpAnswer: z.string().max(4000).optional(),
  followUpFeedback: Feedback.optional(),
});
export type Entry = z.infer<typeof Entry>;
export const Session = z.object({
  id: z.string(),
  date: z.string(),
  profile: Profile,
  entries: z.array(Entry).max(5),
  endedEarly: z.boolean(),
  model: z.string(),
});
export type Session = z.infer<typeof Session>;
export const Sessions = z.array(Session).max(30);
