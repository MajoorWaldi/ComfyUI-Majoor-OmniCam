import assert from "node:assert/strict";
import test from "node:test";

import { hasOutlineMesh, SelectionOutlineRenderer } from "../../web-src/viewport/selection-outline.js";

function mesh(overrides = {}) {
  return {
    isMesh: true,
    visible: true,
    geometry: {},
    material: {},
    userData: {},
    ...overrides,
  };
}

function group(...children) {
  return {
    traverse(callback) {
      callback(this);
      for (const child of children) {
        if (typeof child.traverse === "function") child.traverse(callback);
        else callback(child);
      }
    },
  };
}

function fakePostprocessing() {
  const state = {};
  class EffectComposer {
    constructor() {
      this.sizes = [];
      this.renderCount = 0;
      this.disposeCount = 0;
      this.passes = [];
      state.composer = this;
    }
    addPass(pass) { this.passes.push(pass); }
    setSize(width, height) { this.sizes.push([width, height]); }
    render() { this.renderCount += 1; }
    dispose() { this.disposeCount += 1; }
  }
  class RenderPass {
    constructor(scene, camera) { this.scene = scene; this.camera = camera; state.renderPass = this; }
    dispose() { this.disposeCount = (this.disposeCount || 0) + 1; }
  }
  class OutlinePass {
    constructor(_size, scene, camera) {
      this.renderScene = scene;
      this.renderCamera = camera;
      this.selectedObjects = [];
      this.disposeCount = 0;
      this.visibleEdgeColor = { set() {} };
      this.hiddenEdgeColor = { set() {} };
      state.outlinePass = this;
    }
    dispose() { this.disposeCount += 1; }
  }
  class OutputPass {
    dispose() { this.disposeCount = (this.disposeCount || 0) + 1; }
  }
  class Vector2 {
    constructor(x, y) { this.x = x; this.y = y; }
  }
  return {
    classes: { EffectComposer, RenderPass, OutlinePass, OutputPass, Vector2 },
    get composer() { return state.composer; },
    get renderPass() { return state.renderPass; },
    get outlinePass() { return state.outlinePass; },
  };
}

test("hasOutlineMesh finds renderable meshes inside groups and excludes helpers", () => {
  assert.equal(hasOutlineMesh(group(group(mesh()))), true);
  assert.equal(hasOutlineMesh(group(mesh({ visible: false }))), false);
  assert.equal(hasOutlineMesh(group(mesh({ userData: { omnicamHelper: true } }))), false);
  assert.equal(hasOutlineMesh(group(mesh({ userData: { omnicamCaptureGuide: true } }))), false);
  assert.equal(hasOutlineMesh(group({ isMesh: false })), false);
});

test("outline rendering updates camera, selection and size before rendering", () => {
  const fakes = fakePostprocessing();
  const outline = new SelectionOutlineRenderer("renderer", "scene", fakes.classes);
  outline.render("camera-a", 640, 360, ["mesh-a"]);
  outline.render("camera-b", 640, 360, ["mesh-b"]);
  assert.deepEqual(fakes.composer.sizes, [[640, 360]]);
  assert.equal(fakes.renderPass.camera, "camera-b");
  assert.equal(fakes.outlinePass.renderCamera, "camera-b");
  assert.deepEqual(fakes.outlinePass.selectedObjects, ["mesh-b"]);
  assert.equal(fakes.composer.renderCount, 2);
});

test("outline disposal releases every owned GPU surface exactly once", () => {
  const fakes = fakePostprocessing();
  const outline = new SelectionOutlineRenderer("renderer", "scene", fakes.classes);
  outline.dispose();
  outline.dispose();
  assert.equal(fakes.composer.disposeCount, 1);
  assert.equal(fakes.outlinePass.disposeCount, 1);
});
