import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export default defineConfig({
  testDir: "tests/frontend",
  testMatch: "live-director.spec.js",
  timeout: 60_000,
  use: {
    baseURL: process.env.OMNICAM_LIVE_URL || "http://127.0.0.1:8191",
    headless: true,
    viewport: { width: 1920, height: 1200 },
    launchOptions: existsSync(edge) ? { executablePath: edge } : {},
  },
});
