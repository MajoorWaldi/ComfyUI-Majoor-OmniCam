// The Extractor has to look like the Director, not merely resemble it.
//
// The way that stays true through future edits is that the Extractor owns no
// colours at all: it declares layout and inherits every token. These tests fail
// the moment someone pastes a hex value into the Extractor stylesheet, which is
// how visual drift starts.

import assert from "node:assert/strict";
import test from "node:test";

import { EXTRACTOR_STYLES } from "../../web-src/extractor/styles.js";
import { extractorMarkup } from "../../web-src/extractor/template.js";
import { LOWER_DECK_STYLES } from "../../web-src/template/styles/lower-deck.js";
import { SHARED_STYLES } from "../../web-src/template/styles/shared.js";

const EXTRACTOR_ONLY = EXTRACTOR_STYLES.slice(SHARED_STYLES.length + LOWER_DECK_STYLES.length);

test("the Extractor root joins the shared OmniCam surface", () => {
  const markup = extractorMarkup();
  assert.match(markup, /class="majoor-omnicam oc-extractor"/);
});

test("the Extractor stylesheet is built on the shared one", () => {
  assert.ok(EXTRACTOR_STYLES.startsWith(SHARED_STYLES));
});

test("the Extractor redefines none of the shared design tokens", () => {
  for (const token of [
    "--oc-bg", "--oc-panel", "--oc-panel-2", "--oc-sunken", "--oc-line", "--oc-line-soft",
    "--oc-text", "--oc-text-dim", "--oc-text-faint", "--oc-accent", "--oc-accent-soft",
    "--oc-accent-ink", "--oc-radius", "--oc-radius-sm",
  ]) {
    assert.doesNotMatch(
      EXTRACTOR_ONLY, new RegExp(`${token}\\s*:`),
      `${token} must come from the shared stylesheet, not be redefined here`,
    );
  }
});

test("Extractor layout styles reference tokens rather than raw colours", () => {
  // Deliberate exceptions: the state pills carry tints with no shared token
  // yet, and the stage's video/canvas layers use a letterbox black darker
  // than any --oc-* surface token. Everything else must go through var().
  const declarations = EXTRACTOR_ONLY.split("\n").filter((line) => /#[0-9a-f]{3,8}\b/i.test(line));
  for (const line of declarations) {
    assert.match(
      line, /oc-status-pill|oc-stage video|oc-stage canvas/,
      `raw colour outside the status pills: ${line.trim()}`,
    );
  }
});

test("the Extractor reuses the shared header, card and status primitives", () => {
  const markup = extractorMarkup();
  for (const className of ["oc-header", "oc-brand", "oc-title", "oc-status-pill", "oc-status-dot", "oc-card", "oc-section"]) {
    assert.match(markup, new RegExp(`class="[^"]*${className}`), `${className} is part of the family look`);
  }
});

test("the Extractor keeps the OmniCam node mark", () => {
  assert.match(extractorMarkup(), /oc-mark-ring/);
  assert.match(extractorMarkup(), /oc-mark-core/);
});

test("every Extractor control is reachable and labelled", () => {
  const markup = extractorMarkup();
  for (const action of ["track", "pause", "resume", "stop", "apply", "fit", "choose-source"]) {
    assert.match(markup, new RegExp(`data-act="${action}"`), `${action} must exist`);
  }
  for (const tab of ["source", "track3d", "compare"]) {
    assert.match(markup, new RegExp(`data-tab="${tab}"`));
  }
  for (const view of ["perspective", "top", "front", "side"]) {
    assert.match(markup, new RegExp(`data-view="${view}"`));
  }
  for (const mode of ["raw", "refined", "compare"]) {
    assert.match(markup, new RegExp(`data-track-mode="${mode}"`));
  }
});

test("the panel declares the readouts the plan calls for", () => {
  const markup = extractorMarkup();
  for (const role of [
    "solve-status", "source-strip", "source-label", "scrubber", "frame-readout",
    "quality-timeline", "quality-details", "extractor-camera", "anomalies",
    "progress-bar", "solve-error", "applied-state", "track-canvas", "tracking-overlay",
    "clean-preview", "compare-clean", "compare-diagnostics", "compare-track",
  ]) {
    assert.match(markup, new RegExp(`data-role="${role}"`), `${role} must exist`);
  }
});

test("the Extractor never bakes a node-wide glow the plan forbids", () => {
  assert.doesNotMatch(EXTRACTOR_ONLY, /box-shadow[^;]*(?:0 0 \d{2,}|glow)/i);
  assert.doesNotMatch(EXTRACTOR_ONLY, /animation:[^;]*(?:flash|blink|pulse)/i);
});

test("Extractor uses the Director transport and dope-sheet anatomy", () => {
  const markup = extractorMarkup();
  for (const role of ["extractor-ruler", "extractor-solve-lane", "extractor-quality-lane"]) {
    assert.match(markup, new RegExp(`data-role="${role}"`), `${role} must exist`);
  }
  for (const label of ["SOLVE", "QUALITY", "Camera", "Look At", "Focal Length", "Roll"]) {
    assert.match(markup, new RegExp(`>${label}<`), `${label} lane must exist`);
  }
  assert.match(markup, /class="[^"]*oc-dope[^"]*"/);
  assert.match(markup, /class="[^"]*timeline-toolbar[^"]*"/);
});
