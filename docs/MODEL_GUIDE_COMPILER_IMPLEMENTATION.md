# Implementation Plan — OmniCam Model Guide + Prompt Compiler

**Status:** design / implementation roadmap  
**Target:** OmniCam Director + Monitor  
**Primary model targets:** MiniMax H3, ByteDance Seedance 2.5  
**Last source verification:** 2026-09-18

## 1. Goal

Turn OmniCam's authored camera motion and recorded playblast into a first-class **model guidance artifact** instead of treating the playblast as an opaque video.

The target flow is:

```text
OmniCam Director
    |
    | MotionScene (canonical camera/object/cut data)
    | optional recorded playblast
    v
OmniCam Monitor
    |
    +--> Guide compiler
    |      - validates / selects guide source
    |      - derives camera phases from MotionScene
    |      - resolves guide capture semantics
    |      - prepares model-specific reference media
    |
    +--> Prompt compiler
           - H3 dialect
           - Seedance 2.5 dialect
           - deterministic timecoded camera contract
           - reference-role instructions
    |
    v
model-native outputs
```

The guide is **not** a beauty render by default. It is a control signal whose purpose is to communicate:

- camera translation and rotation;
- framing evolution;
- focal/FOV evolution;
- target behavior;
- camera roll;
- parallax and depth ordering;
- acceleration/deceleration;
- holds and reversals;
- blocking and subject trajectory when the authored scene contains them;
- cuts when the destination profile supports reference-video cuts.

The implementation must preserve the repository invariant:

> MotionScene remains model-agnostic. H3- and Seedance-specific behavior belongs behind Monitor profiles.

---

## 2. Why this is needed

OmniCam already has two strong pieces:

1. a model-independent 6DoF MotionScene;
2. a browser-recorded playblast.

Today, reference-video profiles mostly forward the playblast and append a camera prompt. That works, but it leaves useful structured information unused.

The new system should combine both signals:

```text
guide pixels
+
exact camera metadata
+
model-specific prompt semantics
=
stronger motion conditioning
```

This is especially relevant for Seedance 2.5 because ByteDance officially documents **clay / white-model reference** as a way to communicate spatial structure, camera movement, pacing, shot-size transitions, subject paths and blocking.

MiniMax H3 also supports reference videos and explicit reference tokens, but does not expose a native camera-extrinsics socket. For H3, the guide remains a multimodal reference, backed by a deterministic camera-motion description.

---

## 3. Current upstream contracts verified for this plan

### 3.1 MiniMax H3 — native ComfyUI

Current official ComfyUI node:

```text
MiniMaxH3ReferenceToVideo
```

Current important constraints:

- prompt references use `<Picture i>`, `<Video k>`, `<Audio j>`;
- up to 3 reference videos;
- reference video input is an IMAGE frame batch interpreted at 24 fps;
- a reference video needs at least 5 frames;
- generated frame length follows H3's `17n + 5` grid;
- 124–362 frames is the documented/trained normal range even though the node accepts longer values.

Official sources:

- https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_extras/nodes_minimax_h3.py
- https://github.com/Comfy-Org/embedded-docs/blob/main/comfyui_embedded_docs/docs/MiniMaxH3ReferenceToVideo/en.md

OmniCam already has:

- `h3_native`;
- `h3_scene_coverage`;
- H3 dialect handling;
- `reference_frames`;
- `final_prompt`;
- H3 scene-coverage geometry analysis.

This proposal extends those paths rather than replacing them.

### 3.2 Seedance 2.5 — official ByteDance + ComfyUI API node

Current official ComfyUI node:

```text
ByteDance2ReferenceNodeV2
display: ByteDance Seedance 2.5 Reference to Video
```

Current Seedance 2.5 reference limits in ComfyUI:

- up to 30 reference images;
- up to 10 reference videos;
- up to 10 reference audios;
- total reference-video duration up to 30.1 seconds;
- each direct reference video must be at least 1.8 seconds;
- output duration 4–30 seconds;
- `task_type`: `auto | reference | edit | extend`;
- `reference` is the correct task type for an OmniCam guide used to create a new shot.

Official sources:

- https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5
- https://seed.bytedance.com/en/seedance2_5
- https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/nodes_bytedance.py
- https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_api_nodes/apis/bytedance.py
- https://github.com/Comfy-Org/embedded-docs/blob/main/comfyui_embedded_docs/docs/ByteDance2ReferenceNode/en.md

ByteDance's official Seedance 2.5 material specifically describes clay-render reference for:

- camera movement;
- pacing;
- shot-size transitions;
- subject trajectory;
- blocking;
- scene spatial structure.

That makes a dedicated OmniCam clay/white-model guide a first-class target, not merely a cosmetic render mode.

---

## 4. Core design decision: separate viewport look from guide look

The existing `render_mode` currently mixes two different concerns:

1. how the artist views the scene;
2. what gets recorded into the conditioning playblast.

These must be decoupled.

### 4.1 Keep existing render modes for compatibility

Do **not** immediately remove or rename:

```text
omni_ref
graybox
textured
grid
point_field
wireframe
wireframe_texture
card_grid
beauty
```

Saved workflows already use them and `render_mode` participates in validation / serialization.

### 4.2 Introduce two concepts

#### A. Viewport Shading

Artist-facing only.

Examples:

```text
beauty
textured
graybox
wireframe
```

This can remain backed by the current `render_mode` during the first implementation phase.

#### B. Guide Capture Style

Model-facing neutral capture recipe.

Proposed values:

```text
auto
motion_proxy
clay
depth_rich
beauty_reference
passthrough
diagnostic
```

Meaning:

| Guide style | Purpose | Appearance copying risk | Default target |
|---|---|---:|---|
| `motion_proxy` | camera motion, framing, timing, parallax | low | H3 |
| `clay` | white/grey model, spatial layout, blocking | low | Seedance 2.5 |
| `depth_rich` | stronger near/mid/far parallax cues | low | experimental H3 / Seedance |
| `beauty_reference` | intentionally transmit appearance + motion | high / intended | opt-in |
| `passthrough` | use the existing playblast exactly | depends on source | compatibility |
| `diagnostic` | labels / axes / heatmaps / debugging | very high | never default |
| `auto` | Monitor/profile chooses the safest model default | — | default |

### 4.3 Important rule

A user may author in:

```text
Viewport Shading = beauty
```

while recording:

```text
Guide Capture Style = clay
```

The capture renderer must temporarily override materials/lighting without mutating the MotionScene or the artist's viewport settings.

This is the main refactor recommended for greybox / beauty / proxy modes.

---

## 5. Guide styles

### 5.1 `motion_proxy` — H3 default

Based on the current `omni_ref` philosophy.

Render goals:

- one clearly readable subject proxy/card;
- floor plane or sparse floor markers;
- foreground, midground and background depth cues;
- neutral materials;
- no decorative texture;
- no text in the captured pixels;
- no axis gizmos;
- no camera frustum;
- no path overlay;
- no selection outline;
- real authored FOV;
- real authored camera transforms;
- real authored roll;
- real authored cut sequence if the selected profile accepts cuts.

Suggested capture components:

```text
foreground occluder cues
mid-depth subject proxy
background depth posts / markers
ground plane
optional sparse asymmetric landmarks
```

Asymmetry matters: a perfectly symmetric scene can make left/right orbit direction ambiguous.

### 5.2 `clay` — Seedance 2.5 default

This is different from today's generic `graybox`.

Requirements:

- all scene geometry preserved;
- matte white / neutral grey materials;
- original textures disabled;
- simple broad lighting only to reveal volume;
- low-specular response;
- shadows allowed when they improve contact / depth readability;
- no cinematic grading;
- no environment texture;
- no labels or editor chrome;
- authored silhouettes, object placement, blocking and animation preserved.

The target should read like a professional previz / white-model animation.

This guide should intentionally communicate:

```text
spatial layout
blocking
camera path
subject motion path
shot-size transitions
occlusion
timing
```

while intentionally *not* communicating final:

```text
materials
skin
brand colors
lighting design
final look
```

### 5.3 `depth_rich`

Experimental neutral guide optimized for camera interpretation.

Use:

- strong near/mid/far landmarks;
- different neutral luminance values by depth band;
- sparse foreground occluders;
- floor markers;
- clear horizon / ground relationship.

Do not encode depth as psychedelic false color by default. The output is still a reference video consumed by a multimodal model, not a mathematical depth map.

### 5.4 `beauty_reference`

Explicit opt-in only.

Use the current beauty render and tell the destination model that appearance may also be referenced.

Monitor must warn:

```text
RISK: beauty guide may transfer proxy textures, colors, lighting or placeholder assets.
```

### 5.5 `diagnostic`

For human debugging only.

Can include:

- frame number;
- camera position;
- focal/FOV;
- velocity;
- target name;
- path overlays;
- speed heatmap.

Model profiles must reject or warn when this is selected as the final reference guide.

---

## 6. Guide source architecture

Introduce a model-independent internal guide layer.

Do not add a fourth public OmniCam node.

### 6.1 Internal data structure

Suggested internal Python value:

```python
@dataclass(frozen=True, slots=True)
class ReferenceGuide:
    source: str               # recorded | generated | passthrough
    style: str                # motion_proxy | clay | ...
    video: Any | None         # Comfy VIDEO
    frames: Any | None        # IMAGE batch when target requires frames
    fps: float
    frame_count: int
    duration_seconds: float
    camera_summary: str
    reference_index: int
    metadata: dict[str, Any]
```

This is internal compiler state, not a public MotionScene schema.

### 6.2 Source policy

Proposed Monitor advanced input:

```text
guide_source:
    auto
    recorded
    passthrough
```

Future:

```text
generated
```

Phase 1 behavior:

- `auto`: use the connected current playblast;
- `recorded`: require a non-stale playblast;
- `passthrough`: use media as provided, with minimal transformation.

A future headless synthetic renderer can add `generated` without changing the public three-node architecture.

### 6.3 Do not fake clay conversion from arbitrary pixels

A beauty playblast cannot reliably be converted into a real clay reference by simple grayscale/post-processing.

If a model profile requests `clay`, the pixels should be captured from the same MotionScene with clay material overrides.

If the only available playblast was recorded as Beauty:

- `auto` should warn and fall back to `passthrough`, or
- the profile should request a re-recorded guide depending on strictness.

Do not silently label a grayscale beauty video as a clay guide.

---

## 7. Director capture refactor

Current recording calls the same viewport renderer with `cleanCapture=true`.

Refactor this so capture can receive an explicit generic guide style.

Suggested shape:

```javascript
render(
  state,
  cameraState,
  ...,
  cleanCapture,
  captureStyle = "passthrough"
)
```

or preferably a structured options object:

```javascript
render(..., {
  cleanCapture: true,
  captureStyle: "clay",
  includeGrid: false,
  includeLabels: false,
})
```

### 7.1 Material override layer

Do not rewrite each object's material permanently.

Add a capture override stage:

```text
authored material
      |
      +--> interactive viewport material
      |
      +--> capture override material
```

Examples:

- clay: neutral matte material;
- motion_proxy: semantic neutral material;
- beauty_reference: authored/studio material;
- diagnostic: neutral/wire/debug material.

### 7.2 Lighting override layer

Capture lighting should also be style-specific.

`clay`:

- broad key;
- soft fill;
- optional ground/contact shadow;
- no authored colored lighting unless the guide role explicitly includes lighting.

`motion_proxy`:

- flat readable lighting;
- enough shading for 3D volume;
- no dramatic light cues.

### 7.3 Playblast manifest

Extend the playblast manifest with generic capture metadata:

```json
{
  "guide_style": "clay",
  "guide_contract_version": 1,
  "contains_overlays": false,
  "contains_authored_textures": false,
  "motion_scene_fingerprint": "..."
}
```

The fingerprint / stale-playblast logic must include any state that changes the guide pixels.

If `guide_style` is stored outside the current motion fingerprint input, add a dedicated guide fingerprint or explicitly include guide capture configuration in the manifest comparison.

---

## 8. Camera metadata compiler

The guide video is only half the signal.

Monitor must compile the exact authored camera into a deterministic timecoded description.

Reuse existing model-agnostic analysis where possible:

- `segment_motion_phases()`;
- camera trajectory analysis;
- keyframe timings;
- FOV / lens deltas;
- roll;
- target drift;
- path classification;
- cut information.

### 8.1 Canonical camera phase structure

Suggested internal representation:

```python
CameraPhase(
    start_seconds,
    end_seconds,
    motion_type,          # orbit / dolly / truck / crane / pan / tilt / compound / hold
    translation_delta,
    angular_delta,
    fov_start,
    fov_end,
    roll_start,
    roll_end,
    target_behavior,
    framing_start,
    framing_end,
    pace,                 # steady / accelerating / decelerating / hold
    interpolation,
)
```

### 8.2 Keep numeric facts model-independent

The camera analyzer should produce facts.

The destination dialect decides how to phrase them.

Good:

```text
phase.motion_type = dolly_in
phase.delta = 2.4 world units
phase.fov = 35 -> 35
phase.pace = decelerating
```

Bad:

```text
phase.h3_prompt = "H3 should dolly..."
```

---

## 9. Prompt compiler architecture

Introduce:

```text
omnicam/guides/
    model.py
    analysis.py
    manifest.py

omnicam/adapters/
    h3.py
    seedance25.py
```

or keep the existing adapter layout and add only the shared guide package.

Recommended pure functions:

```python
analyze_reference_guide(scene, camera_id) -> GuideAnalysis
build_h3_guide_prompt(...)
build_seedance25_guide_prompt(...)
```

No LLM is required.

Prompt compilation should be deterministic and covered by golden tests.

---

## 10. MiniMax H3 compiler

### 10.1 Keep two distinct H3 products

#### `h3_scene_coverage`

No playblast required.

Continue compiling:

```text
MotionScene camera
    -> H3 geometry analysis
    -> scene-coverage prompt
    -> H3EDIT_OPTIONS
```

This path remains the best option for representable target-centric orbit/arc moves.

#### `h3_native`

Reference-video path.

Upgrade it to treat the playblast as an explicit guide artifact.

### 10.2 H3 default guide style

```text
motion_proxy
```

### 10.3 Reference index

Add an advanced Monitor input:

```text
guide_reference_index: 1..3
default: 1
```

Reason: H3 supports multiple reference videos. The OmniCam camera guide may be `<Video 2>` or `<Video 3>` when another motion/action reference is already connected.

Do not hardcode `<Video 1>`.

### 10.4 H3 prompt dialect

Example compiler output:

```text
Use <Video 2> only as the camera-motion, framing and shot-timing guide.

Follow its camera translation, rotation, viewpoint evolution, parallax,
shot-size changes, acceleration/deceleration and holds.

Do not copy the guide's proxy geometry, grey materials, floor, markers,
placeholder characters, textures, colors or lighting.

Subject identity, final scene appearance, materials and action come from
the main prompt and the other references.

Camera schedule:
[0.00-1.25s] ...
[1.25-3.70s] ...
[3.70-5.17s] ...

{base_prompt}
```

When guide style is `beauty_reference`, omit the "do not copy appearance" contract and replace it with an explicit appearance-reference role.

### 10.5 H3 media conversion

Continue producing:

```text
reference_frames
24 fps
target length = 17n + 5
```

The H3 compiler owns resampling/alignment exactly as today.

---

## 11. Seedance 2.5 Monitor profile

Add a new Monitor profile:

```text
seedance25_reference
```

Suggested contract:

```text
semantic: reference_video
downstream: ByteDance2ReferenceNodeV2
task_type: reference
outputs:
    reference_video
    final_prompt
```

The profile does **not** call the ByteDance API. It only prepares the media and prompt that the official node consumes.

### 11.1 Default guide style

```text
clay
```

This aligns with ByteDance's documented clay/white-model reference workflow.

### 11.2 Seedance reference index

Seedance 2.5 currently supports up to 10 reference videos.

Add:

```text
guide_reference_index: 1..10
```

The same Monitor widget can use the range required by the selected profile:

- H3: 1–3;
- Seedance 2.5: 1–10.

The compiler must say `Video N`, not assume the guide is the first reference.

### 11.3 Seedance prompt dialect

Recommended output:

```text
Use Video 2 as a clay / white-model camera and blocking reference only.

Reference Video 2 for:
- camera movement and viewpoint trajectory;
- pacing and timing;
- framing and shot-size transitions;
- subject trajectory and blocking;
- occlusion and spatial relationships.

Do not copy the guide's grey materials, placeholder geometry, diagnostic
markers, proxy textures or temporary lighting.

Render the final subjects, environment, materials, lighting and style from
the main art-direction prompt and the other references.

Camera plan:
0.00-2.10s: ...
2.10-4.80s: ...
4.80-7.00s: ...

{base_prompt}
```

Avoid inventing a special API media type named "Clay Render". The current ComfyUI Seedance node accepts generic reference videos. "Clay / white-model" is a semantic role communicated in the prompt.

### 11.4 Seedance preflight

Required checks:

```text
seedance25_downstream
guide_video_present
guide_video_fresh
guide_duration
guide_reference_index
guide_style
task_type
reference_media_budget
```

Important current constraints:

- direct guide video >= 1.8 s;
- total reference-video budget <= 30.1 s for Seedance 2.5;
- `task_type=reference` for generating a new result from the guide;
- `edit` and `extend` are different products and must not be silently selected.

If OmniCam cannot know the duration of the user's other Seedance references, report that the guide itself is valid but the downstream node remains authoritative for the total reference budget.

---

## 12. Monitor UI changes

Keep the public node count unchanged.

Proposed advanced Monitor controls:

```text
target_profile

guide_source
    auto
    recorded
    passthrough

guide_style
    auto
    motion_proxy
    clay
    depth_rich
    beauty_reference
    diagnostic

guide_reference_index
    integer
```

Optional later:

```text
guide_strictness
    safe
    permissive
```

### 12.1 Profile-driven defaults

```text
h3_native
    guide_style = motion_proxy

h3_scene_coverage
    guide_style = none

seedance25_reference
    guide_style = clay

external_reference_video
    guide_style = passthrough
```

The UI should show the **resolved** value when `auto` is selected.

---

## 13. Monitor output contract

Do not add model-specific new public outputs unless required.

Existing outputs are sufficient:

```text
final_prompt
reference_video
reference_frames
camera_embedding
native_tracks
tracks_json
target_width
target_height
target_length
h3edit_options
target_fps
```

Mapping:

| Profile | Guide media output | Prompt output |
|---|---|---|
| `h3_native` | `reference_frames` | `final_prompt` |
| `h3_scene_coverage` | none | `final_prompt` + `h3edit_options` |
| `seedance25_reference` | `reference_video` | `final_prompt` |
| `external_reference_video` | `reference_video` | `final_prompt` |

This keeps downstream wiring predictable.

---

## 14. Capability contract for Seedance 2.5

Add a strict adapter registry entry for the current official node:

```text
profile id:
    seedance25_reference

node class:
    ByteDance2ReferenceNodeV2

required conceptual destination:
    final_prompt -> model.prompt
    reference_video -> model.reference_videos.video_N
```

Because the node uses a DynamicCombo/autogrow contract, capability detection must be verified against the actual current ComfyUI schema rather than hardcoding a fragile frontend widget path.

If current capability detection cannot safely validate nested DynamicCombo/autogrow sockets, introduce a small versioned capability adapter for ByteDance rather than weakening preflight globally.

Do not target the deprecated:

```text
ByteDance2ReferenceNode
```

unless a compatibility fallback is explicitly implemented.

---

## 15. Recommended code changes

### Shared guide layer

Create:

```text
omnicam/guides/__init__.py
omnicam/guides/model.py
omnicam/guides/analysis.py
omnicam/guides/validation.py
```

Responsibilities:

- common GuideAnalysis types;
- camera phase extraction;
- guide metadata validation;
- no ComfyUI imports in pure math/analysis modules.

### H3

Modify:

```text
omnicam/adapters/h3.py
omnicam/profiles/h3.py
```

Changes:

- accept/reference guide analysis;
- configurable reference video index;
- guide-style-aware prompt;
- no regression to current frame alignment.

### Seedance 2.5

Create:

```text
omnicam/adapters/seedance25.py
omnicam/profiles/seedance25.py
```

Modify:

```text
omnicam/profiles/catalog.py
omnicam/adapters/registry.py
omnicam/capabilities.py
```

### Monitor

Modify:

```text
omnicam/nodes/monitor.py
omnicam/monitor/result.py        # only if guide metadata is surfaced in UI
web-src/monitor/*
web-src/help/defs.js
```

### Director / capture

Modify:

```text
web-src/viewport/render.js
web-src/playblast-contract.js
web-src/recording*
web-src/state-sync.js            # only if capture style is persisted
web-src/motion-presets.js
```

Exact recording modules must be confirmed from the current source before implementation.

---

## 16. Migration strategy for current render modes

Do not perform a destructive rename in v1.

Phase 1:

```text
render_mode
    remains serialized exactly as today

guide_style
    new generic capture preference
    defaults to auto
```

Suggested compatibility mapping when a legacy workflow has no `guide_style`:

```text
render_mode=beauty
    viewport = beauty
    guide_style = auto

render_mode=graybox
    viewport = graybox
    guide_style = auto

render_mode=omni_ref
    viewport = omni_ref
    guide_style = auto
```

Important: `auto` is resolved by Monitor/profile, not by migration.

Later, if we want cleaner naming, a schema migration can introduce:

```text
viewport_shading
capture_style
```

but that is not required for this feature.

---

## 17. Prompt composition policy

The compiler owns the camera/reference contract.

The user owns art direction.

Recommended final structure:

```text
[reference role / retention contract]

[camera schedule]

[base_prompt]
```

Do not let the compiler silently rewrite the user's subject action.

Do not automatically freeze subjects unless the selected profile is explicitly a frozen-scene product such as H3 scene coverage.

For action shots:

- guide describes camera;
- base prompt describes performance;
- reference-role paragraph separates the two.

For Seedance clay guides, blocking may intentionally be copied when the user authored animated objects/characters in MotionScene.

---

## 18. Multi-shot policy

### H3 scene coverage

Continue to block cuts.

### H3 native

Reference video can carry cuts. When the playblast represents the sequence:

- keep reference-video timing;
- avoid describing one camera as if it covered the entire edit;
- use neutral multi-shot wording plus cut-aware phase descriptions only when they can be represented truthfully.

### Seedance 2.5

Reference video is suitable for multi-shot / long-form camera language.

When cuts exist:

- the guide video remains authoritative for cuts;
- prompt compiler may describe the cut schedule;
- avoid claiming "single continuous take";
- preserve per-shot camera phases.

---

## 19. Guide quality / contamination analysis

Add Guide Health checks.

Suggested checks:

### Geometry readability

- subject visible for sufficient frames;
- sufficient depth variation;
- non-degenerate camera-target distance;
- camera not entirely inside proxy geometry.

### Motion readability

- displacement above a minimal threshold;
- excessive angular velocity warning;
- extreme FOV warning;
- severe framing loss warning.

### Appearance contamination

Warn if:

```text
style = beauty_reference
or
passthrough source manifest says authored textures / labels are present
```

### Overlay contamination

Block or warn when guide contains:

- editor labels;
- camera gizmos;
- path line;
- frame diagnostics;
- selection outline.

---

## 20. Playblast freshness

The existing playblast freshness gate remains important.

Extend its contract so "fresh" means:

```text
same MotionScene motion
+
same sequence/camera target
+
same guide capture configuration
```

If guide style changes from `beauty_reference` to `clay`, the old video is stale even if camera transforms did not change.

The manifest should carry enough information to explain why:

```text
PLAYBLAST_STALE: camera motion matches, but guide style changed beauty_reference -> clay.
```

---

## 21. Tests

### 21.1 Pure Python unit tests

Add:

```text
tests/test_guide_analysis.py
tests/test_h3_guide_prompt.py
tests/test_seedance25_profile.py
tests/test_seedance25_prompt.py
```

Coverage:

- single dolly;
- orbit;
- truck;
- crane;
- compound movement;
- hold;
- reversal;
- FOV animation;
- roll;
- target drift;
- cut sequence;
- reference index.

Golden prompt tests should make wording changes deliberate.

### 21.2 H3 regression

Keep current H3 tests green.

Add explicit assertions for:

- `<Video 1>`, `<Video 2>`, `<Video 3>`;
- no hardcoded Video 1;
- `17n+5` frame alignment unchanged;
- scene-coverage path unchanged.

### 21.3 Seedance contract tests

Mock current capability schema and assert:

- current `ByteDance2ReferenceNodeV2` accepted;
- deprecated node not silently preferred;
- guide under 1.8 s blocked;
- guide index > 10 blocked;
- total known guide duration validated;
- `task_type=reference` documented in preflight/recipe.

### 21.4 Frontend tests

Add tests for:

- Beauty viewport + Clay capture override;
- capture style does not mutate object materials in saved state;
- capture style persists if designed as a preference;
- playblast manifest contains guide style;
- changing guide style invalidates freshness;
- diagnostic overlays never leak into safe capture.

### 21.5 Live ComfyUI tests

Add current stable/master checks where practical for:

- `MiniMaxH3ReferenceToVideo`;
- `ByteDance2ReferenceNodeV2`;
- Monitor output types;
- autogrow destination capability detection.

Do not call paid generation APIs in CI.

---

## 22. Implementation phases

### P0 — contracts and compiler

- add guide analysis types;
- add deterministic camera phase compiler;
- add `guide_reference_index`;
- improve H3 reference prompt;
- add `seedance25_reference` profile;
- add capability contract and tests.

No renderer refactor required yet: use existing playblast pixels.

### P1 — capture style separation

- add generic `guide_style`;
- decouple viewport shading from capture shading;
- implement `motion_proxy`;
- implement real `clay`;
- update playblast manifest/freshness;
- update Monitor UI.

### P2 — depth-rich guide

- foreground/mid/background cue system;
- automatic proxy scene enrichment when the authored scene is too sparse;
- Guide Health diagnostics.

This enrichment must be capture-only and never mutate MotionScene.

### P3 — headless synthetic guide

Optional.

Generate a neutral guide without requiring a browser-recorded playblast.

Requirements:

- deterministic renderer;
- supports canonical camera transforms/FOV/roll;
- supports primitive proxy geometry;
- has a defined fallback for GLB/character assets;
- produces Comfy VIDEO / IMAGE frames using current official ComfyUI APIs.

Do not block P0/P1 on this.

---

## 23. Acceptance criteria

The feature is considered usable when all of the following are true.

### H3

A user can:

1. author a camera move in Director;
2. record a model-safe guide;
3. choose `h3_native`;
4. choose which `<Video N>` slot the OmniCam guide occupies;
5. receive correctly aligned H3 reference frames and a camera-only prompt;
6. keep identity/style references separate.

### Seedance 2.5

A user can:

1. author camera + blocking in Director;
2. view the scene in Beauty if desired;
3. capture a Clay guide without changing the authored viewport;
4. select `seedance25_reference`;
5. receive a VIDEO guide and deterministic prompt;
6. connect them to the official `ByteDance2ReferenceNodeV2`;
7. use `task_type=reference`;
8. keep separate image/video references for identity, style and action.

### Compatibility

- old workflows still load;
- current `render_mode` values remain valid;
- existing H3 profiles keep their current output types;
- no fourth public OmniCam node is introduced;
- MotionScene remains model-independent.

---

## 24. Recommended product terminology

To reduce confusion in the UI:

```text
Viewport Shading
    Beauty
    Textured
    Graybox
    Wireframe
    ...

Guide Style
    Auto
    Motion Proxy
    Clay / White Model
    Depth Rich
    Beauty Reference
    Passthrough
    Diagnostic

Target Profile
    MiniMax H3 Native
    MiniMax H3 Scene Coverage
    Seedance 2.5 Reference
    ...
```

Avoid calling every captured render a "playblast" in the model-facing UI.

A useful distinction is:

```text
Playblast = artist preview / recorded viewport
Guide = model-facing conditioning reference
```

They may be the same file in compatibility mode, but they are not the same semantic object.

---

## 25. Final architectural target

```text
                         OMNICAM DIRECTOR
                               |
                 +-------------+-------------+
                 |                           |
          MotionScene                   Playblast pixels
        exact camera data             recorded reference
                 |                           |
                 +-------------+-------------+
                               |
                         OMNICAM MONITOR
                               |
                     Reference Guide Layer
                      /       |        \
             motion_proxy    clay     beauty
                    |          |         |
                    +----------+---------+
                               |
                      Camera Phase Analysis
                               |
                +--------------+---------------+
                |                              |
          H3 Prompt Dialect              Seedance 2.5 Dialect
                |                              |
       <Video N> camera only         Video N clay/white-model
                |                              |
       reference_frames                 reference_video
                |                              |
                v                              v
      MiniMaxH3ReferenceToVideo      ByteDance2ReferenceNodeV2
```

This architecture keeps OmniCam's value in the correct place: the artist authors one real camera/scene description, and Monitor turns it into the form each model understands.
