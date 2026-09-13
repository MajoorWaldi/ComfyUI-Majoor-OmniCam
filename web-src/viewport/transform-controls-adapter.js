// Thin adapter around Three.js `TransformControls`.
//
// This module owns exactly one `TransformControls` instance and one neutral
// `Object3D` anchor. It never touches OmniCam camera/object/path state: it
// only knows how to move a proxy anchor around, translate that into a
// normalized delta relative to a frozen drag-start snapshot, and forward
// lifecycle events (start / transform / end / dragging-changed) to callers.
//
// Callers are responsible for:
//   - building a TargetSpec (see viewport-controls/transform-target.js),
//   - applying the normalized delta to the real OmniCam camera/object/path
//     data through the existing pure transform helpers,
//   - history checkpointing (one drag = one undo step).
//
// See docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md section 18.

import { TransformControls } from "three/addons/controls/TransformControls.js";

const VALID_MODES = new Set(["translate", "rotate", "scale"]);
const VALID_SPACES = new Set(["world", "local"]);
const RAD2DEG = 180 / Math.PI;

function toArray3(vectorLike) {
  return [vectorLike.x, vectorLike.y, vectorLike.z];
}

function eulerDegrees(eulerLike) {
  return [eulerLike.x * RAD2DEG, eulerLike.y * RAD2DEG, eulerLike.z * RAD2DEG];
}

/**
 * @param {object} options
 * @param {object} options.THREE            the OmniCam three-runtime barrel (for Object3D)
 * @param {object} options.camera           the active viewport camera
 * @param {*} options.domElement            the canvas element controls listen on
 * @param {object} options.scene            a Three.js Scene-like object with add()/remove()
 * @param {(info: {targetSpec: object}) => void} [options.onDragStart]
 * @param {(info: {targetSpec: object, position: number[], rotationDeg: number[], scale: number[], delta: object}) => void} [options.onTransform]
 * @param {(info: {targetSpec: object, position: number[], rotationDeg: number[], scale: number[], delta: object, cancelled: boolean}) => void} [options.onDragEnd]
 * @param {(dragging: boolean) => void} [options.onDraggingChanged]
 * @param {(camera: object, domElement: *) => object} [options.controlsFactory] test seam
 * @param {() => object} [options.anchorFactory] test seam
 */
export function createTransformControlsAdapter({
  THREE,
  camera,
  domElement,
  scene,
  onDragStart,
  onTransform,
  onDragEnd,
  onDraggingChanged,
  controlsFactory,
  anchorFactory,
} = {}) {
  const anchor = anchorFactory ? anchorFactory() : new THREE.Object3D();
  const controls = controlsFactory
    ? controlsFactory(camera, domElement)
    : new TransformControls(camera, domElement);

  let helper = null;
  if (scene?.add) {
    helper = typeof controls.getHelper === "function" ? controls.getHelper() : controls;
    scene.add(helper);
  }

  let currentTargetSpec = null;
  let dragStart = null; // { position: number[], rotationDeg: number[], scale: number[] }
  let dragging = false;

  function snapshotAnchor() {
    return {
      position: toArray3(anchor.position),
      rotationDeg: eulerDegrees(anchor.rotation),
      scale: toArray3(anchor.scale),
    };
  }

  function applySnapshotToAnchor(snapshot) {
    anchor.position.set(...snapshot.position);
    anchor.rotation.set(
      snapshot.rotationDeg[0] / RAD2DEG,
      snapshot.rotationDeg[1] / RAD2DEG,
      snapshot.rotationDeg[2] / RAD2DEG,
    );
    anchor.scale.set(...snapshot.scale);
  }

  function computeDelta(now) {
    if (!dragStart) return { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] };
    return {
      position: now.position.map((value, index) => value - dragStart.position[index]),
      rotationDeg: now.rotationDeg.map((value, index) => value - dragStart.rotationDeg[index]),
      scaleFactors: now.scale.map((value, index) => (dragStart.scale[index] === 0 ? 1 : value / dragStart.scale[index])),
    };
  }

  function handleMouseDown() {
    dragStart = snapshotAnchor();
    onDragStart?.({ targetSpec: currentTargetSpec });
  }

  function handleObjectChange() {
    if (!dragStart) return;
    const now = snapshotAnchor();
    onTransform?.({
      targetSpec: currentTargetSpec,
      position: now.position,
      rotationDeg: now.rotationDeg,
      scale: now.scale,
      delta: computeDelta(now),
    });
  }

  function handleMouseUp() {
    if (!dragStart) return;
    const now = snapshotAnchor();
    onDragEnd?.({
      targetSpec: currentTargetSpec,
      position: now.position,
      rotationDeg: now.rotationDeg,
      scale: now.scale,
      delta: computeDelta(now),
      cancelled: false,
    });
    dragStart = null;
  }

  function handleDraggingChanged(event) {
    dragging = !!event?.value;
    onDraggingChanged?.(dragging);
  }

  controls.addEventListener?.("mouseDown", handleMouseDown);
  controls.addEventListener?.("objectChange", handleObjectChange);
  controls.addEventListener?.("mouseUp", handleMouseUp);
  controls.addEventListener?.("dragging-changed", handleDraggingChanged);

  function attach(targetSpec) {
    currentTargetSpec = targetSpec;
    anchor.position.set(...(targetSpec.position || [0, 0, 0]));
    const rotation = targetSpec.rotation || [0, 0, 0];
    anchor.rotation.set(rotation[0] / RAD2DEG, rotation[1] / RAD2DEG, rotation[2] / RAD2DEG);
    anchor.scale.set(...(targetSpec.scale || [1, 1, 1]));
    controls.attach(anchor);
    controls.visible = true;
  }

  function detach() {
    currentTargetSpec = null;
    dragStart = null;
    controls.detach();
    controls.visible = false;
  }

  function setCamera(nextCamera) {
    if ("camera" in controls) controls.camera = nextCamera;
  }

  function setMode(mode) {
    if (!VALID_MODES.has(mode)) throw new Error(`createTransformControlsAdapter: unknown mode "${mode}"`);
    controls.setMode ? controls.setMode(mode) : (controls.mode = mode);
  }

  function setSpace(space) {
    if (!VALID_SPACES.has(space)) throw new Error(`createTransformControlsAdapter: unknown space "${space}"`);
    controls.space = space;
  }

  function setTranslationSnap(value) {
    controls.setTranslationSnap ? controls.setTranslationSnap(value) : (controls.translationSnap = value);
  }

  function setRotationSnap(value) {
    controls.setRotationSnap ? controls.setRotationSnap(value) : (controls.rotationSnap = value);
  }

  function setScaleSnap(value) {
    controls.setScaleSnap ? controls.setScaleSnap(value) : (controls.scaleSnap = value);
  }

  /** Restore the anchor to its drag-start transform and stop the drag without
   * firing onDragEnd (a cancel is not a commit). Safe to call when idle. */
  function cancelDrag() {
    if (!dragStart) return;
    const snapshot = dragStart;
    applySnapshotToAnchor(snapshot);
    onTransform?.({
      targetSpec: currentTargetSpec,
      position: snapshot.position,
      rotationDeg: snapshot.rotationDeg,
      scale: snapshot.scale,
      delta: { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] },
    });
    onDragEnd?.({
      targetSpec: currentTargetSpec,
      position: snapshot.position,
      rotationDeg: snapshot.rotationDeg,
      scale: snapshot.scale,
      delta: { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] },
      cancelled: true,
    });
    dragStart = null;
  }

  function dispose() {
    controls.removeEventListener?.("mouseDown", handleMouseDown);
    controls.removeEventListener?.("objectChange", handleObjectChange);
    controls.removeEventListener?.("mouseUp", handleMouseUp);
    controls.removeEventListener?.("dragging-changed", handleDraggingChanged);
    if (scene?.remove && helper) scene.remove(helper);
    controls.dispose?.();
    currentTargetSpec = null;
    dragStart = null;
  }

  return {
    attach,
    detach,
    setCamera,
    setMode,
    setSpace,
    setTranslationSnap,
    setRotationSnap,
    setScaleSnap,
    cancelDrag,
    dispose,
    isDragging: () => dragging,
  };
}
