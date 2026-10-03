import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { DEFAULT_MODEL } from "../shared/contracts.js";
const sample =
  "Sample candidate answer: I built a small task tracker. I wrote the filtering logic and checked empty states with tests.";
async function ready(page: Page) {
  await page.goto("/");
  await expect(
    page.getByText("Local coach ready", { exact: true }),
  ).toBeVisible();
}
async function start(page: Page) {
  await ready(page);
  await page.getByRole("button", { name: "Enter the practice room" }).click();
  await expect(
    page.getByText("Question 1 of 5", { exact: true }),
  ).toBeVisible();
}
async function coach(page: Page) {
  await page.getByLabel("Your answer", { exact: true }).fill(sample);
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await expect(
    page.getByRole("region", { name: "Answer feedback" }),
  ).toBeVisible();
}
test.beforeEach(async ({ request }) => {
  await request.post("/__test/scenario", { data: { value: "ready" } });
});
test("purpose, local status, validation and no browser errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await ready(page);
  await expect(
    page.getByText(/Questions and feedback run on this device/),
  ).toBeVisible();
  await expect(page.getByText(/TEST ADAPTER/)).toBeVisible();
  await page.getByLabel("What role are you preparing for?").fill("");
  await page.getByRole("button", { name: "Enter the practice room" }).click();
  await expect
    .poll(() =>
      page
        .getByLabel("What role are you preparing for?")
        .evaluate((el) => (el as HTMLInputElement).validity.valid),
    )
    .toBe(false);
  await page.getByLabel("What role are you preparing for?").fill("  ");
  await page.getByRole("button", { name: "Enter the practice room" }).click();
  await expect
    .poll(() =>
      page
        .getByLabel("What role are you preparing for?")
        .evaluate((el) => (el as HTMLInputElement).validity.valid),
    )
    .toBe(false);
  await page.getByLabel("What role are you preparing for?").fill("Junior SWE");
  await page
    .getByLabel("Job description")
    .fill("Sample job description: maintain TypeScript services.");
  await page.getByLabel("Role-specific", { exact: false }).check();
  await page.getByRole("button", { name: "Enter the practice room" }).click();
  await expect(
    page.getByText("Question 1 of 5", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Answer feedback" }),
  ).toHaveCount(0);
  await page.getByLabel("Your answer", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await expect
    .poll(() =>
      page
        .getByLabel("Your answer", { exact: true })
        .evaluate((el) => (el as HTMLTextAreaElement).validity.valid),
    )
    .toBe(false);
  expect(errors).toEqual([]);
});
test("answer-specific feedback, follow-up and five-question completion", async ({
  page,
}) => {
  await start(page);
  await coach(page);
  await expect(page.getByText(/You identify a concrete action/)).toBeVisible();
  await expect(
    page.getByText("Explain why you chose that approach and what you learned."),
  ).toBeVisible();
  await expect(page.getByText("From your answer")).toBeVisible();
  await expect(page.getByText("Coaching aids · 1–5")).toBeVisible();
  await page.getByRole("button", { name: "Practice a follow-up" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "What did you learn from that approach?",
  );
  await page
    .getByLabel("Your follow-up answer")
    .fill(
      "Sample follow-up: I learned to test empty lists before adding features.",
    );
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await expect(
    page.getByRole("button", { name: "Next question" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Practice a follow-up" }),
  ).toHaveCount(0);
  for (let n = 2; n <= 5; n++) {
    await page.getByRole("button", { name: "Next question" }).click();
    await expect(
      page.getByText(`Question ${n} of 5`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Answer feedback" }),
    ).toHaveCount(0);
    await coach(page);
  }
  await page.getByRole("button", { name: "Finish & see recap" }).click();
  await expect(
    page.getByRole("heading", { name: /Practice done/ }),
  ).toBeVisible();
  await expect(page.getByText(/5 answered, 0 skipped/)).toBeVisible();
  await page.getByRole("button", { name: "Review saved sessions" }).click();
  await page.reload();
  await page.getByRole("button", { name: /Saved practice/ }).click();
  await expect(
    page.getByRole("button", { name: /Junior software engineer.*5 answered/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: /Junior software engineer.*5 answered/ })
    .click();
  await expect(
    page.getByRole("heading", { name: /Practice done/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete practice data" }).click();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("practice-room:sessions:v1"),
    ),
  ).toBeNull();
  await page.getByRole("button", { name: /Saved practice/ }).click();
  await expect(page.getByText("A fresh notebook.")).toBeVisible();
});
test("skip, early end and timer can be turned off", async ({ page }) => {
  await start(page);
  await page.getByLabel("Answer timer", { exact: true }).check();
  await expect(page.getByLabel("Elapsed answer time")).toBeVisible();
  await page.getByLabel("Answer timer", { exact: true }).uncheck();
  await expect(page.getByLabel("Elapsed answer time")).toHaveCount(0);
  await page.getByRole("button", { name: "Skip question" }).click();
  await expect(
    page.getByText("Question 2 of 5", { exact: true }),
  ).toBeVisible();
  await coach(page);
  await page.getByRole("button", { name: "End session", exact: true }).click();
  await expect(page.getByText(/1 answered, 1 skipped/)).toBeVisible();
  await expect(page.getByText(/ENDED EARLY/)).toBeVisible();
});
test("missing model has useful setup and recovery", async ({
  page,
  request,
}) => {
  await request.post("/__test/scenario", { data: { value: "missing" } });
  await page.goto("/");
  await expect(page.getByText("Local coach offline")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enter the practice room" }),
  ).toBeDisabled();
  await expect(
    page.getByText(`ollama pull ${DEFAULT_MODEL}`, { exact: true }),
  ).toBeVisible();
  await request.post("/__test/scenario", { data: { value: "ready" } });
  await page.getByRole("button", { name: "Check connection" }).click();
  await expect(
    page.getByRole("button", { name: "Enter the practice room" }),
  ).toBeEnabled();
});
for (const scenario of ["malformed", "failure", "timeout"])
  test(`${scenario} response keeps answer and retry recovers`, async ({
    page,
    request,
  }) => {
    await start(page);
    await page.getByLabel("Your answer", { exact: true }).fill(sample);
    await request.post("/__test/scenario", { data: { value: scenario } });
    await page.getByRole("button", { name: "Get coaching notes" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
      sample,
    );
    await expect(
      page.getByRole("region", { name: "Answer feedback" }),
    ).toHaveCount(0);
    await request.post("/__test/scenario", { data: { value: "ready" } });
    await page.getByRole("button", { name: "Retry request" }).click();
    await expect(
      page.getByRole("region", { name: "Answer feedback" }),
    ).toBeVisible();
  });
test("slow response can be cancelled and draft edited before retry", async ({
  page,
  request,
}) => {
  await start(page);
  await page.getByLabel("Your answer", { exact: true }).fill(sample);
  await request.post("/__test/scenario", { data: { value: "slow" } });
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await expect(page.getByText(/Local models can take a moment/)).toBeVisible({
    timeout: 12000,
  });
  await page.getByRole("button", { name: "Cancel request" }).click();
  await expect(
    page.getByText("Cancelled. Your draft is still here."),
  ).toBeVisible();
  await expect(page.getByLabel("Your answer", { exact: true })).toHaveValue(
    sample,
  );
  await request.post("/__test/scenario", { data: { value: "ready" } });
  await page
    .getByLabel("Your answer", { exact: true })
    .fill(sample + " I learned to keep functions small.");
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await expect(
    page.getByRole("region", { name: "Answer feedback" }),
  ).toBeVisible();
});
test("editing after failure prevents stale feedback and saves the edited answer", async ({
  page,
  request,
}) => {
  await start(page);
  await page.getByLabel("Your answer", { exact: true }).fill(sample);
  await request.post("/__test/scenario", { data: { value: "failure" } });
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await expect(
    page.getByRole("button", { name: "Retry request" }),
  ).toBeVisible();
  const edited =
    "Sample revised answer: I debugged an empty-list crash by writing a failing test first.";
  await page.getByLabel("Your answer", { exact: true }).fill(edited);
  await expect(page.getByRole("button", { name: "Retry request" })).toHaveCount(
    0,
  );
  await request.post("/__test/scenario", { data: { value: "ready" } });
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await expect(
    page.getByRole("region", { name: "Answer feedback" }),
  ).toBeVisible();
  await expect(page.getByRole("blockquote")).toContainText(edited.slice(0, 70));
  await page.getByRole("button", { name: "End session", exact: true }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("practice-room:sessions:v1")!),
  );
  expect(saved[0].entries[0].answer).toBe(edited);
  expect(edited).toContain(saved[0].entries[0].feedback.evidence);
});
test("keyboard journey, visible focus and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to practice" }),
  ).toBeFocused();
  expect(
    await page
      .getByRole("link", { name: "Skip to practice" })
      .evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("solid");
  await page.keyboard.press("Enter");
  await page.getByLabel("What role are you preparing for?").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Job description")).toBeFocused();
  await page.getByRole("button", { name: "Enter the practice room" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Your answer", { exact: true })).toBeFocused();
  await page.keyboard.type(sample);
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Answer timer", { exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Get coaching notes" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("region", { name: "Answer feedback" }),
  ).toBeVisible();
  expect(
    await page
      .getByRole("button", { name: "Next question" })
      .evaluate((el) => getComputedStyle(el).transitionDuration),
  ).toBe("0s");
  await page.getByRole("button", { name: "End session", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});
test("privacy: no private content requests to remote hosts", async ({
  page,
}) => {
  const requests: { url: string; body: string }[] = [];
  page.on("request", (r) =>
    requests.push({ url: r.url(), body: r.postData() || "" }),
  );
  await ready(page);
  await page
    .getByLabel("Job description")
    .fill("Sample private description CANARY-JOB-812");
  await page.getByRole("button", { name: "Enter the practice room" }).click();
  await page
    .getByLabel("Your answer", { exact: true })
    .fill(sample + " CANARY-ANSWER-812");
  await page.getByRole("button", { name: "Get coaching notes" }).click();
  await expect(
    page.getByRole("region", { name: "Answer feedback" }),
  ).toBeVisible();
  expect(
    requests.filter((r) => new URL(r.url).hostname !== "127.0.0.1"),
  ).toEqual([]);
  expect(requests.some((r) => r.body.includes("CANARY-JOB-812"))).toBeTruthy();
  expect(
    requests.some((r) => r.body.includes("CANARY-ANSWER-812")),
  ).toBeTruthy();
});
for (const size of [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 720 },
])
  test(`layout and visual baselines ${size.width}`, async ({ page }) => {
    await page.setViewportSize(size);
    await ready(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await expect(page).toHaveScreenshot(`setup-${size.width}.png`, {
      fullPage: true,
    });
    await page.screenshot({
      path: `evidence/setup-${size.width}.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "Enter the practice room" }).click();
    await expect(
      page.getByText("Question 1 of 5", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await expect(page).toHaveScreenshot(`session-${size.width}.png`, {
      fullPage: true,
    });
    await page.screenshot({
      path: `evidence/session-${size.width}.png`,
      fullPage: true,
    });
    await coach(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page
      .getByRole("button", { name: "End session", exact: true })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await expect(page).toHaveScreenshot(`recap-${size.width}.png`, {
      fullPage: true,
    });
    await page.screenshot({
      path: `evidence/recap-${size.width}.png`,
      fullPage: true,
    });
  });
test("accessibility: setup, active session, feedback and recap", async ({
  page,
}) => {
  await ready(page);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Enter the practice room" }).click();
  await expect(
    page.getByText("Question 1 of 5", { exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await coach(page);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "End session", exact: true }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
