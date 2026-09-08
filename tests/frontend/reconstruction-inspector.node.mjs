import assert from "node:assert/strict";
import test from "node:test";

import {
  reconstructionAdoptionDefaults,
  reconstructionInspectorRows,
  renderReconstructionRows,
} from "../../web-src/scene/reconstruction-inspector.js";

test("inspector rows expose semantic + per-axis confidence as strings", () => {
  const obj = {
    reconstruction: {
      role: "blockout_object",
      semantic: "chair",
      confidence: 0.823,
      axis_confidence: { width: 0.9, height: 0.9, depth: 0.41, yaw: 0.7 },
      completion_provider: "sam3d_objects",
    },
  };
  const rows = Object.fromEntries(reconstructionInspectorRows(obj));
  assert.equal(rows.Semantic, "chair");
  assert.equal(rows.Confidence, "0.82");
  assert.equal(rows.Depth, "0.41");
  assert.equal(rows.Completion, "sam3d_objects");
});

test("no reconstruction metadata -> no rows", () => {
  assert.deepEqual(reconstructionInspectorRows({}), []);
});

test("adoption defaults: blockout unlocked, room/reference locked, dense hidden in blockout mode", () => {
  assert.deepEqual(reconstructionAdoptionDefaults({ reconstruction: { role: "blockout_object" } }, "blockout"), {
    locked: false,
    visible: true,
  });
  assert.deepEqual(reconstructionAdoptionDefaults({ reconstruction: { role: "room" } }, "blockout"), {
    locked: true,
    visible: true,
  });
  assert.deepEqual(reconstructionAdoptionDefaults({ reconstruction: { role: "reference" } }, "blockout"), {
    locked: true,
    visible: false,
  });
  assert.deepEqual(reconstructionAdoptionDefaults({ reconstruction: { role: "reference" } }, "hybrid"), {
    locked: true,
    visible: true,
  });
});

test("renderReconstructionRows uses textContent only (no HTML injection)", () => {
  const created = [];
  const fakeDoc = {
    createElement(tag) {
      const el = {
        tag,
        className: "",
        _text: "",
        dataset: {},
        children: [],
        set textContent(v) {
          this._text = v;
        },
        get textContent() {
          return this._text;
        },
        append(...kids) {
          this.children.push(...kids);
        },
      };
      created.push(el);
      return el;
    },
  };
  const container = fakeDoc.createElement("div");
  const evil = { reconstruction: { role: "blockout_object", semantic: "<img src=x onerror=alert(1)>" } };
  renderReconstructionRows(container, evil, fakeDoc);
  const valueEls = created.filter((el) => el.className === "omnicam-recon-value");
  assert.ok(valueEls.some((el) => el.textContent.includes("<img")));
  // innerHTML was never touched
  assert.ok(created.every((el) => !("innerHTML" in el)));
});
