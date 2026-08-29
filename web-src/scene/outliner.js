// Scene outliner tree rendering and item actions.

import { t } from "../i18n.js";

export function refreshObjects(ui) {
  const box = ui.root.querySelector('[data-role="objects"]');
  if (!box) return;
  box.innerHTML = "";

  const createActionBtn = (icon, label, active, onClick, colorStyle = "") => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scene-action-btn";
    if (active) button.style.cssText = colorStyle || "color:#f59e0b;border-color:#78350f;background:rgba(245,158,11,0.15)";
    button.title = t(label);
    button.innerHTML = `<i class="pi ${icon}" style="font-size:10px"></i>`;
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick(e);
    });
    return button;
  };

  // The search box filters by name; an empty box shows everything.
  const filter = (ui.outlinerFilter || "").trim().toLowerCase();
  const matches = (name) => !filter || String(name || "").toLowerCase().includes(filter);

  for (const camera of ui.state.cameras) {
    if (!matches(camera.name)) continue;
    const element = document.createElement("div");
    element.role = "button";
    element.tabIndex = 0;
    element.dataset.cameraId = camera.id;
    const isActive = camera.id === ui.state.active_camera_id;
    const isPlayblast = camera.id === ui.state.playblast_camera_id;
    const isSelected = ui.selectedEntity === "camera" && isActive;
    element.setAttribute("aria-selected", String(isSelected));
    element.className = `scene-item${isSelected ? " selected" : ""}${isActive && !isSelected ? " active-view" : ""}`;

    const icon = document.createElement("i");
    icon.className = "pi pi-video";

    const label = document.createElement("span");
    label.className = "scene-item-label";
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

    const actions = document.createElement("div");
    actions.className = "scene-item-actions";
    actions.appendChild(createActionBtn("pi-star", "Solo track", camera.solo, () => {
      ui.checkpoint("Solo track");
      camera.solo = !camera.solo;
      ui.serialize();
      ui.refreshObjects();
      ui.renderCameraView();
    }, "color:#fbbf24;border-color:#78350f;background:rgba(245,158,11,0.2)"));
    actions.appendChild(createActionBtn("pi-volume-off", "Mute track", camera.muted, () => {
      ui.checkpoint("Mute track");
      camera.muted = !camera.muted;
      ui.serialize();
      ui.refreshObjects();
      ui.renderCameraView();
    }, "color:#f87171;border-color:#7f1d1d;background:rgba(239,68,68,0.15)"));
    actions.appendChild(createActionBtn("pi-lock", "Lock track", camera.locked, () => {
      ui.checkpoint("Lock track");
      camera.locked = !camera.locked;
      ui.serialize();
      ui.refreshObjects();
      ui.renderCameraView();
    }));
    actions.appendChild(createActionBtn("pi-ellipsis-v", "Camera actions", false, (event) => ui.openCameraContext(event, camera.id, false)));

    element.append(icon, label, actions);
    element.title = isSelected ? t("Currently selected for editing") : isPlayblast ? t("Active playblast camera") : t("Click to select & activate this camera");
    const selectCameraRow = () => {
      ui.finishCameraEdit();
      ui.selectedEntity = "camera";
      ui.selectedObjectId = null;
      ui.editingKeyFrame = null;
      ui.activateCamera(camera.id);
      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`Camera: ${camera.name}`));
    };
    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      ui.openCameraContext(event, camera.id, false);
    });
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectCameraRow();
      }
    });
    box.appendChild(element);
  }

  for (const object of ui.state.objects) {
    if (!matches(object.name || object.type)) continue;
    const element = document.createElement("div");
    element.role = "button";
    element.tabIndex = 0;
    element.dataset.objectId = object.id;
    const isSelected = ui.selectedEntity === "object" && (object.id === ui.selectedObjectId || ui.selectedObjectIds?.has?.(object.id));
    element.setAttribute("aria-selected", String(isSelected));
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

    const objectIcon = document.createElement("i");
    objectIcon.className = `pi ${hasError ? "pi-exclamation-triangle" : typeIcon}`;
    objectIcon.style.cssText = hasError ? "color:#f87171" : isEnabled ? "" : "opacity:.4";

    const label = document.createElement("span");
    label.className = "scene-item-label";
    const objectName = document.createElement("span");
    objectName.style.cssText = hasError ? "color:#fca5a5" : isEnabled ? "" : "opacity:.5;text-decoration:line-through";
    objectName.textContent = object.name || object.type;
    label.appendChild(objectName);
    if (hasError) {
      const formatError = document.createElement("span");
      formatError.style.cssText = "color:#ef4444;font-size:9px;font-weight:700";
      formatError.textContent = " [Format!]";
      label.appendChild(formatError);
    }

    const actions = document.createElement("div");
    actions.className = "scene-item-actions";
    actions.appendChild(createActionBtn(isEnabled ? "pi-eye" : "pi-eye-slash", isEnabled ? "Hide object" : "Show object", !isEnabled, () => ui.toggleObject(object.id), "color:#ef4444;opacity:.7"));
    actions.appendChild(createActionBtn("pi-lock", "Lock object", object.locked, () => {
      ui.checkpoint("Lock object");
      object.locked = !object.locked;
      ui.serialize();
      ui.refreshObjects();
    }));
    actions.appendChild(createActionBtn("pi-ellipsis-v", "Object actions", false, (event) => ui.openObjectContext(event, object.id)));

    element.append(objectIcon, label, actions);
    element.title = t("Click to select · Double-click to toggle visibility · Right-click for actions");
    const selectObjectRow = (event = {}) => {
      if (event.altKey && object.id !== "subject") return void ui.deleteObject(object.id);
      ui.finishCameraEdit();
      ui.selectedEntity = "object";
      ui.selectedObjectIds ||= new Set();
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        if (ui.selectedObjectIds.has(object.id)) ui.selectedObjectIds.delete(object.id);
        else ui.selectedObjectIds.add(object.id);
      } else ui.selectedObjectIds = new Set([object.id]);
      ui.selectedObjectId = ui.selectedObjectIds.has(object.id) ? object.id : [...ui.selectedObjectIds].at(-1) || null;
      ui.selectedEntity = ui.selectedObjectIds.size ? "object" : "camera";
      ui.selectedKeyFrame = ui.selectedObjectId
        ? object.keyframes?.find((key) => key.frame === ui.frame)?.frame ?? null
        : null;
      ui.editingKeyFrame = null;
      for (const row of box.querySelectorAll(".scene-item")) {
        const selected = Boolean(row.dataset.objectId && ui.selectedObjectIds.has(row.dataset.objectId));
        row.classList.toggle("selected", selected);
        if (row.dataset.objectId) row.setAttribute("aria-selected", String(selected));
      }
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`Selected: ${object.name || object.type}`));
    };
    element.addEventListener("dblclick", () => ui.toggleObject(object.id));
    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      ui.openObjectContext(event, object.id);
    });
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectObjectRow(event);
      }
    });
    box.appendChild(element);
  }
  ui.refreshInspector();
}
