// This entry point is only invoked by Playwright, never by start/dev or browser controls.
import express from "express";
import { createApp } from "../server/app.js";
import { adapter, setScenario } from "./adapter.js";
const app = express();
app.post("/__test/scenario", express.json(), (req, res) => {
  setScenario(req.body.value);
  res.json({ ok: true });
});
app.use(createApp(adapter));
app.listen(3100, "127.0.0.1");
