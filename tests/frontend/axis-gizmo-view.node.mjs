import assert from "node:assert/strict";
import test from "node:test";

import { drawAxisGizmo } from "../../web-src/axis-gizmo-view.js";

function element(name) {
  return {
    name,
    attributes: new Map(),
    children: [],
    textContent: "",
    setAttribute(key, value) { this.attributes.set(key, value); },
    appendChild(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; },
  };
}

test("drawAxisGizmo owns its translation dependency", () => {
  const previous = globalThis.document;
  const svg = element("svg");
  globalThis.document = { createElementNS: (_ns, name) => element(name) };
  try {
    drawAxisGizmo({
      root: { querySelector: () => svg },
      viewportCamera: () => ({ position: [0, 0, 10], target: [0, 0, 0], roll: 0 }),
    });
  } finally {
    globalThis.document = previous;
  }
  assert.equal(svg.children[0].attributes.get("aria-label"), "Frame selection");
  assert.equal(svg.children.filter((child) => child.attributes.get("data-axis")).length, 3);
});
