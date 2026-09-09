import test from "node:test";
import assert from "node:assert/strict";

import { SHARED_STYLES } from "../../web-src/template/styles/shared.js";

test("Director and Monitor share the canonical OmniCam visual language", () => {
  const compact = SHARED_STYLES.replace(/\s+/g, "");
  for (const token of [
    "--oc-bg:#111214",
    "--oc-panel:#18191c",
    "--oc-panel-2:#202126",
    "--oc-sunken:#0d0e10",
    "--oc-accent:#8d7ee8",
    "--oc-radius:8px",
    "--oc-radius-sm:6px",
    "--oc-ok:#58a56a",
    "--oc-warn:#d6a04d",
    "--oc-danger:#d85b61",
  ]) assert.match(compact, new RegExp(token));
});

test("shared controls retain visible focus and text status semantics", () => {
  assert.match(SHARED_STYLES, /:focus-visible/);
  assert.match(SHARED_STYLES, /\.oc-status-pill/);
  assert.match(SHARED_STYLES, /\.oc-card/);
});
