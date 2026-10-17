import test from "node:test";
import assert from "node:assert/strict";
import { beginModalTransform, updateModalTransform } from "../../web-src/viewport-controls/modal-transform.js";

function modalUi(objects) {
  const checkpoints = [];
  return {
    state: { objects, view_mode: "camera", editor_views: {}, spatial_snap_mode: "none", spatial_grid_size: 0.5 },
    camera: { position: [6, 4, 6], target: [0, 0, 0], up: [0, 1, 0], fov: 35, camera_type: "perspective", zoom: 1 },
    canvas: { width: 800, height: 450 }, interactionElement: { getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 }) },
    selectedObjectId: objects[0].id, selectedObjectIds: new Set(objects.map((object) => object.id)), checkpoints,
    checkpoint(label) { checkpoints.push(label); }, beginObjectEdit() {}, commitObjectEdit() {}, setTransformMode(mode) { this.state.gizmo_mode = mode; },
    setStatus() {}, render() {}, refreshInspector() {}, scheduleSerialize() {}, refreshKeys() {}, drawCurveEditor() {},
  };
}

for (const mode of ["translate", "rotate", "scale"]) {
  test(`modal ${mode} precision toggle keeps the transform stationary`, () => {
    const object = { id: "a", position: [0, 0, 0], rotation: [0, 0, 0], size: [1, 1, 1], keyframes: [] };
    const ui = modalUi([object]);
    beginModalTransform(ui, mode);
    updateModalTransform(ui, { clientX: 420, clientY: 225 });
    const before = JSON.stringify(object);
    updateModalTransform(ui, { clientX: 420, clientY: 225, shiftKey: true });
    assert.equal(JSON.stringify(object), before);
  });
}
