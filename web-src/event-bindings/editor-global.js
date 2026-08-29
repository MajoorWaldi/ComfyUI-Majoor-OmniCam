// Extracted DOM bindings.

import { clamp } from "../director/core.js";
import { resolveZone } from "../commands.js";
import { applyCinemaLens } from "../cameras.js";
import { applyBlockingScenePreset } from "../motion-presets.js";
import { onCurveWheel } from "../curve-editor.js";
import { onTimelineWheel } from "../timeline-interaction.js";
import { bindRulerScrub } from "../timeline/ruler.js";
import { bindGraphTabs } from "../curve-editor/tabs.js";
import { renderChannelList } from "../curve-editor/channel-list.js";
import { renderGraphDopeSheet } from "../curve-editor/dope-view.js";
import { syncMirroredControl } from "../event-bindings.js";
import { t } from "../i18n.js";

export function bindEditorAndGlobal(ui, q, signal) {
  for (const role of ["object-x", "object-y", "object-z", "object-px", "object-py", "object-pz", "object-rx", "object-ry", "object-rz", "object-sx", "object-sy", "object-sz"]) {
    for (const input of ui.root.querySelectorAll(`[data-role="${role}"]`)) {
      input.addEventListener("input", () => ui.updateSelectedObject(), { signal });
      input.addEventListener("change", () => ui.updateSelectedObject(), { signal });
    }
  }
  for (const role of ["camera-px", "camera-py", "camera-pz", "camera-tx", "camera-ty", "camera-tz", "camera-near", "camera-far"]) {
    for (const input of ui.root.querySelectorAll(`[data-role="${role}"]`)) {
      input.addEventListener("input", () => ui.updateCameraFromHud(), { signal });
      input.addEventListener("change", () => ui.updateCameraFromHud(), { signal });
    }
  }
  q('[data-role="animation-select"]')?.addEventListener("change", (event) => ui.selectObjectAnimation(Number(event.target.value)), { signal });
  q('[data-role="object-parent"]')?.addEventListener("change", (event) => ui.setObjectParent(event.target.value || null), { signal });
  q('[data-role="duration-seconds"]')?.addEventListener("change", (event) => {
    if (ui.durationWidget) ui.durationWidget.value = Number(event.target.value);
    ui.syncFromWidgets();
  }, { signal });
  q('[data-role="timeline-fps"]')?.addEventListener("change", (event) => {
    if (ui.fpsWidget) ui.fpsWidget.value = Number(event.target.value);
    ui.syncFromWidgets();
  }, { signal });
  bindRulerScrub(ui, signal);
  bindGraphTabs(ui, signal);
  q('[data-role="curve-group"]')?.addEventListener("change", () => {
    // A new group means new channels, so the solo filter no longer refers to
    // anything: reset it before the list is rebuilt from the new channels.
    ui.setChannelFilter("all");
    renderChannelList(ui);
    ui.drawCurveEditor();
    renderGraphDopeSheet(ui);
  }, { signal });
  q('[data-act="curve-handles"]')?.addEventListener("click", () => ui.toggleCurveHandles(), { signal });
  for (const button of ui.root.querySelectorAll("[data-curve-mode]")) {
    button.addEventListener("click", () => ui.setCurveInterpolation(button.dataset.curveMode), { signal });
  }
  for (const button of ui.root.querySelectorAll("[data-tangent-mode]")) {
    button.addEventListener("click", () => ui.setTangentMode(button.dataset.tangentMode), { signal });
  }
  for (const button of ui.root.querySelectorAll("[data-channel-filter]")) {
    button.addEventListener("click", () => ui.setChannelFilter(button.dataset.channelFilter), { signal });
  }
  const curve = q('[data-role="curve-canvas"]');
  if (curve) {
    curve.addEventListener("pointerdown", (event) => ui.onCurvePointerDown(event), { signal });
    curve.addEventListener("pointermove", (event) => ui.onCurvePointerMove(event), { signal });
    curve.addEventListener("pointerup", (event) => ui.onCurvePointerUp(event), { signal });
    curve.addEventListener("pointercancel", (event) => ui.onCurvePointerUp(event), { signal });
    curve.addEventListener("wheel", (event) => onCurveWheel(ui, event), { passive: false, signal });
  }
  q('[data-act="curve-zoom-in"]')?.addEventListener("click", () => ui.zoomCurve(1.25), { signal });
  q('[data-act="curve-zoom-out"]')?.addEventListener("click", () => ui.zoomCurve(0.8), { signal });
  q('[data-act="curve-fit"]')?.addEventListener("click", () => ui.resetCurveZoom(), { signal });
  q('[data-role="key-frame"]')?.addEventListener("change", (event) => ui.retimeSelectedKey(Number(event.target.value)), { signal });
  for (const role of ["key-interp", "key-px", "key-py", "key-pz", "key-tx", "key-ty", "key-tz", "key-fov", "key-roll", "key-zoom", "key-near", "key-far", "key-camera-type"]) {
    q(`[data-role="${role}"]`)?.addEventListener("change", () => ui.updateSelectedKey(), { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="ui-density"]')) {
    el.addEventListener("change", (e) => ui.setDensity(e.target.value), { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="preview-layout"]')) {
    el.addEventListener("change", (e) => {
      ui.state.preview_layout = e.target.value;
      ui.scheduleSerialize();
      ui.refreshCameraPreviews();
      ui.renderCameraView();
      ui.setStatus(`Preview layout: ${e.target.value}`);
    }, { signal });
  }
  for (const button of ui.root.querySelectorAll('[data-act="aim-at-object"]')) {
    button.addEventListener("click", () => {
      ui.aimAtSelectedObject();
      ui.closeMenus();
    }, { signal });
  }
  // Both bake buttons go through the aim module, which falls back to the plain
  // object bake when no bone is chosen.
  for (const btn of ui.root.querySelectorAll('[data-act="bake-aim-keys"]')) {
    btn.addEventListener("click", () => {
      ui.bakeAimConstraint({ perFrame: false });
      ui.closeMenus();
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="bake-aim-per-frame"]')) {
    btn.addEventListener("click", () => {
      ui.bakeAimConstraint({ perFrame: true });
      ui.closeMenus();
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-target-object"]')) {
    el.addEventListener("change", (e) => {
      ui.setCameraTrackingTarget(e.target.value);
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-aim-bone"]')) {
    el.addEventListener("change", (e) => {
      ui.setAimBone(e.target.value);
    }, { signal });
  }
  for (const focusBtn of ui.root.querySelectorAll('[data-act="focus-target"]')) {
    focusBtn.addEventListener("click", () => {
      ui.focusCameraTarget();
      ui.closeMenus();
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="gizmo-space"]')) {
    el.addEventListener("change", (e) => {
      ui.state.gizmo_space = e.target.value;
      for (const o of ui.root.querySelectorAll('[data-role="gizmo-space"]')) o.value = e.target.value;
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="navigation-profile"]')) {
    el.addEventListener("change", (event) => {
      ui.state.navigation_profile = event.target.value === "blender" ? "blender" : "maya";
      ui.scheduleSerialize(); ui.setStatus(`Navigation: ${ui.state.navigation_profile}`);
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="spatial-snap-mode"]')) {
    el.addEventListener("change", (event) => {
      ui.state.spatial_snap_mode = ["grid", "vertex"].includes(event.target.value) ? event.target.value : "none";
      ui.scheduleSerialize(); ui.setStatus(`Spatial Snap: ${ui.state.spatial_snap_mode}`);
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="spatial-grid-size"]')) {
    el.addEventListener("change", (event) => {
      ui.state.spatial_grid_size = Math.max(0.01, Math.min(100, Number(event.target.value) || 0.5));
      event.target.value = String(ui.state.spatial_grid_size); ui.scheduleSerialize();
    }, { signal });
  }
  for (const viewSelect of ui.root.querySelectorAll('[data-role="view-mode"]')) {
    viewSelect.addEventListener("change", (e) => ui.setViewMode(e.target.value), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-inspector"]')) {
    btn.addEventListener("click", () => ui.toggleInspector(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="clear-selection"]')) {
    btn.addEventListener("click", () => {
      ui.selectedEntity = "camera";
      ui.selectedObjectId = null;
      ui.selectedKeyFrame = null;
      ui.refreshObjects();
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="timeline-summary"]')) {
    el.addEventListener("click", () => {
      if (ui.selectedEntity === "object") {
        ui.selectedEntity = "camera";
        ui.selectedObjectId = null;
        ui.refreshObjects();
        ui.refreshKeys();
        ui.refreshInspector();
        ui.render();
        ui.setStatus(t(`Editing: ${ui.activeCameraTrack().name}`));
      }
    }, { signal });
  }
  for (const menu of ui.root.querySelectorAll(".toolbar-menu")) {
    menu.addEventListener("toggle", () => {
      if (menu.open) ui.closeMenus(menu);
    }, { signal });
  }
  const selectOutlinerItem = (target, event) => {
    const sceneItem = target instanceof HTMLElement ? target.closest(".scene-item") : null;
    if (!sceneItem || event.button === 2 || target.closest(".scene-action-btn")) return;
    if (sceneItem.dataset.objectId) {
      const object = ui.state.objects.find((item) => item.id === sceneItem.dataset.objectId);
      if (!object) return;
      ui.finishCameraEdit();
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
      for (const row of ui.root.querySelectorAll(".scene-item")) {
        const selected = Boolean(row.dataset.objectId && ui.selectedObjectIds.has(row.dataset.objectId));
        row.classList.toggle("selected", selected);
        row.setAttribute("aria-selected", String(selected));
      }
      ui.refreshKeys();
      ui.refreshInspector();
      ui.render();
      ui.setStatus(t(`Selected: ${object.name || object.type}`));
    } else if (sceneItem.dataset.cameraId) {
      ui.activateCamera(sceneItem.dataset.cameraId);
    }
  };
  ui.root.addEventListener("pointerdown", (event) => {
    selectOutlinerItem(event.composedPath?.()[0] || event.target, event);
  }, { capture: true, signal });
  ui.root.addEventListener("pointerdown", (event) => {
    const target = event.composedPath?.()[0] || event.target;
    if (target instanceof HTMLElement && target.closest(".context-menu, [data-role='context-menu']")) {
      return;
    }
    event.stopPropagation();
    if (target instanceof HTMLElement && !target.closest(".toolbar-menu")) ui.closeMenus();
    if (target instanceof HTMLElement && !target.closest(".key,.key-editor,canvas")) ui.exitKeyEdit(true);
    if (!(target instanceof HTMLElement) || !target.closest("input,select,textarea,button,[contenteditable=true]")) ui.root.focus({ preventScroll: true });
  }, { signal });
  document.addEventListener("pointerdown", (event) => {
    const target = event.composedPath?.()[0] || event.target;
    if (target instanceof HTMLElement && target.closest(".context-menu, [data-role='context-menu']")) {
      return;
    }
    if (!(target instanceof Node) || !ui.root.contains(target)) {
      ui.closeMenus();
      ui.exitKeyEdit(true);
    }
  }, { capture: true, signal });
  ui.root.addEventListener("mousedown", (event) => event.stopPropagation(), { signal });
  // Let row-specific object/camera handlers run first; the root bubble handler
  // remains the fallback for the canvas, timeline and empty viewport areas.
  ui.root.addEventListener("contextmenu", (event) => ui.onContextMenu(event), { signal });
  ui.interactionElement?.addEventListener("pointerdown", (event) => ui.onPointerDown(event), { signal });
  ui.interactionElement?.addEventListener("pointermove", (event) => ui.onPointerMove(event), { signal });
  ui.interactionElement?.addEventListener("pointerup", (event) => ui.onPointerUp(event), { signal });
  ui.interactionElement?.addEventListener("pointercancel", (event) => ui.onPointerUp(event), { signal });
  ui.interactionElement?.addEventListener("dblclick", (event) => ui.setTargetAtCursor(event), { signal });
  ui.interactionElement?.addEventListener("wheel", (event) => ui.onWheel(event), { passive: false, signal });
  window.addEventListener("pointermove", (event) => {
    if (ui.keyDrag) ui.onPointerMove(event);
  }, { capture: true, signal });
  window.addEventListener("pointerup", (event) => {
    if (ui.keyDrag) ui.onPointerUp(event);
  }, { capture: true, signal });
  const timeline = q('[data-role="dope-tracks"]');
  if (timeline) {
    timeline.addEventListener("pointerdown", (event) => ui.onTimelinePointerDown(event), { signal });
    timeline.addEventListener("pointermove", (event) => ui.onTimelinePointerMove(event), { signal });
    timeline.addEventListener("pointerup", (event) => ui.onTimelinePointerUp(event), { signal });
    timeline.addEventListener("pointercancel", (event) => ui.onTimelinePointerUp(event), { signal });
    timeline.addEventListener("wheel", (event) => onTimelineWheel(ui, event), { passive: false, signal });
  }
  // Keydown is claimed by the page-wide capture interceptor (commands.js), which
  // routes it here via ui.onKey. Track the zone the user last touched so a key
  // pressed while focus sits on the document body still lands in the right map.
  const rememberZone = (event) => {
    const zone = resolveZone(event.composedPath?.()[0] || event.target);
    if (zone) ui.lastKeyZone = zone;
  };
  ui.root.addEventListener("focusin", rememberZone, { signal });
  ui.root.addEventListener("pointerdown", rememberZone, { capture: true, signal });
  const ro = new ResizeObserver(() => {
    ui.scheduleResizeAndRender();
  });
  const wrapEl = ui.root.querySelector(".viewport-wrap");
  if (wrapEl) ro.observe(wrapEl);
  ui.resizeObserver = ro;
  ui.updateEditState();
}
