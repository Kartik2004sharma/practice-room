# Actual local-model demo

[Open the recording](practice-room-demo.mp4). The working local app is http://127.0.0.1:3000; this loopback address is not a public hosted link.

Recorded October 3, 2026 against the normal production app with actual local `gemma3:4b` Q4_K_M. The recorder refuses a test adapter. All candidate and job text is explicitly labeled synthetic sample content. Actual API output is in `demo-model-output.json`, with zero browser page errors.

The recording shows setup, an actual question, submitting an answer, answer-grounded coaching and rubric, next question, skip, early recap, saved review and data deletion. The recap accurately reports one answered and two skipped questions. No follow-up was offered by Gemma in this run; follow-up and full five-question completion are covered separately by deterministic browser tests. No friend outcome or testimonial is claimed.

Export: H.264, 1280×720, 25 fps, yuv420p, fast-start MP4, 265.64 seconds, silent. Only the initial two seconds of browser startup were trimmed; actual inference waits remain visible. On this 8 GB M1 the local model can be slow. This is an evidence recording rather than an edited promotional video.

Visual inspection reviewed the opening, sampled question/answer/feedback screens, recap and deletion. The original capture's screenshot resize artifacts were repaired using viewport screenshots and a fresh real-model recording. Final sampled frames have the correct viewport and no grey bars. The earlier Gemma 1B recording was rejected for coaching quality and is not the final demo.

No public upload, publication or submission has been made. The owner must approve a sharing destination and fill its genuine URL in the DEV draft before submission. Model weights and generated video are kept out of the source commit; the final MP4 is delivered locally.
