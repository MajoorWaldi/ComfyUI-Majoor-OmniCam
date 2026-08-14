import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "@playwright/test";

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const comfyRoot = resolve(import.meta.dirname, "../../..");
const python = process.env.OMNICAM_COMFYUI_PYTHON || "python";
const port = Number(process.env.OMNICAM_LIVE_PORT || 8191);

// Set OMNICAM_LIVE_AUTOSTART=1 to boot a throwaway ComfyUI server for the
// Nodes 2.0 browser tests; otherwise reuse the already-running instance.
const webServer =
  process.env.OMNICAM_LIVE_AUTOSTART === "1"
    ? {
        command: `"${python}" main.py --port ${port} --disable-auto-launch --cpu-vae`,
        cwd: comfyRoot,
        url: `http://127.0.0.1:${port}/`,
        reuseExistingServer: true,
        timeout: 180_000,
      }
    : undefined;

export default defineConfig({
  testDir: "tests/frontend",
  testMatch: "live-director.spec.js",
  timeout: 60_000,
  use: {
    baseURL: process.env.OMNICAM_LIVE_URL || `http://127.0.0.1:${port}`,
    headless: true,
    viewport: { width: 1920, height: 1200 },
    launchOptions: existsSync(edge) ? { executablePath: edge } : {},
  },
  ...(webServer ? { webServer } : {}),
});
