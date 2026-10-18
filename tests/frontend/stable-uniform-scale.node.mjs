import test from "node:test";
import assert from "node:assert/strict";
import { Vector3 } from "three";
import { installStableUniformScale } from "../../web-src/viewport/stable-uniform-scale.js";

function fixture() {
  const controls = { mode: "scale", axis: "XYZ", dragging: false,
    object: { scale: new Vector3(1, 2, 0.01) }, events: [], fallbacks: 0,
    pointerDown() { this.dragging = true; },
    pointerMove() { this.fallbacks++; }, pointerUp() { this.dragging = false; },
    dispatchEvent(event) { this.events.push(event.type); },
  };
  const dispose = installStableUniformScale(controls, { getBoundingClientRect: () => ({ width: 800, height: 400 }) });
  return { controls, dispose };
}

test("uniform scale is stationary at the pivot, reversible and baseline-relative", () => {
  const { controls: c, dispose } = fixture();
  c.pointerDown({ x: 0, y: 0, button: 0 });
  c.pointerMove({ x: 0, y: 0, button: -1 });
  assert.deepEqual(c.object.scale.toArray(), [1, 2, 0.01]);
  c.pointerMove({ x: 0.1, y: 0, button: -1 });
  const size = c.object.scale.toArray();
  c.pointerMove({ x: 0.1, y: 0, button: -1 });
  assert.deepEqual(c.object.scale.toArray(), size);
  assert.ok(size[0] > 1 && size[0] < 2);
  c.pointerMove({ x: 0, y: 0, button: -1 });
  assert.deepEqual(c.object.scale.toArray(), [1, 2, 0.01]);
  c.pointerUp(null); dispose();
});

test("snapping is proportional for differently sized axes and later drags use a fresh baseline", () => {
  const { controls: c, dispose } = fixture(); c.scaleSnap = 0.1;
  c.pointerDown({ x: 0, y: 0, button: 0 });
  c.pointerMove({ x: 0.1, y: 0, button: -1 });
  assert.ok(Math.abs(c.object.scale.y / c.object.scale.x - 2) < 1e-12);
  const before = c.object.scale.toArray(); c.pointerUp(null);
  c.pointerMove({ x: 0.5, y: 0, button: -1 });
  assert.deepEqual(c.object.scale.toArray(), before);
  c.pointerDown({ x: 0.5, y: 0, button: 0 });
  c.pointerMove({ x: 0.5, y: 0, button: -1 });
  assert.deepEqual(c.object.scale.toArray(), before); dispose();
});

test("other handles retain native transform behavior and disposal restores public methods", () => {
  const { controls: c, dispose } = fixture(); c.axis = "X";
  c.pointerDown({ x: 0, y: 0, button: 0 }); c.pointerMove({ x: 0.1, y: 0, button: -1 });
  assert.equal(c.fallbacks, 1); dispose(); c.pointerMove({}); assert.equal(c.fallbacks, 2);
});
