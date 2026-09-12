# H3 Camera Contract Compiler — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:test-driven-development` while implementing each task, `superpowers:subagent-driven-development` or `superpowers:executing-plans` to execute the plan, and `superpowers:verification-before-completion` before claiming completion. Execute tasks in order and tick every checkbox.

**Goal:** make OmniCam compile a canonical 6DoF `MotionScene` camera into a precise MiniMax H3 scene-coverage contract: deterministic orbit/elevation/radius analysis, direction/parallax/completion semantics, automatic loop-closure detection, downstream `H3EDIT_OPTIONS`, strict representability preflight, and synchronized length/FPS outputs — without adding another public node or another camera representation.

**Architecture:** `MotionScene` remains the only product interchange contract. A pure-Python H3 geometry layer derives spherical/orbital metadata from the selected OmniCam camera at compile time; model-specific modules render that analysis into a complete H3 prompt and scene-coverage options. `OmniCam Monitor` exposes the compiled prompt/options and resolved timing, while Director and Extractor remain model-agnostic.

**Tech Stack:** Python 3.10–3.13, ComfyUI V3 `IO.Schema` / `IO.NodeOutput`, existing `MotionScene` / `OmniCamTrack`, existing Monitor profile framework, JavaScript ES modules only for help/profile copy, pytest, Node test runner, Playwright where UI behavior changes.

**Spec:** this document, sections 1–10.

## Global Constraints

- Keep the public node surface at exactly three nodes: Director, Extractor, Monitor.
- Do not modify ComfyUI Core or ComfyUI Frontend.
- Do not change `MotionScene` or `MAJOOR_OMNICAM_TRACK` schemas for this feature.
- Keep all MiniMax/H3 semantics behind Monitor adapters/profiles.
- The external camera-control implementation used during research is **reference material only**. Do not import from it, vendor it, copy its identifiers, or add its repository/name to Python/JS source comments, generated prompts, UI copy, tests, package metadata, changelog entries, or runtime diagnostics.
- Reimplement required behavior from OmniCam's own camera math and canonical track data.
- Runtime integration contracts may name the actual downstream node classes/sockets that OmniCam must connect to; those are product compatibility contracts, not research-source attribution.
- Keep handwritten source files under 800 lines. Split by responsibility before crossing the limit.
- Add no mandatory runtime dependency and no new HTTP/WebSocket route.
- Existing `h3_native` and `h3_api` behavior must remain backward-compatible.
- Append new Monitor outputs; never reorder existing output sockets.
- Pure geometry/prompt tests must run without importing ComfyUI.
- Source image transport remains owned by the downstream H3 encoder. OmniCam Monitor does not duplicate or ingest the source image for this profile.

---

## 1. Sources checked before implementation

Re-checked on **2026-09-12** before writing this plan.

### Official ComfyUI

- Current stable release: `v0.35.0`, tag commit `40c4fcdf513a4523e39d54a9d391908af8df8171`.
- Current `comfy_extras/nodes_minimax_h3.py` confirms:
  - MiniMax H3 uses 24 fps;
  - valid generation lengths use the `17n+5` grid;
  - `MiniMaxH3ReferenceToVideo` accepts `<Picture i>`, `<Video k>`, `<Audio j>` syntax;
  - `ref_videos` are IMAGE-frame batches representing 24 fps video.
- Current ComfyUI frontend extension architecture remains registration-based (`app.registerExtension`), hook-driven, and non-intrusive.

### OmniCam current base

Plan written against `main` at:

```text
3933cef4fb396d91955334e38b4a305b63e919c1
```

Current product invariant remains:

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
- options dictionary can override `mode`, `prompt_mode`, `quality_profile`, `primary_image_role`, `reference_mode`, `source_fit`, `semantic_resolution`, `native_reference_size`, `coverage_views`, `coverage_arc_degrees`, `coverage_direction`, `coverage_hold_frames`, `coverage_loop_closure`;
- scene-coverage profiles are 124, 243, or 362 frames at 24 fps;
- anchored 360° coverage can reuse the source image at the final frame when `coverage_loop_closure` is true.

OmniCam must not duplicate the downstream encoder's latent/reference preparation. It only compiles camera intent and the option contract.

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

This profile consumes the selected `MotionScene` camera and Monitor settings. A playblast is **not required**.

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
    → video output FPS
```

`target_length` is the resolved H3 timing contract and diagnostic value. The downstream encoder receives the matching frame profile through `h3edit_options.quality_profile` rather than a separate length socket.

The artist continues to connect the source image directly to `TextEncodeH3Edit.source_image`.

### What this profile represents

`h3_scene_coverage` is for a **single continuous, target-centric camera move** around a fixed scene/subject anchor. It may describe:

- orbit left/right;
- partial or full orbit;
- elevation changes;
- radius changes;
- smooth or linear timing;
- direction reversals;
- stable lens/focal setup;
- exact loop closure when the camera returns to the starting view.

It is not the fallback for arbitrary 6DoF cinematography. Moving targets, significant roll/lens animation, cuts, multi-turn paths, or predominantly non-orbital translation must trigger warning/blocking preflight and recommend `h3_native` reference-video transport rather than silently simplifying the camera.

### Existing H3 profiles keep their role

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

Create:

```text
omnicam/adapters/h3_geometry.py
```

This module must not import ComfyUI.

### Data contracts

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
    path_length_world: float
    max_target_drift_ratio: float
    max_roll_delta_degrees: float
    max_fov_delta_degrees: float
    start_radius: float
    horizontal_fov_degrees: float
    coverage_direction: str
    loop_closure: bool
    endpoint_position_error_ratio: float
    endpoint_target_error_ratio: float
```

Public function:

```python
def analyze_h3_geometry(track: OmniCamTrack) -> H3GeometryAnalysis:
    ...
```

### Fixed orbit anchor

Use frame-zero target:

```python
anchor = track.sample(0).target
```

Do **not** recenter every frame on the current target. Current-target recentering would hide target drift and could misclassify pan/truck motion as a clean orbit.

### Coordinate conversion

```python
dx = camera.position[0] - anchor[0]
dy = camera.position[1] - anchor[1]
dz = camera.position[2] - anchor[2]

radius = math.sqrt(dx * dx + dy * dy + dz * dz)
azimuth = math.degrees(math.atan2(dx, dz))
elevation = math.degrees(math.atan2(dy, math.hypot(dx, dz)))
radius_ratio = radius / start_radius
```

Reject start radius below `1e-6`.

### Azimuth unwrapping

```python
def unwrap_degrees(previous_raw: float, previous_unwrapped: float, current_raw: float) -> float:
    delta = (current_raw - previous_raw + 180.0) % 360.0 - 180.0
    return previous_unwrapped + delta
```

A full orbit must end near ±360°, not collapse back to 0°.

### Horizontal FOV

Treat `CameraState.fov` as vertical FOV:

```python
def horizontal_fov(vertical_fov_degrees: float, aspect: float) -> float:
    half = math.radians(vertical_fov_degrees) * 0.5
    return math.degrees(2.0 * math.atan(math.tan(half) * aspect))
```

Use average segment FOV for prompt parallax estimates.

### Parallax metric

```python
frame_widths = abs(delta_azimuth_degrees) / max(horizontal_fov_degrees, 1e-6)
```

This is a prompt-contract metric, not a 2D tracking solver.

### Direction convention

Use OmniCam's own camera convention. Lock it with tests against existing camera presets.

Expected mapping:

```text
positive unwrapped azimuth  → counterclockwise / camera left
negative unwrapped azimuth  → clockwise / camera right
```

If existing OmniCam camera math proves the opposite, fix the mapping and the test together. Do not add a user-facing inversion switch.

### Reversal detection

Only count a reversal when adjacent meaningful orbit deltas exceed:

```python
SIGNIFICANT_ORBIT_DELTA_DEGREES = 0.25
```

and have opposite signs.

### Loop closure

Set `loop_closure=True` only when all pass:

```text
at least one full turn
absolute remainder from N×360° <= 1.0°
endpoint position error <= 2% of start radius
endpoint target error <= 1% of start radius
final elevation difference <= 0.5°
final radius-ratio difference <= 0.01
final roll difference <= 0.5°
final FOV difference <= 1.0°
```

More than one turn is not representable by the downstream coverage option because its arc caps at 360°; block it for this profile and recommend `h3_native`.

---

## 4. Representability contract

Create:

```text
omnicam/adapters/h3_representability.py
```

Pure Python; no ComfyUI imports.

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

Block when any applies:

```text
MotionScene contains cuts / is multi-shot
selected camera missing or disabled
start target radius < 1e-6
total orbit travel < 5° while path_length_world > 5% of start radius
max target drift > 5% of start radius
max roll drift > 5°
max FOV drift > 10°
net or total orbit travel > 361°
```

A truly static camera is allowed and compiles as a hold.

### Warning rules

Warn but allow when:

```text
target drift > 1% but <= 5%
roll drift > 1° but <= 5°
FOV drift > 2° but <= 10°
|elevation| reaches 45° or more
endpoint is near but not eligible for loop closure
timing is remapped to a different H3 scene-coverage profile length
```

Every blocked result ends with:

```text
Use MiniMax H3 Native reference-video transport for this camera move.
```

Do not claim H3 cannot generate the move; only say this specific prompt/options representation cannot faithfully encode it.

---

## 5. H3 scene-coverage timing policy

Create:

```text
omnicam/adapters/h3_scene_coverage.py
```

Constants:

```python
H3_SCENE_PROFILES = (
    (124, "scene coverage | 124-frame camera path"),
    (243, "scene coverage | 243-frame camera path"),
    (362, "scene coverage | 362-frame camera path"),
)
H3_SCENE_FPS = 24.0
```

### Length selection

```python
requested_frames = max(1, math.ceil(duration_seconds * H3_SCENE_FPS))
```

Choose the smallest supported profile `>= requested_frames`:

```text
72   → 124
124  → 124
125  → 243
243  → 243
244  → 362
362  → 362
363+ → BLOCKED
```

This avoids speeding the authored move up. The profile may stretch it to fill a supported H3 horizon.

### Time remapping

```python
source_last = max(1, track.duration_frames - 1)
target_last = target_frames - 1
mapped_frame = round((source_frame / source_last) * target_last)
timing_scale = target_last / source_last
```

Prompt timestamps use `mapped_frame / 24.0`.

If `abs(timing_scale - 1.0) > 0.05`, preflight emits a warning with authored and resolved durations.

Never mutate the source `MotionScene` or track.

### Canvas resolution

H3 Edit rounds dimensions to the 32-pixel grid. Monitor must report the same dimensions the downstream encoder will actually use:

```python
def h3_grid(value: int) -> int:
    return max(32, round(int(value) / 32) * 32)
```

`h3_scene_coverage.resolve_timeline()` uses `h3_grid(request.target_width)` and `h3_grid(request.target_height)` so Monitor output and downstream canvas cannot silently disagree.

---

## 6. Complete H3 camera prompt contract

Create:

```text
omnicam/adapters/h3_camera_contract.py
```

Public interface:

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

Output structure:

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

`detailed_description` must contain, in order:

1. **Reference anchor** — `<Picture 1>` is the exact opening frame; scene/subject stays fixed in world space.
2. **Camera-vs-subject contract** — only physical camera moves; orbit is not subject rotation or pan-in-place; elevation is a camera arc/height change.
3. **Target/lens contract** — camera stays aimed at authored target; stable FOV/roll are explicitly preserved.
4. **Direction contract** — camera-left/right plus the opposite frame edge from which new background enters; mirrored flow is called wrong.
5. **Completion contract** — total/net degrees, target duration, average degrees/sec, required final view.
6. **Parallax contract** — approximate frame-width crossings plus physical perspective/occlusion requirement; no fake 2D box translation.
7. **Segment schedule** — mapped timestamps, signed orbit/elevation/radius deltas, angular speed, speed curve, reversals.
8. **Closure contract** when eligible — final viewpoint must match opening viewpoint; source anchor is intentionally reused at the end by downstream conditioning.
9. **Forbidden changes** — no cuts, subject rotation/animation, scene morph, unauthorized digital zoom, lighting change, visible planning guides.
10. **Artist prompt** — append non-empty `base_prompt` exactly once under `Additional art direction:`.

### Segment compaction

Build candidate segments from camera keyframe spans. Merge adjacent spans only when they have the same orbit direction, no reversal boundary, same qualitative elevation direction, and same qualitative radius direction. If more than 12 remain, merge the smallest compatible neighbors until 12. Never merge across a reversal.

### Static camera

Emit:

```text
The camera remains locked to the opening viewpoint for the complete target duration.
```

Do not invent orbit or parallax.

---

## 7. H3EDIT_OPTIONS compiler

In `omnicam/adapters/h3_scene_coverage.py`:

```python
def build_h3edit_scene_options(
    track: OmniCamTrack,
    analysis: H3GeometryAnalysis,
    *,
    target_frames: int,
) -> dict[str, object]:
    ...
```

Return the complete downstream option set:

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
    "coverage_views": max(2, min(24, len(track.keyframes))),
    "coverage_arc_degrees": coverage_arc(analysis),
    "coverage_direction": analysis.coverage_direction,
    "coverage_hold_frames": 1,
    "coverage_loop_closure": analysis.loop_closure,
}
```

`coverage_arc()`:

```python
def coverage_arc(analysis: H3GeometryAnalysis) -> float:
    if analysis.total_orbit_degrees < 5.0:
        return 15.0
    return max(15.0, min(360.0, abs(analysis.net_orbit_degrees)))
```

Static hold therefore carries the downstream minimum 15° metadata value while the compiled prompt explicitly commands a locked camera. Preflight must surface this metadata limitation.

Exact direction values:

```text
clockwise / camera right
counterclockwise / camera left
```

Use `coverage_hold_frames=1` because OmniCam's compiled prompt owns actual continuous timing and must not invent static holds at intermediate viewpoints.

---

## 8. File map

| Action | File | Responsibility |
|---|---|---|
| CREATE | `omnicam/adapters/h3_geometry.py` | track → orbit/elevation/radius/parallax/closure analysis |
| CREATE | `omnicam/adapters/h3_representability.py` | scene-coverage compatibility rules |
| CREATE | `omnicam/adapters/h3_scene_coverage.py` | profile length selection + H3EDIT_OPTIONS compiler |
| CREATE | `omnicam/adapters/h3_camera_contract.py` | complete H3 prompt renderer |
| CREATE | `omnicam/profiles/h3_scene_coverage.py` | Monitor profile, preflight and compile orchestration |
| MODIFY | `omnicam/profiles/catalog.py` | register `h3_scene_coverage` |
| MODIFY | `omnicam/monitor/result.py` | optional `h3edit_options` payload |
| MODIFY | `omnicam/nodes/monitor.py` | append `h3edit_options` and `target_fps` outputs |
| MODIFY | `omnicam/adapters/registry.py` | downstream capability contract and current official H3 pins |
| MODIFY | `tests/test_h3_profiles.py` | profile regressions |
| CREATE | `tests/test_h3_geometry.py` | geometry/unwrap/closure/reversal tests |
| CREATE | `tests/test_h3_camera_contract.py` | prompt/options contract tests |
| MODIFY | `tests/test_capabilities.py` | capability detection for new profile |
| MODIFY | `tests/test_profile_framework.py` | CompiledMotion/output compatibility |
| MODIFY | `web-src/help/defs.js` | profile/output help copy only |
| MODIFY | `docs/NODES.md` | connection recipe and preflight behavior |
| MODIFY | `README.md` | profile table |
| MODIFY | `CHANGELOG.md` | release note |
| CREATE | `examples/workflows/08_minimax_h3_scene_coverage.json` | end-to-end example |
| GENERATED | `web/omnicam.js` + `web-chunks/*` | rebuild after `web-src` change; never hand-edit |

No Director file changes belong in this compiler release.

---

# Task 0 — Baseline

**Files:** none.

- [ ] Create `feature/h3-camera-contract` from current `main`.

```bash
git switch main
git pull --ff-only
git switch -c feature/h3-camera-contract
```

- [ ] Verify plan base is an ancestor.

```bash
git merge-base --is-ancestor 3933cef4fb396d91955334e38b4a305b63e919c1 HEAD
```

Expected: exit code `0`.

- [ ] Run current H3/profile/capability tests.

```bash
python -m pytest tests/test_h3_profiles.py tests/test_capabilities.py tests/test_profile_framework.py -q
```

Expected: PASS.

---

# Task 1 — Pure H3 geometry analysis

**Files:**
- Create: `omnicam/adapters/h3_geometry.py`
- Create: `tests/test_h3_geometry.py`

**Interfaces:**
- Consumes: `OmniCamTrack`, `CameraState`.
- Produces: `H3OrbitSample`, `H3OrbitSegment`, `H3GeometryAnalysis`, `analyze_h3_geometry(track)`.

- [ ] Write RED orbit/direction tests.

```python
def test_full_orbit_stays_unwrapped():
    analysis = analyze_h3_geometry(orbit_track(degrees=360.0, frames=124))
    assert abs(abs(analysis.net_orbit_degrees) - 360.0) < 1.0
    assert analysis.total_orbit_degrees >= 359.0


def test_left_and_right_orbits_use_omnicam_direction_convention():
    left = analyze_h3_geometry(apply_camera_preset(base_track(), "orbit_left"))
    right = analyze_h3_geometry(apply_camera_preset(base_track(), "orbit_right"))
    assert left.coverage_direction == "counterclockwise / camera left"
    assert right.coverage_direction == "clockwise / camera right"
```

- [ ] Write RED drift/closure tests.

```python
def test_target_drift_is_measured_against_frame_zero_anchor():
    analysis = analyze_h3_geometry(track_with_moving_target())
    assert analysis.max_target_drift_ratio > 0.0


def test_loop_closure_requires_matching_camera_state():
    assert analyze_h3_geometry(orbit_track(degrees=360.0, frames=124)).loop_closure is True
    assert analyze_h3_geometry(
        orbit_track(degrees=360.0, frames=124, end_fov_delta=8.0)
    ).loop_closure is False
    assert analyze_h3_geometry(
        orbit_track(degrees=360.0, frames=124, end_radius_ratio=1.2)
    ).loop_closure is False
```

- [ ] Write RED reversal/parallax tests.

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

- [ ] Confirm RED.

```bash
python -m pytest tests/test_h3_geometry.py -q
```

- [ ] Implement section 3 exactly, export:

```python
__all__ = [
    "H3OrbitSample",
    "H3OrbitSegment",
    "H3GeometryAnalysis",
    "analyze_h3_geometry",
    "horizontal_fov",
]
```

- [ ] Verify.

```bash
python -m pytest tests/test_h3_geometry.py tests/test_camera_tools.py tests/test_motion_semantics.py -q
```

Expected: PASS.

- [ ] Commit.

```bash
git add omnicam/adapters/h3_geometry.py tests/test_h3_geometry.py
git commit -m "feat(h3): analyze scene coverage camera geometry"
```

---

# Task 2 — Representability analysis

**Files:**
- Create: `omnicam/adapters/h3_representability.py`
- Modify: `tests/test_h3_geometry.py`

**Interfaces:**
- Consumes: `OmniCamTrack`, `H3GeometryAnalysis`, `is_multi_shot`.
- Produces: `H3Representability`, `evaluate_h3_scene_coverage(...)`.

- [ ] Write RED non-orbit and warning tests.

```python
def test_pan_in_place_is_blocked_for_scene_coverage():
    track = pan_in_place_track()
    result = evaluate_h3_scene_coverage(
        track, analyze_h3_geometry(track), is_multi_shot=False
    )
    assert result.state == "BLOCKED"
    assert any("reference-video" in item for item in result.recommendations)


def test_small_target_and_lens_drift_warns_not_blocks():
    track = mild_drift_orbit_track()
    result = evaluate_h3_scene_coverage(
        track, analyze_h3_geometry(track), is_multi_shot=False
    )
    assert result.state == "WARNING"
```

- [ ] Write RED cuts/multi-turn tests.

```python
def test_multi_shot_is_blocked():
    track = orbit_track(degrees=90.0, frames=124)
    result = evaluate_h3_scene_coverage(
        track, analyze_h3_geometry(track), is_multi_shot=True
    )
    assert result.state == "BLOCKED"


def test_more_than_one_turn_is_blocked():
    track = orbit_track(degrees=720.0, frames=243)
    result = evaluate_h3_scene_coverage(
        track, analyze_h3_geometry(track), is_multi_shot=False
    )
    assert result.state == "BLOCKED"
```

- [ ] Confirm RED, implement section 4, then verify.

```bash
python -m pytest tests/test_h3_geometry.py -q
```

Expected after implementation: PASS.

- [ ] Commit.

```bash
git add omnicam/adapters/h3_representability.py tests/test_h3_geometry.py
git commit -m "feat(h3): validate scene coverage representability"
```

---

# Task 3 — Timing and H3EDIT_OPTIONS compiler

**Files:**
- Create: `omnicam/adapters/h3_scene_coverage.py`
- Create: `tests/test_h3_camera_contract.py`

**Interfaces:**
- Produces: `H3SceneProfile`, `select_h3_scene_profile`, `map_h3_scene_frame`, `h3_grid`, `build_h3edit_scene_options`.

- [ ] Write RED profile-selection tests.

```python
import pytest


@pytest.mark.parametrize(
    ("requested", "expected"),
    [(72, 124), (124, 124), (125, 243), (243, 243), (244, 362), (362, 362)],
)
def test_scene_profile_uses_smallest_non_shorter_length(requested, expected):
    assert select_h3_scene_profile(requested).frames == expected


def test_scene_profile_rejects_more_than_362_frames():
    with pytest.raises(ValueError, match="362"):
        select_h3_scene_profile(363)
```

- [ ] Write RED grid/options tests.

```python
def test_h3_grid_matches_downstream_32_pixel_rounding():
    assert h3_grid(831) == 832
    assert h3_grid(481) == 480


def test_scene_options_fill_every_downstream_key():
    track = orbit_track(degrees=180.0, frames=124)
    options = build_h3edit_scene_options(
        track, analyze_h3_geometry(track), target_frames=124
    )
    assert set(options) == {
        "mode", "show_overrides", "prompt_mode", "quality_profile",
        "primary_image_role", "reference_mode", "source_fit",
        "semantic_resolution", "native_reference_size", "coverage_views",
        "coverage_arc_degrees", "coverage_direction",
        "coverage_hold_frames", "coverage_loop_closure",
    }
    assert options["coverage_hold_frames"] == 1
```

- [ ] Write RED closure test.

```python
def test_closed_360_orbit_enables_loop_closure_option():
    track = orbit_track(degrees=360.0, frames=124)
    options = build_h3edit_scene_options(
        track, analyze_h3_geometry(track), target_frames=124
    )
    assert options["coverage_arc_degrees"] == 360.0
    assert options["coverage_loop_closure"] is True
```

- [ ] Confirm RED, implement sections 5 and 7, verify.

```bash
python -m pytest tests/test_h3_camera_contract.py -q
```

Expected after implementation: PASS.

- [ ] Commit.

```bash
git add omnicam/adapters/h3_scene_coverage.py tests/test_h3_camera_contract.py
git commit -m "feat(h3): compile scene coverage timing and options"
```

---

# Task 4 — Complete camera-contract prompt renderer

**Files:**
- Create: `omnicam/adapters/h3_camera_contract.py`
- Modify: `tests/test_h3_camera_contract.py`

**Interfaces:**
- Produces: `build_h3_scene_coverage_prompt(...) -> str`.

- [ ] Write RED structure/de-duplication test.

```python
def test_prompt_is_complete_h3_document_and_artist_prompt_occurs_once():
    track = orbit_track(degrees=90.0, frames=124)
    prompt = build_h3_scene_coverage_prompt(
        track,
        analyze_h3_geometry(track),
        target_frames=124,
        base_prompt="A frozen product on a laboratory table.",
    )
    for heading in (
        "subject_definitions:", "summary:", "retention_analysis:",
        "detailed_description:", "overall_soundscape:", "non_diegetic_music:",
    ):
        assert heading in prompt
    assert prompt.count("A frozen product on a laboratory table.") == 1
```

- [ ] Write RED direction/parallax/completion tests.

```python
def test_prompt_contains_checkable_camera_contracts():
    track = orbit_track(degrees=180.0, frames=124)
    prompt = build_h3_scene_coverage_prompt(
        track, analyze_h3_geometry(track), target_frames=124
    )
    assert "physical camera" in prompt.lower()
    assert "background" in prompt.lower()
    assert "180" in prompt
    assert "degrees per second" in prompt.lower()
    assert "parallax" in prompt.lower()


def test_prompt_names_reversal_without_inventing_cut():
    track = reverse_orbit_track()
    prompt = build_h3_scene_coverage_prompt(
        track, analyze_h3_geometry(track), target_frames=243
    )
    assert "revers" in prompt.lower()
    assert "no cut" in prompt.lower()
```

- [ ] Write RED closure test.

```python
def test_prompt_requires_return_to_opening_view_when_closed():
    track = orbit_track(degrees=360.0, frames=124)
    prompt = build_h3_scene_coverage_prompt(
        track, analyze_h3_geometry(track), target_frames=124
    )
    assert "opening viewpoint" in prompt.lower()
    assert "final" in prompt.lower()
```

- [ ] Confirm RED, implement section 6, verify.

```bash
python -m pytest tests/test_h3_camera_contract.py -q
```

Expected after implementation: PASS.

Implementation rules:

```text
no proxy/playblast language in this profile
no research-source attribution in production or test source
no fake screen-space bounding-box animation
no more than 12 emitted camera segments
preserve reversal boundaries
append base_prompt exactly once
```

- [ ] Before commit, perform an **uncommitted local source scan** using the research-source identifiers from the analysis session. Do not place those identifiers in repository files. Expected: zero matches under `omnicam/`, `web-src/`, `tests/`, `README.md`, `CHANGELOG.md`.

- [ ] Commit.

```bash
git add omnicam/adapters/h3_camera_contract.py tests/test_h3_camera_contract.py
git commit -m "feat(h3): compile precise camera contract prompts"
```

---

# Task 5 — Add `h3_scene_coverage` Monitor profile

**Files:**
- Create: `omnicam/profiles/h3_scene_coverage.py`
- Modify: `omnicam/profiles/catalog.py`
- Modify: `tests/test_h3_profiles.py`

**Interfaces:**
- Consumes: `CompileRequest`.
- Produces: `CompiledMotion(profile_id="h3_scene_coverage", ...)`.

- [ ] Write RED timeline test.

```python
def test_h3_scene_coverage_resolves_supported_length_and_grid():
    request = _request(duration_seconds=6.0, target_width=831, target_height=481)
    timeline = H3_SCENE_COVERAGE_PROFILE.resolve_timeline(request)
    assert timeline.fps == 24.0
    assert timeline.frame_count == 243
    assert timeline.width == 832
    assert timeline.height == 480
```

- [ ] Write RED compile test.

```python
def test_h3_scene_coverage_compiles_without_playblast():
    result = H3_SCENE_COVERAGE_PROFILE.compile(_request(playblast_video=None))
    assert result.profile_id == "h3_scene_coverage"
    assert result.semantic == "prompt_options"
    assert "detailed_description:" in result.final_prompt
    assert result.h3edit_options["prompt_mode"] == "directed | frozen scene coverage"
    assert result.reference_video is None
    assert result.reference_frames is None
```

- [ ] Write RED blocked-preflight test.

```python
def test_h3_scene_coverage_blocks_non_orbital_camera():
    request = _request(scene=scene_with_pan_in_place())
    checks = H3_SCENE_COVERAGE_PROFILE.preflight(request)
    assert any(check.state == "BLOCKED" for check in checks)
    with pytest.raises(ValueError):
        H3_SCENE_COVERAGE_PROFILE.compile(request)
```

- [ ] Confirm RED.

```bash
python -m pytest tests/test_h3_profiles.py -q
```

- [ ] Implement profile flow:

```text
selected playblast camera track
→ analyze_h3_geometry
→ evaluate_h3_scene_coverage
→ convert result to Monitor Checks
→ block if required
→ resolve 24 fps / 124|243|362 timeline on 32px grid
→ build complete prompt
→ build H3EDIT_OPTIONS
→ CompiledMotion
```

Profile skeleton:

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
            width=h3_grid(request.target_width),
            height=h3_grid(request.target_height),
            fps=24.0,
            duration_seconds=profile.frames / 24.0,
            frame_count=profile.frames,
            frame_policy=self.frame_policy,
        )
```

- [ ] Register between native and API profiles.

```python
H3_NATIVE_PROFILE,
H3_SCENE_COVERAGE_PROFILE,
H3_API_PROFILE,
```

- [ ] Verify.

```bash
python -m pytest tests/test_h3_profiles.py tests/test_profile_framework.py -q
```

Expected: PASS.

- [ ] Commit.

```bash
git add omnicam/profiles/h3_scene_coverage.py omnicam/profiles/catalog.py tests/test_h3_profiles.py
git commit -m "feat(h3): add scene coverage monitor profile"
```

---

# Task 6 — Extend CompiledMotion and Monitor outputs

**Files:**
- Modify: `omnicam/monitor/result.py`
- Modify: `omnicam/nodes/monitor.py`
- Modify: `tests/test_profile_framework.py`
- Modify: `tests/test_h3_profiles.py`

**Interfaces:**
- `CompiledMotion.h3edit_options: dict[str, object] | None = None`.
- Append `h3edit_options` and `target_fps` after the existing nine Monitor outputs.

- [ ] Write RED `CompiledMotion` test.

```python
def test_compiled_motion_accepts_h3edit_options_without_affecting_defaults():
    result = CompiledMotion(
        profile_id="x",
        semantic="prompt_options",
        timeline=_timeline(),
        h3edit_options={"mode": "scene coverage | canonical camera path"},
    )
    assert result.h3edit_options["mode"].startswith("scene coverage")
    assert result.reference_video is None
```

- [ ] Add field:

```python
h3edit_options: dict[str, object] | None = None
```

- [ ] Append schema outputs after `target_length`:

```python
IO.Custom("H3EDIT_OPTIONS").Output(display_name="h3edit_options"),
IO.Float.Output(display_name="target_fps"),
```

- [ ] Append execution values without changing the first nine positions:

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

- [ ] Add regression asserting legacy first-nine output order remains unchanged.

- [ ] Verify.

```bash
python -m pytest tests/test_profile_framework.py tests/test_h3_profiles.py -q
```

Expected: PASS.

- [ ] Commit.

```bash
git add omnicam/monitor/result.py omnicam/nodes/monitor.py tests/test_profile_framework.py tests/test_h3_profiles.py
git commit -m "feat(monitor): expose H3 options and target fps"
```

---

# Task 7 — Strict downstream capability detection

**Files:**
- Modify: `omnicam/adapters/registry.py`
- Modify: `tests/test_capabilities.py`

The current generic capability resolver already accepts explicit `node_classes` mappings and introspects both V3 `define_schema()` and legacy `INPUT_TYPES()`. No change to `omnicam/capabilities.py` is expected.

- [ ] Write RED verified-contract test.

```python
class Schema:
    inputs = (Socket("compiled_prompt"), Socket("options"))


class TextEncodeH3Edit:
    @classmethod
    def define_schema(cls):
        return Schema()


capabilities = detect_capabilities({"TextEncodeH3Edit": TextEncodeH3Edit})
entry = next(
    item for item in capabilities["capabilities"]
    if item["adapter"] == "h3_scene_coverage"
)
assert entry["state"] == "verified"
```

- [ ] Write RED incompatible-contract test by removing `options`; expected state `incompatible`.

- [ ] Add adapter registry contract:

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

This runtime dependency contract is allowed. Do not name or link the research-only camera-control reference anywhere in implementation source.

- [ ] Refresh existing official H3 Core pins from v0.34.0 to v0.35.0 after the v0.35.0 socket tests pass:

```text
v0.35.0
40c4fcdf513a4523e39d54a9d391908af8df8171
```

Do not change unrelated Wan/LTX pins.

- [ ] Verify.

```bash
python -m pytest tests/test_capabilities.py -q
```

Expected: PASS.

- [ ] Commit.

```bash
git add omnicam/adapters/registry.py tests/test_capabilities.py
git commit -m "feat(h3): verify scene coverage downstream contract"
```

---

# Task 8 — Surface diagnostics through existing Monitor preflight

**Files:**
- Modify: `omnicam/profiles/h3_scene_coverage.py`
- Modify: `tests/test_h3_profiles.py`

No bespoke frontend analyzer/panel is required. Reuse existing `Check` rendering and live preflight.

- [ ] Add RED assertions for these check IDs:

```text
h3_camera_representation
h3_camera_direction
h3_camera_completion
h3_camera_timing
h3_loop_closure
```

- [ ] Implement concise messages. Required examples:

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

Blocked copy:

```text
H3 camera representation: BLOCKED
Target drift is 18.4% of the starting camera radius. This path cannot be faithfully represented by the scene-coverage camera contract. Use MiniMax H3 Native reference-video transport for this camera move.
```

- [ ] Ensure live preflight receives the same checks as queued compile. Do not create a frontend-only camera analyzer.

- [ ] Verify.

```bash
python -m pytest tests/test_h3_profiles.py -q
npm run test:unit
```

Expected: PASS.

- [ ] Commit.

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

- [ ] Add profile table row:

```text
h3_scene_coverage | prompt_options | final_prompt + h3edit_options | TextEncodeH3Edit compiled_prompt/options
```

Explain that it compiles the authored 6DoF camera into an H3 scene-coverage prompt/options contract and needs no playblast.

- [ ] Add decision guide to `docs/NODES.md`:

```text
Use h3_scene_coverage when:
- one continuous target-centric orbit/arc;
- direct camera-plan compilation is preferred.

Use h3_native when:
- general 6DoF camera;
- moving target;
- significant roll/lens animation;
- cuts;
- scene-coverage preflight blocks the path.
```

- [ ] Document appended Monitor outputs:

```text
h3edit_options — H3EDIT_OPTIONS for h3_scene_coverage; None for other profiles.
target_fps — resolved profile FPS; 24.0 for H3 scene coverage/native.
```

- [ ] Add `h3_scene_coverage` to Monitor help copy.

- [ ] Create example graph:

```text
OmniCam Director.motion_scene
    ↓
OmniCam Monitor [h3_scene_coverage]
    final_prompt ───────→ TextEncodeH3Edit.compiled_prompt
    h3edit_options ─────→ TextEncodeH3Edit.options
    target_width ───────→ TextEncodeH3Edit.width
    target_height ──────→ TextEncodeH3Edit.height
    target_fps ─────────→ output FPS
```

Wire source image directly to `TextEncodeH3Edit.source_image`. Use a 180° orbit in the first example so the basic workflow does not depend on closure behavior.

- [ ] Add CHANGELOG entry using product language only; no research-source attribution.

- [ ] Rebuild frontend because help source changed.

```bash
npm ci
npm run build
git diff --check
```

- [ ] Commit.

```bash
git add README.md docs/NODES.md web-src/help/defs.js CHANGELOG.md examples/workflows/08_minimax_h3_scene_coverage.json web/ web-chunks/
git commit -m "docs(h3): document scene coverage camera compiler"
```

---

# Task 10 — Full verification gate

- [ ] Targeted Python tests:

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

- [ ] Full Python suite:

```bash
python -m pytest -q
```

Expected: PASS.

- [ ] Frontend suites:

```bash
npm run test:unit
npm run test:browser
```

Expected: PASS.

- [ ] Deterministic build:

```bash
npm run build
git diff --check
git status --short
```

Expected: no whitespace error; a second build introduces no generated diff.

- [ ] Manual ComfyUI v0.35.0 QA — 90° orbit:

```text
preflight PASS
direction matches Director camera move
target_length = 124 for <=124 authored frames
target_fps = 24
no playblast required
```

- [ ] Manual QA — 180° orbit: final view lands on opposite side and background parallax direction matches compiled contract.

- [ ] Manual QA — 360° closed orbit:

```text
coverage_arc_degrees = 360
coverage_loop_closure = true
preflight closure PASS
final generated viewpoint returns to opening viewpoint
```

- [ ] Manual QA — break closure by changing final radius/elevation; closure must switch off while the path stays compilable.

- [ ] Manual QA — pan-in-place, moving target, multi-shot, strong lens change; verify warning/blocking copy and `h3_native` recommendation.

- [ ] Manual QA — save/reload workflow; existing Monitor outputs preserve order and new profile survives serialization.

- [ ] Perform a final **local, uncommitted** scan for research-source identifiers across production, tests, docs and package metadata. Expected: zero committed references. Do not encode the identifiers into a repository test.

- [ ] If verification produced intentional corrections, commit them and rerun all checks. Otherwise do not create an empty commit.

---

## 9. Acceptance criteria

- [ ] `MotionScene` and `OmniCamTrack` schemas unchanged.
- [ ] No fourth public OmniCam node.
- [ ] `h3_native` and `h3_api` regressions green.
- [ ] `h3_scene_coverage` compiles without playblast.
- [ ] 90°/180°/360° orbits preserve signed direction.
- [ ] 360° return with matching position/target/radius/elevation/roll/FOV enables closure automatically.
- [ ] Endpoint mismatch disables closure automatically.
- [ ] Pan-in-place is not mislabeled as orbit.
- [ ] Moving-target/multi-shot paths do not silently compile as clean coverage orbits.
- [ ] Prompt contains direction, completion, parallax and mapped timing contracts.
- [ ] `H3EDIT_OPTIONS` contains the complete downstream option set.
- [ ] H3 scene length resolves to 124/243/362 and FPS to 24.0.
- [ ] H3 scene width/height match downstream 32-pixel grid.
- [ ] Existing Monitor sockets keep original order.
- [ ] New outputs append as `h3edit_options`, then `target_fps`.
- [ ] Capability preflight verifies `compiled_prompt` and `options` sockets.
- [ ] Production source, test source, runtime UI, prompt text, package metadata and changelog contain no attribution/name/URL for the research-only camera-control reference.
- [ ] No mandatory dependency, route, telemetry, shell execution or core patch introduced.
- [ ] Full Python/frontend tests and manual v0.35.0 QA pass.

---

## 10. Follow-up: Director Orbit Authoring UX

Do **not** implement this in the compiler branch. It is an independent frontend subsystem and deserves its own plan after `h3_scene_coverage` is merged and validated.

Recommended feature:

```text
Orbit Authoring Mode
- selected camera + authored Look At target define an orbit sphere
- horizontal drag changes azimuth
- vertical drag changes elevation
- mouse wheel changes radius
- first meaningful drag axis locks until pointer release
- FOV and roll remain unchanged
- normal OmniCam `I` inserts the resulting camera pose
- output is ordinary Director camera keyframes
- no H3-specific authoring state is serialized
```

This gives fast spherical-camera ergonomics while preserving OmniCam's central invariant: the authored result remains a normal 6DoF camera track that can compile to H3, Wan, LTX, reference video, Blender or Unreal.

Create the follow-up as a separate plan, e.g.:

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
