# H3 Camera Contract Compiler — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:test-driven-development` while implementing each task, `superpowers:subagent-driven-development` or `superpowers:executing-plans` to execute the plan, and `superpowers:verification-before-completion` before claiming completion. Execute tasks in order and tick every checkbox.

**Goal:** make OmniCam compile a canonical 6DoF `MotionScene` camera into a precise MiniMax H3 scene-coverage contract: deterministic orbit/elevation/radius analysis, direction/parallax/completion semantics, automatic loop-closure detection, downstream `H3EDIT_OPTIONS`, strict representability preflight, and synchronized length/FPS outputs — without adding another public node or another camera representation.

**Architecture:** `MotionScene` remains the only product interchange contract. A new pure-Python H3 geometry layer derives spherical/orbital metadata from the selected OmniCam camera at compile time; a model-specific renderer turns that analysis into a complete H3 prompt and scene-coverage options. `OmniCam Monitor` exposes the compiled prompt/options and timing, while Director/Extractor remain model-agnostic.

**Tech Stack:** Python 3.10–3.13, ComfyUI V3 `IO.Schema` / `IO.NodeOutput`, existing `MotionScene` / `OmniCamTrack`, existing Monitor profile framework, JavaScript ES modules only for help/profile copy, pytest, Node test runner, Playwright where UI behavior changes.

**Spec:** this document, sections 1–10.

## Global Constraints

- Keep the public node surface at exactly three nodes: Director, Extractor, Monitor.
- Do not modify ComfyUI Core or its frontend.
- Do not change `MotionScene` or `MAJOOR_OMNICAM_TRACK` schemas for this feature.
- Keep all MiniMax/H3 semantics behind Monitor adapters/profiles.
- The external camera-control implementation used during research is **reference material only**. Do not import from it, vendor it, copy its identifiers, add its repository/name to Python/JS source comments, generated prompts, UI copy, tests, package metadata, changelog entries, or runtime diagnostics.
- Reimplement the required behavior from OmniCam's own camera math and canonical track data.
- Runtime integration contracts may name the actual downstream node classes/sockets that OmniCam must connect to; those are product compatibility contracts, not research-source attribution.
- Keep handwritten source files under 800 lines. Split by responsibility before crossing the limit.
- Add no mandatory runtime dependency and no new HTTP/WebSocket route.
- Existing `h3_native` and `h3_api` behavior must remain backward-compatible.
- Append new Monitor outputs; never reorder existing output sockets.
- New profile behavior must be testable without importing ComfyUI in pure geometry/prompt unit tests.
- Source image transport remains owned by the downstream H3 encoder. OmniCam Monitor does not duplicate or ingest the source image for this profile.

---

## 1. Sources checked before implementation

Re-checked on **2026-09-12** before writing this plan:

### Official ComfyUI

- Current stable release: `v0.35.0`, tag commit `40c4fcdf513a4523e39d54a9d391908af8df8171`.
- `comfy_extras/nodes_minimax_h3.py` on current Core:
  - MiniMax H3 uses 24 fps;
  - valid generation lengths use the `17n+5` grid;
  - `MiniMaxH3ReferenceToVideo` accepts `<Picture i>`, `<Video k>`, `<Audio j>` reference syntax;
  - `ref_videos` are IMAGE-frame batches representing 24 fps video.
- Current ComfyUI frontend extension architecture remains registration-based (`app.registerExtension`), hook-driven, and non-intrusive.

### OmniCam current base

Plan written against `main` at:

```text
3933cef4fb396d91955334e38b4a305b63e919c1
```

Current product invariants from `AGENTS.md` remain binding:

```text
Viewport / Timeline
        ↓
OMNICAM_EDITOR_STATE
        ↓
OMNICAM_MOTION_SCENE
        ↓
Monitor profile compiler
        ↓
model-native artifact
```

### Downstream H3 scene-coverage encoder contract

Verified current downstream behavior at commit:

```text
92ff5b926945e21d843fa618ba440ad2f96048e6
```

Required integration facts:

- encoder class: `TextEncodeH3Edit`;
- optional external compiler socket: `compiled_prompt: STRING`;
- optional options socket: `options: H3EDIT_OPTIONS`;
- options dictionary can override:
  - `mode`;
  - `prompt_mode`;
  - `quality_profile`;
  - `primary_image_role`;
  - `reference_mode`;
  - `source_fit`;
  - `semantic_resolution`;
  - `native_reference_size`;
  - `coverage_views`;
  - `coverage_arc_degrees`;
  - `coverage_direction`;
  - `coverage_hold_frames`;
  - `coverage_loop_closure`;
- scene-coverage profiles are 124, 243, or 362 frames at 24 fps;
- anchored 360° coverage can reuse the source image at the final frame when `coverage_loop_closure` is true.

Do not duplicate the downstream encoder's latent/reference preparation. OmniCam only compiles the camera intent and option contract.

---

## 2. Product contract

### New Monitor profile

Add:

```text
h3_scene_coverage
```

Display name:

```text
MiniMax H3 — Scene Coverage
```

Semantic:

```text
prompt_options
```

This profile consumes only the selected `MotionScene` camera and Monitor settings. A playblast is **not required**.

Outputs used by this profile:

```text
final_prompt      STRING
h3edit_options    H3EDIT_OPTIONS
target_width      INT
target_height     INT
target_length     INT
target_fps        FLOAT
```

Connection recipe:

```text
OmniCam Monitor.final_prompt
    → TextEncodeH3Edit.compiled_prompt

OmniCam Monitor.h3edit_options
    → TextEncodeH3Edit.options

OmniCam Monitor.target_width / target_height
    → TextEncodeH3Edit.width / height

OmniCam Monitor.target_fps
    → output video FPS / CreateVideo FPS
```

The artist continues to connect their source image directly to the downstream encoder's `source_image` input.

### What the profile represents

`h3_scene_coverage` is for a **single continuous, target-centric camera move** around a fixed scene/subject anchor. It may describe:

- orbit left/right;
- partial or full orbit;
- elevation changes;
- radius changes;
- smooth or linear timing;
- direction reversals;
- stable lens/focal setup;
- exact loop closure when the camera returns to the starting view.

It is **not** the fallback for arbitrary 6DoF cinematography. When the shot contains moving targets, significant roll/lens animation, cuts, or non-orbital camera motion that the scene-coverage contract cannot faithfully encode, preflight must recommend `h3_native` reference-video transport instead of silently simplifying the camera.

### Existing H3 profiles remain unchanged in purpose

```text
h3_native
    arbitrary reference-video camera motion through ComfyUI native H3 Ref2VA

h3_api
    arbitrary reference-video camera motion through the Comfy API transport

h3_scene_coverage
    no playblast; compile OmniCam camera geometry directly into prompt + H3EDIT_OPTIONS
```

---

## 3. Canonical geometry model

Create a pure module:

```text
omnicam/adapters/h3_geometry.py
```

This module must not import ComfyUI.

### Data types

Use frozen dataclasses so tests and profile code share an explicit contract:

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class H3OrbitSample:
    frame: int
    time_seconds: float
    azimuth_degrees: float
    elevation_degrees: float
    radius_ratio: float
    fov_degrees: float


@dataclass(frozen=True)
class H3OrbitSegment:
    start_frame: int
    end_frame: int
    start_seconds: float
    end_seconds: float
    delta_azimuth_degrees: float
    delta_elevation_degrees: float
    delta_radius_ratio: float
    rotation_degrees_per_second: float
    parallax_frame_widths: float
    direction: str
    speed_curve: str
    reverses_after: bool


@dataclass(frozen=True)
class H3GeometryAnalysis:
    samples: tuple[H3OrbitSample, ...]
    segments: tuple[H3OrbitSegment, ...]
    net_orbit_degrees: float
    total_orbit_degrees: float
    max_target_drift_ratio: float
    max_roll_delta_degrees: float
    max_fov_delta_degrees: float
    start_radius: float
    horizontal_fov_degrees: float
    coverage_direction: str
    loop_closure: bool
    endpoint_position_error_ratio: float
    endpoint_target_error_ratio: float
    timing_scale: float
```

### Fixed orbit anchor

For scene coverage, the orbit center is the frame-zero target:

```python
anchor = track.sample(0).target
```

Do **not** recenter each sample on its current target. Current-target recentering would hide target drift and incorrectly turn pan/truck motion into a clean orbit.

### Coordinate conversion

For every sampled camera position relative to the fixed anchor:

```python
dx = camera.position[0] - anchor[0]
dy = camera.position[1] - anchor[1]
dz = camera.position[2] - anchor[2]

radius = math.sqrt(dx * dx + dy * dy + dz * dz)
azimuth = math.degrees(math.atan2(dx, dz))
elevation = math.degrees(math.atan2(dy, math.hypot(dx, dz)))
radius_ratio = radius / start_radius
```

Reject a start radius below `1e-6`; there is no usable orbit basis.

### Azimuth unwrapping

Preserve full turns instead of collapsing 360° back to zero:

```python
def unwrap_degrees(previous_raw: float, previous_unwrapped: float, current_raw: float) -> float:
    delta = (current_raw - previous_raw + 180.0) % 360.0 - 180.0
    return previous_unwrapped + delta
```

A 360° orbit must end near ±360°, not 0°.

### Horizontal FOV

Treat OmniCam `CameraState.fov` as vertical FOV and derive horizontal FOV from the track canvas:

```python
def horizontal_fov(vertical_fov_degrees: float, aspect: float) -> float:
    half = math.radians(vertical_fov_degrees) * 0.5
    return math.degrees(2.0 * math.atan(math.tan(half) * aspect))
```

Use the average segment FOV for parallax estimates.

### Parallax magnitude

For a physical orbit segment, approximate how many frame widths background features traverse:

```python
frame_widths = abs(delta_azimuth_degrees) / max(horizontal_fov_degrees, 1e-6)
```

This is a **prompt contract metric**, not a geometric screen-space solver. Name it accordingly in code and docs.

### Direction convention

Use OmniCam's own coordinate convention, not any external editor convention.

Expected mapping after tests lock the current OmniCam camera math:

```text
positive unwrapped azimuth  → counterclockwise / camera left
negative unwrapped azimuth  → clockwise / camera right
```

The mapping must be asserted against `apply_camera_preset(..., "orbit_left")` and `apply_camera_preset(..., "orbit_right")`. If the existing camera math proves the opposite, fix the mapping in this module and the tests together; do not add a user-facing inversion switch.

### Reversal detection

A reversal occurs only when two meaningful adjacent orbit deltas have opposite signs:

```python
SIGNIFICANT_ORBIT_DELTA_DEGREES = 0.25
```

Ignore smaller noise.

### Loop closure

Loop closure is true only when **all** conditions pass:

```text
at least one full turn
absolute orbit remainder from N×360° <= 1.0°
endpoint position error <= 2% of start radius
endpoint target error <= 1% of start radius
final elevation difference <= 0.5°
final radius-ratio difference <= 0.01
final roll difference <= 0.5°
final FOV difference <= 1.0°
```

Multiple turns are not supported by the downstream coverage option because `coverage_arc_degrees` caps at 360°. Therefore:

```text
one approximately 360° turn  → representable, loop closure may be ON
more than 361° total/net turn → BLOCKED for h3_scene_coverage
```

Use `h3_native` for multi-turn camera choreography.

---

## 4. Representability contract

The new profile must distinguish **model-contract incompatibility** from general Camera Health recommendations.

Create:

```text
omnicam/adapters/h3_representability.py
```

Pure Python, no ComfyUI imports.

### Result type

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class H3Representability:
    state: str
    reasons: tuple[str, ...]
    recommendations: tuple[str, ...]
```

Allowed states:

```text
PASS
WARNING
BLOCKED
```

### Blocking rules

Block `h3_scene_coverage` when any condition is true:

```text
MotionScene contains cuts / is multi-shot
selected camera missing or disabled
start target radius < 1e-6
total orbit travel < 5° and the camera is not static
max target drift > 5% of start radius
max roll drift > 5°
max FOV drift > 10°
net or total orbit travel > 361°
trajectory is predominantly non-orbital translation
```

Predominantly non-orbital translation means the camera travels materially while angular travel stays tiny:

```python
analysis.total_orbit_degrees < 5.0 and camera_path_length > 0.05 * analysis.start_radius
```

A truly static camera is allowed and compiles as a hold.

### Warning rules

Warn but allow when:

```text
target drift > 1% but <= 5%
roll drift > 1° but <= 5°
FOV drift > 2° but <= 10°
elevation reaches |45°| or more
endpoint is near but not eligible for loop closure
timing must be remapped to a different H3 scene-coverage profile length
```

Warnings must state exactly what will be simplified or remapped.

### Recommendation copy

Every `BLOCKED` result ends with:

```text
Use MiniMax H3 Native reference-video transport for this camera move.
```

Do not claim that H3 cannot generate the move; only claim that this specific prompt/options representation cannot faithfully encode it.

---

## 5. H3 scene-coverage timing policy

Create model-specific timing helpers in:

```text
omnicam/adapters/h3_scene_coverage.py
```

Supported generation profiles:

```python
H3_SCENE_PROFILES = (
    (124, "scene coverage | 124-frame camera path"),
    (243, "scene coverage | 243-frame camera path"),
    (362, "scene coverage | 362-frame camera path"),
)
H3_SCENE_FPS = 24.0
```

### Selection rule

Given authored duration:

```python
requested_frames = max(1, math.ceil(duration_seconds * H3_SCENE_FPS))
```

Choose the smallest scene profile whose frame count is `>= requested_frames`.

Examples:

```text
72 frames  → 124
124        → 124
125        → 243
243        → 243
244        → 362
362        → 362
363+       → BLOCKED
```

This deliberately avoids speeding the authored move up. The H3 profile may slow/stretch it to fill the supported target horizon.

### Time remapping

Preserve relative keyframe timing:

```python
source_last = max(1, track.duration_frames - 1)
target_last = target_frames - 1
mapped_frame = round((source_frame / source_last) * target_last)
```

Prompt timestamps are generated from `mapped_frame / 24.0`.

Expose the scale:

```python
timing_scale = target_last / source_last
```

If `abs(timing_scale - 1.0) > 0.05`, preflight emits a warning naming both durations.

Do not mutate the `MotionScene` or camera track.

---

## 6. Complete H3 camera prompt contract

Create:

```text
omnicam/adapters/h3_camera_contract.py
```

This module renders only text from `H3GeometryAnalysis`, representability, mapped timing, and the artist's `base_prompt`.

### Public interface

```python
def build_h3_scene_coverage_prompt(
    track: OmniCamTrack,
    analysis: H3GeometryAnalysis,
    *,
    target_frames: int,
    base_prompt: str = "",
    max_segments: int = 12,
) -> str:
    ...
```

### Prompt structure

Generate one complete prompt using the current H3 section style:

```text
subject_definitions:
...

summary:
...

retention_analysis:
...

detailed_description:
...

overall_soundscape:
Silence.

non_diegetic_music:
N/A
```

### Required semantic blocks

The `detailed_description` must contain these concepts in this order:

1. **Reference anchor**
   - `<Picture 1>` is the exact opening frame and source composition.
   - the requested scene/subject remains fixed in world space.

2. **Camera-vs-subject contract**
   - only the physical camera moves;
   - no subject rotation is used to fake an orbit;
   - orbit is not a pan-in-place;
   - elevation is camera height/arc change, not a tilt-only cheat.

3. **Target and lens contract**
   - camera remains aimed at the same authored target;
   - preserve lens/FOV when representability says lens drift is negligible;
   - roll remains fixed when roll drift is negligible.

4. **Direction contract**
   - name camera-left/camera-right from OmniCam's derived direction;
   - name the opposite frame edge from which new background should enter;
   - state that mirrored background flow means the direction is wrong.

5. **Completion contract**
   - state total and net orbit degrees;
   - state target profile duration;
   - state average orbit degrees/second;
   - state the required final view (partial angle, opposite side, or returned start view).

6. **Parallax contract**
   - state approximate frame-width crossings for the orbit;
   - say physical perspective/occlusion change is required;
   - never prescribe a fake 2D translation box.

7. **Segment schedule**
   - exact mapped timestamps;
   - signed orbit delta;
   - elevation delta;
   - radius change;
   - angular speed;
   - speed curve;
   - reversals.

8. **Closure contract** when eligible
   - state that the final viewpoint must match the opening viewpoint;
   - mention that the source anchor is intentionally reused at the end by downstream conditioning;
   - do not mention implementation internals or latent mechanics in the user-facing prompt.

9. **Forbidden changes**
   - no cuts;
   - no subject animation/rotation;
   - no scene morph;
   - no digital zoom unless authored and explicitly representable;
   - no lighting change;
   - no visible camera guides/annotations.

10. **Artist prompt**
    - append the non-empty `base_prompt` once under `Additional art direction:`;
    - do not duplicate it across segments.

### Segment compaction

Do not emit one line per sampled frame.

Build candidate segments from camera keyframe spans. Merge adjacent spans only when all are true:

```text
same orbit direction
no reversal boundary
same qualitative elevation direction
same qualitative radius direction
```

If more than `max_segments` remain, merge the smallest adjacent compatible spans until the limit is met. Never merge across a reversal.

### Static camera

A static track produces a compact hold prompt:

```text
The camera remains locked to the opening viewpoint for the complete target duration.
```

Do not fabricate an orbit or parallax amount.

---

## 7. H3EDIT_OPTIONS compiler

In `omnicam/adapters/h3_scene_coverage.py`, add:

```python
def build_h3edit_scene_options(
    track: OmniCamTrack,
    analysis: H3GeometryAnalysis,
    *,
    target_frames: int,
) -> dict[str, object]:
    ...
```

Return every key the downstream encoder understands so hidden/legacy widgets cannot silently leak old workflow state into the compile:

```python
quality_profile = {
    124: "scene coverage | 124-frame camera path",
    243: "scene coverage | 243-frame camera path",
    362: "scene coverage | 362-frame camera path",
}[target_frames]

return {
    "mode": "scene coverage | canonical camera path",
    "show_overrides": True,
    "prompt_mode": "directed | frozen scene coverage",
    "quality_profile": quality_profile,
    "primary_image_role": "edit | strong scene anchor (FL2VA)",
    "reference_mode": "none (source only)",
    "source_fit": "crop center",
    "semantic_resolution": 1024,
    "native_reference_size": "match output area",
    "coverage_views": coverage_views(track),
    "coverage_arc_degrees": coverage_arc(analysis),
    "coverage_direction": analysis.coverage_direction,
    "coverage_hold_frames": 1,
    "coverage_loop_closure": analysis.loop_closure,
}
```

### `coverage_views`

Use the number of distinct camera keyframes after timing remap, clamped to `[2, 24]`:

```python
max(2, min(24, len(track.keyframes)))
```

A static two-key hold remains `2`.

### `coverage_arc_degrees`

```python
if analysis.total_orbit_degrees < 5.0:
    return 15.0
return max(15.0, min(360.0, abs(analysis.net_orbit_degrees)))
```

A static hold uses the downstream minimum 15° metadata value, but the compiled prompt explicitly commands a locked camera. This mismatch must be surfaced as a preflight note, not hidden.

### `coverage_direction`

Exact values:

```text
clockwise / camera right
counterclockwise / camera left
```

### `coverage_hold_frames`

Use `1` for OmniCam-authored continuous camera paths. The compiled prompt owns the actual timing and must not invent static holds around intermediate viewpoints.

---

## 8. File map

| Action | File | Responsibility |
|---|---|---|
| CREATE | `omnicam/adapters/h3_geometry.py` | canonical track → orbit/elevation/radius/parallax/closure analysis |
| CREATE | `omnicam/adapters/h3_representability.py` | scene-coverage compatibility rules |
| CREATE | `omnicam/adapters/h3_scene_coverage.py` | profile length selection + H3EDIT_OPTIONS compiler |
| CREATE | `omnicam/adapters/h3_camera_contract.py` | complete H3 prompt renderer |
| CREATE | `omnicam/profiles/h3_scene_coverage.py` | Monitor profile, preflight and compile orchestration |
| MODIFY | `omnicam/profiles/catalog.py` | register `h3_scene_coverage` |
| MODIFY | `omnicam/monitor/result.py` | optional `h3edit_options` payload |
| MODIFY | `omnicam/nodes/monitor.py` | append `h3edit_options` and `target_fps` outputs |
| MODIFY | `omnicam/adapters/registry.py` | downstream capability contract and current H3 pins |
| MODIFY | `omnicam/capabilities.py` or current capability resolver module | detect `TextEncodeH3Edit` socket compatibility if registry alone is insufficient |
| MODIFY | `tests/test_h3_profiles.py` | profile regressions |
| CREATE | `tests/test_h3_geometry.py` | geometry/unwrap/closure/reversal tests |
| CREATE | `tests/test_h3_camera_contract.py` | prompt/options contract tests |
| MODIFY | `tests/test_capabilities.py` | capability detection for new profile |
| MODIFY | `tests/test_profile_framework.py` | CompiledMotion/output compatibility if required |
| MODIFY | `web-src/help/defs.js` | profile/output help copy only |
| MODIFY | `docs/NODES.md` | connection recipe and preflight behavior |
| MODIFY | `README.md` | profile table |
| MODIFY | `CHANGELOG.md` | release note |
| CREATE | `examples/workflows/08_minimax_h3_scene_coverage.json` | end-to-end example after implementation |
| GENERATED | `web/omnicam.js` + `web-chunks/*` | rebuild only if `web-src/` changed; never hand-edit |

No Director file changes are part of the compiler release.

---

# Task 0 — Establish the feature branch and baseline

**Files:** none.

- [ ] **Step 1: Create an isolated feature branch from current `main`.**

```bash
git switch main
git pull --ff-only
git switch -c feature/h3-camera-contract
```

- [ ] **Step 2: Verify the base commit is at or ahead of the plan base.**

```bash
git merge-base --is-ancestor 3933cef4fb396d91955334e38b4a305b63e919c1 HEAD
```

Expected: exit code `0`.

- [ ] **Step 3: Run the current H3/profile/capability tests before changing code.**

```bash
python -m pytest tests/test_h3_profiles.py tests/test_capabilities.py tests/test_profile_framework.py -q
```

Expected: PASS.

- [ ] **Step 4: Commit nothing.**

This task is only a baseline gate.

---

# Task 1 — Add pure H3 geometry analysis

**Files:**
- Create: `omnicam/adapters/h3_geometry.py`
- Create: `tests/test_h3_geometry.py`

**Interfaces:**
- Consumes: `OmniCamTrack`, `CameraState`.
- Produces: `H3OrbitSample`, `H3OrbitSegment`, `H3GeometryAnalysis`, `analyze_h3_geometry(track, *, target_frames=None)`.

- [ ] **Step 1: Write RED tests for unwrapped orbit and direction.**

```python
def test_full_orbit_stays_unwrapped():
    track = orbit_track(degrees=360.0, frames=124)
    analysis = analyze_h3_geometry(track)
    assert abs(abs(analysis.net_orbit_degrees) - 360.0) < 1.0
    assert analysis.total_orbit_degrees >= 359.0


def test_left_and_right_orbits_use_omnicam_direction_convention():
    left = analyze_h3_geometry(apply_camera_preset(base_track(), "orbit_left"))
    right = analyze_h3_geometry(apply_camera_preset(base_track(), "orbit_right"))
    assert left.coverage_direction == "counterclockwise / camera left"
    assert right.coverage_direction == "clockwise / camera right"
```

- [ ] **Step 2: Write RED tests for fixed-anchor target drift.**

```python
def test_target_drift_is_measured_against_frame_zero_anchor():
    track = track_with_moving_target()
    analysis = analyze_h3_geometry(track)
    assert analysis.max_target_drift_ratio > 0.0
```

- [ ] **Step 3: Write RED tests for loop closure.**

```python
def test_loop_closure_requires_matching_camera_state():
    closed = analyze_h3_geometry(orbit_track(degrees=360.0, frames=124))
    assert closed.loop_closure is True

    lens_drift = analyze_h3_geometry(orbit_track(degrees=360.0, frames=124, end_fov_delta=8.0))
    assert lens_drift.loop_closure is False

    radius_drift = analyze_h3_geometry(orbit_track(degrees=360.0, frames=124, end_radius_ratio=1.2))
    assert radius_drift.loop_closure is False
```

- [ ] **Step 4: Write RED tests for reversal and parallax metrics.**

```python
def test_reversal_is_preserved_as_segment_boundary():
    analysis = analyze_h3_geometry(reverse_orbit_track())
    assert any(segment.reverses_after for segment in analysis.segments)


def test_parallax_metric_scales_with_orbit_angle():
    small = analyze_h3_geometry(orbit_track(degrees=30.0, frames=124))
    large = analyze_h3_geometry(orbit_track(degrees=120.0, frames=124))
    assert sum(s.parallax_frame_widths for s in large.segments) > sum(
        s.parallax_frame_widths for s in small.segments
    )
```

- [ ] **Step 5: Run the tests and confirm RED.**

```bash
python -m pytest tests/test_h3_geometry.py -q
```

Expected: import/module failures.

- [ ] **Step 6: Implement the dataclasses and geometry functions exactly as specified in sections 3 and 5.**

Required exported names:

```python
__all__ = [
    "H3OrbitSample",
    "H3OrbitSegment",
    "H3GeometryAnalysis",
    "analyze_h3_geometry",
    "horizontal_fov",
]
```

- [ ] **Step 7: Run geometry tests.**

```bash
python -m pytest tests/test_h3_geometry.py -q
```

Expected: PASS.

- [ ] **Step 8: Run existing camera math regressions.**

```bash
python -m pytest tests/test_camera_tools.py tests/test_motion_semantics.py -q
```

Expected: PASS.

- [ ] **Step 9: Commit.**

```bash
git add omnicam/adapters/h3_geometry.py tests/test_h3_geometry.py
git commit -m "feat(h3): analyze scene coverage camera geometry"
```

---

# Task 2 — Add representability analysis

**Files:**
- Create: `omnicam/adapters/h3_representability.py`
- Modify: `tests/test_h3_geometry.py`

**Interfaces:**
- Consumes: `OmniCamTrack`, `H3GeometryAnalysis`, `is_multi_shot` boolean.
- Produces: `H3Representability`, `evaluate_h3_scene_coverage(...)`.

- [ ] **Step 1: Add RED tests for blocked pan/non-orbit, lens drift, roll and target drift.**

```python
def test_pan_in_place_is_blocked_for_scene_coverage():
    track = pan_in_place_track()
    analysis = analyze_h3_geometry(track)
    result = evaluate_h3_scene_coverage(track, analysis, is_multi_shot=False)
    assert result.state == "BLOCKED"
    assert any("reference-video" in item for item in result.recommendations)


def test_small_target_and_lens_drift_warns_not_blocks():
    track = mild_drift_orbit_track()
    analysis = analyze_h3_geometry(track)
    result = evaluate_h3_scene_coverage(track, analysis, is_multi_shot=False)
    assert result.state == "WARNING"
```

- [ ] **Step 2: Add RED tests for cuts and overlong/multi-turn coverage.**

```python
def test_multi_shot_is_blocked():
    track = orbit_track(degrees=90.0, frames=124)
    result = evaluate_h3_scene_coverage(
        track,
        analyze_h3_geometry(track),
        is_multi_shot=True,
    )
    assert result.state == "BLOCKED"


def test_more_than_one_turn_is_blocked():
    track = orbit_track(degrees=720.0, frames=243)
    result = evaluate_h3_scene_coverage(track, analyze_h3_geometry(track), is_multi_shot=False)
    assert result.state == "BLOCKED"
```

- [ ] **Step 3: Run and confirm RED.**

```bash
python -m pytest tests/test_h3_geometry.py -q
```

- [ ] **Step 4: Implement the exact blocking/warning thresholds from section 4.**

Do not import Monitor `Check` here; the adapter stays pure and returns its own result object.

- [ ] **Step 5: Run tests.**

```bash
python -m pytest tests/test_h3_geometry.py -q
```

Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add omnicam/adapters/h3_representability.py tests/test_h3_geometry.py
git commit -m "feat(h3): validate scene coverage representability"
```

---

# Task 3 — Add H3 timing and options compiler

**Files:**
- Create: `omnicam/adapters/h3_scene_coverage.py`
- Create: `tests/test_h3_camera_contract.py`

**Interfaces:**
- Consumes: `OmniCamTrack`, `H3GeometryAnalysis`, authored duration.
- Produces: `select_h3_scene_profile`, `map_h3_scene_frame`, `build_h3edit_scene_options`.

- [ ] **Step 1: Write RED tests for scene-profile selection.**

```python
import pytest


@pytest.mark.parametrize(
    ("requested", "expected"),
    [(72, 124), (124, 124), (125, 243), (243, 243), (244, 362), (362, 362)],
)
def test_scene_profile_uses_smallest_supported_non_shorter_length(requested, expected):
    assert select_h3_scene_profile(requested).frames == expected


def test_scene_profile_rejects_more_than_362_frames():
    with pytest.raises(ValueError, match="362"):
        select_h3_scene_profile(363)
```

- [ ] **Step 2: Write RED tests for complete options payload.**

```python
def test_scene_options_fill_every_downstream_key():
    track = orbit_track(degrees=180.0, frames=124)
    analysis = analyze_h3_geometry(track)
    options = build_h3edit_scene_options(track, analysis, target_frames=124)
    assert set(options) == {
        "mode",
        "show_overrides",
        "prompt_mode",
        "quality_profile",
        "primary_image_role",
        "reference_mode",
        "source_fit",
        "semantic_resolution",
        "native_reference_size",
        "coverage_views",
        "coverage_arc_degrees",
        "coverage_direction",
        "coverage_hold_frames",
        "coverage_loop_closure",
    }
    assert options["coverage_hold_frames"] == 1
```

- [ ] **Step 3: Write RED closure/options test.**

```python
def test_closed_360_orbit_enables_downstream_loop_closure():
    track = orbit_track(degrees=360.0, frames=124)
    options = build_h3edit_scene_options(track, analyze_h3_geometry(track), target_frames=124)
    assert options["coverage_arc_degrees"] == 360.0
    assert options["coverage_loop_closure"] is True
```

- [ ] **Step 4: Run and confirm RED.**

```bash
python -m pytest tests/test_h3_camera_contract.py -q
```

- [ ] **Step 5: Implement the timing/profile/options functions from sections 5 and 7.**

Required public names:

```python
__all__ = [
    "H3SceneProfile",
    "H3_SCENE_FPS",
    "H3_SCENE_PROFILES",
    "select_h3_scene_profile",
    "map_h3_scene_frame",
    "build_h3edit_scene_options",
]
```

- [ ] **Step 6: Run tests.**

```bash
python -m pytest tests/test_h3_camera_contract.py -q
```

Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add omnicam/adapters/h3_scene_coverage.py tests/test_h3_camera_contract.py
git commit -m "feat(h3): compile scene coverage timing and options"
```

---

# Task 4 — Add the complete camera contract prompt renderer

**Files:**
- Create: `omnicam/adapters/h3_camera_contract.py`
- Modify: `tests/test_h3_camera_contract.py`

**Interfaces:**
- Consumes: `OmniCamTrack`, `H3GeometryAnalysis`, `target_frames`, `base_prompt`.
- Produces: `build_h3_scene_coverage_prompt(...) -> str`.

- [ ] **Step 1: Write RED test for section structure and artist prompt de-duplication.**

```python
def test_prompt_is_complete_h3_document_and_artist_prompt_occurs_once():
    track = orbit_track(degrees=90.0, frames=124)
    analysis = analyze_h3_geometry(track)
    prompt = build_h3_scene_coverage_prompt(
        track,
        analysis,
        target_frames=124,
        base_prompt="A frozen product on a laboratory table.",
    )
    for heading in (
        "subject_definitions:",
        "summary:",
        "retention_analysis:",
        "detailed_description:",
        "overall_soundscape:",
        "non_diegetic_music:",
    ):
        assert heading in prompt
    assert prompt.count("A frozen product on a laboratory table.") == 1
```

- [ ] **Step 2: Write RED test for direction/parallax/completion contracts.**

```python
def test_prompt_contains_checkable_camera_contracts():
    track = orbit_track(degrees=180.0, frames=124)
    prompt = build_h3_scene_coverage_prompt(
        track,
        analyze_h3_geometry(track),
        target_frames=124,
    )
    assert "physical camera" in prompt.lower()
    assert "background" in prompt.lower()
    assert "180" in prompt
    assert "degrees per second" in prompt.lower()
    assert "parallax" in prompt.lower()
```

- [ ] **Step 3: Write RED test for reversals.**

```python
def test_prompt_names_reversal_without_inventing_cut():
    track = reverse_orbit_track()
    prompt = build_h3_scene_coverage_prompt(
        track,
        analyze_h3_geometry(track),
        target_frames=243,
    )
    assert "revers" in prompt.lower()
    assert "no cut" in prompt.lower()
```

- [ ] **Step 4: Write RED test for closed loop.**

```python
def test_prompt_requires_return_to_opening_view_when_closed():
    track = orbit_track(degrees=360.0, frames=124)
    prompt = build_h3_scene_coverage_prompt(
        track,
        analyze_h3_geometry(track),
        target_frames=124,
    )
    assert "opening viewpoint" in prompt.lower()
    assert "final" in prompt.lower()
```

- [ ] **Step 5: Write RED test for the research-source isolation rule.**

The test must scan generated prompt text and this new implementation module for forbidden research-source identifiers maintained as a private test constant. Do not put those identifiers in production files.

```python
def test_h3_compiler_has_no_research_source_attribution():
    production = Path("omnicam/adapters/h3_camera_contract.py").read_text(encoding="utf-8")
    for forbidden in RESEARCH_SOURCE_IDENTIFIERS:
        assert forbidden.lower() not in production.lower()
```

Keep `RESEARCH_SOURCE_IDENTIFIERS` in the test only.

- [ ] **Step 6: Run and confirm RED.**

```bash
python -m pytest tests/test_h3_camera_contract.py -q
```

- [ ] **Step 7: Implement the prompt renderer from section 6.**

Rules:

```text
- no proxy/playblast language in this profile
- no external-research attribution
- no fake screen-space bounding-box animation
- no more than 12 emitted camera segments
- preserve reversal boundaries
- base_prompt appended exactly once
```

- [ ] **Step 8: Run tests.**

```bash
python -m pytest tests/test_h3_camera_contract.py -q
```

Expected: PASS.

- [ ] **Step 9: Commit.**

```bash
git add omnicam/adapters/h3_camera_contract.py tests/test_h3_camera_contract.py
git commit -m "feat(h3): compile precise camera contract prompts"
```

---

# Task 5 — Add the `h3_scene_coverage` Monitor profile

**Files:**
- Create: `omnicam/profiles/h3_scene_coverage.py`
- Modify: `omnicam/profiles/catalog.py`
- Modify: `tests/test_h3_profiles.py`

**Interfaces:**
- Consumes: `CompileRequest`.
- Produces: `CompiledMotion(profile_id="h3_scene_coverage", ...)`.

- [ ] **Step 1: Write RED profile-resolution tests.**

```python
def test_h3_scene_coverage_resolves_to_supported_profile_length():
    request = _request(duration_seconds=6.0)
    timeline = H3_SCENE_COVERAGE_PROFILE.resolve_timeline(request)
    assert timeline.fps == 24.0
    assert timeline.frame_count == 243
```

- [ ] **Step 2: Write RED compile test.**

```python
def test_h3_scene_coverage_compiles_prompt_and_options_without_playblast():
    request = _request(playblast_video=None)
    result = H3_SCENE_COVERAGE_PROFILE.compile(request)
    assert result.profile_id == "h3_scene_coverage"
    assert result.semantic == "prompt_options"
    assert "detailed_description:" in result.final_prompt
    assert result.h3edit_options["prompt_mode"] == "directed | frozen scene coverage"
    assert result.reference_video is None
    assert result.reference_frames is None
```

- [ ] **Step 3: Write RED blocked-preflight test.**

```python
def test_h3_scene_coverage_blocks_non_orbital_camera():
    request = _request(scene=scene_with_pan_in_place())
    checks = H3_SCENE_COVERAGE_PROFILE.preflight(request)
    assert any(check.state == "BLOCKED" for check in checks)
    with pytest.raises(ValueError):
        H3_SCENE_COVERAGE_PROFILE.compile(request)
```

- [ ] **Step 4: Run and confirm RED.**

```bash
python -m pytest tests/test_h3_profiles.py -q
```

- [ ] **Step 5: Implement the profile.**

Skeleton:

```python
class H3SceneCoverageProfile:
    id = "h3_scene_coverage"
    display_name = "MiniMax H3 — Scene Coverage"
    semantic = "prompt_options"
    frame_policy = "h3_scene_coverage_profiles"

    def resolve_timeline(self, request: CompileRequest) -> ResolvedTimeline:
        requested = max(1, math.ceil(request.duration_seconds * 24.0))
        profile = select_h3_scene_profile(requested)
        return ResolvedTimeline(
            width=request.target_width,
            height=request.target_height,
            fps=24.0,
            duration_seconds=profile.frames / 24.0,
            frame_count=profile.frames,
            frame_policy=self.frame_policy,
        )
```

Compile flow:

```text
selected camera
→ analyze_h3_geometry
→ evaluate_h3_scene_coverage
→ convert representability to Monitor Checks
→ block if needed
→ resolve timeline
→ build_h3_scene_coverage_prompt
→ build_h3edit_scene_options
→ CompiledMotion
```

- [ ] **Step 6: Register in `PROFILE_REGISTRY` after `h3_native` and before `h3_api`.**

```python
H3_NATIVE_PROFILE,
H3_SCENE_COVERAGE_PROFILE,
H3_API_PROFILE,
```

- [ ] **Step 7: Run profile tests.**

```bash
python -m pytest tests/test_h3_profiles.py tests/test_profile_framework.py -q
```

Expected: PASS.

- [ ] **Step 8: Commit.**

```bash
git add omnicam/profiles/h3_scene_coverage.py omnicam/profiles/catalog.py tests/test_h3_profiles.py
git commit -m "feat(h3): add scene coverage monitor profile"
```

---

# Task 6 — Extend CompiledMotion and Monitor outputs without breaking sockets

**Files:**
- Modify: `omnicam/monitor/result.py`
- Modify: `omnicam/nodes/monitor.py`
- Modify: `tests/test_profile_framework.py`
- Modify: `tests/test_h3_profiles.py`

**Interfaces:**
- `CompiledMotion.h3edit_options: dict[str, object] | None = None`.
- Monitor appends `h3edit_options` and `target_fps` after the existing nine outputs.

- [ ] **Step 1: Write RED result-model test.**

```python
def test_compiled_motion_accepts_h3edit_options_without_affecting_existing_defaults():
    result = CompiledMotion(
        profile_id="x",
        semantic="prompt_options",
        timeline=_timeline(),
        h3edit_options={"mode": "scene coverage | canonical camera path"},
    )
    assert result.h3edit_options["mode"].startswith("scene coverage")
    assert result.reference_video is None
```

- [ ] **Step 2: Add field to `CompiledMotion`.**

```python
h3edit_options: dict[str, object] | None = None
```

Keep all existing fields/defaults unchanged.

- [ ] **Step 3: Append Monitor schema outputs.**

After existing `target_length`:

```python
IO.Custom("H3EDIT_OPTIONS").Output(display_name="h3edit_options"),
IO.Float.Output(display_name="target_fps"),
```

Do not insert them in the middle.

- [ ] **Step 4: Append execution values in the same order.**

```python
ordered = (
    result.final_prompt,
    result.reference_video,
    result.reference_frames,
    result.camera_embedding,
    result.native_tracks,
    result.tracks_json,
    result.timeline.width,
    result.timeline.height,
    result.timeline.frame_count,
    result.h3edit_options,
    float(result.timeline.fps),
)
```

- [ ] **Step 5: Add a regression asserting the first nine outputs keep their existing meaning/order.**

- [ ] **Step 6: Run node/profile tests.**

```bash
python -m pytest tests/test_profile_framework.py tests/test_h3_profiles.py -q
```

Expected: PASS.

- [ ] **Step 7: Commit.**

```bash
git add omnicam/monitor/result.py omnicam/nodes/monitor.py tests/test_profile_framework.py tests/test_h3_profiles.py
git commit -m "feat(monitor): expose H3 options and target fps"
```

---

# Task 7 — Add strict downstream capability detection

**Files:**
- Modify: `omnicam/adapters/registry.py`
- Modify: capability resolver only if current generic registry handling is insufficient
- Modify: `tests/test_capabilities.py`

**Interfaces:**
- New `ADAPTER_INFO["h3_scene_coverage"]` contract.

- [ ] **Step 1: Write RED verified capability test.**

Use a fake registered class exposing both required inputs:

```python
class Schema:
    inputs = (Socket("compiled_prompt"), Socket("options"))


class TextEncodeH3Edit:
    @classmethod
    def define_schema(cls):
        return Schema()
```

Assert:

```python
capabilities = detect_capabilities(node_class_mappings={"TextEncodeH3Edit": TextEncodeH3Edit})
assert capabilities["h3_scene_coverage"]["state"] == "verified"
```

- [ ] **Step 2: Write RED incompatible-socket test.**

Remove `options` and assert state is `incompatible`, not `verified`.

- [ ] **Step 3: Add registry contract.**

The actual runtime integration contract may name the downstream encoder repository because OmniCam already uses explicit upstream compatibility pins. Do **not** reference the research-only camera-control repository anywhere.

Expected contract shape:

```python
"h3_scene_coverage": _contract(
    display_name="MiniMax H3 — Scene Coverage",
    target="compiled H3 prompt + H3EDIT_OPTIONS",
    node_classes=[["TextEncodeH3Edit"]],
    inputs=["compiled_prompt", "options"],
    repository="https://github.com/ethanfel/ComfyUI-MiniMax-H3-Edit",
    tested_ref="92ff5b926945e21d843fa618ba440ad2f96048e6",
    tested_commit="92ff5b926945e21d843fa618ba440ad2f96048e6",
    docs="https://github.com/ethanfel/ComfyUI-MiniMax-H3-Edit",
    motion_limits={"length": "124/243/362 at 24 fps"},
    connection_recipe=(
        "Connect final_prompt to TextEncodeH3Edit.compiled_prompt and "
        "h3edit_options to TextEncodeH3Edit.options."
    ),
),
```

- [ ] **Step 4: Refresh existing official H3 Core pins from v0.34.0 to v0.35.0 only after verifying the exact v0.35.0 sockets in tests.**

Use:

```text
v0.35.0
40c4fcdf513a4523e39d54a9d391908af8df8171
```

Do not change unrelated Wan/LTX pins in this task.

- [ ] **Step 5: Run capability tests.**

```bash
python -m pytest tests/test_capabilities.py -q
```

Expected: PASS.

- [ ] **Step 6: Commit.**

```bash
git add omnicam/adapters/registry.py tests/test_capabilities.py
git commit -m "feat(h3): verify scene coverage downstream contract"
```

---

# Task 8 — Surface camera-contract diagnostics through existing Monitor preflight

**Files:**
- Modify: `omnicam/profiles/h3_scene_coverage.py`
- Modify: `tests/test_h3_profiles.py`

No bespoke frontend panel is required. Reuse the existing generic Monitor `Check` rendering.

- [ ] **Step 1: Add RED assertions for named checks.**

The profile preflight must emit these IDs:

```text
h3_camera_representation
h3_camera_direction
h3_camera_completion
h3_camera_timing
h3_loop_closure
```

- [ ] **Step 2: Define concise check labels/messages.**

Examples:

```text
H3 camera representation: PASS
Single continuous target-centric orbit; target drift 0.3%, roll drift 0.0°, FOV drift 0.0°.

H3 camera direction: PASS
180.0° counterclockwise / camera left.

H3 camera completion: PASS
180.0° total travel; final view is the opposite side of the opening view.

H3 camera timing: WARNING
Authored 137 frames at 24 fps will be remapped to the 243-frame H3 scene profile.

H3 loop closure: PASS
360° endpoint matches the opening camera; final source anchor closure enabled.
```

Blocked representation example:

```text
H3 camera representation: BLOCKED
Target drift is 18.4% of the starting camera radius. This path cannot be faithfully represented by the scene-coverage camera contract. Use MiniMax H3 Native reference-video transport for this camera move.
```

- [ ] **Step 3: Ensure live preflight receives the same checks as queued compile.**

Do not create a second frontend-only camera analyzer.

- [ ] **Step 4: Run profile/live-preflight tests.**

```bash
python -m pytest tests/test_h3_profiles.py -q
npm run test:unit
```

Expected: PASS.

- [ ] **Step 5: Commit.**

```bash
git add omnicam/profiles/h3_scene_coverage.py tests/test_h3_profiles.py
git commit -m "feat(h3): surface camera contract preflight diagnostics"
```

---

# Task 9 — Documentation, help and example workflow

**Files:**
- Modify: `README.md`
- Modify: `docs/NODES.md`
- Modify: `web-src/help/defs.js`
- Modify: `CHANGELOG.md`
- Create: `examples/workflows/08_minimax_h3_scene_coverage.json`
- Generated: `web/omnicam.js`, `web-chunks/*`

- [ ] **Step 1: Add the profile to the README table.**

Row:

```text
h3_scene_coverage | prompt_options | final_prompt + h3edit_options | TextEncodeH3Edit compiled_prompt/options
```

Explain that it compiles the authored 6DoF camera into an H3 scene-coverage prompt/options contract and does not require a playblast.

- [ ] **Step 2: Document profile choice in `docs/NODES.md`.**

Required decision guide:

```text
Use h3_scene_coverage when:
- the shot is one continuous target-centric orbit/arc;
- you want direct camera-plan compilation without a playblast.

Use h3_native when:
- the camera is general 6DoF;
- the target moves;
- the shot contains significant roll/lens animation;
- the scene contains cuts;
- scene-coverage preflight blocks the path.
```

- [ ] **Step 3: Document the two new Monitor outputs.**

```text
h3edit_options — H3EDIT_OPTIONS emitted only by the scene-coverage profile; None for other profiles.
target_fps — resolved profile FPS; 24.0 for H3 scene coverage/native.
```

- [ ] **Step 4: Update help copy.**

Add `h3_scene_coverage` to the Monitor profile help list and explain the strict preflight.

- [ ] **Step 5: Build the example workflow.**

The example must contain:

```text
OmniCam Director
  motion_scene
      ↓
OmniCam Monitor [h3_scene_coverage]
  final_prompt ─────────→ TextEncodeH3Edit.compiled_prompt
  h3edit_options ───────→ TextEncodeH3Edit.options
  target_width ─────────→ TextEncodeH3Edit.width
  target_height ────────→ TextEncodeH3Edit.height
  target_fps ───────────→ video creation/output FPS
```

The source image is wired directly to `TextEncodeH3Edit.source_image`.

The workflow must demonstrate a 180° orbit first; do not make the first example depend on loop closure.

- [ ] **Step 6: Add CHANGELOG entry.**

Use product language only. Do not mention the research/reference repository.

- [ ] **Step 7: Rebuild frontend because `web-src/help/defs.js` changed.**

```bash
npm ci
npm run build
```

- [ ] **Step 8: Verify generated bundle is committed and deterministic.**

```bash
git status --short
git diff --check
```

- [ ] **Step 9: Commit.**

```bash
git add README.md docs/NODES.md web-src/help/defs.js CHANGELOG.md examples/workflows/08_minimax_h3_scene_coverage.json web/ web-chunks/
git commit -m "docs(h3): document scene coverage camera compiler"
```

---

# Task 10 — Full verification and release gate

**Files:** no new implementation files.

- [ ] **Step 1: Run targeted Python tests.**

```bash
python -m pytest \
  tests/test_h3_geometry.py \
  tests/test_h3_camera_contract.py \
  tests/test_h3_profiles.py \
  tests/test_capabilities.py \
  tests/test_profile_framework.py \
  tests/test_camera_tools.py \
  tests/test_motion_semantics.py -q
```

Expected: PASS.

- [ ] **Step 2: Run complete Python suite.**

```bash
python -m pytest -q
```

Expected: PASS.

- [ ] **Step 3: Run frontend tests.**

```bash
npm run test:unit
npm run test:browser
```

Expected: PASS.

- [ ] **Step 4: Run build.**

```bash
npm run build
```

Expected: PASS and no uncommitted generated diff after a second build.

- [ ] **Step 5: Run repository hygiene checks.**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only intentional committed files.

- [ ] **Step 6: Manual ComfyUI v0.35.0 QA — 90° orbit.**

Verify:

```text
profile preflight PASS
direction matches Director camera move
compiled prompt names the correct screen direction
target_length = 124 for a <=124-frame shot
target_fps = 24
no playblast required
```

- [ ] **Step 7: Manual QA — 180° orbit.**

Verify final view lands on the opposite side and background parallax moves in the expected direction.

- [ ] **Step 8: Manual QA — 360° closed orbit.**

Verify:

```text
coverage_arc_degrees = 360
coverage_loop_closure = true
preflight says CLOSED/PASS
final generated viewpoint returns to the opening view materially better than prompt-only open-loop behavior
```

- [ ] **Step 9: Manual QA — broken closure.**

Change final radius or elevation and verify loop closure turns off while the path remains compilable.

- [ ] **Step 10: Manual QA — incompatible move.**

Test pan-in-place, moving target, multi-shot and strong lens change. Verify profile blocks or warns exactly as specified and recommends `h3_native` instead of silently degrading.

- [ ] **Step 11: Manual QA — saved workflow.**

Save, reload, reconnect outputs and confirm existing Monitor outputs preserve their socket order and the new profile survives serialization.

- [ ] **Step 12: Commit verification-only fixture/doc corrections if required, then run the complete verification set once more.**

- [ ] **Step 13: Final commit only if verification produced intentional changes.**

```bash
git add -A
git commit -m "test(h3): lock camera contract integration"
```

Skip the commit when there are no changes.

---

## 9. Acceptance criteria

The feature is complete only when all are true:

- [ ] `MotionScene` and `OmniCamTrack` schemas are unchanged.
- [ ] No fourth public OmniCam node exists.
- [ ] `h3_native` and `h3_api` regressions remain green.
- [ ] `h3_scene_coverage` compiles without a playblast.
- [ ] A 90°/180°/360° authored orbit preserves signed direction through compilation.
- [ ] A 360° return with matching position/target/radius/elevation/roll/FOV automatically enables loop closure.
- [ ] Breaking the endpoint camera state automatically disables loop closure.
- [ ] Pan-in-place is never mislabeled as an orbit.
- [ ] Moving-target and multi-shot paths do not silently compile as clean coverage orbits.
- [ ] Prompt includes direction, completion, parallax and exact mapped timing contracts.
- [ ] `H3EDIT_OPTIONS` contains the complete downstream option set.
- [ ] target length resolves to 124/243/362 and target FPS is exactly 24.0.
- [ ] Existing Monitor output sockets keep their original order.
- [ ] New outputs are appended as `h3edit_options`, then `target_fps`.
- [ ] Capability preflight verifies both `compiled_prompt` and `options` downstream sockets.
- [ ] Generated source, runtime UI, prompt text, tests and package metadata contain no attribution/name/URL for the research-only camera-control reference.
- [ ] No mandatory dependency, route, telemetry, shell execution or core patch is introduced.
- [ ] Full Python and frontend test suites pass.
- [ ] Manual ComfyUI v0.35.0 QA passes.

---

## 10. Follow-up plan: Director Orbit Authoring UX

Do **not** implement this in the compiler branch. It is an independent frontend authoring subsystem and deserves a separate plan after `h3_scene_coverage` is merged and validated.

Recommended follow-up feature:

```text
Orbit Authoring Mode
- selected camera + authored Look At target define an orbit sphere
- horizontal drag changes azimuth
- vertical drag changes elevation
- mouse wheel changes radius
- first meaningful drag axis locks until pointer release
- FOV and roll remain unchanged
- normal OmniCam `I` key inserts the resulting pose
- output remains ordinary Director camera keyframes
- no H3-specific state is serialized
```

This keeps the fast spherical-camera ergonomics while preserving OmniCam's core invariant: the authoring result is a normal 6DoF camera track and can later compile to H3, Wan, LTX, reference video, Blender or Unreal without conversion from a second editor format.

Create that later as a separate document, for example:

```text
docs/superpowers/plans/YYYY-MM-DD-orbit-authoring-mode.md
```

Do not couple Orbit Authoring Mode to `h3_scene_coverage`; H3 is only one consumer of the camera it creates.

---

## Implementation handoff

Recommended execution order:

```text
Task 0  baseline
Task 1  geometry
Task 2  representability
Task 3  timing/options
Task 4  prompt compiler
Task 5  Monitor profile
Task 6  Monitor outputs
Task 7  capability contract
Task 8  preflight diagnostics
Task 9  docs/example
Task 10 verification
```

Each task is independently reviewable and should land only after its targeted tests are green.
