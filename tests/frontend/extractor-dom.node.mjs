import assert from "node:assert/strict";
import test from "node:test";

import { extractorMarkup } from "../../web-src/extractor/template.js";
import { bindExtractorTransport } from "../../web-src/extractor/transport.js";

class FakeButton {
  constructor(action) {
    this.dataset = { act: action };
    this.disabled = false;
    this.attributes = new Map();
    this.classList = { toggle() {} };
    this.handlers = new Map();
  }

  addEventListener(name, handler) { this.handlers.set(name, handler); }
  removeEventListener() {}
  querySelector() { return null; }
  setAttribute(name, value) { this.attributes.set(name, value); }
  click() { this.handlers.get("click")?.({ currentTarget: this }); }
}

function transportRoot(actions) {
  const buttons = actions.map((action) => new FakeButton(action));
  const handlers = new Map();
  return {
    buttons,
    addEventListener(name, handler) { handlers.set(name, handler); },
    removeEventListener() {},
    querySelector(selector) {
      const action = selector.match(/data-act="([^"]+)"/)?.[1];
      return buttons.find((button) => button.dataset.act === action) || null;
    },
    querySelectorAll(selector) {
      return selector === "[data-act]" ? buttons : [];
    },
    keydown(event) { handlers.get("keydown")?.(event); },
  };
}

test("Extractor transport preserves Director control order and icon actions", () => {
  const actions = [...extractorMarkup().matchAll(/data-act="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(actions.slice(actions.indexOf("first-frame"), actions.indexOf("first-frame") + 8), [
    "first-frame", "previous-key", "previous-frame", "play",
    "next-frame", "next-key", "last-frame", "toggle-loop",
  ]);
});

test("previous and next key prefer anomaly frames, fall back to solved keys, and disable without either", () => {
  const root = transportRoot(["previous-key", "next-key"]);
  const seeks = [];
  const coordinator = { frame: 10, seek: (frame, reason) => seeks.push([frame, reason]) };
  const binding = bindExtractorTransport(root, {
    coordinator,
    getState: () => ({ frame: coordinator.frame, frameCount: 40, anomalies: [{ frame: 5 }, { frame: 20 }] }),
    getTrack: () => ({ keyframes: [{ frame: 2 }, { frame: 30 }] }),
    listen: (target, name, handler) => target.addEventListener(name, handler),
  });

  binding.render();
  root.querySelector('[data-act="previous-key"]').click();
  root.querySelector('[data-act="next-key"]').click();
  assert.deepEqual(seeks, [[5, "transport"], [20, "transport"]]);

  coordinator.frame = 20;
  binding.render();
  root.querySelector('[data-act="next-key"]').click();
  assert.deepEqual(seeks.at(-1), [30, "transport"]);

  const none = transportRoot(["previous-key", "next-key"]);
  const empty = bindExtractorTransport(none, {
    coordinator, getState: () => ({ frame: 0, frameCount: 40, anomalies: [] }),
    getTrack: () => ({ keyframes: [] }), listen: (target, name, handler) => target.addEventListener(name, handler),
  });
  empty.render();
  assert.equal(none.querySelector('[data-act="previous-key"]').disabled, true);
  assert.equal(none.querySelector('[data-act="next-key"]').disabled, true);
});

test("transport displays pause while playing and highlights an enabled loop", () => {
  const root = transportRoot(["play", "toggle-loop"]);
  const coordinator = { playing: true, loop: true };
  const binding = bindExtractorTransport(root, {
    coordinator, getState: () => ({ frameCount: 1 }), getTrack: () => null,
    listen: (target, name, handler) => target.addEventListener(name, handler),
  });
  binding.render();
  assert.equal(root.querySelector('[data-act="play"]').attributes.get("aria-label"), "Pause playback");
  assert.equal(root.querySelector('[data-act="toggle-loop"]').attributes.get("aria-pressed"), "true");
});

test("Extractor keyboard transport is scoped to non-editable controls and prevents outer shortcuts only when it seeks", () => {
  const root = transportRoot([]);
  const seeks = [];
  const coordinator = {
    frame: 4,
    toggle: () => { seeks.push(["toggle"]); return true; },
    seek: (frame, reason) => seeks.push([frame, reason]),
  };
  bindExtractorTransport(root, {
    coordinator,
    getState: () => ({ frame: coordinator.frame, frameCount: 12, anomalies: [] }),
    getTrack: () => ({ keyframes: [] }),
    listen: (target, name, handler) => target.addEventListener(name, handler),
  });
  const key = (name, target = { tagName: "BUTTON" }) => {
    const event = { key: name, target, prevented: false, preventDefault() { this.prevented = true; }, stopPropagation() {} };
    root.keydown(event);
    return event;
  };

  assert.equal(key("ArrowRight").prevented, true);
  assert.equal(key("Home").prevented, true);
  assert.equal(key(" ").prevented, true);
  assert.equal(key("ArrowLeft", { tagName: "INPUT", type: "number" }).prevented, false);
  assert.deepEqual(seeks, [[5, "transport"], [0, "transport"], ["toggle"]]);
});
