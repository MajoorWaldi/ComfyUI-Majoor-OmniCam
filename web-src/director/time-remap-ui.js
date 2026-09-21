// Director UI glue for Camera Time Remap / Speed Ramp.
// Pure timing maths lives in camera-time-remap.js; this module only owns DOM,
// undo/serialization and navigation into the Timing graph.

import { t } from "../i18n.js";
import { renderChannelList } from "../curve-editor/channel-list.js";
import { setGraphTab } from "../curve-editor/tabs.js";
import { applyCameraTimeRemap } from "./camera-time-remap.js";

function controls(ui) {
  return {
    group: ui.root.querySelector('[data-role="curve-group"]'),
    wrap: ui.root.querySelector('[data-role="time-remap-controls"]'),
    preset: ui.root.querySelector('[data-role="time-remap-preset"]'),
    strength: ui.root.querySelector('[data-role="time-remap-strength"]'),
    strengthOut: ui.root.querySelector('[data-role="time-remap-strength-out"]'),
    apply: ui.root.querySelector('[data-act="time-remap-apply"]'),
  };
}

export function syncTimeRemapControls(ui) {
  const c = controls(ui);
  if (!c.group || !c.wrap) return;
  // Timing weights belong to camera keys. If an object is being edited, reject
  // the camera-only group rather than silently treating it like Position XYZ.
  if (c.group.value === "timing" && ui.timelineObject?.()) {
    c.group.value = "position";
    ui.setStatus?.(t("Timing remap is camera-only."));
  }
  const active = c.group.value === "timing" && !ui.timelineObject?.();
  c.wrap.hidden = !active;
  c.wrap.style.display = active ? "inline-flex" : "none";
  for (const button of ui.root.querySelectorAll(
    '[data-curve-mode],[data-tangent-mode],[data-act="curve-handles"]',
  )) {
    button.disabled = active;
  }
  if (c.strengthOut && c.strength) c.strengthOut.textContent = `${c.strength.value}%`;
  if (c.strength && c.preset) c.strength.disabled = c.preset.value === "custom";
}

export function applyTimeRemapFromControls(ui) {
  const c = controls(ui);
  const camera = ui.activeCameraTrack?.();
  if (!camera || camera.locked) {
    ui.setStatus?.(camera?.locked ? t("Camera is locked") : t("No active camera"));
    return false;
  }
  const keys = camera.keyframes || [];
  const result = applyCameraTimeRemap(keys, {
    preset: c.preset?.value || "custom",
    strength: (Number(c.strength?.value) || 0) / 100,
  });
  if (!result.ok) {
    const message = result.reason === "needs_timing_anchor"
      ? t("Add an interior camera key for a speed ramp; a two-key move uses segment interpolation.")
      : result.reason === "insufficient_frame_slots"
        ? t("Not enough frame slots to redistribute these keys.")
        : t("Time remap could not be applied.");
    ui.setStatus?.(message);
    return false;
  }

  ui.checkpoint?.("Camera time remap");
  camera.keyframes = result.keys;
  ui.state.keyframes = result.keys;
  // These sliders replay from cached baselines. Once key times change their
  // old baselines are stale and must never resurrect the pre-remap timing.
  ui.smoothingBaseline = null;
  ui.keySimplifyBaseline = null;
  ui.syncActiveCameraTrack?.();
  ui.serialize?.();
  ui.refreshKeys?.();
  ui.refreshKeyEditor?.();
  ui.drawCurveEditor?.();
  ui.setFrame?.(ui.frame, false, false);
  ui.setStatus?.(t("Camera time remap applied."));
  return true;
}

export function bindTimeRemapControls(ui, signal) {
  const c = controls(ui);
  if (!c.wrap) return;
  c.preset?.addEventListener("change", () => syncTimeRemapControls(ui), { signal });
  c.strength?.addEventListener("input", () => syncTimeRemapControls(ui), { signal });
  c.apply?.addEventListener("click", () => applyTimeRemapFromControls(ui), { signal });
  syncTimeRemapControls(ui);
}

export function openTimingEditor(ui) {
  const c = controls(ui);
  if (!c.group) return false;
  if (ui.timelineObject?.()) {
    ui.setStatus?.(t("Timing remap is camera-only."));
    return false;
  }
  setGraphTab(ui, "curves");
  c.group.value = "timing";
  c.group.dispatchEvent(new Event("change", { bubbles: true }));
  renderChannelList(ui);
  syncTimeRemapControls(ui);
  ui.drawCurveEditor?.();
  ui.setStatus?.(t("Inspecting camera timing."));
  return true;
}
