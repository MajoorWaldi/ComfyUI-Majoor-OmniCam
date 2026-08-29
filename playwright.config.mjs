import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export default defineConfig({
  globalSetup: "./tests/frontend/global-setup.mjs",
  testDir: "tests/frontend",
  testIgnore: "**/live-*.spec.js",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    launchOptions: existsSync(edge) ? { executablePath: edge } : {},
  },
});
