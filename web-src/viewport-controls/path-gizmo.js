// Wiring between the viewport gizmo drag and the pure camera-path transform.
// Kept out of interactions.js so that file stays under the source-line cap and
// the transform maths in camera-path-transform.js stays DOM-free.

import { add, cameraBasis, cloneCamera, length, mul, sampleCamera, sub } from "../director/core.js";
import { t } from "../i18n.js";
import { worldPerPixel } from "./navigation-gesture.js";
import { pathCentroid, transformPathKeys } from "../director/camera-path-transform.js";

/** Promote a camera to "whole path" transform selection. */
export function selectCameraPath(ui, camera) {
  ui.finishCameraEdit();
  ui.selectedEntity = "camera_path";
  ui.selectedObjectId = null;
  ui.selectedObjectIds = new Set();
  ui.editingKeyFrame = null;
  ui.activateCamera(camera.id);
  ui.refreshObjects();
  ui.refreshKeys();
  ui.refreshInspector();
  ui.render();
  ui.setStatus(t("{name} · whole path selected — move / scale / rotate").replace("{name}", camera.name));
}

/**
 * Start a whole-path transform drag. Returns true once `ui.gizmoDrag` is armed,
 * false if the active track cannot be transformed (missing / locked / empty).
 */
export function beginPathGizmoDrag(ui, { baseDrag, viewCamera, entityPosition }) {
  const track = ui.activeCameraTrack?.();
  if (!track || track.locked || !(track.keyframes?.length >= 1)) return false;
  ui.checkpoint("Transform camera path");
  ui.gizmoDrag = {
    ...baseDrag,
    type: "camera_path",
    historyCheckpointed: true,
    trackId: track.id,
    origin: pathCentroid(track.keyframes),
    baseKeys: track.keyframes.map((key) => ({ ...key, camera: cloneCamera(key.camera) })),
    viewRight: cameraBasis(viewCamera).right,
    viewUp: cameraBasis(viewCamera).up,
    freeScale: viewCamera.camera_type === "orthographic"
      ? worldPerPixel(viewCamera, ui.canvas.height)
      : length(sub(viewCamera.position, entityPosition)) * (2 * Math.tan(((viewCamera.fov || 35) * Math.PI) / 360)) / ui.canvas.height,
  };
  return true;
}

/** One move step of a whole-path transform drag: re-derive every key from the
 * base snapshot so the drag never compounds, then refresh. */
export function applyPathGizmoDrag(ui, { pointer, deltaPixels, precision, snapping }) {
  const drag = ui.gizmoDrag;
  const track = ui.state.cameras.find((camera) => camera.id === drag.trackId);
  if (!track) return;
  const origin = drag.origin;
  let options;

  if (ui.state.gizmo_mode === "translate") {
    let delta;
    if (drag.free) {
      const dx = (pointer[0] - drag.pointer[0]) * precision;
      const dy = (pointer[1] - drag.pointer[1]) * precision;
      delta = add(mul(drag.viewRight, dx * drag.freeScale), mul(drag.viewUp, -dy * drag.freeScale));
    } else {
      delta = mul(drag.axis, (deltaPixels * drag.worldLength) / drag.screenLength);
    }
    options = { mode: "translate", delta };
  } else if (ui.state.gizmo_mode === "scale") {
    let factors;
    if (drag.free) {
      const dx = (pointer[0] - drag.pointer[0]) * precision;
      const dy = (pointer[1] - drag.pointer[1]) * precision;
      const s = Math.max(0.01, 1 + (dx - dy) * drag.freeScale * 0.35);
      factors = [s, s, s];
    } else {
      const per = Math.max(0.01, 1 + ((deltaPixels * drag.worldLength) / drag.screenLength) * 0.5);
      factors = [1, 1, 1];
      factors[drag.axisIndex] = snapping ? Math.max(0.01, Math.round(per / 0.1) * 0.1) : per;
    }
    options = { mode: "scale", origin, factors };
  } else {
    const angle = snapping ? Math.round((deltaPixels * 0.75) / 15) * 15 : deltaPixels * 0.75;
    const rotationDeg = [0, 0, 0];
    rotationDeg[drag.axisIndex] = angle;
    options = { mode: "rotate", origin, rotationDeg };
  }

  track.keyframes = transformPathKeys(drag.baseKeys, options);
  // ui.state.keyframes aliases the active track's array (see state-sync).
  if (track.id === ui.state.active_camera_id) ui.state.keyframes = track.keyframes;
  ui.camera = sampleCamera(track, ui.frame, ui.state.objects);
  track.camera = cloneCamera(ui.camera);
  ui.refreshKeys();
  ui.refreshInspector();
  ui.render();
  ui.renderCameraView?.();
}
