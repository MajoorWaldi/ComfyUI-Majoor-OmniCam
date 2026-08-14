// Timeline rendering, scrubbing, retiming and key commands; curve editor.

import { clamp, cloneCamera, cloneTransform, resolveHandles, sampleCamera, sampleObjectTransform } from "./omnicam-core.js";
import { t } from "./omnicam-i18n.js";

export function timelineFrameFromEvent(ui, event, box) {
  const rect = box.getBoundingClientRect();
  return Math.round(clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1) * (ui.state.duration_frames - 1));
}

export function onTimelinePointerDown(ui, event) {
  if (event.target.closest?.(".key")) return;
  event.preventDefault();
  event.stopPropagation();
  ui.exitKeyEdit(true);
  const box = event.currentTarget;
  box.focus({ preventScroll: true });
  box.setPointerCapture?.(event.pointerId);
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
  if (ui.boxSelect && event.pointerId === ui.boxSelect.pointerId) {
    event.preventDefault();
    event.stopPropagation();
    const rect = ui.boxSelect.box.getBoundingClientRect();
    const lastFrame = Math.max(1, ui.state.duration_frames - 1);
    const frameAt = (x) => clamp((x / Math.max(1, rect.width)) * lastFrame, 0, lastFrame);
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
  // Grouped key movement with snapping: called from the viewport pointer handler.
  const drag = ui.keyDrag;
  const rect = drag.box.getBoundingClientRect();
  let frame = Math.round(clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1) * (ui.state.duration_frames - 1));
  frame = ui.snapFrame(frame);
  const delta = frame - drag.startPointerFrame;
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

export function refreshKeys(ui) {
  const box = ui.root.querySelector('[data-role="keys"]');
  box.innerHTML = "";
  const object = ui.timelineObject();
  const keys = ui.timelineKeyframes();
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const tickCount = Math.min(12, Math.max(2, Math.floor(box.clientWidth / 80) || 8));
  if (ui.state.playback_range) {
    const range = document.createElement("div");
    range.className = "playback-range";
    range.style.left = `${(100 * ui.state.playback_range[0]) / lastFrame}%`;
    range.style.width = `${(100 * (ui.state.playback_range[1] - ui.state.playback_range[0])) / lastFrame}%`;
    box.appendChild(range);
  }
  for (let index = 0; index <= tickCount; index++) {
    const frame = Math.round((index * lastFrame) / tickCount);
    const tick = document.createElement("span");
    tick.className = "timeline-tick";
    tick.textContent = String(frame);
    tick.style.left = `${(100 * frame) / lastFrame}%`;
    box.appendChild(tick);
  }
  for (const marker of ui.state.markers || []) {
    const element = document.createElement("span");
    element.className = "timeline-marker";
    element.style.left = `${(100 * marker.frame) / lastFrame}%`;
    element.style.setProperty("--marker-color", marker.color);
    element.title = marker.name;
    box.appendChild(element);
  }
  const playhead = document.createElement("span");
  playhead.className = "playhead";
  playhead.style.left = `${(100 * ui.frame) / lastFrame}%`;
  box.appendChild(playhead);
  const selected = ui.selectedKeyFrames || (ui.selectedKeyFrame === null ? new Set() : new Set([ui.selectedKeyFrame]));
  for (const key of keys) {
    const element = document.createElement("button");
    element.type = "button";
    element.className = `key${key.frame === ui.frame ? " at-playhead" : ""}${selected.has(key.frame) ? " selected" : ""}${key.frame === ui.editingKeyFrame ? " editing" : ""}`;
    element.dataset.keyFrame = String(key.frame);
    element.setAttribute("aria-label", t(`${object?.name || "Camera"} keyframe at frame ${key.frame}`));
    element.title = t(`Frame ${key.frame} · ${key.interpolation} · drag to retime`);
    element.style.left = `${(100 * key.frame) / lastFrame}%`;
    const label = document.createElement("span");
    label.className = "key-label";
    label.textContent = String(key.frame);
    element.appendChild(label);
    element.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      element.focus({ preventScroll: true });
      if (event.shiftKey) {
        ui.selectedKeyFrames = new Set(ui.selectedKeyFrames || [ui.selectedKeyFrame].filter((f) => f !== null));
        ui.selectedKeyFrames.has(key.frame) ? ui.selectedKeyFrames.delete(key.frame) : ui.selectedKeyFrames.add(key.frame);
        ui.selectedKeyFrame = key.frame;
        ui.updateKeyVisualState();
        ui.refreshKeyEditor();
        return;
      }
      if (!ui.selectedKeyFrames?.has(key.frame)) ui.selectedKeyFrames = new Set([key.frame]);
      ui.selectedKeyFrame = key.frame;
      const moving = ui.timelineKeyframes().filter((item) => ui.selectedKeyFrames.has(item.frame));
      ui.keyDrag = { key, box, moving: moving.map((item) => ({ key: item, startFrame: item.frame })), startPointerFrame: key.frame };
      ui.setFrame(key.frame, false, false);
    });
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!event.shiftKey) ui.selectedKeyFrames = new Set([key.frame]);
      ui.selectKeyframe(key);
    });
    box.appendChild(element);
  }
  const activeCamera = ui.activeCameraTrack();
  ui.root.querySelector('[data-role="timeline-summary"]').textContent = `${object?.name || activeCamera.name} · ${keys.length} key${keys.length === 1 ? "" : "s"}`;
  ui.root.querySelector('[data-role="camera-summary"]').textContent = `${activeCamera.name} · Key F${ui.selectedKeyFrame ?? ui.frame}`;
  const cameraList = ui.root.querySelector('[data-role="camera-menu-list"]');
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
  ui.refreshCameraSelectors();
  ui.refreshKeyEditor();
  ui.updateEditState();
  ui.drawCurveEditor();
}

export function curveChannels(ui) {
  const group = ui.root.querySelector('[data-role="curve-group"]').value;
  if (ui.timelineObject()) {
    const field = group === "target" ? "rotation" : group === "lens" ? "size" : "position";
    const title = field === "size" ? "Scale" : field[0].toUpperCase() + field.slice(1);
    return [0, 1, 2].map((index) => ({
      name: `${title} ${"XYZ"[index]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][index],
      get: (transform) => transform[field][index],
      set: (transform, value) => {
        transform[field][index] = field === "size" ? Math.max(0.01, value) : value;
      },
    }));
  }
  if (group === "target")
    return [0, 1, 2].map((index) => ({
      name: `Target ${"XYZ"[index]}`,
      color: ["#ef5350", "#53d86a", "#4aa3ef"][index],
      get: (camera) => camera.target[index],
      set: (camera, value) => {
        camera.target[index] = value;
      },
    }));
  if (group === "lens")
    return [
      { name: "FOV", color: "#ef8b3e", get: (camera) => camera.fov, set: (camera, value) => { camera.fov = clamp(value, 5, 150); } },
      { name: "Roll", color: "#43c7db", get: (camera) => camera.roll || 0, set: (camera, value) => { camera.roll = clamp(value, -180, 180); } },
      { name: "Zoom", color: "#66d17a", get: (camera) => camera.zoom || 1, set: (camera, value) => { camera.zoom = Math.max(0.01, value); } },
    ];
  return [0, 1, 2].map((index) => ({
    name: `Position ${"XYZ"[index]}`,
    color: ["#ef5350", "#53d86a", "#4aa3ef"][index],
    get: (camera) => camera.position[index],
    set: (camera, value) => {
      camera.position[index] = value;
    },
  }));
}

export function drawCurveEditor(ui) {
  const canvas = ui.root.querySelector('[data-role="curve-canvas"]');
  const width = canvas.clientWidth;
  const height = 178;
  if (!width) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const object = ui.timelineObject();
  const keys = ui.timelineKeyframes();
  const channels = curveChannels(ui);
  const left = 38, right = 9, top = 12, bottom = 22;
  const graphWidth = Math.max(1, width - left - right);
  const graphHeight = height - top - bottom;
  const lastFrame = Math.max(1, ui.state.duration_frames - 1);
  const sampled = [];
  const sampleStep = Math.max(1, Math.ceil(ui.state.duration_frames / Math.max(80, graphWidth)));
  const sampleValue = (frame) => (object ? sampleObjectTransform(object, frame) : sampleCamera(ui.state, frame));
  for (let frame = 0; frame <= lastFrame; frame += sampleStep) sampled.push({ frame, value: sampleValue(frame) });
  if (sampled[sampled.length - 1]?.frame !== lastFrame) sampled.push({ frame: lastFrame, value: sampleValue(lastFrame) });
  const values = sampled.flatMap((sample) => channels.map((channel) => channel.get(sample.value)));
  let minimum = Math.min(...values);
  let maximum = Math.max(...values);
  if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) {
    minimum = -1;
    maximum = 1;
  }
  if (Math.abs(maximum - minimum) < 1e-6) {
    minimum -= 1;
    maximum += 1;
  }
  const padding = (maximum - minimum) * 0.08;
  minimum -= padding;
  maximum += padding;
  const xFor = (frame) => left + (graphWidth * frame) / lastFrame;
  const yFor = (value) => top + (graphHeight * (maximum - value)) / (maximum - minimum);
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#303030";
  ctx.lineWidth = 1;
  ctx.font = "10px system-ui";
  ctx.fillStyle = "#8e8e8e";
  const tickCount = Math.min(12, Math.max(2, Math.floor(graphWidth / 75)));
  for (let index = 0; index <= tickCount; index++) {
    const frame = Math.round((lastFrame * index) / tickCount);
    const x = xFor(frame);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + graphHeight);
    ctx.stroke();
    ctx.fillText(String(frame), x + 3, height - 6);
  }
  for (let index = 0; index <= 4; index++) {
    const y = top + (graphHeight * index) / 4;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(width - right, y);
    ctx.stroke();
    const value = maximum - ((maximum - minimum) * index) / 4;
    ctx.fillText(value.toFixed(Math.abs(maximum - minimum) < 10 ? 1 : 0), 3, y + 3);
  }
  ui.curveHitPoints = [];
  for (const channel of channels) {
    ctx.strokeStyle = channel.color;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    sampled.forEach((sample, index) => {
      const x = xFor(sample.frame);
      const y = yFor(channel.get(sample.value));
      if (index) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
    for (const key of keys) {
      const value = object ? key.transform : key.camera;
      const x = xFor(key.frame);
      const y = yFor(channel.get(value));
      ctx.fillStyle = key.frame === ui.selectedKeyFrame ? "#ffd75e" : channel.color;
      ctx.strokeStyle = "#111";
      ctx.beginPath();
      ctx.arc(x, y, key.frame === ui.selectedKeyFrame ? 4.5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ui.curveHitPoints.push({ x, y, key, channel, minimum, maximum, graphHeight, object });
    }
    if (ui.showCurveHandles) {
      const selectedIndex = keys.findIndex((key) => key.frame === ui.selectedKeyFrame);
      const selected = keys[selectedIndex];
      if (selected?.interpolation === "bezier") {
        const value = object ? selected.transform : selected.camera;
        const x = xFor(selected.frame);
        const y = yFor(channel.get(value));
        const previous = keys[selectedIndex - 1];
        const next = keys[selectedIndex + 1];
        const keyValue = channel.get(value);
        const prevSpan = Math.max(1, selected.frame - (previous?.frame ?? selected.frame - 1));
        const nextSpan = Math.max(1, (next?.frame ?? selected.frame + 1) - selected.frame);
        const handles = resolveHandles({ frame: selected.frame, value: keyValue, tangents: selected.tangents },
          previous && { frame: previous.frame, value: channel.get(object ? previous.transform : previous.camera) },
          next && { frame: next.frame, value: channel.get(object ? next.transform : next.camera) });
        const valuePerPixel = (maximum - minimum) / Math.max(1, graphHeight);
        // in_x/out_x are fractions of their adjacent segment; convert to pixels.
        const pixelPerSegmentOut = (graphWidth * nextSpan) / lastFrame;
        const pixelPerSegmentIn = (graphWidth * prevSpan) / lastFrame;
        const points = [];
        if (previous) points.push({ side: "in", x: x + handles.in_x * pixelPerSegmentIn, y: y - handles.in_y / valuePerPixel });
        if (next) points.push({ side: "out", x: x + handles.out_x * pixelPerSegmentOut, y: y - handles.out_y / valuePerPixel });
        ctx.strokeStyle = "#d7b8ff";
        ctx.fillStyle = "#241d2d";
        ctx.lineWidth = 1;
        for (const point of points) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ui.curveHitPoints.push({ x: point.x, y: point.y, key: selected, channel, minimum, maximum, graphHeight, object, handle: point.side, prevSpan, nextSpan });
        }
      }
    }
  }
  for (const button of ui.root.querySelectorAll("[data-tangent-mode]")) button.classList.toggle("active", button.dataset.tangentMode === (ui.selectedKeyframe()?.tangents?.mode || "auto"));
  const playheadX = xFor(ui.frame);
  ctx.strokeStyle = "#f2d06b";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(playheadX, top);
  ctx.lineTo(playheadX, top + graphHeight);
  ctx.stroke();
  for (const button of ui.root.querySelectorAll("[data-curve-mode]")) button.classList.toggle("active", button.dataset.curveMode === ui.selectedKeyframe()?.interpolation);
}

export function onCurvePointerDown(ui, event) {
  event.preventDefault();
  event.stopPropagation();
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) * canvas.clientWidth) / Math.max(1, rect.width);
  const y = ((event.clientY - rect.top) * 178) / Math.max(1, rect.height);
  const hit = (ui.curveHitPoints || [])
    .map((point) => ({ point, distance: Math.hypot(x - point.x, y - point.y) }))
    .sort((a, b) => a.distance - b.distance)[0];
  if (!hit || hit.distance > 10) {
    ui.exitKeyEdit(true);
    return ui.setFrame(Math.round(clamp((x - 38) / Math.max(1, rect.width - 47), 0, 1) * (ui.state.duration_frames - 1)));
  }
  ui.selectKeyframe(hit.point.key);
  const value = hit.point.object ? hit.point.key.transform : hit.point.key.camera;
  ui.curveDrag = { ...hit.point, startY: y, startX: x, startValue: hit.point.channel.get(value), pointerId: event.pointerId };
  if (hit.point.handle) ui.curveDrag.startHandles = { ...resolveHandles(
    { frame: hit.point.key.frame, value: ui.curveDrag.startValue, tangents: hit.point.key.tangents },
    null, null) };
  canvas.setPointerCapture?.(event.pointerId);
}

export function onCurvePointerMove(ui, event) {
  if (!ui.curveDrag || event.pointerId !== ui.curveDrag.pointerId) return;
  event.preventDefault();
  event.stopPropagation();
  const rect = event.currentTarget.getBoundingClientRect();
  const x = ((event.clientX - rect.left) * rect.width) / Math.max(1, rect.width);
  const y = ((event.clientY - rect.top) * 178) / Math.max(1, rect.height);
  if (ui.curveDrag.handle) {
    // Dragging a Bézier tangent handle: store normalized offsets on the key.
    const key = ui.curveDrag.key;
    const side = ui.curveDrag.handle;
    const spanFraction = Math.max(1e-6, (side === "in" ? ui.curveDrag.prevSpan : ui.curveDrag.nextSpan) / Math.max(1, ui.state.duration_frames - 1));
    const dx = clamp((x - ui.curveDrag.startX) / Math.max(1, rect.width) / spanFraction, -0.99, 0.99);
    const dy = (ui.curveDrag.startY - y) * ((ui.curveDrag.maximum - ui.curveDrag.minimum) / Math.max(1, ui.curveDrag.graphHeight));
    const tangents = { ...(key.tangents || {}), mode: key.tangents?.mode === "aligned" ? "aligned" : "free" };
    if (side === "in") {
      tangents.in_x = -Math.abs(clamp(dx, -0.99, -0.01));
      tangents.in_y = ui.curveDrag.startHandles.in_y + dy;
      if (tangents.mode === "aligned") {
        const length = Math.hypot(tangents.in_x, tangents.in_y) || 1e-6;
        const outLength = Math.hypot(ui.curveDrag.startHandles.out_x, ui.curveDrag.startHandles.out_y) || 1e-6;
        tangents.out_x = (-tangents.in_x / length) * outLength;
        tangents.out_y = (-tangents.in_y / length) * outLength;
      }
    } else {
      tangents.out_x = Math.abs(clamp(dx, 0.01, 0.99));
      tangents.out_y = ui.curveDrag.startHandles.out_y + dy;
      if (tangents.mode === "aligned") {
        const length = Math.hypot(tangents.out_x, tangents.out_y) || 1e-6;
        const inLength = Math.hypot(ui.curveDrag.startHandles.in_x, ui.curveDrag.startHandles.in_y) || 1e-6;
        tangents.in_x = (-tangents.out_x / length) * inLength;
        tangents.in_y = (-tangents.out_y / length) * inLength;
      }
    }
    key.tangents = tangents;
    ui.scheduleSerialize();
    ui.drawCurveEditor();
    return;
  }
  const value = ui.curveDrag.startValue - ((y - ui.curveDrag.startY) * (ui.curveDrag.maximum - ui.curveDrag.minimum)) / Math.max(1, ui.curveDrag.graphHeight);
  const keyedValue = ui.curveDrag.object ? ui.curveDrag.key.transform : ui.curveDrag.key.camera;
  ui.curveDrag.channel.set(keyedValue, value);
  ui.editingKeyFrame = ui.curveDrag.key.frame;
  ui.frame = ui.curveDrag.key.frame;
  if (ui.curveDrag.object) {
    const transform = cloneTransform(ui.curveDrag.key.transform);
    ui.curveDrag.object.position = transform.position;
    ui.curveDrag.object.rotation = transform.rotation;
    ui.curveDrag.object.size = transform.size;
  } else ui.camera = cloneCamera(ui.curveDrag.key.camera);
  ui.scheduleSerialize();
  ui.refreshKeyEditor();
  ui.updateKeyVisualState();
  ui.render();
  ui.drawCurveEditor();
}

export function onCurvePointerUp(ui, event) {
  if (!ui.curveDrag || event.pointerId !== ui.curveDrag.pointerId) return;
  if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  ui.editingKeyFrame = null;
  ui.curveDrag = null;
  ui.updateKeyVisualState();
  ui.drawCurveEditor();
}

export function setCurveInterpolation(ui, mode) {
  const key = ui.selectedKeyframe() || ui.timelineKeyframes().find((item) => item.frame === ui.frame);
  if (!key) return ui.setStatus(t("Select a keyframe first"));
  ui.checkpoint("Change interpolation");
  key.interpolation = mode;
  ui.selectedKeyFrame = key.frame;
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`${mode.replace("_", " ")} interpolation @ ${key.frame}`));
}

export function setTangentMode(ui, mode) {
  const key = ui.selectedKeyframe();
  if (!key || !["auto", "vector", "free", "aligned"].includes(mode)) return ui.setStatus(t("Select a keyframe first"));
  ui.checkpoint("Change tangent mode");
  if (mode !== "auto" && key.interpolation !== "bezier") key.interpolation = "bezier";
  key.tangents = { ...(key.tangents || {}), mode };
  ui.selectedKeyFrame = key.frame;
  ui.serialize();
  ui.refreshKeys();
  ui.render();
  ui.setStatus(t(`Tangent mode: ${mode} @ ${key.frame}`));
}

export function toggleCurveHandles(ui) {
  ui.showCurveHandles = !ui.showCurveHandles;
  const button = ui.root.querySelector('[data-act="curve-handles"]');
  button.classList.toggle("active", ui.showCurveHandles);
  button.setAttribute("aria-pressed", String(ui.showCurveHandles));
  button.title = t(`${ui.showCurveHandles ? "Hide" : "Show"} Bézier tangent handles`);
  ui.drawCurveEditor();
  ui.setStatus(t(`Bézier handles ${ui.showCurveHandles ? "shown" : "hidden"}`));
}
