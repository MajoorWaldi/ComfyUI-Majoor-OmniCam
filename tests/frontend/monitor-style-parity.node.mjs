import test from "node:test";
import assert from "node:assert/strict";

import { SHARED_STYLES } from "../../web-src/template/styles/shared.js";

test("Director and Monitor share the canonical OmniCam visual language", () => {
  const compact = SHARED_STYLES.replace(/\s+/g, "");
  for (const token of [
    "--oc-bg-app:#0B1018",
    "--oc-bg-panel:#111827",
    "--oc-bg-control:#151D2A",
    "--oc-bg-sunken:#080C14",
    "--oc-accent:#5B7CFF",
    "--oc-radius:6px",
    "--oc-radius-sm:4px",
    "--oc-success:#42D7A1",
    "--oc-warning:#F3B34C",
    "--oc-error:#ED6B73",
  ]) assert.match(compact, new RegExp(token));
});


test("shared controls retain visible focus and text status semantics", () => {
  assert.match(SHARED_STYLES, /:focus-visible/);
  assert.match(SHARED_STYLES, /\.oc-status-pill/);
  assert.match(SHARED_STYLES, /\.oc-card/);
});
