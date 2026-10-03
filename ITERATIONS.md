# Iteration log

## Iteration 1 — initial implementation

- Initial lint, typecheck and production build passed. Vite reported two third-party Zod annotation warnings; output was produced.
- API test: custom Host header sent by Node fetch was normalized, so the test did not exercise host rebinding. Direct curl with Host: evil.example returned the expected refusal. Repair 1: use node:http to send the actual header, preserving the original 403 acceptance requirement. Focused rerun pending.
- Found stale retry callback after successful requests during code inspection. Cleared it on success so an unrelated browser-storage error cannot offer an old generation request.
- Browser, screenshot baseline and model checks in progress. No claims of a complete pass yet.

## Iteration 2 — acceptance repairs

- API transport repair focused rerun: 4/4 server tests passed.
- First browser run: 12 passed, 2 failed. Nine initial screenshot baselines created; axe passed setup, session, feedback and recap.
- Validation assertion failure: ValidityState's inherited properties serialize to an empty object in Playwright. Repair 1: evaluate the actual validity.valid boolean; unchanged requirement to reject empty and too-short inputs.
- Keyboard failure: initial setup heading autofocus moved the starting tab position past the skip link. Repair 1: avoid autofocus on setup; preserve heading focus after entering session, feedback and recap. Rerun focused keyboard and validation checks, then full suite.
- Reviewed the desktop screenshot: restrained paper/ink/teal composition, usable form, no overlap. Mobile/tablet visual review pending.

## Iteration 3 — independent review and real model

- Focused validation/keyboard rerun: 2 passed. Full browser rerun: 14 passed, including nine screenshot comparisons. Independent judge lint, types and server checks passed.
- Full-page screenshots exposed offscreen fixed skip-link capture artifact after heading scrolling. Set hidden link to absolute positioning and focused link to fixed positioning; regenerated only the affected initial visual baselines, then all nine comparisons passed.
- Judge identified a substantive stale-answer retry issue after editing a failed response. Repair 1: invalidate retry and clear error when editing profile/answer, on cancellation and when leaving the response flow; require fresh submission for edited text. Added regression that checks feedback evidence and the saved revised answer. Focused rerun pending.
- Real Gemma smoke: question generation succeeded, feedback rejected after initial + two constrained repairs. Investigating using synthetic sample-only debug output; no fallback or validation weakening.

- Root cause: 1B Gemma invented a quote in the initial attempt, then wrapped genuine excerpts in extra single quotes. Real-model repair 1: per-request JSON schema now constrains evidence to actual answer excerpts and validates that enum plus the original substring check. Server 4/4 and real model smoke then passed. Independent reviewer approved this stronger validation.
- Quality inspection found the model selected the synthetic label “Sample candidate answer” as evidence. Real-model repair 2: exclude sample-only labels from excerpt choices and explicitly require evidence supporting a coaching point; clarify that metrics must really have been measured. This tightens grounding without changing the acceptance contract. Focused real-model rerun pending.
- Stale-answer regression focused rerun passed. Independent reviewer confirms edited drafts cannot reuse old request feedback.

## Iteration 4 — final quality gate

- Full suite with stale-answer regression: 15/15 browser tests passed; all nine screenshot comparisons passed. Separate axe run passed. Independent judge approves retry/grounding repairs.
- Inspected actual 1B output beyond schema success: unsupported claim about trade-offs, a stray markup fragment, and pressure to estimate unmeasured metrics. The 1B model is not accepted for final coaching quality; its recording is retained only as rejected development evidence.
- Real-model repair 3 (last permitted for this quality failure): evaluate official `gemma3:4b-it-qat` locally. Its installation and quality/performance check are pending; do not claim that gate passed yet.
- Improved feedback focus to its own coaching heading and made the skip target focusable. Focused keyboard/axe/three-viewports rerun: 5 passed. No screenshot baselines needed to change for this update.
- Added privacy-safe model runtime launcher (loopback, cloud/history/content-debug logging disabled), and corrected Vite development CSP for its local scripts/styles/websocket. Production CSP unchanged.
- Server tests expanded with a substantive excerpt-schema assertion: 5/5 passed. Development-server browser smoke rendered with zero page/console errors.
- QAT download repeatedly stalled across all parts, with progress rolling back. Cancelled that transfer and switched to the official smaller `gemma3:4b` Q4_K_M tag for the same final 4B evaluation. This is a setup recovery before inference, not another model-quality test or a lowered gate.

## Iteration 5 — final acceptance and delivery

- Official gemma3:4b Q4_K_M installed and set as the normal default. Real smoke passed with actual question and feedback, an exact supporting answer excerpt and no invented candidate experience. No fallback was used.
- Final lint, types and production build passed; server 5/5, browser 15/15, standalone axe and nine visual comparisons passed. No acceptance criteria were weakened.
- Independent judge inspected the final 4B sample and accepted basic coaching quality, with limits: the improvement could better address the missing decision reasoning and the structure score was harsh. One synthetic sample cannot establish broad coaching accuracy or interview outcomes.
- Real 4B browser recording exercised answer coaching, next question, skip, early recap, saved review and deletion with zero page errors. Media inspection caught a blank lead-in and full-page screenshot resize artifacts; recording screenshots were changed to viewport captures before a fresh actual-model recording. This is a media capture repair, with app behavior unchanged.
- Source, privacy/setup instructions, verification evidence and the official DEV submission draft are prepared locally. Friend feedback and external publication remain owner-controlled gates.
