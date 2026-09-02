import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export default defineConfig({
  globalSetup: "./tests/frontend/global-setup.mjs",
  testDir: "tests/frontend",
  testIgnore: "**/live-*.spec.js",
  // The director mount spins up a full three.js viewport; on CI's software
  // renderer the heaviest scenes (a multi-camera preview strip, the edit tab
  // opened after a keyframed mount) sit close to a 30s budget, so give them
  // room and let a genuinely unlucky frame retry once rather than fail the run.
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    launchOptions: existsSync(edge) ? { executablePath: edge } : {},
  },
});
