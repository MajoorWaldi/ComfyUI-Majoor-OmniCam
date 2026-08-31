import * as THREE from "../three-runtime.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

const DEFAULT_POSTPROCESSING = {
  EffectComposer,
  OutlinePass,
  OutputPass,
  RenderPass,
  Vector2: THREE.Vector2,
};

export function hasOutlineMesh(root) {
  let found = false;
  root?.traverse?.((object) => {
    if (found || object.visible === false || !object.isMesh) return;
    if (object.userData?.omnicamHelper || object.userData?.omnicamCaptureGuide) return;
    found = Boolean(object.geometry && object.material);
  });
  return found;
}

export class SelectionOutlineRenderer {
  constructor(renderer, scene, postprocessing = DEFAULT_POSTPROCESSING, initialCamera = null) {
    const { EffectComposer, RenderPass, OutlinePass, OutputPass, Vector2 } = postprocessing;
    this.disposed = false;
    this.width = 0;
    this.height = 0;
    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, initialCamera);
    this.outlinePass = new OutlinePass(new Vector2(1, 1), scene, initialCamera, []);
    this.outlinePass.visibleEdgeColor.set(0x8b5cf6);
    this.outlinePass.hiddenEdgeColor.set(0x312e81);
    this.outlinePass.edgeGlow = 0;
    this.outlinePass.edgeStrength = 4;
    this.outlinePass.edgeThickness = 1;
    this.outputPass = new OutputPass();
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.outlinePass);
    this.composer.addPass(this.outputPass);
  }

  render(camera, width, height, selectedObjects) {
    if (this.disposed) return;
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.composer.setSize(width, height);
    }
    this.renderPass.camera = camera;
    this.outlinePass.renderCamera = camera;
    this.outlinePass.selectedObjects = [...selectedObjects];
    this.composer.render(0);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.renderPass.dispose?.();
    this.outlinePass.dispose?.();
    this.outputPass.dispose?.();
    this.composer.dispose();
  }
}
