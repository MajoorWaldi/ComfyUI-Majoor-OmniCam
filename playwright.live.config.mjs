import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { defineConfig } from "@playwright/test";

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const comfyRoot = process.env.OMNICAM_COMFYUI_ROOT
  ? resolve(process.env.OMNICAM_COMFYUI_ROOT)
  : resolve(import.meta.dirname, "../..");
const python = process.env.OMNICAM_COMFYUI_PYTHON || "python";
const port = Number(process.env.OMNICAM_LIVE_PORT || 8191);
const customNodeName = basename(import.meta.dirname);

// Test-only knob. Lets a CI lane pin a specific frontend
// (`--front-end-version Comfy-Org/ComfyUI_frontend@x.y.z`) for the throwaway
// server. It is never wired to an HTTP route, a frontend widget, or a workflow
// value.
const extraComfyArgs = (process.env.OMNICAM_LIVE_COMFY_ARGS || "").trim();

// Set OMNICAM_LIVE_AUTOSTART=1 to boot a throwaway ComfyUI server for the
// Nodes 2.0 browser tests; otherwise reuse the already-running instance.
const webServer =
  process.env.OMNICAM_LIVE_AUTOSTART === "1"
    ? {
        command: [
          `"${python}"`,
          "main.py",
          `--port ${port}`,
          "--disable-auto-launch",
          "--cpu",
          "--disable-all-custom-nodes",
          `--whitelist-custom-nodes ${customNodeName}`,
          extraComfyArgs,
        ]
          .filter(Boolean)
          .join(" "),
        cwd: comfyRoot,
        url: `http://127.0.0.1:${port}/`,
        reuseExistingServer: true,
        timeout: 180_000,
      }
    : undefined;

export default defineConfig({
  testDir: "tests/frontend",
  // The CI suite is intentionally fixture-free; exploratory tests that need a
  // local video opt in through OMNICAM_LIVE_MATCH instead.
  testMatch: process.env.OMNICAM_LIVE_MATCH || "live-ci.spec.js",
  timeout: 60_000,
  // This lane cold-boots a throwaway ComfyUI on a CPU-only runner and, on the
  // current-frontend job, fetches an unreleased frontend build from GitHub
  // before the first paint. The first Vue-root mount occasionally overruns its
  // 60s wait purely on runner contention -- a different node/test each run, no
  // code pattern behind it. Let an unlucky cold mount retry rather than redden
  // the whole build; keep it at zero locally.
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.OMNICAM_LIVE_URL || `http://127.0.0.1:${port}`,
    headless: true,
    viewport: { width: 1920, height: 1200 },
    launchOptions: existsSync(edge) ? { executablePath: edge } : {},
  },
  ...(webServer ? { webServer } : {}),
});
