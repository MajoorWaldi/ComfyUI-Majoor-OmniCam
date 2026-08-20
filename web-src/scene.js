// Scene outliner, inspector, object commands and key editing.

import { app } from "../../scripts/app.js";
import { add, clamp, cloneCamera, cloneTransform, sampleCamera } from "./omnicam-core.js";
import { confirmAction, promptText } from "./omnicam-ui.js";
import { t } from "./omnicam-i18n.js";
import { playblastCameraTrack } from "./omnicam-state-sync.js";

export function playblastCameraAtFrame(ui, sampleCameraFn) {
  return sampleCameraFn(playblastCameraTrack(ui), ui.frame);
}

export function timelineObject(ui) {
  return ui.selectedEntity === "object" ? selectedObject(ui) : null;
}

export function timelineKeyframes(ui) {
  return timelineObject(ui)?.keyframes || ui.state.keyframes;
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
  const keys = timelineKeyframes(ui);
  const key = object
    ? { frame: ui.frame, transform: cloneTransform(object), interpolation }
    : { frame: ui.frame, camera: cloneCamera(ui.camera), interpolation };
  const index = keys.findIndex((item) => item.frame === ui.frame);
  if (index >= 0) keys[index] = key;
  else keys.push(key);
  keys.sort((a, b) => a.frame - b.frame);
  ui.selectedKeyFrame = ui.frame;
  ui.selectedKeyFrames = new Set([ui.frame]);
  ui.editingKeyFrame = null;
  ui.serialize();
  ui.refreshKeys();
  ui.refreshKeyEditor();
  ui.updateKeyVisualState();
  ui.drawCurveEditor();
  ui.setStatus(t(`${object?.name || "Camera"} ${index >= 0 ? "key updated" : "key inserted"} @ ${ui.frame}`));
}

export function setKeyInterpolation(ui, interpolation) {
  const key = selectedKeyframe(ui);
  if (!key) return;
  ui.checkpoint("Change key interpolation");
  key.interpolation = interpolation;
  const interpSelect = ui.root.querySelector('[data-role="key-interp"]');
  if (interpSelect) interpSelect.value = interpolation;
  for (const btn of ui.root.querySelectorAll("[data-interp]")) {
    btn.classList.toggle("active", btn.dataset.interp === interpolation);
  }
  ui.serialize();
  ui.refreshKeys();
  ui.refreshKeyEditor();
  ui.drawCurveEditor();
  ui.setStatus(t(`Key @ ${key.frame} interpolation set to ${interpolation}`));
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
  ui.setStatus(t(`${object?.name || "Camera"} key deleted @ ${deletedFrame}`));
}

export function copyKeyframe(ui) {
  const object = timelineObject(ui);
  const key = selectedKeyframe(ui) || timelineKeyframes(ui).find((item) => item.frame === ui.frame);
  ui.copiedKeyframe = object
    ? { kind: "object", transform: cloneTransform(key?.transform || object), interpolation: key?.interpolation || ui.root.querySelector('[data-role="interp"]')?.value || "ease" }
    : { kind: "camera", camera: cloneCamera(key?.camera || ui.camera), interpolation: key?.interpolation || ui.root.querySelector('[data-role="interp"]')?.value || "ease" };
  ui.setStatus(t(`Keyframe copied @ ${key?.frame ?? ui.frame}`));
}

export function pasteKeyframe(ui) {
  if (!ui.copiedKeyframe) return ui.setStatus(t("Copy a keyframe first"));
  const object = timelineObject(ui);
  const kind = object ? "object" : "camera";
  if (ui.copiedKeyframe.kind !== kind) return ui.setStatus(t(`Copy a ${kind} keyframe first`));
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
  ui.setStatus(t(`Keyframe pasted @ ${pasted.frame}`));
}

export function selectedKeyframe(ui) {
  return timelineKeyframes(ui).find((key) => key.frame === ui.selectedKeyFrame) || null;
}

export function selectKeyframe(ui, key) {
  if (!key) return;
  ui.selectedKeyFrame = key.frame;
  ui.selectedKeyFrames = new Set([key.frame]);
  ui.editingKeyFrame = null;
  ui.setFrame(key.frame);
}

export function beginCameraEdit(ui) {
  const track = ui.activeCameraTrack();
  if (track?.locked) {
    ui.setStatus(t(`${track.name} is locked`));
    return null;
  }
  let key = ui.state.keyframes.find((item) => item.frame === ui.frame);
  if (!key && ui.selectedEntity === "camera" && ui.selectedKeyFrame !== null) {
    key = ui.state.keyframes.find((item) => item.frame === ui.selectedKeyFrame);
  }
  if (!key && ui.state.auto_key) {
    key = { frame: ui.frame, camera: cloneCamera(ui.camera), interpolation: ui.root.querySelector('[data-role="key-interp"]')?.value || "ease" };
    ui.state.keyframes.push(key);
    ui.state.keyframes.sort((a, b) => a.frame - b.frame);
    ui.refreshKeys();
  }
  ui.cameraEditKey = key || null;
  if (key) {
    ui.selectedKeyFrame = key.frame;
    ui.editingKeyFrame = key.frame;
  }
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
  if (ui.editingKeyFrame === null && (!clearSelection || ui.selectedKeyFrame === null)) return;
  ui.cameraEditActive = false;
  ui.cameraEditKey = null;
  ui.editingKeyFrame = null;
  if (clearSelection) ui.selectedKeyFrame = null;
  ui.refreshKeys();
}

export function toggleAutoKey(ui) {
  ui.state.auto_key = !ui.state.auto_key;
  if (!ui.state.auto_key) ui.exitKeyEdit(false);
  ui.serialize();
  ui.updateEditState();
  ui.setStatus(t(`Auto Key ${ui.state.auto_key ? "on" : "off"}`));
}

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
    button.title = t(`Auto Key ${isAutoKey ? "on" : "off"}`);
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

export function refreshKeyEditor(ui) {
  const object = timelineObject(ui);
  const key = selectedKeyframe(ui);
  const editor = ui.root.querySelector('[data-role="key-editor"]');
  if (editor) editor.dataset.empty = String(!key);
  const labelEl = ui.root.querySelector('[data-role="selected-key-label"]');
  if (labelEl) {
    labelEl.textContent = key
      ? t(`${object?.name || "Camera"} Key @ ${key.frame}`)
      : t(`No ${object ? "object" : "camera"} key selected`);
  }
  const roles = ["key-frame", "key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
  for (const role of roles) {
    const el = ui.root.querySelector(`[data-role="${role}"]`);
    if (el) el.disabled = !key || Boolean(object && !["key-frame", "key-interp"].includes(role));
  }
  const updateKeyBtn = ui.root.querySelector('[data-act="update-key"]');
  if (updateKeyBtn) updateKeyBtn.disabled = !key || Boolean(object);
  const viewKeyBtn = ui.root.querySelector('[data-act="view-key"]');
  if (viewKeyBtn) viewKeyBtn.disabled = !key || Boolean(object);
  for (const btn of ui.root.querySelectorAll("[data-interp]")) {
    btn.classList.toggle("active", Boolean(key && btn.dataset.interp === key.interpolation));
  }
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
  };
  for (const [role, value] of Object.entries(values)) {
    const el = ui.root.querySelector(`[data-role="${role}"]`);
    if (el && document.activeElement !== el) el.value = String(value);
  }
}

export function retimeSelectedKey(ui, frame, nearest = false) {
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
    return ui.setStatus(t(`Frame ${target} already has a keyframe`));
  }
  if (target === key.frame) return;
  const wasEditing = ui.editingKeyFrame === key.frame;
  key.frame = target;
  ui.selectedKeyFrame = target;
  ui.editingKeyFrame = wasEditing ? target : null;
  ui.frame = target;
  keys.sort((a, b) => a.frame - b.frame);
  ui.serialize();
  ui.setFrame(target);
  ui.setStatus(t(`Keyframe moved to ${target}`));
}

export function updateSelectedKey(ui) {
  const key = selectedKeyframe(ui);
  if (!key) return;
  ui.editingKeyFrame = key.frame;
  if (timelineObject(ui)) {
    key.interpolation = ui.root.querySelector('[data-role="key-interp"]').value;
    key.transform = cloneTransform(timelineObject(ui));
    ui.serialize();
    ui.setFrame(key.frame);
    ui.setStatus(t(`Object keyframe updated @ ${key.frame}`));
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
  ui.camera = cloneCamera(key.camera);
  ui.frame = key.frame;
  ui.serialize();
  ui.setFrame(key.frame);
  ui.setStatus(t(`Keyframe updated @ ${key.frame}`));
}

export function updateKeyFromView(ui) {
  const key = selectedKeyframe(ui);
  if (!key) return;
  ui.editingKeyFrame = key.frame;
  key.camera = cloneCamera(ui.camera);
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`View stored in keyframe @ ${key.frame}`));
}

export function loadSelectedKeyView(ui) {
  const key = selectedKeyframe(ui);
  if (!key) return;
  ui.setFrame(key.frame);
  ui.setStatus(t(`Loaded keyframe @ ${key.frame}`));
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
