// Dedicated 2D motion-path preview for the Motion panel. It draws every motion
// track in shot screen space (normalized 0..1), letterboxed to the shot's
// aspect ratio inside a fixed-height box, so the artist can read trajectories
// without hunting for them in the 3D viewport. Keyframe tracks show their key
// dots; world / object / field tracks are sampled along the timeline and
// reprojected through the camera.
//
// The backing store is sized from the canvas' own client box only -- it never
// writes back to `canvas.style`, so it cannot start a resize / reflow loop with
// the panel scrollbar.

import { nearestMotionLayer } from "./draw.js";
import { projectWorldSource } from "./projection.js";

const WORLD_KINDS = ["world_point", "object_point", "camera_field"];
const SAMPLES = 40;

function keyframePolyline(layer) {
  return (layer.keys || []).map((key) => ({ x: key.x, y: key.y, t: key.time_seconds }));
}

function sampleWorldPolyline(state, layer, durationSeconds) {
  const fps = Math.max(1, Number(state.fps) || 24);
  const width = state.width || 1280;
  const height = state.height || 720;
  const points = [];
  for (let i = 0; i <= SAMPLES; i += 1) {
    const t = (durationSeconds * i) / SAMPLES;
    const projected = projectWorldSource(state, layer.source, t * fps, width, height);
    if (projected) points.push({ x: projected.x, y: projected.y, t });
  }
  return points;
}

function valueAtTime(points, time) {
  if (!points.length) return null;
  if (time <= points[0].t) return points[0];
  if (time >= points[points.length - 1].t) return points[points.length - 1];
  for (let i = 1; i < points.length; i += 1) {
    if (points[i].t >= time) {
      const a = points[i - 1];
      const b = points[i];
      const f = (time - a.t) / Math.max(1e-6, b.t - a.t);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
  }
  return points[points.length - 1];
}

// The letterboxed sub-rectangle (in device pixels) that matches the shot aspect.
function shotBox(canvas, shotW, shotH) {
  const shotAspect = shotW / Math.max(1, shotH);
  const boxAspect = canvas.width / Math.max(1, canvas.height);
  let iw = canvas.width;
  let ih = canvas.height;
  if (boxAspect > shotAspect) iw = ih * shotAspect;
  else ih = iw / shotAspect;
  return { x: (canvas.width - iw) / 2, y: (canvas.height - ih) / 2, w: iw, h: ih };
}

export function renderMotionPreview(ui) {
  const canvas = ui.root.querySelector('[data-role="motion-preview"]');
  if (!canvas) return;
  const panel = canvas.closest("[data-tab-panel]");
  if (panel?.hidden) return; // The tab is not showing -- skip the reprojection cost.

  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const pxW = Math.round(rect.width * dpr);
  const pxH = Math.round(rect.height * dpr);
  if (canvas.width !== pxW) canvas.width = pxW;
  if (canvas.height !== pxH) canvas.height = pxH;

  const context = canvas.getContext("2d");
  if (!context) return;
  const box = shotBox(canvas, ui.state.width || 1280, ui.state.height || 720);
  const mapX = (nx) => box.x + nx * box.w;
  const mapY = (ny) => box.y + ny * box.h;

  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#0b0b0f";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#0f0f14";
  context.fillRect(box.x, box.y, box.w, box.h);

  context.strokeStyle = "rgba(255,255,255,0.06)";
  context.lineWidth = 1;
  for (let i = 1; i < 3; i += 1) {
    context.beginPath();
    context.moveTo(mapX(i / 3), box.y);
    context.lineTo(mapX(i / 3), box.y + box.h);
    context.stroke();
    context.beginPath();
    context.moveTo(box.x, mapY(i / 3));
    context.lineTo(box.x + box.w, mapY(i / 3));
    context.stroke();
  }

  const fps = Math.max(1, Number(ui.state.fps) || 24);
  const durationSeconds = Math.max(1 / fps, (ui.state.duration_frames || 120) / fps);
  const nowT = (ui.frame || 0) / fps;
  let drew = 0;

  for (const layer of ui.state.motion_layers || []) {
    if (layer.enabled === false) continue;
    const isWorld = WORLD_KINDS.includes(layer.source_kind);
    const points = isWorld ? sampleWorldPolyline(ui.state, layer, durationSeconds) : keyframePolyline(layer);
    if (!points.length) continue;
    drew += 1;
    const selected = layer.id === ui.state.selected_motion_layer_id;

    context.strokeStyle = selected ? "#ffcc4d" : "rgba(65,217,197,0.6)";
    context.lineWidth = (selected ? 2.4 : 1.5) * dpr;
    context.beginPath();
    points.forEach((point, index) => {
      const x = mapX(point.x);
      const y = mapY(point.y);
      if (index) context.lineTo(x, y);
      else context.moveTo(x, y);
    });
    context.stroke();

    if (!isWorld) {
      context.fillStyle = selected ? "#ffcc4d" : "#41d9c5";
      for (const point of points) {
        context.beginPath();
        context.arc(mapX(point.x), mapY(point.y), (selected ? 3.4 : 2.4) * dpr, 0, Math.PI * 2);
        context.fill();
      }
    }

    const head = valueAtTime(points, nowT);
    if (head) {
      context.fillStyle = selected ? "#ffcc4d" : "#41d9c5";
      context.strokeStyle = "#fff";
      context.lineWidth = 1.4 * dpr;
      context.beginPath();
      context.arc(mapX(head.x), mapY(head.y), 4.4 * dpr, 0, Math.PI * 2);
      context.fill();
      context.stroke();
    }
  }

  context.strokeStyle = "rgba(255,255,255,0.16)";
  context.lineWidth = 1;
  context.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
  context.restore();

  const empty = ui.root.querySelector('[data-role="motion-preview-empty"]');
  if (empty) empty.hidden = drew > 0;
}

export function bindMotionPreview(ui, signal) {
  const canvas = ui.root.querySelector('[data-role="motion-preview"]');
  if (!canvas) return;
  canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const box = shotBox(canvas, ui.state.width || 1280, ui.state.height || 720);
    const dpr = canvas.width / rect.width;
    const point = {
      x: ((event.clientX - rect.left) * dpr - box.x) / Math.max(1, box.w),
      y: ((event.clientY - rect.top) * dpr - box.y) / Math.max(1, box.h),
    };
    const layer = nearestMotionLayer(ui.state.motion_layers, point, 0.09);
    if (layer) {
      ui.state.selected_motion_layer_id = layer.id;
      ui.render();
    }
  }, { signal });
}
