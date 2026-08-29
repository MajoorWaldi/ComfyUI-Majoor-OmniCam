import test from "node:test";
import assert from "node:assert/strict";

import { attachMeshOverlays, vertexOverlay, wireframeOverlay } from "../../web-src/viewport/mesh-overlays.js";

// A skinned model deforms on the GPU, so a helper built from its raw geometry
// stays in the bind pose while the animation plays. These cover the overlay
// shapes that keep the wireframe view in step with the animation.
function fakeThree() {
  class Node {
    constructor() { this.children = []; this.userData = {}; this.position = new Vec(); this.quaternion = new Vec(); this.scale = new Vec(); }
    add(child) { child.parent = this; this.children.push(child); return this; }
    traverse(fn) { fn(this); for (const child of [...this.children]) child.traverse(fn); }
  }
  class Vec { constructor(x = 0, y = 0, z = 0) { Object.assign(this, { x, y, z }); } copy(v) { return Object.assign(this, { x: v.x, y: v.y, z: v.z }); } set(x, y, z) { return Object.assign(this, { x, y, z }); } }
  class Geometry {
    constructor(count = 0) { this.count = count; this.attributes = {}; }
    clone() { const copy = new Geometry(this.count); copy.cloned = true; return copy; }
    getAttribute(name) { return this.attributes[name]; }
    setAttribute(name, attribute) { this.attributes[name] = attribute; }
  }
  class MeshNode extends Node {
    constructor(geometry, material) { super(); this.isMesh = true; this.geometry = geometry; this.material = material; this.matrix = { copy: () => {} }; }
  }
  class SkinnedNode extends MeshNode {
    constructor(geometry, material) { super(geometry, material); this.isSkinnedMesh = true; this.bindMatrix = "bind"; this.bindMode = "attached"; }
    bind(skeleton, bindMatrix) { this.skeleton = skeleton; this.boundWith = bindMatrix; }
  }
  return {
    Mesh: MeshNode,
    SkinnedMesh: SkinnedNode,
    Points: class extends Node { constructor(geometry, material) { super(); this.isPoints = true; this.geometry = geometry; this.material = material; } },
    LineSegments: class extends Node { constructor(geometry, material) { super(); this.isLine = true; this.geometry = geometry; this.material = material; } },
    BufferGeometry: Geometry,
    WireframeGeometry: class extends Geometry {},
    Float32BufferAttribute: class { constructor(array, itemSize) { this.array = array; this.itemSize = itemSize; this.count = array.length / itemSize; } setXYZ() {} },
    MeshBasicMaterial: class { constructor(options) { Object.assign(this, options); } },
    LineBasicMaterial: class { constructor(options) { Object.assign(this, options); } },
    PointsMaterial: class { constructor(options) { Object.assign(this, options); } },
    Vector3: Vec,
    __Geometry: Geometry,
  };
}

function skinnedFixture(THREE) {
  const root = new THREE.Mesh(new THREE.__Geometry(9), {});
  const skinned = new THREE.SkinnedMesh(new THREE.__Geometry(9), {});
  skinned.skeleton = { bones: ["a", "b"] };
  skinned.getVertexPosition = (index, target) => target.set(index, 0, 0);
  root.add(skinned);
  return { root, skinned };
}

test("a skinned wireframe overlay is bound to the model skeleton, not a frozen copy", () => {
  const THREE = fakeThree();
  const { skinned } = skinnedFixture(THREE);
  const { overlay, parent } = wireframeOverlay(THREE, skinned);
  assert.equal(overlay.isSkinnedMesh, true);
  assert.equal(overlay.skeleton, skinned.skeleton, "must share the animated skeleton");
  assert.equal(overlay.boundWith, skinned.bindMatrix);
  assert.equal(overlay.geometry.cloned, true, "must not share buffers the helper sweep disposes");
  assert.equal(parent, skinned.parent, "a skinned overlay is a sibling, not a child");
  assert.equal(overlay.userData.omnicamHelper, true);
});

test("a plain mesh keeps the cheap line-segment wireframe as a child", () => {
  const THREE = fakeThree();
  const mesh = new THREE.Mesh(new THREE.__Geometry(9), {});
  const { overlay, parent } = wireframeOverlay(THREE, mesh);
  assert.equal(overlay.isLine, true);
  assert.equal(parent, mesh);
});

test("skinned vertex points are re-skinned on the CPU because the points shader cannot", () => {
  const THREE = fakeThree();
  const { skinned } = skinnedFixture(THREE);
  skinned.geometry.attributes.position = { count: 4 };
  const { overlay } = vertexOverlay(THREE, skinned);
  assert.equal(overlay.geometry.getAttribute("position").count, 4);
  assert.equal(typeof overlay.onBeforeRender, "function");
  let sampled = 0;
  skinned.getVertexPosition = (index, target) => { sampled += 1; target.set(index, 0, 0); };
  overlay.onBeforeRender();
  assert.equal(sampled, 4, "every point must be resampled from the animated pose");
});

test("attaching overlays never walks into the overlays it just created", () => {
  const THREE = fakeThree();
  const { root, skinned } = skinnedFixture(THREE);
  skinned.geometry.attributes.position = { count: 3 };
  attachMeshOverlays(THREE, root, { wireframe: true, vertices: true });
  const helpers = [];
  root.traverse((node) => { if (node.userData.omnicamHelper) helpers.push(node); });
  // Two meshes (root + skinned) x two overlays, and not one overlay more.
  assert.equal(helpers.length, 4);
});
