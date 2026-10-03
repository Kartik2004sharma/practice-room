# Practice Room — acceptance contract

Started 2026-10-03, during the official October 2–5 entry window. Deadline: October 5, 06:59 UTC / 12:29 IST. About 43 hours remained at planning time. Final eligibility belongs to the organizers.

## Real use case

The owner reports a real friend preparing for junior SWE interviews, struggling with confidence and other unspecified factors. No name, personal history, accessibility need, outcome or testimonial is inferred. Build calm, repeatable practice in explaining projects, fundamentals, and behavioral examples. Coaching aids are not hiring predictions.

## Build

New directory; do not modify synced sources. React + TypeScript + Vite, local Node server, npm. Paper/ink/teal interview studio with no external fonts, analytics or media. Default five-question session, role + optional job description, mixed/behavioral/technical, timer off by default. Answer → validated answer-grounded feedback → optional one follow-up → next question → recap. Skip, end early, retry, cancellation, local review and deletion.

Ollama with exact default tag gemma3:1b (official library checked). Apple Silicon, 8 GB RAM; runtime was absent at inspection. Install runtime in an ignored project-local directory and attempt actual inference. Bind app and runtime to loopback only. Limit input, concurrency, model output and total generation time. Validate requests/responses with Zod; at most two constrained regenerations. Job descriptions and answers are untrusted data. No cloud fallback. Store completed/ended sessions in browser localStorage only; no server content logs.

## Fixed acceptance checklist

- [ ] Real local Gemma produces questions and feedback, with evidence excerpts validated against the answer.
- [ ] Purpose/status, required/optional validation, five sequential questions, hidden feedback until submit.
- [ ] Specific strength, improvement, next step, evidence, coaching rubric and optional structure.
- [ ] One follow-up, editable answer, skip, early end, completion, recap, review and deletion.
- [ ] Missing model, slow model, malformed output and request failures are recoverable; cancel preserves drafts.
- [ ] Production build has no browser errors; keyboard focus, labels, announcements and reduced motion work.
- [ ] 375×812, 768×1024, 1280×720 screenshots, initial baselines, regression comparison and no overflow.
- [ ] Playwright deterministic adapter is test-only, clearly labeled, unavailable in normal app; separate real-model smoke.
- [ ] No practice content requests to remote hosts; loopback-only server and same-origin mutation checks.
- [ ] Lint, types, build, browser suite, axe on setup/session/recap, real model check actually run.
- [ ] README: setup, exact model, privacy, limits, evidence. Actual model-flow recording and submission draft using official template.
- [ ] Code/demo publication links only if real; owner approves external publication. No invented friend feedback.

## Judge and repair bounds

At most five full iterations; at most three root-cause repairs per acceptance failure. Never weaken tests to hide a failure. Separate reviewer verifies without modifying acceptance/tests. Log failure, cause, repair and result in ITERATIONS.md. Human owner makes final acceptance decision.

## Demo

Record actual local model interaction using explicitly labeled synthetic candidate answers, inspect the recording, and keep it local. Prepare DEV draft with official headings/tags. Repository and demo URLs stay pending unless publication is authorized; no external submissions.
