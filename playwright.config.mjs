import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { defineConfig } from "@playwright/test";

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

// Serve minimal ComfyUI stubs at /scripts/* so the production bundles under
// /web/*.js (which import ../../scripts/app.js) load in the test server.
const serveComfyStubs = {
  name: "omnicam-comfy-stubs",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === "/scripts/app.js" || req.url === "/scripts/api.js") {
        const name = req.url.endsWith("app.js") ? "app.js" : "api.js";
        const code = await readFile(new URL(`./tests/frontend/stubs/${name}`, import.meta.url), "utf8");
        res.setHeader("content-type", "text/javascript");
        res.end(code);
        return;
      }
      next();
    });
  },
};

export default defineConfig({
  testDir: "tests/frontend",
  testIgnore: "**/live-*.spec.js",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    launchOptions: existsSync(edge) ? { executablePath: edge } : {},
  },
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173 --config vite.test.config.mjs",
    url: "http://127.0.0.1:4173/tests/frontend/harness.html",
    reuseExistingServer: false,
    timeout: 60_000,
    // Without a bounded shutdown the runner can sit waiting on the dev server
    // after every test has already reported: on Windows a SIGTERM does not
    // always reach the child of the spawned shell. Ask politely, then stop
    // waiting. (Not reproduced locally -- this bounds the failure either way.)
    gracefulShutdown: { signal: "SIGTERM", timeout: 5_000 },
  },
});
