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
  constructor(canvas, { onFrameCamera = () => {} } = {}) {
    this.canvas = canvas;
    this.onFrameCamera = onFrameCamera;
    this.disposed = false;
    this.pending = 0;

    this.trackScene = new TrackScene();
    this.camera = new PerspectiveCamera(50, 16 / 9, 0.01, 100000);
    this.controls = new TrackControls(this.camera, { onChange: () => this.requestRender() });

    try {
      this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false });
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

  setFrame(frame) {
    const camera = this.trackScene.setFrame(frame);
    if (camera) this.onFrameCamera(camera);
    this.requestRender();
    return camera;
  }

  setView(view) {
    this.controls.setView(view);
    return view;
  }

  fit() {
    const bounds = this.trackScene.bounds();
    this.controls.fit(bounds);
    return bounds;
  }

  // -- rendering ---------------------------------------------------------

  resize() {
    const width = this.canvas?.clientWidth || this.canvas?.width || 1;
    const height = this.canvas?.clientHeight || this.canvas?.height || 1;
    this.camera.aspect = Math.max(0.05, width / Math.max(1, height));
    this.camera.updateProjectionMatrix?.();
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
    this.renderer.render(this.trackScene.scene, this.camera);
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
