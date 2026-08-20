// 2D Canvas fallback renderer and composition overlays (Grid, Safe Areas, Rule of Thirds, Burn-In, Speed Map, Camera Paths) for OmniCam Director.

import { add, clamp, generatePointField, length, project, sampleCamera, sub } from "./omnicam-core.js";

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

export function drawPointField(ui) {
  const { points, colors } = generatePointField(ui.state.point_density || "balanced", ui.state.point_spread || "all_views", ui.state.point_color || null);
  if (!points.length) return;
  const camera = ui.viewportCamera();
  for (let i = 0; i < points.length; i += 3) {
    const p = project([points[i], points[i + 1], points[i + 2]], camera, ui.canvas.width, ui.canvas.height);
    if (!p) continue;
    const radius = clamp(5 / Math.sqrt(p[2]), 1, 4);
    const r = Math.round(colors[i] * 255);
    const g = Math.round(colors[i + 1] * 255);
    const b = Math.round(colors[i + 2] * 255);
    ui.ctx.fillStyle = `rgb(${r},${g},${b})`;
    ui.ctx.beginPath();
    ui.ctx.arc(p[0], p[1], radius, 0, Math.PI * 2);
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
  const head = [x, y + h * 0.88, z];
  const neck = [x, y + h * 0.72, z];
  const hip = [x, y + h * 0.42, z];
  const footL = [x - h * 0.13, y, z];
  const footR = [x + h * 0.13, y, z];
  const handL = [x - h * 0.28, y + h * 0.48, z];
  const handR = [x + h * 0.28, y + h * 0.48, z];
  drawLine3D(ui, neck, hip, "#aaa", 2);
  drawLine3D(ui, neck, handL, "#aaa", 2);
  drawLine3D(ui, neck, handR, "#aaa", 2);
  drawLine3D(ui, hip, footL, "#aaa", 2);
  drawLine3D(ui, hip, footR, "#aaa", 2);
  const p = project(head, ui.viewportCamera(), ui.canvas.width, ui.canvas.height);
  if (p) {
    ui.ctx.strokeStyle = "#aaa";
    ui.ctx.beginPath();
    ui.ctx.arc(p[0], p[1], clamp(28 / p[2], 3, 12), 0, Math.PI * 2);
    ui.ctx.stroke();
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
      const live = sampleCamera(camera, ui.frame);
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
  // Aspect Ratio / Resolution Gate letterbox mask
  if (!ui.recording && ui.state.view_mode === "camera" && ui.state.aspect_ratio && ui.state.aspect_ratio !== "auto") {
    const ratioParts = ui.state.aspect_ratio.split(":").map(Number);
    if (ratioParts.length === 2 && ratioParts[0] > 0 && ratioParts[1] > 0) {
      const targetAspect = ratioParts[0] / ratioParts[1];
      const currentAspect = w / h;
      c.save();
      c.fillStyle = "rgba(0, 0, 0, 0.7)";
      if (targetAspect < currentAspect) {
        const activeW = h * targetAspect;
        const barW = (w - activeW) / 2;
        c.fillRect(0, 0, barW, h);
        c.fillRect(w - barW, 0, barW, h);
      } else if (targetAspect > currentAspect) {
        const activeH = w / targetAspect;
        const barH = (h - activeH) / 2;
        c.fillRect(0, 0, w, barH);
        c.fillRect(0, h - barH, w, barH);
      }
      c.restore();
    }
  }
  if (!ui.recording) {
    try { ui.drawTransformGizmo(); } catch (err) { console.warn("[OmniCam Gizmo Error]", err); }
  }
  if (!ui.recording && ui.state.show_radar) {
    try { drawTopDownRadar(ui, c, w, h); } catch (err) { console.warn("[OmniCam Radar Error]", err); }
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
}

function getCameraHeightColor(y) {
  if (y <= -1.0) return "#38bdf8"; // Deep cyan/blue (below ground / low)
  if (y <= 0.2) return "#2dd4bf"; // Teal (ground level)
  if (y <= 2.2) return "#4ade80"; // Green (standard human eye level: 0.2m - 2.2m)
  if (y <= 5.0) return "#facc15"; // Yellow (medium tripod / low crane: 2.2m - 5m)
  if (y <= 10.0) return "#fb923c"; // Orange (high crane / jib: 5m - 10m)
  return "#f43f5e"; // Rose / Magenta (aerial / drone / high overhead: >10m)
}

function getCameraHeightLabel(y) {
  const sign = y > 0 ? "+" : "";
  return `${sign}${y.toFixed(1)}m`;
}

export function drawTopDownRadar(ui, c, w, h) {
  if (!w || !h || w < 80 || h < 80) return;
  const radarSize = Math.min(138, Math.max(80, Math.min(w, h) - 20));
  const margin = 10;
  const rx = Math.max(0, w - radarSize - margin);
  const ry = Math.max(0, h - radarSize - margin);

  const cam = ui.viewportCamera();
  const camPos = cam?.position || [0, 1.5, 5];
  const camTgt = cam?.target || [0, 0, 0];

  // Dynamic adaptive scale to ensure camera and target always stay in frame
  const maxDist = Math.max(
    Math.abs(camPos[0] || 0),
    Math.abs(camPos[2] || 0),
    Math.abs(camTgt[0] || 0),
    Math.abs(camTgt[2] || 0),
    4.0
  );
  const range = Math.max(6.0, Math.ceil((maxDist + 1.5) / 4) * 4);

  const cx = rx + radarSize / 2;
  const cy = ry + radarSize / 2;
  const innerRadius = radarSize / 2 - 10;
  const scale = innerRadius / range;

  const toRadar = (x, z) => [cx + x * scale, cy + z * scale];

  c.save();

  // Clip to radar rounded box (with fallback for engines lacking roundRect)
  c.beginPath();
  if (typeof c.roundRect === "function") {
    c.roundRect(rx, ry, radarSize, radarSize, 8);
  } else {
    c.rect(rx, ry, radarSize, radarSize);
  }
  c.clip();

  // Radar background box
  c.fillStyle = "rgba(10, 14, 22, 0.88)";
  c.fillRect(rx, ry, radarSize, radarSize);

  c.strokeStyle = "rgba(0, 210, 211, 0.35)";
  c.lineWidth = 1.2;
  c.strokeRect(rx, ry, radarSize, radarSize);

  // Concentric range circles (half range & full range)
  c.strokeStyle = "rgba(0, 210, 211, 0.12)";
  c.lineWidth = 1;
  c.beginPath();
  c.arc(cx, cy, innerRadius * 0.5, 0, Math.PI * 2);
  c.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  c.stroke();

  // Center crosshair (world 0,0)
  c.strokeStyle = "rgba(255, 255, 255, 0.12)";
  c.beginPath();
  c.moveTo(rx + 6, cy);
  c.lineTo(rx + radarSize - 6, cy);
  c.moveTo(cx, ry + 6);
  c.lineTo(cx, ry + radarSize - 6);
  c.stroke();

  // Height color for active camera
  const camY = camPos[1] || 0;
  const heightColor = getCameraHeightColor(camY);
  const heightText = getCameraHeightLabel(camY);

  // Header: RADAR title on left, Altitude on right with color badge
  c.font = "bold 9px monospace";
  c.fillStyle = "#00d2d3";
  c.fillText("RADAR", rx + 7, ry + 13);

  c.fillStyle = heightColor;
  c.textAlign = "right";
  c.fillText(`Y:${heightText}`, rx + radarSize - 7, ry + 13);
  c.textAlign = "left";

  // Scale ring label at bottom left
  c.font = "8px monospace";
  c.fillStyle = "rgba(255, 255, 255, 0.35)";
  c.fillText(`±${range}m`, rx + 7, ry + radarSize - 6);

  // Draw scene objects
  for (const obj of ui.state.objects || []) {
    if (obj.enabled === false) continue;
    const pos = obj.transform?.position || obj.position || [0, 0, 0];
    const [ox, oz] = toRadar(pos[0], pos[2]);
    if (ox < rx + 2 || ox > rx + radarSize - 2 || oz < ry + 2 || oz > ry + radarSize - 2) continue;

    c.fillStyle = obj.type === "card" ? "#48dbfb" : (obj.type === "human" ? "#ff9ff3" : "#feca57");
    c.beginPath();
    c.arc(ox, oz, 2.5, 0, Math.PI * 2);
    c.fill();
  }

  // Draw camera keyframe path points on radar
  for (const k of ui.state.keyframes || []) {
    const kPos = k.camera?.position;
    if (kPos) {
      const [kx, kz] = toRadar(kPos[0], kPos[2]);
      if (kx >= rx + 4 && kx <= rx + radarSize - 4 && kz >= ry + 4 && kz <= ry + radarSize - 4) {
        c.fillStyle = k.frame === ui.frame ? heightColor : "rgba(108, 130, 176, 0.6)";
        c.beginPath();
        c.arc(kx, kz, 1.8, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  // Camera and target positions with safety clamping inside radar bounds
  const rawCamX = cx + camPos[0] * scale;
  const rawCamZ = cy + camPos[2] * scale;
  const pad = 8;
  const camX = clamp(rawCamX, rx + pad, rx + radarSize - pad);
  const camZ = clamp(rawCamZ, ry + pad, ry + radarSize - pad);

  const rawTgtX = cx + camTgt[0] * scale;
  const rawTgtZ = cy + camTgt[2] * scale;
  const tgtX = clamp(rawTgtX, rx + pad, rx + radarSize - pad);
  const tgtZ = clamp(rawTgtZ, ry + pad, ry + radarSize - pad);

  // Look-at dashed line
  c.strokeStyle = "rgba(255, 255, 255, 0.35)";
  c.lineWidth = 1;
  c.setLineDash([2, 2]);
  c.beginPath();
  c.moveTo(camX, camZ);
  c.lineTo(tgtX, tgtZ);
  c.stroke();
  c.setLineDash([]);

  // Target dot with outer ring
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(tgtX, tgtZ, 2.5, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(255, 255, 255, 0.5)";
  c.beginPath();
  c.arc(tgtX, tgtZ, 4.5, 0, Math.PI * 2);
  c.stroke();

  // Vision cone with height tint
  const dx = camTgt[0] - camPos[0];
  const dz = camTgt[2] - camPos[2];
  const angle = Math.atan2(dz, dx);
  const halfFovRad = ((cam.fov || 35) * Math.PI) / 360;
  const coneLen = clamp(18 * (scale / (innerRadius / 8)), 14, 28);

  c.fillStyle = heightColor + "28";
  c.strokeStyle = heightColor;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(camX, camZ);
  c.lineTo(camX + Math.cos(angle - halfFovRad) * coneLen, camZ + Math.sin(angle - halfFovRad) * coneLen);
  c.lineTo(camX + Math.cos(angle + halfFovRad) * coneLen, camZ + Math.sin(angle + halfFovRad) * coneLen);
  c.closePath();
  c.fill();
  c.stroke();

  // Camera dot (height-colored glowing indicator)
  c.fillStyle = heightColor + "44";
  c.beginPath();
  c.arc(camX, camZ, 6, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = heightColor;
  c.beginPath();
  c.arc(camX, camZ, 3.5, 0, Math.PI * 2);
  c.fill();

  c.restore();
}
