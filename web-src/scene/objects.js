// Scene object creation, selection and inspector operations.

import { refreshAimBoneOptions } from "../aim-constraint.js";
import { add, applyCameraOrientationEuler, cameraOrientationEuler, clamp, cloneTransform } from "../director/core.js";
import { confirmAction, promptText } from "../director/ui-services.js";
import { t } from "../i18n.js";
import { beginCameraEdit, commitCameraEdit, finishCameraEdit, refreshKeyEditor, selectedKeyframe, updateKeyVisualState } from "../scene.js";
import { findEditableKey } from "./edit-target.js";

export function addPrimitive(ui, type) {
  ui.checkpoint("Create object");
  const id = `${type}_${Date.now().toString(36)}`;
  const ground = type === "ground";
  const object = {
    id,
    type,
    name: type === "human" ? t("Human Proxy") : type[0].toUpperCase() + type.slice(1),
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    size: ground ? [12, 0.1, 12] : type === "human" ? [0.7, 1.8, 0.4] : [1.5, 1.5, 1.5],
    material_mode: ground ? "checker" : "textured",
    keyframes: [],
    enabled: true,
  };
  ui.state.objects.push(object);
  ui.selectedEntity = "object";
  ui.selectedObjectId = id;
  ui.selectedObjectIds = new Set([id]);
  ui.selectedKeyFrame = null;
  ui.serialize();
  ui.refreshObjects();
  ui.refreshKeys();
  ui.render();
}

export async function renameObject(ui, id) {
  const object = ui.state.objects.find((item) => item.id === id);
  if (!object) return;
  const name = (await promptText(ui.app, t("Rename object"), t("Object name"), object.name || object.type))?.trim();
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
  copy.id = `${source.type}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  copy.name = `${source.name || source.type} Copy`;
  copy.position = add(copy.position || [0, 0, 0], [0.35, 0, 0.35]);
  // A duplicated model/card has nothing new to upload -- it points at the
  // exact file the source already resolved to. Deleting `asset` (as this
  // used to) orphaned the copy: `restoreAssets` needs it to reconnect the
  // managed file after a reload, and without registering the live map entry
  // here too, the duplicate rendered as nothing at all until then. Each
  // object id still gets its own independent WebGL load and animation mixer
  // (viewport/resources.js keys `models` by id, not by URL), so two objects
  // sharing one asset animate and pose completely independently.
  if ((copy.type === "model" || copy.type === "glb") && ui.modelUrlsById.has(source.id)) {
    ui.modelUrlsById.set(copy.id, ui.modelUrlsById.get(source.id));
  } else if (copy.type === "card" && ui.cardMediaById.has(source.id)) {
    ui.cardMediaById.set(copy.id, ui.cardMediaById.get(source.id));
  }
  ui.state.objects.push(copy);
  ui.selectedEntity = "object";
  ui.selectedObjectId = copy.id;
  ui.selectedObjectIds = new Set([copy.id]);
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
  if (!(await confirmAction(ui.app, t("Delete object"), t(`Delete ${object.name || object.type} and its ${(object.keyframes || []).length} keyframe(s)?`)))) return;
  ui.checkpoint("Delete object");
  for (const child of ui.state.objects) if (child.parent_id === id) child.parent_id = null;
  ui.state.objects = ui.state.objects.filter((item) => item.id !== id);
  ui.selectedObjectIds?.delete(id);
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
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    size: [2, 3],
    material_mode: "textured",
    keyframes: [],
    enabled: true,
    asset: "",
  });
  ui.selectedEntity = "object";
  ui.selectedObjectId = id;
  ui.selectedObjectIds = new Set([id]);
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

/**
 * Renames the curve-group options for the current subject.
 *
 * Keyed by option value, never by index: the previous version assigned
 * options[0..2] positionally, so adding a fourth group silently shifted every
 * label by one and the select claimed to show a group it was not showing.
 *
 * @param {Function} q root querySelector
 * @param {Record<string,string>} labels option value -> label
 */
function relabelCurveGroups(q, labels) {
  const select = q('[data-role="curve-group"]');
  if (!select) return;
  for (const option of select.options) {
    const label = labels[option.value];
    if (label) option.textContent = label;
  }
}

export function refreshInspector(ui) {
  const object = selectedObject(ui);
  const objectPanel = ui.root.querySelector('[data-role="object-panel"]');
  if (objectPanel) objectPanel.hidden = !object;
  const q = (sel) => ui.root.querySelector(sel);

  // Always populate camera panel inputs
  const activeCamera = ui.activeCameraTrack();
  const targetSelect = q('[data-role="camera-target-object"]');
  if (targetSelect) {
    const currentTarget = activeCamera.target_object_id || ui.state.target_object_id || "";
    targetSelect.innerHTML = "";
    const manualOpt = document.createElement("option");
    manualOpt.value = "";
    manualOpt.textContent = t("Manual Target (No Tracking)");
    targetSelect.appendChild(manualOpt);
    for (const sceneObj of ui.state.objects) {
      const opt = document.createElement("option");
      opt.value = sceneObj.id;
      opt.textContent = `${t("Track:")} ${sceneObj.name || sceneObj.type}`;
      targetSelect.appendChild(opt);
    }
    targetSelect.value = currentTarget;
  }
  refreshAimBoneOptions(ui);

  const values = [...ui.camera.position, ...ui.camera.target, ui.camera.fov, ui.camera.roll || 0, ui.camera.near, ui.camera.far, ...cameraOrientationEuler(ui.camera)];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far", "camera-rx", "camera-ry", "camera-rz"].forEach((role, index) => {
    for (const el of ui.root.querySelectorAll(`[data-role="${role}"]`)) {
      if (document.activeElement !== el) el.value = String(Math.round(values[index] * 1e4) / 1e4);
    }
  });
  for (const el of ui.root.querySelectorAll('[data-role="camera-type"]')) {
    if (document.activeElement !== el) el.value = ui.camera.camera_type || "perspective";
  }
  for (const el of ui.root.querySelectorAll('[data-role="speed"]')) {
    if (document.activeElement !== el) el.value = String(ui.cameraSpeed || 1);
  }
  for (const el of ui.root.querySelectorAll('[data-role="active-camera-select"]')) {
    if (document.activeElement !== el) el.value = ui.state.active_camera_id;
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-color"]')) {
    if (document.activeElement !== el) el.value = activeCamera?.color || "#4aa3ef";
  }

  if (!object) {
    const selName = q('[data-role="selected-name"]');
    if (selName) selName.textContent = `${activeCamera.name} · F${ui.frame}`;
    relabelCurveGroups(q, {
      camera: t("Camera (Position, Focal, Roll)"),
      position: t("Position XYZ"),
      target: t("Target XYZ"),
      lens: t("FOV / Roll / Zoom"),
    });
    return;
  }
  const position = object.position || [0, 0, 0];
  const selName = q('[data-role="selected-name"]');
  if (selName) selName.textContent = object.name || object.type;
  // An object has no lens, so the combined camera group falls back to position.
  relabelCurveGroups(q, {
    camera: t("Position XYZ"),
    position: t("Position XYZ"),
    target: t("Rotation XYZ"),
    lens: t("Scale XYZ"),
  });
  const rotation = object.rotation || [0, 0, 0];
  const size = object.size || [1, 1, 1];
  const objValues = {
    "object-x": position[0],
    "object-y": position[1],
    "object-z": position[2],
    "object-rx": rotation[0],
    "object-ry": rotation[1],
    "object-rz": rotation[2],
    "object-sx": size[0] ?? 1,
    "object-sy": size[1] ?? 1,
    "object-sz": size[2] ?? 1,
  };
  for (const [role, val] of Object.entries(objValues)) {
    for (const el of ui.root.querySelectorAll(`[data-role="${role}"]`)) {
      if (document.activeElement !== el) el.value = String(Math.round(val * 1e4) / 1e4);
    }
  }
  for (const el of ui.root.querySelectorAll('[data-role="object-material"]')) {
    if (document.activeElement !== el) el.value = object.material_mode || "textured";
  }
  for (const el of ui.root.querySelectorAll('[data-role="object-color"]')) {
    if (document.activeElement !== el) el.value = object.color || "#8c929b";
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
  if (animationRow) animationRow.hidden = !model?.animations;
  if (animationSelect) {
    animationSelect.innerHTML = "";
    for (const [index, name] of (model?.animationNames || []).entries()) {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = name;
      animationSelect.appendChild(option);
    }
    animationSelect.value = String(object.animation_index || 0);
  }
}

export function updateSelectedObject(ui) {
  const object = selectedObject(ui);
  if (!object) return;
  const read = (role, fallback) => {
    const el = ui.root.querySelector(`[data-role="${role}"]`);
    if (!el || el.value === "") return fallback;
    const value = Number(el.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const pos = object.position || [0, 0, 0];
  const rot = object.rotation || [0, 0, 0];
  const sz = object.size || [1, 1, 1];
  object.position = [read("object-x", pos[0]), read("object-y", pos[1]), read("object-z", pos[2])];
  object.rotation = [read("object-rx", rot[0]), read("object-ry", rot[1]), read("object-rz", rot[2])];
  object.size = [Math.max(0.01, read("object-sx", sz[0])), Math.max(0.01, read("object-sy", sz[1])), Math.max(0.01, read("object-sz", sz[2]))];
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
  let key = findEditableKey(
    object.keyframes,
    ui.frame,
    ui.state.auto_key ? null : ui.selectedKeyFrame,
    ui.state.auto_key ? null : ui.editingKeyFrame,
  );
  if (ui.state.auto_key) {
    if (!key) {
      key = { frame: ui.frame, transform: cloneTransform(object), interpolation: ui.root.querySelector('[data-role="interp"]')?.value || "ease" };
      object.keyframes.push(key);
      object.keyframes.sort((a, b) => a.frame - b.frame);
      ui.refreshKeys();
    }
    ui.selectedKeyFrame = key.frame;
    ui.editingKeyFrame = key.frame;
    ui.updateKeyVisualState();
  } else if (key) {
    ui.selectedKeyFrame = key.frame;
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

/** Repaint camera-rx/ry/rz from the camera's actual position/target/roll.
 * Rotation is a *view* onto that data (see cameraOrientationEuler), never a
 * value of its own, so every edit that can change orientation -- including
 * ones that never touch the rotation fields themselves -- must call this or
 * the Rotation box goes stale relative to Target/Roll. */
function syncCameraRotationDisplay(ui) {
  const rotation = cameraOrientationEuler(ui.camera);
  ["camera-rx", "camera-ry", "camera-rz"].forEach((role, index) => {
    for (const el of ui.root.querySelectorAll(`[data-role="${role}"]`)) {
      if (document.activeElement !== el) el.value = String(Math.round(rotation[index] * 1e4) / 1e4);
    }
  });
}

/** Repaint camera-tx/ty/tz from the camera's actual target. The inverse
 * counterpart of syncCameraRotationDisplay: editing Rotation X/Y/Z moves the
 * target (see applyCameraOrientationEuler), so Target must stay in sync too. */
function syncCameraTargetDisplay(ui) {
  ["camera-tx", "camera-ty", "camera-tz"].forEach((role, index) => {
    for (const el of ui.root.querySelectorAll(`[data-role="${role}"]`)) {
      if (document.activeElement !== el) el.value = String(Math.round(ui.camera.target[index] * 1e4) / 1e4);
    }
  });
}

/** Rotation X/Y is the look-at direction and Rotation Z is Roll -- aiming at
 * a target already fixes two of a camera's three rotational degrees of
 * freedom, so this is a complete, non-conflicting alternative to editing
 * Target directly (see cameraOrientationEuler's own note). Kept separate
 * from updateCameraFromHud on purpose: that function re-reads every HUD
 * field on each call, and Target/Rotation both ultimately drive
 * camera.target, so folding this in would have the last-read field silently
 * overwrite whichever one the user did not just edit.
 */
export function updateCameraRotationFromHud(ui) {
  const now = globalThis.performance?.now?.() ?? Date.now();
  if (!Number.isFinite(ui.lastCameraHudEditAt) || now - ui.lastCameraHudEditAt > 300) ui.checkpoint("Edit camera");
  ui.lastCameraHudEditAt = now;
  const read = (role, fallback) => {
    const el = ui.root.querySelector(`[data-role="${role}"]`);
    if (!el || el.value === "") return fallback;
    const value = Number(el.value);
    return Number.isFinite(value) ? value : fallback;
  };
  const current = cameraOrientationEuler(ui.camera);
  const rotation = [
    clamp(read("camera-rx", current[0]), -90, 90),
    read("camera-ry", current[1]),
    clamp(read("camera-rz", current[2]), -180, 180),
  ];
  ui.beginCameraEdit();
  applyCameraOrientationEuler(ui.camera, rotation);
  ui.commitCameraEdit();
  ui.finishCameraEdit();
  syncCameraRotationDisplay(ui);
  syncCameraTargetDisplay(ui);
  ui.render();
}

export function updateCameraFromHud(ui) {
  const now = globalThis.performance?.now?.() ?? Date.now();
  if (!Number.isFinite(ui.lastCameraHudEditAt) || now - ui.lastCameraHudEditAt > 300) ui.checkpoint("Edit camera");
  ui.lastCameraHudEditAt = now;
  const read = (role, fallback) => {
    const el = ui.root.querySelector(`[data-role="${role}"]`);
    if (!el || el.value === "") return fallback;
    const value = Number(el.value);
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
  syncCameraRotationDisplay(ui);
  ui.render();
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

export { refreshObjects } from "./outliner.js";

export function removeObjectResources(ui, id) {
  ui.objectUrls.revoke(id);
  ui.cardMediaById.delete(id);
  ui.modelUrlsById.delete(id);
  ui.modelInfoById.delete(id);
  ui.webgl?.removeModel(id);
}
