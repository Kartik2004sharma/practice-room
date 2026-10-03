# Verification — owner review evidence

Last status recorded October 3, 2026. This document separates executed technical checks from model-quality and publication gates. No contest completion or user outcome is claimed.

| Check                                      | Executed result                                                 | Evidence / scope                                                                                                               |
| ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`                             | Passed                                                          | ESLint; independent judge also ran it                                                                                          |
| `npm run typecheck`                        | Passed                                                          | TypeScript; independent judge also ran it                                                                                      |
| `npm run build`                            | Passed                                                          | Vite production output; two harmless third-party Zod annotation warnings                                                       |
| `npm run test:server`                      | Passed, 5 tests                                                 | Strict quote/follow-up validation, excerpt enum, three-attempt bound, untrusted data placement, origin/Host/input size checks  |
| `npm run test:e2e`                         | Passed, 15 tests on the last full run                           | Production build with isolated deterministic adapter; includes revised-answer retry regression                                 |
| `npm run test:a11y`                        | Passed                                                          | axe WCAG 2 A/AA, 2.1 AA, 2.2 AA tags: setup, session, feedback, recap                                                          |
| Focus/visual checks after usability update | Passed, 5 focused tests                                         | Keyboard, axe and three screen sizes                                                                                           |
| Visual regression                          | Passed, 9 comparisons                                           | Setup/session/recap at 375×812, 768×1024, 1280×720; baselines generated first, then compared without updating                  |
| Remote-request guard                       | Passed                                                          | Canary job and answer; all browser requests remain 127.0.0.1, production CSP and fixed loopback model URL inspected separately |
| Development server smoke                   | Passed                                                          | Production-like local API with Vite; UI rendered at port 3002, no page/console errors                                          |
| `npm run test:model`, initial Gemma 1B     | Format/quote validation eventually passed; **quality rejected** | Actual inference inspected; no scripted output. Early failures and unsuitable claims are recorded in ITERATIONS.md             |
| Larger Gemma quality/performance           | Passed actual local smoke; sample manually inspected                                 | `gemma3:4b` Q4_K_M, exact answer excerpt, concrete strength/improvement/suggestion, no invented experience. One sample is not an exhaustive quality evaluation.                                                                           |
| Real-model video                           | Passed actual 4B capture and export inspection                  | Synthetic sample; coaching, advance, skip, early recap, review and deletion; no follow-up offered; zero page errors. See evidence/DEMO.md. |
| Independent judge                          | Reviewed; identified retry bug now repaired                     | Read-only code/privacy/adapter review, lint/types/API checks and follow-up approval                                            |

## Behavioral coverage

Required/optional inputs, model status/setup, one question at a time, hidden feedback until submission, answer-specific feedback fields, rubric/evidence rendering, follow-up, five-question completion, skip, early end, recap review, deletion, timer off/on, malformed/failure/timeout recovery, slow cancellation, draft preservation, edited-answer freshness, keyboard focus, reduced motion, overflow and remote-host traffic. Failure traces are retained by Playwright; generated reports are ignored runtime outputs, not fictional evidence.

The deterministic adapter intentionally does not prove Gemma quality. Model tests and the actual recording are separate. The smoke check only writes explicitly labeled synthetic sample data. This app does not imply that a green test suite proves a friend will clear an interview.

## Manual/independent inspection

Reviewed mobile and desktop screens for reading order, spacing and overlapping controls. The keyboard test exercised visible focus, labels and transitions through setup, answer, feedback and recap. Subsequent focus inspection moved new feedback focus to the coaching heading and enabled the skip target. Axe checked contrast automatically, and paper/ink/teal text/actions were visually reviewed. Live regions provide status/error announcements. This is not a full screen-reader/device certification; Safari, Firefox and an actual friend's device remain untested.

Independent review confirmed: app/runtime target loopback, input/output validation, one concurrent server generation, three total attempts, 90-second total bound, no content logs/remote assets, localStorage deletion and isolated test adapter. It also cautioned that exact quote validation does not prove every generative claim true. That caution motivated inspecting and rejecting the 1B coaching rather than accepting schema success alone.

The judge inspected the final real 4B sample and accepted basic coaching quality: a relevant question, an answer-specific strength, exact supporting evidence and an actionable invitation without invented experience or a hiring prediction. It also found the improvement could focus more directly on missing decision reasoning, and the structure score was harsh. These limits remain visible; one synthetic sample does not establish broad accuracy. Actual inference can be slow on the available 8 GB M1, and requests can reach the bounded timeout.

## Outstanding owner-controlled gates

- Actual friend handover and any consented feedback: not yet obtained; none invented.
- Public code and demo links: pending owner-approved publication destination; local code/app/media only.
- DEV submission: draft prepared using the official template and tags; not published.
- Final acceptance/eligibility: owner's review and organizers' decision. Challenge deadline confirmed from the official page: October 5, 06:59 UTC / 12:29 PM IST.
