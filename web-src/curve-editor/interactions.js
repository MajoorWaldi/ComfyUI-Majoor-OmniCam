// Pointer and view interactions for the F-Curves editor.

import { clamp, cloneCamera, cloneTransform, sampleCamera, sampleObjectTransform } from "../director/core.js";
import { t } from "../i18n.js";
import { curveChannels } from "../curve-editor.js";

function getCurveCanvasCoords(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.clientWidth / Math.max(1, rect.width);
  const scaleY = (canvas.clientHeight || 180) / Math.max(1, rect.height);
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

export function onCurvePointerDown(ui, event) {
  event.preventDefault();
  event.stopPropagation();
  const canvas = event.currentTarget;
  // stopPropagation above keeps this click from ever reaching the root-level
  // pointerdown listener that focuses ui.root as a fallback (editor-global.js),
  // and the canvas is not a native form control, so without this the Graph
  // Editor never had DOM focus inside the node. Ctrl+Z's global capture
  // listener resolves its target Director from the currently focused element
  // (see installGlobalKeyInterceptor in commands.js) -- with focus stuck
  // outside ui.root, it fell straight through to ComfyUI's own graph-level
  // undo instead of OmniCam's.
  canvas.focus({ preventScroll: true });
  ui.curveHover = null;
  const { x, y } = getCurveCanvasCoords(canvas, event);

  // Pan with Middle Click or Alt + Left Click or Right Click on empty space
  if (event.button === 1 || event.altKey || (event.button === 2 && !ui.curveHitPoints?.some(p => Math.hypot(x - p.x, y - p.y) <= 12))) {
    ui.curvePanDrag = {
      startX: event.clientX,
      startY: event.clientY,
      origPanX: Number(ui.curvePanX) || 0,
      origPanY: Number(ui.curvePanY) || 0,
      pointerId: event.pointerId,
    };
    canvas.setPointerCapture?.(event.pointerId);
    return;
  }

  const hit = (ui.curveHitPoints || [])
    .map((point) => ({ point, distance: Math.hypot(x - point.x, y - point.y) }))
    .sort((a, b) => a.distance - b.distance)[0];

  // Scrub top ruler area
  if (!hit || hit.distance > 12) {
    if (y < 20) {
      const lastFrame = Math.max(1, ui.state.duration_frames - 1);
      const timeSpan = lastFrame / (Number(ui.curveZoomX) || 1.0);
      const timeMin = Number(ui.curvePanX) || 0;
      const targetFrame = Math.round(clamp(timeMin + ((x - 44) / Math.max(1, canvas.clientWidth - 58)) * timeSpan, 0, lastFrame));
      ui.setFrame(targetFrame);
      ui.curveScrub = { pointerId: event.pointerId };
      canvas.setPointerCapture?.(event.pointerId);
      return;
    }

    // Start Box Selection in empty canvas. Shift merges with whatever is
    // already selected -- the same "additive marquee" the viewport and the
    // Timeline/Dope Sheet already support -- instead of always replacing it.
    ui.curveBoxSelect = {
      startX: x, startY: y, currentX: x, currentY: y, pointerId: event.pointerId,
      additive: event.shiftKey,
      initial: new Set(ui.selectedKeyFrames || (ui.selectedKeyFrame !== null ? [ui.selectedKeyFrame] : [])),
    };
    canvas.setPointerCapture?.(event.pointerId);
    return;
  }

  if (hit.point.handle) {
    ui.selectedKeyFrame = hit.point.key.frame;
    ui.editingKeyFrame = null;
    ui.updateKeyVisualState();
    ui.refreshKeyEditor();
  } else if (event.shiftKey) {
    // Add/remove this one key, same toggle the Timeline and Dope Sheet
    // already use for Shift+click -- the Graph Editor was the one place in
    // the app where Shift+click on a key still just replaced the selection.
    ui.selectedKeyFrames = new Set(ui.selectedKeyFrames || [ui.selectedKeyFrame].filter((frame) => frame !== null));
    ui.selectedKeyFrames.has(hit.point.key.frame) ? ui.selectedKeyFrames.delete(hit.point.key.frame) : ui.selectedKeyFrames.add(hit.point.key.frame);
    ui.selectedKeyFrame = ui.selectedKeyFrames.has(hit.point.key.frame) ? hit.point.key.frame : [...ui.selectedKeyFrames].at(-1) ?? null;
    ui.setFrame(hit.point.key.frame);
    ui.updateKeyVisualState();
    ui.refreshKeyEditor();
    return;
  } else {
    ui.selectKeyframe(hit.point.key);
    ui.setFrame(hit.point.key.frame);
  }
  const value = hit.point.object ? hit.point.key.transform : hit.point.key.camera;
  ui.curveDrag = {
    ...hit.point,
    startY: y,
    startX: x,
    startFrame: hit.point.key.frame,
    startValue: hit.point.channel.get(value),
    pointerId: event.pointerId,
    historyCheckpointed: false,
  };
  // Dragging any key of a multi-selection moves the whole selection -- same
  // channel value delta, same frame delta -- the way the Timeline already does.
  if (!hit.point.handle && ui.selectedKeyFrames?.size >= 2 && ui.selectedKeyFrames.has(hit.point.key.frame)) {
    ui.curveDrag.group = ui.timelineKeyframes()
      .filter((k) => ui.selectedKeyFrames.has(k.frame))
      .map((k) => {
        const backing = hit.point.object ? (k.transform || hit.point.object) : (k.camera || k);
        return { key: k, backing, startFrame: k.frame, startValue: hit.point.channel.get(backing) };
      });
  }
  canvas.setPointerCapture?.(event.pointerId);
}

export function onCurvePointerMove(ui, event) {
  const canvas = event.currentTarget;
  const { x, y } = getCurveCanvasCoords(canvas, event);

  // Pan Canvas Move
  if (ui.curvePanDrag && event.pointerId === ui.curvePanDrag.pointerId) {
    event.preventDefault();
    const dx = event.clientX - ui.curvePanDrag.startX;
    const dy = event.clientY - ui.curvePanDrag.startY;
    const lastFrame = Math.max(1, ui.state.duration_frames - 1);
    const timeSpan = lastFrame / (Number(ui.curveZoomX) || 1.0);
    const graphWidth = Math.max(1, canvas.clientWidth - 58);
    const canvasHeight = canvas.clientHeight || 180;
    const graphHeight = Math.max(1, canvasHeight - 38);
    ui.curvePanX = ui.curvePanDrag.origPanX - (dx / graphWidth) * timeSpan;
    ui.curvePanY = ui.curvePanDrag.origPanY + (dy / graphHeight) * 10 / (Number(ui.curveZoom) || 1.0);
    ui.drawCurveEditor();
    return;
  }

  // Scrub Move
  if (ui.curveScrub && event.pointerId === ui.curveScrub.pointerId) {
    event.preventDefault();
    const lastFrame = Math.max(1, ui.state.duration_frames - 1);
    const timeSpan = lastFrame / (Number(ui.curveZoomX) || 1.0);
    const timeMin = Number(ui.curvePanX) || 0;
    const targetFrame = Math.round(clamp(timeMin + ((x - 44) / Math.max(1, canvas.clientWidth - 58)) * timeSpan, 0, lastFrame));
    ui.setFrame(targetFrame);
    return;
  }

  // Box Selection Move
  if (ui.curveBoxSelect && event.pointerId === ui.curveBoxSelect.pointerId) {
    event.preventDefault();
    ui.curveBoxSelect.currentX = x;
    ui.curveBoxSelect.currentY = y;
    const minX = Math.min(ui.curveBoxSelect.startX, x), maxX = Math.max(ui.curveBoxSelect.startX, x);
    const minY = Math.min(ui.curveBoxSelect.startY, y), maxY = Math.max(ui.curveBoxSelect.startY, y);
    const hits = (ui.curveHitPoints || [])
      .filter((p) => !p.handle && p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY)
      .map((p) => p.key.frame);
    const merged = new Set(ui.curveBoxSelect.additive ? ui.curveBoxSelect.initial : []);
    for (const frame of hits) merged.add(frame);
    ui.selectedKeyFrames = merged;
    if (merged.size) ui.selectedKeyFrame = [...merged].at(-1);
    ui.updateKeyVisualState();
    ui.drawCurveEditor();
    return;
  }

  if (!ui.curveDrag || event.pointerId !== ui.curveDrag.pointerId) {
    const hit = (ui.curveHitPoints || [])
      .map((point) => ({ point, distance: Math.hypot(x - point.x, y - point.y) }))
      .sort((a, b) => a.distance - b.distance)[0];

    const lastFrame = Math.max(1, ui.state.duration_frames - 1);
    const timeSpan = lastFrame / (Number(ui.curveZoomX) || 1.0);
    const timeMin = Number(ui.curvePanX) || 0;
    const graphWidth = Math.max(1, canvas.clientWidth - 58);
    const hoverFrame = clamp(Math.round(timeMin + ((x - 44) / graphWidth) * timeSpan), 0, lastFrame);

    let nextHover = null;
    if (hit && hit.distance <= 14) {
      const p = hit.point;
      const backing = p.object ? (p.key.transform || p.object) : (p.key.camera || p.key);
      nextHover = {
        x,
        y,
        frame: p.key.frame,
        channelName: p.channel.name,
        value: p.channel.get(backing),
        isHandle: Boolean(p.handle),
        handleSide: p.handle,
      };
    } else if (y >= 20 && y <= 165 && x >= 44 && x <= canvas.clientWidth - 14) {
      nextHover = { x, y, frame: hoverFrame };
    }

    if (Boolean(ui.curveHover) !== Boolean(nextHover) || (nextHover && (ui.curveHover?.frame !== nextHover.frame || ui.curveHover?.channelName !== nextHover.channelName))) {
      ui.curveHover = nextHover;
      ui.drawCurveEditor();
    }
    return;
  }

  ui.curveHover = null;
  event.preventDefault();
  event.stopPropagation();
  if (!ui.curveDrag.historyCheckpointed) {
    ui.checkpoint?.(ui.curveDrag.handle ? "Edit curve tangent" : "Edit curve");
    ui.curveDrag.historyCheckpointed = true;
  }

  // Tangent Handle Dragging
  if (ui.curveDrag.handle) {
    const key = ui.curveDrag.key;
    const channel = ui.curveDrag.channel;
    const side = ui.curveDrag.handle;
    const pixelPerSegment = ui.curveDrag.pixelPerSegment;
    const valuePerPixel = ui.curveDrag.valuePerPixel;
    const keyX = ui.curveDrag.keyX;
    const keyY = ui.curveDrag.keyY;

    if (key.interpolation !== "bezier") key.interpolation = "bezier";
    if (!key.tangents) key.tangents = { mode: "auto", channels: {} };
    if (!key.tangents.channels) key.tangents.channels = {};

    const existingCh = key.tangents.channels[channel.id] || {};
    const mode = existingCh.mode || (key.tangents.mode === "aligned" ? "aligned" : "free");
    const chTangents = {
      out_x: ui.curveDrag.startHandles.out_x,
      out_y: ui.curveDrag.startHandles.out_y,
      in_x: ui.curveDrag.startHandles.in_x,
      in_y: ui.curveDrag.startHandles.in_y,
      ...existingCh,
      mode,
    };

    if (side === "in") {
      chTangents.in_x = clamp((x - keyX) / Math.max(1, pixelPerSegment), -0.99, -0.01);
      chTangents.in_y = (keyY - y) * valuePerPixel;
      if (mode === "aligned") {
        const lengthIn = Math.hypot(chTangents.in_x, chTangents.in_y) || 1e-6;
        const lengthOut = Math.hypot(ui.curveDrag.startHandles.out_x, ui.curveDrag.startHandles.out_y) || 1e-6;
        chTangents.out_x = (-chTangents.in_x / lengthIn) * lengthOut;
        chTangents.out_y = (-chTangents.in_y / lengthIn) * lengthOut;
      }
    } else {
      chTangents.out_x = clamp((x - keyX) / Math.max(1, pixelPerSegment), 0.01, 0.99);
      chTangents.out_y = (keyY - y) * valuePerPixel;
      if (mode === "aligned") {
        const lengthOut = Math.hypot(chTangents.out_x, chTangents.out_y) || 1e-6;
        const lengthIn = Math.hypot(ui.curveDrag.startHandles.in_x, ui.curveDrag.startHandles.in_y) || 1e-6;
        chTangents.in_x = (-chTangents.out_x / lengthOut) * lengthIn;
        chTangents.in_y = (-chTangents.out_y / lengthOut) * lengthIn;
      }
    }

    key.tangents.channels[channel.id] = chTangents;
    ui.scheduleSerialize();
    ui.camera = sampleCamera(ui.state, ui.frame);
    ui.applyObjectAnimationFrame();
    ui.render();
    ui.drawCurveEditor();
    return;
  }

  // 2D Keyframe Point Dragging (Value & Time)
  const value = ui.curveDrag.maximum - ((y - ui.curveDrag.top) * (ui.curveDrag.maximum - ui.curveDrag.minimum)) / Math.max(1, ui.curveDrag.graphHeight);
  const keyedValue = ui.curveDrag.object ? ui.curveDrag.key.transform : ui.curveDrag.key.camera;

  // Time Retiming (X axis) if dragging horizontally without shift lock
  const timeSpan = ui.curveDrag.lastFrame / (Number(ui.curveZoomX) || 1.0);
  const timeMin = Number(ui.curvePanX) || 0;
  const newFrame = clamp(Math.round(timeMin + ((x - ui.curveDrag.left) / Math.max(1, ui.curveDrag.graphWidth)) * timeSpan), 0, ui.curveDrag.lastFrame);
  const retime = !event.shiftKey && Math.abs(x - ui.curveDrag.startX) > 8;

  if (ui.curveDrag.group) {
    const deltaValue = value - ui.curveDrag.startValue;
    let deltaFrame = retime ? newFrame - ui.curveDrag.startFrame : 0;
    const others = new Set(ui.timelineKeyframes().filter((k) => !ui.selectedKeyFrames.has(k.frame)).map((k) => k.frame));
    // Frame move is all-or-nothing (like the Timeline's shiftKeyframes): if any
    // key would land on an unselected key or collide with another moved key,
    // the whole retime is blocked and only the value delta applies.
    if (deltaFrame) {
      const targets = ui.curveDrag.group.map((entry) => clamp(Math.round(entry.startFrame + deltaFrame), 0, ui.curveDrag.lastFrame));
      const collides = targets.some((f) => others.has(f)) || new Set(targets).size !== targets.length;
      if (collides) deltaFrame = 0;
      else ui.curveDrag.group.forEach((entry, i) => { entry.key.frame = targets[i]; });
    }
    for (const entry of ui.curveDrag.group) {
      ui.curveDrag.channel.set(entry.backing, entry.startValue + deltaValue);
    }
    ui.timelineKeyframes().sort((a, b) => a.frame - b.frame);
    ui.selectedKeyFrames = new Set(ui.curveDrag.group.map((entry) => entry.key.frame));
    ui.selectedKeyFrame = ui.curveDrag.key.frame;
    ui.editingKeyFrame = retime ? null : ui.curveDrag.key.frame;
    ui.frame = ui.curveDrag.key.frame;
  } else {
    ui.curveDrag.channel.set(keyedValue, value);
    if (retime && newFrame !== ui.curveDrag.key.frame) {
      ui.curveDrag.key.frame = newFrame;
      ui.selectedKeyFrame = newFrame;
      ui.frame = newFrame;
    } else {
      ui.editingKeyFrame = ui.curveDrag.key.frame;
      ui.frame = ui.curveDrag.key.frame;
    }
  }

  if (ui.curveDrag.object) {
    const transform = cloneTransform(ui.curveDrag.key.transform);
    ui.curveDrag.object.position = transform.position;
    ui.curveDrag.object.rotation = transform.rotation;
    ui.curveDrag.object.size = transform.size;
  } else {
    const camera = cloneCamera(ui.curveDrag.key.camera);
    ui.camera.position = camera.position;
    ui.camera.target = camera.target;
    ui.camera.fov = camera.fov;
    ui.camera.roll = camera.roll;
    ui.camera.zoom = camera.zoom;
  }
  ui.scheduleSerialize();
  ui.render();
  ui.refreshKeyEditor();
  ui.drawCurveEditor();
}

export function onCurvePointerUp(ui, event) {
  if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  ui.curvePanDrag = null;
  ui.curveScrub = null;
  ui.curveBoxSelect = null;
  if (ui.curveDrag) {
    const cancelled = event.type === "pointercancel" || event.type === "lostpointercapture";
    const checkpointed = ui.curveDrag.historyCheckpointed;
    const keys = ui.timelineKeyframes();
    keys.sort((a, b) => a.frame - b.frame);
    ui.editingKeyFrame = null;
    ui.curveDrag = null;
    if (cancelled && checkpointed) ui.undo?.();
    ui.serialize();
    ui.refreshKeys();
    ui.updateKeyVisualState();
    ui.drawCurveEditor();
  }
}

export function setCurveInterpolation(ui, mode) {
  const key = ui.selectedKeyframe() || ui.timelineKeyframes().find((item) => item.frame === ui.frame);
  if (!key) return ui.setStatus(t("Select a keyframe first"));
  ui.checkpoint("Change interpolation");
  key.interpolation = mode;
  for (const btn of ui.root.querySelectorAll("[data-curve-mode]")) {
    const isMode = btn.dataset.curveMode === mode;
    btn.classList.toggle("active", isMode);
    btn.setAttribute("aria-pressed", String(isMode));
  }
  ui.selectedKeyFrame = key.frame;
  ui.serialize();
  ui.refreshKeys();
  ui.refreshKeyEditor();
  ui.render();
  ui.drawCurveEditor();
  ui.setStatus(t(`${mode.replace("_", " ")} interpolation @ ${key.frame}`));
}

export function setChannelFilter(ui, filter) {
  ui.curveChannelFilter = filter;
  for (const btn of ui.root.querySelectorAll("[data-channel-filter]")) {
    const isFilter = btn.dataset.channelFilter === String(filter);
    btn.classList.toggle("active", isFilter);
    btn.setAttribute("aria-pressed", String(isFilter));
  }
  ui.drawCurveEditor();
  ui.setStatus(filter === "all" ? t("Showing all channels") : t(`Solo channel ${filter}`));
}

export function setTangentMode(ui, mode) {
  const key = ui.selectedKeyframe();
  if (!key || !["auto", "vector", "free", "aligned", "flat"].includes(mode)) return ui.setStatus(t("Select a keyframe first"));
  ui.checkpoint("Change tangent mode");
  if (mode !== "auto" && key.interpolation !== "bezier") key.interpolation = "bezier";
  if (!key.tangents) key.tangents = { mode: "auto", channels: {} };
  key.tangents.mode = mode;
  if (!key.tangents.channels) key.tangents.channels = {};
  const channels = curveChannels(ui);
  for (const ch of channels) {
    if (!key.tangents.channels[ch.id]) key.tangents.channels[ch.id] = { mode };
    else key.tangents.channels[ch.id].mode = mode;
  }
  for (const btn of ui.root.querySelectorAll("[data-tangent-mode]")) {
    const isMode = btn.dataset.tangentMode === mode;
    btn.classList.toggle("active", isMode);
    btn.setAttribute("aria-pressed", String(isMode));
  }
  ui.selectedKeyFrame = key.frame;
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.drawCurveEditor();
  ui.setStatus(t(`Tangent mode: ${mode} @ ${key.frame}`));
}

export function toggleCurveHandles(ui) {
  ui.showCurveHandles = !ui.showCurveHandles;
  for (const button of ui.root.querySelectorAll('[data-act="curve-handles"]')) {
    button.classList.toggle("active", ui.showCurveHandles);
    button.setAttribute("aria-pressed", String(ui.showCurveHandles));
    button.title = t(`${ui.showCurveHandles ? "Hide" : "Show"} Bézier tangent handles`);
  }
  ui.drawCurveEditor();
  ui.setStatus(t(`Bézier handles ${ui.showCurveHandles ? "shown" : "hidden"}`));
}

export function onCurveWheel(ui, event) {
  event.preventDefault();
  event.stopPropagation();
  const factor = event.deltaY < 0 ? 1.18 : 0.85;
  if (event.shiftKey) {
    const lastFrame = Math.max(1, ui.state.duration_frames - 1);
    ui.curvePanX = clamp((Number(ui.curvePanX) || 0) + (event.deltaY > 0 ? 4 : -4), -lastFrame * 0.5, lastFrame);
  } else if (event.altKey) {
    ui.curvePanY = (Number(ui.curvePanY) || 0) + (event.deltaY > 0 ? -1 : 1) / (Number(ui.curveZoom) || 1.0);
  } else if (event.ctrlKey) {
    ui.curveZoomX = clamp((Number(ui.curveZoomX) || 1.0) * factor, 0.2, 30.0);
  } else {
    ui.curveZoom = clamp((Number(ui.curveZoom) || 1.0) * factor, 0.2, 30.0);
    ui.curveZoomX = clamp((Number(ui.curveZoomX) || 1.0) * factor, 0.2, 30.0);
  }
  ui.drawCurveEditor();
  ui.setStatus(t(`Curve zoom: ${(ui.curveZoom * 100).toFixed(0)}%`));
}

export function zoomCurve(ui, factor) {
  ui.curveZoom = clamp((Number(ui.curveZoom) || 1.0) * factor, 0.2, 30.0);
  ui.curveZoomX = clamp((Number(ui.curveZoomX) || 1.0) * factor, 0.2, 30.0);
  ui.drawCurveEditor();
  ui.setStatus(t(`Curve zoom: ${(ui.curveZoom * 100).toFixed(0)}%`));
}

export function onCurveDoubleClick(ui, event) {
  event.preventDefault();
  event.stopPropagation();
  const canvas = event.currentTarget;
  const { x, y } = getCurveCanvasCoords(canvas, event);

  // Top ruler scrub area
  if (y < 20) return;

  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const timeSpan = lastFrame / (Number(ui.curveZoomX) || 1.0);
  const timeMin = Number(ui.curvePanX) || 0;
  const graphWidth = Math.max(1, canvas.clientWidth - 58);
  const targetFrame = clamp(Math.round(timeMin + ((x - 44) / graphWidth) * timeSpan), 0, lastFrame);

  ui.checkpoint?.("Insert keyframe");
  ui.setFrame(targetFrame);
  ui.insertKeyframe();
  ui.selectedKeyFrame = targetFrame;
  ui.selectedKeyFrames = new Set([targetFrame]);
  ui.updateKeyVisualState();
  ui.refreshKeys();
  ui.drawCurveEditor();
  ui.setStatus(t("Keyframe inserted @ F{frame}").replace("{frame}", targetFrame));
}

export function fitCurveView(ui, { selectedOnly = false } = {}) {
  const lastFrame = Math.max(1, (ui.state?.duration_frames ?? 120) - 1);
  const keys = ui.timelineKeyframes() || [];
  const object = ui.timelineObject();
  const channels = curveChannels(ui);

  const selectedFrames = ui.selectedKeyFrames?.size
    ? [...ui.selectedKeyFrames]
    : (ui.selectedKeyFrame != null ? [ui.selectedKeyFrame] : []);
  const hasSelection = selectedFrames.length > 0;
  const targetKeys = (selectedOnly || (hasSelection && selectedFrames.length < keys.length))
    ? keys.filter((k) => selectedFrames.includes(k.frame))
    : keys;

  if (!targetKeys.length) {
    ui.curveZoom = 1.0;
    ui.curveZoomX = 1.0;
    ui.curvePanX = 0;
    ui.curvePanY = 0;
    ui.drawCurveEditor();
    ui.setStatus(t("Curve view fitted"));
    return;
  }

  // Frame range
  const frames = targetKeys.map((k) => k.frame);
  const minFrame = Math.min(...frames);
  const maxFrame = Math.max(...frames);
  const frameSpan = Math.max(1, maxFrame - minFrame);

  if (targetKeys.length < keys.length && frameSpan < lastFrame) {
    const pad = Math.max(2, Math.round(frameSpan * 0.15));
    const targetMin = Math.max(0, minFrame - pad);
    const targetMax = Math.min(lastFrame, maxFrame + pad);
    const targetSpan = Math.max(1, targetMax - targetMin);
    ui.curveZoomX = clamp(lastFrame / targetSpan, 0.2, 30.0);
    ui.curvePanX = targetMin;
  } else {
    ui.curveZoomX = 1.0;
    ui.curvePanX = 0;
  }

  // Values range across active channels
  const values = [];
  for (const key of targetKeys) {
    const backing = object ? (key.transform || object) : (key.camera || key);
    for (const ch of channels) {
      const val = ch.get(backing);
      if (Number.isFinite(val)) values.push(val);
    }
  }

  if (values.length > 0) {
    const vMin = Math.min(...values);
    const vMax = Math.max(...values);
    const vSpan = Math.max(1e-4, vMax - vMin);
    const vMid = (vMin + vMax) / 2;

    const sampleVal = (f) => (object ? sampleObjectTransform(object, f) : sampleCamera(ui.state, f));
    const allValues = [];
    const step = Math.max(1, Math.floor(lastFrame / 40));
    for (let f = 0; f <= lastFrame; f += step) {
      const s = sampleVal(f);
      for (const ch of channels) {
        const val = ch.get(s);
        if (Number.isFinite(val)) allValues.push(val);
      }
    }
    let allMin = Math.min(...allValues);
    let allMax = Math.max(...allValues);
    if (!Number.isFinite(allMin) || !Number.isFinite(allMax)) { allMin = -1; allMax = 1; }
    if (Math.abs(allMax - allMin) < 1e-6) { allMin -= 1; allMax += 1; }
    const padding = (allMax - allMin) * 0.1;
    allMin -= padding;
    allMax += padding;

    const baseSpan = allMax - allMin;
    const baseMid = (allMin + allMax) / 2;

    if (targetKeys.length < keys.length && vSpan < baseSpan * 0.75) {
      const paddedVSpan = vSpan * 1.35;
      ui.curveZoom = clamp(baseSpan / paddedVSpan, 0.2, 30.0);
      ui.curvePanY = vMid - baseMid;
    } else {
      ui.curveZoom = 1.0;
      ui.curvePanY = 0;
    }
  } else {
    ui.curveZoom = 1.0;
    ui.curvePanY = 0;
  }

  ui.drawCurveEditor();
  const label = targetKeys.length < keys.length
    ? t("Fitted to {n} selected keys").replace("{n}", targetKeys.length)
    : t("Curve view fitted");
  ui.setStatus(label);
}

export function resetCurveZoom(ui) {
  fitCurveView(ui);
}
