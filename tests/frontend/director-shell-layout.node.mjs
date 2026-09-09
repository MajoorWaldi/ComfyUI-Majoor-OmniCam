import test from "node:test";
import assert from "node:assert/strict";

import { leftPanelMarkup } from "../../web-src/template/left-panel.js";
import { sidePanelMarkup } from "../../web-src/template/side-panel.js";
import { outlinerPanel } from "../../web-src/template/panels/outliner-panel.js";
import { DIRECTOR_STYLES } from "../../web-src/template/styles.js";
import { PANEL_LAYOUT, defaultState, sanitizeState } from "../../web-src/director/core.js";

const count = (haystack, needle) => haystack.split(needle).length - 1;

test("the scene tree lives once, in the left panel", () => {
  assert.equal(count(leftPanelMarkup(), 'data-role="objects"'), 1);
  assert.equal(count(outlinerPanel(), 'data-role="objects"'), 0);
  assert.equal(count(sidePanelMarkup(), 'data-role="objects"'), 0);
});

test("scene browsing controls moved out of the right inspector", () => {
  const left = leftPanelMarkup();
  assert.match(left, /data-role="outliner-search"/);
  assert.match(left, /data-role="outliner-filter-chips"/);
  assert.match(left, /data-role="outliner-batch-bar"/);
  assert.match(left, /data-menu="add-object"/);
  assert.doesNotMatch(outlinerPanel(), /data-role="outliner-search"/);
  assert.doesNotMatch(outlinerPanel(), /data-role="outliner-filter-chips"/);
});

test("object transform stays a single contextual editor in the inspector", () => {
  const side = sidePanelMarkup();
  for (const role of ["object-x", "object-y", "object-z", "object-panel"]) {
    assert.equal(count(side, `data-role="${role}"`), 1, `${role} appears once`);
  }
});

test("the three shell regions and their tokens exist", () => {
  for (const cls of [".oc-left", ".oc-stage", ".oc-side"]) {
    assert.ok(DIRECTOR_STYLES.includes(cls), `${cls} styled`);
  }
  assert.match(DIRECTOR_STYLES, /--oc-left-w/);
  assert.match(DIRECTOR_STYLES, /grid-template-columns:var\(--oc-left-w/);
});

test("container queries fold the left panel below the three-column width", () => {
  assert.match(DIRECTOR_STYLES, /@container \(max-width:1120px\)/);
  assert.match(DIRECTOR_STYLES, /@container \(max-width:760px\)/);
});

test("left panel width is a persisted, clamped layout value", () => {
  assert.equal(defaultState().left_width, PANEL_LAYOUT.leftWidth.default);
  assert.equal(sanitizeState({ left_width: 5 }).left_width, PANEL_LAYOUT.leftWidth.min);
  assert.equal(sanitizeState({ left_width: 99999 }).left_width, PANEL_LAYOUT.leftWidth.max);
});
