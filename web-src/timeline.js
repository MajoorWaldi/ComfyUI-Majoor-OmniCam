// Timeline visual rendering (keyframe diamonds, audio waveform, markers, time ticks, playhead).

import { clamp, cloneCamera, cloneTransform } from "./director/core.js";
import { t } from "./i18n.js";
import { timelinePercentForFrame } from "./timeline-interaction.js";
import { renderDopeRows } from "./dope-sheet-view.js";
import { renderRuler } from "./timeline/ruler.js";
import { renderChannelList } from "./curve-editor/channel-list.js";
import { renderGraphDopeSheet } from "./curve-editor/dope-view.js";
import { refreshGraphTab } from "./curve-editor/tabs.js";
import { renderHealthZones } from "./motion-health/panel.js";

export * from "./timeline-interaction.js";
export * from "./curve-editor.js";

export function refreshKeys(ui) {
  const box = ui.root.querySelector('[data-role="keys"]');
  if (!box) return;
  box.innerHTML = "";
  const object = ui.timelineObject();
  const keys = ui.timelineKeyframes();
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const zoom = clamp(Number(ui.timelineZoom) || 1.0, 0.1, 50.0);
  const pan = Number(ui.timelinePan) || 0;
  const timeSpan = lastFrame / zoom;
  const timeMin = pan;

  if (ui.audioWaveformPeaks && ui.audioWaveformPeaks.length) {
    const canvas = document.createElement("canvas");
    canvas.className = "timeline-waveform";
    canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;opacity:0.35";
    canvas.width = Math.max(1, box.clientWidth || 600);
    canvas.height = Math.max(1, box.clientHeight || 68);
    const ctx = canvas.getContext("2d");
    const peaks = ui.audioWaveformPeaks;
    const w = canvas.width;
    const h = canvas.height;
    const mid = h / 2;
    ctx.fillStyle = "#f2d06b";
    for (let i = 0; i < peaks.length; i++) {
      const peakFrame = (i / (peaks.length - 1)) * lastFrame;
      const x = ((peakFrame - timeMin) / Math.max(1e-6, timeSpan)) * w;
      if (x >= -5 && x <= w + 5) {
        const barH = peaks[i] * (h * 0.85);
        ctx.fillRect(x, mid - barH / 2, Math.max(1, (w / peaks.length) * zoom - 0.5), barH);
      }
    }
    box.appendChild(canvas);
  }

  if (ui.state.playback_range) {
    const range = document.createElement("div");
    range.className = "playback-range";
    const startPct = timelinePercentForFrame(ui, ui.state.playback_range[0]);
    const endPct = timelinePercentForFrame(ui, ui.state.playback_range[1]);
    range.style.left = `${startPct}%`;
    range.style.width = `${Math.max(0, endPct - startPct)}%`;
    box.appendChild(range);
  }

  // Health bands sit under the keys so a flagged stretch is visible where the
  // animator is already looking, not only inside the Health tab.
  renderHealthZones(ui, box);

  for (const marker of ui.state.markers || []) {
    const pct = timelinePercentForFrame(ui, marker.frame);
    if (pct < -5 || pct > 105) continue;
    const element = document.createElement("span");
    element.className = "timeline-marker";
    element.style.left = `${pct}%`;
    element.style.setProperty("--marker-color", marker.color);
    element.title = marker.name;
    box.appendChild(element);
  }

  // Same rail as the derived channel lanes, so all four read alike.
  if (keys.length > 1) {
    const first = timelinePercentForFrame(ui, keys[0].frame);
    const last = timelinePercentForFrame(ui, keys[keys.length - 1].frame);
    const rail = document.createElement("span");
    rail.className = "oc-dope-rail";
    rail.style.left = `${Math.min(first, last)}%`;
    rail.style.width = `${Math.abs(last - first)}%`;
    rail.style.setProperty("--channel-color", "#a78bfa");
    box.appendChild(rail);
  }

  const selected = ui.selectedKeyFrames || (ui.selectedKeyFrame === null ? new Set() : new Set([ui.selectedKeyFrame]));
  for (const key of keys) {
    const pct = timelinePercentForFrame(ui, key.frame);
    if (pct < -5 || pct > 105) continue;
    const element = document.createElement("button");
    element.type = "button";
    element.className = `key${key.frame === ui.frame ? " at-playhead" : ""}${selected.has(key.frame) ? " selected" : ""}${key.frame === ui.editingKeyFrame ? " editing" : ""}`;
    element.dataset.keyFrame = String(key.frame);
    element.dataset.interp = key.interpolation || "ease";
    element.setAttribute("aria-label", t(`${object?.name || "Camera"} keyframe at frame ${key.frame}`));
    element.title = t(`Frame ${key.frame} · ${key.interpolation} · Drag: Retime · Alt+Drag: Duplicate`);
    element.style.left = `${pct}%`;
    const label = document.createElement("span");
    label.className = "key-label";
    label.textContent = String(key.frame);
    element.appendChild(label);
    element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      element.focus({ preventScroll: true });
      if (event.altKey) {
        // Alt + Drag: Duplicate keyframe
        ui.checkpoint("Duplicate keyframe");
        const cloned = object
          ? { frame: key.frame, transform: cloneTransform(key.transform), interpolation: key.interpolation }
          : { frame: key.frame, camera: cloneCamera(key.camera), interpolation: key.interpolation };
        const keysList = ui.timelineKeyframes();
        keysList.push(cloned);
        keysList.sort((a, b) => a.frame - b.frame);
        ui.selectedKeyFrame = cloned.frame;
        ui.selectedKeyFrames = new Set([cloned.frame]);
        ui.keyDrag = { key: cloned, box, isDuplicate: true, moving: [{ key: cloned, startFrame: cloned.frame }], startPointerFrame: key.frame, startClientX: event.clientX, startClientY: event.clientY };
        ui.setFrame(cloned.frame, false, false);
        ui.setStatus(t(`Duplicating key from ${key.frame}...`));
        return;
      }
      if (event.shiftKey) {
        ui.selectedKeyFrames = new Set(ui.selectedKeyFrames || [ui.selectedKeyFrame].filter((f) => f !== null));
        ui.selectedKeyFrames.has(key.frame) ? ui.selectedKeyFrames.delete(key.frame) : ui.selectedKeyFrames.add(key.frame);
        ui.selectedKeyFrame = ui.selectedKeyFrames.has(key.frame) ? key.frame : [...ui.selectedKeyFrames].at(-1) ?? null;
        ui.setFrame(key.frame, false, false);
        ui.updateKeyVisualState();
        ui.refreshKeyEditor();
        return;
      }
      if (!ui.selectedKeyFrames?.has(key.frame)) ui.selectedKeyFrames = new Set([key.frame]);
      ui.selectedKeyFrame = key.frame;
      const moving = ui.timelineKeyframes().filter((item) => ui.selectedKeyFrames.has(item.frame));
      ui.keyDrag = { key, box, moving: moving.map((item) => ({ key: item, startFrame: item.frame })), startPointerFrame: key.frame, startClientX: event.clientX, startClientY: event.clientY };
      ui.setFrame(key.frame, false, false);
    });
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) return;
      if (!event.shiftKey) ui.selectedKeyFrames = new Set([key.frame]);
      ui.selectKeyframe(key);
    });
    box.appendChild(element);
  }
  const activeCamera = ui.activeCameraTrack();
  const summaryEl = ui.root.querySelector('[data-role="timeline-summary"]');
  if (summaryEl) {
    summaryEl.replaceChildren();
    const subject = document.createElement("span");
    subject.style.fontWeight = "700";
    if (ui.selectedEntity === "object" && object) {
      subject.style.color = "#38bdf8";
      subject.textContent = `📦 ${object.name || object.type}`;
      summaryEl.title = t(`Currently animating object: ${object.name || object.type}`);
    } else {
      subject.style.color = "#f59e0b";
      subject.textContent = `🎥 ${activeCamera.name}`;
      summaryEl.title = t(`Currently animating camera: ${activeCamera.name}`);
    }
    summaryEl.append(subject, document.createTextNode(` · ${keys.length} key${keys.length === 1 ? "" : "s"}`));
    // Keys past the end are kept but not drawn, so say so: otherwise shortening
    // the timeline looks like it deleted them, which is what it used to do.
    const dormant = keys.filter((key) => key.frame > ui.state.duration_frames - 1).length;
    if (dormant) {
      const badge = document.createElement("span");
      badge.className = "oc-dormant-keys";
      badge.textContent = ` · ${dormant} beyond end`;
      badge.title = t("Keys past the end of the timeline are kept. Lengthen the shot to reach them again.");
      summaryEl.append(badge);
    }
  }
  const camSummaryEl = ui.root.querySelector('[data-role="camera-summary"]');
  if (camSummaryEl) camSummaryEl.textContent = `${activeCamera.name} · Key F${ui.selectedKeyFrame ?? ui.frame}`;
  const cameraList = ui.root.querySelector('[data-role="camera-menu-list"]');
  if (cameraList) {
    cameraList.innerHTML = "";
    for (const camera of ui.state.cameras) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = camera.id === ui.state.active_camera_id ? "selected" : "";
      const icon = document.createElement("i");
      icon.className = "pi pi-video";
      const label = document.createElement("span");
      label.textContent = `${camera.name} · ${camera.keyframes.length} key${camera.keyframes.length === 1 ? "" : "s"}${camera.id === ui.state.playblast_camera_id ? " · PLAYBLAST" : ""}`;
      button.append(icon, label);
      button.addEventListener("click", () => {
        ui.activateCamera(camera.id);
        ui.closeMenus();
      });
      cameraList.appendChild(button);
    }
  }
  const totalEl = ui.root.querySelector('[data-role="frame-total"]');
  if (totalEl) totalEl.textContent = `/ ${Math.max(1, ui.state.duration_frames)}`;
  const previewTitle = ui.root.querySelector('[data-role="preview-title"]');
  if (previewTitle) previewTitle.textContent = `${activeCamera.name} · ${t("Frame")} ${ui.frame}`;
  const inspectorName = ui.root.querySelector('[data-role="inspector-camera-name"]');
  if (inspectorName) inspectorName.textContent = activeCamera.name;

  renderRuler(ui);
  renderDopeRows(ui);
  renderChannelList(ui);
  renderGraphDopeSheet(ui);
  refreshGraphTab(ui);
  ui.refreshCameraSelectors();
  ui.refreshKeyEditor();
  ui.updateEditState();
  ui.drawCurveEditor();
}
