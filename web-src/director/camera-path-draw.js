// Interactive freehand camera-path authoring for OmniCam Director.
// The stroke stays transient until commit; committed output is a normal camera.

import { CAMERA_PALETTE, nextCameraId } from "../cameras.js";
import { cloneCamera, project, sampleCamera } from "./core.js";
import { t } from "../i18n.js";
import { screenToPlane } from "../viewport/path-editing.js";

const MAX_PATH_KEYS = 32;
const MIN_POINT_DISTANCE = 0.025;
const MIN_STROKE_LENGTH = 0.05;
const EPSILON = 1e-6;

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function distance(a, b) {
  return Math.hypot(
    (b[0] || 0) - (a[0] || 0),
    (b[1] || 0) - (a[1] || 0),
    (b[2] || 0) - (a[2] || 0),
  );
}

function pathLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += distance(points[i - 1], points[i]);
  return total;
}

function normalizedPlaybackRange(state) {
  const lastFrame = Math.max(0, Math.round(Number(state?.duration_frames) || 1) - 1);
  const raw = Array.isArray(state?.playback_range) ? state.playback_range : [0, lastFrame];
  const a = clamp(Math.round(Number(raw[0]) || 0), 0, lastFrame);
  const b = clamp(Math.round(Number(raw[1]) || lastFrame), 0, lastFrame);
  return a <= b ? [a, b] : [b, a];
}

function resamplePolyline(points, count) {
  if (count <= 2) return [points[0], points.at(-1)].map((point) => [...point]);
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) {
    cumulative[i] = cumulative[i - 1] + distance(points[i - 1], points[i]);
  }
  const total = cumulative.at(-1) || 0;
  if (total < EPSILON) return [];

  const result = [];
  let segment = 1;
  for (let sample = 0; sample < count; sample++) {
    const wanted = (total * sample) / (count - 1);
    while (segment < cumulative.length - 1 && cumulative[segment] < wanted) segment += 1;
    const leftDistance = cumulative[segment - 1];
    const rightDistance = cumulative[segment];
    const u = clamp((wanted - leftDistance) / Math.max(EPSILON, rightDistance - leftDistance), 0, 1);
    const a = points[segment - 1];
    const b = points[segment];
    result.push([
      a[0] + (b[0] - a[0]) * u,
      a[1] + (b[1] - a[1]) * u,
      a[2] + (b[2] - a[2]) * u,
    ]);
  }
  return result;
}

function horizontalDirection(vector, fallback = [0, 0, -1]) {
  const magnitude = Math.hypot(vector?.[0] || 0, vector?.[2] || 0);
  if (magnitude < EPSILON) return [...fallback];
  return [(vector[0] || 0) / magnitude, 0, (vector[2] || 0) / magnitude];
}

function tangentAt(points, index, fallback) {
  const before = points[Math.max(0, index - 1)];
  const after = points[Math.min(points.length - 1, index + 1)];
  return horizontalDirection([after[0] - before[0], 0, after[2] - before[2]], fallback);
}

function buildPathKeyframes(session) {
  const [startFrame, endFrame] = session.range;
  const frameSpan = endFrame - startFrame;
  if (frameSpan < 1 || session.points.length < 2) return [];

  const sampleCount = Math.min(MAX_PATH_KEYS, session.points.length, frameSpan + 1);
  if (sampleCount < 2) return [];
  const points = resamplePolyline(session.points, sampleCount);
  if (points.length < 2) return [];

  const source = session.sourceCamera;
  const sourceOffset = [
    source.target[0] - source.position[0],
    source.target[1] - source.position[1],
    source.target[2] - source.position[2],
  ];
  const horizontalAimDistance = Math.max(
    0.25,
    Math.hypot(sourceOffset[0], sourceOffset[2]) || Math.hypot(...sourceOffset) || 1,
  );
  const verticalTargetOffset = sourceOffset[1] || 0;
  const fallbackDirection = horizontalDirection(sourceOffset);

  return points.map((position, index) => {
    const tangent = tangentAt(points, index, fallbackDirection);
    const camera = cloneCamera(source);
    camera.position = [...position];
    camera.target = [
      position[0] + tangent[0] * horizontalAimDistance,
      position[1] + verticalTargetOffset,
      position[2] + tangent[2] * horizontalAimDistance,
    ];
    return {
      frame: Math.round(startFrame + (frameSpan * index) / (points.length - 1)),
      camera,
      interpolation: "smooth",
    };
  });
}

function nextDrawnCameraName(state) {
  const names = new Set((state.cameras || []).map((camera) => camera.name));
  let index = 1;
  while (names.has(`Drawn Camera ${index}`)) index += 1;
  return `Drawn Camera ${index}`;
}

function releaseStrokePointer(ui, session = ui.cameraPathDraw) {
  const pointerId = session?.pointerId;
  if (pointerId === null || pointerId === undefined) return;
  try {
    if (ui.interactionElement?.hasPointerCapture?.(pointerId)) {
      ui.interactionElement.releasePointerCapture(pointerId);
    }
  } catch (_) {}
}

export function syncCameraPathDrawButton(ui) {
  const active = Boolean(ui.cameraPathDraw?.active);
  for (const button of ui.root?.querySelectorAll?.('[data-act="draw-camera-path"]') || []) {
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  }
  const canvas = ui.interactionElement;
  if (!canvas?.style) return;
  if (active) {
    canvas.dataset.cameraPathDraw = "true";
    canvas.style.cursor = "crosshair";
  } else if (canvas.dataset?.cameraPathDraw) {
    delete canvas.dataset.cameraPathDraw;
    canvas.style.cursor = "";
  }
}

export function startCameraPathDraw(ui) {
  if (ui.cameraPathDraw?.active) return true;
  const sourceTrack = ui.activeCameraTrack?.();
  const sourceCamera = cloneCamera(ui.camera || sourceTrack?.camera);
  if (!sourceCamera?.position || !sourceCamera?.target) return false;

  ui.cameraPathDraw = {
    active: true,
    drawing: false,
    pointerId: null,
    height: Number(sourceCamera.position[1]) || 0,
    range: normalizedPlaybackRange(ui.state),
    sourceCamera,
    points: [],
  };
  ui.setViewMode?.("top");
  syncCameraPathDrawButton(ui);
  ui.setStatus?.(t("Draw Camera Path: LMB draw · RMB or Esc cancel"));
  ui.render?.();
  return true;
}

export function appendCameraPathStroke(ui, worldPoint) {
  const session = ui.cameraPathDraw;
  if (!session?.active || !Array.isArray(worldPoint) || worldPoint.length < 3) return false;
  const x = Number(worldPoint[0]);
  const z = Number(worldPoint[2]);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const point = [x, session.height, z];
  const previous = session.points.at(-1);
  if (previous && distance(previous, point) < MIN_POINT_DISTANCE) return false;
  session.points.push(point);
  return true;
}

export function cancelCameraPathDraw(ui) {
  const session = ui.cameraPathDraw;
  if (!session?.active) return false;
  releaseStrokePointer(ui, session);
  ui.cameraPathDraw = null;
  syncCameraPathDrawButton(ui);
  ui.setStatus?.(t("Draw Camera Path cancelled"));
  ui.render?.();
  return true;
}

export function commitCameraPathStroke(ui) {
  const session = ui.cameraPathDraw;
  if (!session?.active) return null;
  releaseStrokePointer(ui, session);

  if (
    session.points.length < 2 ||
    pathLength(session.points) < MIN_STROKE_LENGTH ||
    session.range[1] <= session.range[0]
  ) {
    cancelCameraPathDraw(ui);
    ui.setStatus?.(t("Camera path needs at least two distinct points"));
    return null;
  }

  const keyframes = buildPathKeyframes(session);
  if (keyframes.length < 2) {
    cancelCameraPathDraw(ui);
    return null;
  }

  ui.checkpoint?.("Draw camera path");
  const id = nextCameraId(ui.state);
  const index = ui.state.cameras.length;
  const track = {
    id,
    name: nextDrawnCameraName(ui.state),
    color: CAMERA_PALETTE[index % CAMERA_PALETTE.length],
    camera: cloneCamera(keyframes[0].camera),
    keyframes,
    target_object_id: null,
    target_offset: [0, 0, 0],
  };
  ui.state.cameras.push(track);
  ui.cameraPreviewSignature = "";
  ui.cameraPathDraw = null;
  syncCameraPathDrawButton(ui);
  ui.activateCamera?.(id);
  ui.setFrame?.(session.range[0]);
  ui.setStatus?.(t("Camera path created"));
  return id;
}

export function setCameraPathOrientation(ui, mode, objectId = null) {
  const track = ui.activeCameraTrack?.();
  if (!track) return false;
  const lookAt = mode === "look_at";
  const resolvedObjectId = lookAt ? String(objectId || "") : null;
  if (lookAt && !ui.state.objects?.some((object) => object.id === resolvedObjectId)) return false;

  const nextId = lookAt ? resolvedObjectId : null;
  if ((track.target_object_id || null) === nextId && (!lookAt || Array.isArray(track.target_offset))) return true;

  ui.checkpoint?.(lookAt ? "Camera path Look At" : "Camera path Follow Path");
  track.target_object_id = nextId;
  track.target_offset = [0, 0, 0];
  if (track.id === ui.state.active_camera_id) {
    ui.state.target_object_id = nextId;
    ui.state.target_offset = [0, 0, 0];
  }
  // Never rewrite key.camera.target here.
  ui.camera = sampleCamera(track, ui.frame ?? 0, ui.state.objects);
  ui.serialize?.();
  ui.refreshInspector?.();
  ui.refreshKeys?.();
  ui.render?.();
  return true;
}

function claimPointer(event) {
  event.preventDefault?.();
  event.stopPropagation?.();
  event.stopImmediatePropagation?.();
}

function pointerOnCanvas(ui, event) {
  const rect = ui.interactionElement.getBoundingClientRect();
  return [
    ((event.clientX - rect.left) * ui.canvas.width) / Math.max(1, rect.width),
    ((event.clientY - rect.top) * ui.canvas.height) / Math.max(1, rect.height),
  ];
}

function pointerWorldPoint(ui, event) {
  const session = ui.cameraPathDraw;
  const camera = ui.viewportCamera?.();
  if (!session || !camera) return null;
  const point = screenToPlane(
    pointerOnCanvas(ui, event),
    camera,
    [0, session.height, 0],
    ui.canvas.width,
    ui.canvas.height,
  );
  if (!point?.every(Number.isFinite)) return null;
  point[1] = session.height;
  return point;
}

export function handleCameraPathPointerDown(ui, event) {
  const session = ui.cameraPathDraw;
  if (!session?.active) return false;

  if (event.button === 2 && !event.altKey) {
    claimPointer(event);
    ui.cameraPathSuppressContextMenuUntil = Date.now() + 1000;
    cancelCameraPathDraw(ui);
    return true;
  }

  // Draw only on plain LMB. DCC navigation gestures go to existing controls.
  if (
    event.button !== 0 ||
    event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
  ) return false;

  claimPointer(event);
  ui.closeMenus?.();
  ui.interactionElement.focus?.({ preventScroll: true });
  ui.interactionElement.setPointerCapture?.(event.pointerId);
  session.drawing = true;
  session.pointerId = event.pointerId;
  session.points = [];
  appendCameraPathStroke(ui, pointerWorldPoint(ui, event));
  syncCameraPathDrawButton(ui);
  ui.requestRender?.("camera-path-draw");
  return true;
}

export function handleCameraPathPointerMove(ui, event) {
  const session = ui.cameraPathDraw;
  if (!session?.active || !session.drawing || session.pointerId !== event.pointerId) return false;
  claimPointer(event);
  if (appendCameraPathStroke(ui, pointerWorldPoint(ui, event))) {
    ui.requestRender?.("camera-path-draw");
  }
  return true;
}

export function handleCameraPathPointerUp(ui, event) {
  const session = ui.cameraPathDraw;
  if (!session?.active || !session.drawing || session.pointerId !== event.pointerId) return false;
  claimPointer(event);
  if (event.type === "pointercancel" || event.type === "lostpointercapture") {
    cancelCameraPathDraw(ui);
    return true;
  }
  appendCameraPathStroke(ui, pointerWorldPoint(ui, event));
  session.drawing = false;
  commitCameraPathStroke(ui);
  return true;
}

export function drawCameraPathStrokeOverlay(ui) {
  const session = ui.cameraPathDraw;
  if (!session?.active || !session.points.length || ui.recording) return;
  const camera = ui.viewportCamera?.();
  if (!camera || !ui.ctx) return;

  const screenPoints = session.points
    .map((point) => project(point, camera, ui.canvas.width, ui.canvas.height))
    .filter((point) => point && Number.isFinite(point[0]) && Number.isFinite(point[1]));
  if (!screenPoints.length) return;

  const accent = globalThis.getComputedStyle?.(ui.root)
    ?.getPropertyValue("--oc-accent")?.trim() || "#8b7de3";
  const ctx = ui.ctx;
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.fillStyle = accent;
  ctx.lineWidth = 2;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.moveTo(screenPoints[0][0], screenPoints[0][1]);
  for (const point of screenPoints.slice(1)) ctx.lineTo(point[0], point[1]);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const point of [screenPoints[0], screenPoints.at(-1)]) {
    ctx.beginPath();
    ctx.arc(point[0], point[1], 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
