// Keyboard command dispatch for the OmniCam Director.
//
// Two things this file is careful about:
//
//  1. ComfyUI's ChangeTracker listens for keydown on `window` in the capture
//     phase and runs a full graph undo on Ctrl+Z unless focus is in an input.
//     A bubble-phase listener on the node cannot stop it. So OmniCam installs
//     ONE window-level capture listener (installGlobalKeyInterceptor), routes
//     the event to the owning Director, and only if OmniCam consumes the key
//     does it stopImmediatePropagation -- ComfyUI never sees it.
//
//  2. Shortcuts are scoped to the zone the event came from: the viewport owns
//     the spatial keys (T/R/S, numpad views, fly), the timeline family owns the
//     temporal keys (frame step, key nav, insert key), the sequence editor owns
//     its own (S split, Delete removes a shot). Only a small transport set
//     (undo/redo, copy/paste, duplicate, Space, Escape) is truly global.

import { add, cameraBasis, mul } from "./omnicam-core.js";
import { cancelViewportInteraction } from "./viewport-controls/interactions.js";
import { beginModalTransform, handleModalTransformKey } from "./viewport-controls/modal-transform.js";
import { directorForTarget } from "./settings.js";
import {
  autoSequenceCuts, cutAtFrame, removeCut, sequenceCuts, splitCutAtFrame,
} from "./director/sequence.js";

const TRANSFORM_KEYS = { t: "translate", r: "rotate", s: "scale" };

// First match wins; sequence is inside .oc-graph, so it must be checked first.
const ZONE_SELECTORS = [
  ["viewport", ".viewport-wrap"],
  ["sequence", '[data-role="graph-sequence"]'],
  ["graph", ".oc-graph"],
  ["timeline", ".oc-timeline"],
];

export function isEditableTarget(target) {
  return (
    !(target instanceof HTMLElement) ||
    ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName) ||
    target.isContentEditable ||
    Boolean(target.closest?.('[contenteditable="true"],span.property_value'))
  );
}

/** The zone `target` sits in, or null when it is in none. */
export function resolveZone(target) {
  const element = target instanceof HTMLElement ? target : null;
  for (const [zone, selector] of ZONE_SELECTORS) {
    if (element?.closest?.(selector)) return zone;
  }
  return null;
}

/** The zone a key event belongs to, falling back to the last touched zone. */
export function zoneOf(target, ui) {
  return resolveZone(target) || ui?.lastKeyZone || "viewport";
}

let interceptorInstalled = false;

/**
 * One window-level capture listener for the whole page. It resolves the owning
 * Director from the event target and lets OmniCam claim the key before
 * ComfyUI's own capture-phase handlers (graph undo, canvas shortcuts) run.
 * Holds no Director reference; once every Director is disposed it is inert.
 */
export function installGlobalKeyInterceptor() {
  if (interceptorInstalled || typeof window === "undefined") return;
  interceptorInstalled = true;
  window.addEventListener("keydown", (event) => {
    const target = event.composedPath?.()[0] || event.target;
    const ui = directorForTarget(target);
    if (!ui || ui.disposed) return;
    if (dispatchDirectorKey(ui, event)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      event.stopPropagation();
    }
  }, { capture: true });
}

// Returns true when the event was consumed by an OmniCam command.
export function dispatchDirectorKey(ui, event) {
  const target = event.composedPath?.()[0] || event.target;
  if (isEditableTarget(target)) return false;
  if (target.tagName === "BUTTON" && (event.code === "Space" || event.key === "Enter")) return false;
  if (ui.contextMenu.onKey(event)) return true;

  if (ui.modalTransform) {
    handleModalTransformKey(ui, event);
    return true;
  }

  if (globalKeymap(ui, event)) return true;

  // Other Ctrl/Cmd or Alt combos are ComfyUI's to handle (Numpad is exempt so
  // Ctrl+Numpad view flips still reach the viewport map).
  const code = event.code;
  if (((event.ctrlKey || event.metaKey) && !code.startsWith("Numpad")) || event.altKey) return false;

  switch (zoneOf(target, ui)) {
    case "viewport": return viewportKeymap(ui, event);
    case "sequence": return sequenceKeymap(ui, event);
    case "timeline":
    case "graph": return timelineKeymap(ui, event);
    default: return false;
  }
}

// --- global: transport + history, fire from any zone -------------------------

function globalKeymap(ui, event) {
  const key = event.key.toLowerCase();
  const mod = event.ctrlKey || event.metaKey;

  if (key === "escape") {
    if (cancelViewportInteraction(ui)) return true;
    if (ui.isNavigatingFly) {
      ui.isNavigatingFly = false;
      ui.setStatus("Fly Mode OFF");
      return true;
    }
    return false;
  }
  if (mod && key === "z") {
    if (!event.repeat) (event.shiftKey ? ui.redo() : ui.undo());
    return true;
  }
  if (mod && key === "y") {
    if (!event.repeat) ui.redo();
    return true;
  }
  if (mod && key === "c") { ui.copyKeyframe(); return true; }
  if (mod && key === "v") { ui.pasteKeyframe(); return true; }
  if (mod && key === "d") {
    if (!event.repeat) {
      if (ui.selectedEntity === "object" && ui.selectedObjectId) ui.duplicateObject(ui.selectedObjectId);
      else if (ui.selectedEntity === "camera") ui.duplicateCamera(ui.state.active_camera_id);
    }
    return true;
  }
  if (event.altKey && key === "h") {
    if (!event.repeat) ui.showAllObjects();
    return true;
  }
  if (event.code === "Space") {
    if (!event.repeat) ui.togglePlay();
    return true;
  }
  return false;
}

// --- viewport: spatial keys ------------------------------------------------

function viewportKeymap(ui, event) {
  const key = event.key.toLowerCase();
  const code = event.code;

  if (event.shiftKey && key === "g" && !ui.isNavigatingFly) { ui.selectHierarchy(); return true; }
  if (TRANSFORM_KEYS[key] && !ui.isNavigatingFly) {
    if (!event.repeat) beginModalTransform(ui, TRANSFORM_KEYS[key]);
    return true;
  }
  if (key === "tab") {
    const nextMode = ui.state.select_mode === "object" ? "vertex" : "object";
    ui.setSelectMode(nextMode);
    ui.setStatus(nextMode === "object" ? "Object Mode" : "Component Mode: Vertex");
    return true;
  }
  if (key === "f" || code === "NumpadDecimal") {
    if (!event.repeat) ui.frameTarget();
    return true;
  }
  if (key === "n") {
    if (!event.repeat) ui.toggleInspector();
    return true;
  }
  if ((event.shiftKey && (code === "Backquote" || key === "~")) || (key === "c" && !event.shiftKey && !event.altKey && !event.ctrlKey)) {
    ui.isNavigatingFly = !ui.isNavigatingFly;
    ui.setStatus(ui.isNavigatingFly ? "Fly Mode ON · WASD/QE to fly, Drag to look, Esc/C to exit" : "Fly Mode OFF");
    return true;
  }

  const digit = { Digit1: "vertex", Digit2: "edge", Digit3: "face", Digit4: "object" };
  if (digit[code] || (!code.startsWith("Numpad") && ["1", "2", "3", "4"].includes(key))) {
    ui.setSelectMode(digit[code] || { 1: "vertex", 2: "edge", 3: "face", 4: "object" }[key]);
    return true;
  }

  if (code === "Numpad0") { ui.setViewMode("camera"); return true; }
  if (code === "Numpad1") { ui.setViewMode(event.ctrlKey || event.metaKey ? "back" : "front"); return true; }
  if (code === "Numpad3") { ui.setViewMode(event.ctrlKey || event.metaKey ? "left" : "right"); return true; }
  if (code === "Numpad7") { ui.setViewMode(event.ctrlKey || event.metaKey ? "bottom" : "top"); return true; }
  if (code === "Numpad9") { ui.setViewMode("bottom"); return true; }
  if (code === "Numpad5") { ui.setViewMode(ui.state.view_mode === "camera" ? "perspective" : "camera"); return true; }

  if (key === "h" && !event.ctrlKey && !event.metaKey && !event.altKey) {
    if (!event.repeat && ui.selectedEntity === "object" && ui.selectedObjectId) ui.toggleObject(ui.selectedObjectId);
    return true;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    if (!event.repeat) {
      if (ui.selectedEntity === "object" && ui.selectedObjectId) ui.deleteObject(ui.selectedObjectId);
      else if (ui.selectedEntity === "camera") ui.deleteCamera(ui.state.active_camera_id);
    }
    return true;
  }

  if (["w", "a", "s", "d", "q", "e"].includes(key) && ui.isNavigatingFly) {
    const camera = ui.viewportCamera();
    const editorView = ui.state.view_mode !== "camera";
    const { right, up, forward } = cameraBasis(camera);
    const speed = (event.shiftKey ? 0.6 : 0.18) * ui.cameraSpeed;
    const delta = { w: mul(forward, speed), s: mul(forward, -speed), d: mul(right, speed), a: mul(right, -speed), e: mul(up, speed), q: mul(up, -speed) }[key];
    if (!editorView) ui.beginCameraEdit();
    camera.position = add(camera.position, delta);
    camera.target = add(camera.target, delta);
    if (editorView) { ui.serialize(); ui.render(); } else { ui.commitCameraEdit(); ui.finishCameraEdit(); }
    return true;
  }
  return false;
}

// --- timeline family: temporal keys (dope sheet, transport, graph editor) ----

function timelineKeymap(ui, event) {
  const key = event.key.toLowerCase();
  const code = event.code;

  if (key === "i" || key === "k") {
    if (!event.repeat) ui.insertKeyframe();
    return true;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    if (!event.repeat && ui.selectedKeyframe()) ui.deleteKeyframe();
    return true;
  }
  if (event.key === "ArrowUp" || (event.shiftKey && event.key === "ArrowRight") || (key === "." && code !== "NumpadDecimal")) {
    ui.goToAdjacentKey(1);
    return true;
  }
  if (event.key === "ArrowDown" || (event.shiftKey && event.key === "ArrowLeft") || key === ",") {
    ui.goToAdjacentKey(-1);
    return true;
  }
  if (event.key === "ArrowLeft") { ui.setFrame(ui.frame - 1); return true; }
  if (event.key === "ArrowRight") { ui.setFrame(ui.frame + 1); return true; }
  if (event.key === "Home") { ui.selectKeyframe(ui.timelineKeyframes()[0]); return true; }
  if (event.key === "End") {
    const keys = ui.timelineKeyframes();
    ui.selectKeyframe(keys[keys.length - 1]);
    return true;
  }
  return false;
}

// --- sequence editor: shot keys --------------------------------------------

// Serialize + repaint after a sequence mutation. The checkpoint is taken by the
// caller *before* it mutates, matching the rest of the editor.
function refreshSequence(ui) {
  ui.scheduleSerialize();
  ui.refreshKeys();
  ui.refreshCameraSelectors();
  ui.render();
}

function sequenceKeymap(ui, event) {
  const key = event.key.toLowerCase();

  if (event.key === "ArrowLeft") { ui.setFrame(ui.frame - 1); return true; }
  if (event.key === "ArrowRight") { ui.setFrame(ui.frame + 1); return true; }
  if (event.key === "Home") { ui.setFrame(0); return true; }
  if (event.key === "End") { ui.setFrame(ui.state.duration_frames - 1); return true; }

  if (key === "s" || key === "a") {
    if (event.repeat) return true;
    const cuts = sequenceCuts(ui.state);
    if (!cuts.length || key === "a") {
      ui.checkpoint("Auto-split shots");
      ui.state.sequence = { ...(ui.state.sequence || { recording_path: "" }), enabled: true, cuts: autoSequenceCuts(ui.state) };
      refreshSequence(ui);
    } else {
      ui.checkpoint("Split shot");
      if (splitCutAtFrame(ui.state, ui.frame, null)) refreshSequence(ui);
      else ui.setStatus("Move the playhead inside a shot first");
    }
    return true;
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    if (event.repeat) return true;
    const cuts = sequenceCuts(ui.state);
    const at = cutAtFrame(ui.state, ui.frame);
    const index = at ? cuts.findIndex((cut) => cut.start === at.start) : -1;
    if (index >= 0) {
      ui.checkpoint("Remove shot");
      if (removeCut(ui.state, index)) refreshSequence(ui);
    }
    return true;
  }
  return false;
}
