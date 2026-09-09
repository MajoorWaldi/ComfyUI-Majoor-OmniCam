import test from "node:test";
import assert from "node:assert/strict";

import { DIRECTOR_STYLES } from "../../web-src/template/styles.js";

// Plan 01 section 4: the Director must read as a calm DCC, not a light show.
// Normal edit/select state must not animate the whole viewport border, and
// normal active tool buttons express current state with background/border/color
// rather than a gradient + glow stack.

test("no animated viewport-border glow for normal edit mode", () => {
  assert.ok(
    !/editModeWrapGlow/.test(DIRECTOR_STYLES),
    "expected the pulsing edit-mode viewport border keyframes to be removed",
  );
  assert.ok(
    !/\.viewport-wrap\.edit-mode\{[^}]*animation:/.test(DIRECTOR_STYLES),
    "expected .viewport-wrap.edit-mode to carry no animation",
  );
});

test("auto-key uses a restrained indicator, not a large animated halo", () => {
  assert.ok(
    !/autoKeyWrapGlow/.test(DIRECTOR_STYLES),
    "expected the auto-key viewport halo keyframes to be removed",
  );
  assert.ok(
    !/\.viewport-wrap\.auto-key\{[^}]*animation:/.test(DIRECTOR_STYLES),
    "expected .viewport-wrap.auto-key to carry no animation",
  );
});

test("normal active tool buttons avoid gradient + glow", () => {
  const activeRule = DIRECTOR_STYLES.match(
    /\.majoor-omnicam button\.active[^{]*\{([^}]*)\}/,
  );
  assert.ok(activeRule, "expected a button.active rule to exist");
  assert.ok(
    !/linear-gradient/.test(activeRule[1]),
    "expected button.active to use a flat background, not a gradient",
  );
  assert.ok(
    !/box-shadow:\s*0 0/.test(activeRule[1]),
    "expected button.active to carry no glow box-shadow",
  );
});
