import test from "node:test";
import assert from "node:assert/strict";

import { SHARED_STYLES } from "../../web-src/template/styles/shared.js";

test("Director and Monitor share the canonical OmniCam visual language", () => {
  const compact = SHARED_STYLES.replace(/\s+/g, "");
  for (const token of [
    "--oc-bg:#141419",
    "--oc-panel:#1a1a21",
    "--oc-panel-2:#20202a",
    "--oc-sunken:#101014",
    "--oc-accent:#8b7bd8",
    "--oc-radius:10px",
    "--oc-radius-sm:7px",
    "--oc-ok:#46a758",
    "--oc-warn:#e5a23c",
    "--oc-danger:#e5484d",
  ]) assert.match(compact, new RegExp(token));
});

test("shared controls retain visible focus and text status semantics", () => {
  assert.match(SHARED_STYLES, /:focus-visible/);
  assert.match(SHARED_STYLES, /\.oc-status-pill/);
  assert.match(SHARED_STYLES, /\.oc-card/);
});
