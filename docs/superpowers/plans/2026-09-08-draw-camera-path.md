# Draw Camera Path — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:test-driven-development` while implementing and `superpowers:verification-before-completion` before claiming completion. Execute the tasks in order and tick every checkbox.

**Goal:** add a DCC-like **Draw Camera Path** tool to OmniCam Director. The artist arms the tool, Director switches to Top View, the artist draws a trajectory with LMB, and OmniCam creates a new animated camera over the captured In/Out range. The generated camera follows the path by default and can use the existing Look At constraint without destroying the authored tangent targets.

**Architecture:** the freehand stroke is a transient frontend authoring state only. Nothing is serialized until commit. A committed stroke becomes a normal Director camera track (`state.cameras[].keyframes`), so the existing pipeline stays unchanged: `Director state -> OMNICAM_MOTION_SCENE -> Monitor`. No backend route, Python node, MotionScene schema change, or model-specific behavior belongs in this feature.

**Tech stack:** JavaScript ES modules, Director Canvas/WebGL viewport, existing `screenToPlane()`, Vite, Node test runner, Playwright, ComfyUI frontend extension APIs.

**Executable spec:** `tests/frontend/camera-path-draw.node.mjs`.

**Patch base checked on 2026-09-08:**

- branch: `feature/draw-camera-path`
- base commit before this document: `fb983e76ec0cdec31322fe6e1a8bf01765af33bc`
- commit message: `test(director): specify camera path draw lifecycle`
- the RED test intentionally imports missing `web-src/director/camera-path-draw.js`

---

## 1. Sources checked before implementation

Official ComfyUI sources re-checked while writing this plan:

- `https://docs.comfy.org/custom-nodes/js/javascript_overview`
- `https://github.com/Comfy-Org/ComfyUI_frontend/blob/main/docs/extensions/core.md`
- `https://github.com/Comfy-Org/ComfyUI_frontend/blob/main/src/types/comfy.ts`
- `https://github.com/Comfy-Org/ComfyUI`

Relevant current guidance remains registration-based, hook-driven and non-intrusive: OmniCam must remain an extension and must not patch ComfyUI Core. Pointer interaction and DOM lifecycle must remain scoped to the Director and disposed with its existing AbortController lifecycle.

Repo rules from `AGENTS.md` also remain binding:

```text
Viewport / Timeline
       ↓
OMNICAM_EDITOR_STATE
       ↓
OMNICAM_MOTION_SCENE
       ↓
Monitor compiler
```

Draw Camera Path therefore produces ordinary Director camera data. It must not create a second motion representation.

---

## 2. Product contract

### Activation

When the artist clicks **Draw Camera Path**:

- set `ui.cameraPathDraw.active = true`;
- capture current camera Y height;
- capture current playback range `[In, Out]`, with full-duration fallback;
- clone the current camera so FOV, roll, camera type, near/far and target offset can be inherited;
- call `ui.setViewMode("top")`;
- do **not** create an Undo checkpoint.

### Drawing

- plain **LMB drag**: draw;
- LMB release: commit;
- **RMB**: cancel and suppress the normal Director context menu;
- **Escape**: cancel without state mutation;
- MMB / Shift+MMB / Maya Alt navigation / Ctrl fallback: pass through to existing viewport controls.

Use the existing math helper:

```js
screenToPlane(screen, ui.viewportCamera(), [0, capturedHeight, 0], width, height)
```

Then force returned Y back to the captured camera height.

### Commit

A valid stroke must:

- have >=2 distinct points and non-trivial total length;
- create exactly one `checkpoint("Draw camera path")`;
- create exactly one new animated camera;
- place first key exactly on captured In;
- place last key exactly on captured Out;
- keep all camera positions at captured Y;
- resample by arc length rather than raw pointer-event density;
- cap the generated camera to **32 keys**;
- use `smooth` interpolation;
- activate the new camera;
- clear the transient stroke.

Invalid/cancelled strokes create no checkpoint and no camera.

### Follow Path orientation

For each resampled position `Pi`, derive a horizontal tangent using its neighbours and aim the camera forward along that tangent. Preserve the source camera's horizontal target distance and vertical target offset/pitch.

```text
Tangent_i = normalize(P_next - P_prev) on XZ
Target_i.xz = Pi.xz + Tangent_i * sourceHorizontalAimDistance
Target_i.y  = Pi.y + sourceVerticalTargetOffset
```

### Look At orientation

Look At is a live constraint layer:

```js
track.target_object_id = objectId
track.target_offset = [0, 0, 0]
```

**Never rewrite `key.camera.target` when toggling Look At.** Clearing the constraint must reveal the original Follow Path targets exactly.

---

## 3. Explicit non-goals

Do not add any of the following on this branch:

- OmniCam Builder / Scene Proxy;
- MoGe / VGGT / SAM reconstruction work;
- Camera Intent / GenerationPlan;
- backend Python;
- PromptServer routes;
- MotionScene schema changes;
- Monitor profile changes;
- Wan / H3 / LTX model-specific semantics.

---

## 4. Files

| Action | File | Purpose |
|---|---|---|
| CREATE | `web-src/director/camera-path-draw.js` | lifecycle, resampling, key generation, pointer handling, overlay |
| CREATE | `web-src/event-bindings/camera-path-draw.js` | dedicated button/context-menu binding |
| MODIFY | `web-src/event-bindings.js` | register dedicated binder |
| MODIFY | `web-src/director.js` | initialize transient runtime state |
| MODIFY | `web-src/director/methods/interaction.js` | intercept pointer only when consumed |
| MODIFY | `web-src/director/methods/render.js` | editor-only transient overlay |
| MODIFY | `web-src/template/viewport.js` | dedicated camera-path button |
| MODIFY | `web-src/commands.js` | Escape cancellation |
| MODIFY | `web-src/director/methods/scene.js` | non-destructive Look At constraint |
| MODIFY | `web-src/locales/fr.js` | FR strings |
| MODIFY | `tests/frontend/camera-path-draw.node.mjs` | trajectory regressions |
| CREATE | `tests/frontend/camera-path-draw.spec.js` | actual browser gesture |
| MODIFY | `docs/NODES.md` | usage |
| MODIFY | `docs/SHORTCUTS.md` | interaction table |
| MODIFY | `CHANGELOG.md` | release note |
| GENERATED | `web/omnicam.js` | `npm run build` only; never edit manually |

No dedicated CSS file is required. The existing `.vp-tool.active` / `[aria-pressed="true"]` styling already covers the button.

---

# Task 0 — Prove the existing RED

- [ ] Switch to the feature branch.
- [ ] Verify the expected base.
- [ ] Run the targeted test before implementation.

```bash
git switch feature/draw-camera-path
git rev-parse HEAD
node --test tests/frontend/camera-path-draw.node.mjs
```

Expected before implementation:

```text
ERR_MODULE_NOT_FOUND
.../web-src/director/camera-path-draw.js
```

Do not weaken the test to make it pass.

---

# Task 1 — Implement the camera-path engine

## Patch 1 — create `web-src/director/camera-path-draw.js`

```js
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
```

### Required constraints for Patch 1

- [ ] do not import Three.js;
- [ ] do not emit MotionScene directly;
- [ ] do not put the draft under `ui.state`;
- [ ] do not create one key per raw pointer event;
- [ ] no checkpoint before stroke validation;
- [ ] no target-key mutation on orientation switch.

Run:

```bash
node --test tests/frontend/camera-path-draw.node.mjs
```

The five existing RED-contract tests must now pass.

---

# Task 2 — Add trajectory regression tests

## Patch 2 — extend `tests/frontend/camera-path-draw.node.mjs`

```diff
@@
 test("camera path orientation can switch from Follow Path to a selected Look At object and back", () => {
@@
 });
+
+test("drawn keys keep the captured camera height", () => {
+  const { ui } = fixture();
+  startCameraPathDraw(ui);
+  appendCameraPathStroke(ui, [0, 99, 0]);
+  appendCameraPathStroke(ui, [2, -10, 0]);
+  appendCameraPathStroke(ui, [4, 8, -2]);
+  const id = commitCameraPathStroke(ui);
+  const created = ui.state.cameras.find((item) => item.id === id);
+  assert.ok(created.keyframes.every((key) => key.camera.position[1] === 2));
+});
+
+test("stroke density does not dictate camera spacing", () => {
+  const { ui } = fixture();
+  startCameraPathDraw(ui);
+  appendCameraPathStroke(ui, [0, 2, 0]);
+  appendCameraPathStroke(ui, [1, 2, 0]);
+  appendCameraPathStroke(ui, [10, 2, 0]);
+  const id = commitCameraPathStroke(ui);
+  const created = ui.state.cameras.find((item) => item.id === id);
+  assert.equal(created.keyframes.length, 3);
+  assert.ok(Math.abs(created.keyframes[1].camera.position[0] - 5) < 0.15);
+});
```

Run the targeted test again before UI integration.

---

# Task 3 — Add a dedicated viewport tool, not a Motion Track tool

The existing `data-motion-tool="track"` is for 2D/screen motion tracks consumed by Wan/LTX/ATI paths. **Do not reuse it.**

## Patch 3A — `web-src/template/viewport.js`

Insert after Scale in `toolRail()`:

```diff
@@
       <button class="vp-tool" data-transform-mode="scale" title="${t("Scale gizmo (click)")}"><i class="pi pi-stop"></i></button>
+      <button class="vp-tool" data-act="draw-camera-path" aria-pressed="false"
+              title="${t("Draw Camera Path")}" aria-label="${t("Draw Camera Path")}">
+        <i class="pi pi-pencil"></i>
+      </button>
       <span class="vp-rail-divider"></span>
```

No CSS patch is required.

---

# Task 4 — Bind the camera-path mode in its own module

## Patch 4A — create `web-src/event-bindings/camera-path-draw.js`

```js
import {
  cancelCameraPathDraw,
  startCameraPathDraw,
} from "../director/camera-path-draw.js";

export function bindCameraPathDraw(ui, signal) {
  for (const button of ui.root.querySelectorAll('[data-act="draw-camera-path"]')) {
    button.addEventListener("click", () => {
      if (ui.cameraPathDraw?.active) cancelCameraPathDraw(ui);
      else startCameraPathDraw(ui);
    }, { signal });
  }

  ui.root.addEventListener("contextmenu", (event) => {
    const suppress = Date.now() <= Number(ui.cameraPathSuppressContextMenuUntil || 0);
    if (!suppress && !ui.cameraPathDraw?.active) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    ui.cameraPathSuppressContextMenuUntil = 0;
    if (ui.cameraPathDraw?.active) cancelCameraPathDraw(ui);
  }, { capture: true, signal });
}
```

## Patch 4B — `web-src/event-bindings.js`

```diff
@@
 import { bindPanelResize } from "./event-bindings/panel-resize.js";
+import { bindCameraPathDraw } from "./event-bindings/camera-path-draw.js";
@@
   bindViewportSettings(ui, q, signal);
   bindPanelResize(ui, signal);
+  bindCameraPathDraw(ui, signal);
   bindEditorAndGlobal(ui, q, signal);
```

Register this binder before the generic editor/global context-menu fallback.

---

# Task 5 — Initialize transient state explicitly

## Patch 5 — `web-src/director.js`

Near the other runtime drag fields in the constructor:

```diff
@@
-    this.state = sanitizeState(parsed), this.frame = 0, this.camera = sampleCamera(this.state, 0), this.playing = !1, this.drag = null, this.cameraEditActive = !1,
+    this.state = sanitizeState(parsed), this.frame = 0, this.camera = sampleCamera(this.state, 0), this.playing = !1, this.drag = null, this.cameraPathDraw = null, this.cameraEditActive = !1,
```

Do **not** add `cameraPathDraw` to serialization.

---

# Task 6 — Intercept pointer events above the generic viewport controller

Do not put the feature in `viewport-controls/interactions.js`; that file stays the Maya/Blender baseline. The feature is a mode filter that delegates whenever it does not consume the event.

## Patch 6 — `web-src/director/methods/interaction.js`

```diff
@@
 ﻿// OmniCam Director methods extracted from the UI facade.
+
+import {
+  handleCameraPathPointerDown,
+  handleCameraPathPointerMove,
+  handleCameraPathPointerUp,
+} from "../camera-path-draw.js";
@@
   onPointerDown(e) {
+    if (handleCameraPathPointerDown(this, e)) return;
     onPointerDown(this, e);
   },
   onPointerMove(e) {
+    if (handleCameraPathPointerMove(this, e)) return;
     onPointerMove(this, e);
   },
   onPointerUp(event) {
+    if (handleCameraPathPointerUp(this, event)) return;
     onPointerUp(this, event);
   },
```

Required gesture ownership:

```text
plain LMB      -> Draw Camera Path
RMB            -> cancel Draw Camera Path
MMB            -> existing navigation
Shift + MMB    -> existing navigation
Alt + LMB      -> existing navigation
Alt + MMB      -> existing navigation
Ctrl + drag    -> existing navigation fallback
```

---

# Task 7 — Render the draft as an editor-only overlay

## Patch 7 — `web-src/director/methods/render.js`

```diff
@@
 import { renderMotionTimeline } from "../../motion-tracks/timeline.js";
+import { drawCameraPathStrokeOverlay } from "../camera-path-draw.js";
@@
-    !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap(), this.drawOverlays(), drawMotionOverlay(this);
+    !this.recording && this.state.speed_heatmap && this.drawSpeedHeatmap();
+    !this.recording && drawCameraPathStrokeOverlay(this);
+    this.drawOverlays();
+    drawMotionOverlay(this);
```

This location keeps the draft over the WebGL scene while guaranteeing it never enters the playblast recording path.

---

# Task 8 — Escape cancellation

## Patch 8 — `web-src/commands.js`

```diff
@@
 import { cancelViewportInteraction } from "./viewport-controls/interactions.js";
+import { cancelCameraPathDraw } from "./director/camera-path-draw.js";
@@
   if (key === "escape") {
+    if (ui.cameraPathDraw?.drawing && cancelCameraPathDraw(ui)) return true;
     if (cancelViewportInteraction(ui)) return true;
+    if (cancelCameraPathDraw(ui)) return true;
     if (cancelMotionCreation(ui)) return true;
```

Rationale: an actual freehand stroke is discarded immediately; if the tool is only armed while a normal navigation drag is occurring, the existing viewport drag cancellation can win first.

---

# Task 9 — Make the existing Look At UI non-destructive

The Director already has `data-role="camera-target-object"`. Reuse it; do not add another target selector.

Current `setCameraTrackingTarget()` resolves an object target and commits it into the current camera edit. That can overwrite a Follow Path target. Tracking should remain a constraint, not a hidden bake.

## Patch 9 — `web-src/director/methods/scene.js`

Replace the target-writing block inside `setCameraTrackingTarget()`:

```diff
@@
     if (cam.id === this.state.active_camera_id) {
       this.state.target_object_id = targetId || null;
       this.state.aim_bone = cam.aim_bone;
     }
-    if (targetId) {
-      const targetObj = this.state.objects.find((o) => o.id === targetId);
-      if (targetObj) {
-        const modelCenter = (targetObj.type === "model" || targetObj.type === "glb") ? this.webgl?.getObjectWorldCenter?.(targetObj.id) : null;
-        const targetPos = modelCenter || (targetObj.keyframes?.length
-          ? sampleObjectTransform(targetObj, this.frame).position
-          : (targetObj.position || [0, 1.5, 0]));
-        this.camera.target = [...targetPos];
-        this.beginCameraEdit();
-        this.commitCameraEdit();
-        this.finishCameraEdit();
-      }
-    }
+    // Tracking is a live constraint. Never bake its resolved target into the
+    // authored key underneath it: clearing the constraint must reveal exactly
+    // the original Follow Path/manual target again.
+    this.camera = sampleCamera(cam, this.frame, this.state.objects);
+    applyAimConstraint(this, cam, this.camera, this.frame);
     this.serialize();
```

Add a regression test proving all `key.camera.target` values are byte-for-byte unchanged after enabling and clearing target tracking.

---

# Task 10 — French locale

## Patch 10 — `web-src/locales/fr.js`

```diff
@@
 export const FR = {
+  "Camera path created": "Chemin caméra créé",
+  "Camera path needs at least two distinct points": "Le chemin caméra nécessite au moins deux points distincts",
+  "Draw Camera Path": "Tracer un chemin caméra",
+  "Draw Camera Path cancelled": "Tracé du chemin caméra annulé",
+  "Draw Camera Path: LMB draw · RMB or Esc cancel": "Tracer un chemin caméra : clic gauche pour dessiner · clic droit ou Échap pour annuler",
```

Then run:

```bash
npm run check:locales
```

Do not increase the dynamic `t(\`...\`)` debt budget.

---

# Task 11 — Browser-level interaction test

## Patch 11 — create `tests/frontend/camera-path-draw.spec.js`

```js
import { expect, test } from "@playwright/test";

async function openDirector(page) {
  await page.goto("/tests/frontend/director-mount.html");
  await page.waitForFunction(
    () => document.querySelector("#status")?.textContent !== "loading",
    null,
    { timeout: 15000 },
  );
  await expect(page.locator("#status")).toHaveText("ready");
}

test("Draw Camera Path creates one camera across the active playback range", async ({ page }) => {
  await openDirector(page);
  await page.evaluate(() => {
    window.omnicamNode.__majoorOmniCam.state.playback_range = [12, 48];
  });

  const button = page.locator('[data-act="draw-camera-path"]');
  await button.click();
  await expect(button).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => window.omnicamNode.__majoorOmniCam.state.view_mode)).toBe("top");

  const canvas = page.locator(".viewport-wrap > canvas");
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.65);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.45, box.y + box.height * 0.45, { steps: 8 });
  await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.30, { steps: 10 });
  await page.mouse.up();

  const result = await page.evaluate(() => {
    const ui = window.omnicamNode.__majoorOmniCam;
    const track = ui.activeCameraTrack();
    return {
      count: ui.state.cameras.length,
      first: track.keyframes[0].frame,
      last: track.keyframes.at(-1).frame,
      keys: track.keyframes.length,
      active: Boolean(ui.cameraPathDraw?.active),
    };
  });

  expect(result.count).toBe(2);
  expect(result.first).toBe(12);
  expect(result.last).toBe(48);
  expect(result.keys).toBeGreaterThanOrEqual(2);
  expect(result.keys).toBeLessThanOrEqual(32);
  expect(result.active).toBe(false);
  await expect(button).toHaveAttribute("aria-pressed", "false");
});

test("Escape and RMB cancel without creating a camera", async ({ page }) => {
  await openDirector(page);
  const button = page.locator('[data-act="draw-camera-path"]');
  const canvas = page.locator(".viewport-wrap > canvas");
  const box = await canvas.boundingBox();

  await button.click();
  await page.mouse.move(box.x + 100, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 240, box.y + 180, { steps: 6 });
  await page.keyboard.press("Escape");
  await page.mouse.up();

  expect(await page.evaluate(() => ({
    cameras: window.omnicamNode.__majoorOmniCam.state.cameras.length,
    drawing: window.omnicamNode.__majoorOmniCam.cameraPathDraw,
  }))).toEqual({ cameras: 1, drawing: null });

  await button.click();
  await page.mouse.click(box.x + 180, box.y + 140, { button: "right" });
  expect(await page.evaluate(() => ({
    cameras: window.omnicamNode.__majoorOmniCam.state.cameras.length,
    drawing: window.omnicamNode.__majoorOmniCam.cameraPathDraw,
  }))).toEqual({ cameras: 1, drawing: null });
});
```

Run:

```bash
npx playwright test tests/frontend/camera-path-draw.spec.js
```

Also add a unit/browser assertion that `handleCameraPathPointerDown()` returns `false` for MMB and Alt+LMB while armed, and `true` for plain LMB.

---

# Task 12 — Documentation

## `docs/NODES.md`

Add under OmniCam Director:

```md
### Draw Camera Path

Use **Draw Camera Path** in the viewport tool rail to sketch a camera move from
Top View. OmniCam keeps the current camera height, distributes the resulting
keys across the active Playback Range, and creates a new animated camera.

- LMB drag: draw and commit the path.
- RMB or Escape: cancel without changing the scene.
- MMB / Maya Alt navigation remains available while the tool is armed.
- The generated camera follows the path by default.
- Use the existing **Look At** control to track a scene object. Clearing Look At
  restores the original tangent-based Follow Path orientation.

The freehand stroke itself is editor-only and is never serialized or recorded
into a playblast; only committed camera keyframes become Director state.
```

## `docs/SHORTCUTS.md`

Add:

```md
| Draw Camera Path + LMB drag | Draw and commit a new camera trajectory in Top View |
| Draw Camera Path + RMB | Cancel the uncommitted path |
| Escape while drawing | Cancel the uncommitted path without using Undo history |
```

And note that MMB/Maya Alt navigation is never stolen by the mode.

## `CHANGELOG.md`

Add under the current version/unreleased section:

```md
- Director: added freehand **Draw Camera Path** authoring in Top View with
  playback-range timing, tangent Follow Path orientation, non-destructive Look At,
  cancel-safe pointer handling, and editor-only path preview.
```

---

# Task 13 — Build and generated output

Never hand-edit `web/omnicam.js`.

```bash
npm run build
```

No `vite.config.mjs` change should be necessary; the new source modules are reached through normal relative imports.

---

# Task 14 — Full validation

Run in this order:

```bash
# targeted RED/GREEN contract
node --test tests/frontend/camera-path-draw.node.mjs

# all frontend unit tests
npm run test:unit

# line limits, locales, template contract, licenses, syntax
npm run check

# production bundle
npm run build

# browser suite
npm run test:browser

# backend/MotionScene regression suite
python -m pytest -q

# real ComfyUI harness when configured
npm run test:live
```

If `npm run check:contract` actually reports the new `data-act`, update `.template-contract.json` based on the checker output. Do not pre-emptively invent a contract entry.

---

## 15. Manual QA matrix

- [ ] activating the tool from Camera/Perspective/Front switches to Top View;
- [ ] source camera Y=2.3 => every generated key position has Y=2.3;
- [ ] playback range 48–144 => first key F48 and last key F144;
- [ ] no explicit range => full duration fallback;
- [ ] uneven mouse speed still produces spatially regular keys;
- [ ] any stroke produces <=32 keys;
- [ ] click/very short stroke creates no camera and no checkpoint;
- [ ] Escape during stroke creates no camera and no checkpoint;
- [ ] RMB cancels and no context menu appears afterwards;
- [ ] MMB works while armed;
- [ ] Shift+MMB pan works while armed;
- [ ] Maya Alt+LMB / Alt+MMB navigation works while armed;
- [ ] Follow Path points along the curve;
- [ ] source camera vertical target offset/pitch is preserved;
- [ ] FOV/roll/near/far/camera type are inherited;
- [ ] choosing Look At makes the camera track the object;
- [ ] clearing Look At restores the exact authored tangent targets;
- [ ] one Undo removes the created camera;
- [ ] Redo restores it;
- [ ] Look At change is a separate Undo step;
- [ ] save/reload persists only the committed camera, never a draft;
- [ ] playblast never contains the transient line;
- [ ] canvas fallback remains usable if WebGL rendering fails;
- [ ] source camera remains untouched; a new camera is created;
- [ ] LiteGraph behind the Director does not pan/zoom during the draw gesture.

---

## 16. Acceptance gates

```text
[PASS] existing RED contract is GREEN
[PASS] exactly one checkpoint for a valid draw
[PASS] zero checkpoint for arm/cancel/invalid stroke
[PASS] first key == captured In
[PASS] last key == captured Out
[PASS] <= 32 generated keys
[PASS] all positions keep captured camera Y
[PASS] Follow Path targets are tangent based
[PASS] Look At never overwrites authored key targets
[PASS] RMB/Escape cancel safely
[PASS] Maya/Blender navigation survives
[PASS] draft is never serialized
[PASS] draft is never recorded in playblast
[PASS] npm run test:unit
[PASS] npm run check
[PASS] npm run build
[PASS] npm run test:browser
[PASS] python -m pytest -q
[PASS] npm run test:live when the live harness is available
```

---

## 17. Risk register

**Too many keys:** pointermove can emit hundreds of events. Mitigation: arc-length resampling and 32-key cap.

**Mouse-speed-dependent motion:** raw event index must not map directly to time. Mitigation: spatial resampling before time distribution.

**Look At destroys Follow Path:** never commit resolved tracking target into an authored key. Constraint metadata only.

**Conflict with 2D Motion Tracks:** never reuse `data-motion-tool="track"`; use dedicated `data-act="draw-camera-path"`.

**Conflict with Maya/Blender navigation:** only plain LMB and RMB are consumed. All navigation modifiers pass through.

**Draft leaks into workflow:** draft lives on `ui.cameraPathDraw`, never `ui.state`.

**Draft leaks into playblast:** overlay function exits when `ui.recording` and render call is editor-only.

---

## 18. Recommended commits

```text
1. feat(director): add camera path draw lifecycle
2. feat(director): integrate camera path viewport tool
3. fix(director): preserve authored targets under look-at constraints
4. test(director): cover camera path browser interaction
5. docs(director): document camera path authoring
6. build(frontend): regenerate OmniCam bundle
```

Do not merge to `main` as part of this task unless explicitly requested.

---

## 19. Prompt ready for Codex

```text
Implement docs/superpowers/plans/2026-09-08-draw-camera-path.md on the current
feature/draw-camera-path branch only.

Read AGENTS.md and re-check the current official ComfyUI frontend extension docs
before coding. Use TDD; tests/frontend/camera-path-draw.node.mjs is intentionally
RED. Do not patch ComfyUI core, add backend routes, change MotionScene schema, or
reuse the 2D Motion Track drawing tool.

Preserve these contracts:
- transient draft stays outside ui.state;
- valid draw = exactly one undo checkpoint;
- arm/cancel/invalid draw = zero undo checkpoints;
- Top View + captured source-camera height + captured In/Out;
- screenToPlane() for pointer -> world conversion;
- arc-length resampling, max 32 camera keys;
- Follow Path targets are tangent based;
- Look At never overwrites key.camera.target;
- Maya/Blender navigation remains available while the mode is armed;
- draft overlay never enters playblast;
- web/omnicam.js is regenerated, never hand-edited;
- source modules remain below 800 lines.

Run every validation command in the plan before claiming completion. Do not merge
to main. If the branch moved after the plan commit, adapt patch hunks to the
current files while preserving the behavior and tests.
```

---

## 20. Definition of Done

The feature is done only when an artist can:

1. open OmniCam Director;
2. define a playback range;
3. activate Draw Camera Path;
4. draw from Top View;
5. release LMB and immediately obtain a new animated camera;
6. preview the motion;
7. select an existing scene object in Look At;
8. clear Look At and recover exactly the original Follow Path orientation;
9. Undo/Redo the draw and tracking changes coherently;
10. save/reload the workflow with no transient draw state;
11. create a playblast with no UI stroke burned into it;
12. keep normal Maya/Blender viewport navigation throughout the workflow.

The resulting data remains an ordinary Director camera and therefore continues through the existing `OMNICAM_MOTION_SCENE -> Monitor` pipeline with no model-specific or schema-specific debt.
