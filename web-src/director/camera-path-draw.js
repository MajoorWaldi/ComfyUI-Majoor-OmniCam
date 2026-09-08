// Interactive freehand camera-path authoring for OmniCam Director.
// The stroke stays transient until commit; committed output is a normal camera.
//
// The stroke is drawn on a plane fixed at pointer-down:
//   - top / bottom view  -> the horizontal plane through the source height
//   - front / back view   -> the plane Z = anchor.z (stroke varies X and Y)
//   - left / right view   -> the plane X = anchor.x (stroke varies Y and Z)
//   - perspective / iso   -> the view-facing plane through the anchor point
// "Extend active path" mode seeds the stroke from the active camera's last
// keyframe and appends the new keys to that track instead of creating a camera.

import { CAMERA_PALETTE, nextCameraId } from "../cameras.js";
import { cloneCamera, project, sampleCamera } from "./core.js";
import { t } from "../i18n.js";
import { screenToPlane } from "../viewport/path-editing.js";

const MAX_PATH_KEYS = 32;
const MIN_POINT_DISTANCE = 0.025;
const MIN_STROKE_LENGTH = 0.05;
const EPSILON = 1e-6;

// Views where drawing straight into the screen plane reads cleanly. Any other
// view ("camera", and by choice "perspective"/"iso") drops to "top" so a new
// path is never authored from inside the shot camera.
const AXIS_DRAW_VIEWS = ["top", "bottom", "front", "back", "left", "right"];
const PLANE_AXIS_BY_VIEW = {
  top: "y", bottom: "y",
  front: "z", back: "z",
  left: "x", right: "x",
};
const AXIS_INDEX = { x: 0, y: 1, z: 2 };

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

function direction3D(vector, fallback) {
  const magnitude = Math.hypot(vector[0] || 0, vector[1] || 0, vector[2] || 0);
  if (magnitude < EPSILON) return [...fallback];
  return [vector[0] / magnitude, vector[1] / magnitude, vector[2] / magnitude];
}

function tangentAt(points, index, fallback, planeAxis) {
  const before = points[Math.max(0, index - 1)];
  const after = points[Math.min(points.length - 1, index + 1)];
  const delta = [after[0] - before[0], after[1] - before[1], after[2] - before[2]];
  // A path drawn on the ground keeps the source camera's pitch: aim along the
  // horizontal tangent and re-add the source's vertical target offset below.
  if (planeAxis === "y") return horizontalDirection(delta, fallback);
  return direction3D(delta, fallback);
}

function aimTarget(position, tangent, sourceOffset, planeAxis) {
  if (planeAxis === "y") {
    const horizontalAimDistance = Math.max(
      0.25,
      Math.hypot(sourceOffset[0], sourceOffset[2]) || Math.hypot(...sourceOffset) || 1,
    );
    return [
      position[0] + tangent[0] * horizontalAimDistance,
      position[1] + (sourceOffset[1] || 0),
      position[2] + tangent[2] * horizontalAimDistance,
    ];
  }
  const aimDistance = Math.max(0.25, Math.hypot(...sourceOffset) || 1);
  return [
    position[0] + tangent[0] * aimDistance,
    position[1] + tangent[1] * aimDistance,
    position[2] + tangent[2] * aimDistance,
  ];
}

export function buildPathKeyframes(session) {
  const [startFrame, endFrame] = session.range;
  const frameSpan = endFrame - startFrame;
  if (frameSpan < 1) return [];

  // In "extend" mode the last existing keyframe is prepended so the new segment
  // starts exactly where the path left off; that key already exists, so it is
  // dropped from the emitted set (startIndex = 1).
  const rawPoints = session.seedPoint ? [session.seedPoint, ...session.points] : session.points;
  if (rawPoints.length < 2) return [];

  const sampleCount = Math.min(MAX_PATH_KEYS, rawPoints.length, frameSpan + 1);
  if (sampleCount < 2) return [];
  const points = resamplePolyline(rawPoints, sampleCount);
  if (points.length < 2) return [];

  const source = session.sourceCamera;
  const sourceOffset = [
    source.target[0] - source.position[0],
    source.target[1] - source.position[1],
    source.target[2] - source.position[2],
  ];
  const fallbackDirection = session.planeAxis === "y"
    ? horizontalDirection(sourceOffset)
    : direction3D(sourceOffset, [0, 0, -1]);

  const startIndex = session.seedPoint ? 1 : 0;
  const result = [];
  for (let index = startIndex; index < points.length; index++) {
    const position = points[index];
    const tangent = tangentAt(points, index, fallbackDirection, session.planeAxis);
    const camera = cloneCamera(source);
    camera.position = [...position];
    camera.target = aimTarget(position, tangent, sourceOffset, session.planeAxis);
    result.push({
      frame: Math.round(startFrame + (frameSpan * index) / (points.length - 1)),
      camera,
      interpolation: "smooth",
    });
  }
  // Guard against the seed and the first emitted key colliding on one frame.
  return result.filter((key, i, all) => i === 0 || key.frame > all[i - 1].frame);
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
  const session = ui.cameraPathDraw;
  const active = Boolean(session?.active);
  const extending = active && session.mode === "extend";
  for (const button of ui.root?.querySelectorAll?.('[data-act="draw-camera-path"]') || []) {
    button.classList.toggle("active", active && !extending);
    button.setAttribute("aria-pressed", String(active && !extending));
  }
  for (const button of ui.root?.querySelectorAll?.('[data-act="draw-camera-path-extend"]') || []) {
    button.classList.toggle("active", extending);
    button.setAttribute("aria-pressed", String(extending));
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

export function startCameraPathDraw(ui, options = {}) {
  if (ui.cameraPathDraw?.active) return true;
  const mode = options.mode === "extend" ? "extend" : "new";
  const sourceTrack = ui.activeCameraTrack?.();
  const sourceCamera = cloneCamera(ui.camera || sourceTrack?.camera);
  if (!sourceCamera?.position || !sourceCamera?.target) return false;

  let seedPoint = null;
  let appendTrackId = null;
  let range;
  let wantDuration = null;
  let wantRangeEnd = null;

  if (mode === "extend") {
    const keys = sourceTrack?.keyframes;
    if (!sourceTrack || !Array.isArray(keys) || keys.length < 1) {
      ui.setStatus?.(t("Draw Camera Path: the active camera has no path to continue"));
      return false;
    }
    // Continuing a path from inside the shot camera has no usable plane; fall
    // back to top, like a fresh draw. An editor view the animator already
    // picked is kept.
    if (ui.state.view_mode === "camera") ui.setViewMode?.("top");
    const lastKey = keys[keys.length - 1];
    seedPoint = [...lastKey.camera.position];
    appendTrackId = sourceTrack.id;
    const lastFrame = Math.max(0, Math.round(Number(ui.state.duration_frames) || 1) - 1);
    const [, playbackEnd] = normalizedPlaybackRange(ui.state);
    const existingSpan = keys.length > 1 ? keys[keys.length - 1].frame - keys[0].frame : 24;
    let endFrame = Math.max(playbackEnd, lastKey.frame + Math.max(6, Math.min(existingSpan, 240)));
    if (endFrame <= lastKey.frame) endFrame = lastKey.frame + 24;
    if (endFrame > lastFrame) { wantDuration = endFrame + 1; }
    if (endFrame > playbackEnd) { wantRangeEnd = endFrame; }
    range = [lastKey.frame, endFrame];
  } else {
    if (!AXIS_DRAW_VIEWS.includes(ui.state.view_mode)) ui.setViewMode?.("top");
    range = normalizedPlaybackRange(ui.state);
  }

  const planeAxis = PLANE_AXIS_BY_VIEW[ui.state.view_mode] ?? null;
  const anchor = seedPoint ? [...seedPoint] : [...sourceCamera.position];

  ui.cameraPathDraw = {
    active: true,
    drawing: false,
    pointerId: null,
    mode,
    appendTrackId,
    planeAxis,
    anchor,
    seedPoint,
    range,
    wantDuration,
    wantRangeEnd,
    sourceCamera,
    points: [],
  };
  syncCameraPathDrawButton(ui);
  ui.setStatus?.(mode === "extend"
    ? t("Continue Camera Path: LMB draw from the last key · RMB or Esc cancel")
    : t("Draw Camera Path: LMB draw · RMB or Esc cancel"));
  ui.render?.();
  return true;
}

export function appendCameraPathStroke(ui, worldPoint) {
  const session = ui.cameraPathDraw;
  if (!session?.active || !Array.isArray(worldPoint) || worldPoint.length < 3) return false;
  const point = [Number(worldPoint[0]), Number(worldPoint[1]), Number(worldPoint[2])];
  if (!point.every(Number.isFinite)) return false;
  // Lock the axis perpendicular to the draw plane so float drift in the
  // unprojection never bows the stroke off its plane.
  if (session.planeAxis) point[AXIS_INDEX[session.planeAxis]] = session.anchor[AXIS_INDEX[session.planeAxis]];
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

  const strokeSource = session.seedPoint ? [session.seedPoint, ...session.points] : session.points;
  if (
    strokeSource.length < 2 ||
    pathLength(strokeSource) < MIN_STROKE_LENGTH ||
    session.range[1] <= session.range[0]
  ) {
    cancelCameraPathDraw(ui);
    ui.setStatus?.(t("Camera path needs at least two distinct points"));
    return null;
  }

  const keyframes = buildPathKeyframes(session);
  if (keyframes.length < (session.mode === "extend" ? 1 : 2)) {
    cancelCameraPathDraw(ui);
    return null;
  }

  if (session.mode === "extend") {
    const track = ui.state.cameras.find((camera) => camera.id === session.appendTrackId);
    if (!track) { cancelCameraPathDraw(ui); return null; }
    ui.checkpoint?.("Extend camera path");
    if (session.wantDuration) {
      ui.state.duration_frames = Math.max(Number(ui.state.duration_frames) || 0, session.wantDuration);
    }
    if (session.wantRangeEnd != null && Array.isArray(ui.state.playback_range)) {
      ui.state.playback_range = [ui.state.playback_range[0], Math.max(ui.state.playback_range[1], session.wantRangeEnd)];
    }
    const byFrame = new Map((track.keyframes || []).map((key) => [key.frame, key]));
    for (const key of keyframes) byFrame.set(key.frame, key); // a new key wins a frame collision
    const merged = [...byFrame.values()].sort((a, b) => a.frame - b.frame);
    track.keyframes = merged;
    // ui.state.keyframes aliases the active track's array and syncActiveCameraTrack
    // (run inside serialize) writes it back over track.keyframes -- keep the alias
    // pointing at the merged array or the new keys are dropped on the next save.
    if (track.id === ui.state.active_camera_id) ui.state.keyframes = merged;
    ui.cameraPreviewSignature = "";
    ui.cameraPathDraw = null;
    syncCameraPathDrawButton(ui);
    ui.activateCamera?.(track.id);
    ui.setFrame?.(keyframes[0].frame);
    ui.serialize?.();
    ui.refreshKeys?.();
    ui.render?.();
    ui.setStatus?.(t("Camera path extended"));
    return track.id;
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
    session.anchor,
    ui.canvas.width,
    ui.canvas.height,
  );
  if (!point?.every(Number.isFinite)) return null;
  if (session.planeAxis) point[AXIS_INDEX[session.planeAxis]] = session.anchor[AXIS_INDEX[session.planeAxis]];
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
  if (!session?.active || ui.recording) return;
  const camera = ui.viewportCamera?.();
  if (!camera || !ui.ctx) return;

  // In "extend" mode the seed key anchors the visible stroke even before the
  // first sample, so the animator sees where the continuation grows from.
  const worldPoints = session.seedPoint && session.points[0] !== session.seedPoint
    ? [session.seedPoint, ...session.points]
    : session.points;
  if (!worldPoints.length) return;

  const screenPoints = worldPoints
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
