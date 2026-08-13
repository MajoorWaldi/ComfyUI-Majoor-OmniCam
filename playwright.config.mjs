import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export default defineConfig({
  testDir: "tests/frontend",
  testIgnore: "**/live-director.spec.js",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    launchOptions: existsSync(edge) ? { executablePath: edge } : {},
  },
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173/tests/frontend/harness.html",
    reuseExistingServer: true,
  },
});
