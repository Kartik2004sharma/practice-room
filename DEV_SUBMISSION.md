---
title: "Practice Room: a private interview coach for a friend"
published: false
tags: devchallenge, weekendchallenge, hf26challenge
---

_This is a submission draft for the [Hacktoberfest Weekend Challenge: Build for a Friend](https://dev.to/challenges/hacktoberfest-weekend-2026-10-01). It has not been submitted._

## What I Built

Practice Room is a local interview-practice coach for a real friend preparing for junior software engineering interviews. They struggle with confidence and clearing interviews. I do not know all the other factors involved, so the app focuses on one practical need: a private place to explain their thinking, receive concrete notes and practice again at their own pace.

There is no signup or audience. Enter a target role and an optional job description, choose an interview type, and work through five questions one at a time. After an answer, the coach gives a specific strength, an improvement, a short next step and a quote from the answer. It can ask one follow-up. The friend can skip, stop early, review locally saved sessions or delete their data. The optional timer counts up without imposing a time limit.

I intentionally label rubric scores as coaching aids. The app does not estimate hiring chances or pretend to know what a recruiter will decide. My friend has not yet provided a testimonial or measured improvement, and I will not claim either.

## Demo

[Local inspected recording](evidence/practice-room-demo.mp4) · [Captured scope and limits](evidence/DEMO.md).

**Owner action before publishing:** upload the inspected actual-model recording in `evidence/practice-room-demo.mp4` to an approved location and insert its real link here. The local working app is http://127.0.0.1:3000; that loopback address is not a public deployment.

The recording uses labeled synthetic candidate text. Questions and feedback come from the actual local Gemma model, not browser-test fixtures. See the final demo/verification notes for exactly which steps were captured.

## Code

[Local source and setup guide](README.md) · [Executed verification](VERIFICATION.md).

**Owner action before publishing:** publish the new `practice-room` repository and insert its real code URL here. No repository URL is invented. The code and setup guide are prepared locally.

## How I Built It

I started this new project on October 3, 2026, within the challenge's published entry period. React and TypeScript provide a small interview studio; an Express route on the same machine calls Ollama. I started with Gemma 3 1B on the available Apple M1 with 8 GB memory, then rejected its coaching quality after inspecting real output. The final model is `gemma3:4b` Q4_K_M. It produced a validated question and answer-grounded coaching in the separate real-model smoke check. I inspected the output for quality rather than treating schema success alone as enough.

Open-weight AI is central: Gemma generates each interview question, reads each submitted answer and produces answer-specific coaching and an optional follow-up. Strict schemas validate the result, and quoted evidence must actually occur in the answer. After at most two repair generations, malformed output produces a recoverable error rather than fake coaching. Recaps reuse those coaching notes locally.

The app sends no practice content to a cloud provider. Sessions stay in the current browser, and the owner can delete them. Job descriptions are untrusted reference material, separated from model rules. Prompt instructions and exact quote checks reduce risk, but local AI can still be inaccurate; this is a coach to practice with, not an authority on employability.

The production-build browser suite exercises completion, follow-up, skip, early end, deletion, model errors, keyboard use, reduced motion and responsive layouts. Deterministic tests use a separate, unmistakably labeled adapter. A separate real-model smoke check verifies actual Gemma inference. The final executed counts and limits are recorded in `VERIFICATION.md`; the initial build exposed failures that were repaired rather than hidden.

## Why Does Open Innovation Matter?

Interview practice can include tentative answers, mistakes and unfinished explanations. For this friend's confidence-focused practice, running the model locally offers a place to try without uploading those answers to an AI service. After installation, the app's practice requests need only the local runtime. There is no per-answer API bill or AI account to create.

Open weights also make the runtime and selected model visible and replaceable. The trade-off is real: setup requires a model download, a small model may be less consistent, and output validation sometimes rejects its response. Privacy and control are the reasons for that choice, not a claim that local AI is always better.

## My Agent Session

An AI coding assistant helped implement and verify the app. The local plan, bounded iteration log and independent review findings document the process. No public agent-session link has been created; add one only if the owner chooses to share a reviewed session.

## Prize Categories

Intended category: **Best Use of Gemma**, subject to the owner reviewing the verified local-model results and the organizers' eligibility decision. No unrelated partner technology is claimed.

<!-- Do not publish until the owner reviews the completed demo, fills genuine code/demo links, checks final verification, and approves submission. No friend feedback has been invented. -->
