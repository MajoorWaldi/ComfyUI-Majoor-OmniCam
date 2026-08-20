// Extracted DOM bindings.

import { clamp } from "../director/core.js";
import { applyCinemaLens } from "../cameras.js";
import { applyBlockingScenePreset } from "../motion-presets.js";
import { onCurveWheel } from "../curve-editor.js";
import { onTimelineWheel } from "../timeline-interaction.js";
import { syncMirroredControl } from "../event-bindings.js";

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
  q('[data-role="curve-group"]')?.addEventListener("change", () => ui.drawCurveEditor(), { signal });
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
  for (const btn of ui.root.querySelectorAll('[data-act="bake-aim-keys"]')) {
    btn.addEventListener("click", () => {
      ui.bakeAimToKeyframes();
      ui.closeMenus();
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-target-object"]')) {
    el.addEventListener("change", (e) => {
      ui.setCameraTrackingTarget(e.target.value);
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
  const timeline = q('[data-role="keys"]');
  if (timeline) {
    timeline.addEventListener("pointerdown", (event) => ui.onTimelinePointerDown(event), { signal });
    timeline.addEventListener("pointermove", (event) => ui.onTimelinePointerMove(event), { signal });
    timeline.addEventListener("pointerup", (event) => ui.onTimelinePointerUp(event), { signal });
    timeline.addEventListener("pointercancel", (event) => ui.onTimelinePointerUp(event), { signal });
    timeline.addEventListener("wheel", (event) => onTimelineWheel(ui, event), { passive: false, signal });
  }
  ui.root.addEventListener("keydown", (event) => ui.onKey(event), { signal });
  const ro = new ResizeObserver(() => {
    ui.resizeCanvas();
    ui.render();
  });
  const wrapEl = ui.root.querySelector(".viewport-wrap");
  if (wrapEl) ro.observe(wrapEl);
  const previewsEl = ui.root.querySelector('[data-role="camera-previews"]');
  if (previewsEl) ro.observe(previewsEl);
  ui.resizeObserver = ro;
  ui.updateEditState();
}
