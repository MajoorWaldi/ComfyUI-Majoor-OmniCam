// A read-only 3D view of a solved camera trajectory.
//
// Deliberately not the Director viewport. That thing carries gizmos, picking,
// keyframe dragging, object editing and a playblast encoder, none of which have
// any business acting on a solve. This is the small, disposable, look-only
// version, and its public API has no mutating method at all.
//
// WebGL failure is survivable: if a renderer cannot be created the panel still
// works, it just has no 3D tab.

import { PerspectiveCamera, WebGLRenderer } from "../three-runtime.js";
import { TrackControls } from "./track-controls.js";
import { TrackScene } from "./track-scene.js";

export class TrackViewer {
  constructor(canvas, { onFrameCamera = () => {}, rendererFactory = (options) => new WebGLRenderer(options) } = {}) {
    this.canvas = canvas;
    this.onFrameCamera = onFrameCamera;
    this.disposed = false;
    this.pending = 0;

    this.trackScene = new TrackScene();
    this.sceneCamera = new PerspectiveCamera(50, 16 / 9, 0.01, 100000);
    this.solvedCamera = new PerspectiveCamera(50, 16 / 9, 0.01, 100000);
    this.renderCamera = this.sceneCamera;
    this.inspectionView = "scene";
    this.frame = 0;
    this.controls = new TrackControls(this.sceneCamera, { onChange: () => this.requestRender() });

    try {
      this.renderer = rendererFactory({ canvas, antialias: true, alpha: false });
      this.renderer.setClearColor(0x101014, 1);
    } catch (error) {
      console.warn("[OmniCam] track viewer WebGL unavailable", error);
      this.renderer = null;
    }
    this._bind();
    this.resize();
  }

  _bind() {
    if (!this.canvas) return;
    const down = (event) => {
      if (this.inspectionView === "camera") return;
      this.canvas.setPointerCapture?.(event.pointerId);
      this.controls.beginDrag(event);
    };
    const move = (event) => {
      if (this.controls.moveDrag(event)) event.preventDefault();
    };
    const up = (event) => {
      this.canvas.releasePointerCapture?.(event.pointerId);
      this.controls.endDrag();
    };
    const wheel = (event) => {
      if (this.inspectionView === "camera") return;
      event.preventDefault();
      this.controls.wheel(event);
    };
    this.canvas.addEventListener("pointerdown", down);
    this.canvas.addEventListener("pointermove", move);
    this.canvas.addEventListener("pointerup", up);
    this.canvas.addEventListener("pointercancel", up);
    this.canvas.addEventListener("wheel", wheel, { passive: false });
    this.listeners = [
      ["pointerdown", down], ["pointermove", move], ["pointerup", up],
      ["pointercancel", up], ["wheel", wheel],
    ];
  }

  // -- read-only API -----------------------------------------------------

  setRawTrack(track) {
    this.trackScene.setRawTrack(track);
    this.requestRender();
  }

  setRefinedTrack(track) {
    this.trackScene.setRefinedTrack(track);
    this.requestRender();
  }

  setMode(mode) {
    this.trackScene.setMode(mode);
    this.requestRender();
  }

  setLandmarks(points) {
    this.trackScene.setLandmarks(points);
    this.requestRender();
  }

  setFrame(frame) {
    this.frame = Math.max(0, Number(frame) || 0);
    const camera = this.trackScene.setFrame(frame);
    if (camera) {
      this._applySolvedCamera(camera);
      this.onFrameCamera(camera);
    }
    this.requestRender();
    return camera;
  }

  setView(view) {
    if (this.inspectionView === "camera") return this.inspectionView;
    this.controls.setView(view);
    return view;
  }

  fit() {
    const bounds = this.trackScene.bounds();
    this.controls.fit(bounds);
    return bounds;
  }

  setInspectionView(view) {
    this.inspectionView = view === "camera" ? "camera" : "scene";
    this.renderCamera = this.inspectionView === "camera" ? this.solvedCamera : this.sceneCamera;
    this.trackScene.setInspectionView(this.inspectionView);
    const camera = this.trackScene.setFrame(this.frame);
    if (camera) this._applySolvedCamera(camera);
    this.requestRender();
    return this.inspectionView;
  }

  _applySolvedCamera(camera) {
    const aspect = Math.max(0.05, (Number(this.trackScene.activeTrack()?.width) || 16) / Math.max(1, Number(this.trackScene.activeTrack()?.height) || 9));
    this.solvedCamera.aspect = aspect;
    this.solvedCamera.fov = Math.max(1, Math.min(179, Number(camera.fov) || 50));
    this.solvedCamera.position.set(...camera.position.map(Number));
    this.solvedCamera.up.set(0, 1, 0);
    this.solvedCamera.lookAt(...camera.target.map(Number));
    this.solvedCamera.rotateZ((Number(camera.roll) || 0) * Math.PI / 180);
    this.solvedCamera.updateProjectionMatrix?.();
  }

  // -- rendering ---------------------------------------------------------

  resize() {
    const width = this.canvas?.clientWidth || this.canvas?.width || 1;
    const height = this.canvas?.clientHeight || this.canvas?.height || 1;
    for (const camera of [this.sceneCamera, this.solvedCamera]) {
      camera.aspect = Math.max(0.05, width / Math.max(1, height));
      camera.updateProjectionMatrix?.();
    }
    this.renderer?.setSize?.(width, height, false);
    this.requestRender();
  }

  requestRender() {
    if (this.disposed || !this.renderer || this.pending) return;
    // One frame per animation frame at most: a slider drag can otherwise ask
    // for dozens of redraws between two paints.
    this.pending = globalThis.requestAnimationFrame?.(() => {
      this.pending = 0;
      this.render();
    }) || 0;
    if (!this.pending) this.render();
  }

  render() {
    if (this.disposed || !this.renderer) return;
    this.renderer.render(this.trackScene.scene, this.renderCamera);
  }

  dispose() {
    this.disposed = true;
    if (this.pending) globalThis.cancelAnimationFrame?.(this.pending);
    this.pending = 0;
    for (const [event, listener] of this.listeners || []) {
      this.canvas?.removeEventListener?.(event, listener);
    }
    this.listeners = [];
    this.trackScene.dispose();
    this.renderer?.dispose?.();
    this.renderer = null;
    this.canvas = null;
  }
}
