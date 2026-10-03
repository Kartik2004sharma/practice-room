import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { modelTag } from "../server/model.js";
const action = process.argv[2];
if (action !== "serve" && action !== "pull")
  throw new Error("Use model:serve or model:pull.");
const local = existsSync(".runtime/ollama");
const child = spawn(
  local ? resolve(".runtime/ollama") : "ollama",
  action === "serve" ? ["serve"] : ["pull", modelTag],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      OLLAMA_HOST: "127.0.0.1:11434",
      OLLAMA_NO_CLOUD: "1",
      OLLAMA_NOHISTORY: "1",
      OLLAMA_DEBUG_LOG_REQUESTS: "false",
      ...(local ? { OLLAMA_MODELS: resolve(".runtime/models") } : {}),
    },
  },
);
child.on("error", () => {
  console.error(
    "Ollama is unavailable. Install it from https://ollama.com/download, then retry.",
  );
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 0));
process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
