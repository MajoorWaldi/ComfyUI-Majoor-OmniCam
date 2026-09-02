// panelWheelKeeper decides, per wheel event, whether the node keeps it (so the
// panel under the pointer scrolls natively) or lets it fall through to the host
// (so the graph canvas zooms). The rule: keep it only while the nearest scroll
// container can still scroll the way the wheel is going.

import test from "node:test";
import assert from "node:assert/strict";

const PreviousHTMLElement = globalThis.HTMLElement;
const PreviousGetComputedStyle = globalThis.getComputedStyle;
globalThis.HTMLElement = class MockHTMLElement {};
globalThis.getComputedStyle = (node) => node.style;

const { panelWheelKeeper } = await import("../../web-src/shared/panel-scroll.js");

test.after(() => {
  globalThis.HTMLElement = PreviousHTMLElement;
  globalThis.getComputedStyle = PreviousGetComputedStyle;
});

function el(props = {}) {
  const node = {
    style: { overflowY: "visible", overflowX: "visible" },
    scrollHeight: 0, clientHeight: 0, scrollTop: 0,
    scrollWidth: 0, clientWidth: 0,
    parentNode: null,
    ...props,
  };
  Object.setPrototypeOf(node, globalThis.HTMLElement.prototype);
  return node;
}

// A vertical scroll box: 300px of content in a 100px viewport.
function scrollBoxY(scrollTop) {
  return el({ style: { overflowY: "auto", overflowX: "visible" }, scrollHeight: 300, clientHeight: 100, scrollTop });
}

function fire(target, { deltaY = 0, deltaX = 0, ctrlKey = false, root } = {}) {
  let stopped = false;
  const event = {
    target, deltaY, deltaX, ctrlKey,
    composedPath() {
      const path = [];
      for (let node = target; node; node = node.parentNode) path.push(node);
      return path;
    },
    stopPropagation() { stopped = true; },
  };
  panelWheelKeeper(root ?? el())(event);
  return stopped;
}

test("keeps the wheel while a scroll box can still scroll down", () => {
  assert.equal(fire(scrollBoxY(0), { deltaY: 40 }), true);
});

test("keeps the wheel while a scroll box can still scroll up", () => {
  assert.equal(fire(scrollBoxY(200), { deltaY: -40 }), true);
});

test("releases the wheel at the bottom so the canvas can zoom", () => {
  assert.equal(fire(scrollBoxY(200), { deltaY: 40 }), false); // 200 + 100 === 300
});

test("releases the wheel at the top so the canvas can zoom", () => {
  assert.equal(fire(scrollBoxY(0), { deltaY: -40 }), false);
});

test("ignores content that does not overflow", () => {
  const box = el({ style: { overflowY: "auto", overflowX: "visible" }, scrollHeight: 100, clientHeight: 100 });
  assert.equal(fire(box, { deltaY: 40 }), false);
});

test("leaves ctrl+wheel (host pinch-zoom) alone", () => {
  assert.equal(fire(scrollBoxY(0), { deltaY: 40, ctrlKey: true }), false);
});

test("walks up from a non-scrolling child to the scroll container", () => {
  const outer = scrollBoxY(0);
  const inner = el({ parentNode: outer });
  assert.equal(fire(inner, { deltaY: 40 }), true);
});

test("the nearest scroll container decides, even when a parent could also scroll", () => {
  const outer = scrollBoxY(0);
  const innerAtBottom = el({
    style: { overflowY: "auto", overflowX: "visible" },
    scrollHeight: 200, clientHeight: 50, scrollTop: 150, parentNode: outer,
  });
  // Inner is at its bottom: the wheel is released even though outer could scroll.
  assert.equal(fire(innerAtBottom, { deltaY: 40 }), false);
});

test("keeps a horizontal wheel while a row can still scroll sideways", () => {
  const strip = el({ style: { overflowX: "auto", overflowY: "visible" }, scrollWidth: 400, clientWidth: 120 });
  assert.equal(fire(strip, { deltaX: 30 }), true);
});

test("stops at the widget root: a scrollable root is the host's, not ours", () => {
  const root = scrollBoxY(0);
  const child = el({ parentNode: root });
  assert.equal(fire(child, { deltaY: 40, root }), false);
});
