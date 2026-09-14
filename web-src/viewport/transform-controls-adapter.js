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
    // The anchor itself must also be part of the scene graph: TransformControls
    // reads `object.parent` (for updateMatrixWorld()) on every pointerDown, and
    // silently refuses to start a drag (only a console.error, no exception) when
    // the attached object has no parent.
    scene.add(anchor);
  }

  let currentTargetSpec = null;
  let dragStart = null; // { position: number[], rotationDeg: number[], scale: number[] }
  let dragging = false;
  // Rotation is tracked as a running sum of small, individually-wrapped steps
  // rather than a single (now - dragStart) subtraction: a three.js Euler
  // component wraps into (-180, 180], so a drag that carries a component past
  // that boundary would otherwise make a single raw subtraction jump by ~360
  // degrees for a mouse movement of only a few degrees. Each step between two
  // consecutive events is always small, so wrapping each step individually
  // (instead of the cumulative total) stays correct for drags that rotate
  // further than 180 degrees in one continuous gesture.
  let previousRotationDeg = null;
  let rotationAccumDeg = [0, 0, 0];

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

  /** Wrap a raw angle difference into (-180, 180]. */
  function wrapAngleDeg(diff) {
    return ((diff + 180) % 360 + 360) % 360 - 180;
  }

  function computeDelta(now) {
    if (!dragStart) return { position: [0, 0, 0], rotationDeg: [0, 0, 0], scaleFactors: [1, 1, 1] };
    const rotationDeg = now.rotationDeg.map((value, index) => {
      const previous = previousRotationDeg ? previousRotationDeg[index] : dragStart.rotationDeg[index];
      rotationAccumDeg[index] += wrapAngleDeg(value - previous);
      return rotationAccumDeg[index];
    });
    previousRotationDeg = now.rotationDeg;
    return {
      position: now.position.map((value, index) => value - dragStart.position[index]),
      rotationDeg,
      scaleFactors: now.scale.map((value, index) => (dragStart.scale[index] === 0 ? 1 : value / dragStart.scale[index])),
    };
  }

  function handleMouseDown() {
    dragStart = snapshotAnchor();
    previousRotationDeg = null;
    rotationAccumDeg = [0, 0, 0];
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
    // Clear our own drag state (and thus arm handleMouseUp/handleObjectChange's
    // `if (!dragStart) return` guards) *before* forcing three.js's pointerUp
    // below, so that call's own "mouseUp" event -- if it fires one -- is a
    // no-op here rather than a second, spurious onDragEnd.
    dragStart = null;
    previousRotationDeg = null;
    rotationAccumDeg = [0, 0, 0];
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
    // Without this, three.js's TransformControls stays internally "dragging"
    // (its `dragging`/`axis` state, and the native pointermove listener it
    // added on the real pointerdown) until the user's mouse button actually
    // comes back up -- so the gizmo mesh keeps visually following the pointer,
    // divorced from the state just reverted above, and `dragging-changed`
    // never fires false, leaving navigation/other pointer handling locked out
    // (see viewport-controls/interactions.js's onPointerMove). Passing `null`
    // (not a real pointer event) skips TransformControls' own button-code
    // check and unconditionally resets `dragging`/`axis`, which both stops any
    // further pointerMove() from mutating the anchor and fires the real
    // `dragging-changed`(false) event synchronously.
    controls.pointerUp?.(null);
  }

  function dispose() {
    controls.removeEventListener?.("mouseDown", handleMouseDown);
    controls.removeEventListener?.("objectChange", handleObjectChange);
    controls.removeEventListener?.("mouseUp", handleMouseUp);
    controls.removeEventListener?.("dragging-changed", handleDraggingChanged);
    if (scene?.remove && helper) scene.remove(helper);
    if (scene?.remove) scene.remove(anchor);
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
    // True whenever the pointer currently hovers (or is dragging) a visible
    // handle -- `controls.axis` is kept live by TransformControls' own
    // continuous pointermove hover listener, independent of whether a drag
    // has actually started. Callers use this to detect "the next pointerdown
    // belongs to this gizmo" before TransformControls' own listener runs.
    isHoveringHandle: () => Boolean(controls.axis),
  };
}
