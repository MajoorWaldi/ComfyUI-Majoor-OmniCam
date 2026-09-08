// Extracted DOM bindings.

import { clamp } from "../director/core.js";
import { DEFAULT_BG_COLOR } from "../viewport/studio.js";
import { applyCinemaLens } from "../cameras.js";
import { applyBlockingScenePreset } from "../motion-presets.js";
import { onCurveWheel } from "../curve-editor.js";
import { onTimelineWheel } from "../timeline-interaction.js";
import { syncMirroredControl } from "../event-bindings.js";
import { t } from "../i18n.js";
import { axisViewFor } from "../view-navigation.js";
import { toggleObjectLock } from "../scene/object-lock.js";
import { setReconstructionAppearance } from "../scene/reconstruction-badges.js";

function groupedCheckpoint(ui, key, label, interval = 300) {
  const now = globalThis.performance?.now?.() ?? Date.now();
  ui._groupedCheckpointAt ||= {};
  if (!Number.isFinite(ui._groupedCheckpointAt[key]) || now - ui._groupedCheckpointAt[key] > interval) ui.checkpoint(label);
  ui._groupedCheckpointAt[key] = now;
}

export function bindViewportSettings(ui, q, signal) {
  const axisGizmo = ui.root.querySelector('[data-role="viewport-axis"]');
  if (axisGizmo) {
    const handleAxisEvent = (e) => {
      const target = e.target.closest?.("[data-axis], [data-axis-center]") || e.target;
      const axis = target.getAttribute("data-axis");
      const axisView = axisViewFor(axis?.toLowerCase(), ui.state.view_mode);
      if (axisView) { e.preventDefault(); ui.setViewMode(axisView); }
      else if (target.hasAttribute("data-axis-center")) { e.preventDefault(); ui.frameTarget(); }
    };
    axisGizmo.addEventListener("click", handleAxisEvent, { signal });
    axisGizmo.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") handleAxisEvent(e);
    }, { signal });
  }

  for (const el of ui.root.querySelectorAll('[data-role="mode"]')) {
    el.addEventListener("change", (e) => {
      if (ui.state.render_mode !== e.target.value) ui.checkpoint("Change render mode");
      ui.state.render_mode = e.target.value;
      if (ui.modeWidget) ui.modeWidget.value = e.target.value;
      for (const o of ui.root.querySelectorAll('[data-role="mode"]')) o.value = e.target.value;
      ui.serialize();
      ui.render();
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="frame"]')) {
    el.addEventListener("change", (e) => ui.setFrame(Number(e.target.value)), { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="scrub"]')) {
    el.addEventListener("input", (e) => ui.setFrame(Number(e.target.value)), { signal });
  }
  for (const btn of ui.root.querySelectorAll("[data-view]")) {
    btn.addEventListener("click", () => ui.setViewMode(btn.dataset.view), { signal });
  }
  for (const btn of ui.root.querySelectorAll("[data-select-mode]")) {
    btn.addEventListener("click", () => ui.setSelectMode(btn.dataset.selectMode), { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="select-mode"]')) {
    el.addEventListener("change", (e) => ui.setSelectMode(e.target.value), { signal });
  }
  for (const btn of ui.root.querySelectorAll("[data-transform-mode]")) {
    btn.addEventListener("click", () => ui.setTransformMode(btn.dataset.transformMode), { signal });
  }
  q('[data-act="frame-target"]')?.addEventListener("click", () => ui.frameTarget(), { signal });
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-camera-view"]')) {
    btn.addEventListener("click", () => ui.toggleCameraView(), { signal });
  }
  for (const tab of ui.root.querySelectorAll(".inspector-tab, [data-tab]")) {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.tab;
      for (const t of ui.root.querySelectorAll(".inspector-tab, [data-tab]")) t.classList.toggle("active", t === tab);
      for (const panel of ui.root.querySelectorAll(".inspector-tab-content, [data-tab-panel]")) {
        panel.hidden = panel.dataset.tabPanel !== tabName;
      }
      // The viewport motion toolbar is contextual: only the Motion workspace
      // shows it. Leaving the tab also drops any in-progress motion tool.
      const motionActive = tabName === "motion";
      ui.root.classList.toggle("oc-motion-mode", motionActive);
      if (!motionActive && (ui.state.motion_tool || "select") !== "select") {
        ui.state.motion_tool = "select";
        ui.motionTrackDraft = null;
      }
      // Re-render on the switch so the 2D motion path preview can measure its
      // box once the Motion panel is actually visible, and so the contextual
      // viewport toolbar repaints. Re-fit the node too: the Outliner tab can be
      // much taller than the others, so its height must not linger when another
      // tab takes over (and vice versa).
      ui.render?.();
      ui.refitNode?.();
    }, { signal });
  }
  const sideTabList = ui.root.querySelector(".inspector-tabs, .oc-side-tabs");
  if (sideTabList) {
    sideTabList.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const tabs = [...sideTabList.querySelectorAll(".inspector-tab")].filter((b) => b.offsetParent !== null);
        const currentIdx = tabs.findIndex((b) => b.classList.contains("active"));
        if (currentIdx >= 0 && tabs.length > 1) {
          const nextIdx = e.key === "ArrowRight"
            ? (currentIdx + 1) % tabs.length
            : (currentIdx - 1 + tabs.length) % tabs.length;
          tabs[nextIdx].click();
          tabs[nextIdx].focus();
        }
      }
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="active-camera-select"]')) {
    el.addEventListener("change", (e) => ui.activateCamera(e.target.value), { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-color"]')) {
    el.addEventListener("input", (e) => {
      const cam = ui.activeCameraTrack();
      if (cam) {
        cam.color = e.target.value;
        ui.scheduleSerialize();
        ui.render();
      }
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="playblast-camera"]')) {
    el.addEventListener("change", (e) => ui.setPlayblastCamera(e.target.value), { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-type"]')) {
    el.addEventListener("change", (e) => {
      if (ui.camera.camera_type !== e.target.value) ui.checkpoint("Change camera type");
      ui.camera.camera_type = e.target.value;
      syncMirroredControl(ui.root, "camera-type", e.target);
      ui.beginCameraEdit();
      ui.commitCameraEdit();
      ui.finishCameraEdit();
      ui.render();
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="speed"]')) {
    const handler = (e) => {
      const val = clamp(Number(e.target.value), 0.05, 5);
      if (!Number.isFinite(val)) return;
      ui.cameraSpeed = val;
      for (const o of ui.root.querySelectorAll('[data-role="speed"]')) {
        if (o !== e.target) o.value = String(val);
      }
    };
    el.addEventListener("input", handler, { signal });
    el.addEventListener("change", handler, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="interp"]')) {
    el.addEventListener("change", (e) => {
      if (ui.activeKeyframe()) {
        if (ui.activeKeyframe().interpolation !== e.target.value) ui.checkpoint("Change interpolation");
        ui.activeKeyframe().interpolation = e.target.value;
        ui.scheduleSerialize();
        ui.render();
      }
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="point-density"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.point_density !== e.target.value) ui.checkpoint("Change point density");
      ui.state.point_density = e.target.value;
      ui.scheduleSerialize();
      ui.render();
      ui.setStatus(`Point density: ${e.target.value}`);
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="point-color"]')) {
    box.addEventListener("input", (e) => {
      if (ui.state.point_color !== e.target.value) groupedCheckpoint(ui, "point_color", "Change point color");
      ui.state.point_color = e.target.value;
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="point-spread"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.point_spread !== e.target.value) ui.checkpoint("Change point spread");
      ui.state.point_spread = e.target.value;
      ui.scheduleSerialize();
      ui.render();
      ui.setStatus(`Point spread: ${e.target.value}`);
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="card-fit"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.card_fit !== e.target.value) ui.checkpoint("Change card fit");
      ui.state.card_fit = e.target.value;
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="speed-heatmap"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.speed_heatmap !== e.target.checked) ui.checkpoint("Toggle speed heatmap");
      ui.state.speed_heatmap = e.target.checked;
      syncMirroredControl(ui.root, "speed-heatmap", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="playblast-grid"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.playblast_grid !== e.target.checked) ui.checkpoint("Toggle playblast grid");
      ui.state.playblast_grid = e.target.checked;
      syncMirroredControl(ui.root, "playblast-grid", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="playblast-resolution"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.playblast_resolution !== e.target.value) ui.checkpoint("Change playblast resolution");
      ui.state.playblast_resolution = e.target.value;
      syncMirroredControl(ui.root, "playblast-resolution", e.target);
      ui.scheduleSerialize();
    }, { signal });
  }
  for (const button of ui.root.querySelectorAll('[data-act="reset-bg-color"]')) {
    button.addEventListener("click", () => {
      // Back to the default colour, which is what lets the studio sky show again.
      if (ui.state.viewport_bg_color !== DEFAULT_BG_COLOR) ui.checkpoint("Reset background colour");
      ui.state.viewport_bg_color = DEFAULT_BG_COLOR;
      for (const input of ui.root.querySelectorAll('[data-role="viewport-bg-color"]')) input.value = DEFAULT_BG_COLOR;
      ui.scheduleSerialize();
      ui.render();
      ui.setStatus(t("Background colour reset"));
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="show-grid"]')) {
    box.addEventListener("change", (e) => {
      ui.state.show_grid = e.target.checked;
      syncMirroredControl(ui.root, "show-grid", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  // Maya-style "Show" toggles: each hides one family of viewport helper widgets.
  // Visibility is applied per-frame in the WebGL renderer, so no rebuild needed.
  for (const [role, flag] of [
    ["show-camera-paths", "show_camera_paths"],
    ["show-camera-gizmos", "show_camera_gizmos"],
    ["show-look-at", "show_look_at"],
    ["show-helper-axes", "show_helper_axes"],
  ]) {
    for (const box of ui.root.querySelectorAll(`[data-role="${role}"]`)) {
      box.addEventListener("change", (e) => {
        if (ui.state[flag] !== e.target.checked) ui.checkpoint("Toggle viewport helper");
        ui.state[flag] = e.target.checked;
        syncMirroredControl(ui.root, role, e.target, "checked");
        ui.scheduleSerialize();
        ui.render();
      }, { signal });
    }
  }
  for (const btn of ui.root.querySelectorAll('[data-act="select-look-at"]')) {
    btn.addEventListener("click", () => {
      const toTarget = ui.selectedEntity !== "camera_target";
      ui.selectedEntity = toTarget ? "camera_target" : "camera";
      ui.selectedObjectId = null;
      ui.selectedObjectIds?.clear?.();
      for (const b of ui.root.querySelectorAll('[data-act="select-look-at"]')) {
        b.classList.toggle("active", toTarget);
        b.setAttribute("aria-pressed", String(toTarget));
      }
      ui.refreshInspector?.();
      ui.render();
      ui.setStatus?.(toTarget ? t("Look-At target selected") : t("Camera selected"));
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="show-wireframe"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.show_wireframe !== e.target.checked) ui.checkpoint("Toggle wireframe");
      ui.state.show_wireframe = e.target.checked;
      syncMirroredControl(ui.root, "show-wireframe", e.target, "checked");
      ui.scheduleSerialize();
      if (ui.webgl) ui.webgl.sceneKey = "";
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="show-vertices"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.show_vertices !== e.target.checked) ui.checkpoint("Toggle vertices");
      ui.state.show_vertices = e.target.checked;
      syncMirroredControl(ui.root, "show-vertices", e.target, "checked");
      ui.scheduleSerialize();
      if (ui.webgl) ui.webgl.sceneKey = "";
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="backface-culling"]')) {
    box.addEventListener("change", (e) => {
      if (Boolean(ui.state.backface_culling) !== e.target.checked) ui.checkpoint("Toggle backface culling");
      ui.state.backface_culling = e.target.checked;
      syncMirroredControl(ui.root, "backface-culling", e.target, "checked");
      ui.scheduleSerialize();
      if (ui.webgl) ui.webgl.sceneKey = "";
      ui.render();
      ui.setStatus(ui.state.backface_culling ? t("Backface culling: On (Single-Sided)") : t("Backface culling: Off (Double-Sided)"));
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="set-near-preset"]')) {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = Number(btn.dataset.near || 0.01);
      ui.checkpoint("Set camera near clip");
      ui.camera.near = val;
      if (ui.camera.far <= ui.camera.near) ui.camera.far = ui.camera.near + 100;
      const activeCamera = ui.activeCameraTrack?.();
      if (activeCamera) {
        activeCamera.camera.near = val;
        const key = activeCamera.keyframes?.find((k) => k.frame === ui.frame);
        if (key && key.camera) key.camera.near = val;
      }
      for (const input of ui.root.querySelectorAll('[data-role="camera-near"]')) input.value = String(val);
      ui.scheduleSerialize();
      ui.render();
      ui.setStatus(t("Near clip set to {val}m").replace("{val}", String(val)));
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="burn-in"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.burn_in !== e.target.checked) ui.checkpoint("Toggle burn-in");
      ui.state.burn_in = e.target.checked;
      syncMirroredControl(ui.root, "burn-in", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="guides"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.guides !== e.target.checked) ui.checkpoint("Toggle guides");
      ui.state.guides = e.target.checked;
      syncMirroredControl(ui.root, "guides", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="safe-areas"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.safe_areas !== e.target.checked) ui.checkpoint("Toggle safe areas");
      ui.state.safe_areas = e.target.checked;
      syncMirroredControl(ui.root, "safe-areas", e.target, "checked");
      ui.scheduleSerialize();
      ui.renderCameraView();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="resolution-gate"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.resolution_gate !== e.target.checked) ui.checkpoint("Toggle resolution gate");
      ui.state.resolution_gate = e.target.checked;
      syncMirroredControl(ui.root, "resolution-gate", e.target, "checked");
      ui.scheduleSerialize();
      ui.renderCameraView();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="aspect-ratio"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.aspect_ratio !== e.target.value) ui.checkpoint("Change aspect ratio");
      ui.state.aspect_ratio = e.target.value;
      syncMirroredControl(ui.root, "aspect-ratio", e.target);
      ui.scheduleSerialize();
      ui.renderCameraView();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const handler = (e) => {
      if (ui.state.viewport_bg_color !== e.target.value) groupedCheckpoint(ui, "viewport_bg_color", "Change background colour");
      ui.state.viewport_bg_color = e.target.value;
      syncMirroredControl(ui.root, "viewport-bg-color", e.target);
      ui.scheduleSerialize();
      ui.render();
    };
    box.addEventListener("input", handler, { signal });
    box.addEventListener("change", handler, { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="upload-viewport-bg"]')) {
    btn.addEventListener("click", () => {
      ui.closeMenus();
      q('[data-role="viewport-bg-file"]')?.click();
    }, { signal });
  }
  q('[data-role="viewport-bg-file"]')?.addEventListener("change", (e) => {
    ui.loadViewportBgFile(e.target.files?.[0]);
    e.target.value = "";
  }, { signal });
  for (const btn of ui.root.querySelectorAll('[data-act="upload-viewport-bg-seq"]')) {
    btn.addEventListener("click", () => {
      ui.closeMenus();
      q('[data-role="viewport-bg-seq-file"]')?.click();
    }, { signal });
  }
  q('[data-role="viewport-bg-seq-file"]')?.addEventListener("change", (e) => {
    ui.loadViewportBgSequence(Array.from(e.target.files || []));
    e.target.value = "";
  }, { signal });
  for (const btn of ui.root.querySelectorAll('[data-act="clear-viewport-bg"]')) {
    btn.addEventListener("click", () => {
      ui.clearViewportBgImage();
      ui.closeMenus();
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="object-material"]')) {
    el.addEventListener("change", (e) => {
      const obj = ui.selectedObject();
      if (obj) {
        if (obj.material_mode !== e.target.value) ui.checkpoint("Change object material");
        obj.material_mode = e.target.value;
        ui.serialize();
        ui.render();
      }
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-object-lock"]')) {
    btn.addEventListener("click", () => {
      const obj = ui.selectedObject?.();
      if (obj) toggleObjectLock(ui, obj);
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="reconstruction-appearance"]')) {
    el.addEventListener("change", (e) => {
      setReconstructionAppearance(ui, e.target.value);
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="object-color"]')) {
    el.addEventListener("input", (e) => {
      const obj = ui.selectedObject();
      if (obj) {
        if (obj.color !== e.target.value) groupedCheckpoint(ui, `object_color:${obj.id}`, "Change object color");
        obj.color = e.target.value;
        ui.scheduleSerialize();
        ui.render();
      }
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="reference-select"]')) {
    el.addEventListener("change", (e) => {
      if (ui.state.reference_index !== Number(e.target.value)) ui.checkpoint("Change reference");
      ui.state.reference_index = Number(e.target.value);
      ui.serialize();
      ui.loadSelectedReference();
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll("[data-proxy-preset]")) {
    btn.addEventListener("click", () => {
      ui.applyProxyPreset(btn.dataset.proxyPreset);
      ui.closeMenus();
    }, { signal });
  }
  for (const sel of ui.root.querySelectorAll('select[data-role="proxy-preset"]')) {
    sel.addEventListener("change", (e) => {
      ui.applyProxyPreset(e.target.value);
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll("[data-lens]")) {
    btn.addEventListener("click", () => {
      applyCinemaLens(ui, Number(btn.dataset.lens));
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll("[data-blocking-scene]")) {
    btn.addEventListener("click", () => {
      applyBlockingScenePreset(ui, btn.dataset.blockingScene);
      ui.closeMenus();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="show-radar"]')) {
    box.addEventListener("change", (e) => {
      if (ui.state.show_radar !== e.target.checked) ui.checkpoint("Toggle radar");
      ui.state.show_radar = e.target.checked;
      ui.scheduleSerialize();
      ui.render();
      ui.setStatus(`Radar Mini-Map: ${e.target.checked ? "ON" : "OFF"}`);
    }, { signal });
  }
}
