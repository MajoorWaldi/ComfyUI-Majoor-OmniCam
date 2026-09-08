// Scene outliner tree rendering and item actions.

import { t } from "../i18n.js";
import { toggleObjectLock } from "./object-lock.js";

// Swap an object-name label for an <input> and rename the object in place on
// Enter / blur (Escape cancels). Double-clicking the name in the tree is the
// fast path; the context menu's "Rename" still prompts via a dialog.
function startInlineRename(ui, object, span) {
  if (span.querySelector("input")) return;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "oc-inline-rename";
  input.value = object.name || object.type;
  input.style.cssText = "width:100%;font:inherit;padding:0 2px;box-sizing:border-box";
  const prev = span.textContent;
  span.textContent = "";
  span.appendChild(input);
  input.focus();
  input.select();
  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    input.removeEventListener("blur", onBlur);
    const name = input.value.trim().slice(0, 80);
    if (commit && name && name !== object.name) {
      ui.checkpoint("Rename object");
      object.name = name;
      ui.serialize();
      ui.refreshObjects();
      ui.refreshKeys?.();
      ui.setStatus(t("Object renamed: {name}").replace("{name}", object.name));
    } else {
      span.textContent = prev;
    }
  };
  const onBlur = () => finish(true);
  input.addEventListener("blur", onBlur);
  input.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Enter") { event.preventDefault(); finish(true); }
    else if (event.key === "Escape") { event.preventDefault(); finish(false); }
  });
  input.addEventListener("pointerdown", (event) => event.stopPropagation());
  input.addEventListener("dblclick", (event) => event.stopPropagation());
}

export function refreshObjects(ui) {
  const box = ui.root.querySelector('[data-role="objects"]');
  if (!box) return;
  box.innerHTML = "";

  box.onkeydown = (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const items = [...box.querySelectorAll('.scene-item[role="button"]')];
      const activeIdx = items.indexOf(document.activeElement);
      if (activeIdx >= 0) {
        event.preventDefault();
        const nextIdx = event.key === "ArrowDown"
          ? Math.min(items.length - 1, activeIdx + 1)
          : Math.max(0, activeIdx - 1);
        if (nextIdx !== activeIdx) {
          items[nextIdx].focus();
          items[nextIdx].click();
          items[nextIdx].scrollIntoView?.({ block: "nearest", behavior: "smooth" });
        }
      }
    }
  };

  const category = ui.outlinerCategoryFilter || "all";
  const chips = ui.root.querySelectorAll('[data-role="outliner-filter-chips"] .oc-chip');
  for (const chip of chips) {
    chip.classList.toggle("active", (chip.dataset.filter || "all") === category);
  }

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

  const createSectionHeader = (title, count, sectionKey) => {
    const isCollapsed = Boolean(ui.outlinerCollapsedSections?.has(sectionKey) && !filter);
    const header = document.createElement("div");
    header.className = "scene-section-header";
    header.dataset.section = sectionKey;
    header.innerHTML = `
      <i class="pi ${isCollapsed ? "pi-chevron-right" : "pi-chevron-down"}" style="font-size:9px;color:var(--oc-text-dim)"></i>
      <span class="scene-section-title">${title}</span>
      <span class="scene-section-count">(${count})</span>
    `;
    header.addEventListener("click", () => {
      ui.outlinerCollapsedSections ||= new Set();
      if (ui.outlinerCollapsedSections.has(sectionKey)) {
        ui.outlinerCollapsedSections.delete(sectionKey);
      } else {
        ui.outlinerCollapsedSections.add(sectionKey);
      }
      refreshObjects(ui);
    });
    return { header, isCollapsed };
  };

  const showCameras = category === "all" || category === "cameras" || (category === "hidden" && ui.state.cameras.some((c) => c.muted));
  const showObjects = category === "all" || category === "objects" || (category === "hidden" && ui.state.objects.some((o) => o.enabled === false));

  // --- Render Cameras ---
  if (showCameras) {
    const matchingCameras = ui.state.cameras.filter((camera) => {
      if (!matches(camera.name)) return false;
      if (category === "hidden" && !camera.muted) return false;
      return true;
    });

    const { header, isCollapsed } = createSectionHeader(t("Cameras"), matchingCameras.length, "cameras");
    box.appendChild(header);

    if (!isCollapsed) {
      for (const camera of matchingCameras) {
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
        icon.style.cssText = "color:#60a5fa";

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
    }
  }

  // --- Render Objects (hierarchical) ---
  if (showObjects) {
    const objectMap = new Map(ui.state.objects.map((o) => [o.id, o]));
    const childrenMap = new Map();
    const roots = [];

    for (const object of ui.state.objects) {
      if (object.parent_id && objectMap.has(object.parent_id)) {
        if (!childrenMap.has(object.parent_id)) childrenMap.set(object.parent_id, []);
        childrenMap.get(object.parent_id).push(object);
      } else {
        roots.push(object);
      }
    }

    const orderedObjectsWithLevel = [];
    const addBranch = (obj, level) => {
      orderedObjectsWithLevel.push({ object: obj, level });
      const children = childrenMap.get(obj.id) || [];
      for (const child of children) addBranch(child, level + 1);
    };
    for (const root of roots) addBranch(root, 0);

    const matchingObjects = orderedObjectsWithLevel.filter(({ object }) => {
      if (!matches(object.name || object.type)) return false;
      if (category === "hidden" && object.enabled !== false) return false;
      return true;
    });

    const { header, isCollapsed } = createSectionHeader(t("Objects"), matchingObjects.length, "objects");
    box.appendChild(header);

    if (!isCollapsed) {
      for (const { object, level } of matchingObjects) {
        const element = document.createElement("div");
        element.role = "button";
        element.tabIndex = 0;
        element.dataset.objectId = object.id;
        const isSelected = ui.selectedEntity === "object" && (object.id === ui.selectedObjectId || ui.selectedObjectIds?.has?.(object.id));
        element.setAttribute("aria-selected", String(isSelected));
        element.className = `scene-item${isSelected ? " selected" : ""}${level > 0 && !filter ? " scene-item-child" : ""}`;
        if (level > 0 && !filter) {
          element.style.paddingLeft = `${level * 16 + 6}px`;
        }

        const typeInfo = object.type === "card" ? { icon: "pi-image", color: "#38bdf8" }
          : object.type === "model" || object.type === "glb" ? { icon: "pi-box", color: "#c084fc" }
          : object.type === "ground" ? { icon: "pi-minus", color: "#fbbf24" }
          : object.type === "cube" ? { icon: "pi-stop", color: "#fbbf24" }
          : object.type === "sphere" ? { icon: "pi-circle", color: "#fbbf24" }
          : object.type === "cylinder" ? { icon: "pi-database", color: "#fbbf24" }
          : object.type === "torus" ? { icon: "pi-circle", color: "#fbbf24" }
          : object.type === "human" ? { icon: "pi-user", color: "#34d399" }
          : { icon: "pi-plus", color: "#94a3b8" };

        const isEnabled = object.enabled !== false;
        const hasError = Boolean(object.load_error);

        const objectIcon = document.createElement("i");
        objectIcon.className = `pi ${hasError ? "pi-exclamation-triangle" : typeInfo.icon}`;
        objectIcon.style.cssText = hasError ? "color:#f87171" : isEnabled ? `color:${typeInfo.color}` : "opacity:.4";

        const label = document.createElement("span");
        label.className = "scene-item-label";
        const objectName = document.createElement("span");
        objectName.style.cssText = hasError ? "color:#fca5a5" : isEnabled ? "" : "opacity:.5;text-decoration:line-through";
        objectName.textContent = object.name || object.type;
        objectName.title = t("Double-click to rename");
        objectName.addEventListener("dblclick", (event) => {
          event.preventDefault();
          event.stopPropagation();
          startInlineRename(ui, object, objectName);
        });
        label.appendChild(objectName);
        if (hasError) {
          const formatError = document.createElement("span");
          formatError.style.cssText = "color:#ef4444;font-size:9px;font-weight:700";
          formatError.textContent = " [Format!]";
          label.appendChild(formatError);
        }

        const actions = document.createElement("div");
        actions.className = "scene-item-actions";
        actions.appendChild(createActionBtn(isEnabled ? "pi-eye" : "pi-eye-slash", isEnabled ? "Hide object (Alt+Click to Isolate)" : "Show object (Alt+Click to Isolate)", !isEnabled, (event) => {
          if (event?.altKey) {
            ui.checkpoint("Isolate object");
            const currentlyIsolated = ui._isolatedObjectId === object.id;
            if (currentlyIsolated) {
              ui._isolatedObjectId = null;
              // Restore the visibility each object had before isolation rather
              // than force-showing everything.
              const snapshot = ui._isolationSnapshot;
              for (const o of ui.state.objects) {
                o.enabled = snapshot && Object.prototype.hasOwnProperty.call(snapshot, o.id) ? snapshot[o.id] : true;
              }
              ui._isolationSnapshot = null;
              ui.setStatus?.(t("Isolation cleared"));
            } else {
              // Snapshot once, from the true pre-isolation state -- keep any
              // existing snapshot when isolating straight from another isolation.
              if (!ui._isolationSnapshot) {
                ui._isolationSnapshot = Object.fromEntries(ui.state.objects.map((o) => [o.id, o.enabled !== false]));
              }
              ui._isolatedObjectId = object.id;
              for (const o of ui.state.objects) o.enabled = o.id === object.id;
              ui.setStatus?.(t("Isolated: {name}").replace("{name}", object.name || object.type));
            }
            ui.serialize();
            ui.refreshObjects();
            ui.requestRender?.();
          } else {
            ui.toggleObject(object.id);
          }
        }, "color:#ef4444;opacity:.7"));
        actions.appendChild(createActionBtn(object.locked ? "pi-lock" : "pi-lock-open", "Lock object", object.locked, () => toggleObjectLock(ui, object)));
        actions.appendChild(createActionBtn("pi-copy", "Duplicate object", false, () => ui.duplicateObject?.(object.id)));
        if (object.id !== "subject") {
          actions.appendChild(createActionBtn("pi-trash", "Delete object", false, () => ui.deleteObject?.(object.id)));
        }
        actions.appendChild(createActionBtn("pi-ellipsis-v", "Object actions", false, (event) => ui.openObjectContext(event, object.id)));

        element.append(objectIcon, label, actions);
        element.title = t("Click to select · Double-click to toggle visibility · Right-click for actions");
        const selectObjectRow = (event = {}) => {
          if (event.altKey && object.id !== "subject") return void ui.deleteObject(object.id);
          ui.finishCameraEdit();
          ui.selectedEntity = "object";
          ui.selectedObjectIds ||= new Set();
          if (event.ctrlKey || event.metaKey) {
            if (ui.selectedObjectIds.has(object.id)) ui.selectedObjectIds.delete(object.id);
            else ui.selectedObjectIds.add(object.id);
            ui.outlinerAnchorId = object.id;
          } else if (event.shiftKey && ui.outlinerAnchorId
            && ui.state.objects.some((o) => o.id === ui.outlinerAnchorId)) {
            const order = ui.state.objects.map((o) => o.id);
            const a = order.indexOf(ui.outlinerAnchorId);
            const b = order.indexOf(object.id);
            ui.selectedObjectIds = new Set(order.slice(Math.min(a, b), Math.max(a, b) + 1));
          } else {
            ui.selectedObjectIds = new Set([object.id]);
            ui.outlinerAnchorId = object.id;
          }
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
        // Selection arrives through the delegated .scene-item handler in
        // event-bindings/editor-global.js -- binding it here too toggles twice.
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
    }
  }
  ui.refreshInspector();
}
