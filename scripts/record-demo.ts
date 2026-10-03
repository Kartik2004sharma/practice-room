import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
await mkdir("evidence/demo-raw", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: "evidence/demo-raw", size: { width: 1280, height: 720 } },
});
const page = await context.newPage();
const calls: unknown[] = [];
const errors: string[] = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("response", async (response) => {
  if (response.url().includes("/api/") && response.ok())
    calls.push({
      route: new URL(response.url()).pathname,
      result: await response.json(),
    });
});
try {
  await page.goto("http://127.0.0.1:3000");
  const status = await page.request
    .get("http://127.0.0.1:3000/api/status")
    .then((r) => r.json());
  if (!status.available || status.testOnly)
    throw new Error("Recording requires real, available local Gemma.");
  await page
    .getByLabel("Job description")
    .fill(
      "Sample job description for this recording: Junior software engineer. Explain your projects, approach debugging clearly, and collaborate with teammates. All candidate text in this recording is synthetic sample content.",
    );
  await page.getByLabel("Behavioral", { exact: false }).check();
  await page
    .getByRole("button", { name: "Enter the practice room" })
    .scrollIntoViewIfNeeded();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: "evidence/real-setup.png", fullPage: false });
  await page.getByRole("button", { name: "Enter the practice room" }).click();
  await page
    .getByText("Question 1 of 5", { exact: true })
    .waitFor({ timeout: 100000 });
  await page.waitForTimeout(1800);
  await page
    .getByLabel("Your answer", { exact: true })
    .fill(
      "Sample candidate answer: In a class project, I worked with a teammate on a task tracker. I wrote the TypeScript filtering logic. When an empty list crashed the view, I explained the problem to my teammate, added a failing test and fixed the condition. We verified the empty state together. I learned to explain my debugging steps before asking for help.",
    );
  await page.waitForTimeout(2200);
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await page
    .getByRole("region", { name: "Answer feedback" })
    .waitFor({ timeout: 100000 });
  await page.screenshot({ path: "evidence/real-feedback.png", fullPage: false });
  await page.getByText("From your answer").scrollIntoViewIfNeeded();
  await page.waitForTimeout(3500);
  await page.getByText("Coaching aids · 1–5").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  if (
    await page.getByRole("button", { name: "Practice a follow-up" }).count()
  ) {
    await page.getByRole("button", { name: "Practice a follow-up" }).click();
    await page.waitForTimeout(1800);
    await page
      .getByLabel("Your follow-up answer")
      .fill(
        "Sample follow-up answer: I learned that describing what I expected and what actually happened made it easier for my teammate to help. Next time I would check the empty state first and share a short example of the problem.",
      );
    await page.waitForTimeout(1800);
    await page.getByRole("button", { name: "Get coaching notes" }).click();
    await page
      .getByRole("button", { name: "Next question" })
      .waitFor({ timeout: 100000 });
    await page.getByText("From your answer").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
  }
  await page.getByRole("button", { name: "Next question" }).click();
  await page
    .getByText("Question 2 of 5", { exact: true })
    .waitFor({ timeout: 100000 });
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Skip question" }).click();
  await page
    .getByText("Question 3 of 5", { exact: true })
    .waitFor({ timeout: 100000 });
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "End session", exact: true }).click();
  await page.getByRole("heading", { name: /Practice done/ }).waitFor();
  await page.screenshot({ path: "evidence/real-recap.png", fullPage: false });
  await page.waitForTimeout(3000);
  await page.getByRole("button", { name: "Review saved sessions" }).click();
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Delete practice data" }).click();
  await page.getByText("Practice data deleted from this browser.").waitFor();
  await page.waitForTimeout(1800);
  if (errors.length) throw new Error("Browser errors: " + errors.join("; "));
  await writeFile(
    "evidence/demo-model-output.json",
    JSON.stringify(
      {
        sampleContentOnly: true,
        recordedAt: new Date().toISOString(),
        calls,
        browserErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: real Gemma flow recorded: question, feedback, optional follow-up, advance, skip, early recap, review and deletion.",
  );
} finally {
  const video = page.video();
  await context.close();
  if (video) await video.saveAs("evidence/practice-room-demo.webm");
  await browser.close();
}
