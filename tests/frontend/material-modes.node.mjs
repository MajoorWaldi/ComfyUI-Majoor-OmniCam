import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeState } from "../../web-src/director/core.js";
import { wireframeOverlay, attachMeshOverlays } from "../../web-src/viewport/mesh-overlays.js";
import { viewportMarkup } from "../../web-src/template/viewport.js";
import { outlinerPanel } from "../../web-src/template/panels/outliner-panel.js";

function fakeThree() {
  class Node {
    constructor() { this.children = []; this.userData = {}; this.position = { x: 0, y: 0, z: 0 }; this.quaternion = { x: 0, y: 0, z: 0 }; this.scale = { x: 1, y: 1, z: 1 }; }
    add(child) { child.parent = this; this.children.push(child); return this; }
    traverse(fn) { fn(this); for (const child of [...this.children]) child.traverse(fn); }
  }
  class Geometry {
    constructor(count = 0) { this.count = count; this.attributes = {}; }
    clone() { const copy = new Geometry(this.count); copy.cloned = true; return copy; }
    getAttribute(name) { return this.attributes[name]; }
    setAttribute(name, attribute) { this.attributes[name] = attribute; }
  }
  class MeshNode extends Node {
    constructor(geometry, material) { super(); this.isMesh = true; this.geometry = geometry; this.material = material; }
  }
  class SkinnedNode extends MeshNode {
    constructor(geometry, material) { super(geometry, material); this.isSkinnedMesh = true; this.bindMatrix = "bind"; }
    bind(skeleton, bindMatrix) { this.skeleton = skeleton; this.boundWith = bindMatrix; }
  }
  return {
    Mesh: MeshNode,
    SkinnedMesh: SkinnedNode,
    LineSegments: class extends Node { constructor(geometry, material) { super(); this.isLine = true; this.geometry = geometry; this.material = material; } },
    BufferGeometry: Geometry,
    WireframeGeometry: class extends Geometry {},
    MeshBasicMaterial: class { constructor(options) { Object.assign(this, options); } },
    LineBasicMaterial: class { constructor(options) { Object.assign(this, options); } },
    PointsMaterial: class { constructor(options) { Object.assign(this, options); } },
    __Geometry: Geometry,
  };
}

test("sanitizeState permits new material modes wireframe_texture, wireframe_neutral, and matte", () => {
  const modes = ["textured", "wireframe_texture", "checker", "neutral", "wireframe_neutral", "wireframe", "matte"];
  for (const mode of modes) {
    const state = sanitizeState({
      objects: [{ id: "obj_1", type: "cube", material_mode: mode }],
    });
    assert.equal(state.objects[0].material_mode, mode, `mode ${mode} should be retained`);
  }

  // Unknown mode falls back to textured
  const fallback = sanitizeState({
    objects: [{ id: "obj_2", type: "cube", material_mode: "non_existent_mode" }],
  });
  assert.equal(fallback.objects[0].material_mode, "textured");
});

test("wireframeOverlay accepts custom color and opacity and enables depthTest", () => {
  const THREE = fakeThree();
  const mesh = new THREE.Mesh(new THREE.__Geometry(12), {});
  const { overlay } = wireframeOverlay(THREE, mesh, { color: 0x00ffff, opacity: 0.85 });

  assert.equal(overlay.isLine, true);
  assert.equal(overlay.material.color, 0x00ffff);
  assert.equal(overlay.material.opacity, 0.85);
  assert.equal(overlay.material.depthTest, true);
  assert.equal(overlay.material.transparent, true);
});

test("attachMeshOverlays creates wireframe overlay with custom styling", () => {
  const THREE = fakeThree();
  const root = new THREE.Mesh(new THREE.__Geometry(6), {});
  attachMeshOverlays(THREE, root, { wireframe: true, wireframeColor: 0x38bdf8, wireframeOpacity: 0.75 });

  const helpers = [];
  root.traverse((node) => { if (node.userData.omnicamHelper) helpers.push(node); });
  assert.equal(helpers.length, 1);
  assert.equal(helpers[0].material.color, 0x38bdf8);
  assert.equal(helpers[0].material.opacity, 0.75);
});

test("viewport and outliner templates contain wireframe overlay button and new material options", () => {
  const vp = viewportMarkup();
  assert.match(vp, /data-role="overlay-wireframe-btn"/);
  assert.match(vp, /data-act="toggle-wireframe-overlay"/);
  assert.match(vp, /value="wireframe_texture"/);
  assert.match(vp, /value="textured"/);

  const outliner = outlinerPanel();
  assert.match(outliner, /value="wireframe_texture"/);
  assert.match(outliner, /value="wireframe_neutral"/);
  assert.match(outliner, /value="matte"/);
});
