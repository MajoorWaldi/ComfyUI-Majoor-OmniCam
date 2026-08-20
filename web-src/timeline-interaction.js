// Timeline pointer events, scrubbing, multi-key selection, dragging and retiming for OmniCam Director.

import { clamp } from "./omnicam-core.js";
import { t } from "./omnicam-i18n.js";

export function timelinePercentForFrame(ui, frame) {
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const zoom = clamp(Number(ui.timelineZoom) || 1.0, 0.1, 50.0);
  const pan = Number(ui.timelinePan) || 0;
  const timeSpan = lastFrame / zoom;
  return ((frame - pan) / Math.max(1e-6, timeSpan)) * 100;
}

export function timelineFrameFromEvent(ui, event, box) {
  const rect = box.getBoundingClientRect();
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const zoom = clamp(Number(ui.timelineZoom) || 1.0, 0.1, 50.0);
  const pan = Number(ui.timelinePan) || 0;
  const timeSpan = lastFrame / zoom;
  const rawRatio = (event.clientX - rect.left) / Math.max(1, rect.width);
  return clamp(Math.round(pan + rawRatio * timeSpan), 0, lastFrame);
}

export function onTimelineWheel(ui, event) {
  event.preventDefault();
  event.stopPropagation();
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const factor = event.deltaY < 0 ? 1.18 : 0.85;

  if (event.shiftKey) {
    // Pan horizontally
    ui.timelinePan = clamp((Number(ui.timelinePan) || 0) + (event.deltaY > 0 ? 4 : -4), -lastFrame * 0.5, lastFrame);
  } else {
    // Zoom timeline centered at mouse pointer
    const box = event.currentTarget;
    const rect = box.getBoundingClientRect();
    const mouseRatio = (event.clientX - rect.left) / Math.max(1, rect.width);
    const oldZoom = clamp(Number(ui.timelineZoom) || 1.0, 0.2, 30.0);
    const newZoom = clamp(oldZoom * factor, 0.2, 30.0);
    const oldSpan = lastFrame / oldZoom;
    const newSpan = lastFrame / newZoom;
    const currentPointerFrame = (Number(ui.timelinePan) || 0) + mouseRatio * oldSpan;
    ui.timelinePan = clamp(currentPointerFrame - mouseRatio * newSpan, -lastFrame * 0.5, lastFrame);
    ui.timelineZoom = newZoom;
  }
  ui.refreshKeys();
  ui.setStatus(t(`Timeline zoom: ${(ui.timelineZoom * 100).toFixed(0)}%`));
}

export function resetTimelineZoom(ui) {
  ui.timelineZoom = 1.0;
  ui.timelinePan = 0;
  ui.refreshKeys();
  ui.setStatus(t("Timeline view fitted"));
}

export function onTimelinePointerDown(ui, event) {
  if (event.target.closest?.(".key")) return;
  event.preventDefault();
  event.stopPropagation();
  ui.exitKeyEdit(true);
  const box = event.currentTarget;
  box.focus({ preventScroll: true });
  box.setPointerCapture?.(event.pointerId);

  // Pan with Middle Mouse Button, Alt + Click or Right Click on empty space
  if (event.button === 1 || event.altKey || event.button === 2) {
    ui.timelinePanDrag = {
      startX: event.clientX,
      origPan: Number(ui.timelinePan) || 0,
      pointerId: event.pointerId,
    };
    return;
  }

  // Box selection with Shift + Click on empty space
  if (event.shiftKey) {
    const rect = box.getBoundingClientRect();
    ui.boxSelect = { box, pointerId: event.pointerId, startX: event.clientX - rect.left, currentX: event.clientX - rect.left };
    return;
  }

  ui.selectedKeyFrames = null;
  ui.timelineDrag = { box, pointerId: event.pointerId };
  ui.setFrame(timelineFrameFromEvent(ui, event, box));
}

export function onTimelinePointerMove(ui, event) {
  // Timeline Pan Drag
  if (ui.timelinePanDrag && event.pointerId === ui.timelinePanDrag.pointerId) {
    event.preventDefault();
    event.stopPropagation();
    const dx = event.clientX - ui.timelinePanDrag.startX;
    const box = ui.root.querySelector('[data-role="keys"]');
    const lastFrame = Math.max(1, ui.state.duration_frames - 1);
    const timeSpan = lastFrame / (Number(ui.timelineZoom) || 1.0);
    ui.timelinePan = ui.timelinePanDrag.origPan - (dx / Math.max(1, box.clientWidth)) * timeSpan;
    ui.refreshKeys();
    return;
  }

  // Box Selection
  if (ui.boxSelect && event.pointerId === ui.boxSelect.pointerId) {
    event.preventDefault();
    event.stopPropagation();
    const rect = ui.boxSelect.box.getBoundingClientRect();
    ui.boxSelect.currentX = event.clientX - rect.left;
    let overlay = ui.boxSelect.overlay;
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "box-select";
      ui.boxSelect.box.appendChild(overlay);
      ui.boxSelect.overlay = overlay;
    }
    const left = Math.min(ui.boxSelect.startX, ui.boxSelect.currentX);
    overlay.style.left = `${left}px`;
    overlay.style.width = `${Math.abs(ui.boxSelect.currentX - ui.boxSelect.startX)}px`;
    overlay.style.top = "0";
    overlay.style.bottom = "0";
    return;
  }

  if (!ui.timelineDrag || event.pointerId !== ui.timelineDrag.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  ui.setFrame(timelineFrameFromEvent(ui, event, ui.timelineDrag.box));
}

export function onTimelinePointerUp(ui, event) {
  if (ui.timelinePanDrag && event.pointerId === ui.timelinePanDrag.pointerId) {
    ui.timelinePanDrag = null;
    return;
  }
  if (ui.boxSelect && event.pointerId === ui.boxSelect.pointerId) {
    event.preventDefault();
    event.stopPropagation();
    const rect = ui.boxSelect.box.getBoundingClientRect();
    const lastFrame = Math.max(1, ui.state.duration_frames - 1);
    const zoom = clamp(Number(ui.timelineZoom) || 1.0, 0.1, 50.0);
    const pan = Number(ui.timelinePan) || 0;
    const timeSpan = lastFrame / zoom;
    const frameAt = (x) => clamp(pan + (x / Math.max(1, rect.width)) * timeSpan, 0, lastFrame);
    const from = Math.min(frameAt(ui.boxSelect.startX), frameAt(ui.boxSelect.currentX));
    const to = Math.max(frameAt(ui.boxSelect.startX), frameAt(ui.boxSelect.currentX));
    ui.boxSelect.overlay?.remove();
    ui.boxSelect = null;
    const hits = ui.timelineKeyframes().filter((key) => key.frame >= from && key.frame <= to).map((key) => key.frame);
    if (hits.length) {
      ui.selectedKeyFrames = new Set(hits);
      ui.selectedKeyFrame = hits[0];
      ui.updateKeyVisualState();
      ui.refreshKeyEditor();
      ui.setStatus(t(`${hits.length} keys selected`));
    }
    return;
  }
  if (!ui.timelineDrag || event.pointerId !== ui.timelineDrag.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  if (ui.timelineDrag.box.hasPointerCapture?.(event.pointerId)) ui.timelineDrag.box.releasePointerCapture(event.pointerId);
  ui.timelineDrag = null;
}

export function onKeyDragMove(ui, event) {
  const drag = ui.keyDrag;
  if (!drag) return;
  const rect = drag.box.getBoundingClientRect();
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const zoom = clamp(Number(ui.timelineZoom) || 1.0, 0.1, 50.0);
  const pan = Number(ui.timelinePan) || 0;
  const timeSpan = lastFrame / zoom;
  let frame = Math.round(clamp(pan + ((event.clientX - rect.left) / Math.max(1, rect.width)) * timeSpan, 0, lastFrame));
  frame = ui.snapFrame(frame);
  const delta = frame - drag.startPointerFrame;

  let badge = drag.badge;
  if (!badge) {
    badge = document.createElement("div");
    badge.className = "floating-retime-badge";
    drag.box.appendChild(badge);
    drag.badge = badge;
  }
  const pct = timelinePercentForFrame(ui, frame);
  badge.style.left = `${pct}%`;
  badge.textContent = drag.isDuplicate ? `+Copy F${frame}` : `F${frame}${delta !== 0 ? ` (${delta > 0 ? "+" : ""}${delta})` : ""}`;

  if (drag.moving && drag.moving.length > 1) {
    if (delta === drag.lastDelta) return;
    drag.lastDelta = delta;
    const keys = ui.timelineKeyframes();
    const others = new Set(keys.filter((item) => !ui.selectedKeyFrames.has(item.frame)).map((item) => item.frame));
    for (const entry of drag.moving) {
      let target = clamp(entry.startFrame + delta, 0, ui.state.duration_frames - 1);
      while (others.has(target) && target > 0 && target < ui.state.duration_frames - 1) target += Math.sign(delta || 1);
      entry.key.frame = others.has(target) ? entry.key.frame : target;
    }
    keys.sort((a, b) => a.frame - b.frame);
    ui.editingKeyFrame = drag.key.frame;
    ui.scheduleSerialize();
    ui.setFrame(drag.key.frame, false, true);
    return;
  }
  if (frame !== drag.key.frame) {
    ui.editingKeyFrame = drag.key.frame;
    ui.retimeSelectedKey(frame, true);
  }
}
