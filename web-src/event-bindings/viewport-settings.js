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
  for (const el of ui.root.querySelectorAll('[data-role="camera-fov"]')) {
    const handler = (e) => {
      const val = clamp(Number(e.target.value), 5, 150);
      ui.activeCameraTrack().keyframes.length && ui.activeKeyframe() ? (ui.activeKeyframe().camera.fov = val, ui.scheduleSerialize(), ui.render(), ui.refreshKeyEditor()) : (ui.camera.fov = val, ui.render());
      for (const o of ui.root.querySelectorAll('[data-role="camera-fov"]')) o.value = String(val);
    };
    el.addEventListener("input", handler, { signal });
    el.addEventListener("change", handler, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="camera-roll"]')) {
    const handler = (e) => {
      const val = clamp(Number(e.target.value), -180, 180);
      ui.activeCameraTrack().keyframes.length && ui.activeKeyframe() ? (ui.activeKeyframe().camera.roll = val, ui.scheduleSerialize(), ui.render(), ui.refreshKeyEditor()) : (ui.camera.roll = val, ui.render());
      for (const o of ui.root.querySelectorAll('[data-role="camera-roll"]')) o.value = String(val);
    };
    el.addEventListener("input", handler, { signal });
    el.addEventListener("change", handler, { signal });
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
        ui.activeKeyframe().interpolation = e.target.value;
        ui.scheduleSerialize();
        ui.render();
      }
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="point-density"]')) {
    box.addEventListener("change", (e) => {
      ui.state.point_density = e.target.value;
      ui.scheduleSerialize();
      ui.render();
      ui.setStatus(`Point density: ${e.target.value}`);
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="point-color"]')) {
    box.addEventListener("input", (e) => {
      ui.state.point_color = e.target.value;
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="point-spread"]')) {
    box.addEventListener("change", (e) => {
      ui.state.point_spread = e.target.value;
      ui.scheduleSerialize();
      ui.render();
      ui.setStatus(`Point spread: ${e.target.value}`);
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="card-fit"]')) {
    box.addEventListener("change", (e) => {
      ui.state.card_fit = e.target.value;
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="speed-heatmap"]')) {
    box.addEventListener("change", (e) => {
      ui.state.speed_heatmap = e.target.checked;
      syncMirroredControl(ui.root, "speed-heatmap", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="playblast-grid"]')) {
    box.addEventListener("change", (e) => {
      ui.state.playblast_grid = e.target.checked;
      syncMirroredControl(ui.root, "playblast-grid", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="playblast-resolution"]')) {
    box.addEventListener("change", (e) => {
      ui.state.playblast_resolution = e.target.value;
      syncMirroredControl(ui.root, "playblast-resolution", e.target);
      ui.scheduleSerialize();
    }, { signal });
  }
  for (const button of ui.root.querySelectorAll('[data-act="reset-bg-color"]')) {
    button.addEventListener("click", () => {
      // Back to the default colour, which is what lets the studio sky show again.
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
      ui.state.show_wireframe = e.target.checked;
      syncMirroredControl(ui.root, "show-wireframe", e.target, "checked");
      ui.scheduleSerialize();
      if (ui.webgl) ui.webgl.sceneKey = "";
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="show-vertices"]')) {
    box.addEventListener("change", (e) => {
      ui.state.show_vertices = e.target.checked;
      syncMirroredControl(ui.root, "show-vertices", e.target, "checked");
      ui.scheduleSerialize();
      if (ui.webgl) ui.webgl.sceneKey = "";
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="burn-in"]')) {
    box.addEventListener("change", (e) => {
      ui.state.burn_in = e.target.checked;
      syncMirroredControl(ui.root, "burn-in", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="guides"]')) {
    box.addEventListener("change", (e) => {
      ui.state.guides = e.target.checked;
      syncMirroredControl(ui.root, "guides", e.target, "checked");
      ui.scheduleSerialize();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="safe-areas"]')) {
    box.addEventListener("change", (e) => {
      ui.state.safe_areas = e.target.checked;
      syncMirroredControl(ui.root, "safe-areas", e.target, "checked");
      ui.scheduleSerialize();
      ui.renderCameraView();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="resolution-gate"]')) {
    box.addEventListener("change", (e) => {
      ui.state.resolution_gate = e.target.checked;
      syncMirroredControl(ui.root, "resolution-gate", e.target, "checked");
      ui.scheduleSerialize();
      ui.renderCameraView();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="aspect-ratio"]')) {
    box.addEventListener("change", (e) => {
      ui.state.aspect_ratio = e.target.value;
      syncMirroredControl(ui.root, "aspect-ratio", e.target);
      ui.scheduleSerialize();
      ui.renderCameraView();
      ui.render();
    }, { signal });
  }
  for (const box of ui.root.querySelectorAll('[data-role="viewport-bg-color"]')) {
    const handler = (e) => {
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
        obj.material_mode = e.target.value;
        ui.serialize();
        ui.render();
      }
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="object-color"]')) {
    el.addEventListener("input", (e) => {
      const obj = ui.selectedObject();
      if (obj) {
        obj.color = e.target.value;
        ui.scheduleSerialize();
        ui.render();
      }
    }, { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="reference-select"]')) {
    el.addEventListener("change", (e) => {
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
      ui.state.show_radar = e.target.checked;
      ui.scheduleSerialize();
      ui.render();
      ui.setStatus(`Radar Mini-Map: ${e.target.checked ? "ON" : "OFF"}`);
    }, { signal });
  }
}
