import test from "node:test";
import assert from "node:assert/strict";

import { jointRowsMarkup } from "../../web-src/assets/character/rig-mapper.js";
import { REQUIRED_JOINTS } from "../../web-src/assets/character/rig-profile.js";

test("jointRowsMarkup renders one row per required joint with a bone select", () => {
  const html = jointRowsMarkup(["Hips", "Spine", "Head"], { pelvis: "Hips", head: "Head" });
  for (const joint of REQUIRED_JOINTS) {
    assert.ok(html.includes(`data-rig-joint="${joint}"`), `missing row for ${joint}`);
  }
  assert.equal((html.match(/class="oc-rig-row/g) || []).length, REQUIRED_JOINTS.length);
});

test("a row is marked ok only when its bone is mapped and present in the model", () => {
  const html = jointRowsMarkup(["Hips"], { pelvis: "Hips", head: "Head" });
  assert.match(html, /class="oc-rig-row ok" data-joint="pelvis"/);
  // head is mapped to a bone the model does not have -> not ok
  assert.match(html, /class="oc-rig-row" data-joint="head"/);
});

test("the select preselects the current mapping and always offers unmapped", () => {
  const html = jointRowsMarkup(["Hips", "mixamorig:Hips"], { pelvis: "mixamorig:Hips" });
  assert.ok(html.includes('<option value="mixamorig:Hips" selected>'));
  assert.ok(html.includes('<option value="">'));
});

test("bone names are HTML-escaped", () => {
  const html = jointRowsMarkup(['Bone"><img'], {});
  assert.ok(!html.includes('Bone"><img'));
  assert.ok(html.includes("&quot;&gt;&lt;img"));
});
