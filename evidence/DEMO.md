# Demo status

The working local app is http://127.0.0.1:3000. This is a loopback demo on the owner's machine, not a public hosted link.

The initial real Gemma 1B recording successfully exercised question, feedback, a follow-up, advancing/skipping, ending early, recap, saved review and deletion. However, inspection rejected its coaching quality. It must not be used as the final product demo. Rejected development media is kept under ignored `.runtime/rejected-demo/`.

Final recording pending the larger local Gemma quality gate. The planned actual recording uses labeled synthetic candidate/job text, real local inference, and no adapter. `npm run demo:record` requires the real production app on port 3000 and refuses test-mode status. It records an early-ended practice session rather than implying that all five questions were answered. Full five-question behavior is separately covered by the deterministic browser acceptance suite.

No public upload, publication or submission has been made. The owner must approve a sharing destination and fill its genuine URL in the DEV draft before submission.
