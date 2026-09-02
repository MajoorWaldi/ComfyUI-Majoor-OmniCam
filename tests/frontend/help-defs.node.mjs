import test from "node:test";
import assert from "node:assert/strict";

import { getNodeHelp } from "../../web-src/help/schema.js";
import "../../web-src/help/defs.js"; // self-registers on import
import { PROFILE_OPTIONS } from "../../web-src/monitor/template.js";

function section(help, heading) {
  return help.sections.find((item) => item.heading === heading);
}

test("every public node has a registered help entry", () => {
  for (const cls of ["MajoorOmniCamDirector", "MajoorOmniCamExtractor", "MajoorOmniCamMonitor"]) {
    const help = getNodeHelp(cls);
    assert.ok(help, `${cls} has no registered help`);
    assert.ok(help.title && help.tagline, `${cls} help is missing a title or tagline`);
  }
});

test("Monitor's help profile list matches the real profile catalogue exactly", () => {
  // Regression: the help once described seven profiles after an eighth
  // (external_reference_video) shipped, and it once claimed switching
  // profiles "rewires" sockets that never changed. Comparing against
  // PROFILE_OPTIONS -- the same list the profile dropdown itself renders --
  // means a profile added there without a matching help entry fails here
  // instead of shipping silently stale.
  const help = getNodeHelp("MajoorOmniCamMonitor");
  const helpIds = section(help, "Choosing a profile").defs.map(([id]) => id);
  const catalogueIds = PROFILE_OPTIONS.map(([id]) => id);
  assert.deepEqual([...helpIds].sort(), [...catalogueIds].sort());
});

test("Monitor's help explains the live preflight, not just the post-Run one", () => {
  // The single biggest behavioral addition to Monitor: a Director-sourced
  // scene previews PASS/BLOCKED with no queue. Silence on this in the help
  // popup would leave every user assuming Monitor still requires a Run to
  // see anything, which stopped being true.
  const help = getNodeHelp("MajoorOmniCamMonitor");
  const body = section(help, "What it does").body;
  assert.match(body, /live/i);
  assert.match(body, /no queue|without.*(queu|run)/i);
});

test("Extractor's help states the real method default, not just auto's fallback behavior", () => {
  // Regression: the def described only what `auto` does, silently implying
  // the widget defaults to something that falls back gracefully -- it does
  // not. `method` defaults to `dpvo`, which errors outright when DPVO is not
  // installed. The node's own native tooltip (omnicam/nodes/extractor.py)
  // already says this; the popup has to agree with it.
  const help = getNodeHelp("MajoorOmniCamExtractor");
  const methodDef = section(help, "Key inputs (queued execution)").defs.find(([id]) => id === "method");
  assert.ok(methodDef, "no `method` entry in Extractor's help");
  assert.match(methodDef[1], /`dpvo`.*(default|is the default)/i);
});

test("Extractor's help documents the interactive TRACK panel, not only queued execution", () => {
  // Regression: the help described only the batch `execute()` inputs and
  // outputs, with zero mention of the node's actual primary workflow -- the
  // no-queue matchmove panel documented at length in docs/NODES.md.
  const help = getNodeHelp("MajoorOmniCamExtractor");
  const allText = help.sections.map((s) => [s.body, ...(s.bullets || []), ...(s.defs || []).flat()].filter(Boolean).join(" ")).join(" ");
  assert.match(allText, /TRACK/);
  assert.match(allText, /no.*(queue|prompt)|without.*(queue|prompt)/i);
});

test("Extractor's help does not claim a removed COMPARE tab", () => {
  // The panel shipped a COMPARE tab before the MotionScene refactor; it was
  // never restored. Only VIDEO and TRACK 3D exist now.
  const help = getNodeHelp("MajoorOmniCamExtractor");
  const allText = JSON.stringify(help);
  assert.doesNotMatch(allText, /COMPARE/);
});
