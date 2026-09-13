# OmniCam Spatial Camera Editor v2 — Gizmo & Camera Path Editor

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** turn OmniCam Director's existing camera/path tooling into a professional spatial camera editor with DCC-grade Translate/Rotate/Scale gizmos, direct point/curve editing, multi-point transforms, editable camera target paths, camera-path presets, per-key lens/roll/timing controls, and diagnostics — while preserving OmniCam's canonical keyframe/MotionScene architecture.

**Architecture:** this is an evolution of the existing Director, not a rewrite. The viewport gains a thin `TransformControls` adapter and focused path-editing modules, but every authored result still resolves to the existing camera keyframes, editor history and `OMNICAM_MOTION_SCENE`. Path UI is a spatial view of the canonical camera track; it must never become a second animation system.

**Tech Stack:** JavaScript ES modules, Three.js `0.180.0` bundled through Vite, `TransformControls` from the pinned Three.js dependency, existing OmniCam Director/editor state, Semantic Director API, Node unit tests, Playwright browser/live tests.

**Baseline repository:** `MajoorWaldi/ComfyUI-Majoor-OmniCam` `main` @ `7db6ed07d29b27f9b7da4db4f65c6a2455fedfd5` (2026-09-13).

**Recommended branch:** `feat/spatial-camera-editor-v2`

**Target path in repository:** `docs/superpowers/plans/2026-09-13-spatial-camera-editor-v2.md`

**Reference material used for the design:**

- OmniCam current source and `AGENTS.md`.
- User-provided `MiniMax_3DDirector_Pass2_20260909_115634(1).zip` as behavioral/UI reference only.
- `NyckM/3d-Camera-control-H3-Minimax` current public source as behavioral/reference implementation; do not copy implementation blindly.
- Higgsfield 3D Jutsu public documentation/changelog as product/UX reference only; no proprietary code is available or required.
- Official ComfyUI Core / Frontend / Server docs required by `AGENTS.md` before implementation.

---

# 1. Product decision

OmniCam should adopt the interaction quality of modern lightweight 3D layout tools without changing its core data model.

The target user experience is:

```text
Select camera / object / path
        ↓
DCC-style gizmo
        ↓
Translate / Rotate / Scale
        ↓
Direct spatial feedback
        ↓
One undoable editor transaction
        ↓
Canonical camera/object keyframes
        ↓
OMNICAM_EDITOR_STATE
        ↓
OMNICAM_MOTION_SCENE
        ↓
Monitor profile
        ↓
Wan / LTX / MiniMax H3 / future models
```

The target path workflow is:

```text
DRAW → EDIT POINTS → EDIT CURVE → RETIME → PREVIEW
```

and not:

```text
Path plugin state → separate H3 path document → separate animation engine
```

The core remains model-agnostic.

---

# 2. Non-negotiable repository constraints

Copied from OmniCam's current product rules and applied to this feature:

- Public product surface remains exactly three nodes:
  - `MajoorOmniCamDirector`
  - `MajoorOmniCamExtractor`
  - `MajoorOmniCamMonitor`
- `OMNICAM_MOTION_SCENE` remains the canonical interchange contract.
- No MiniMax-, Wan-, LTX-, Blender-, Unreal- or provider-specific semantics enter the viewport engine.
- No ComfyUI core patch.
- Production Three.js code uses OmniCam's bundled/pinned dependency, never a CDN.
- Current frontend dependency remains `three@0.180.0` unless a separate compatibility upgrade is approved.
- Hand-written source files must stay below 800 lines.
- Each independent feature belongs in a focused module.
- Camera math remains pure where possible and independently unit-testable.
- Editing requires no Comfy workflow execution.
- Target interaction performance is 60 fps at a 720p viewport on a normal desktop GPU.
- Key insertion/scrub/selection operations target < 50 ms UI response.
- Every camera math/serialization change requires regression tests.
- Changes to shortcuts require `docs/SHORTCUTS.md` updates.
- Changes to Director behavior require `docs/NODES.md` and/or `docs/USER_GUIDE.md` updates.

---

# 3. What already exists — DO NOT rewrite it

The executor must read these modules before writing code.

## 3.1 Existing spatial path authoring

`web-src/camera-path-authoring.js` already provides:

- raw spatial stroke cleanup;
- minimum-distance filtering;
- Ramer–Douglas–Peucker simplification;
- point caps;
- arc-length-based timing;
- conversion of a spatial path into ordinary OmniCam camera keyframes;
- Follow Path orientation derived from local path tangents.

This remains the path creation math.

## 3.2 Existing Bézier path handles

`web-src/camera-path-curve.js` already provides:

```text
Auto
Aligned
Free
Corner
```

and maps spatial tangent handles into the existing per-channel tangent representation.

Do not create a second curve representation.

## 3.3 Existing path point drag

`web-src/viewport/path-editing.js` already knows how to:

- resolve a path-key hit;
- resolve a curve-handle hit;
- project pointer movement onto a view-facing world plane;
- preserve a key's view-depth while dragging;
- promote dragged linear/hold keys to smooth where appropriate.

Keep this pure math and extend it rather than burying it inside DOM/Three event code.

## 3.4 Existing whole-path transform

`web-src/viewport-controls/path-gizmo.js` and `web-src/director/camera-path-transform.js` already support whole-path:

```text
Translate
Rotate
Scale
```

around the path centroid.

This math stays canonical. The new gizmo adapter should call it.

## 3.5 Existing path visualization and picking

Current viewport rendering already creates:

- `userData.omnicamPathKey` markers;
- selected spatial tangent handles;
- camera path graphics;
- camera/path picking logic.

The new implementation should upgrade presentation and selection behavior rather than replace the resource layer wholesale.

## 3.6 Existing viewport transform modes

The current UI already exposes:

```text
Translate
Rotate
Scale
Draw Path
Extend Path
World / Local
Spatial Snap
```

The upgrade is primarily interaction quality, target abstraction and path-edit mode clarity.

---

# 4. Reference behavior we want to reproduce

The goal is not pixel-for-pixel cloning. Reproduce the useful interaction concepts in OmniCam's own design system.

## 4.1 MiniMax 3D Director reference

The supplied build demonstrates a useful pattern:

- Three.js `TransformControls`-style manipulation;
- explicit control points on a camera spline;
- direct tangent manipulation;
- a selected point inspector;
- camera-path timing driven by path distance plus speed weighting;
- per-point tilt/FOV concepts;
- a visible look-at target;
- keyboard-aware tangent editing.

Important: use this as a behavioral reference. Do not copy generated/minified bundle code into OmniCam.

## 4.2 NyckM MiniMax H3 Camera reference

Useful generic ideas from the public project:

- smooth vs linear path interpolation;
- timing redistribution;
- angle unwrapping;
- optional orbit closure;
- common move presets such as orbit/rise/fall/push/pull/static;
- path diagnostics.

OmniCam should implement only model-independent variants in Director. H3-specific prompt compilation remains in Monitor profiles.

## 4.3 Higgsfield 3D Jutsu reference

Public 3D Jutsu material confirms the product direction:

- editable scene objects rather than regeneration-only interaction;
- direct move/rotate/scale;
- camera presets and trajectory editing;
- timeline-driven animation;
- blockout/previz as a first-class output.

OmniCam should pursue the same quality of *interaction*, while keeping its own local ComfyUI-first architecture.

---

# 5. Target UX

## 5.1 Main interaction modes

The left viewport rail should expose a clear transform stack:

```text
Q  Select
W  Translate
E  Rotate
R  Scale

Path:
P  Path Edit / Draw context
```

Keep existing click buttons; shortcuts are additive and scoped to the active OmniCam viewport.

Typing in inputs/textareas must suppress these shortcuts.

## 5.2 Transform gizmo appearance

Use Three.js `TransformControls` rendered inside OmniCam's WebGL scene.

### Translate

- red X arrow;
- green Y arrow;
- blue Z arrow;
- XY / XZ / YZ planar handles;
- center/free translate handle;
- constant-ish visual size in screen space;
- hover highlight;
- active axis highlight.

### Rotate

- X/Y/Z rotation rings;
- optional screen-space/free rotation ring only if reliable in all supported views;
- 15° snap with Ctrl when spatial snapping is enabled;
- no scale-like handles.

### Scale

- X/Y/Z scale handles;
- center uniform scale;
- scale disabled for ordinary cameras and camera targets;
- scale enabled for objects, selected path-point groups and whole paths.

## 5.3 Transform-space mode

Existing World/Local remains.

Rules:

```text
Objects:
  Translate  World or Local
  Rotate     Local by default; World only if matrix-safe path is implemented
  Scale      Local

Camera:
  Translate  World or Local
  Rotate     Local camera orientation
  Scale      disabled

Camera target:
  Translate  World
  Rotate     disabled
  Scale      disabled

Single path position point:
  Translate  World
  Rotate     camera orientation at that key
  Scale      disabled

Multi-point path selection:
  Translate  World
  Rotate     around path selection pivot
  Scale      around path selection pivot

Whole path:
  Translate / Rotate / Scale
```

Do not pretend world-space scale can be represented by the current simple size triplets if it would require shear.

## 5.4 Drag feedback

During manipulation show a compact transient HUD near the cursor or gizmo:

```text
X +2.43 m
Y +18.0°
Scale 1.20×
```

Precision modifiers:

```text
Shift  precision mode
Ctrl   snapping
Esc    cancel current transform
Enter  confirm modal transform if active
```

Mouse-driven `TransformControls` drags commit on pointer release.

## 5.5 Navigation conflict

While the TransformControls gizmo is dragging:

- disable viewport orbit/pan/fly gestures;
- keep playback paused;
- prevent object/path repicking;
- restore navigation on drag end or cancel;
- clear stuck drag state on window blur.

---

# 6. Path Edit Mode

A selected camera with keyframes can enter explicit **PATH EDIT** mode.

Suggested toolbar state:

```text
PATH
[ Draw ] [ Points ] [ Curve ] [ Whole ]
```

or one contextual Path button opening four sub-modes.

## 6.1 `Draw`

Use existing authoring math.

Support:

- click-draw discrete points;
- freehand stroke where already supported;
- finish with Enter/double-click;
- Esc cancels;
- Extend Path starts from the active camera's final authored key;
- Q/E or wheel+modifier changes drawing plane height only if the current projection mode supports a predictable world-space result;
- top/front/right/perspective remain valid path-authoring views.

## 6.2 `Points`

Render camera position keyframes as spatial control points.

Visual language:

```text
○ ordinary point
● selected point
◎ primary selected point
```

Point selection rules:

- click = replace selection;
- Shift+click = toggle point;
- click empty space = clear point selection but keep camera active;
- Delete/Backspace = delete selected path points subject to minimum-key rules;
- timeline selection and viewport selection remain synchronized.

## 6.3 `Curve`

When one position key is selected:

- show in/out tangent stems and knobs;
- retain existing `Auto / Aligned / Free / Corner` modes;
- dragging an Auto tangent promotes it to Aligned;
- Alt while dragging temporarily breaks opposite-handle coupling;
- context menu exposes tangent mode explicitly.

## 6.4 `Whole`

Clicking the curve itself with no nearby key can select the whole path.

Whole path supports:

```text
Move
Rotate
Scale
```

through the same TransformControls adapter.

---

# 7. Path selection model

Selection is editor/UI state, not MotionScene data.

Add a transient structure owned by Director:

```javascript
ui.pathSelection = {
  cameraId: null,
  frames: new Set(),
  primaryFrame: null,
  component: "position", // "position" | "target"
};
```

Rules:

- never serialize `Set` directly into workflow state;
- clearing or switching active camera clears incompatible path selection;
- if keyframes are retimed, selection follows the key identity through the operation rather than relying only on old frame numbers where practical;
- if current architecture has no stable key ID, use `{cameraId, frame}` for v2 and normalize selection after every retime/delete/insert.

Do not add persistent IDs to canonical keyframes solely for selection unless a separate schema change is approved.

---

# 8. Multi-point transform

Multi-select is a major OmniCam advantage over the references.

For selected path points:

```text
○──●──●──●──○
   selected
```

create one transform target at the selection pivot.

Default pivot:

```text
Median/centroid of selected position points
```

Apply transform from a frozen start snapshot each frame of the drag so there is no numerical compounding.

Pseudo-interface:

```javascript
transformSelectedPathKeys(keys, selectedFrames, {
  mode,
  origin,
  delta,
  rotationDeg,
  factors,
}) -> nextKeys
```

The helper must be pure and must return cloned keys.

### Position + target behavior

When transforming selected *position* keys:

- Translate moves camera position.
- If the key is in Follow Path mode with no explicit constraint, target may be recomputed from the path tangent after transform.
- If authored target/orientation is explicit, transform both position and target by the same group delta/rotation so framing is preserved.

The exact rule must be derived from the existing camera orientation mode rather than guessed per key.

---

# 9. Path pivot system

Whole-path and multi-point rotation/scale need a predictable pivot.

Add editor-only pivot modes:

```text
Selection Center  (default)
Path Center
First Point
Last Point
Camera Target
Selected Object
Custom Pivot       phase 2
```

State can live in editor preferences/state, not MotionScene.

Interface:

```javascript
resolvePathPivot({
  mode,
  keys,
  selectedFrames,
  camera,
  selectedObject,
  customPivot,
}) -> [x, y, z]
```

If the requested pivot is unavailable, fall back to Selection Center then Path Center.

---

# 10. Insert point directly on curve

Double-clicking the rendered path between keys inserts a new camera key.

## 10.1 Linear/smooth segment

- find nearest sampled path parameter;
- evaluate camera at that exact point/time;
- insert a key at the derived frame;
- preserve neighboring interpolation semantics;
- if no unused integer frame exists between neighbors, refuse cleanly with a status message instead of creating duplicate frames.

## 10.2 Bézier segment

For an authored Bézier position segment, use a proper cubic split (De Casteljau) so insertion does not visibly reshape the path.

Pure helper:

```javascript
splitCubicBezier3D(p0, p1, p2, p3, t) -> {
  left:  [l0, l1, l2, l3],
  right: [r0, r1, r2, r3],
  point: [x, y, z],
}
```

The inserted key receives handles corresponding to the two split cubics.

Test exact continuity before and after split at multiple `t` values.

---

# 11. Delete point behavior

Deleting path points must be deterministic.

Rules:

- never allow deletion to leave a camera track in an invalid state;
- one-key static camera remains valid if current track contract permits it;
- selected points are removed in one history checkpoint;
- Auto neighboring tangents naturally recompute;
- explicit Free/Aligned neighboring tangents are preserved unless they reference invalid/deleted data;
- active frame is clamped if required;
- viewport and timeline selection refresh immediately.

One delete gesture = one undo step.

---

# 12. Target Path editing

OmniCam already stores `camera.target` per camera key. Use that existing data to expose a second spatial path without introducing a new animation document.

Path component toggle:

```text
POSITION | TARGET
```

## 12.1 Target markers

For each camera key:

```text
position marker  ●───── camera move
                  \
                   ··· target line
                    ◎ target marker
```

Selecting TARGET edits `key.camera.target`.

## 12.2 Constraints

If a camera is controlled by an object Look At constraint:

- target path markers are visible as derived/reference positions if useful;
- direct target editing is disabled;
- inspector explains `Driven by Look At: <object>`;
- provide `Bake Look At to Target Keys` only as a separate explicit command if existing constraint architecture can represent it safely.

Do not silently break a constraint when a user grabs a target marker.

## 12.3 Whole target path

Phase 2 can allow multi-point/whole-target-path transforms using the same selection engine.

---

# 13. Camera point inspector

When one path key is primary-selected, Inspector should switch to a compact **Camera Path Point** section.

Target fields:

```text
Point
  Frame
  Timecode

Position
  X
  Y
  Z

Orientation
  Look At / Target
  Roll

Lens
  FOV
  optional focal-length display derived from the current sensor convention

Curve
  Spatial mode: Auto / Aligned / Free / Corner
  Interpolation: Hold / Linear / Smooth / Bézier

Timing
  Previous segment duration
  Next segment duration
  Derived speed
  Timing weight (after Task 10)
```

FOV and Roll already belong to the ordinary camera key; do not create duplicate fields.

Edits go through existing camera key update/history pathways.

---

# 14. Timing model

## 14.1 Canonical truth remains frame positions

Actual playback timing remains keyframe `frame` values.

## 14.2 Timing weight

Add an optional model-independent editor property only if persistence is required:

```javascript
key.timing = {
  weight: 1.0,
};
```

Validation:

```text
finite number
0.1 <= weight <= 10.0
```

Default is `1.0` when absent.

This field means *authoring preference used by timing redistribution*, not runtime playback speed by itself.

Adding the optional property is backward-compatible, but serializer/validator/round-trip tests are mandatory.

## 14.3 Redistribute timing

Provide:

```text
Redistribute Timing
```

Algorithm:

1. preserve first and last frame;
2. compute spatial distance per segment;
3. calculate segment cost using average adjacent timing weights;
4. distribute internal frames proportionally;
5. guarantee strictly increasing frames;
6. if duration has fewer available frame slots than keys, refuse with a clear message.

Pure helper:

```javascript
redistributeCameraPathTiming(keys, {
  startFrame,
  endFrame,
}) -> nextKeys
```

No model-specific H3 timing contract belongs here.

---

# 15. Path visualization v2

The path overlay should communicate editability and motion quality.

## 15.1 Base curve

- neutral high-contrast path line;
- active camera path brighter than inactive camera paths;
- selected segment/keys highlighted;
- path remains readable in dark and light-ish Comfy themes.

## 15.2 Point labels

Optional compact labels for selected/hovered keys:

```text
F0
F24
F72
```

Do not render labels for every key when zoomed out if it hurts readability.

## 15.3 Speed heatmap

Optional overlay mode derived from sampled world-space speed:

```text
slow → normal → fast → very fast
```

Use a perceptually distinct multi-stop scale but do not make color the only signal; optionally vary small segment ticks/density.

Derived speed:

```javascript
speed = worldDistance / ((frameB - frameA) / fps)
```

No persistent data required.

---

# 16. Path diagnostics

Add a pure diagnostic layer, not an automatic fixer.

Initial checks:

```text
STATIC_SEGMENT
SPEED_SPIKE
HARD_DIRECTION_CHANGE
NEAR_ZERO_DURATION
ORBIT_NOT_CLOSED
CAMERA_NEAR_OBJECT
CAMERA_INTERSECTION   if reliable bounds are available
```

Interface:

```javascript
analyzeCameraPath({
  keys,
  fps,
  objects,
  sampleCamera,
}) -> Array<{
  code,
  severity,
  frameStart,
  frameEnd,
  message,
}>
```

Do not claim physical collision accuracy for proxy bounds.

UI examples:

```text
⚠ Speed spike F48–F52
⚠ Camera passes through Sofa proxy near F71
```

Diagnostics never mutate the path automatically.

---

# 17. Camera path presets

Presets should generate ordinary OmniCam keyframes through reusable model-independent math.

Initial preset set:

```text
Static
Dolly In
Dolly Out
Truck Left
Truck Right
Pedestal Up
Pedestal Down
Crane Up
Crane Down
Arc Left
Arc Right
Orbit
Spiral
```

Phase 2:

```text
Dolly Zoom
Robo Arm / compound arc
Handheld procedural guide path
```

Do not reproduce Higgsfield's large branded preset catalogue. Implement camera-language primitives that OmniCam can combine.

## Preset interface

```javascript
createCameraPathPreset({
  type,
  camera,
  target,
  startFrame,
  endFrame,
  params,
}) -> keyframes
```

Example Orbit params:

```javascript
{
  degrees: 180,
  direction: "cw",
  radius: 3.0,
  heightOffset: 0,
  samples: 5,
  close: false,
}
```

All generated keys must pass the same camera/key validation as hand-authored keys.

---

# 18. TransformControls integration design

OmniCam already vendors `three@0.180.0`, so import from the pinned package:

```javascript
import { Object3D } from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
```

Do not import a ComfyUI-global Three namespace.

## 18.1 Adapter responsibility

Create:

`web-src/viewport/transform-controls-adapter.js`

It owns:

- one `TransformControls` instance;
- one invisible/neutral transform anchor `Object3D`;
- attach/detach;
- mode + space + snap synchronization;
- drag lifecycle;
- navigation enable/disable callbacks;
- conversion of anchor transforms into normalized deltas;
- cleanup/dispose.

It does **not** know how an OmniCam camera/object/path is stored.

Interface:

```javascript
createTransformControlsAdapter({
  THREE,
  camera,
  domElement,
  scene,
  onDragStart,
  onTransform,
  onDragEnd,
  onDraggingChanged,
})
```

Returned API:

```javascript
{
  attach(targetSpec),
  detach(),
  setCamera(camera),
  setMode("translate" | "rotate" | "scale"),
  setSpace("world" | "local"),
  setTranslationSnap(number | null),
  setRotationSnap(number | null),
  setScaleSnap(number | null),
  cancelDrag(),
  dispose(),
}
```

## 18.2 TargetSpec

The adapter consumes a generic target:

```javascript
{
  id: "camera_path:camera_1",
  type: "object" | "camera" | "camera_target" | "path_point" | "path_group" | "camera_path",
  position: [x, y, z],
  rotation: [rx, ry, rz],
  scale: [sx, sy, sz],
  allowedModes: ["translate", "rotate", "scale"],
}
```

`activeGizmoEntity()` or a successor `activeTransformTarget()` builds this spec.

## 18.3 Canonical mutation rule

Never attach TransformControls directly to the real render mesh and let it become the canonical state.

Correct flow:

```text
TransformControls changes proxy anchor
        ↓
calculate delta from frozen drag-start anchor
        ↓
apply OmniCam pure transform helper to frozen editor-state snapshot
        ↓
update canonical draft/live state
        ↓
render
        ↓
pointer up = serialize/commit one history action
```

This preserves undo, locks, keyframes and Agent consistency.

---

# 19. Unified transform target abstraction

Current custom gizmo logic handles object/camera/path cases directly. Introduce a focused target resolver.

Create:

`web-src/viewport-controls/transform-target.js`

Interface:

```javascript
resolveTransformTarget(ui) -> TargetSpec | null
```

Target types:

```text
object
camera
camera_target
path_point
path_group
camera_path
```

The resolver checks:

- locks;
- editor view vs camera view;
- path edit mode;
- active selection;
- allowed transform modes;
- pivot selection.

No pointer event logic in this module.

---

# 20. History and transaction semantics

One user drag = one undo step.

Lifecycle:

```text
pointer down on gizmo
    ↓
checkpoint once
capture base snapshot
    ↓
0..N live transform updates
    ↓
pointer up
serialize once
final refresh
```

Esc during drag:

```text
restore base snapshot
remove transient history checkpoint if current history API permits
render
```

If history API cannot remove the checkpoint safely, use the same cancellation pattern already used by OmniCam modal transforms.

Do not checkpoint on every `objectChange` event from TransformControls.

---

# 21. Viewport ↔ Timeline synchronization

The same keyframe must feel like one object in two views.

Required behavior:

```text
click path point F48
→ frame becomes 48 unless preference says selection-only
→ timeline key F48 selected
→ Inspector shows key F48

click timeline camera key F72
→ path point F72 becomes selected
→ Inspector shows key F72
→ optional viewport focus remains unchanged unless requested
```

Multi-selection:

- Shift-select in path should map to multi-selected camera keys where timeline architecture supports it;
- if timeline is currently single-selection only, path multi-selection remains valid and timeline highlights all selected frames without requiring a separate canonical selection model.

---

# 22. Semantic Director API

Manual UI and Agent must continue to converge on semantic operations.

Existing low-level operations such as `keyframe.upsert` remain valid.

Add high-level path operations only where they provide atomicity and safer Agent control.

Recommended additions:

```text
camera.path.insert_key
camera.path.delete_keys
camera.path.transform_keys
camera.path.set_spatial_mode
camera.path.redistribute_timing
camera.path.apply_preset
```

Example:

```json
{
  "type": "camera.path.transform_keys",
  "camera_id": "camera_1",
  "frames": [24, 48, 72],
  "transform": {
    "mode": "translate",
    "delta": [0.5, 0.0, -1.0]
  }
}
```

Rules:

- operation is atomic;
- respect camera lock;
- reject missing frames;
- reject invalid transforms;
- compute result using the same pure helpers as manual UI;
- semantic diff shows changed keyframes rather than raw internal state.

Do not expose raw Three.js matrices or Object3D serialization to the Agent API.

---

# 23. Accessibility and input rules

- All toolbar controls have `aria-label` / tooltip.
- Transform mode buttons expose `aria-pressed`.
- keyboard shortcuts are scoped to active Director viewport;
- shortcuts do not fire inside inputs, textareas, selects or contenteditable regions;
- focus ring remains visible for toolbar buttons;
- selected path point is indicated by geometry/size as well as color;
- Escape always has a predictable effect: cancel drag first, then exit sub-mode on next press if desired.

---

# 24. Performance rules

TransformControls itself is not the performance risk; repeated full scene rebuilds are.

During drag:

- update only changed path/camera/object resources where possible;
- avoid full asset reload;
- avoid re-uploading textures;
- avoid catalog calls;
- throttle expensive path diagnostics until drag end;
- path curve may be regenerated at animation-frame cadence;
- inspector number fields can update at animation-frame cadence rather than every pointer event.

Targets:

```text
60 fps typical transform drag
< 16.7 ms render/update budget typical
< 50 ms point selection / insertion response
no workflow queue
no diffusion model load
```

---

# 25. File map

## Existing files to modify

```text
web-src/viewport-controls.js
web-src/viewport-controls/interactions.js
web-src/viewport-controls/path-gizmo.js
web-src/viewport/path-editing.js
web-src/viewport/camera-picking.js
web-src/viewport/resources.js
web-src/viewport/scene.js
web-src/camera-path-authoring.js
web-src/camera-path-curve.js
web-src/director/camera-path-transform.js
web-src/director/core.js
web-src/director/methods/editor.js
web-src/template/viewport.js
web-src/commands.js
web-src/settings/catalogue.js
web-src/settings.js
web-src/styles/* relevant viewport/path styles
web-src/locales/en/*
web-src/locales/fr/*
web-src/director-api/ops.js or current semantic operation registry
web-src/director-api/validate.js
web-src/director-api/diff.js where required
```

Do not edit all of them automatically; touch only those needed after reading current implementation.

## New focused modules

```text
web-src/viewport/transform-controls-adapter.js
web-src/viewport-controls/transform-target.js
web-src/director/camera-path-selection.js
web-src/director/camera-path-insert.js
web-src/director/camera-path-timing.js
web-src/director/camera-path-presets.js
web-src/director/camera-path-diagnostics.js
web-src/viewport/path-overlay-style.js          # only if resources.js would grow too large
web-src/template/path-toolbar.js               # only if viewport.js would become crowded
```

Optional modules are created only when they materially isolate a responsibility.

## Tests to add

```text
tests/frontend/transform-controls-adapter.node.mjs
tests/frontend/camera-path-selection.node.mjs
tests/frontend/camera-path-insert.node.mjs
tests/frontend/camera-path-timing.node.mjs
tests/frontend/camera-path-presets.node.mjs
tests/frontend/camera-path-diagnostics.node.mjs
tests/frontend/spatial-camera-editor.spec.js
```

Extend existing tests for:

```text
camera-path-curve
path-key-picking
transform-gizmo
browser Director interactions
live ComfyUI Director mount
```

---

# 26. Implementation Plan

## Task 1 — Lock the current behavior with regression tests

**Files:**

- Test existing `tests/frontend/camera-path-curve.node.mjs`
- Test existing path picking/transform tests
- Create `tests/frontend/spatial-camera-editor-baseline.node.mjs` only if existing files cannot cover baseline behavior cleanly

**Produces:** a verified baseline proving current Draw Path, point drag, tangents and whole-path transform work before replacing the visible gizmo layer.

- [ ] Record current `main` SHA in the test/plan execution notes.
- [ ] Run `npm ci`.
- [ ] Run current unit suite:

```bash
npm run test:unit
```

- [ ] Run current browser suite:

```bash
npm run test:browser
```

- [ ] Add regression assertions covering:

```text
path point drag changes only intended key position
Bezier handle drag preserves opposite handle in aligned mode
whole-path translation preserves relative key offsets
whole-path rotation preserves relative radius
whole-path scale preserves path centroid
locked camera refuses path transform
```

- [ ] Run focused tests and prove green before feature code.
- [ ] Commit only baseline tests if new coverage was needed.

Suggested commit:

```bash
git commit -m "test(director): lock spatial camera editing baseline"
```

---

## Task 2 — Add the TransformControls adapter

**Files:**

- Create `web-src/viewport/transform-controls-adapter.js`
- Create `tests/frontend/transform-controls-adapter.node.mjs`
- Modify Three-surface audit script only if its current allowlist requires the new import path

**Consumes:** pinned `three@0.180.0`.

**Produces:** `createTransformControlsAdapter()` API from section 18.

- [ ] Write a failing unit test with a fake controls implementation proving mode/space/snap calls are forwarded.

Example test shape:

```javascript
const adapter = createTransformControlsAdapter({
  controlsFactory: () => fakeControls,
  scene: fakeScene,
  domElement: fakeCanvas,
  camera: fakeCamera,
});

adapter.setMode("rotate");
assert.equal(fakeControls.mode, "rotate");
```

- [ ] Add drag lifecycle test proving `onDragStart` fires once and `onTransform` can fire many times before one `onDragEnd`.
- [ ] Add `dispose()` test proving event listeners and scene resources are removed.
- [ ] Run the focused test and verify failure before implementation.
- [ ] Implement adapter around `TransformControls`.
- [ ] Use one proxy `Object3D` anchor.
- [ ] Add cancel/reset-to-drag-start support.
- [ ] Ensure no Comfy global `THREE` dependency.
- [ ] Run focused unit test.
- [ ] Run `npm run check:three` and `npm run check`.

Suggested commit:

```bash
git commit -m "feat(viewport): add TransformControls adapter"
```

---

## Task 3 — Introduce unified transform targets

**Files:**

- Create `web-src/viewport-controls/transform-target.js`
- Modify `web-src/viewport-controls.js`
- Test `tests/frontend/transform-target.node.mjs`

**Produces:** `resolveTransformTarget(ui)`.

- [ ] Write tests for each target type:

```text
object
camera
camera_target
camera_path
```

- [ ] Add lock tests.
- [ ] Add allowed-mode tests so camera scale is rejected.
- [ ] Implement `TargetSpec` resolver.
- [ ] Keep existing `activeGizmoEntity()` temporarily as a compatibility facade if many callers depend on it.
- [ ] Move no pointer logic into the target module.
- [ ] Run unit tests.

Suggested commit:

```bash
git commit -m "refactor(viewport): unify transform target resolution"
```

---

## Task 4 — Wire TransformControls for objects/cameras without changing path logic

**Files:**

- Modify `web-src/viewport/scene.js`
- Modify `web-src/viewport-controls/interactions.js`
- Modify `web-src/viewport-controls.js`
- Modify render/resource code only where needed
- Browser test `tests/frontend/spatial-camera-editor.spec.js`

**Goal:** first ship TransformControls on ordinary object/camera targets while keeping old path gizmo behavior behind the same math.

- [ ] Browser test: select object, W translate, drag gizmo, release, verify one history step.
- [ ] Browser test: switch E rotate and R scale.
- [ ] Browser test: select camera; scale unavailable.
- [ ] Browser test: camera target supports translate only.
- [ ] Browser test: orbit navigation is disabled while dragging.
- [ ] Browser test: Escape restores pre-drag transform.
- [ ] Implement adapter lifecycle inside WebGL viewport owner.
- [ ] Route transform deltas into current canonical mutation paths.
- [ ] Hide/disable old custom transform drawing when TransformControls is active.
- [ ] Keep a temporary feature setting only if rollback is necessary during implementation; remove it before final release unless deliberately retained.
- [ ] Run unit + browser tests.

Suggested commit:

```bash
git commit -m "feat(viewport): use Three transform controls for scene manipulation"
```

---

## Task 5 — Path-point selection and multi-selection

**Files:**

- Create `web-src/director/camera-path-selection.js`
- Modify `web-src/viewport/path-editing.js`
- Modify `web-src/viewport/camera-picking.js`
- Modify `web-src/viewport/resources.js`
- Add `tests/frontend/camera-path-selection.node.mjs`

**Produces:** transient `ui.pathSelection` helpers.

Interfaces:

```javascript
createPathSelection()
selectPathKey(selection, { cameraId, frame, additive })
clearPathSelection(selection)
normalizePathSelection(selection, camera)
selectedPathKeys(selection, camera)
```

- [ ] Write tests for replace selection.
- [ ] Write Shift-toggle selection test.
- [ ] Write camera-switch normalization test.
- [ ] Write retime/delete normalization test.
- [ ] Implement pure selection helpers.
- [ ] Wire click and Shift+click.
- [ ] Render primary/secondary selected markers distinctly.
- [ ] Keep selected camera active.
- [ ] Synchronize Inspector.
- [ ] Run tests.

Suggested commit:

```bash
git commit -m "feat(director): add camera path point multi-selection"
```

---

## Task 6 — TransformControls for path points, groups and whole path

**Files:**

- Modify `web-src/viewport-controls/transform-target.js`
- Modify `web-src/viewport-controls/path-gizmo.js`
- Modify `web-src/director/camera-path-transform.js`
- Extend selection tests and transform tests

**Produces:** path targets:

```text
path_point
path_group
camera_path
```

- [ ] Failing test: one selected point resolves to `path_point` target at exact key position.
- [ ] Failing test: three selected keys resolve to centroid `path_group`.
- [ ] Failing test: whole path preserves current whole-path transform behavior.
- [ ] Implement pure `transformSelectedPathKeys()` from section 8.
- [ ] Freeze base keys at drag start and derive each drag update from the snapshot.
- [ ] Single point Translate modifies one key.
- [ ] Multi-point Translate/Rotate/Scale modifies selected keys only.
- [ ] Whole mode continues transforming all keys.
- [ ] Respect locked track.
- [ ] One drag = one checkpoint.
- [ ] Run unit + browser tests.

Suggested commit:

```bash
git commit -m "feat(director): add gizmo transforms for camera path selections"
```

---

## Task 7 — Upgrade curve-handle editing

**Files:**

- Modify `web-src/camera-path-curve.js`
- Modify `web-src/viewport/path-editing.js`
- Modify `web-src/viewport/resources.js`
- Extend `tests/frontend/camera-path-curve.node.mjs`

**Goal:** preserve existing spatial Bézier model while improving interaction.

- [ ] Add test for temporary Alt-break behavior: dragged side changes without forced mirrored update while Alt is held.
- [ ] Add test that leaving Alt drag does not corrupt stored mode.
- [ ] Add test that Auto first-drag promotes to Aligned.
- [ ] Add selected-point-only tangent rendering.
- [ ] Increase hit target independently of visual knob size where needed.
- [ ] Add context menu/Inspector mode switch.
- [ ] Keep tangent handle drags lightweight; they do not need the full XYZ TransformControls gizmo.
- [ ] Run tests.

Suggested commit:

```bash
git commit -m "feat(director): refine spatial curve handle editing"
```

---

## Task 8 — Insert/delete camera path points

**Files:**

- Create `web-src/director/camera-path-insert.js`
- Modify `web-src/viewport/camera-picking.js`
- Modify `web-src/commands.js`
- Modify relevant semantic API ops/validation
- Add `tests/frontend/camera-path-insert.node.mjs`

**Produces:**

```javascript
splitCubicBezier3D(...)
insertCameraPathKey(...)
deleteCameraPathKeys(...)
```

- [ ] Test De Casteljau split continuity at `t=.25`, `.5`, `.75`.
- [ ] Test endpoints of split match original cubic.
- [ ] Test linear/smooth insertion.
- [ ] Test no free integer frame returns a safe refusal.
- [ ] Test delete selection is one atomic result.
- [ ] Wire double-click nearest curve segment to insertion.
- [ ] Wire Delete/Backspace to selected path points.
- [ ] Update timeline and Inspector selection.
- [ ] Add semantic operations `camera.path.insert_key` and `camera.path.delete_keys` if needed for Agent parity.
- [ ] Run tests.

Suggested commit:

```bash
git commit -m "feat(director): insert and delete camera path control points"
```

---

## Task 9 — Add Position / Target path editing

**Files:**

- Extend `web-src/director/camera-path-selection.js`
- Modify `web-src/viewport/resources.js`
- Modify `web-src/viewport-controls/transform-target.js`
- Modify Inspector template/editor methods
- Tests `tests/frontend/camera-target-path.node.mjs`

**Produces:** component selection `position | target`.

- [ ] Test target markers derive from `key.camera.target`.
- [ ] Test moving a target marker modifies target only.
- [ ] Test Look At constrained camera reports target path read-only.
- [ ] Add Position/Target toggle to contextual path UI/Inspector.
- [ ] Draw subtle position→target connection for primary key.
- [ ] Use transform adapter in translate-only mode for target points.
- [ ] Do not silently remove object Look At constraints.
- [ ] Run tests.

Suggested commit:

```bash
git commit -m "feat(director): edit camera target paths in the viewport"
```

---

## Task 10 — Add point Inspector, FOV, roll and timing weight

**Files:**

- Modify `web-src/director/methods/editor.js`
- Modify Inspector markup module(s)
- Create `web-src/director/camera-path-timing.js`
- Modify serializer/validator only if optional `key.timing.weight` is persisted
- Add `tests/frontend/camera-path-timing.node.mjs`

**Produces:**

```javascript
cameraPathTimingWeight(key)
redistributeCameraPathTiming(keys, range)
```

- [ ] Write default weight test (`1.0`).
- [ ] Write bound validation tests (`0.1..10`).
- [ ] Write constant-speed redistribution test.
- [ ] Write weighted slowdown/speedup test.
- [ ] Write insufficient-frame-space failure test.
- [ ] Add primary path-point Inspector section.
- [ ] Bind Position, Target, Roll and FOV to canonical camera key.
- [ ] Add Timing Weight.
- [ ] Add `Redistribute Timing` action.
- [ ] If new optional serialized field is used, add workflow round-trip regression fixture.
- [ ] Run tests.

Suggested commit:

```bash
git commit -m "feat(director): add camera path point timing and lens controls"
```

---

## Task 11 — Add path presets

**Files:**

- Create `web-src/director/camera-path-presets.js`
- Add contextual path preset UI
- Add `tests/frontend/camera-path-presets.node.mjs`
- Add semantic API `camera.path.apply_preset` if approved

- [ ] Write static preset test.
- [ ] Write Dolly In/Out direction and target-preservation tests.
- [ ] Write Arc Left/Right tests.
- [ ] Write Orbit radius/degrees/direction tests.
- [ ] Write Crane/Pedestal world-axis tests.
- [ ] Implement model-independent preset generator.
- [ ] Add compact preset dialog; do not add one toolbar button per preset.
- [ ] Generated keys use current playback range by default.
- [ ] Generated path remains fully editable by ordinary point/curve tools.
- [ ] Run tests.

Suggested commit:

```bash
git commit -m "feat(director): add editable camera path presets"
```

---

## Task 12 — Speed heatmap and path diagnostics

**Files:**

- Create `web-src/director/camera-path-diagnostics.js`
- Modify path overlay/resource rendering
- Add settings/overlay toggle if appropriate
- Add `tests/frontend/camera-path-diagnostics.node.mjs`

- [ ] Test derived speed across equal-distance/equal-frame segments.
- [ ] Test speed spike detection.
- [ ] Test static segment detection.
- [ ] Test near-zero duration handling.
- [ ] Test simple proxy intersection only if current scene bounds API is deterministic enough.
- [ ] Implement diagnostic list.
- [ ] Implement optional speed heatmap.
- [ ] Show diagnostics in Inspector/status panel.
- [ ] Do not mutate path automatically.
- [ ] Run tests.

Suggested commit:

```bash
git commit -m "feat(director): visualize and diagnose camera path motion"
```

---

## Task 13 — Viewport/timeline synchronization and shortcuts

**Files:**

- Modify timeline selection controller(s)
- Modify `web-src/commands.js`
- Modify `docs/SHORTCUTS.md`
- Browser test `tests/frontend/spatial-camera-editor.spec.js`

- [ ] Test viewport key selection highlights timeline frame.
- [ ] Test timeline key selection highlights spatial marker.
- [ ] Test Q/W/E/R are scoped to focused/active OmniCam viewport.
- [ ] Test input fields suppress shortcuts.
- [ ] Test Shift additive selection.
- [ ] Test Ctrl snapping modifier.
- [ ] Test Escape cancel.
- [ ] Update shortcuts doc.

Suggested commit:

```bash
git commit -m "feat(director): synchronize spatial path editing with timeline controls"
```

---

## Task 14 — Agent/Semantic API parity

**Files:**

- Modify semantic Director operation registry
- Modify validators/diff
- Modify Agent capabilities if high-level ops are exposed
- Add Director API regression tests

- [ ] Add atomic path transform validation test.
- [ ] Add locked-camera rejection test.
- [ ] Add missing-frame rejection test.
- [ ] Add stale revision test through existing Agent transaction contract.
- [ ] Implement only approved high-level path operations.
- [ ] Ensure operations call the same pure helpers as manual UI.
- [ ] Keep raw Three.js objects out of protocol.
- [ ] Verify semantic diff remains bounded.

Suggested commit:

```bash
git commit -m "feat(agent): expose safe semantic camera path operations"
```

---

## Task 15 — Browser/live QA and cleanup of old gizmo path

**Files:**

- `tests/frontend/spatial-camera-editor.spec.js`
- live Playwright tests where current harness supports Director viewport interaction
- remove dead custom-gizmo rendering only after parity is proven

- [ ] Test object transforms with new gizmo.
- [ ] Test camera transforms.
- [ ] Test one path point.
- [ ] Test multi-point transform.
- [ ] Test whole path transform.
- [ ] Test tangent edit.
- [ ] Test insert/delete.
- [ ] Test target path.
- [ ] Test workflow save/reload preserves camera/path data.
- [ ] Test latest ComfyUI browser lane.
- [ ] Test minimum frontend lane.
- [ ] Remove obsolete custom gizmo hit/render code that no longer has a fallback responsibility.
- [ ] Re-run source line limit and Three surface audits.

Suggested commit:

```bash
git commit -m "refactor(viewport): retire legacy gizmo rendering after parity"
```

---

## Task 16 — Documentation and release readiness

**Files:**

- `README.md`
- `docs/NODES.md`
- `docs/SHORTCUTS.md`
- `docs/USER_GUIDE.md`
- `CHANGELOG.md`
- screenshots/GIF only if repository documentation policy allows them

- [ ] Document Select/Translate/Rotate/Scale controls.
- [ ] Document Path Draw/Points/Curve/Whole modes.
- [ ] Document multi-select.
- [ ] Document Position/Target editing.
- [ ] Document presets and retime.
- [ ] Document that all paths remain model-independent MotionScene camera data.
- [ ] Update changelog with user-visible changes.
- [ ] Add no unsupported claim that MiniMax H3 will reproduce a 3D path exactly; Monitor profiles remain conditioning compilers.

Suggested commit:

```bash
git commit -m "docs(director): document Spatial Camera Editor v2"
```

---

# 27. Required test matrix

## Pure Node tests

Must cover:

```text
TransformControls adapter lifecycle
Transform target resolution
Selection normalization
Single/multi/whole path transforms
Bezier split math
Spatial tangent modes
Target path transforms
Timing redistribution
Preset geometry
Diagnostics
```

## Browser Playwright

Must cover:

```text
Toolbar modes
Gizmo visibility
Object drag
Camera drag
Navigation lock while dragging
Path key selection
Shift multi-select
Whole path selection
Tangent handle editing
Double-click insert
Delete
Position/Target switch
Inspector binding
Undo/redo
Save/reload
```

## Live ComfyUI

At minimum:

```text
Director node mounts
WebGL initializes
TransformControls module loads under Comfy CSP
No deprecated core import is required
Workflow serialization survives real save/load
VueNodes-enabled lane stays green where currently required
```

---

# 28. Manual QA checklist

Use a simple scene with:

```text
Floor
Cube
Character/subject proxy
Camera_1 with 5 keys
```

### Gizmo

- [ ] Object Translate X/Y/Z works.
- [ ] Object planar translate works.
- [ ] Object Rotate X/Y/Z works.
- [ ] Object Scale axis/uniform works.
- [ ] Camera cannot be scaled.
- [ ] Camera target cannot rotate/scale.
- [ ] World/Local labels match actual behavior.
- [ ] Ctrl snapping is visually predictable.
- [ ] Shift precision is usable.
- [ ] Escape cancels current drag.
- [ ] Orbit does not fire while gizmo is dragging.

### Path

- [ ] Point can be selected directly.
- [ ] Shift adds/removes points.
- [ ] One point can translate.
- [ ] Multi-point group translates/rotates/scales.
- [ ] Whole path transforms.
- [ ] Curve handles appear only where useful.
- [ ] Auto/Aligned/Free/Corner all behave correctly.
- [ ] Double-click insert does not visibly pop a Bézier curve.
- [ ] Delete is one undo step.
- [ ] Target path edits framing correctly.
- [ ] Look At constraint prevents contradictory target editing.
- [ ] Timeline and viewport stay synchronized.

### Playback

- [ ] Scrubbing updates camera without path-selection loss.
- [ ] Playback remains smooth with path overlays visible.
- [ ] FOV/roll changes interpolate as before.
- [ ] Retime preserves first/last frame.
- [ ] Speed heatmap updates after retime.

### Persistence

- [ ] Save workflow.
- [ ] Reload page/workflow.
- [ ] All keys/tangents/FOV/roll/timing metadata survive.
- [ ] No transient selection or TransformControls object is serialized.

---

# 29. Full verification gate

Run from a clean worktree.

```bash
npm ci
npm run build
git diff --exit-code -- web/ web-chunks/
npm run check
npm run test:unit
npm run test:browser
```

Run Python/full repository suites required by current CI even though the feature is frontend-heavy:

```bash
pytest -q
ruff check .
mypy
```

Run current Comfy compatibility matrix and browser lanes configured in `.github/workflows/test.yml`.

Verify package artifact with the existing repository packaging/audit scripts.

No release until the exact packaged archive contains the built frontend chunks required by `TransformControls` and Registry audit passes.

---

# 30. Definition of Done

Spatial Camera Editor v2 is complete only when:

- [ ] Three.js `TransformControls` is integrated through OmniCam's pinned package.
- [ ] No ComfyUI-global Three import is required.
- [ ] Object/camera transforms preserve existing behavior and undo semantics.
- [ ] Camera scale is disabled.
- [ ] Single path points are directly editable.
- [ ] Shift multi-selection works.
- [ ] Selected path point groups translate/rotate/scale.
- [ ] Whole path transforms remain supported.
- [ ] Spatial tangent modes remain compatible with existing paths.
- [ ] Curve insertion preserves Bézier shape.
- [ ] Delete/insert are atomic undo operations.
- [ ] Position and Target path editing are available.
- [ ] Look At constraints cannot be silently broken.
- [ ] FOV and roll are editable per path point using canonical camera-key data.
- [ ] Timing redistribution is model-independent and deterministic.
- [ ] Presets generate ordinary editable camera keys.
- [ ] Speed/diagnostic overlays are derived, not canonical state.
- [ ] Timeline and viewport selection are synchronized.
- [ ] Manual UI and Agent use the same pure path math/semantic operations.
- [ ] No H3/Wan/LTX behavior leaks into MotionScene authoring.
- [ ] Workflow save/reload remains backward compatible.
- [ ] Source files remain below 800 lines.
- [ ] Unit/browser/live CI passes.
- [ ] Documentation is updated.

---

# 31. Recommended delivery milestones

Do not land this as one giant PR.

## Milestone A — Professional Gizmo

```text
TransformControls adapter
Unified transform targets
Object/camera/target parity
Navigation lock
Snapping
Undo/cancel
```

This is independently useful and can merge first.

## Milestone B — Spatial Path Editing

```text
Point selection
Multi-select
Point/group/whole transforms
Curve handles UX
Insert/delete
```

## Milestone C — Camera Direction & Timing

```text
Target path
Point Inspector
FOV/roll
Timing weights
Redistribute timing
```

## Milestone D — Director Intelligence

```text
Path presets
Speed heatmap
Diagnostics
Semantic Agent path operations
```

This decomposition keeps every PR reviewable and testable.

---

# 32. Explicit non-goals for v2

Do not include these in the first implementation unless separately approved:

- Blender-grade graph editor rewrite;
- full quaternion animation authoring across every object type;
- physics simulation;
- spline IK;
- arbitrary NURBS editor;
- mesh deformation tools;
- model-specific MiniMax H3 path encoding in Director;
- Higgsfield API integration;
- proprietary Jutsu behavior that cannot be inferred from public UI/product behavior;
- replacing MotionScene;
- adding a fourth public OmniCam node.

---

# 33. Future v2.x / v3 ideas

After the core editor is stable:

```text
Box/lasso selection of path keys
Custom 3D pivot placement
Path segment selection
Ease handles directly on spatial points
Camera collision avoidance suggestions
Shot-to-shot path continuity tools
Motion smoothing/simplification slider
Orbit closure assistant
Handheld procedural modifier layer
Path library / saved camera moves
Camera rigs (dolly/crane/robot-arm abstractions)
Virtual camera/mobile control integration
Agent instruction: "tighten this orbit around the character"
Agent instruction: "slow the move around frame 50"
```

Every future feature still compiles back to canonical camera tracks/MotionScene.

---

# 34. Final target architecture

```text
                         DIRECTOR VIEWPORT
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
          TransformControls              Path Overlay
                 │                             │
                 │                ┌────────────┼────────────┐
                 │                │            │            │
                 │             Points       Curve        Target
                 │                │            │            │
                 └──────────────┬─┴────────────┴────────────┘
                                │
                      Transform Target Layer
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
              Object          Camera       Camera Path
                                               │
                                 ┌─────────────┼─────────────┐
                                 │             │             │
                              Single        Multi         Whole
                                 │             │             │
                                 └─────────────┴─────────────┘
                                               │
                                        Pure Path Math
                                               │
                     ┌─────────────────────────┼────────────────────────┐
                     │                         │                        │
                  Authoring                  Curve                   Timing
                     │                         │                        │
                     └─────────────────────────┴────────────────────────┘
                                               │
                                     Canonical Camera Keys
                                               │
                                   OMNICAM_EDITOR_STATE
                                               │
                                   OMNICAM_MOTION_SCENE
                                               │
                                      Monitor Profiles
                                               │
                              ┌────────────────┼────────────────┐
                              │                │                │
                             Wan              LTX          MiniMax H3
```

The most important rule is simple:

> **The Spatial Camera Editor is an interaction layer over OmniCam's canonical camera keyframes — never a second camera animation system.**

That is what allows OmniCam to gain the usability of MiniMax 3D Director / 3D Jutsu while remaining cleaner, model-agnostic and fully integrated into ComfyUI.
