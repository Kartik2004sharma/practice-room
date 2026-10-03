import {
  Feedback,
  DEFAULT_MODEL,
  type FeedbackRequest,
  type QuestionRequest,
} from "../shared/contracts.js";
import { ModelError, type Model } from "../server/model.js";
import type { z } from "zod";
export let scenario = "ready";
export function setScenario(value: string) {
  scenario = value;
}
async function fault(signal: AbortSignal) {
  if (scenario === "slow")
    await new Promise<void>((resolve, reject) => {
      const id = setTimeout(resolve, 11000);
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(id);
          reject(new ModelError("cancelled", "Cancelled.", 499));
        },
        { once: true },
      );
    });
  if (scenario === "malformed")
    throw new ModelError(
      "malformed",
      "The model returned an unusable response after two repairs. Your answer is safe in the text field. Please retry.",
      502,
    );
  if (scenario === "failure")
    throw new ModelError(
      "failure",
      "The local coach could not finish. Please retry.",
      502,
    );
  if (scenario === "timeout")
    throw new ModelError(
      "timeout",
      "The local model took too long. Retry, or close other apps before trying again.",
      504,
    );
}
export const adapter: Model = {
  async status() {
    return {
      available: scenario !== "missing",
      model: "TEST ONLY — deterministic adapter",
      testOnly: true,
      message:
        scenario === "missing"
          ? `Gemma is missing. Run ollama pull ${DEFAULT_MODEL} and check again.`
          : "Test adapter ready (not real AI)",
    };
  },
  async question(input: z.infer<typeof QuestionRequest>, signal) {
    await fault(signal);
    return {
      question: [
        "Tell me about a software project you worked on. What was your contribution?",
        "How would you explain a hash map to someone learning to code?",
        "How do you approach debugging an unfamiliar error?",
        "Tell me about a time you worked through a disagreement.",
        "How would you clarify an ambiguous software requirement?",
      ][input.index],
      focus: (
        [
          "projects",
          "fundamentals",
          "problem-solving",
          "teamwork",
          "communication",
        ] as const
      )[input.index],
    };
  },
  async feedback(input: z.infer<typeof FeedbackRequest>, signal) {
    await fault(signal);
    return Feedback.parse({
      strength: `You identify a concrete action: “${input.answer.slice(0, 70)}”.`,
      improvement: "Explain why you chose that approach and what you learned.",
      suggestion:
        "Add one real outcome or lesson from this example, without inventing a result.",
      evidence: input.answer.slice(0, 70),
      structure: null,
      followUp: input.followUp
        ? null
        : "What did you learn from that approach?",
      rubric: { relevance: 4, structure: 3, specificity: 3, clarity: 4 },
    });
  },
};
