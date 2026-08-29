import test from "node:test";
import assert from "node:assert/strict";

import { dispatchDirectorKey, resolveZone, zoneOf } from "../../web-src/commands.js";

// A minimal DOM element that answers closest() by walking a class chain.
function el(classes = [], role = null) {
  const set = new Set(classes);
  const node = {
    tagName: "DIV",
    isContentEditable: false,
    classList: { contains: (c) => set.has(c) },
    getAttribute: (name) => (name === "data-role" ? role : null),
    closest(selector) {
      if (selector.startsWith(".")) return set.has(selector.slice(1)) ? node : null;
      const m = selector.match(/^\[data-role="([^"]+)"\]$/);
      if (m) return role === m[1] ? node : null;
      return null;
    },
  };
  Object.setPrototypeOf(node, globalThis.HTMLElement?.prototype ?? Object.prototype);
  return node;
}

function withMockElement(fn) {
  const Previous = globalThis.HTMLElement;
  globalThis.HTMLElement = class MockHTMLElement {};
  try { return fn(); } finally { globalThis.HTMLElement = Previous; }
}

test("resolveZone maps a target to its panel, sequence winning over the graph it sits in", () => {
  withMockElement(() => {
    assert.equal(resolveZone(el(["viewport-wrap"])), "viewport");
    assert.equal(resolveZone(el(["oc-timeline"])), "timeline");
    assert.equal(resolveZone(el(["oc-graph"])), "graph");
    // The sequence stage lives inside .oc-graph; it must still resolve to sequence.
    assert.equal(resolveZone(el(["oc-graph"], "graph-sequence")), "sequence");
    assert.equal(resolveZone(el(["oc-side"])), null);
  });
});

test("zoneOf falls back to the last touched zone, then to viewport", () => {
  withMockElement(() => {
    assert.equal(zoneOf(el(["oc-side"]), { lastKeyZone: "timeline" }), "timeline");
    assert.equal(zoneOf(el(["oc-side"]), {}), "viewport");
  });
});

function press(ui, zoneClasses, over) {
  return withMockElement(() => dispatchDirectorKey(ui, {
    key: "1", code: "Digit1", ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, repeat: false,
    target: el(zoneClasses), preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
    ...over,
  }));
}

function baseUi(extra = {}) {
  return {
    contextMenu: { onKey: () => false },
    state: {
      select_mode: "object", active_camera_id: "cam", duration_frames: 120,
      objects: [], sequence: { enabled: false, cuts: [] }, cameras: [],
    },
    frame: 10,
    selectedEntity: "camera",
    selectedKeyframe: () => null,
    ...extra,
  };
}

test("select-mode digits fire in the viewport but not in the sequence editor", () => {
  const viewportCalls = [];
  const inViewport = press(baseUi({ setSelectMode: (m) => viewportCalls.push(m) }), ["viewport-wrap"]);
  assert.equal(inViewport, true);
  assert.deepEqual(viewportCalls, ["vertex"]);

  const seqCalls = [];
  const inSequence = withMockElement(() => dispatchDirectorKey(baseUi({ setSelectMode: (m) => seqCalls.push(m) }), {
    key: "1", code: "Digit1", repeat: false, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
    target: el(["oc-graph"], "graph-sequence"), preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
  }));
  assert.equal(inSequence, false, "a bare digit is not a sequence shortcut");
  assert.deepEqual(seqCalls, []);
});

test("T starts a modal transform in the viewport, is ignored in the sequence editor", () => {
  const consumedViewport = withMockElement(() => dispatchDirectorKey(baseUi({ checkpoint() {}, setTransformMode() {}, setStatus() {}, render() {} }), {
    key: "t", code: "KeyT", repeat: false, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
    target: el(["viewport-wrap"]), preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
  }));
  assert.equal(consumedViewport, true, "T is a viewport shortcut");

  const consumedSequence = withMockElement(() => dispatchDirectorKey(baseUi({}), {
    key: "t", code: "KeyT", repeat: false, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
    target: el(["oc-graph"], "graph-sequence"), preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
  }));
  assert.equal(consumedSequence, false, "T does nothing in the sequence editor");
});

test("Ctrl+Z is consumed from every zone, so ComfyUI's graph undo never sees it", () => {
  for (const zone of [["viewport-wrap"], ["oc-timeline"], ["oc-graph"], ["oc-graph"]]) {
    const undo = [];
    const consumed = withMockElement(() => dispatchDirectorKey(
      { contextMenu: { onKey: () => false }, undo: () => undo.push(1), redo: () => {} },
      {
        key: "z", code: "KeyZ", ctrlKey: true, metaKey: false, shiftKey: false, altKey: false, repeat: false,
        target: el(zone), preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
      },
    ));
    assert.equal(consumed, true);
    assert.deepEqual(undo, [1]);
  }
});

test("Delete removes a shot in the sequence editor and a keyframe in the timeline", () => {
  const seqUi = baseUi({
    state: {
      select_mode: "object", active_camera_id: "cam", duration_frames: 120,
      cameras: [{ id: "a" }, { id: "b" }],
      sequence: { enabled: true, cuts: [{ camera_id: "a", start: 0 }, { camera_id: "b", start: 60 }], recording_path: "" },
    },
    frame: 70,
    checkpoint() {}, scheduleSerialize() {}, refreshKeys() {}, refreshCameraSelectors() {}, render() {}, setStatus() {},
  });
  withMockElement(() => dispatchDirectorKey(seqUi, {
    key: "Delete", code: "Delete", repeat: false, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
    target: el(["oc-graph"], "graph-sequence"), preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
  }));
  assert.equal(seqUi.state.sequence.cuts.length, 1, "the shot under the playhead was removed");

  const keyCalls = [];
  const timelineUi = baseUi({ selectedKeyframe: () => ({ frame: 5 }), deleteKeyframe: () => keyCalls.push("del") });
  withMockElement(() => dispatchDirectorKey(timelineUi, {
    key: "Delete", code: "Delete", repeat: false, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
    target: el(["oc-timeline"]), preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
  }));
  assert.deepEqual(keyCalls, ["del"]);
});

test("S splits the shot under the playhead from the sequence editor", () => {
  const ui = baseUi({
    state: {
      select_mode: "object", active_camera_id: "cam", duration_frames: 120,
      cameras: [{ id: "a" }, { id: "b" }],
      sequence: { enabled: true, cuts: [{ camera_id: "a", start: 0 }], recording_path: "" },
    },
    frame: 40,
    checkpoint() {}, scheduleSerialize() {}, refreshKeys() {}, refreshCameraSelectors() {}, render() {}, setStatus() {},
  });
  const consumed = withMockElement(() => dispatchDirectorKey(ui, {
    key: "s", code: "KeyS", repeat: false, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false,
    target: el(["oc-graph"], "graph-sequence"), preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {},
  }));
  assert.equal(consumed, true);
  assert.deepEqual(ui.state.sequence.cuts.map((c) => c.start), [0, 40]);
  assert.equal(ui.state.sequence.cuts[1].camera_id, "b", "the new half takes the next camera");
});
