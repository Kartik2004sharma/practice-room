import express from "express";
import path from "node:path";
import { FeedbackRequest, QuestionRequest } from "../shared/contracts.js";
import { ModelError, type Model } from "./model.js";
export function createApp(model: Model, serveFiles = true) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    const host = req.headers.host || "";
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) {
      res.status(403).json({ message: "Use a local address." });
      return;
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader(
      "Content-Security-Policy",
      serveFiles
        ? "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        : "default-src 'self'; connect-src 'self' ws://127.0.0.1:* ws://localhost:*; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    );
    res.setHeader(
      "Permissions-Policy",
      "microphone=(), camera=(), geolocation=()",
    );
    if (req.path.startsWith("/api")) res.setHeader("Cache-Control", "no-store");
    if (req.method === "POST" && req.headers.origin !== `http://${host}`) {
      res
        .status(403)
        .json({ message: "Practice requests must come from this local app." });
      return;
    }
    next();
  });
  app.use(express.json({ limit: "48kb" }));
  app.get("/api/status", async (_req, res) => res.json(await model.status()));
  let busy = false;
  app.post("/api/:action", async (req, res) => {
    const action = req.params.action;
    if (action !== "question" && action !== "feedback") {
      res.status(404).json({ message: "Unknown practice action." });
      return;
    }
    const parsed = (
      action === "question" ? QuestionRequest : FeedbackRequest
    ).safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          code: "validation",
          message:
            "Please check your inputs. Role: 3–120 characters; job description: up to 6,000; answer: 10–4,000.",
        });
      return;
    }
    if (busy) {
      res
        .status(429)
        .json({
          code: "busy",
          message:
            "The local coach is finishing another request. Try again shortly.",
        });
      return;
    }
    busy = true;
    const controller = new AbortController();
    res.on("close", () => {
      if (!res.writableEnded) controller.abort();
    });
    try {
      const result =
        action === "question"
          ? await model.question(
              QuestionRequest.parse(req.body),
              controller.signal,
            )
          : await model.feedback(
              FeedbackRequest.parse(req.body),
              controller.signal,
            );
      if (!controller.signal.aborted) res.json(result);
    } catch (error) {
      const e =
        error instanceof ModelError
          ? error
          : new ModelError(
              "failure",
              "The local coach could not finish. Please retry.",
              502,
            );
      if (!res.destroyed)
        res.status(e.statusCode).json({ code: e.code, message: e.message });
    } finally {
      busy = false;
    }
  });
  if (serveFiles) {
    app.use(express.static(path.resolve("dist")));
    app.get("/{*path}", (_req, res) =>
      res.sendFile(path.resolve("dist/index.html")),
    );
  }
  app.use(
    (
      error: { status?: number },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      void _next;
      res
        .status(error.status === 413 ? 413 : 400)
        .json({
          message:
            "The request is too large or unreadable. Shorten the input and retry.",
        });
    },
  );
  return app;
}
