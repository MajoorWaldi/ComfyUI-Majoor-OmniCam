# OmniCam Camera Semantics, Framing, Quick Camera and Lighting Intent

Status: implementation proposal  
Scope: Director, core camera analysis, prompt compiler IR, Monitor diagnostics, camera import interoperability  
Compatibility target: keep existing MotionScene v1 and Monitor output ordering stable

---

## 1. Goal

OmniCam already owns the hard part of camera control:

- canonical animated camera tracks;
- real 6DoF transforms;
- camera target and roll;
- vertical FOV and lens conversion;
- multi-camera cuts;
- motion phases;
- model-specific compilers;
- scene objects and real light objects;
- a model-neutral prompt compilation IR.

The missing layer is **cinematographic semantics**.

The system should be able to convert exact camera geometry into descriptions such as:

- medium close-up;
- front-right three-quarter view;
- slight low angle;
- natural 50 mm perspective;
- subject occupies 62% of the frame;
- slow dolly-in with a 35 degree orbit;
- warm key from camera-right with a cool rim from behind.

The implementation must remain deterministic. It must describe what is present in the authored MotionScene; it must not invent visual content, subject action or lighting that is not represented in the scene.

---

## 2. Architectural decision

### Do not create a second cinematic IR

OmniCam already has:

```text
MotionScene
    |
    v
PromptCompileIR
    |
    +--> profile prompt compiler
    +--> Monitor preview
```

The correct architecture is to **enrich the existing `PromptCompileIR`**.

Target:

```text
MotionScene
    |
    +--> camera track
    +--> scene objects
    +--> light objects
    |
    v
Deterministic semantic analyzers
    |
    +--> camera view semantics
    +--> framing semantics
    +--> lens semantics
    +--> lighting semantics
    +--> existing CameraPhase motion semantics
    |
    v
PromptCompileIR
    |
    +--> H3 dialect
    +--> Seedance dialect
    +--> Wan prompt dialect
    +--> generic/reference-video dialect
    |
    v
Monitor.final_prompt
```

### Persistence rule

Phase 1 must not bump `MotionScene.version`.

Semantic analysis is derived and transient.

Only artist-authored intent that cannot be reconstructed deterministically should be persisted. The first such field proposed here is the optional role of a light:

```json
{
  "type": "sun_light",
  "light_role": "key"
}
```

This is an additive object field and can remain compatible with MotionScene v1.

---

## 3. Current contracts that must remain stable

Do not break these invariants:

1. `CameraState.fov` is canonical **vertical FOV**.
2. Existing camera position / target / roll maths remain authoritative.
3. Existing `CameraPhase` and motion-phase segmentation remain the source of camera motion wording.
4. Existing Monitor outputs must not be reordered.
5. Profile preflight remains binding.
6. Existing workflows without subjects or lights must compile exactly as before.
7. Prompt semantics are compiler-side derivations, not hidden mutations of MotionScene.
8. Quick Camera is an additional authoring surface, not a replacement for TransformControls.
9. Lighting intent is derived from actual light objects; no synthetic light should be added by the compiler.
10. All semantic analysis modules remain pure Python and importable outside ComfyUI.

---

# PART A — CAMERA SEMANTIC ANALYZER

## 4. New core module

Create:

```text
omnicam/core/camera_semantics.py
```

Responsibilities:

- classify azimuth / viewpoint relative to the current target;
- classify elevation;
- classify roll style;
- classify lens family from vertical FOV using the canonical 24 mm sensor-height convention;
- calculate camera-to-target distance;
- calculate subject screen coverage from real projected bounds;
- calculate subject center offset;
- derive shot type from screen coverage;
- produce start/end shot semantics for an animated track.

It must use existing OmniCam camera math and projection utilities.

It must **not** introduce a second camera coordinate system.

---

## 5. Camera semantic vocabulary

### Viewpoint

Use a stable enum-like vocabulary:

```text
front
front_right_three_quarter
right_profile
rear_right_three_quarter
back
rear_left_three_quarter
left_profile
front_left_three_quarter
overhead
under_subject
```

Recommended horizontal sectors:

```text
front                     -22.5 .. +22.5
front_right_three_quarter +22.5 .. +67.5
right_profile             +67.5 .. +112.5
rear_right_three_quarter  +112.5 .. +157.5
back                      +157.5 .. 180 / -180 .. -157.5
rear_left_three_quarter   -157.5 .. -112.5
left_profile              -112.5 .. -67.5
front_left_three_quarter  -67.5 .. -22.5
```

Do not use world origin as the semantic center. The camera target or selected subject center is the reference.

### Vertical angle

```text
extreme_low
low
slight_low
eye_level
slight_high
high
overhead
```

Suggested elevation thresholds:

```text
< -45°    extreme_low
-45..-20  low
-20..-7   slight_low
-7..+7    eye_level
+7..+20   slight_high
+20..+65  high
> +65     overhead
```

### Roll style

```text
level
subtle_dutch
dutch
extreme_dutch
```

Suggested absolute roll thresholds:

```text
< 3°      level
3..8°     subtle_dutch
8..25°    dutch
> 25°     extreme_dutch
```

### Lens class

Use the existing canonical vertical-FOV to 35 mm-equivalent focal conversion.

```text
ultra_wide
wide
normal
short_telephoto
telephoto
long_telephoto
```

Suggested equivalent focal bands:

```text
< 20 mm      ultra_wide
20..32 mm    wide
32..60 mm    normal
60..100 mm   short_telephoto
100..180 mm  telephoto
> 180 mm     long_telephoto
```

The exact equivalent focal length should also be preserved numerically.

---

## 6. Framing analysis

Distance alone must not determine shot size.

Use real projected subject bounds.

### Subject selection order

For semantic analysis:

1. explicit camera target object when available;
2. object tagged `subject`;
3. object with id `subject`;
4. first enabled human/card/model object;
5. no subject framing analysis.

Do not silently choose lights, nulls or ground objects.

### Bounding box projection

For the selected object:

1. sample its world transform at the requested frame;
2. construct the 8 corners of the object's local axis-aligned box from `size`;
3. rotate corners by the world quaternion;
4. translate to world position;
5. project each corner with `core.projection.project_point`;
6. calculate normalized visible bounds.

Output:

```python
coverage_x: float
coverage_y: float
coverage_area: float
center_x: float
center_y: float
center_offset_x: float
center_offset_y: float
clipped: bool
visible_corner_ratio: float
```

### Shot classification

Use vertical subject coverage as the primary signal.

Initial thresholds:

```text
>= 0.92  extreme_close_up
>= 0.72  close_up
>= 0.55  medium_close_up
>= 0.38  medium_shot
>= 0.25  medium_long_shot
>= 0.15  full_shot
>= 0.07  wide_shot
<  0.07  extreme_wide_shot
```

These thresholds must live in one constant table and have unit tests.

Do not combine distance and focal length into an arbitrary weighted score when projected framing is available.

Fallback classification may use distance/FOV only when there is no analysable subject.

---

## 7. Proposed semantic dataclasses

Add to:

```text
omnicam/guides/model.py
```

```python
@dataclass(frozen=True, slots=True)
class FramingSemantic:
    shot_type: str
    coverage_x: float | None = None
    coverage_y: float | None = None
    coverage_area: float | None = None
    center_offset_x: float | None = None
    center_offset_y: float | None = None
    clipped: bool = False
    subject_id: str | None = None


@dataclass(frozen=True, slots=True)
class CameraViewSemantic:
    viewpoint: str
    vertical_angle: str
    roll_style: str
    distance: float
    focal_length_mm: float
    lens_class: str
    framing: FramingSemantic | None = None


@dataclass(frozen=True, slots=True)
class LightingSemantic:
    key_direction: str | None = None
    key_height: str | None = None
    key_color: str | None = None
    fill_direction: str | None = None
    fill_height: str | None = None
    fill_color: str | None = None
    rim_direction: str | None = None
    rim_height: str | None = None
    rim_color: str | None = None
    active_light_count: int = 0
```

Do not serialize these into MotionScene.

---

# PART B — ENRICH PROMPT COMPILE IR

## 8. Extend PromptCompileIR

Current IR already carries duration, base prompt, camera phases, cuts, subject trajectories, action cues, references and ShotIntent.

Extend it with:

```python
camera_start: CameraViewSemantic | None
camera_end: CameraViewSemantic | None
lighting: LightingSemantic | None
```

The analyzer should sample the opening camera at frame 0 and the closing camera at the final authored frame.

For multi-shot scenes, do not pretend these two values describe the whole edit. Phase 1 should use `None` for global start/end semantics on multi-shot edits.

---

## 9. Semantic prompt rendering

Create:

```text
omnicam/guides/cinematic_text.py
```

Responsibilities:

- render opening framing/viewpoint/lens;
- render meaningful framing transitions;
- render lighting summary;
- never duplicate literal motion already carried by CameraPhase;
- never emit values unsupported by the analysis.

Example output:

```text
The shot begins as a medium shot from a front-right three-quarter view,
at a slight low angle with a natural 50 mm perspective.
The subject grows from 42% to 68% of frame height by the end of the shot.
Lighting is led by a warm high key from camera-right with a cooler rim from behind.
```

A model profile decides which clauses it wants.

Do not force the same sentence into every target model.

---

# PART C — MOTION SEMANTICS

## 10. Keep CameraPhase as the authoritative motion system

Do not replace `segment_motion_phases`.

It already provides dolly, truck, crane, pan, tilt, roll, optical zoom, hold, pace, magnitudes and time spans.

Recommended optional additions to `CameraPhase`:

```python
strength: str = "moderate"
secondary_axis: str | None = None
secondary_ratio: float = 0.0
```

A secondary axis may be emitted only when:

```text
secondary_score >= 0.35 * primary_score
```

and it remains stable over the phase.

Avoid listing every tiny component.

---

# PART D — LIGHTING INTENT

## 11. Reuse real scene lights

OmniCam already supports:

```text
sun_light
point_light
spot_light
```

Do not create a parallel `metadata.lighting` representation for Phase 1.

Instead, enrich the existing light objects.

New optional field:

```json
{
  "light_role": "key"
}
```

Allowed roles:

```text
auto
key
fill
rim
background
practical
environment
```

`auto` means the semantic analyzer may infer a role from intensity and direction.

Explicit artist roles always win over inferred roles.

---

## 12. Lighting semantic analyzer

Create:

```text
omnicam/core/lighting_semantics.py
```

Inputs:

- scene objects;
- selected camera sample;
- selected subject center.

Outputs:

- active light count;
- primary key/fill/rim;
- direction relative to camera;
- vertical height classification;
- color string;
- relative intensity class.

Camera-relative horizontal vocabulary:

```text
front
front_right
right
rear_right
rear
rear_left
left
front_left
```

Vertical vocabulary:

```text
below
low
level
high
above
```

For point lights:

```text
direction = normalize(light.position - subject_center)
```

For spot/sun lights, use the light object's authored orientation when it exists. Fall back to position-to-subject only when needed.

Then transform direction into the camera basis so words such as `camera-right` remain correct regardless of world orientation.

---

## 13. Automatic light-role inference

Only infer when `light_role == "auto"` or absent.

Suggested deterministic heuristic:

1. enabled lights only;
2. highest intensity front/front-side source -> key;
3. next lower-intensity opposite/front-side source -> fill;
4. rear/rear-side source -> rim;
5. unclassified remainder stays unclassified unless its type/placement supports another role.

Never invent a fill or rim when none exists.

A one-light scene should compile as one-light lighting.

---

# PART E — QUICK CAMERA

## 14. Quick Camera is a second manipulator, not a new camera type

Add a compact Director authoring surface based on:

```text
azimuth
elevation
distance
```

This must edit the same canonical camera `position` and `target` fields.

No new serialized camera representation is allowed.

Given `target`, `azimuth`, `elevation`, and `distance`:

```python
x = target_x + distance * sin(azimuth) * cos(elevation)
y = target_y + distance * sin(elevation)
z = target_z + distance * cos(azimuth) * cos(elevation)
```

Use the repository's existing handedness consistently and unit test orientation signs against the Director views.

Preserve FOV, roll, near, far and camera type.

---

## 15. Quick Camera presets

Add:

```text
Front
Front 3/4 L
Front 3/4 R
Profile L
Profile R
Rear 3/4 L
Rear 3/4 R
Back
Top
Low
```

Preset action:

- orbits position around current target;
- preserves target;
- preserves current distance unless the preset explicitly changes it;
- creates/updates the playhead camera key using normal Director edit semantics;
- respects auto-key behavior;
- creates one undo checkpoint.

Do not bypass the existing camera edit lifecycle.

---

## 16. Frontend files

Recommended new module:

```text
web-src/quick-camera.js
```

Responsibilities:

- `cameraToSpherical(camera)`;
- `sphericalToCamera(camera, values)`;
- preset table;
- compact UI state;
- no Three.js dependency if simple DOM controls are sufficient.

Bind in:

```text
web-src/event-bindings/director-chrome.js
```

Template placement:

- camera Inspector;
- below Lens;
- collapsed by default in Simple mode;
- visible by default in Animation/Advanced mode if desired.

Do not add a second viewport.

---

# PART F — MONITOR SEMANTIC READOUT

## 17. Monitor panel

The Monitor should expose semantic diagnostics without changing node outputs.

Extend `panel_payload()` with optional:

```json
{
  "semantics": {
    "shot": "medium_close_up",
    "viewpoint": "front_right_three_quarter",
    "vertical_angle": "slight_low",
    "lens": "50.0 mm",
    "motion": "dolly_in",
    "lighting": "warm high key from camera-right"
  }
}
```

This is UI metadata only.

Do not add another Monitor socket in Phase 1.

Suggested panel blocks:

```text
SHOT
Medium close-up · 50 mm

VIEW
Front-right 3/4 · Slight low angle

MOTION
Dolly in · accelerating

COMPOSITION
Subject 54% -> 72%

LIGHT
Warm key · camera-right / high

MODEL TRANSLATION
DIRECT / APPROXIMATED / UNSUPPORTED
```

---

# PART G — LOAD3D CAMERA INTEROPERABILITY

## 18. Import bridge

Add a pure importer to `omnicam/core/importers.py`:

```python
def import_load3d_camera(
    camera_info: dict[str, Any],
    *,
    width: int,
    height: int,
    fps: int = 24,
    duration_frames: int = 1,
) -> OmniCamTrack:
    ...
```

Consume position, target, zoom, cameraType, quaternion, fov, aspect, near, far and frustum.

Rules:

- position and target are authoritative when both exist;
- vertical FOV maps directly to `CameraState.fov`;
- cameraType maps to `camera_type`;
- zoom maps directly;
- near/far map directly;
- quaternion is validation/reference data unless target is absent;
- frustum is not persisted into CameraState;
- no arbitrary grid-to-meter conversion.

### Director integration

Do not overload `solved_scene`.

Add a separate optional input in a version where frontend contract updates are intentional:

```python
IO.Custom("LOAD3D_CAMERA").Input("camera_info", optional=True)
```

Then compile it into a temporary upstream track.

Because adding a Director input changes frontend contract tests, implement this as its own commit/phase after the semantic system lands.

---

# PART H — PATCH PLAN

## 19. Patch 1 — semantic model types

```diff
diff --git a/omnicam/guides/model.py b/omnicam/guides/model.py
@@
 @dataclass(frozen=True, slots=True)
 class CameraPhase:
     ...
+
+@dataclass(frozen=True, slots=True)
+class FramingSemantic:
+    shot_type: str
+    coverage_x: float | None = None
+    coverage_y: float | None = None
+    coverage_area: float | None = None
+    center_offset_x: float | None = None
+    center_offset_y: float | None = None
+    clipped: bool = False
+    subject_id: str | None = None
+
+
+@dataclass(frozen=True, slots=True)
+class CameraViewSemantic:
+    viewpoint: str
+    vertical_angle: str
+    roll_style: str
+    distance: float
+    focal_length_mm: float
+    lens_class: str
+    framing: FramingSemantic | None = None
+
+
+@dataclass(frozen=True, slots=True)
+class LightingSemantic:
+    key_direction: str | None = None
+    key_height: str | None = None
+    key_color: str | None = None
+    fill_direction: str | None = None
+    fill_height: str | None = None
+    fill_color: str | None = None
+    rim_direction: str | None = None
+    rim_height: str | None = None
+    rim_color: str | None = None
+    active_light_count: int = 0
```

Add `__post_init__` validation for finite numbers and stable vocabularies.

---

## 20. Patch 2 — camera semantics module

```diff
diff --git a/omnicam/core/camera_semantics.py b/omnicam/core/camera_semantics.py
new file mode 100644
--- /dev/null
+++ b/omnicam/core/camera_semantics.py
@@
+from __future__ import annotations
+
+from typing import Any
+
+from .camera_math import fov_to_focal_length
+from .projection import project_point
+from .track import CameraState, OmniCamTrack, sample_object_world_transform
+from ..guides.model import CameraViewSemantic, FramingSemantic
+
+SENSOR_HEIGHT_MM = 24.0
+LIGHT_TYPES = {"sun_light", "point_light", "spot_light"}
+NON_SUBJECT_TYPES = {*LIGHT_TYPES, "null", "ground"}
+
+SHOT_THRESHOLDS = (
+    (0.92, "extreme_close_up"),
+    (0.72, "close_up"),
+    (0.55, "medium_close_up"),
+    (0.38, "medium_shot"),
+    (0.25, "medium_long_shot"),
+    (0.15, "full_shot"),
+    (0.07, "wide_shot"),
+    (0.00, "extreme_wide_shot"),
+)
+
+
+def classify_shot(coverage_y: float) -> str:
+    coverage = max(0.0, float(coverage_y))
+    for threshold, name in SHOT_THRESHOLDS:
+        if coverage >= threshold:
+            return name
+    return "extreme_wide_shot"
+
+
+def classify_roll(roll: float) -> str:
+    value = abs(float(roll))
+    if value < 3.0:
+        return "level"
+    if value < 8.0:
+        return "subtle_dutch"
+    if value < 25.0:
+        return "dutch"
+    return "extreme_dutch"
+
+
+def classify_lens(focal_mm: float) -> str:
+    if focal_mm < 20:
+        return "ultra_wide"
+    if focal_mm < 32:
+        return "wide"
+    if focal_mm < 60:
+        return "normal"
+    if focal_mm < 100:
+        return "short_telephoto"
+    if focal_mm < 180:
+        return "telephoto"
+    return "long_telephoto"
+
+
+def analyze_camera_view(
+    camera: CameraState,
+    *,
+    objects: list[dict[str, Any]],
+    width: int,
+    height: int,
+    frame: float,
+    subject_id: str | None = None,
+) -> CameraViewSemantic:
+    # Resolve subject, compute target-relative azimuth/elevation,
+    # project subject bounds, classify framing and convert vertical
+    # FOV to the canonical 35mm-equivalent focal length.
+    ...
+
+
+def analyze_track_endpoints(
+    track: OmniCamTrack,
+    *,
+    objects: list[dict[str, Any]],
+    subject_id: str | None = None,
+) -> tuple[CameraViewSemantic, CameraViewSemantic]:
+    last = max(0, track.duration_frames - 1)
+    return (
+        analyze_camera_view(track.sample(0), objects=objects, width=track.width, height=track.height, frame=0, subject_id=subject_id),
+        analyze_camera_view(track.sample(last), objects=objects, width=track.width, height=track.height, frame=last, subject_id=subject_id),
+    )
```

The implementation commit must replace `...` with deterministic code; this patch defines ownership and API shape.

---

## 21. Patch 3 — validate optional light role

```diff
diff --git a/omnicam/core/validation.py b/omnicam/core/validation.py
@@
 OBJECT_TYPES = frozenset({...})
+LIGHT_ROLES = frozenset({
+    "auto",
+    "key",
+    "fill",
+    "rim",
+    "background",
+    "practical",
+    "environment",
+})
@@
 def validate_object(...):
     ...
+    if "light_role" in obj:
+        if obj.get("type") not in {"sun_light", "point_light", "spot_light"}:
+            raise ValidationError(f"{path}.light_role is only valid on light objects")
+        obj["light_role"] = whitelist(
+            obj.get("light_role", "auto"),
+            LIGHT_ROLES,
+            f"{path}.light_role",
+        )
```

Frontend light creation default:

```json
{
  "light_role": "auto"
}
```

Old scenes without this field remain valid.

---

## 22. Patch 4 — lighting semantics module

```diff
diff --git a/omnicam/core/lighting_semantics.py b/omnicam/core/lighting_semantics.py
new file mode 100644
--- /dev/null
+++ b/omnicam/core/lighting_semantics.py
@@
+from __future__ import annotations
+
+from typing import Any
+
+from .track import CameraState
+from ..guides.model import LightingSemantic
+
+LIGHT_TYPES = {"sun_light", "point_light", "spot_light"}
+
+
+def analyze_lighting(
+    objects: list[dict[str, Any]],
+    camera: CameraState,
+    *,
+    frame: float,
+    subject_center: list[float],
+) -> LightingSemantic | None:
+    lights = [
+        obj for obj in objects
+        if obj.get("enabled", True) and obj.get("type") in LIGHT_TYPES
+    ]
+    if not lights:
+        return None
+
+    # Evaluate world transform.
+    # Convert direction into camera basis.
+    # Respect explicit light_role.
+    # Infer missing roles deterministically.
+    # Never synthesize a light that does not exist.
+    ...
```

---

## 23. Patch 5 — enrich PromptCompileIR

```diff
diff --git a/omnicam/guides/prompt_ir.py b/omnicam/guides/prompt_ir.py
@@
 class PromptCompileIR:
     duration_seconds: float
     base_prompt: str
     camera_phases: tuple[CameraPhase, ...]
+    camera_start: CameraViewSemantic | None
+    camera_end: CameraViewSemantic | None
+    lighting: LightingSemantic | None
     cuts: tuple[CutEvent, ...]
@@
 def build_prompt_compile_ir(request: CompileRequest) -> PromptCompileIR:
     scene = request.motion_scene
     camera = _selected_camera(scene)
     camera_phases = camera_phases_from_track(camera.track) if camera is not None else ()
+
+    camera_start = None
+    camera_end = None
+    lighting = None
+    if camera is not None and not scene.is_multi_shot:
+        camera_start, camera_end = analyze_track_endpoints(
+            camera.track,
+            objects=scene.objects,
+        )
+        lighting = analyze_lighting(
+            scene.objects,
+            camera.track.sample(0),
+            frame=0,
+            subject_center=list(camera.track.sample(0).target),
+        )
@@
     return PromptCompileIR(
         duration_seconds=request.duration_seconds,
         base_prompt=request.base_prompt,
         camera_phases=camera_phases,
+        camera_start=camera_start,
+        camera_end=camera_end,
+        lighting=lighting,
         cuts=tuple(scene.cuts),
         ...
     )
```

If the final implementation branch does not expose `MotionScene.is_multi_shot`, use the existing canonical helper rather than recreating cut logic.

---

## 24. Patch 6 — shared cinematic renderer

```diff
diff --git a/omnicam/guides/cinematic_text.py b/omnicam/guides/cinematic_text.py
new file mode 100644
--- /dev/null
+++ b/omnicam/guides/cinematic_text.py
@@
+from __future__ import annotations
+
+from .prompt_ir import PromptCompileIR
+
+SHOT_LABELS = {
+    "extreme_close_up": "extreme close-up",
+    "close_up": "close-up",
+    "medium_close_up": "medium close-up",
+    "medium_shot": "medium shot",
+    "medium_long_shot": "medium long shot",
+    "full_shot": "full shot",
+    "wide_shot": "wide shot",
+    "extreme_wide_shot": "extreme wide shot",
+}
+
+
+def camera_setup_sentence(ir: PromptCompileIR) -> str:
+    start = ir.camera_start
+    if start is None:
+        return ""
+    shot = SHOT_LABELS.get(
+        start.framing.shot_type if start.framing else "",
+        "",
+    )
+    pieces = [
+        shot,
+        start.viewpoint.replace("_", " "),
+        start.vertical_angle.replace("_", " "),
+        f"{start.focal_length_mm:.0f} mm perspective",
+    ]
+    return ", ".join(piece for piece in pieces if piece)
+
+
+def framing_transition_sentence(ir: PromptCompileIR) -> str:
+    start, end = ir.camera_start, ir.camera_end
+    if not start or not end or not start.framing or not end.framing:
+        return ""
+    a = start.framing.coverage_y
+    b = end.framing.coverage_y
+    if a is None or b is None or abs(b - a) < 0.08:
+        return ""
+    return f"The subject changes from {a * 100:.0f}% to {b * 100:.0f}% of frame height."
```

Model adapters may reuse these functions selectively.

---

## 25. Patch 7 — Quick Camera pure math

```diff
diff --git a/web-src/quick-camera.js b/web-src/quick-camera.js
new file mode 100644
--- /dev/null
+++ b/web-src/quick-camera.js
@@
+const RAD = Math.PI / 180;
+const DEG = 180 / Math.PI;
+
+export function cameraToSpherical(camera) {
+  const p = camera.position;
+  const t = camera.target;
+  const dx = p[0] - t[0];
+  const dy = p[1] - t[1];
+  const dz = p[2] - t[2];
+  const distance = Math.max(1e-6, Math.hypot(dx, dy, dz));
+  const elevation = Math.asin(dy / distance) * DEG;
+  const azimuth = Math.atan2(dx, dz) * DEG;
+  return { azimuth, elevation, distance };
+}
+
+export function sphericalToCamera(camera, values) {
+  const az = Number(values.azimuth) * RAD;
+  const el = Number(values.elevation) * RAD;
+  const distance = Math.max(0.001, Number(values.distance));
+  const target = [...camera.target];
+  const cosEl = Math.cos(el);
+  return {
+    ...camera,
+    target,
+    position: [
+      target[0] + distance * Math.sin(az) * cosEl,
+      target[1] + distance * Math.sin(el),
+      target[2] + distance * Math.cos(az) * cosEl,
+    ],
+  };
+}
+
+export const QUICK_CAMERA_PRESETS = {
+  front: { azimuth: 0 },
+  front_right_three_quarter: { azimuth: 45 },
+  right_profile: { azimuth: 90 },
+  rear_right_three_quarter: { azimuth: 135 },
+  back: { azimuth: 180 },
+  rear_left_three_quarter: { azimuth: -135 },
+  left_profile: { azimuth: -90 },
+  front_left_three_quarter: { azimuth: -45 },
+  top: { elevation: 75 },
+  low: { elevation: -20 },
+};
```

Important: verify signs against the existing Director front/back/right/left conventions before merge.

---

## 26. Patch 8 — bind Quick Camera through normal edit lifecycle

```diff
diff --git a/web-src/event-bindings/director-chrome.js b/web-src/event-bindings/director-chrome.js
@@
+import {
+  cameraToSpherical,
+  sphericalToCamera,
+  QUICK_CAMERA_PRESETS,
+} from "../quick-camera.js";
+
+function bindQuickCamera(ui, signal) {
+  const root = ui.root.querySelector('[data-role="quick-camera"]');
+  if (!root) return;
+
+  const commit = (next, label) => {
+    ui.checkpoint(label);
+    ui.beginCameraEdit();
+    ui.camera.position = [...next.position];
+    ui.camera.target = [...next.target];
+    ui.commitCameraEdit();
+    ui.finishCameraEdit();
+    ui.refreshInspector();
+    ui.render();
+  };
+
+  root.addEventListener("click", (event) => {
+    const button = event.target.closest("[data-camera-preset]");
+    if (!button) return;
+    const preset = QUICK_CAMERA_PRESETS[button.dataset.cameraPreset];
+    if (!preset) return;
+    const current = cameraToSpherical(ui.camera);
+    const next = sphericalToCamera(ui.camera, { ...current, ...preset });
+    commit(next, `Camera preset: ${button.dataset.cameraPreset}`);
+  }, { signal });
+}
```

Wire `bindQuickCamera` into the actual exported Director chrome binding function present at implementation time.

---

## 27. Patch 9 — optional light role in frontend

When creating a light object:

```diff
@@
 {
   type: "sun_light",
   ...
+  light_role: "auto",
 }
```

Inspector row:

```html
<select data-role="light-role">
  <option value="auto">Auto</option>
  <option value="key">Key</option>
  <option value="fill">Fill</option>
  <option value="rim">Rim</option>
  <option value="background">Background</option>
  <option value="practical">Practical</option>
  <option value="environment">Environment</option>
</select>
```

Bind it through the same object edit/undo lifecycle as intensity and color.

---

## 28. Patch 10 — Monitor semantic payload

```diff
diff --git a/omnicam/monitor/result.py b/omnicam/monitor/result.py
@@
 def panel_payload(
-    checks: Any, capabilities: dict[str, Any], target_profile: str, *, final_prompt: str = "",
+    checks: Any,
+    capabilities: dict[str, Any],
+    target_profile: str,
+    *,
+    final_prompt: str = "",
+    semantics: dict[str, Any] | None = None,
 ) -> dict[str, Any]:
     return {
         "preflight": [...],
         "capabilities": capabilities,
         "target_profile": target_profile,
         "final_prompt": final_prompt,
+        **({"semantics": semantics} if semantics else {}),
     }
```

Build the payload from the same `PromptCompileIR` used by prompt compilation so UI preview and queued output cannot disagree.

Do not independently re-run slightly different semantic maths in the frontend.

---

## 29. Patch 11 — Load3D camera importer

```diff
diff --git a/omnicam/core/importers.py b/omnicam/core/importers.py
@@
 def import_track_json(payload: dict[str, Any]) -> OmniCamTrack:
     return OmniCamTrack.from_dict(payload)
+
+
+def import_load3d_camera(
+    camera_info: dict[str, Any],
+    *,
+    width: int,
+    height: int,
+    fps: int = 24,
+    duration_frames: int = 1,
+) -> OmniCamTrack:
+    if not isinstance(camera_info, dict):
+        raise TypeError("camera_info must be a dict")
+
+    state = CameraState.from_dict({
+        "position": camera_info.get("position"),
+        "target": camera_info.get("target"),
+        "fov": camera_info.get("fov", 35.0),
+        "camera_type": camera_info.get("cameraType", "perspective"),
+        "zoom": camera_info.get("zoom", 1.0),
+        "near": camera_info.get("near", 0.01),
+        "far": camera_info.get("far", 10000.0),
+    })
+
+    payload = {
+        "fps": fps,
+        "duration_frames": max(1, duration_frames),
+        "width": width,
+        "height": height,
+        "render_mode": "omni_ref",
+        "keyframes": [{
+            "frame": 0,
+            "camera": asdict(state),
+            "interpolation": "linear",
+        }],
+        "objects": [],
+        "metadata": {
+            "source": "load3d_camera",
+            "source_aspect": camera_info.get("aspect"),
+        },
+    }
+    return OmniCamTrack.from_dict(payload)
```

Quaternion-to-target fallback may be added when target is absent. Do not override a valid explicit target.

---

# PART I — TEST PLAN

## 30. Python tests

Create:

```text
tests/test_camera_semantics.py
tests/test_lighting_semantics.py
tests/test_prompt_semantics.py
tests/test_load3d_camera_import.py
```

Required cases:

### Camera viewpoint

- front;
- all four three-quarter quadrants;
- both profiles;
- back;
- overhead;
- low angle;
- target offset away from origin.

### Roll

- 0° -> level;
- 2.9° -> level;
- 3° -> subtle;
- 8° -> dutch;
- 25° -> extreme.

### Lens

Test exact boundary behavior around 20, 32, 60, 100 and 180 mm.

### Framing

Use an actual cube/human/card with known transform.

Assert projected bounds, subject center offset, coverage, clipped state, shot type and a camera movement causing medium -> close transition.

### Lighting

- one key only;
- explicit key/fill/rim roles;
- auto inference;
- no light;
- disabled light ignored;
- camera rotation changes camera-relative direction without moving light;
- color survives semantic analysis.

### Prompt IR

- single-camera includes semantic start/end;
- multi-shot does not emit misleading global framing;
- no subject means framing may be `None`;
- no light means lighting is `None`;
- old prompt tests remain byte-for-byte stable until a profile explicitly opts into semantic text.

### Load3D

- position/target;
- vertical FOV;
- orthographic camera;
- near/far;
- explicit target beats quaternion fallback;
- no scale conversion.

---

## 31. Frontend tests

Add:

```text
tests/frontend/quick-camera.node.mjs
```

Test:

- camera -> spherical -> camera round-trip;
- front/right/back/left sign conventions;
- distance preservation;
- target preservation;
- FOV preservation;
- roll preservation;
- preset changes only intended channels.

Director integration tests:

- one undo checkpoint;
- existing playhead key updated;
- auto-key still respected;
- state serialization preserves canonical camera only;
- no `quick_camera` serialized duplicate state.

---

# PART J — IMPLEMENTATION ORDER

## 32. P0 — deterministic semantics core

Implement:

1. `FramingSemantic`;
2. `CameraViewSemantic`;
3. `camera_semantics.py`;
4. tests;
5. no prompt changes yet.

Acceptance:

- zero workflow changes;
- zero prompt changes;
- semantic analysis fully covered by tests.

---

## 33. P1 — PromptCompileIR integration

Implement:

1. enrich `PromptCompileIR`;
2. build start/end semantics;
3. add shared cinematic text helpers;
4. keep every existing profile output unchanged initially.

Acceptance:

- existing tests remain unchanged;
- new IR values are visible to profile compilers;
- no MotionScene schema bump.

---

## 34. P2 — profile opt-in

Enable semantics profile by profile.

Suggested order:

1. generic/reference-video enhanced mode;
2. H3 profiles where text semantics matter;
3. Seedance reference profile;
4. Wan prompt text only where camera embedding does not already encode the same information.

Rule:

If a model receives exact motion through an embedding/reference, semantic text should describe **framing and intent**, not redundantly repeat the trajectory.

---

## 35. P3 — lighting semantics

Implement:

1. `light_role`;
2. validation;
3. lighting analyzer;
4. prompt IR field;
5. Monitor panel;
6. profile-specific rendering.

No schema bump.

---

## 36. P4 — Quick Camera

Implement after semantic vocabulary is stable so the UI labels use the same terminology.

Acceptance:

- canonical camera remains single source of truth;
- no second viewport;
- no duplicate serialized representation;
- presets use normal undo/autokey lifecycle.

---

## 37. P5 — Load3D interoperability

Implement last because adding a Director input intentionally changes a public node contract.

Required work:

- importer;
- Director optional input;
- frontend contract test update;
- user documentation;
- example workflow.

---

# PART K — DO NOT DO

## 38. Rejected implementation patterns

Do not:

- replace current camera math with simplified yaw/pitch math;
- set roll to zero during semantic analysis;
- invent a fixed world-unit-to-meter multiplier;
- classify shot type from distance alone when a subject can be projected;
- store cinematic analysis inside every camera keyframe;
- create a second camera model for Quick Camera;
- create a separate lighting state disconnected from scene lights;
- duplicate motion phase logic in each profile;
- let frontend and Python use separate classification thresholds;
- add Monitor output sockets only for diagnostics;
- generate semantic labels with an LLM;
- silently assign a subject when only ground/lights/nulls exist;
- add a MotionScene version bump before a real persistence need exists.

---

# PART L — DEFINITION OF DONE

The feature set is complete when a shot authored once in Director can deterministically expose:

```json
{
  "camera_start": {
    "viewpoint": "front_right_three_quarter",
    "vertical_angle": "slight_low",
    "lens_class": "normal",
    "focal_length_mm": 50.0,
    "framing": {
      "shot_type": "medium_shot",
      "coverage_y": 0.40
    }
  },
  "camera_end": {
    "framing": {
      "shot_type": "close_up",
      "coverage_y": 0.70
    }
  },
  "camera_phases": [
    {
      "axis": "dolly_in"
    }
  ],
  "lighting": {
    "key_direction": "right",
    "key_height": "high",
    "key_color": "#ffd9b0",
    "rim_direction": "rear_left",
    "rim_color": "#9fbfff"
  }
}
```

and each model profile can translate only the parts its real control contract supports.

That keeps OmniCam's core principle intact:

**author motion and scene intent once, compile it honestly for the destination model.**
