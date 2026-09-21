// Scene outliner, inspector, object commands and key editing.

import { add, clamp, cloneCamera, cloneTransform, sampleCamera } from "./director/core.js";
import { cameraPathTimingWeight, setCameraPathTimingWeight } from "./director/camera-path-timing.js";
import { analyzeCameraPath } from "./director/camera-path-diagnostics.js";
import { selectPathKey } from "./director/camera-path-selection.js";
import { confirmAction, promptText } from "./director/ui-services.js";
import { t } from "./i18n.js";
import { playblastCameraTrack } from "./state-sync.js";
import { findEditableKey } from "./scene/edit-target.js";
import { updateCameraHud, updateFloatingTransport, updateViewportControls } from "./viewport/viewport-hud.js";

export function playblastCameraAtFrame(ui, sampleCameraFn) {
  return sampleCameraFn(playblastCameraTrack(ui), ui.frame);
}

export function timelineObject(ui) {
  return ui.selectedEntity === "object"
    ? ui.state.objects.find((object) => object.id === ui.selectedObjectId) || null
    : null;
}

export function timelineKeyframes(ui) {
  const object = timelineObject(ui);
  if (object) {
    if (!Array.isArray(object.keyframes)) object.keyframes = [];
    return object.keyframes;
  }
  const cam = ui.activeCameraTrack ? ui.activeCameraTrack() : null;
  return cam?.keyframes || ui.state.keyframes;
}

export function applyObjectAnimationFrame(ui, sampleObjectTransformFn) {
  for (const object of ui.state.objects) {
    if (!object.keyframes?.length) continue;
    const transform = sampleObjectTransformFn(object, ui.frame);
    object.position = transform.position;
    object.rotation = transform.rotation;
    object.size = transform.size;
  }
}

export function insertKeyframe(ui) {
  ui.checkpoint("Set keyframe");
  const interpolation = ui.root.querySelector('[data-role="key-interp"]')?.value || ui.root.querySelector('[data-role="interp"]')?.value || "ease";
  const object = timelineObject(ui);
  if (object && !Array.isArray(object.keyframes)) {
    object.keyframes = [];
  }
  const keys = timelineKeyframes(ui);
  const key = object
    ? { frame: ui.frame, transform: cloneTransform(object), interpolation }
    : { frame: ui.frame, camera: cloneCamera(ui.camera), interpolation };
  const index = keys.findIndex((item) => item.frame === ui.frame);
  if (index >= 0) keys[index] = key;
  else keys.push(key);
  keys.sort((a, b) => a.frame - b.frame);
  if (!object && ui.syncActiveCameraTrack) {
    ui.syncActiveCameraTrack();
  }
  ui.selectedKeyFrame = ui.frame;
  ui.selectedKeyFrames = new Set([ui.frame]);
  ui.editingKeyFrame = null;
  ui.serialize();
  ui.refreshKeys();
  ui.refreshKeyEditor();
  ui.updateKeyVisualState();
  ui.drawCurveEditor();
  ui.setStatus(t("{value1} {value2} @ {value3}", { value1: object?.name || "Camera", value2: index >= 0 ? "key updated" : "key inserted", value3: ui.frame }));
}

export function setKeyInterpolation(ui, interpolation) {
  const allKeys = timelineKeyframes(ui);
  const selectedFrames = ui.selectedKeyFrames && ui.selectedKeyFrames.size >= 2
    ? ui.selectedKeyFrames
    : null;
  const targetKeys = selectedFrames
    ? allKeys.filter((item) => selectedFrames.has(item.frame))
    : [selectedKeyframe(ui)].filter(Boolean);
  if (!targetKeys.length) return;
  ui.checkpoint(targetKeys.length > 1 ? t("Interpolation on {n} keys").replace("{n}", targetKeys.length) : "Change key interpolation");
  for (const key of targetKeys) {
    key.interpolation = interpolation;
  }
  const interpSelect = ui.root.querySelector('[data-role="key-interp"]');
  if (interpSelect) interpSelect.value = interpolation;
  // Scoped to the Shot panel's own interpolation buttons: a timeline
  // keyframe marker also carries `data-interp` (template/styles.js keys off
  // it to draw a different marker shape per interpolation mode), so an
  // unscoped "[data-interp]" query here would also toggle/disable every
  // marker on the timeline.
  for (const btn of ui.root.querySelectorAll(".key-interp-buttons [data-interp]")) {
    btn.classList.toggle("active", btn.dataset.interp === interpolation);
  }
  for (const btn of ui.root.querySelectorAll("[data-curve-mode]")) {
    const isMode = btn.dataset.curveMode === interpolation;
    btn.classList.toggle("active", isMode);
    btn.setAttribute("aria-pressed", String(isMode));
  }
  ui.serialize();
  ui.refreshKeys();
  ui.refreshKeyEditor();
  ui.drawCurveEditor();
  ui.setStatus(targetKeys.length > 1
    ? t("{mode} interpolation on {n} keys").replace("{mode}", interpolation.replace(/_/g, " ")).replace("{n}", targetKeys.length)
    : t("Key @ {value1} interpolation set to {value2}", { value1: targetKeys[0].frame, value2: interpolation }));
}

export function deleteKeyframe(ui) {
  const object = timelineObject(ui);
  const keys = timelineKeyframes(ui);
  if (!object && keys.length <= 1) return ui.setStatus(t("Keep at least one camera keyframe"));
  const key = selectedKeyframe(ui) || keys.find((item) => item.frame === ui.frame);
  if (!key) return ui.setStatus(t("Select a keyframe to delete"));
  ui.checkpoint("Delete keyframe");
  if (object) object.keyframes = keys.filter((item) => item !== key);
  else ui.state.keyframes = keys.filter((item) => item !== key);
  const remaining = timelineKeyframes(ui);
  const deletedFrame = key.frame;
  if (ui.editingKeyFrame === deletedFrame) ui.editingKeyFrame = null;
  ui.selectedKeyFrame = remaining.length
    ? remaining.reduce((nearest, item) => (Math.abs(item.frame - deletedFrame) < Math.abs(nearest.frame - deletedFrame) ? item : nearest)).frame
    : null;
  ui.camera = sampleCamera(ui.state, ui.frame);
  ui.applyObjectAnimationFrame();
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t("{value1} key deleted @ {value2}", { value1: object?.name || "Camera", value2: deletedFrame }));
}

export function copyKeyframe(ui) {
  const object = timelineObject(ui);
  const key = selectedKeyframe(ui) || timelineKeyframes(ui).find((item) => item.frame === ui.frame);
  ui.copiedKeyframe = object
    ? { kind: "object", transform: cloneTransform(key?.transform || object), interpolation: key?.interpolation || ui.root.querySelector('[data-role="interp"]')?.value || "ease" }
    : { kind: "camera", camera: cloneCamera(key?.camera || ui.camera), interpolation: key?.interpolation || ui.root.querySelector('[data-role="interp"]')?.value || "ease" };
  ui.setStatus(t("Keyframe copied @ {value1}", { value1: key?.frame ?? ui.frame }));
}

export function pasteKeyframe(ui) {
  if (!ui.copiedKeyframe) return ui.setStatus(t("Copy a keyframe first"));
  const object = timelineObject(ui);
  const kind = object ? "object" : "camera";
  if (ui.copiedKeyframe.kind !== kind) return ui.setStatus(t("Copy a {value1} keyframe first", { value1: kind }));
  ui.checkpoint("Paste keyframe");
  const pasted = object
    ? { frame: ui.frame, transform: cloneTransform(ui.copiedKeyframe.transform), interpolation: ui.copiedKeyframe.interpolation }
    : { frame: ui.frame, camera: cloneCamera(ui.copiedKeyframe.camera), interpolation: ui.copiedKeyframe.interpolation };
  const keys = timelineKeyframes(ui);
  const index = keys.findIndex((item) => item.frame === ui.frame);
  if (index >= 0) keys[index] = pasted;
  else keys.push(pasted);
  keys.sort((a, b) => a.frame - b.frame);
  ui.selectedKeyFrame = pasted.frame;
  // Keep the Set in sync with the scalar: resolveSelectedFrames() (used by
  // Delete/nudge) prefers a non-empty selectedKeyFrames over selectedKeyFrame
  // when they disagree, so a stale Set from an earlier multi-select/nudge
  // would otherwise make the next Delete remove the wrong key.
  ui.selectedKeyFrames = new Set([pasted.frame]);
  ui.editingKeyFrame = null;
  if (object) {
    object.position = [...pasted.transform.position];
    object.rotation = [...pasted.transform.rotation];
    object.size = [...pasted.transform.size];
  } else {
    ui.camera = cloneCamera(pasted.camera);
  }
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t("Keyframe pasted @ {value1}", { value1: pasted.frame }));
}

export function selectedKeyframe(ui) {
  return timelineKeyframes(ui).find((key) => key.frame === ui.selectedKeyFrame) || null;
}

export function selectKeyframe(ui, key) {
  if (!key) return;
  ui.selectedKeyFrame = key.frame;
  ui.selectedKeyFrames = new Set([key.frame]);
  ui.editingKeyFrame = null;
  // Keep the transient spatial path selection (plan section 7/21) in
  // lock-step with a camera key selected from the timeline/curve/dope-sheet,
  // so the viewport gizmo actually attaches to the key the timeline just
  // highlighted -- not just a visual echo of it (see camera-path-selection.js
  // and viewport-controls/transform-target.js, which reads ui.pathSelection,
  // not ui.selectedKeyFrame, to resolve a path_point/path_group target).
  if (!timelineObject(ui)) {
    ui.pathSelection = selectPathKey(ui.pathSelection, { cameraId: ui.state.active_camera_id, frame: key.frame, additive: false });
  }
  ui.setFrame(key.frame);
}

export function beginCameraEdit(ui) {
  const track = ui.activeCameraTrack();
  if (track?.locked) {
    ui.setStatus(t("{value1} is locked", { value1: track.name }));
    return null;
  }
  let key = findEditableKey(
    ui.state.keyframes,
    ui.frame,
    !ui.state.auto_key && ui.selectedEntity === "camera" ? ui.selectedKeyFrame : null,
    !ui.state.auto_key ? ui.editingKeyFrame : null,
  );
  if (ui.state.auto_key) {
    if (!key) {
      key = { frame: ui.frame, camera: cloneCamera(ui.camera), interpolation: ui.root.querySelector('[data-role="key-interp"]')?.value || "ease" };
      ui.state.keyframes.push(key);
      ui.state.keyframes.sort((a, b) => a.frame - b.frame);
      ui.refreshKeys();
    }
    ui.selectedKeyFrame = key.frame;
    ui.editingKeyFrame = key.frame;
  } else if (key) ui.selectedKeyFrame = key.frame;
  ui.cameraEditKey = key || null;
  ui.cameraEditActive = true;
  ui.updateKeyVisualState();
  return key;
}

export function commitCameraEdit(ui) {
  const key = ui.cameraEditKey;
  if (key) {
    key.camera = cloneCamera(ui.camera);
    ui.frame = key.frame;
    ui.selectedKeyFrame = key.frame;
  }
  ui.scheduleSerialize();
  ui.refreshKeyEditor();
  ui.updateKeyVisualState();
  ui.render();
}

export function finishCameraEdit(ui) {
  if (!ui.cameraEditActive) return;
  ui.cameraEditActive = false;
  ui.cameraEditKey = null;
  ui.editingKeyFrame = null;
  if (ui.selectedKeyFrame === null) {
    const keyAtPlayhead = ui.state.keyframes.find((k) => k.frame === ui.frame);
    if (keyAtPlayhead) ui.selectedKeyFrame = keyAtPlayhead.frame;
  }
  ui.refreshKeys();
}

export function exitKeyEdit(ui, clearSelection = false) {
  if (ui.editingKeyFrame === null && (!clearSelection || (ui.selectedKeyFrame === null && !ui.selectedKeyFrames?.size))) return;
  ui.cameraEditActive = false;
  ui.cameraEditKey = null;
  ui.editingKeyFrame = null;
  if (clearSelection) {
    ui.selectedKeyFrame = null;
    ui.selectedKeyFrames = null;
  }
  ui.refreshKeys();
}

export function toggleAutoKey(ui) {
  ui.state.auto_key = !ui.state.auto_key;
  if (!ui.state.auto_key) ui.exitKeyEdit(false);
  ui.serialize();
  ui.updateEditState();
  ui.setStatus(t("Auto Key {value1}", { value1: ui.state.auto_key ? "on" : "off" }));
}

// Overlays drawn only in Camera View (see viewport-overlays.js).
const FRAMING_AIDS = ["guides", "safe-areas", "resolution-gate", "aspect-ratio"];

export function updateEditState(ui) {
  const wrap = ui.root.querySelector(".viewport-wrap");
  const editing = ui.editingKeyFrame !== null;
  const isAutoKey = Boolean(ui.state.auto_key);
  if (wrap) {
    wrap.classList.toggle("edit-mode", editing);
    wrap.classList.toggle("auto-key", isAutoKey);
  }
  for (const button of ui.root.querySelectorAll('[data-act="auto-key"]')) {
    button.classList.toggle("active", isAutoKey);
    button.setAttribute("aria-pressed", String(isAutoKey));
    button.title = t("Auto Key {value1}", { value1: isAutoKey ? "on" : "off" });
  }
  // Framing aids only mean something when you are looking through the camera.
  // They used to stay clickable in the orbit views, where toggling them did
  // nothing at all and gave no hint why.
  const throughCamera = ui.state.view_mode === "camera";
  for (const role of FRAMING_AIDS) {
    for (const element of ui.root.querySelectorAll(`[data-role="${role}"]`)) {
      element.disabled = !throughCamera;
      const label = element.closest("label");
      if (label) label.classList.toggle("oc-disabled", !throughCamera);
      element.title = throughCamera ? "" : t("Available in Camera View only");
    }
  }

  const activeCamera = ui.activeCameraTrack();
  const selectedObj = ui.selectedObject();

  const tallyBanner = ui.root.querySelector('[data-role="tally-banner"]');
  const tallyText = ui.root.querySelector('[data-role="tally-text"]');
  if (tallyBanner && tallyText) {
    if (editing) {
      tallyBanner.hidden = false;
      const targetName = selectedObj ? (selectedObj.name || selectedObj.type) : activeCamera.name;
      tallyText.textContent = `REC KEY @ F${ui.editingKeyFrame} (${targetName})`;
    } else if (isAutoKey) {
      tallyBanner.hidden = false;
      tallyText.textContent = `● AUTO-KEY ON (F${ui.frame})`;
    } else {
      tallyBanner.hidden = true;
    }
  }

  const stateLabel = ui.root.querySelector('[data-role="viewport-state"]');
  if (stateLabel) {
    if (editing) {
      stateLabel.textContent = selectedObj
        ? `● EDITING ${selectedObj.name || selectedObj.type} @ F${ui.editingKeyFrame}${isAutoKey ? " · AUTO KEY" : ""}`
        : `● EDITING ${activeCamera.name} @ F${ui.editingKeyFrame}${isAutoKey ? " · AUTO KEY" : ""}`;
    } else if (isAutoKey) {
      stateLabel.textContent = selectedObj
        ? `● AUTO KEY · ${selectedObj.name || selectedObj.type}`
        : `● AUTO KEY · ${activeCamera.name}`;
    } else if (selectedObj) {
      stateLabel.textContent = `SELECTED: ${selectedObj.name || selectedObj.type}`;
    } else {
      stateLabel.textContent = ui.state.view_mode === "camera"
        ? `CAMERA: ${activeCamera.name}`
        : `VIEW: ${ui.state.view_mode.toUpperCase()}`;
    }
  }
  updateCameraHud(ui);
  updateFloatingTransport(ui);
  updateViewportControls(ui);
}

export function updateKeyVisualState(ui) {
  const selected = ui.selectedKeyFrames || (ui.selectedKeyFrame === null ? new Set() : new Set([ui.selectedKeyFrame]));
  for (const element of ui.root.querySelectorAll("[data-key-frame]")) {
    const frame = Number(element.dataset.keyFrame);
    element.classList.toggle("selected", selected.has(frame));
    element.classList.toggle("editing", frame === ui.editingKeyFrame);
    element.classList.toggle("at-playhead", frame === ui.frame);
  }
  ui.updateEditState();
}
export function setKeyTangentMode(ui, mode) {
  const allKeys = timelineKeyframes(ui);
  const selectedFrames = ui.selectedKeyFrames && ui.selectedKeyFrames.size >= 2
    ? ui.selectedKeyFrames
    : null;
  const targetKeys = selectedFrames
    ? allKeys.filter((item) => selectedFrames.has(item.frame))
    : [selectedKeyframe(ui)].filter(Boolean);
  if (!targetKeys.length) return;
  ui.checkpoint(targetKeys.length > 1 ? t("Tangents on {n} keys").replace("{n}", targetKeys.length) : "Change key tangent mode");
  for (const key of targetKeys) {
    key.tangents = key.tangents && typeof key.tangents === "object" ? key.tangents : {};
    key.tangents.mode = mode;
    key.tangent_mode = mode;
    // sampleChannel only honours tangent handles when an endpoint key is bezier,
    // so a non-auto tangent mode is inert until the key is promoted -- mirror the
    // multi-key batch path (director/key-ops.js setKeyframeTangentMode).
    if (mode !== "auto" && key.interpolation !== "bezier") key.interpolation = "bezier";
  }
  const tangentSelect = ui.root.querySelector('[data-role="key-tangent-mode"]');
  if (tangentSelect) tangentSelect.value = mode;
  for (const btn of ui.root.querySelectorAll("[data-tangent]")) {
    btn.classList.toggle("active", btn.dataset.tangent === mode);
  }
  for (const btn of ui.root.querySelectorAll("[data-tangent-mode]")) {
    const isMode = btn.dataset.tangentMode === mode;
    btn.classList.toggle("active", isMode);
    btn.setAttribute("aria-pressed", String(isMode));
  }
  ui.serialize();
  ui.refreshKeys();
  ui.refreshKeyEditor();
  ui.drawCurveEditor();
  ui.setStatus(targetKeys.length > 1
    ? t("{mode} tangents on {n} keys").replace("{mode}", mode).replace("{n}", targetKeys.length)
    : t("Key @ {frame} tangent mode set to {mode}").replace("{frame}", String(targetKeys[0].frame)).replace("{mode}", mode));
}

// Pure, read-only camera path diagnostics (plan section 26 Task 12): never
// mutates the path, just lists what analyzeCameraPath() finds for the
// active camera's own keys. Built with textContent (not innerHTML) since an
// object/camera name is user-authored text that must never execute as HTML.
function renderPathDiagnostics(ui) {
  const el = ui.root.querySelector('[data-role="path-diagnostics-list"]');
  if (!el) return;
  el.innerHTML = "";
  const keys = ui.activeCameraTrack?.()?.keyframes || [];
  if (keys.length < 2) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  const issues = analyzeCameraPath({ keys, fps: ui.state?.fps || 24, objects: ui.state?.objects || [] });
  if (!issues.length) {
    const ok = document.createElement("div");
    ok.className = "oc-diagnostic-ok";
    ok.textContent = t("No path issues detected");
    el.appendChild(ok);
    return;
  }
  for (const issue of issues.slice(0, 8)) {
    const row = document.createElement("div");
    row.className = `oc-diagnostic oc-diagnostic-${issue.severity}`;
    row.textContent = `⚠ ${issue.message}`;
    el.appendChild(row);
  }
}

export function refreshKeyEditor(ui) {
  const object = timelineObject(ui);
  const key = selectedKeyframe(ui);
  const editor = ui.root.querySelector('[data-role="key-editor"]');
  if (editor) editor.dataset.empty = String(!key);
  const labelEl = ui.root.querySelector('[data-role="selected-key-label"]');
  if (labelEl) {
    labelEl.textContent = key
      ? t("{value1} Key @ {value2}", { value1: object?.name || "Camera", value2: key.frame })
      : t("No {value1} key selected", { value1: object ? "object" : "camera" });
  }
  const roles = ["key-frame", "key-interp", "key-tangent-mode", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type", "key-timing-weight"];
  for (const role of roles) {
    const el = ui.root.querySelector(`[data-role="${role}"]`);
    if (el) el.disabled = !key || Boolean(object && !["key-frame", "key-interp", "key-tangent-mode"].includes(role));
  }
  const updateKeyBtn = ui.root.querySelector('[data-act="update-key"]');
  if (updateKeyBtn) updateKeyBtn.disabled = !key || Boolean(object);
  const viewKeyBtn = ui.root.querySelector('[data-act="view-key"]');
  if (viewKeyBtn) viewKeyBtn.disabled = !key || Boolean(object);
  const redistributeBtn = ui.root.querySelector('[data-act="redistribute-key-timing"]');
  if (redistributeBtn) redistributeBtn.disabled = Boolean(object) || (ui.activeCameraTrack?.()?.keyframes?.length || 0) < 2;
  // Scoped for the same reason as setKeyInterpolation() above: an unscoped
  // "[data-interp]" query also matches every timeline keyframe marker (which
  // reuses the attribute for its own marker-shape styling), disabling every
  // marker on the timeline whenever no key happens to be selected.
  for (const btn of ui.root.querySelectorAll(".key-interp-buttons [data-interp]")) {
    btn.classList.toggle("active", Boolean(key && btn.dataset.interp === key.interpolation));
    btn.disabled = !key;
  }

  const currentTangentMode = key?.tangents?.mode || key?.tangent_mode || "auto";
  const tangentSelect = ui.root.querySelector('[data-role="key-tangent-mode"]');
  if (tangentSelect && document.activeElement !== tangentSelect) {
    tangentSelect.value = currentTangentMode;
  }
  for (const btn of ui.root.querySelectorAll("[data-tangent]")) {
    btn.classList.toggle("active", Boolean(key && btn.dataset.tangent === currentTangentMode));
    btn.disabled = !key;
  }

  // Update timecode readout
  const timecodeEl = ui.root.querySelector('[data-role="key-timecode"]');
  if (timecodeEl) {
    const fps = Math.max(1, ui.state?.fps || 24);
    const f = key ? key.frame : ui.frame;
    const totalSecs = Math.floor(f / fps);
    const framesRemainder = f % Math.round(fps);
    const hours = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    const framesStr = String(framesRemainder).padStart(2, "0");
    timecodeEl.textContent = `${hours}:${mins}:${secs}:${framesStr} (${f}f)`;
  }

  renderPathDiagnostics(ui);
  if (!key) return;
  if (object) {
    const frameInput = ui.root.querySelector('[data-role="key-frame"]');
    if (frameInput && document.activeElement !== frameInput) frameInput.value = String(key.frame);
    const interpSelect = ui.root.querySelector('[data-role="key-interp"]');
    if (interpSelect && document.activeElement !== interpSelect) interpSelect.value = key.interpolation;
    return;
  }
  const values = {
    "key-frame": key.frame,
    "key-interp": key.interpolation,
    "key-tangent-mode": currentTangentMode,
    "key-px": key.camera.position[0],
    "key-py": key.camera.position[1],
    "key-pz": key.camera.position[2],
    "key-tx": key.camera.target[0],
    "key-ty": key.camera.target[1],
    "key-tz": key.camera.target[2],
    "key-fov": key.camera.fov,
    "key-roll": key.camera.roll || 0,
    "key-zoom": key.camera.zoom || 1,
    "key-near": key.camera.near,
    "key-far": key.camera.far,
    "key-camera-type": key.camera.camera_type,
    "key-timing-weight": cameraPathTimingWeight(key),
  };
  for (const [role, value] of Object.entries(values)) {
    const el = ui.root.querySelector(`[data-role="${role}"]`);
    if (el && document.activeElement !== el) el.value = String(value);
  }
}

export function retimeSelectedKey(ui, frame, nearest = false, options = {}) {
  const key = selectedKeyframe(ui);
  if (!key) return;
  const keys = timelineKeyframes(ui);
  let target = clamp(Math.round(frame), 0, ui.state.duration_frames - 1);
  const occupied = (candidate) => keys.some((item) => item !== key && item.frame === candidate);
  if (occupied(target) && nearest) {
    for (let distance = 1; distance < ui.state.duration_frames; distance++) {
      const available = [target - distance, target + distance]
        .filter((candidate) => candidate >= 0 && candidate < ui.state.duration_frames)
        .find((candidate) => !occupied(candidate));
      if (available !== undefined) {
        target = available;
        break;
      }
    }
  }
  if (occupied(target)) {
    ui.refreshKeyEditor();
    return ui.setStatus(t("Frame {value1} already has a keyframe", { value1: target }));
  }
  if (target === key.frame) return;
  if (options.checkpoint !== false) ui.checkpoint("Move keyframe");
  const wasEditing = ui.editingKeyFrame === key.frame;
  key.frame = target;
  ui.selectedKeyFrame = target;
  ui.editingKeyFrame = wasEditing ? target : null;
  ui.frame = target;
  keys.sort((a, b) => a.frame - b.frame);
  ui.serialize();
  ui.setFrame(target);
  ui.setStatus(t("Keyframe moved to {value1}", { value1: target }));
}

export function updateSelectedKey(ui) {
  const key = selectedKeyframe(ui);
  if (!key) return;
  ui.checkpoint("Edit keyframe");
  ui.editingKeyFrame = key.frame;
  if (timelineObject(ui)) {
    key.interpolation = ui.root.querySelector('[data-role="key-interp"]').value;
    key.transform = cloneTransform(timelineObject(ui));
    ui.serialize();
    ui.setFrame(key.frame);
    ui.setStatus(t("Object keyframe updated @ {value1}", { value1: key.frame }));
    return;
  }
  const read = (role, fallback) => {
    const value = Number(ui.root.querySelector(`[data-role="${role}"]`).value);
    return Number.isFinite(value) ? value : fallback;
  };
  key.interpolation = ui.root.querySelector('[data-role="key-interp"]').value;
  key.camera.position = [read("key-px", key.camera.position[0]), read("key-py", key.camera.position[1]), read("key-pz", key.camera.position[2])];
  key.camera.target = [read("key-tx", key.camera.target[0]), read("key-ty", key.camera.target[1]), read("key-tz", key.camera.target[2])];
  key.camera.fov = clamp(read("key-fov", key.camera.fov), 5, 150);
  key.camera.roll = clamp(read("key-roll", key.camera.roll || 0), -180, 180);
  key.camera.zoom = Math.max(0.01, read("key-zoom", key.camera.zoom || 1));
  key.camera.near = Math.max(1e-4, read("key-near", key.camera.near));
  key.camera.far = Math.max(key.camera.near + 1e-4, read("key-far", key.camera.far));
  key.camera.camera_type = ui.root.querySelector('[data-role="key-camera-type"]').value;
  const timingInput = ui.root.querySelector('[data-role="key-timing-weight"]');
  if (timingInput) {
    const updated = setCameraPathTimingWeight(key, read("key-timing-weight", cameraPathTimingWeight(key)));
    if (updated.timing) key.timing = updated.timing;
    else delete key.timing;
  }
  ui.camera = cloneCamera(key.camera);
  ui.frame = key.frame;
  ui.serialize();
  ui.setFrame(key.frame);
  ui.setStatus(t("Keyframe updated @ {value1}", { value1: key.frame }));
}

export function updateKeyFromView(ui) {
  const key = selectedKeyframe(ui);
  if (!key) return;
  ui.checkpoint("Store view in keyframe");
  ui.editingKeyFrame = key.frame;
  key.camera = cloneCamera(ui.camera);
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t("View stored in keyframe @ {value1}", { value1: key.frame }));
}

export function loadSelectedKeyView(ui) {
  const key = selectedKeyframe(ui);
  if (!key) return;
  ui.setFrame(key.frame);
  ui.setStatus(t("Loaded keyframe @ {value1}", { value1: key.frame }));
}

export function goToAdjacentKey(ui, direction) {
  const keys = timelineKeyframes(ui);
  if (!keys.length) return;
  const key =
    direction < 0
      ? [...keys].reverse().find((item) => item.frame < ui.frame) || keys[keys.length - 1]
      : keys.find((item) => item.frame > ui.frame) || keys[0];
  ui.selectKeyframe(key);
}


export * from "./scene/objects.js";
export * from "./scene/batch-actions.js";

