// 2D Canvas fallback renderer and composition overlays (Grid, Safe Areas, Rule of Thirds, Burn-In, Speed Map, Camera Paths) for OmniCam Director.

import { add, clamp, generatePointField, length, project, sampleCamera, sampleObjectWorldTransform, sub, worldTransform } from "./director/core.js";
import { labelAnchorWorld, labelText, sanitizeLabelSettings, shouldShowLabel } from "./assets/labels.js";
import { drawResolutionGate } from "./viewport/resolution-gate.js";
import { drawTopDownRadar } from "./viewport/minimap.js";

// Viewport Labels are normally a DOM layer that hides itself during a capture
// (design spec section 14). With `playblast_labels` on, this paints the same
// labels straight onto the 2D canvas the playblast records.
export function drawPlayblastLabels(ui) {
  const settings = sanitizeLabelSettings(ui.state?.metadata?.viewport_labels);
  if (settings.mode === "off") return;
  const objects = Array.isArray(ui.state?.objects) ? ui.state.objects : [];
  const camera = ui.viewportCamera();
  const c = ui.ctx;
  const w = ui.canvas.width;
  const h = ui.canvas.height;
  const scale = clamp(h / 720, 0.75, 4);
  const frame = Number(ui.frame) || 0;
  const selected = ui.selectedObjectIds instanceof Set ? ui.selectedObjectIds : new Set();

  c.save();
  c.font = `${Math.round(12 * scale)}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
  c.textBaseline = "alphabetic";
  for (const object of objects) {
    if (object.enabled === false) continue;
    if (!shouldShowLabel(object, { mode: settings.mode, selectedIds: selected })) continue;
    const text = labelText(object, settings.content);
    if (!text) continue;
    const transform = sampleObjectWorldTransform(objects, object, frame)
      || { position: object.position, size: object.size };
    const projected = project(labelAnchorWorld(transform, object.type), camera, w, h);
    if (!projected) continue;
    const [px, py] = projected;
    const accent = settings.content === "annotation" ? object.annotation?.color || "" : "";
    const padX = 6 * scale;
    const padY = 4 * scale;
    const textW = c.measureText(text).width;
    const boxW = textW + padX * 2;
    const boxH = 12 * scale + padY * 2;
    const bx = Math.round(px - boxW / 2);
    const by = Math.round(py - boxH - 6 * scale);
    c.fillStyle = "rgba(16,17,22,0.82)";
    _roundRect(c, bx, by, boxW, boxH, 4 * scale);
    c.fill();
    if (accent) {
      c.strokeStyle = accent;
      c.lineWidth = Math.max(1, scale);
      c.stroke();
    }
    c.fillStyle = accent || "#e6e6ec";
    c.fillText(text, bx + padX, by + boxH - padY - 2 * scale);
  }
  c.restore();
}

function _roundRect(c, x, y, width, height, radius) {
  if (typeof c.roundRect === "function") {
    c.beginPath();
    c.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + width, y, x + width, y + height, r);
  c.arcTo(x + width, y + height, x, y + height, r);
  c.arcTo(x, y + height, x, y, r);
  c.arcTo(x, y, x + width, y, r);
  c.closePath();
}

export function drawLine3D(ui, a, b, color = "#5a5a5a", width = 1) {
  const camera = ui.viewportCamera();
  const pa = project(a, camera, ui.canvas.width, ui.canvas.height);
  const pb = project(b, camera, ui.canvas.width, ui.canvas.height);
  if (!pa || !pb) return;
  ui.ctx.strokeStyle = color;
  ui.ctx.lineWidth = width;
  ui.ctx.beginPath();
  ui.ctx.moveTo(pa[0], pa[1]);
  ui.ctx.lineTo(pb[0], pb[1]);
  ui.ctx.stroke();
}

export function drawGrid(ui) {
  for (let i = -60; i <= 60; i += 1) {
    const major = i === 0;
    const c = major ? "#6f6f6f" : "#353535";
    drawLine3D(ui, [i, 0, -60], [i, 0, 60], c, major ? 1.6 : 1);
    drawLine3D(ui, [-60, 0, i], [60, 0, i], c, major ? 1.6 : 1);
  }
}

// The point field's geometry depends only on density, spread and colour --
// never on the camera or the frame -- so generate it once and reuse it until
// one of those three changes.
function pointFieldFor(ui) {
  const density = ui.state.point_density || "balanced";
  const spread = ui.state.point_spread || "all_views";
  const color = ui.state.point_color || null;
  const key = `${density}|${spread}|${color}`;
  if (ui._pointFieldCache?.key !== key) {
    ui._pointFieldCache = { key, ...generatePointField(density, spread, color) };
  }
  return ui._pointFieldCache;
}

// This 2D path runs on GPUs with no WebGL at all; an 1800- or 3500-point field
// is thousands of individual fillStyle / beginPath / arc / fill calls there.
// Cap what the fallback draws and batch the survivors by colour + radius so a
// state change and a path flush happen a handful of times, not once per point.
const FALLBACK_MAX_POINTS = 600;

export function drawPointField(ui) {
  const { points, colors } = pointFieldFor(ui);
  if (!points.length) return;
  const camera = ui.viewportCamera();
  const width = ui.canvas.width, height = ui.canvas.height;
  const total = points.length / 3;
  const stride = 3 * Math.max(1, Math.ceil(total / FALLBACK_MAX_POINTS));
  const buckets = new Map();
  for (let i = 0; i < points.length; i += stride) {
    const p = project([points[i], points[i + 1], points[i + 2]], camera, width, height);
    if (!p) continue;
    const radius = clamp(Math.round(5 / Math.sqrt(p[2])), 1, 4);
    const key = `${Math.round(colors[i] * 255)},${Math.round(colors[i + 1] * 255)},${Math.round(colors[i + 2] * 255)}|${radius}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { fill: `rgb(${key.slice(0, key.indexOf("|"))})`, radius, xs: [], ys: [] };
      buckets.set(key, bucket);
    }
    bucket.xs.push(p[0]);
    bucket.ys.push(p[1]);
  }
  for (const bucket of buckets.values()) {
    ui.ctx.fillStyle = bucket.fill;
    ui.ctx.beginPath();
    for (let j = 0; j < bucket.xs.length; j += 1) {
      ui.ctx.moveTo(bucket.xs[j] + bucket.radius, bucket.ys[j]);
      ui.ctx.arc(bucket.xs[j], bucket.ys[j], bucket.radius, 0, Math.PI * 2);
    }
    ui.ctx.fill();
  }
}

export function drawCube(ui, obj) {
  const [sx, sy, sz] = obj.size || [1, 1, 1];
  const [x, y, z] = obj.position || [0, 0, 0];
  const pts = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ].map((p) => [x + (p[0] * sx) / 2, y + (p[1] * sy) / 2, z + (p[2] * sz) / 2]);
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  for (const [a, b] of edges) drawLine3D(ui, pts[a], pts[b], "#a0a0a0", 1.4);
}

export function drawSphere(ui, obj) {
  const [sx] = obj.size || [1.5];
  const [x, y, z] = obj.position || [0, 1, 0];
  const r = sx / 2;
  for (let axis = 0; axis < 3; axis++) {
    let prev = null;
    for (let i = 0; i <= 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      let p;
      if (axis === 0) p = [x + Math.cos(a) * r, y + Math.sin(a) * r, z];
      else if (axis === 1) p = [x + Math.cos(a) * r, y, z + Math.sin(a) * r];
      else p = [x, y + Math.cos(a) * r, z + Math.sin(a) * r];
      if (prev) drawLine3D(ui, prev, p, "#999", 1);
      prev = p;
    }
  }
}

export function drawHuman(ui, obj) {
  const [x, y, z] = obj.position || [0, 0, 0];
  const h = obj.size?.[1] || 1.8;
  const w = (obj.size?.[0] || 0.7) * 0.5;
  const head = [x, y + h * 0.88, z];
  const neck = [x, y + h * 0.76, z];
  const shoulderL = [x - w * 0.55, y + h * 0.73, z];
  const shoulderR = [x + w * 0.55, y + h * 0.73, z];
  const elbowL = [x - w * 0.72, y + h * 0.52, z];
  const elbowR = [x + w * 0.72, y + h * 0.52, z];
  const handL = [x - w * 0.82, y + h * 0.34, z];
  const handR = [x + w * 0.82, y + h * 0.34, z];
  const hip = [x, y + h * 0.44, z];
  const hipL = [x - w * 0.28, y + h * 0.44, z];
  const hipR = [x + w * 0.28, y + h * 0.44, z];
  const kneeL = [x - w * 0.28, y + h * 0.22, z];
  const kneeR = [x + w * 0.28, y + h * 0.22, z];
  const footL = [x - w * 0.28, y, z + 0.05];
  const footR = [x + w * 0.28, y, z + 0.05];

  // Head & spine
  drawLine3D(ui, head, neck, "#aaa", 2);
  drawLine3D(ui, neck, hip, "#aaa", 2);
  // Shoulders & arms
  drawLine3D(ui, shoulderL, shoulderR, "#aaa", 2);
  drawLine3D(ui, shoulderL, elbowL, "#aaa", 2);
  drawLine3D(ui, elbowL, handL, "#aaa", 2);
  drawLine3D(ui, shoulderR, elbowR, "#aaa", 2);
  drawLine3D(ui, elbowR, handR, "#aaa", 2);
  // Pelvis & legs
  drawLine3D(ui, hipL, hipR, "#aaa", 2);
  drawLine3D(ui, hipL, kneeL, "#aaa", 2);
  drawLine3D(ui, kneeL, footL, "#aaa", 2);
  drawLine3D(ui, hipR, kneeR, "#aaa", 2);
  drawLine3D(ui, kneeR, footR, "#aaa", 2);

  const p = project(head, ui.viewportCamera(), ui.canvas.width, ui.canvas.height);
  if (p) {
    ui.ctx.strokeStyle = "#aaa";
    ui.ctx.beginPath();
    ui.ctx.arc(p[0], p[1], clamp(28 / p[2], 3, 12), 0, Math.PI * 2);
    ui.ctx.stroke();
  }
}

export function drawCylinder(ui, obj) {
  const [x, y, z] = obj.position || [0, 0, 0];
  const [sx, sy, sz] = obj.size || [1.5, 1.5, 1.5];
  const rx = sx * 0.5;
  const rz = (sz || sx) * 0.5;
  const hy = sy * 0.5;
  const segments = 12;
  const topPts = [];
  const botPts = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const px = Math.cos(angle) * rx;
    const pz = Math.sin(angle) * rz;
    topPts.push([x + px, y + hy, z + pz]);
    botPts.push([x + px, y - hy, z + pz]);
  }
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    drawLine3D(ui, topPts[i], topPts[next], "#aaa", 1.5);
    drawLine3D(ui, botPts[i], botPts[next], "#aaa", 1.5);
  }
  for (let i = 0; i < segments; i += 3) {
    drawLine3D(ui, topPts[i], botPts[i], "#aaa", 1.5);
  }
}

export function drawTorus(ui, obj) {
  const [x, y, z] = obj.position || [0, 0, 0];
  const [sx, sy, sz] = obj.size || [1.5, 1.5, 1.5];
  const rMajor = sx * 0.5;
  const rMinor = sx * 0.18;
  const segments = 16;
  const outerPts = [];
  const innerPts = [];
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    outerPts.push([x + cosA * (rMajor + rMinor), y, z + sinA * (rMajor + rMinor)]);
    innerPts.push([x + cosA * (rMajor - rMinor), y, z + sinA * (rMajor - rMinor)]);
  }
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    drawLine3D(ui, outerPts[i], outerPts[next], "#aaa", 1.5);
    drawLine3D(ui, innerPts[i], innerPts[next], "#aaa", 1.5);
    if (i % 4 === 0) {
      drawLine3D(ui, outerPts[i], innerPts[i], "#888", 1);
    }
  }
}

export function drawNull(ui, obj) {
  const p = obj.position || [0, 1, 0];
  const s = 0.25;
  drawLine3D(ui, add(p, [-s, 0, 0]), add(p, [s, 0, 0]), "#bbb", 2);
  drawLine3D(ui, add(p, [0, -s, 0]), add(p, [0, s, 0]), "#bbb", 2);
  drawLine3D(ui, add(p, [0, 0, -s]), add(p, [0, 0, s]), "#bbb", 2);
}

export function drawCard(ui, obj) {
  const [x, y, z] = obj.position || [0, 1.5, 0];
  const [w, h] = obj.size || [2, 3];
  const camera = ui.viewportCamera();
  const corners = [
    [x - w / 2, y - h / 2, z],
    [x + w / 2, y - h / 2, z],
    [x + w / 2, y + h / 2, z],
    [x - w / 2, y + h / 2, z],
  ].map((p) => project(p, camera, ui.canvas.width, ui.canvas.height));
  if (corners.some((p) => !p)) return;
  const xs = corners.map((p) => p[0]);
  const ys = corners.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  ui.ctx.save();
  ui.ctx.beginPath();
  ui.ctx.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < 4; i++) ui.ctx.lineTo(corners[i][0], corners[i][1]);
  ui.ctx.closePath();
  ui.ctx.clip();
  const media = ui.cardMediaById.get(obj.id) || (obj.id === "subject" ? ui.cardMedia : null);
  if (media) {
    try {
      const dw = Math.max(1, maxX - minX);
      const dh = Math.max(1, maxY - minY);
      const sw = media.videoWidth || media.naturalWidth || media.width;
      const sh = media.videoHeight || media.naturalHeight || media.height;
      const fit = ui.state.card_fit || "contain";
      ui.ctx.fillStyle = "#111";
      ui.ctx.fillRect(minX, minY, dw, dh);
      if (fit === "stretch" || !sw || !sh) {
        ui.ctx.drawImage(media, minX, minY, dw, dh);
      } else if (fit === "contain") {
        const scale = Math.min(dw / sw, dh / sh);
        const w2 = sw * scale;
        const h2 = sh * scale;
        ui.ctx.drawImage(media, minX + (dw - w2) / 2, minY + (dh - h2) / 2, w2, h2);
      } else {
        const scale = Math.max(dw / sw, dh / sh);
        const cropW = dw / scale;
        const cropH = dh / scale;
        ui.ctx.drawImage(media, (sw - cropW) / 2, (sh - cropH) / 2, cropW, cropH, minX, minY, dw, dh);
      }
    } catch (_) {}
  } else {
    ui.ctx.fillStyle = "#3a414b";
    ui.ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    ui.ctx.fillStyle = "#d8d8d8";
    ui.ctx.textAlign = "center";
    ui.ctx.font = `${Math.max(12, Math.min(28, (maxX - minX) * 0.08))}px system-ui`;
    ui.ctx.fillText("SUBJECT CARD", (minX + maxX) / 2, (minY + maxY) / 2);
  }
  ui.ctx.restore();
  ui.ctx.strokeStyle = "#b3b8c1";
  ui.ctx.lineWidth = 2;
  ui.ctx.beginPath();
  ui.ctx.moveTo(corners[0][0], corners[0][1]);
  for (let i = 1; i < 4; i++) ui.ctx.lineTo(corners[i][0], corners[i][1]);
  ui.ctx.closePath();
  ui.ctx.stroke();
}

export function drawCameraPath(ui) {
  const cameraColors = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
  (ui.state.cameras || []).forEach((camera, camIdx) => {
    const keys = camera.keyframes || [];
    const color = camera.color || cameraColors[camIdx % cameraColors.length];
    const isActive = camera.id === ui.state.active_camera_id;
    // Through its own lens the active camera's trajectory just paints over the
    // shot; the WebGL path does the same. Other cameras still draw.
    if (isActive && ui.state.view_mode === "camera") return;
    if (keys.length >= 2) {
      for (let i = 0; i < keys.length - 1; i++) {
        drawLine3D(ui, keys[i].camera.position, keys[i + 1].camera.position, color, isActive ? 2.2 : 1.2);
      }
    }
    for (const k of keys) {
      const p = project(k.camera.position, ui.viewportCamera(), ui.canvas.width, ui.canvas.height);
      if (p) {
        ui.ctx.fillStyle = k.frame === ui.frame ? "#f2d06b" : color;
        ui.ctx.beginPath();
        ui.ctx.arc(p[0], p[1], isActive ? 4.5 : 3.5, 0, Math.PI * 2);
        ui.ctx.fill();
      }
    }
    if (ui.state.view_mode !== "camera") {
      const live = sampleCamera(camera, ui.frame, ui.state.objects);
      const p = project(live.position, ui.viewportCamera(), ui.canvas.width, ui.canvas.height);
      if (p) {
        ui.ctx.fillStyle = isActive ? "#f2d06b" : color;
        ui.ctx.beginPath();
        ui.ctx.arc(p[0], p[1], isActive ? 6.5 : 4.5, 0, Math.PI * 2);
        ui.ctx.fill();
      }
      if (live.target) drawLine3D(ui, live.position, live.target, `${color}88`, 1);
    }
  });
}

export function drawSpeedHeatmap(ui) {
  if (ui.state.keyframes.length < 2) return;
  const speeds = [];
  for (let index = 0; index < ui.state.keyframes.length - 1; index++) {
    const a = ui.state.keyframes[index];
    const b = ui.state.keyframes[index + 1];
    speeds.push((length(sub(b.camera.position, a.camera.position)) * ui.state.fps) / Math.max(1, b.frame - a.frame));
  }
  const maximum = Math.max(...speeds, 1e-6);
  for (let index = 0; index < speeds.length; index++) {
    const hue = 120 * (1 - speeds[index] / maximum);
    drawLine3D(ui, ui.state.keyframes[index].camera.position, ui.state.keyframes[index + 1].camera.position, `hsl(${hue} 85% 55%)`, 5);
  }
}

export function drawOverlays(ui) {
  const c = ui.ctx;
  const w = ui.canvas.width;
  const h = ui.canvas.height;
  if (!ui.recording && ui.state.view_mode === "camera" && ui.state.guides !== false) {
    c.save();
    c.strokeStyle = "#ffffff33";
    c.lineWidth = 1;
    c.beginPath();
    // Rule of Thirds
    for (const x of [w / 3, (2 * w) / 3]) {
      c.moveTo(x, 0);
      c.lineTo(x, h);
    }
    for (const y of [h / 3, (2 * h) / 3]) {
      c.moveTo(0, y);
      c.lineTo(w, y);
    }
    // Center Crosshair
    c.moveTo(w / 2 - 14, h / 2);
    c.lineTo(w / 2 + 14, h / 2);
    c.moveTo(w / 2, h / 2 - 14);
    c.lineTo(w / 2, h / 2 + 14);
    c.stroke();
    c.restore();
  }
  // Safe Areas (90% Action Safe, 80% Title Safe)
  if (!ui.recording && ui.state.view_mode === "camera" && ui.state.safe_areas) {
    c.save();
    c.strokeStyle = "#00d2d388";
    c.lineWidth = 1;
    c.setLineDash([4, 4]);
    // 90% Action Safe
    c.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);
    // 80% Title Safe
    c.strokeStyle = "#feca5788";
    c.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
    c.restore();
  }
  // The render-area mask, shared with the camera preview tiles so the two
  // can never disagree about what will actually be rendered.
  if (!ui.recording && ui.state.view_mode === "camera") drawResolutionGate(c, ui.state, w, h);
  if (!ui.recording && ui.state.show_gizmo) {
    try { ui.drawTransformGizmo(); } catch (err) { console.warn("[OmniCam Gizmo Error]", err); }
  }
  if (!ui.recording && ui.boxSelection) {
    const { start, current } = ui.boxSelection;
    c.save(); c.fillStyle = "rgba(74,163,239,.14)"; c.strokeStyle = "#4aa3ef"; c.lineWidth = 1.5; c.setLineDash([6, 4]);
    c.fillRect(start[0], start[1], current[0] - start[0], current[1] - start[1]);
    c.strokeRect(start[0], start[1], current[0] - start[0], current[1] - start[1]); c.restore();
  }
  if (!ui.recording && ui.state.show_radar) {
    try {
      drawTopDownRadar(ui, c, w, h);
    } catch (err) {
      // Never break the editor over an overlay, but do not leave a convincing
      // half-drawn map either: a partial radar reads as real data.
      console.error("[OmniCam] radar overlay failed", err);
      ui.radarError = String(err?.message || err);
    }
  }
  // A soft vignette settles the studio render into its frame. Orbit views only:
  // the camera POV is a framing surface the resolution gate already darkens, and
  // a capture must record flat.
  if (!ui.recording && ui.state.view_mode !== "camera" && w > 1 && h > 1) {
    const radius = Math.hypot(w, h) / 2;
    const vignette = c.createRadialGradient(w / 2, h / 2, radius * 0.62, w / 2, h / 2, radius);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(0,0,0,0.28)");
    c.save();
    c.fillStyle = vignette;
    c.fillRect(0, 0, w, h);
    c.restore();
  }
  if (ui.state.burn_in) {
    const camera = ui.viewportCamera();
    c.save();
    c.fillStyle = "#000b";
    c.fillRect(0, h - 34, w, 34);
    c.fillStyle = "#fff";
    c.font = `${Math.max(12, Math.round(h * 0.025))}px monospace`;
    c.fillText(`F ${ui.frame}/${ui.state.duration_frames - 1}  ${ui.state.fps}fps  FOV ${camera.fov.toFixed(1)}  ${ui.state.render_mode}`, 12, h - 12);
    c.restore();
  }
  // Burned-in Viewport Labels: opt in with `playblast_labels` (the live DOM
  // overlay stays hidden during a capture).
  if (ui.recording && ui.state.playblast_labels) drawPlayblastLabels(ui);
}

export { drawTopDownRadar, getCameraHeightColor, getCameraHeightLabel } from "./viewport/minimap.js";
