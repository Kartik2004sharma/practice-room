import { mkdir, writeFile } from "node:fs/promises";
import { ollama } from "../server/model.js";
const status = await ollama.status();
if (!status.available) {
  console.error("BLOCKED: " + status.message);
  process.exit(1);
}
if (process.env.MODEL_SMOKE_DEBUG === "1") {
  const actualFetch = globalThis.fetch;
  const diagnostics: unknown[] = [];
  globalThis.fetch = async (url, options) => {
    const response = await actualFetch(url, options);
    if (String(url).endsWith("/api/chat")) {
      diagnostics.push(await response.clone().json());
      await writeFile(
        ".runtime/smoke-diagnostics.json",
        JSON.stringify(diagnostics, null, 2),
      );
    }
    return response;
  };
}
const profile = {
  role: "Junior software engineer",
  job: "Sample job description: explain projects, debug code, and collaborate on TypeScript applications.",
  type: "mixed" as const,
};
const signal = AbortSignal.timeout(180000);
const question = await ollama.question(
  { profile, index: 0, previous: [] },
  signal,
);
const answer =
  "Sample candidate answer: I built a task tracker for a class project. I implemented filtering in TypeScript. When the empty list broke the view, I wrote a failing test, fixed the condition, and verified the empty state. I learned to test boundary cases before adding features.";
const feedback = await ollama.feedback(
  { profile, question: question.question, answer, followUp: false },
  signal,
);
let followUpFeedback = null;
if (feedback.followUp)
  followUpFeedback = await ollama.feedback(
    {
      profile,
      question: feedback.followUp,
      answer:
        "Sample follow-up answer: I learned that boundary tests helped me isolate mistakes. Next time I would test an empty list before connecting the UI.",
      followUp: true,
    },
    signal,
  );
await mkdir("evidence", { recursive: true });
await writeFile(
  "evidence/model-smoke.json",
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      status,
      profile,
      question,
      answer,
      feedback,
      followUpFeedback,
    },
    null,
    2,
  ),
);
console.log(
  `PASS: ${status.model} generated a validated question, answer-grounded feedback${followUpFeedback ? " and follow-up feedback" : ""}. Evidence: evidence/model-smoke.json (sample content only).`,
);
