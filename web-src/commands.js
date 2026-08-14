// Keyboard command dispatch for the OmniCam Director.
// Shortcuts stay scoped to the OmniCam viewport root and never fire while typing
// into inputs, selects, textareas, buttons (Space/Enter), or editable content.

import { add, cameraBasis, cloneCamera, length, mul, sub } from "./omnicam-core.js";

const TRANSFORM_KEYS = { t: "translate", r: "rotate", s: "scale" };
const FLY_KEYS = new Set(["w", "a", "s", "d", "q", "e"]);

export function isEditableTarget(target) {
  return (
    !(target instanceof HTMLElement) ||
    ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
    target.isContentEditable ||
    Boolean(target.closest?.('[contenteditable="true"],span.property_value')) ||
    (target.tagName === "BUTTON" && false)
  );
}

// Returns true when the event was consumed by an OmniCam command.
export function dispatchDirectorKey(ui, event) {
  const target = event.composedPath?.()[0] || event.target;
  if (!(target instanceof HTMLElement)) return false;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) || target.isContentEditable) return false;
  if (target.closest?.('[contenteditable="true"],span.property_value')) return false;
  if (target.tagName === "BUTTON" && (event.code === "Space" || event.key === "Enter")) return false;
  if (ui.contextMenu.onKey(event)) return true;

  const key = event.key.toLowerCase();
  const capture = () => {
    event.preventDefault();
    event.stopPropagation();
  };

  if ((event.ctrlKey || event.metaKey) && key === "z") {
    capture();
    if (!event.repeat) event.shiftKey ? ui.redo() : ui.undo();
    return true;
  }
  if ((event.ctrlKey || event.metaKey) && key === "y") {
    capture();
    if (!event.repeat) ui.redo();
    return true;
  }
  if ((event.ctrlKey || event.metaKey) && key === "c") {
    capture();
    ui.copyKeyframe();
    return true;
  }
  if ((event.ctrlKey || event.metaKey) && key === "v") {
    capture();
    ui.pasteKeyframe();
    return true;
  }
  if (event.ctrlKey || event.metaKey || event.altKey) return false;

  if (ui.selectedObject() && TRANSFORM_KEYS[key]) {
    capture();
    if (!event.repeat) ui.setTransformMode(TRANSFORM_KEYS[key]);
    return true;
  }
  if (key === "i") {
    capture();
    if (!event.repeat) ui.insertKeyframe();
    return true;
  }
  if (event.code === "Space") {
    capture();
    if (!event.repeat) ui.togglePlay();
    return true;
  }
  if (key === "f") {
    capture();
    if (!event.repeat) ui.frameTarget();
    return true;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    capture();
    if (!event.repeat) ui.deleteKeyframe();
    return true;
  }
  if (event.key === "ArrowLeft") {
    capture();
    ui.setFrame(ui.frame - 1);
    return true;
  }
  if (event.key === "ArrowRight") {
    capture();
    ui.setFrame(ui.frame + 1);
    return true;
  }
  if (key === ",") {
    capture();
    ui.goToAdjacentKey(-1);
    return true;
  }
  if (key === ".") {
    capture();
    ui.goToAdjacentKey(1);
    return true;
  }
  if (event.key === "Home") {
    capture();
    ui.selectKeyframe(ui.timelineKeyframes()[0]);
    return true;
  }
  if (event.key === "End") {
    capture();
    const keys = ui.timelineKeyframes();
    ui.selectKeyframe(keys[keys.length - 1]);
    return true;
  }
  if (!FLY_KEYS.has(key)) return false;

  capture();
  const camera = ui.viewportCamera();
  const editorView = ui.state.view_mode !== "camera";
  const { right, up, forward } = cameraBasis(camera);
  const speed = (event.shiftKey ? 0.6 : 0.18) * ui.cameraSpeed;
  let delta = [0, 0, 0];
  if (key === "w") delta = mul(forward, speed);
  if (key === "s") delta = mul(forward, -speed);
  if (key === "d") delta = mul(right, speed);
  if (key === "a") delta = mul(right, -speed);
  if (key === "e") delta = mul(up, speed);
  if (key === "q") delta = mul(up, -speed);
  if (!editorView) ui.beginCameraEdit();
  camera.position = add(camera.position, delta);
  camera.target = add(camera.target, delta);
  if (editorView) {
    ui.serialize();
    ui.render();
  } else {
    ui.commitCameraEdit();
    ui.finishCameraEdit();
  }
  return true;
}
