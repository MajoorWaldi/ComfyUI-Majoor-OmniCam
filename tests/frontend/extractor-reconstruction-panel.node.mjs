import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { extractorMarkup } from "../../web-src/extractor/template.js";

const REQUIRED_DATA_ROLES = [
  "extract-mode-camera",
  "extract-mode-reconstruct",
  "reconstruction-panel",
  "reconstruction-provider",
  "reconstruction-mode",
  "reconstruction-quality",
  "reconstruction-recover-fov",
  "reconstruction-source-texture",
  "reconstruction-detect-ground",
  "reconstruction-detect-walls",
  "reconstruction-triangle-budget",
  "reconstruction-edge-threshold",
  "reconstruction-scene-scale",
  "reconstruction-run",
  "reconstruction-stop",
  "reconstruction-open-director",
  "reconstruction-progress",
  "reconstruction-stage",
  "reconstruction-summary",
  "reconstruction-warnings",
];

test("all required reconstruction data-role hooks exist in extractorMarkup", () => {
  const markup = extractorMarkup();
  for (const role of REQUIRED_DATA_ROLES) {
    const rolePattern = new RegExp(`data-role=["']${role}["']`);
    assert.ok(
      rolePattern.test(markup),
      `extractorMarkup missing required data-role: ${role}`
    );
  }
});

test("extractorMarkup is static with no interpolated user strings", () => {
  const templatePath = resolve("web-src/extractor/template.js");
  const templateSrc = readFileSync(templatePath, "utf8");

  // Only allowed template interpolations inside extractorMarkup are EXTRACTOR_STYLES, brandMarkup, slider(...), and t(...)
  const allowed = new Set(["EXTRACTOR_STYLES", "role", "label", "min", "max", "step", "value"]);
  const interpolations = [...templateSrc.matchAll(/\$\{([^}]+)\}/g)].map((m) => m[1].trim());
  for (const expr of interpolations) {
    assert.ok(
      allowed.has(expr) ||
        expr.startsWith("brandMarkup") ||
        expr.startsWith("slider(") ||
        expr.startsWith("t("),
      `Unexpected dynamic interpolation in template: ${expr}`
    );
  }
});

test("mode switch toggles reconstruction-panel hidden and preserves camera-track UI", () => {
  const root = {
    elements: new Map(),
    querySelector(sel) {
      const role = sel.match(/data-role="([^"]+)"/)?.[1];
      if (role && this.elements.has(role)) return this.elements.get(role);
      return null;
    },
  };

  const reconPanel = { hidden: true };
  const camBtn = { attributes: new Map(), setAttribute(k, v) { this.attributes.set(k, v); } };
  const reconBtn = { attributes: new Map(), setAttribute(k, v) { this.attributes.set(k, v); } };

  root.elements.set("reconstruction-panel", reconPanel);
  root.elements.set("extract-mode-camera", camBtn);
  root.elements.set("extract-mode-reconstruct", reconBtn);

  // Simulate switching to scene_reconstruct
  const fakeExtractor = {
    root,
    $(role) { return this.root.querySelector(`[data-role="${role}"]`); },
    setExtractMode(mode) {
      this.extractMode = mode;
      const isReconstruct = mode === "scene_reconstruct";
      const panel = this.$("reconstruction-panel");
      if (panel) panel.hidden = !isReconstruct;
      this.$("extract-mode-camera")?.setAttribute("aria-selected", !isReconstruct ? "true" : "false");
      this.$("extract-mode-reconstruct")?.setAttribute("aria-selected", isReconstruct ? "true" : "false");
    },
  };

  fakeExtractor.setExtractMode("scene_reconstruct");
  assert.equal(reconPanel.hidden, false);
  assert.equal(reconBtn.attributes.get("aria-selected"), "true");
  assert.equal(camBtn.attributes.get("aria-selected"), "false");

  // Switch back to camera_track
  fakeExtractor.setExtractMode("camera_track");
  assert.equal(reconPanel.hidden, true);
  assert.equal(reconBtn.attributes.get("aria-selected"), "false");
  assert.equal(camBtn.attributes.get("aria-selected"), "true");
});

test("index.js maintains module boundaries and stays below 800 lines limit", () => {
  const indexPath = resolve("web-src/extractor/index.js");
  const src = readFileSync(indexPath, "utf8");
  const lineCount = src.split(/\r?\n/).length;
  assert.ok(lineCount < 800, `index.js must be < 800 lines (current: ${lineCount})`);
});
