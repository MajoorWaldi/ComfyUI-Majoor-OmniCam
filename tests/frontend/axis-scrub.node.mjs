import test from "node:test";
import assert from "node:assert/strict";

import { setupAxisScrubbing } from "../../web-src/scene/axis-scrub.js";

function makeInput({ value = "1", step = "0.1", min = null, max = null } = {}) {
  const attrs = new Map([["step", step]]);
  if (min != null) attrs.set("min", String(min));
  if (max != null) attrs.set("max", String(max));
  return {
    tagName: "INPUT",
    value,
    disabled: false,
    readOnly: false,
    dispatched: [],
    getAttribute: (name) => attrs.get(name),
    hasAttribute: (name) => attrs.has(name),
    dispatchEvent(event) {
      this.dispatched.push(event.type);
      return true;
    },
  };
}

function makeFixture(input = makeInput()) {
  const rootListeners = new Map();
  const axisListeners = new Map();
  const axis = {
    classList: {
      values: new Set(),
      add(name) { this.values.add(name); },
      remove(name) { this.values.delete(name); },
      contains(name) { return this.values.has(name); },
    },
    querySelector: (selector) => (selector === "input[type=number]" ? input : null),
    setPointerCapture() {},
    releasePointerCapture() {},
    addEventListener(type, listener) {
      (axisListeners.get(type) || axisListeners.set(type, []).get(type)).push(listener);
    },
    removeEventListener(type, listener) {
      axisListeners.set(type, (axisListeners.get(type) || []).filter((fn) => fn !== listener));
    },
    dispatch(type, event) {
      for (const listener of axisListeners.get(type) || []) listener(event);
    },
  };
  const target = {
    tagName: "SPAN",
    closest: (selector) => (selector === ".oc-axis" ? axis : null),
  };
  const root = {
    addEventListener(type, listener) {
      rootListeners.set(type, listener);
    },
    dispatch(type, event) {
      rootListeners.get(type)?.(event);
    },
  };
  const calls = { checkpoints: [], serializes: 0, renders: 0 };
  const ui = {
    root,
    checkpoint: (label) => calls.checkpoints.push(label),
    serialize: () => { calls.serializes += 1; },
    render: () => { calls.renders += 1; },
  };

  const previousDocument = globalThis.document;
  const previousEvent = globalThis.Event;
  globalThis.document = { body: { style: { cursor: "" } } };
  globalThis.Event = class {
    constructor(type) {
      this.type = type;
    }
  };

  setupAxisScrubbing(ui);

  return {
    axis,
    calls,
    input,
    restore() {
      globalThis.document = previousDocument;
      globalThis.Event = previousEvent;
    },
    pointerDown(overrides = {}) {
      root.dispatch("pointerdown", {
        button: 0,
        pointerId: 7,
        clientX: 100,
        target,
        preventDefault() {},
        stopPropagation() {},
        ...overrides,
      });
    },
  };
}

test("setupAxisScrubbing updates a number input only after a real drag", () => {
  const fixture = makeFixture(makeInput({ value: "1", step: "0.1" }));
  try {
    fixture.pointerDown();
    fixture.axis.dispatch("pointermove", { clientX: 101, shiftKey: false, ctrlKey: false, metaKey: false });
    assert.equal(fixture.input.value, "1", "small pointer jitter is ignored");
    assert.deepEqual(fixture.calls.checkpoints, []);

    fixture.axis.dispatch("pointermove", { clientX: 110, shiftKey: false, ctrlKey: false, metaKey: false });
    assert.equal(fixture.input.value, "2.0");
    assert.deepEqual(fixture.input.dispatched, ["input", "change"]);
    assert.deepEqual(fixture.calls.checkpoints, ["Scrub axis"]);

    fixture.axis.dispatch("pointerup", { pointerId: 7 });
    assert.equal(fixture.axis.classList.contains("scrubbing"), false);
    assert.equal(globalThis.document.body.style.cursor, "");
    assert.equal(fixture.calls.serializes, 1);
    assert.equal(fixture.calls.renders, 1);
  } finally {
    fixture.restore();
  }
});

test("setupAxisScrubbing respects keyboard precision modifiers and min max clamps", () => {
  const fixture = makeFixture(makeInput({ value: "1", step: "1", min: 0, max: 3 }));
  try {
    fixture.pointerDown();
    fixture.axis.dispatch("pointermove", { clientX: 110, shiftKey: true, ctrlKey: false, metaKey: false });
    assert.equal(fixture.input.value, "2", "Shift uses the fine scrub step");

    fixture.axis.dispatch("pointermove", { clientX: 200, shiftKey: false, ctrlKey: true, metaKey: false });
    assert.equal(fixture.input.value, "3", "Ctrl acceleration is still clamped at max");
  } finally {
    fixture.restore();
  }
});
