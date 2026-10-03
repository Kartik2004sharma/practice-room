# Practice Room

A private interview studio for a real friend preparing for junior software engineering interviews and struggling with confidence. Practice answering in your own words, get one concrete strength and improvement grounded in what you wrote, and return with a manageable next step. No invented personal history or testimonials.

New project started October 3, 2026, for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01). The official entry period is October 2, 02:00 UTC through October 5, 06:59 UTC (12:29 PM IST). Organizer eligibility and the owner's acceptance remain pending; any post-deadline commits must be identified here.

## Run locally

Requires Node.js 22.12+ (tested here with 25.9.0), npm, and Ollama. Install [Ollama](https://ollama.com/download) for your operating system. Then:

```sh
ollama serve
```

In another terminal:

```sh
ollama pull gemma3:4b
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:3000**. No account, API key or remote database. If port 3000 is in use, `PORT=3001 npm start` binds to 127.0.0.1:3001. `npm run dev` runs the same local API with Vite middleware; acceptance tests use the production build.

Convenience commands: after `npm ci`, `npm run model:serve` starts either the prepared project-local runtime or an installed Ollama with cloud mode/history/debug content logging disabled. In another terminal, `npm run model:pull` downloads the configured model. `npm run demo:record` creates a real-model local recording when the production app is running.

### Runtime already prepared on this machine

An ignored `.runtime/` directory contains the official Ollama **v0.35.1** Darwin runtime and the downloaded model. The default global Ollama model directory is not used by this prepared runtime. Start it from this project directory:

```sh
OLLAMA_NO_CLOUD=1 OLLAMA_NOHISTORY=1 OLLAMA_HOST=127.0.0.1:11434 OLLAMA_MODELS="$PWD/.runtime/models" .runtime/ollama serve
```

If that runtime is already running, do not start another on port 11434. These ignored runtime/model files are not in the code repository. Model installation initially requires internet access and approximately 3.3 GB download; practice itself uses local inference. Runtime startup/download behavior is separate from the app's practice requests. The recorded checks used Apple M1 with 8 GB unified memory.

## Exactly where Gemma is used

Configured instruct model: **`gemma3:4b`**, GGUF **Q4_K_M**, selected from the current [official Ollama library](https://ollama.com/library/gemma3:4b). Download and final quality/performance checks are pending; the app shows unavailable until installed. The initial **`gemma3:1b`** (digest `8648f39daa8fbf5b18c7b4e6a8fb4990c692751d49917417b8842ca5758e7ffc`) was actually run but rejected for coaching quality. Model weights have Gemma's own terms; the code's MIT license does not replace them.

1. `POST /api/question`: Gemma generates the next role/type/job-aware question; previous question texts help avoid repetition.
2. `POST /api/feedback`: Gemma reads the submitted question and answer and generates strength, improvement, suggestion, evidence, four rubric scores, optional structure and one optional follow-up. Its per-request structured schema limits evidence to excerpts from the actual submitted answer, then validates the exact substring again.
3. Follow-up feedback is another real Gemma call, with further follow-ups forbidden by validation.
4. Recap is assembled locally from the verified feedback already received. It is not presented as a new AI judgment.

React never contacts Ollama or a remote AI host directly. The Express server calls only `http://127.0.0.1:11434/api/chat`, using Ollama's [structured-output API](https://docs.ollama.com/api/chat). `OLLAMA_MODEL` can select a supported local instruct variant; the original 1B variant failed the accepted coaching quality gate. The connection display reports the configured tag. Unsupported/cloud tags fail at startup.

No scripted model responses exist in normal `start` or `dev`. The separate test-server entry point injects the deterministic test adapter and displays a prominent **TEST ADAPTER** banner and a test-only model name. There is no browser setting, query parameter, production environment flag or fallback selecting it.

## Practice workflow

Enter a role (default junior SWE), optionally paste a job description, and choose mixed, behavioral or role-specific practice. Confirm the local model is ready. Answer five questions one at a time. Edit before submission; feedback is hidden until submission. A follow-up is offered only when Gemma returns one. Skip, end early, disable the optional elapsed timer, or cancel a slow request without losing the in-memory draft. Scores are labeled **coaching aids, not employability judgments**.

The recap includes submitted answers, feedback and up to three actionable suggestions taken from those answers. Saved sessions can be reopened. Delete practice data removes this app's stored sessions and resets the displayed role/description/answers. Deletion is immediate and reversible only if you independently kept a copy.

## Data and security

- Practice content is never sent to third-party services. No remote fonts, images, analytics, tracking, cloud fallback or remote logs.
- Completed and early-ended sessions are stored in this browser's `localStorage` under `practice-room:sessions:v1`: role, optional job description, question/answer text, feedback, model tag, timestamp. At most 30 sessions. Unsubmitted drafts survive cancellation but not refresh. Session history is not stored by the app server.
- Use **Delete practice data** or your browser's site-data controls. Private browsing may discard saved sessions; disabled/full storage shows a clear warning. Any separate recordings or screenshots you create are independent copies and are not deleted by that action. Do not share a browser profile if you need confidentiality from other users of the device.
- Server binds to loopback, rejects non-local Host headers and mismatched/missing mutation origins, and sends a restrictive production Content Security Policy. Browser tests assert all requests stay on the local host. There is no full content logging in the application server; Ollama's debug request logging remains off.
- Job descriptions and answers are JSON reference data, not system instructions. Model rules forbid invented candidate facts or hiring predictions. Exact quoted evidence must be a substring of the submitted answer. This guards the quote; **it cannot guarantee every model coaching claim is correct**. Review notes critically. This is practice assistance, not diagnosis, hiring advice or a measure of someone's worth.

## Bounds and recovery

Role 3–120 characters; description at most 6,000; answer 10–4,000. Strict typed Zod schemas validate API input and model output at runtime. One generation request at a time. Each operation has a 90-second overall generation limit and an output token budget. Malformed output permits **two constrained regenerations** after the initial attempt, then fails visibly. No fixture replaces failure. Evidence mismatches and extra follow-ups fail validation. Requests can be cancelled; retrying unchanged text or submitting edited text is explicit. A missing runtime/model shows local installation instructions and a connection recheck.

Small local models can be slow, repetitive, inaccurate or fail validation, especially with long descriptions. This MVP does not execute code, score programming exercises, use microphone input, diagnose confidence problems or promise interview success. English typed practice is the current scope; no other language/device need was provided.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npm run test:server
npx playwright install chromium
npm run test:e2e
npm run test:a11y
npm run test:model
```

Run browser tests after building. Playwright starts a dedicated localhost test server on port 3100; keep it free. Tests use semantic controls, failure traces, deterministic sample answers and a clearly labeled test adapter. Screenshot baselines live in `tests/practice.spec.ts-snapshots/`. First creation is not itself a regression pass: subsequent runs must compare without `--update-snapshots`. Intentional visual changes require review before updating them.

See **[VERIFICATION.md](VERIFICATION.md)** for final executed results and limitations, **[ITERATIONS.md](ITERATIONS.md)** for the bounded repair log, and **[PLAN.md](PLAN.md)** for the fixed acceptance contract. Real-model smoke output, screenshots and the recording use explicitly labeled synthetic sample content, not the friend's personal answers. `MODEL_SMOKE_DEBUG=1 npm run test:model` is a sample-only diagnostic option that writes ignored runtime diagnostics; do not use it with private candidate data.

## Demo and submission

The local app at http://127.0.0.1:3000 is the working demo on this machine. `scripts/record-demo.ts` records the actual production app with real configured Gemma using synthetic sample text; it refuses a test adapter. Local recording and review details are in `evidence/DEMO.md`. No static screenshot or adapter recording is called an AI demo.

**[DEV_SUBMISSION.md](DEV_SUBMISSION.md)** follows the official challenge template and required tags. Repository/demo publication URLs and friend handover feedback must be filled only when real. No external publication or DEV submission has been made. Review and final acceptance belong to the project owner.

## Project map

`src/`: studio UI and responsive CSS. `shared/`: runtime/type contracts. `server/`: loopback API and real Ollama adapter. `tests/`: browser acceptance, isolated adapter, API/validation checks. `scripts/`: model smoke and actual-flow recording. `evidence/`: screenshots, verification notes and local media. Dependencies: React, TypeScript, Vite, Express, Zod, Playwright and axe-core; no visual-animation library.
