// Scene object creation, selection and inspector operations.

import { add, clamp, cloneTransform } from "../director/core.js";
import { confirmAction, promptText } from "../director/ui-services.js";
import { t } from "../i18n.js";
import { beginCameraEdit, commitCameraEdit, finishCameraEdit, refreshKeyEditor, selectedKeyframe, updateKeyVisualState } from "../scene.js";

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
  if (!(await confirmAction(ui.app, t("Delete object"), t(`Delete ${object.name || object.type} and its ${(object.keyframes || []).length} keyframe(s)?`)))) return;
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

  const values = [...ui.camera.position, ...ui.camera.target, ui.camera.fov, ui.camera.roll || 0, ui.camera.near, ui.camera.far];
  ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-fov", "camera-roll", "camera-near", "camera-far"].forEach((role, index) => {
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
    const curveTitle = q('[data-role="curve-title"]');
    if (curveTitle) curveTitle.textContent = t(`${activeCamera.name} Curve Editor`);
    const curveGroup = q('[data-role="curve-group"]');
    if (curveGroup && curveGroup.options.length >= 3) {
      curveGroup.options[0].textContent = t("Position XYZ");
      curveGroup.options[1].textContent = t("Target XYZ");
      curveGroup.options[2].textContent = t("FOV / Roll / Zoom");
    }
    return;
  }
  const position = object.position || [0, 0, 0];
  const selName = q('[data-role="selected-name"]');
  if (selName) selName.textContent = object.name || object.type;
  const curveTitle = q('[data-role="curve-title"]');
  if (curveTitle) curveTitle.textContent = t(`${object.name || object.type} Curve Editor`);
  const curveGroup = q('[data-role="curve-group"]');
  if (curveGroup && curveGroup.options.length >= 3) {
    curveGroup.options[0].textContent = t("Position XYZ");
    curveGroup.options[1].textContent = t("Rotation XYZ");
    curveGroup.options[2].textContent = t("Scale XYZ");
  }
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
  let key = object.keyframes?.find((item) => item.frame === (ui.state.auto_key ? ui.frame : ui.selectedKeyFrame));
  if (!key && ui.state.auto_key) {
    key = { frame: ui.frame, transform: cloneTransform(object), interpolation: ui.root.querySelector('[data-role="interp"]')?.value || "ease" };
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
    const isActive = camera.id === ui.state.active_camera_id;
    const isPlayblast = camera.id === ui.state.playblast_camera_id;
    const isSelected = ui.selectedEntity === "camera" && isActive;
    element.className = `scene-item${isSelected ? " selected" : ""}${isActive && !isSelected ? " active-view" : ""}`;
    const icon = document.createElement("i");
    icon.className = "pi pi-video";
    const label = document.createElement("span");
    if (isSelected || isActive) {
      const stateMark = document.createElement("span");
      stateMark.style.cssText = `color:${isSelected ? "#f59e0b" : "#58cc6b"};font-weight:700`;
      stateMark.textContent = isSelected ? "● " : "○ ";
      label.appendChild(stateMark);
    }
    label.appendChild(document.createTextNode(camera.name));
    if (isPlayblast) {
      const outputMark = document.createElement("span");
      outputMark.style.cssText = "color:#f2d06b;font-size:10px";
      outputMark.title = "Playblast Output";
      outputMark.textContent = " ★";
      label.appendChild(outputMark);
    }
    if (camera.muted) {
      const muted = document.createElement("span");
      muted.style.opacity = ".6";
      muted.textContent = " (muted)";
      label.appendChild(muted);
    }
    element.append(icon, label, trackFlag(ui, camera, "camera"));
    element.title = isSelected ? t("Currently selected for editing") : isPlayblast ? t("Active playblast camera") : t("Click to select & activate this camera");
    element.addEventListener("click", () => {
      ui.selectedEntity = "camera";
      ui.selectedObjectId = null;
      ui.activateCamera(camera.id);
      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`Editing: ${camera.name}`));
    });
    box.appendChild(element);
  }
  for (const object of ui.state.objects) {
    const element = document.createElement("button");
    element.type = "button";
    element.dataset.objectId = object.id;
    const isSelected = ui.selectedEntity === "object" && object.id === ui.selectedObjectId;
    element.className = `scene-item${isSelected ? " selected" : ""}`;
    const typeIcon = object.type === "card" ? "pi-image"
      : object.type === "model" || object.type === "glb" ? "pi-box"
      : object.type === "ground" ? "pi-minus"
      : object.type === "cube" ? "pi-stop"
      : object.type === "sphere" ? "pi-circle"
      : object.type === "human" ? "pi-user"
      : "pi-plus";
    const isEnabled = object.enabled !== false;
    const hasError = Boolean(object.load_error);
    const label = document.createElement("span");
    const objectIcon = document.createElement("i");
    objectIcon.className = `pi ${hasError ? "pi-exclamation-triangle" : typeIcon}`;
    objectIcon.style.cssText = hasError ? "color:#f87171" : isEnabled ? "" : "opacity:.4";
    const objectName = document.createElement("span");
    objectName.style.cssText = hasError ? "color:#fca5a5" : isEnabled ? "" : "opacity:.5;text-decoration:line-through";
    objectName.textContent = object.name || object.type;
    label.append(objectIcon, document.createTextNode(" "), objectName);
    if (hasError) {
      const formatError = document.createElement("span");
      formatError.style.cssText = "color:#ef4444;font-size:9px;font-weight:700";
      formatError.textContent = " [Format!]";
      label.appendChild(formatError);
    }
    
    // Visibility toggle eye button
    const visBtn = document.createElement("button");
    visBtn.type = "button";
    visBtn.className = "icon-button";
    visBtn.style.cssText = "width:18px;height:18px;min-width:18px;padding:0;margin-left:auto;opacity:.65";
    visBtn.title = isEnabled ? t("Hide object") : t("Show object");
    visBtn.innerHTML = `<i class="pi ${isEnabled ? "pi-eye" : "pi-eye-slash"}" style="font-size:10px"></i>`;
    visBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      ui.toggleObject(object.id);
    });

    element.append(label, visBtn, trackFlag(ui, object, "object"));
    element.title = t("Click to select · Double-click to toggle visibility · Right-click for actions");
    element.addEventListener("click", (event) => {
      if (event.altKey && object.id !== "subject") return void ui.deleteObject(object.id);
      ui.selectedEntity = "object";
      ui.selectedObjectId = object.id;
      ui.selectedKeyFrame = object.keyframes?.find((key) => key.frame === ui.frame)?.frame ?? null;
      ui.serialize();
      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`Editing: ${object.name || object.type}`));
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
