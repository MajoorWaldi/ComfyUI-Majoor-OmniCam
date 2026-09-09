// 2D Top-Down Interactive Radar Mini-Map
// Provides tactical 2D camera/target positioning, cardinal compass,
// keyframe jumping, object selection, telemetry and range zoom controls.

import { clamp, sampleCamera, worldTransform } from "../director/core.js";
import { t } from "../i18n.js";

const CAMERA_COLORS = ["#4aa3ef", "#f2a93b", "#48c774", "#b565d8", "#ec4899"];
const ZOOM_LEVELS = [4, 8, 12, 20, 35, 60, 100];

function getRadarState(ui) {
  if (!ui._minimapState) {
    ui._minimapState = {
      rangeIndex: -1, // -1 means auto
      centerMode: "origin", // "origin" | "camera"
      expanded: false,
      hover: null,
      drag: null,
    };
  }
  return ui._minimapState;
}

export function getCameraHeightColor(y) {
  if (y <= -1.0) return "#38bdf8"; // Deep cyan/blue (below ground / low)
  if (y <= 0.2) return "#2dd4bf"; // Teal (ground level)
  if (y <= 2.2) return "#4ade80"; // Green (human eye level: 0.2m - 2.2m)
  if (y <= 5.0) return "#facc15"; // Yellow (medium tripod / low crane: 2.2m - 5m)
  if (y <= 10.0) return "#fb923c"; // Orange (high crane / jib: 5m - 10m)
  return "#f43f5e"; // Rose / Magenta (aerial / drone / overhead: >10m)
}

export function getCameraHeightLabel(y) {
  const sign = y > 0 ? "+" : "";
  return `${sign}${y.toFixed(1)}m`;
}

export function getMinimapBounds(ui, w, h) {
  if (!w || !h || w < 80 || h < 80) return null;
  const state = getRadarState(ui);
  const baseSize = state.expanded ? 220 : 138;
  const radarSize = Math.min(baseSize, Math.max(80, Math.min(w, h) - 20));
  const margin = 10;
  const rx = Math.max(0, w - radarSize - margin);
  const ry = Math.max(0, h - radarSize - margin);

  const cam = ui.viewportCamera();
  const camPos = cam?.position || [0, 1.5, 5];
  const camTgt = cam?.target || [0, 0, 0];

  const activeTrack = ui.activeCameraTrack?.();
  const cameras = ui.state.cameras?.length ? ui.state.cameras : (activeTrack ? [activeTrack] : []);
  const trackedPositions = cameras.flatMap((c) =>
    (c.keyframes || []).map((kf) => kf.camera?.position).filter(Boolean)
  );

  let range = 12.0;
  if (state.rangeIndex >= 0 && state.rangeIndex < ZOOM_LEVELS.length) {
    range = ZOOM_LEVELS[state.rangeIndex];
  } else {
    const maxDist = Math.max(
      Math.abs(camPos[0] || 0), Math.abs(camPos[2] || 0),
      Math.abs(camTgt[0] || 0), Math.abs(camTgt[2] || 0),
      ...trackedPositions.flatMap((pos) => [Math.abs(pos[0] || 0), Math.abs(pos[2] || 0)]),
      4.0
    );
    range = Math.max(6.0, Math.ceil((maxDist + 1.5) / 4) * 4);
  }

  const cx = rx + radarSize / 2;
  const cy = ry + radarSize / 2;
  const innerRadius = radarSize / 2 - 12;
  const scale = innerRadius / range;

  const worldCenter = state.centerMode === "camera"
    ? [camPos[0] || 0, camPos[2] || 0]
    : [0, 0];

  return {
    rx, ry, radarSize, margin, cx, cy, innerRadius, range, scale,
    worldCenterX: worldCenter[0],
    worldCenterZ: worldCenter[1],
    camPos, camTgt, cameras, activeTrack,
  };
}

export function toRadarCoords(bounds, worldX, worldZ) {
  const dx = worldX - bounds.worldCenterX;
  const dz = worldZ - bounds.worldCenterZ;
  return [bounds.cx + dx * bounds.scale, bounds.cy + dz * bounds.scale];
}

export function fromRadarCoords(bounds, radarX, radarZ) {
  const dx = (radarX - bounds.cx) / bounds.scale;
  const dz = (radarZ - bounds.cy) / bounds.scale;
  return [bounds.worldCenterX + dx, bounds.worldCenterZ + dz];
}

export function drawTopDownRadar(ui, c, w, h) {
  const bounds = getMinimapBounds(ui, w, h);
  if (!bounds) return;

  const { rx, ry, radarSize, cx, cy, innerRadius, range, scale, camPos, camTgt, cameras, activeTrack } = bounds;
  const state = getRadarState(ui);
  const activeCameraId = ui.state.active_camera_id || activeTrack?.id;
  const toRadar = (x, z) => toRadarCoords(bounds, x, z);

  c.save();

  // Clip to radar rounded box
  c.beginPath();
  if (typeof c.roundRect === "function") {
    c.roundRect(rx, ry, radarSize, radarSize, 10);
  } else {
    c.rect(rx, ry, radarSize, radarSize);
  }
  c.clip();

  // Glassmorphic background
  c.fillStyle = "rgba(11, 15, 25, 0.90)";
  c.fillRect(rx, ry, radarSize, radarSize);

  // Subtle radial gradient center glow
  const bgGlow = c.createRadialGradient(cx, cy, 2, cx, cy, innerRadius);
  bgGlow.addColorStop(0, "rgba(0, 210, 211, 0.06)");
  bgGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  c.fillStyle = bgGlow;
  c.fillRect(rx, ry, radarSize, radarSize);

  // Border outline with neon accent
  c.strokeStyle = "rgba(0, 210, 211, 0.38)";
  c.lineWidth = 1.2;
  c.strokeRect(rx, ry, radarSize, radarSize);

  // Concentric range circles with metric distance markings
  const ringSteps = [0.33, 0.66, 1.0];
  c.strokeStyle = "rgba(0, 210, 211, 0.12)";
  c.lineWidth = 1;
  for (const step of ringSteps) {
    const r = innerRadius * step;
    c.beginPath();
    c.arc(cx, cy, r, 0, Math.PI * 2);
    c.stroke();

    // Distance labels along the horizontal axis
    if (radarSize >= 120) {
      c.font = "8px monospace";
      c.fillStyle = "rgba(0, 210, 211, 0.35)";
      c.textAlign = "left";
      c.fillText(`${Math.round(range * step)}m`, cx + r + 2, cy - 2);
    }
  }

  // Crosshair
  c.strokeStyle = "rgba(255, 255, 255, 0.10)";
  c.beginPath();
  c.moveTo(rx + 6, cy);
  c.lineTo(rx + radarSize - 6, cy);
  c.moveTo(cx, ry + 6);
  c.lineTo(cx, ry + radarSize - 6);
  c.stroke();

  // Compass Cardinal directions along outer rim
  c.font = "bold 9px sans-serif";
  c.textAlign = "center";
  c.textBaseline = "middle";
  // North (-Z in 3D camera space) with red accent
  c.fillStyle = "#f43f5e";
  c.fillText("N", cx, ry + 9);
  // South (+Z)
  c.fillStyle = "rgba(255, 255, 255, 0.4)";
  c.fillText("S", cx, ry + radarSize - 9);
  // West (-X)
  c.fillText("W", rx + 9, cy);
  // East (+X)
  c.fillText("E", rx + radarSize - 9, cy);

  // Draw scene objects
  for (const obj of ui.state.objects || []) {
    if (obj.enabled === false) continue;
    const pos = worldTransform(ui.state.objects, obj).position || [0, 0, 0];
    const [ox, oz] = toRadar(pos[0], pos[2]);
    if (ox < rx + 3 || ox > rx + radarSize - 3 || oz < ry + 3 || oz > ry + radarSize - 3) continue;

    const isSelected = ui.selectedObjectId === obj.id ||
      ui.selectedObjectIds?.has?.(obj.id);

    c.save();
    c.translate(ox, oz);

    if (obj.type === "card") {
      // Oriented rectangular card strip
      const yaw = ((obj.rotation?.[1] || 0) * Math.PI) / 180;
      c.rotate(-yaw);
      c.fillStyle = isSelected ? "#a855f7" : "#38bdf8";
      c.fillRect(-4, -1.2, 8, 2.4);
      c.strokeStyle = isSelected ? "#ffffff" : "rgba(255,255,255,0.6)";
      c.lineWidth = 1;
      c.strokeRect(-4, -1.2, 8, 2.4);
    } else if (obj.type === "light") {
      // Radiant amber sun glyph
      c.fillStyle = isSelected ? "#a855f7" : "#fbbf24";
      c.beginPath();
      c.arc(0, 0, 3, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#fbbf24";
      c.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        c.beginPath();
        c.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
        c.lineTo(Math.cos(a) * 6, Math.sin(a) * 6);
        c.stroke();
      }
    } else {
      // Mesh, Human or Prop
      c.fillStyle = isSelected ? "#a855f7" : (obj.type === "human" ? "#ec4899" : "#f59e0b");
      c.beginPath();
      c.arc(0, 0, 2.8, 0, Math.PI * 2);
      c.fill();
    }

    if (isSelected) {
      c.strokeStyle = "#a855f7";
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(0, 0, 6, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  }

  // Draw Camera Paths and Keyframes
  for (let cameraIndex = 0; cameraIndex < cameras.length; cameraIndex++) {
    const cameraTrack = cameras[cameraIndex];
    const keys = cameraTrack.keyframes || [];
    const isActive = cameraTrack.id === activeCameraId;
    const color = cameraTrack.color || CAMERA_COLORS[cameraIndex % CAMERA_COLORS.length];

    c.save();
    c.strokeStyle = color;
    c.globalAlpha = isActive ? 0.95 : 0.40;
    c.lineWidth = isActive ? 2 : 1;
    c.setLineDash(isActive ? [] : [2, 2]);
    c.beginPath();
    let pathStarted = false;
    const firstFrame = keys[0]?.frame;
    const lastFrame = keys[keys.length - 1]?.frame;

    for (let frame = firstFrame; Number.isFinite(frame) && frame <= lastFrame; frame++) {
      const sampled = sampleCamera(cameraTrack, frame, ui.state.objects)?.position;
      if (!Array.isArray(sampled)) continue;
      const [x, z] = toRadar(sampled[0], sampled[2]);
      if (!pathStarted) {
        c.moveTo(x, z);
        pathStarted = true;
      } else {
        c.lineTo(x, z);
      }
    }
    if (pathStarted) c.stroke();
    c.restore();

    // Keyframe markers
    c.save();
    for (const key of keys) {
      const pos = key.camera?.position;
      if (!pos) continue;
      const [kx, kz] = toRadar(pos[0], pos[2]);
      if (kx < rx + 4 || kx > rx + radarSize - 4 || kz < ry + 4 || kz > ry + radarSize - 4) continue;

      const isCurrentFrame = key.frame === ui.frame && isActive;
      c.fillStyle = isCurrentFrame ? "#ffffff" : color;
      c.globalAlpha = isActive ? 0.95 : 0.6;
      c.beginPath();
      // Draw diamond for keyframe
      c.moveTo(kx, kz - 3);
      c.lineTo(kx + 3, kz);
      c.lineTo(kx, kz + 3);
      c.lineTo(kx - 3, kz);
      c.closePath();
      c.fill();

      if (isCurrentFrame) {
        c.strokeStyle = "#00d2d3";
        c.lineWidth = 1.2;
        c.stroke();
      }
    }
    c.restore();
  }

  // Active Camera & Target positions
  const [rawCamX, rawCamZ] = toRadar(camPos[0] || 0, camPos[2] || 0);
  const [rawTgtX, rawTgtZ] = toRadar(camTgt[0] || 0, camTgt[2] || 0);

  const pad = 8;
  const camX = clamp(rawCamX, rx + pad, rx + radarSize - pad);
  const camZ = clamp(rawCamZ, ry + pad, ry + radarSize - pad);
  const tgtX = clamp(rawTgtX, rx + pad, rx + radarSize - pad);
  const tgtZ = clamp(rawTgtZ, ry + pad, ry + radarSize - pad);

  // Height color
  const camY = camPos[1] || 0;
  const heightColor = getCameraHeightColor(camY);
  const heightText = getCameraHeightLabel(camY);

  // Look-at dashed guide line
  c.strokeStyle = "rgba(255, 255, 255, 0.40)";
  c.lineWidth = 1;
  c.setLineDash([3, 3]);
  c.beginPath();
  c.moveTo(camX, camZ);
  c.lineTo(tgtX, tgtZ);
  c.stroke();
  c.setLineDash([]);

  // Look-at target reticle
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(tgtX, tgtZ, 2.5, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(255, 255, 255, 0.7)";
  c.lineWidth = 1;
  c.beginPath();
  c.arc(tgtX, tgtZ, 4.5, 0, Math.PI * 2);
  c.stroke();

  // Camera Vision Frustum (FOV cone with smooth gradient)
  const dx = camTgt[0] - camPos[0];
  const dz = camTgt[2] - camPos[2];
  const angle = Math.atan2(dz, dx);
  const cam = ui.viewportCamera();
  const halfFovRad = ((cam.fov || 35) * Math.PI) / 360;
  const coneLen = clamp(24 * (scale / (innerRadius / 8)), 16, 38);

  const coneGrad = c.createRadialGradient(camX, camZ, 2, camX, camZ, coneLen);
  coneGrad.addColorStop(0, heightColor + "55");
  coneGrad.addColorStop(1, heightColor + "08");
  c.fillStyle = coneGrad;
  c.strokeStyle = heightColor;
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(camX, camZ);
  c.lineTo(camX + Math.cos(angle - halfFovRad) * coneLen, camZ + Math.sin(angle - halfFovRad) * coneLen);
  c.arc(camX, camZ, coneLen, angle - halfFovRad, angle + halfFovRad);
  c.closePath();
  c.fill();
  c.stroke();

  // Camera body dot with elevation glow
  c.fillStyle = heightColor + "44";
  c.beginPath();
  c.arc(camX, camZ, 6.5, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = heightColor;
  c.beginPath();
  c.arc(camX, camZ, 3.5, 0, Math.PI * 2);
  c.fill();

  // Direction pointer tip on camera dot
  c.strokeStyle = "#ffffff";
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(camX, camZ);
  c.lineTo(camX + Math.cos(angle) * 7, camZ + Math.sin(angle) * 7);
  c.stroke();

  // Top header bar: RADAR title, buttons, and telemetry
  drawMinimapControls(ui, c, bounds, heightColor, heightText, angle, Math.hypot(dx, dz));

  // Hover Tooltip / Coordinates display
  if (state.hover) {
    drawMinimapHoverInfo(c, bounds, state.hover);
  }

  c.restore();
}

function drawMinimapControls(ui, c, bounds, heightColor, heightText, headingRad, targetDist) {
  const { rx, ry, radarSize } = bounds;
  const state = getRadarState(ui);

  // Top bar background strip
  c.fillStyle = "rgba(15, 23, 42, 0.75)";
  c.fillRect(rx, ry, radarSize, 18);
  c.strokeStyle = "rgba(0, 210, 211, 0.2)";
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(rx, ry + 18);
  c.lineTo(rx + radarSize, ry + 18);
  c.stroke();

  // Title: "RADAR"
  c.font = "bold 9px sans-serif";
  c.fillStyle = "#00d2d3";
  c.textAlign = "left";
  c.textBaseline = "middle";
  c.fillText("RADAR", rx + 6, ry + 9);

  // Interactive buttons in header: [-], [+], [CTR/CAM], [⤢/⤡]
  const btnY = ry + 3;
  const btnH = 12;

  // Zoom Out [-]
  drawMiniButton(c, rx + 44, btnY, 12, btnH, "−", state.hover?.button === "zoom_out");
  // Zoom In [+]
  drawMiniButton(c, rx + 58, btnY, 12, btnH, "+", state.hover?.button === "zoom_in");
  // Center Mode [CTR / CAM]
  const centerLabel = state.centerMode === "camera" ? "CAM" : "CTR";
  drawMiniButton(c, rx + 72, btnY, 22, btnH, centerLabel, state.hover?.button === "center");
  // Expand / Compact [⤢ / ⤡]
  const sizeLabel = state.expanded ? "⤡" : "⤢";
  drawMiniButton(c, rx + 96, btnY, 14, btnH, sizeLabel, state.hover?.button === "size");

  // Altitude badge (top right)
  c.font = "bold 8.5px monospace";
  c.fillStyle = heightColor;
  c.textAlign = "right";
  c.fillText(`Y:${heightText}`, rx + radarSize - 5, ry + 9);

  // Bottom telemetry strip
  c.fillStyle = "rgba(15, 23, 42, 0.70)";
  c.fillRect(rx, ry + radarSize - 15, radarSize, 15);
  c.strokeStyle = "rgba(0, 210, 211, 0.15)";
  c.beginPath();
  c.moveTo(rx, ry + radarSize - 15);
  c.lineTo(rx + radarSize, ry + radarSize - 15);
  c.stroke();

  // Telemetry: Heading (HDG) and Distance to target (DIST)
  const deg = Math.round(((headingRad * 180) / Math.PI + 360) % 360);
  c.font = "8px monospace";
  c.fillStyle = "rgba(255, 255, 255, 0.55)";
  c.textAlign = "left";
  c.fillText(`HDG:${deg}°`, rx + 5, ry + radarSize - 7);

  c.textAlign = "right";
  c.fillText(`DIST:${targetDist.toFixed(1)}m`, rx + radarSize - 5, ry + radarSize - 7);
}

function drawMiniButton(c, x, y, w, h, text, isHovered) {
  c.fillStyle = isHovered ? "rgba(0, 210, 211, 0.35)" : "rgba(255, 255, 255, 0.10)";
  c.fillRect(x, y, w, h);
  c.strokeStyle = isHovered ? "#00d2d3" : "rgba(255, 255, 255, 0.20)";
  c.lineWidth = 1;
  c.strokeRect(x, y, w, h);

  c.font = "bold 8px sans-serif";
  c.fillStyle = isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.75)";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(text, x + w / 2, y + h / 2);
}

function drawMinimapHoverInfo(c, bounds, hover) {
  if (!hover || !hover.text) return;
  const { rx, ry, radarSize } = bounds;

  c.font = "9px sans-serif";
  const tw = c.measureText(hover.text).width + 12;
  const th = 16;
  const bx = clamp(hover.px - tw / 2, rx + 4, rx + radarSize - tw - 4);
  const by = hover.pz > bounds.cy ? hover.pz - 22 : hover.pz + 8;

  c.fillStyle = "rgba(15, 23, 42, 0.94)";
  c.fillRect(bx, by, tw, th);
  c.strokeStyle = "#00d2d3";
  c.lineWidth = 1;
  c.strokeRect(bx, by, tw, th);

  c.fillStyle = "#ffffff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillText(hover.text, bx + tw / 2, by + th / 2);
}

export function hitTestMinimapButton(bounds, px, py) {
  const { rx, ry } = bounds;
  const btnY = ry + 3;
  const btnH = 12;
  if (py < btnY || py > btnY + btnH) return null;

  if (px >= rx + 44 && px <= rx + 56) return "zoom_out";
  if (px >= rx + 58 && px <= rx + 70) return "zoom_in";
  if (px >= rx + 72 && px <= rx + 94) return "center";
  if (px >= rx + 96 && px <= rx + 110) return "size";
  return null;
}

export function hitTestMinimapEntity(ui, bounds, px, py) {
  const { camPos, camTgt, cameras, rx, ry, radarSize } = bounds;
  const toRadar = (x, z) => toRadarCoords(bounds, x, z);

  // Check Camera dot
  const [cx, cz] = toRadar(camPos[0] || 0, camPos[2] || 0);
  if (Math.hypot(px - cx, py - cz) <= 8) {
    return { type: "camera", pos: camPos };
  }

  // Check Target dot
  const [tx, tz] = toRadar(camTgt[0] || 0, camTgt[2] || 0);
  if (Math.hypot(px - tx, py - tz) <= 8) {
    return { type: "target", pos: camTgt };
  }

  // Check Keyframes on active track
  const activeTrack = ui.activeCameraTrack?.();
  if (activeTrack) {
    for (const key of activeTrack.keyframes || []) {
      const pos = key.camera?.position;
      if (!pos) continue;
      const [kx, kz] = toRadar(pos[0], pos[2]);
      if (Math.hypot(px - kx, py - kz) <= 6) {
        return { type: "keyframe", key, frame: key.frame };
      }
    }
  }

  // Check Scene Objects
  for (const obj of ui.state.objects || []) {
    if (obj.enabled === false) continue;
    const pos = worldTransform(ui.state.objects, obj).position || [0, 0, 0];
    const [ox, oz] = toRadar(pos[0], pos[2]);
    if (Math.hypot(px - ox, py - oz) <= 7) {
      return { type: "object", object: obj, id: obj.id };
    }
  }

  return null;
}

export function handleMinimapPointerDown(ui, e, pointerX, pointerY) {
  if (!ui.state.show_radar) return false;
  if ((e.button != null && e.button !== 0) || e.altKey || e.ctrlKey || e.metaKey) return false;
  if (ui.isNavigatingFly || ui.cameraPathDraw) return false;
  const bounds = getMinimapBounds(ui, ui.canvas.width, ui.canvas.height);
  if (!bounds) return false;

  const { rx, ry, radarSize } = bounds;
  if (pointerX < rx || pointerX > rx + radarSize || pointerY < ry || pointerY > ry + radarSize) {
    return false;
  }

  e.preventDefault?.();
  e.stopPropagation?.();
  const state = getRadarState(ui);

  // Check button click in top header
  const button = hitTestMinimapButton(bounds, pointerX, pointerY);
  if (button) {
    if (button === "zoom_in") {
      if (state.rangeIndex === -1) {
        // Switch from auto to a nearby level
        state.rangeIndex = ZOOM_LEVELS.findIndex((l) => l >= bounds.range);
        if (state.rangeIndex < 0) state.rangeIndex = ZOOM_LEVELS.length - 1;
      }
      state.rangeIndex = Math.max(0, (state.rangeIndex === -1 ? 2 : state.rangeIndex) - 1);
    } else if (button === "zoom_out") {
      if (state.rangeIndex === -1) {
        state.rangeIndex = ZOOM_LEVELS.findIndex((l) => l >= bounds.range);
        if (state.rangeIndex < 0) state.rangeIndex = 0;
      }
      state.rangeIndex = Math.min(ZOOM_LEVELS.length - 1, state.rangeIndex + 1);
    } else if (button === "center") {
      state.centerMode = state.centerMode === "camera" ? "origin" : "camera";
    } else if (button === "size") {
      state.expanded = !state.expanded;
    }
    ui.render?.();
    return true;
  }

  // Check entity click
  const hit = hitTestMinimapEntity(ui, bounds, pointerX, pointerY);
  if (hit) {
    if (hit.type === "camera") {
      ui.checkpoint?.("Move camera via radar");
      ui.beginCameraEdit?.();
      state.drag = { type: "camera", startWorld: [bounds.camPos[0], bounds.camPos[2]] };
      return true;
    }
    if (hit.type === "target") {
      ui.checkpoint?.("Move look-at target via radar");
      ui.beginCameraEdit?.();
      state.drag = { type: "target", startWorld: [bounds.camTgt[0], bounds.camTgt[2]] };
      return true;
    }
    if (hit.type === "keyframe") {
      ui.seekFrame?.(hit.frame);
      ui.render?.();
      return true;
    }
    if (hit.type === "object") {
      ui.selectObject?.(hit.id);
      ui.render?.();
      return true;
    }
  }

  // Empty radar click: Reposition camera (or target with Shift)
  const [worldX, worldZ] = fromRadarCoords(bounds, pointerX, pointerY);
  if (e.shiftKey) {
    ui.checkpoint?.("Set target via radar");
    ui.beginCameraEdit?.();
    const cam = ui.viewportCamera();
    cam.target = [worldX, cam.target?.[1] || 0, worldZ];
    ui.commitCameraEdit?.();
  } else {
    ui.checkpoint?.("Set camera via radar");
    ui.beginCameraEdit?.();
    const cam = ui.viewportCamera();
    cam.position = [worldX, cam.position?.[1] || 1.5, worldZ];
    ui.commitCameraEdit?.();
  }
  ui.setFrame?.(ui.frame, false, false);
  ui.render?.();
  return true;
}

export function handleMinimapPointerMove(ui, e, pointerX, pointerY) {
  if (!ui.state.show_radar) return false;
  if (ui.drag || ui.boxSelection || ui.gizmoDrag || ui.keyDrag || ui.cameraPathDraw || ui.pathDrag || ui.timelineDrag || ui.curveDrag) {
    return false;
  }
  const bounds = getMinimapBounds(ui, ui.canvas.width, ui.canvas.height);
  if (!bounds) return false;

  const state = getRadarState(ui);
  const { rx, ry, radarSize } = bounds;
  const inside = pointerX >= rx && pointerX <= rx + radarSize && pointerY >= ry && pointerY <= ry + radarSize;

  // Active Dragging
  if (state.drag) {
    const [worldX, worldZ] = fromRadarCoords(bounds, pointerX, pointerY);
    const cam = ui.viewportCamera();
    if (state.drag.type === "camera") {
      cam.position = [worldX, cam.position?.[1] || 1.5, worldZ];
    } else if (state.drag.type === "target") {
      cam.target = [worldX, cam.target?.[1] || 0, worldZ];
    }
    ui.setFrame?.(ui.frame, false, false);
    ui.render?.();
    return true;
  }

  if (!inside) {
    if (state.hover) {
      state.hover = null;
      ui.render?.();
    }
    return false;
  }

  // Hover detection
  const button = hitTestMinimapButton(bounds, pointerX, pointerY);
  const hit = hitTestMinimapEntity(ui, bounds, pointerX, pointerY);
  const [wx, wz] = fromRadarCoords(bounds, pointerX, pointerY);

  let hoverText = `[${wx.toFixed(1)}m, ${wz.toFixed(1)}m]`;
  if (button === "zoom_in") hoverText = t("Zoom in (+)");
  else if (button === "zoom_out") hoverText = t("Zoom out (−)");
  else if (button === "center") hoverText = state.centerMode === "camera" ? t("Center: Cam") : t("Center: World");
  else if (button === "size") hoverText = state.expanded ? t("Compact mode") : t("Expand radar");
  else if (hit?.type === "camera") hoverText = t("Camera (drag to move)");
  else if (hit?.type === "target") hoverText = t("Look-At Target (drag to move)");
  else if (hit?.type === "keyframe") hoverText = `${t("Keyframe")} F${hit.frame}`;
  else if (hit?.type === "object") hoverText = hit.object.name || hit.object.type || t("Object");

  state.hover = {
    button,
    hit,
    px: pointerX,
    pz: pointerY,
    text: hoverText,
  };

  if (ui.interactionElement?.style) {
    ui.interactionElement.style.cursor = (button || hit) ? "pointer" : "crosshair";
  }

  ui.render?.();
  return true;
}

export function handleMinimapPointerUp(ui, e) {
  const state = ui._minimapState;
  if (!state || !state.drag) return false;
  ui.commitCameraEdit?.();
  state.drag = null;
  if (ui.interactionElement?.style) ui.interactionElement.style.cursor = "default";
  ui.render?.();
  return true;
}

export function handleMinimapWheel(ui, e, pointerX, pointerY) {
  if (!ui.state.show_radar) return false;
  const bounds = getMinimapBounds(ui, ui.canvas.width, ui.canvas.height);
  if (!bounds) return false;

  const { rx, ry, radarSize } = bounds;
  if (pointerX < rx || pointerX > rx + radarSize || pointerY < ry || pointerY > ry + radarSize) {
    return false;
  }

  e.preventDefault?.();
  e.stopPropagation?.();
  const state = getRadarState(ui);

  const delta = Math.sign(e.deltaY || 0);
  if (state.rangeIndex === -1) {
    state.rangeIndex = ZOOM_LEVELS.findIndex((l) => l >= bounds.range);
    if (state.rangeIndex < 0) state.rangeIndex = 2;
  }

  if (delta > 0) {
    // Zoom out
    state.rangeIndex = Math.min(ZOOM_LEVELS.length - 1, state.rangeIndex + 1);
  } else if (delta < 0) {
    // Zoom in
    state.rangeIndex = Math.max(0, state.rangeIndex - 1);
  }

  ui.render?.();
  return true;
}
