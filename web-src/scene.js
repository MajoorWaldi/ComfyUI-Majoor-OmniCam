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
  const interpolation = ui.root.querySelector('[data-role="interp"]').value;
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
  ui.editingKeyFrame = null;
  ui.serialize();
  ui.refreshKeys();
  ui.setStatus(t(`${object?.name || "Camera"} ${index >= 0 ? "key updated" : "key inserted"} @ ${ui.frame}`));
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
    ? { kind: "object", transform: cloneTransform(key?.transform || object), interpolation: key?.interpolation || ui.root.querySelector('[data-role="interp"]').value }
    : { kind: "camera", camera: cloneCamera(key?.camera || ui.camera), interpolation: key?.interpolation || ui.root.querySelector('[data-role="interp"]').value };
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
  } else ui.camera = cloneCamera(pasted.camera);
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`Keyframe pasted @ ${ui.frame}`));
}

export function selectedKeyframe(ui) {
  return timelineKeyframes(ui).find((key) => key.frame === ui.selectedKeyFrame) || null;
}

export function selectKeyframe(ui, key) {
  if (!key) return;
  ui.selectedKeyFrame = key.frame;
  ui.editingKeyFrame = null;
  ui.setFrame(key.frame);
}

export function beginCameraEdit(ui) {
  const track = ui.activeCameraTrack();
  if (track?.locked) {
    ui.setStatus(t(`${track.name} is locked`));
    return null;
  }
  let key = ui.state.auto_key
    ? ui.state.keyframes.find((item) => item.frame === ui.frame)
    : ui.selectedEntity === "camera"
      ? ui.state.keyframes.find((item) => item.frame === ui.selectedKeyFrame)
      : null;
  if (!key && ui.state.auto_key) {
    key = { frame: ui.frame, camera: cloneCamera(ui.camera), interpolation: ui.root.querySelector('[data-role="interp"]').value };
    ui.state.keyframes.push(key);
    ui.state.keyframes.sort((a, b) => a.frame - b.frame);
    ui.refreshKeys();
  }
  ui.cameraEditKey = key || null;
  if (!key) return null;
  if (ui.selectedEntity === "camera") {
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
  ui.selectedKeyFrame = null;
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
  wrap.classList.toggle("edit-mode", editing);
  wrap.classList.toggle("auto-key", ui.state.auto_key);
  const button = ui.root.querySelector('[data-act="auto-key"]');
  button.classList.toggle("active", ui.state.auto_key);
  button.setAttribute("aria-pressed", String(ui.state.auto_key));
  button.title = t(`Auto Key ${ui.state.auto_key ? "on" : "off"}`);
  ui.root.querySelector('[data-role="viewport-state"]').textContent = editing
    ? `EDIT KEY F${ui.editingKeyFrame}${ui.state.auto_key ? " · AUTO KEY" : ""}`
    : ui.state.auto_key
      ? "AUTO KEY"
      : "";
}

export function updateKeyVisualState(ui) {
  for (const element of ui.root.querySelectorAll("[data-key-frame]")) {
    const frame = Number(element.dataset.keyFrame);
    element.classList.toggle("selected", frame === ui.selectedKeyFrame);
    element.classList.toggle("editing", frame === ui.editingKeyFrame);
    element.classList.toggle("at-playhead", frame === ui.frame);
  }
  ui.updateEditState();
}

export function refreshKeyEditor(ui) {
  const object = timelineObject(ui);
  const key = selectedKeyframe(ui);
  const editor = ui.root.querySelector('[data-role="key-editor"]');
  editor.dataset.empty = String(!key);
  ui.root.querySelector('[data-role="selected-key-label"]').textContent = key
    ? t(`${object?.name || "Camera"} Key @ ${key.frame}`)
    : t(`No ${object ? "object" : "camera"} key selected`);
  const roles = ["key-frame", "key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"];
  for (const role of roles) ui.root.querySelector(`[data-role="${role}"]`).disabled = !key || Boolean(object && !["key-frame", "key-interp"].includes(role));
  ui.root.querySelector('[data-act="update-key"]').disabled = !key || Boolean(object);
  ui.root.querySelector('[data-act="view-key"]').disabled = !key || Boolean(object);
  if (!key) return;
  if (object) {
    ui.root.querySelector('[data-role="key-frame"]').value = String(key.frame);
    ui.root.querySelector('[data-role="key-interp"]').value = key.interpolation;
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
  for (const [role, value] of Object.entries(values)) ui.root.querySelector(`[data-role="${role}"]`).value = String(value);
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

export function addPrimitive(ui, type) {
  ui.checkpoint("Create object");
  const id = `${type}_${Date.now().toString(36)}`;
  const ground = type === "ground";
  const object = {
    id,
    type,
    name: type === "human" ? t("Human Proxy") : type[0].toUpperCase() + type.slice(1),
    position: ground ? [0, -0.05, 0] : [0, type === "human" ? 0 : 0.75, -2],
    rotation: [0, 0, 0],
    size: ground ? [12, 0.1, 12] : type === "human" ? [0.7, 1.8, 0.4] : [1.5, 1.5, 1.5],
    material_mode: ground ? "checker" : "textured",
    keyframes: [],
    enabled: true,
  };
  ui.state.objects.push(object);
  ui.selectedEntity = "object";
  ui.selectedObjectId = id;
  ui.selectedKeyFrame = null;
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
}

export async function renameObject(ui, id) {
  const object = ui.state.objects.find((item) => item.id === id);
  if (!object) return;
  const name = (await promptText(app, t("Rename object"), t("Object name"), object.name || object.type))?.trim();
  if (!name || name === object.name) return;
  ui.checkpoint("Rename object");
  object.name = name.slice(0, 80);
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.setStatus(t(`Object renamed: ${object.name}`));
}

export function duplicateObject(ui, id) {
  const source = ui.state.objects.find((item) => item.id === id);
  if (!source) return;
  ui.checkpoint("Duplicate object");
  const copy = JSON.parse(JSON.stringify(source));
  copy.id = `${source.type}_${Date.now().toString(36)}`;
  copy.name = `${source.name || source.type} Copy`;
  copy.position = add(copy.position || [0, 0, 0], [0.35, 0, 0.35]);
  if (copy.asset) delete copy.asset;
  ui.state.objects.push(copy);
  ui.selectedEntity = "object";
  ui.selectedObjectId = copy.id;
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`${copy.name} added`));
}

export function toggleObject(ui, id) {
  const object = ui.state.objects.find((item) => item.id === id);
  if (!object) return;
  ui.checkpoint(object.enabled === false ? "Show object" : "Hide object");
  object.enabled = object.enabled === false;
  ui.serialize();
  ui.refreshObjects();
  ui.render();
  ui.setStatus(t(`${object.name || object.type} ${object.enabled ? "shown" : "hidden"}`));
}

export async function deleteObject(ui, id) {
  if (id === "subject") return ui.setStatus(t("The subject card cannot be deleted"));
  const object = ui.state.objects.find((item) => item.id === id);
  if (!object) return;
  if (!(await confirmAction(app, t("Delete object"), t(`Delete ${object.name || object.type} and its ${(object.keyframes || []).length} keyframe(s)?`)))) return;
  ui.checkpoint("Delete object");
  for (const child of ui.state.objects) if (child.parent_id === id) child.parent_id = null;
  ui.state.objects = ui.state.objects.filter((item) => item.id !== id);
  ui.removeObjectResources(id);
  if (ui.selectedObjectId === id) {
    ui.selectedEntity = "camera";
    ui.selectedObjectId = null;
    ui.selectedKeyFrame = ui.state.keyframes.find((key) => key.frame === ui.frame)?.frame ?? null;
  }
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`${object.name || object.type} deleted`));
}

export function addMediaCard(ui) {
  const id = `card_${Date.now().toString(36)}`;
  ui.state.objects.push({
    id,
    type: "card",
    name: `Media Card ${ui.state.objects.filter((item) => item.type === "card").length + 1}`,
    position: [0, 1.5, -2],
    rotation: [0, 0, 0],
    size: [2, 3],
    material_mode: "textured",
    keyframes: [],
    enabled: true,
    asset: "",
  });
  ui.selectedEntity = "object";
  ui.selectedObjectId = id;
  ui.selectedKeyFrame = null;
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
  ui.root.querySelector('[data-role="file"]').click();
}

export function selectedObject(ui) {
  return (ui.selectedEntity === "object" && ui.state.objects.find((object) => object.id === ui.selectedObjectId)) || null;
}

export function refreshInspector(ui) {
  const object = selectedObject(ui);
  const objectPanel = ui.root.querySelector('[data-role="object-panel"]');
  const cameraPanel = ui.root.querySelector('[data-role="camera-panel"]');
  objectPanel.hidden = !object;
  cameraPanel.hidden = Boolean(object);
  const q = (sel) => ui.root.querySelector(sel);
  if (!object) {
    const activeCamera = ui.activeCameraTrack();
    q('[data-role="selected-name"]').textContent = `${activeCamera.name} · F${ui.frame}`;
    q('[data-role="curve-title"]').textContent = t(`${activeCamera.name} Curve Editor`);
    const groups = q('[data-role="curve-group"]').options;
    groups[0].textContent = t("Position XYZ");
    groups[1].textContent = t("Target XYZ");
    groups[2].textContent = t("FOV / Roll / Zoom");
    const values = [...ui.camera.position, ...ui.camera.target, ui.camera.fov, ui.camera.roll || 0, ui.camera.near, ui.camera.far];
    ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"].forEach((role, index) => {
      q(`[data-role="${role}"]`).value = String(Math.round(values[index] * 1e4) / 1e4);
    });
    return;
  }
  const position = object.position || [0, 0, 0];
  q('[data-role="selected-name"]').textContent = object.name || object.type;
  q('[data-role="curve-title"]').textContent = t(`${object.name || object.type} Curve Editor`);
  const groups = q('[data-role="curve-group"]').options;
  groups[0].textContent = t("Position XYZ");
  groups[1].textContent = t("Rotation XYZ");
  groups[2].textContent = t("Scale XYZ");
  q('[data-role="object-material"]').value = object.material_mode || "textured";
  q('[data-role="object-x"]').value = String(position[0]);
  q('[data-role="object-y"]').value = String(position[1]);
  q('[data-role="object-z"]').value = String(position[2]);
  const rotation = object.rotation || [0, 0, 0];
  const size = object.size || [1, 1, 1];
  for (let index = 0; index < 3; index++) {
    q(`[data-role="object-r${"xyz"[index]}"]`).value = String(rotation[index]);
    q(`[data-role="object-s${"xyz"[index]}"]`).value = String(size[index] ?? size[0] ?? 1);
  }
  for (const button of ui.root.querySelectorAll("[data-transform-mode]")) button.classList.toggle("active", button.dataset.transformMode === (ui.state.gizmo_mode || "translate"));
  const animationRow = q('[data-role="animation-row"]');
  const animationSelect = q('[data-role="animation-select"]');
  const parentSelect = q('[data-role="object-parent"]');
  if (parentSelect) {
    const currentId = object.id;
    parentSelect.innerHTML = "";
    const none = document.createElement("option");
    none.value = "";
    none.textContent = t("No parent");
    parentSelect.appendChild(none);
    // Offer every other object that would not create a cycle.
    const descendants = new Set([currentId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const candidate of ui.state.objects)
        if (!descendants.has(candidate.id) && candidate.parent_id && descendants.has(candidate.parent_id)) {
          descendants.add(candidate.id);
          changed = true;
        }
    }
    for (const candidate of ui.state.objects) {
      if (descendants.has(candidate.id)) continue;
      const option = document.createElement("option");
      option.value = candidate.id;
      option.textContent = candidate.name || candidate.type;
      parentSelect.appendChild(option);
    }
    parentSelect.value = object.parent_id || "";
  }
  const model = ui.modelInfoById.get(object.id);
  animationRow.hidden = !model?.animations;
  animationSelect.innerHTML = "";
  for (const [index, name] of (model?.animationNames || []).entries()) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = name;
    animationSelect.appendChild(option);
  }
  animationSelect.value = String(object.animation_index || 0);
}

export function updateSelectedObject(ui) {
  const object = selectedObject(ui);
  if (!object) return;
  const q = (sel) => ui.root.querySelector(sel);
  object.position = ["object-x", "object-y", "object-z"].map((role) => Number(q(`[data-role="${role}"]`).value));
  object.rotation = ["object-rx", "object-ry", "object-rz"].map((role) => Number(q(`[data-role="${role}"]`).value));
  object.size = ["object-sx", "object-sy", "object-sz"].map((role) => Math.max(0.01, Number(q(`[data-role="${role}"]`).value)));
  ui.commitObjectEdit(object);
  ui.refreshObjects();
  ui.render();
}

export function beginObjectEdit(ui, object) {
  if (!object) return null;
  if (object.locked) {
    ui.setStatus(t(`${object.name || object.type} is locked`));
    return null;
  }
  object.keyframes ||= [];
  let key = object.keyframes?.find((item) => item.frame === (ui.state.auto_key ? ui.frame : ui.selectedKeyFrame));
  if (!key && ui.state.auto_key) {
    key = { frame: ui.frame, transform: cloneTransform(object), interpolation: ui.root.querySelector('[data-role="interp"]').value };
    object.keyframes.push(key);
    object.keyframes.sort((a, b) => a.frame - b.frame);
  }
  if (key) {
    ui.selectedKeyFrame = key.frame;
    ui.editingKeyFrame = key.frame;
    ui.updateKeyVisualState();
  }
  return key;
}

export function commitObjectEdit(ui, object) {
  const key = beginObjectEdit(ui, object);
  if (key) key.transform = cloneTransform(object);
  ui.scheduleSerialize();
  ui.refreshKeyEditor();
  ui.updateKeyVisualState();
  ui.drawCurveEditor();
}

export function updateCameraFromHud(ui) {
  const read = (role, fallback) => {
    const value = Number(ui.root.querySelector(`[data-role="${role}"]`).value);
    return Number.isFinite(value) ? value : fallback;
  };
  ui.camera.position = [read("camera-px", ui.camera.position[0]), read("camera-py", ui.camera.position[1]), read("camera-pz", ui.camera.position[2])];
  ui.camera.target = [read("camera-tx", ui.camera.target[0]), read("camera-ty", ui.camera.target[1]), read("camera-tz", ui.camera.target[2])];
  ui.camera.fov = clamp(read("camera-fov", ui.camera.fov), 5, 150);
  ui.camera.roll = clamp(read("camera-roll", ui.camera.roll || 0), -180, 180);
  ui.camera.near = Math.max(1e-4, read("camera-near", ui.camera.near));
  ui.camera.far = Math.max(ui.camera.near + 1e-4, read("camera-far", ui.camera.far));
  ui.beginCameraEdit();
  ui.commitCameraEdit();
  ui.finishCameraEdit();
  ui.refreshInspector();
}

export function setObjectParent(ui, parentId) {
  const object = selectedObject(ui);
  if (!object) return;
  ui.checkpoint("Set parent");
  object.parent_id = parentId || null;
  ui.serialize();
  ui.refreshObjects();
  ui.render();
  const parent = ui.state.objects.find((item) => item.id === parentId);
  ui.setStatus(parent ? t(`${object.name || object.type} parented to ${parent.name || parent.type}`) : t(`${object.name || object.type} unparented`));
}

export function selectObjectAnimation(ui, index) {
  const object = selectedObject(ui);
  if (!object) return;
  object.animation_index = Math.max(0, index || 0);
  ui.serialize();
  ui.webgl?.selectAnimation(object.id, index);
  ui.setStatus(t(`Animation: ${ui.modelInfoById.get(object.id)?.animationNames?.[index] || index + 1}`));
}

export function refreshObjects(ui) {
  const box = ui.root.querySelector('[data-role="objects"]');
  box.innerHTML = "";
  const trackFlag = (ui_, item, kind) => {
    const wrap = document.createElement("span");
    wrap.style.cssText = "margin-left:auto;display:flex;gap:2px";
    const defs = kind === "camera"
      ? [["locked", "pi-lock", "Lock track"], ["muted", "pi-volume-off", "Mute track"], ["solo", "pi-star", "Solo track"]]
      : [["locked", "pi-lock", "Lock object"]];
    for (const [field, icon, label] of defs) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "icon-button";
      button.style.cssText = `width:18px;height:18px;min-width:18px;padding:0;${item[field] ? "color:#f2d06b;border-color:#6b5a2e" : "opacity:.45"}`;
      button.title = t(label);
      button.innerHTML = `<i class="pi ${icon}" style="font-size:10px"></i>`;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        ui_.checkpoint(`${label}`);
        item[field] = !item[field];
        ui_.serialize();
        ui_.refreshObjects();
        ui_.renderCameraView();
      });
      wrap.appendChild(button);
    }
    return wrap;
  };
  for (const camera of ui.state.cameras) {
    const element = document.createElement("button");
    element.type = "button";
    element.dataset.cameraId = camera.id;
    element.className = `scene-item${ui.selectedEntity === "camera" && camera.id === ui.state.active_camera_id ? " selected" : ""}`;
    const icon = document.createElement("i");
    icon.className = "pi pi-video";
    const label = document.createElement("span");
    label.textContent = `${camera.id === ui.state.playblast_camera_id ? "● " : ""}${camera.name}${camera.muted ? " (muted)" : ""}`;
    element.append(icon, label, trackFlag(ui, camera, "camera"));
    element.title = camera.id === ui.state.playblast_camera_id ? t("Active playblast camera") : t("Click to edit this camera");
    element.addEventListener("click", () => ui.activateCamera(camera.id));
    box.appendChild(element);
  }
  for (const object of ui.state.objects) {
    const element = document.createElement("button");
    element.type = "button";
    element.dataset.objectId = object.id;
    element.className = `scene-item${ui.selectedEntity === "object" && object.id === ui.selectedObjectId ? " selected" : ""}`;
    const label = document.createElement("span");
    label.innerHTML = `<i class="pi ${object.type === "card" ? "pi-image" : object.type === "model" || object.type === "glb" ? "pi-box" : "pi-circle"}"></i> ${object.enabled === false ? "○" : "●"} ${object.name || object.type}`;
    element.append(label, trackFlag(ui, object, "object"));
    element.title = t("Click to select · Double-click to show/hide · Right-click for object actions");
    element.addEventListener("click", (event) => {
      if (event.altKey && object.id !== "subject") return void ui.deleteObject(object.id);
      ui.selectedEntity = "object";
      ui.selectedObjectId = object.id;
      ui.selectedKeyFrame = object.keyframes?.find((key) => key.frame === ui.frame)?.frame ?? null;
      ui.serialize();
      ui.refreshObjects();
      ui.refreshKeys();
      ui.render();
    });
    element.addEventListener("dblclick", () => ui.toggleObject(object.id));
    box.appendChild(element);
  }
  ui.refreshInspector();
}

export function removeObjectResources(ui, id) {
  ui.objectUrls.revoke(id);
  ui.cardMediaById.delete(id);
  ui.modelUrlsById.delete(id);
  ui.modelInfoById.delete(id);
  ui.webgl?.removeModel(id);
}
