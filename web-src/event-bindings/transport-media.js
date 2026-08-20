// Extracted DOM bindings.

import { clamp } from "../director/core.js";
import { applyCinemaLens } from "../cameras.js";
import { applyBlockingScenePreset } from "../motion-presets.js";
import { onCurveWheel } from "../curve-editor.js";
import { onTimelineWheel } from "../timeline-interaction.js";
import { syncMirroredControl } from "../event-bindings.js";

export function bindTransportAndMedia(ui, q, signal) {
  for (const btn of ui.root.querySelectorAll('[data-act="play"]')) {
    btn.addEventListener("click", () => ui.togglePlay(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="key"]')) {
    btn.addEventListener("click", () => ui.insertKeyframe(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="auto-key"]')) {
    btn.addEventListener("click", () => ui.toggleAutoKey(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="delete-key"]')) {
    btn.addEventListener("click", () => ui.deleteKeyframe(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="copy-key"]')) {
    btn.addEventListener("click", () => ui.copyKeyframe(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="paste-key"]')) {
    btn.addEventListener("click", () => ui.pasteKeyframe(), { signal });
  }
  q('[data-act="key-first"]')?.addEventListener("click", () => ui.setFrame(0), { signal });
  q('[data-act="key-last"]')?.addEventListener("click", () => ui.setFrame(ui.state.duration_frames - 1), { signal });
  q('[data-act="previous-key"]')?.addEventListener("click", () => ui.goToAdjacentKey(-1), { signal });
  q('[data-act="next-key"]')?.addEventListener("click", () => ui.goToAdjacentKey(1), { signal });
  q('[data-act="previous-frame"]')?.addEventListener("click", () => ui.setFrame(ui.frame - 1), { signal });
  q('[data-act="next-frame"]')?.addEventListener("click", () => ui.setFrame(ui.frame + 1), { signal });
  q('[data-act="update-key"]')?.addEventListener("click", () => ui.updateKeyFromView(), { signal });
  q('[data-act="view-key"]')?.addEventListener("click", () => ui.loadSelectedKeyView(), { signal });
  for (const sel of ui.root.querySelectorAll('select[data-role="encoder"]')) {
    sel.addEventListener("change", (e) => {
      ui.state.encoder = e.target.value;
      ui.serialize();
      ui.setStatus(`Encoder: ${e.target.value}`);
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="fit-timeline"]')) {
    btn.addEventListener("click", () => ui.resetTimelineZoom(), { signal });
  }
  for (const btn of ui.root.querySelectorAll("[data-interp]")) {
    btn.addEventListener("click", () => ui.setKeyInterpolation(btn.dataset.interp), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="reset-camera"]')) {
    btn.addEventListener("click", () => ui.resetCamera(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="loop"]')) {
    btn.addEventListener("click", () => ui.toggleLoop(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="range-start"]')) {
    btn.addEventListener("click", () => ui.setPlaybackRange("start"), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="range-end"]')) {
    btn.addEventListener("click", () => ui.setPlaybackRange("end"), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="range-clear"]')) {
    btn.addEventListener("click", () => ui.clearPlaybackRange(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-timecode"]')) {
    btn.addEventListener("click", () => ui.toggleTimecode(), { signal });
  }
  for (const timeEl of ui.root.querySelectorAll('[data-role="time"]')) {
    timeEl.addEventListener("click", () => ui.toggleTimecode(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="toggle-snap"]')) {
    btn.addEventListener("click", () => ui.toggleSnap(), { signal });
  }
  for (const el of ui.root.querySelectorAll('[data-role="snap-frames"]')) {
    el.addEventListener("change", (e) => {
      ui.state.snap_frames = Math.max(1, Math.round(Number(e.target.value) || 1));
      ui.serialize();
      ui.setStatus(`Snap: ${ui.state.snap_frames} frame${ui.state.snap_frames === 1 ? "" : "s"}`);
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="add-camera"]')) {
    btn.addEventListener("click", () => {
      ui.addCamera();
      ui.closeMenus();
    }, { signal });
  }
  for (const recBtn of ui.root.querySelectorAll('[data-act="record"]')) {
    recBtn.addEventListener("click", () => ui.makePlayblast(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="h3-setup"]')) {
    btn.addEventListener("click", () => ui.createH3Setup(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="sync-inputs"]')) {
    btn.addEventListener("click", () => {
      ui.syncUpstreamInputs();
      ui.closeMenus();
    }, { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="load-card"]')) {
    btn.addEventListener("click", () => q('[data-role="file"]')?.click(), { signal });
  }
  for (const btn of ui.root.querySelectorAll('[data-act="add-card"]')) {
    btn.addEventListener("click", () => ui.addMediaCard(), { signal });
  }
  q('[data-role="file"]')?.addEventListener("change", (e) => ui.loadCardFile(e.target.files?.[0]), { signal });
  for (const btn of ui.root.querySelectorAll('[data-act="load-model"]')) {
    btn.addEventListener("click", () => {
      ui.closeMenus();
      q('[data-role="model-file"]')?.click();
    }, { signal });
  }
  q('[data-role="model-file"]')?.addEventListener("change", (e) => {
    ui.loadModelFile(e.target.files?.[0]);
    e.target.value = "";
  }, { signal });
  q('[data-act="load-audio"]')?.addEventListener("click", () => {
    ui.closeMenus();
    q('[data-role="audio-file"]')?.click();
  }, { signal });
  q('[data-role="audio-file"]')?.addEventListener("change", (e) => {
    ui.loadAudioFile(e.target.files?.[0]);
    e.target.value = "";
  }, { signal });
  for (const btn of ui.root.querySelectorAll('[data-act="clear-caches"]')) {
    btn.addEventListener("click", () => {
      ui.clearCaches();
      ui.closeMenus();
    }, { signal });
  }
  for (const button of ui.root.querySelectorAll("[data-object-type]")) {
    button.addEventListener("click", () => {
      ui.addPrimitive(button.dataset.objectType);
      ui.closeMenus();
    }, { signal });
  }
  for (const button of ui.root.querySelectorAll("[data-preset]")) {
    button.addEventListener("click", () => {
      ui.applyCameraPreset(button.dataset.preset);
      ui.closeMenus();
    }, { signal });
  }
  for (const button of ui.root.querySelectorAll("[data-shake]")) {
    button.addEventListener("click", () => {
      ui.applyCameraShake(button.dataset.shake);
      ui.closeMenus();
    }, { signal });
  }
}
