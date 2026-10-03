# Practice Room — acceptance contract

Started 2026-10-03, during the official October 2–5 entry window. Deadline: October 5, 06:59 UTC / 12:29 IST. About 43 hours remained at planning time. Final eligibility belongs to the organizers.

## Real use case

The owner reports a real friend preparing for junior SWE interviews, struggling with confidence and other unspecified factors. No name, personal history, accessibility need, outcome or testimonial is inferred. Build calm, repeatable practice in explaining projects, fundamentals, and behavioral examples. Coaching aids are not hiring predictions.

## Build

New directory; do not modify synced sources. React + TypeScript + Vite, local Node server, npm. Paper/ink/teal interview studio with no external fonts, analytics or media. Default five-question session, role + optional job description, mixed/behavioral/technical, timer off by default. Answer → validated answer-grounded feedback → optional one follow-up → next question → recap. Skip, end early, retry, cancellation, local review and deletion.

Initial plan: Ollama with gemma3:1b (official library checked). Final validated default: gemma3:4b Q4_K_M after the 1B quality rejection; see ITERATIONS.md. Apple Silicon, 8 GB RAM; runtime was absent at inspection. Install runtime in an ignored project-local directory and attempt actual inference. Bind app and runtime to loopback only. Limit input, concurrency, model output and total generation time. Validate requests/responses with Zod; at most two constrained regenerations. Job descriptions and answers are untrusted data. No cloud fallback. Store completed/ended sessions in browser localStorage only; no server content logs.

## Fixed acceptance checklist

- [x] Real local Gemma produces questions and feedback, with evidence excerpts validated against the answer.
- [x] Purpose/status, required/optional validation, five sequential questions, hidden feedback until submit.
- [x] Specific strength, improvement, next step, evidence, coaching rubric and optional structure.
- [x] One follow-up, editable answer, skip, early end, completion, recap, review and deletion.
- [x] Missing model, slow model, malformed output and request failures are recoverable; cancel preserves drafts.
- [x] Production build has no browser errors; keyboard focus, labels, announcements and reduced motion work.
- [x] 375×812, 768×1024, 1280×720 screenshots, initial baselines, regression comparison and no overflow.
- [x] Playwright deterministic adapter is test-only, clearly labeled, unavailable in normal app; separate real-model smoke.
- [x] No practice content requests to remote hosts; loopback-only server and same-origin mutation checks.
- [x] Lint, types, build, browser suite, axe on setup/session/recap, real model check actually run.
- [x] README: setup, exact model, privacy, limits, evidence. Actual model-flow recording and submission draft using official template.
- [ ] Code/demo publication links only if real; owner approves external publication. No invented friend feedback.

## Judge and repair bounds

At most five full iterations; at most three root-cause repairs per acceptance failure. Never weaken tests to hide a failure. Separate reviewer verifies without modifying acceptance/tests. Log failure, cause, repair and result in ITERATIONS.md. Human owner makes final acceptance decision.

## Demo

Record actual local model interaction using explicitly labeled synthetic candidate answers, inspect the recording, and keep it local. Prepare DEV draft with official headings/tags. Repository and demo URLs stay pending unless publication is authorized; no external submissions.

## Final status

The technical build and local delivery gates passed in iteration 5. The final default is gemma3:4b; real-model evidence is separate from the 15 browser tests and 5 server tests. The inspected local recording and DEV draft are prepared. Public code/demo publication, owner acceptance and real friend handover remain open. See VERIFICATION.md for executed checks and model limits.
