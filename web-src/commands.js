// Keyboard command dispatch for the OmniCam Director.
// Shortcuts stay scoped to the OmniCam viewport root and never fire while typing
// into inputs, selects, textareas, buttons (Space/Enter), or editable content.

import { add, cameraBasis, cloneCamera, length, mul, sub } from "./omnicam-core.js";
import { cancelViewportInteraction } from "./viewport-controls/interactions.js";
import { beginModalTransform, handleModalTransformKey } from "./viewport-controls/modal-transform.js";

const TRANSFORM_KEYS = {
  t: "translate",
  r: "rotate",
  s: "scale",
};

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
  const code = event.code;
  const capture = () => {
    event.preventDefault();
    event.stopImmediatePropagation?.();
    event.stopPropagation();
  };

  if (ui.modalTransform) {
    capture();
    handleModalTransformKey(ui, event);
    return true;
  }

  if (key === "escape" && cancelViewportInteraction(ui)) {
    capture();
    return true;
  }

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
  if ((event.ctrlKey || event.metaKey) && key === "d") {
    capture();
    if (!event.repeat) {
      if (ui.selectedEntity === "object" && ui.selectedObjectId) ui.duplicateObject(ui.selectedObjectId);
      else if (ui.selectedEntity === "camera") ui.duplicateCamera(ui.state.active_camera_id);
    }
    return true;
  }
  if (event.altKey && key === "h") {
    capture();
    if (!event.repeat) ui.showAllObjects();
    return true;
  }
  if (((event.ctrlKey || event.metaKey) && !code.startsWith("Numpad")) || event.altKey) return false;

  // OmniCam modal keymap: T/R/S. W/E/Q remain available to Fly
  // navigation and gizmo modes are selected explicitly from the toolbar.
  if (event.shiftKey && key === "g" && !ui.isNavigatingFly) {
    capture();
    ui.selectHierarchy();
    return true;
  }
  if (TRANSFORM_KEYS[key] && !ui.isNavigatingFly) {
    capture();
    if (!event.repeat) {
      beginModalTransform(ui, TRANSFORM_KEYS[key]);
    }
    return true;
  }
  if (key === "tab") {
    capture();
    const nextMode = ui.state.select_mode === "object" ? "vertex" : "object";
    ui.setSelectMode(nextMode);
    ui.setStatus(nextMode === "object" ? "Object Mode" : "Component Mode: Vertex");
    return true;
  }
  if (key === "i" || key === "k") {
    capture();
    if (!event.repeat) ui.insertKeyframe();
    return true;
  }
  if (code === "Space") {
    capture();
    if (!event.repeat) ui.togglePlay();
    return true;
  }
  if (key === "f") {
    capture();
    if (!event.repeat) ui.frameTarget();
    return true;
  }
  if (key === "escape" && ui.isNavigatingFly) {
    capture();
    ui.isNavigatingFly = false;
    ui.setStatus("Fly Mode OFF");
    return true;
  }
  if ((event.shiftKey && (code === "Backquote" || key === "~")) || (key === "c" && !event.shiftKey && !event.altKey && !event.ctrlKey)) {
    capture();
    ui.isNavigatingFly = !ui.isNavigatingFly;
    ui.setStatus(ui.isNavigatingFly ? "Fly Mode ON · WASD/QE to fly, Drag to look, Esc/C to exit" : "Fly Mode OFF");
    return true;
  }
  if (key === "n") {
    capture();
    if (!event.repeat) ui.toggleInspector();
    return true;
  }

  // 3D DCC Selection Modes (Blender / Maya standard shortcuts):
  // 1: Vertex Mode
  // 2: Edge Mode
  // 3: Face / Polygon Mode
  // 4: Object Mode
  if (code === "Digit1" || (!code.startsWith("Numpad") && key === "1")) {
    capture();
    ui.setSelectMode("vertex");
    return true;
  }
  if (code === "Digit2" || (!code.startsWith("Numpad") && key === "2")) {
    capture();
    ui.setSelectMode("edge");
    return true;
  }
  if (code === "Digit3" || (!code.startsWith("Numpad") && key === "3")) {
    capture();
    ui.setSelectMode("face");
    return true;
  }
  if (code === "Digit4" || (!code.startsWith("Numpad") && key === "4")) {
    capture();
    ui.setSelectMode("object");
    return true;
  }

  // Standard 3D Software Numpad View Switching:
  // Numpad 0: Active Camera view
  // Numpad 1: Front view (Ctrl/Cmd: Back)
  // Numpad 3: Right Side view (Ctrl/Cmd: Left)
  // Numpad 7: Top view (Ctrl/Cmd: Bottom)
  // Numpad 9: Bottom view
  // Numpad 5: Toggle Camera / Perspective
  if (code === "Numpad0") {
    capture();
    ui.setViewMode("camera");
    return true;
  }
  if (code === "Numpad1") {
    capture();
    ui.setViewMode(event.ctrlKey || event.metaKey ? "back" : "front");
    return true;
  }
  if (code === "Numpad3") {
    capture();
    ui.setViewMode(event.ctrlKey || event.metaKey ? "left" : "right");
    return true;
  }
  if (code === "Numpad7") {
    capture();
    ui.setViewMode(event.ctrlKey || event.metaKey ? "bottom" : "top");
    return true;
  }
  if (code === "Numpad9") {
    capture();
    ui.setViewMode("bottom");
    return true;
  }
  if (code === "Numpad5") {
    capture();
    ui.setViewMode(ui.state.view_mode === "camera" ? "perspective" : "camera");
    return true;
  }
  if (code === "NumpadDecimal") {
    capture();
    if (!event.repeat) ui.frameTarget();
    return true;
  }

  if (key === "h" && !event.ctrlKey && !event.metaKey && !event.altKey) {
    capture();
    if (!event.repeat && ui.selectedEntity === "object" && ui.selectedObjectId) ui.toggleObject(ui.selectedObjectId);
    return true;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    capture();
    if (!event.repeat) {
      if (ui.selectedKeyframe()) ui.deleteKeyframe();
      else if (ui.selectedEntity === "object" && ui.selectedObjectId) ui.deleteObject(ui.selectedObjectId);
      else if (ui.selectedEntity === "camera") ui.deleteCamera(ui.state.active_camera_id);
    }
    return true;
  }
  if (event.key === "ArrowUp" || (event.shiftKey && event.key === "ArrowRight") || (key === "." && code !== "NumpadDecimal")) {
    capture();
    ui.goToAdjacentKey(1);
    return true;
  }
  if (event.key === "ArrowDown" || (event.shiftKey && event.key === "ArrowLeft") || key === ",") {
    capture();
    ui.goToAdjacentKey(-1);
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

  // Fly camera navigation when navigating
  if (["w", "a", "s", "d", "q", "e"].includes(key) && ui.isNavigatingFly) {
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
  return false;
}
