# Camera Path Spatial Curve — Implementation Plan

**Goal:** turn the committed **Draw Camera Path** output into an editable spatial
curve. Each camera keyframe is a control point on the trajectory; it can be moved
in 3D and carries in/out Bézier tangent handles with modes **Auto Smooth /
Aligned / Free / Corner**. Keyframe control dots are drawn in a colour distinct
from the camera's path line and larger than a plain marker.

**Architecture:** no new stored curve model. Handles live on the existing
`key.tangents.channels.pos_x/pos_y/pos_z` structure that `sampleChannel()` already
interprets as a per-channel cubic Bézier when `key.interpolation === "bezier"`.
With the three position channels sharing fixed x-handles (`1/3`, `2/3`) they trace
one spatial cubic Bézier with control points `A, Hout, Hin, B`, so the path tube —
sampled through `sampleCamera()` — follows the new shape with no separate maths.
The user-facing handle mode is stored on `key.tangents.spatial_mode`; all mode
coupling happens in 3D in one pure module. `sanitizeState` already preserves
`tangents` (`{ ...key.tangents }`) and history is `JSON.stringify(state)`, so
nothing in the schema, sanitizer, Monitor, or MotionScene changes.

**Tech stack:** JavaScript ES modules, Director Canvas/WebGL viewport, existing
`screenToPlane()` / `resolveChannelHandles()` / `pickPathKey` patterns, Vite,
Node test runner.

## Mode mapping

| UI label     | 3D coupling in `writeSpatialHandle` / `setSpatialHandleMode` |
|--------------|-------------------------------------------------------------|
| Auto Smooth  | no stored handles; Catmull-Rom tangent from neighbours (live) |
| Aligned      | opposite handle kept colinear-opposite, its length preserved |
| Free         | only the dragged handle changes                              |
| Corner       | short handles pointed one third straight at each neighbour   |

Channels are always stored with `mode:"free"` so `resolveChannelHandles` is a pure
pass-through of the vectors computed in the module; the spatial mode never touches
the timeline F-curve editor's `tangents.mode`.

## Files

| Action | File | Purpose |
|---|---|---|
| CREATE | `web-src/camera-path-curve.js` | pure handle maths + mode coupling |
| CREATE | `tests/frontend/camera-path-curve.node.mjs` | unit tests for the module |
| CREATE | `tests/frontend/curve-handle-picking.node.mjs` | real-THREE `pickCurveHandle` |
| MODIFY | `web-src/viewport/resources.js` | enlarged/recoloured control dots; draw in/out handles + knobs |
| MODIFY | `web-src/viewport/render.js` | `pathKey` cache also keys on `interpolation` + `tangents` |
| MODIFY | `web-src/viewport/camera-picking.js` | `pickCurveHandle(pointer)` (raycast + pixel fallback) |
| MODIFY | `web-src/viewport/path-editing.js` | `curveHandleFromHit(hit)` |
| MODIFY | `web-src/viewport-controls/interactions.js` | `ui.curveHandleDrag` lifecycle |
| MODIFY | `web-src/director/methods/scene.js` | `setSpatialHandleMode(mode)` |
| MODIFY | `web-src/director/methods/editor.js` | `openPathKeyContext` + Handle Type submenu |
| MODIFY | `web-src/locales/fr.js` | FR strings |
| MODIFY | `docs/NODES.md`, `docs/SHORTCUTS.md`, `CHANGELOG.md` | user docs |
| GENERATED | `web/omnicam.js` | `npm run build` only; never hand-edit |

## Interaction contract

- A cyan handle knob wins a plain LMB drag over its own control dot and over
  orbiting (checked before `pickPathKey` / `pickGizmo`).
- The drag resolves on the view-facing plane through the key (`screenToPlane`),
  calls `writeSpatialHandle(key, side, world, { prevKey, nextKey })`, forces
  `ui.webgl.pathKey = ""`, re-samples the frame and repaints.
- One `checkpoint("Edit curve handle")` per drag (lazy, on first move); a bare
  click spends no undo slot. Cancel (`Esc` / pointercancel) reverts via `undo()`.
- Pointer-up: `scheduleSerialize()` + `refreshKeys()` + status `Curve handle updated`.
- Right-click a keyframe dot → `openPathKeyContext` → **Handle Type** submenu →
  `setSpatialHandleMode(mode)` (`checkpoint` → apply → `serialize` → `refreshKeys`
  → `render`).

## Rendering contract (`rebuildPath`)

- Active track keyframe marker: radius `0.17`, colour `0xffffff`, keeps
  `userData.omnicamPathKey` (existing move-point drag unchanged).
- Selected keyframe only: two `THREE.Line` stems + two knob spheres (`0x36d6c3`,
  radius `0.06`) at `spatialHandlePoints(key, prev, next)`, tagged
  `userData.omnicamCurveHandle = { cameraId, frame, side }` and
  `omnicamWidget = "gizmo"` (follows the Show Camera Gizmos toggle).

## Verification

1. `node scripts/run_node_tests.mjs` — all green, including the two new files:
   - `camera-path-curve.node.mjs`: world↔channel round-trip; aligned/free/corner/
     auto coupling; bezier promotion; `sampleCamera` bends off the straight line.
   - `curve-handle-picking.node.mjs`: `pickCurveHandle` by ray and by pixel radius,
     null when the path is hidden.
2. `node scripts/check_locales.mjs` — 100% FR coverage, `t(\`...\`)` budget unchanged.
3. `npm run build` — succeeds; `node --test tests/frontend/production-bundle.node.mjs`.
4. Manual: Draw Camera Path → select a keyframe → confirm the enlarged light dot
   and two cyan handles → drag a handle and watch the tube reshape live → switch
   Auto Smooth / Aligned / Free / Corner → save + reload keeps the shape → Ctrl+Z
   reverts handle edits one step at a time.
