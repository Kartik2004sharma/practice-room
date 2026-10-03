import { createApp } from "./app.js";
import { ollama } from "./model.js";
const app = createApp(ollama, !process.argv.includes("--dev"));
if (process.argv.includes("--dev")) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
app.listen(Number(process.env.PORT || 3000), "127.0.0.1", () =>
  console.log("Practice Room: http://127.0.0.1:" + (process.env.PORT || 3000)),
);
