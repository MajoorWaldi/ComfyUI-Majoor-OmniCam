


<p align="center">
  <img src="web/assets/omnicam-icon.svg" width="112" alt="Majoor OmniCam">
</p>

<h1 align="center">Majoor OmniCam</h1>

<p align="center">
  <strong>Camera direction, animation and motion-reference authoring directly inside ComfyUI.</strong>
</p>

<p align="center">
  Design the camera before generating the video.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ComfyUI-0.31%2B-blue" alt="ComfyUI 0.31+">
  <img src="https://img.shields.io/badge/Python-3.10%20%7C%203.12-blue" alt="Python 3.10 / 3.12">
  <img src="https://img.shields.io/badge/Version-0.3.0-orange" alt="Version 0.3.0">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
</p>

---

<!-- BANNER -->
<!--
<p align="center">
  <img src="docs/assets/omnicam-banner.png" alt="Majoor OmniCam">
</p>
-->

## What is OmniCam?

**Majoor OmniCam** is a camera layout and animation system for ComfyUI.

Instead of describing camera movement only with text such as:

> *"Slow cinematic orbit around the subject."*

OmniCam lets you **build the actual camera trajectory**.

Position the camera in a 3D viewport, create keyframes, edit animation curves, preview the shot in real time and record a lightweight proxy video that can be used as camera-motion guidance for compatible AI video workflows.

```text
Camera Layout
     ↓
Animation
     ↓
Canonical Camera Track
     ↓
Proxy / Camera Data
     ↓
AI Video Model
```

OmniCam does not run a diffusion model while you are authoring the shot.

The goal is to make camera direction fast, visual and predictable before generation.

---

## Director Preview

<!-- Add an animated GIF or WebP here later -->

<!--
<p align="center">
  <img src="docs/assets/director-demo.gif" alt="OmniCam Director Demo">
</p>
-->

The **OmniCam Director** provides a small shot-layout environment directly inside ComfyUI with:

- interactive 3D camera navigation;
- keyframe animation;
- F-Curve editing;
- multiple cameras;
- simple scene geometry;
- image and video cards;
- 3D model import;
- Look-At targets;
- parented animated objects;
- camera-path visualization;
- proxy playblast recording;
- camera motion analysis.

---

# Why OmniCam?

Text prompts are useful for describing intent.

But camera movement is spatial and temporal.

A prompt such as:

```text
Slow dolly forward while slightly orbiting around the house.
```

still requires the video model to interpret:

- the exact trajectory;
- the amount of translation;
- acceleration;
- framing;
- perspective change;
- orbit radius;
- timing;
- subject scale.

OmniCam lets you author those properties visually.

```text
PROMPT ONLY

"orbit around the subject"
        ↓
model interpretation


OMNICAM

authored camera trajectory
        ↓
camera reference / conditioning
        ↓
model generation
```

---

# How it works

OmniCam is built around a model-agnostic camera representation.

```text
                         ┌────────────────────────┐
                         │   MiniMax H3           │
                         └────────────▲───────────┘
                                      │
                         ┌────────────┴───────────┐
                         │ Universal Reference    │
                         │ & AI Prompts           │
                         └────────────▲───────────┘
                                      │
                                      │
┌─────────────────┐        ┌──────────┴─────────┐
│ OmniCam         │        │ MAJOOR_OMNICAM_   │
│ Director        ├───────►│ TRACK             │
└───────┬─────────┘        └──────────┬─────────┘
        │                              │
        │                              ├────────────► Wan Native Camera
        │                              │
        │                              ├────────────► Wan / ATI
        │                              │
        ▼                              │
   Proxy Video                        └────────────► LTX Camera Guide
```

The camera track is the canonical source of truth.

The viewport, backend and adapters are designed around the same camera motion.

---

# Product workflow

```text
OmniCam Extractor
    ↓ recover camera motion
OmniCam Director
    ↓ author camera motion
OmniCam Monitor
    ↓ inspect, validate and route
AI-video adapter / model workflow
```

The three product nodes share the versioned `MAJOOR_OMNICAM_TRACK` contract.
Extractor recovers a relative trajectory from video, Director authors and
serializes the shot, and Monitor is the QC/preflight/delivery stage before a
generation. Model-specific behavior stays behind Monitor's adapter selection;
it never leaks into the canonical track.

## OmniCam Monitor

Connect the Director's `camera_track` and, when available, `proxy_video` to
`MajoorOmniCamMonitor`. Monitor provides camera-health metrics, adapter
preflight, proxy playback, exact lightweight adapter previews, copyable prompt
and camera-data panels, a shared read-only Camera/Look At/FOV/Roll timeline,
and separate preflight and execution-output states.

The adapter menu supports H3, Wan Native Camera, Wan/ATI, native Wan tracks and
LTX. Exact lightweight representations are labelled **OUTPUT PREVIEW**; the Wan
Native camera path is explicitly labelled **DIAGNOSTIC** because its embedding
only exists during normal graph execution.

**Refresh and Live Sync do not queue the ComfyUI graph, run a model, generate a
Wan embedding or decode full LTX guide tensors.** They call only the bounded
snapshot endpoint. Existing adapter nodes remain loadable under
`Majoor/OmniCam/Legacy`, but new workflows should use Monitor.

---

# The OmniCam Proxy

The OmniCam proxy is **not a beauty render**.

It is a lightweight spatial reference designed to communicate camera motion clearly.

It focuses on:

- camera trajectory;
- parallax;
- framing;
- perspective changes;
- subject scale;
- velocity;
- acceleration and deceleration;
- orbit direction;
- dolly / truck / crane movement;
- depth relationships.

For reference-video models such as MiniMax H3:

```text
Proxy Video
=
Camera Motion Reference
```

while:

```text
Image References
=
Subject
Appearance
Materials
Lighting
Environment
Style
```

The proxy geometry, grid, markers and neutral viewport appearance are not intended to appear in the final generated video.

---

# Public Nodes

OmniCam currently exposes **six public nodes**.

## 🎥 OmniCam Director

The main camera-authoring environment.

Use it to:

- create and animate cameras;
- edit keyframes;
- edit F-Curves;
- create Look-At relationships;
- add simple scene objects;
- preview camera movement;
- record camera-reference playblasts;
- output the canonical OmniCam camera track.

Main outputs include:

```text
camera_track
proxy_video
proxy_frames  (an IMAGE twin of proxy_video, for graphs that want frames)
audio
```

### Media sockets take a VIDEO or an IMAGE batch

Every OmniCam socket that carries footage — the Director's `image` and `video`,
the Extractor's `video`, the Monitor's `proxy_video` — is a multi-type socket
accepting either a ComfyUI `VIDEO` or an `IMAGE` batch, so a generator's frames
connect without an `ImageToVideo` node in between.

The conversion happens at the node boundary:

| Connected | Wanted | What OmniCam does |
|---|---|---|
| `IMAGE` | video | wraps the batch in memory, read at the node's own fps, or 24 when it has none |
| `VIDEO` | images | samples the clip, never decoding it whole |
| `IMAGE` | a solvable source | encodes it below `temp/omnicam/extractor_runtime/` first, because a solve seeks inside its source |

### Video outputs carry an IMAGE twin

An output can only ever return one concrete value, so a "VIDEO or IMAGE" output
socket does not exist — ComfyUI has no such type, and a downstream node that
expected one would receive the other. Instead, every socket that outputs a
proxy or reference video carries a second, plain `IMAGE` output next to it:
`proxy_frames` on the Director, `reference_frames` on the Monitor and on the
deprecated H3 compatibility node. Each twin is a bounded, uniform sample of the
video beside it — never a full decode — and degrades to `None` rather than
aborting the node if that video cannot be sampled. Connect whichever output
your downstream node actually wants; nothing needs both.

### Interface density: Basic, Animation, Advanced

The `View` menu's `Interface` selector (also in ComfyUI's Settings, under
Director defaults) picks how much of the editor chrome is shown, the way
Blender's "Simplify" or Maya's UI levels do — not three different layouts,
just progressive disclosure of the same one:

| Tier | Adds |
|---|---|
| `Basic` | placing objects and cameras, keyframing, playback, playblast |
| `Animation` | camera import/export, aim baking, the Health panel, the animation curve editor, output delivery presets |
| `Advanced` | everything: sub-object selection, spatial snapping, diagnostic overlays, background stills, cache maintenance |

The Interface selector itself is never hidden by its own setting, and leaving
a tab that a lower tier hides (Health, in Basic) falls back to the Outliner
rather than showing a blank pane.

### Node mark


Every OmniCam node carries the same mark in its title bar — a red centre inside a
sober ring (`◉`). When the node is selected on the graph it gains a slow, discreet
red halo, so the node you are steering from the viewport stays easy to pick out on
a busy canvas. The mark is defined once in [`web/assets/omnicam-icon.svg`](web/assets/omnicam-icon.svg)
and reused for the ComfyUI Registry icon and this document's header.

---

## 🎬 OmniCam Extractor

Recovers a relative 6DoF camera trajectory from **one continuous video shot**
and emits the same canonical `MAJOOR_OMNICAM_TRACK` the Director produces.

```text
Load Video -> OmniCam Extractor -> OmniCam Director -> adapters
```

Outputs:

```text
camera_track
confidence
report
```

### What it recovers, and what it does not

It solves translation, orientation, and the resulting velocity, acceleration
and path curvature. It does **not** recover metric scale, an exact physical
focal length, animated zoom, lens distortion, or rolling shutter, and it does
not reconstruct multi-shot edits or any object/body motion.

Two consequences are worth stating plainly:

- **Translation scale is relative.** A single moving lens cannot tell a small
  camera move through a small room from a large one through a large room. The
  `motion_scale` widget is how you size the result for your scene.
- **`confidence` is solver coverage, not accuracy.** It reports the share of
  sampled frames that produced a pose. A clean solve at the wrong scale still
  scores 1.0.

### Solvers

| `method` | Behaviour |
|---|---|
| `auto` | DPVO when installed, otherwise OpenCV/SIFT, otherwise an actionable error |
| `dpvo` | DPVO only |
| `opencv_sift` | Classical visual odometry only |

Both backends are **optional**. OmniCam loads normally with neither installed;
only the Extractor node itself is unavailable, and the setup diagnostic reports
that as a warning rather than an error.

DPVO ([princeton-vl/DPVO](https://github.com/princeton-vl/DPVO), MIT) needs its
compiled CUDA extension plus a checkpoint at a fixed managed path:

```text
ComfyUI/models/omnicam/dpvo/dpvo.pth
```

The path is not configurable from the node, and **OmniCam never runs
`pip install` for you**. When a backend is missing, the error message says
exactly what is missing and what to do about it.

Each DPVO solve runs in a fresh spawned process. Frames cross the boundary
through a private NumPy memmap below ComfyUI's temp directory; the exchange is
removed on success, stop and failure. When the child exits, its CUDA context
exits with it, so DPVO VRAM is returned to the driver instead of remaining in
ComfyUI's PyTorch allocator until a server restart.

#### DPVO on the Windows portable build

The official DPVO install is a source install: it clones the repository with
submodules, adds Eigen 3.4.0, then runs `pip install .` to compile CUDA
extensions. It does not provide a portable Windows wheel. The build must use a
CUDA toolkit compatible with the CUDA version used to build ComfyUI's PyTorch,
as well as the MSVC C++ compiler.

For example, a ComfyUI environment with PyTorch `+cu130` cannot build DPVO with
the system CUDA 12.x toolkit. The resulting error is a CUDA version mismatch;
installing the Python files alone does not fix it. Do not downgrade or replace
ComfyUI's PyTorch just to silence this error without a separate environment.

If those prerequisites are not available, select `method=opencv_sift` (or keep
`method=auto` to use it as the fallback). DPVO also needs its downloaded model
at the managed path above; the Extractor never downloads packages or model
weights at runtime.

### Interactive tracking, without pressing Run

The Extractor node carries a solve panel. `▶ TRACK` starts the solve
immediately and **does not queue a ComfyUI prompt** — no render, no waiting
behind whatever else is in the queue, and no diffusion model loaded.

```text
▶ TRACK      start solving now
Ⅱ PAUSE      stop at the next safe checkpoint
▶ RESUME     continue the same job, from where it was
■ STOP       abandon it, keeping the partial path for review
```

Pause and normal stop are **cooperative**: the solver is asked between safe
frames. That is why the panel distinguishes `PAUSING` (asked) from `PAUSED`
(actually stopped). Server shutdown, a crashed child or a timeout still reaps
the isolated process so no DPVO worker survives its job.

While it runs the panel shows three views:

| Tab | Shows |
|---|---|
| `SOURCE` | the clean managed footage the solver is reading |
| `TRACK 3D` | the solved trajectory, read-only: orbit, pan, zoom, Fit, Top/Front/Side |
| `COMPARE` | clean source, the same frame with live solver points, and the read-only 3D track side by side |

Before the first graph execution, interactive tracking needs a file-backed
video. A `Load Video` node or `Choose Video` works immediately. A runtime-only
source — an executing `VIDEO`, or an `IMAGE` batch — is materialized during
normal graph execution below `temp/omnicam/extractor_runtime/`; the execution
envelope then refreshes the preview and enables subsequent interactive tracking
from that safe `[temp]` reference. The panel never queues the graph by itself.

OpenCV streams a bounded transient 3D path while it tracks. DPVO exposes honest
source-frame progress but publishes its trajectory only after global
optimization completes; it does not fabricate intermediate camera poses.

### Cleaning a solve

The raw solve is **immutable**. Every slider re-derives a refined track from it,
which is why the controls are live: refining runs no solver, decodes no video
and touches no GPU.

```text
Position / rotation smoothing   centred, so smoothing adds no temporal lag
Motion scale                    sizes the relative translation for your scene
Key reduction                   fewer keys, within a tolerance you set
Global alignment                one pitch/yaw/roll offset for the whole solve
Trim                            in/out on the refined output only
Spike review                    INTERPOLATE / IGNORE / EXCLUDE per flagged frame
```

Spike detection uses robust statistics (median and MAD), so a camera that is
simply moving fast is not flagged for moving fast — only a step that does not
fit the rest of the shot is.

`RESET` returns to the raw solve exactly. Nothing in this list edits the
reconstruction; it corrects it. Moving a key because you want the shot to feel
different is the Director's job.

### Applying to the Director

`APPLY REFINED` stores the cleaned track and notifies the connected Director.
It does not queue anything either.

Applying is explicit on purpose. While you experiment the Director keeps what
it already has, and once you change a setting after applying, the panel reads
`OUTDATED` until you apply again. A stopped or failed solve can never be
applied at all: a partial trajectory is reviewable, not shippable.

### Extractor to Director

Connect `camera_track` into the Director's optional `camera_track` input.

The Director imports each **new** solve once, identified by a fingerprint of
the track, and then leaves it alone. That is what lets you keep editing:

1. queue the Extractor, and the trajectory appears in the Director;
2. edit keys, retime, smooth, refine F-Curves;
3. re-running with the same footage and settings produces the same fingerprint,
   so **your edits survive**;
4. changing the footage or a solver setting produces a new fingerprint, and the
   new source trajectory replaces the camera.

To freeze a solved trajectory permanently, **disconnect the cable**. The
imported keys stay exactly where they are and simply stop being refreshed.

The Director keeps its own scene throughout: cards, models, audio, background,
render mode and output resolution are never replaced by a camera import.

---

## ✨ Universal Reference & AI Prompts

Analyzes the authored camera trajectory and creates camera-motion prompts for video-generation workflows.

Designed for workflows including:

- MiniMax H3;
- Kling;
- Luma;
- HunyuanVideo;
- Wan;
- generic / universal video prompting.

The node can analyze:

- dolly;
- truck;
- crane / pedestal;
- pan;
- tilt;
- orbit;
- roll;
- zoom;
- compound camera moves;
- camera speed;
- acceleration;
- path curvature;
- FOV evolution.

For MiniMax H3, the generated prompt explicitly treats the OmniCam proxy as **camera-motion guidance only**.

---

## 🟣 OmniCam → Wan Native Camera

Converts an OmniCam camera track to ComfyUI's native Wan camera-conditioning representation.

```text
OmniCam Director
       ↓
camera_track
       ↓
Wan Native Camera
       ↓
WAN_CAMERA_EMBEDDING
       ↓
Wan Camera Image To Video
```

This path is intended for perspective camera tracks compatible with Wan camera conditioning.

---

## 🔵 OmniCam → LTX Camera Guide

Converts the OmniCam proxy video into guide frames for compatible LTX IC-LoRA workflows.

Features include:

- frame-range selection;
- maximum-frame limits;
- contiguous or uniform sampling;
- optional resizing;
- decoded-frame memory safeguards;
- camera-motion prompt generation;
- camera-profile metadata.

```text
OmniCam Director
       │
       ├── camera_track
       │
       └── proxy_video
              ↓
       LTX Camera Guide
              ↓
        IMAGE guide frames
              ↓
   LTX Add Video IC-LoRA Guide
```

---

## 🟠 OmniCam → WanVideoWrapper ATI

Projects stable 3D reference points through the authored camera and converts the resulting trajectories into ATI-compatible 2D tracks.

Useful for WanVideoWrapper trajectory-control workflows.

```text
3D Reference Points
        ↓
OmniCam Camera
        ↓
2D Projected Trajectories
        ↓
ATI Tracks
```

---

# Quick Start

## 1. Add OmniCam Director

Search for:

```text
OmniCam Director
```

under:

```text
Majoor / OmniCam
```

---

## 2. Position the camera

Navigate the viewport using the camera controls.

Typical controls include:

```text
Orbit
Pan
Dolly
Fly Camera
```

---

## 3. Create the first keyframe

Move to the desired timeline frame and press:

```text
I
```

to insert or replace a camera keyframe.

---

## 4. Create another camera position

Move to another frame on the timeline.

Reposition the camera and press:

```text
I
```

again.

---

## 5. Preview the animation

Press:

```text
Space
```

to play or pause the camera animation.

---

## 6. Refine the motion

Use the F-Curve editor to adjust:

- timing;
- easing;
- acceleration;
- deceleration;
- position;
- target;
- FOV;
- roll.

---

## 7. Record a proxy

Generate a lightweight playblast that represents the authored camera motion.

---

## 8. Connect an adapter

Choose the output path appropriate for your workflow:

```text
MiniMax H3
Wan Native Camera
Wan / ATI
LTX
Universal Prompt
```

---

# Useful Shortcuts

| Shortcut | Action |
|---|---|
| `I` | Insert / replace camera keyframe |
| `Space` | Play / pause |
| `F` | Frame the current subject / target |
| `W A S D` | Fly camera |
| `Q / E` | Vertical fly movement |

See the full control reference:

[Keyboard shortcuts and controls](docs/SHORTCUTS.md)

---

# Director Layout

The Director is a panelled shot-layout tool rather than a form node:

```text
header      OmniCam Director · overflow menu · live status
toolbar     Viewport · Cameras · View · Display        Playblast · proxy mode
body        viewport (tool rail, view pills, zoom, axis gizmo, radar, hints) | Outliner / Inspector / Shot
lower       camera preview | transport · frame ruler · multi-channel dope sheet
graph       Graph Editor / Dope Sheet tabs (channel list, interpolation, tangents)
footer      help                                              Playblast
```

The **Inspector** groups the camera into Lens (focal length in millimetres and
FOV, two readouts of the same value), Transform, and Motion. Advanced controls
that the panel does not surface directly -- lens presets, blocking scene sets,
motion presets, camera shakes, projection and clipping -- live in the toolbar
tabs and in the collapsed sections beneath each card. Nothing was removed.

The **dope sheet** shows one row per animated channel under a shared frame
ruler. OmniCam keys are whole-camera, so a channel row marks the keys where
*that channel actually changes*; the master Camera row still owns all drag,
retime and selection. Every lane is the same height and the ruler is a lane of
its own, so the ticks and the diamonds line up by construction. Dragging the
ruler scrubs; the range input behind it is kept off-screen so keyboard and
assistive users still have a focusable scrubber.

The lower panel has two views of the same keys. **Graph Editor** draws the
curves; **Dope Sheet** breaks the graphed group into its individual components
(Position X, Y and Z as three rows) so it lines up with the channel list beside
it. Both axes of the graph snap to round numbers, and the X axis uses the same
step function as the ruler above, so a frame sits at the same place in both.

**Path Smoothing** blends interior keys toward their neighbours from an
untouched baseline, so dragging the slider back to 0% restores the authored keys
exactly. It never bakes a key per frame.

---

# Camera Interchange

OmniCam exports to *formats*, not to applications, so nothing depends on a
vendor plugin staying current. **Viewport → Camera Interchange** holds both
directions.

| Export | Read by | Fidelity |
|---|---|---|
| `.glb` / `.gltf` | Blender, Maya, Unreal, Unity, Houdini, web viewers | lossless back into OmniCam |
| `.usda` | Maya, Houdini, Unreal, Blender, usdview | position, orientation and animated focal length |
| `.chan` | Maya, Nuke, Houdini, 3DEqualizer, SynthEyes, PFTrack | position, aim direction, roll and FOV |

Import accepts `.gltf`, `.glb`, `.fbx`, `.chan` and OmniCam or Blender JSON.
FBX is decoded in the viewport with the loader it already bundles; everything
else is read by the backend, which owns the track contract.

Two properties worth knowing:

- **Everything is baked, one sample per frame.** OmniCam interpolates with
  ease / smooth / bezier / hold, and none of those exist in glTF, USD or
  `.chan`. Writing only the keys would hand the receiving application a
  different curve than the one the playblast recorded.
- **glTF round-trips losslessly** because the canonical track rides along in
  `extras.omnicam`. A glTF camera node cannot express the look-at *distance*,
  an animated field of view, or the authored interpolation; other applications
  read the standard node and animation, while OmniCam reads the sidecar.

**Not offered:** OBJ has no camera, no animation and no field of view, so a
camera cannot be stored in it at all. FBX has no usable pure-Python writer and
its readers are strict about version and structure, so export goes through
glTF or USD, which reach the same applications.

---

# Studio Viewport

The editing viewport is lit like a modern 3D web tool: image-based lighting from
a graded sky, a key/fill/rim rig, a soft contact shadow and ACES tone mapping.

This is a *presentation* layer, and it stops at the capture boundary. The proxy
playblast still records the flat neutral reference the conditioning models
expect (AGENTS.md §7), because a pretty reference invites the model to copy
appearance as well as motion. One render mode opts out of that rule:

| Render mode | Viewport | Playblast |
|---|---|---|
| `omni_ref`, `graybox`, `grid`, `point_field`, `wireframe`, `card_grid` | lit studio | flat neutral proxy |
| `beauty` | lit studio | lit studio |

**Quality** lives in ComfyUI settings under *OmniCam → Viewport*: Low, Balanced
(default) or High, changing shadow resolution and exposure. With *Drop quality
when the viewport stutters* enabled, a sustained run below ~40fps steps the
level down once and leaves it there; it never climbs back on its own, because
oscillating quality mid-drag is worse than being one level conservative.

Two implementation constraints worth knowing before editing the rig:

- The key light is **always** a shadow caster and `shadowMap.enabled` is always
  true. Toggling either after the first frame changes shader defines that
  three.js will not recompile, and the shadows silently vanish. Quality only
  moves the shadow map resolution.
- `logarithmicDepthBuffer` is **off**. It is incompatible with shadow mapping,
  which is why the viewport had no shadows at all while it was enabled.

---

# Settings and Language

OmniCam registers its preferences in ComfyUI's own settings dialog, under
**OmniCam → Director**. They seed *newly created* Director nodes only; values
already saved in a workflow always win when that workflow is loaded.

| Setting | Default | Effect |
|---|---|---|
| `Viewport language` | Follow ComfyUI | Language of the Director viewport |
| `Default FPS` | 24 | Frame rate of a new Director node |
| `Default duration / width / height` | 5 s / 1280 / 720 | Timeline and output size of a new Director node |
| `Default proxy render mode` | `omni_ref` | Render mode of a new Director node |
| `Default playblast encoder` | WebCodecs | Deterministic encoder, or the realtime fallback |
| `Navigation` | Maya / 1× | Default navigation profile and fly speed |
| `Timeline` | 1 frame / Auto Key off | Default snapping increment and Auto Key state |
| `Display` | grid and paths on | Default grid, mini-map, camera paths, safe areas and gizmos |
| `Undo history limit` | 100 | Maximum Undo steps retained by a Director editor |

The viewport ships English and French. `Follow ComfyUI` mirrors the `Comfy.Locale`
setting, so switching ComfyUI to French switches OmniCam too.

Adding another language means dropping a catalogue in `web-src/locales/` and
registering it: every user-facing string already resolves through `t()`.
`npm run check:locales` reports coverage and fails on keys that no longer exist
in the source.

---

# Workflow Examples

Screenshots and example workflows will be added progressively.

## MiniMax H3

```text
OmniCam Director
       │
       ├───────────────────────────────┐
       │                               │
camera_track                      proxy_video
       │                               │
       ▼                               │
Universal Reference                   │
& AI Prompts                           │
       │                               │
       ▼                               ▼
camera prompt                    H3 Video 1
       │                               │
       └───────────────┬───────────────┘
                       ▼
                 MiniMax H3
```

<!--
<p align="center">
  <img src="docs/assets/workflow-h3.png" alt="OmniCam MiniMax H3 Workflow">
</p>
-->

---

## Wan Native Camera

```text
OmniCam Director
       ↓
camera_track
       ↓
Wan Native Camera
       ↓
camera_embedding
       ↓
Wan Camera Image To Video
```

<!--
<p align="center">
  <img src="docs/assets/workflow-wan.png" alt="OmniCam Wan Workflow">
</p>
-->

---

## LTX

```text
OmniCam Director
       │
       ├── camera_track
       │
       └── proxy_video
              ↓
       LTX Camera Guide
              ↓
         guide_frames
              ↓
 LTX Add Video IC-LoRA Guide
```

<!--
<p align="center">
  <img src="docs/assets/workflow-ltx.png" alt="OmniCam LTX Workflow">
</p>
-->

---

# Camera Animation

OmniCam supports animated camera properties including:

```text
Position X / Y / Z
Target X / Y / Z
FOV
Roll
Zoom
Projection
```

Keyframes support interpolation modes and editable Bézier tangents.

The camera sampler is shared between the authored viewport representation and the canonical camera track, with frontend/backend parity testing used to reduce differences between previewed and executed motion.

---

# Scene Layout

The Director also includes lightweight scene-layout tools.

Supported scene elements include simple primitives and reference objects useful for camera blocking.

Typical uses:

- subject placeholders;
- architecture blocking;
- ground reference;
- product layout;
- parallax references;
- image cards;
- video cards;
- imported 3D assets.

The goal is not to replace Blender, Maya or Unreal.

OmniCam is designed as a **fast shot-layout environment inside ComfyUI**.

---

# Look-At and Object Tracking

Cameras can target scene objects.

Target relationships support:

- animated objects;
- target offsets;
- object hierarchy;
- parented transforms.

This makes it possible to create shots where the camera follows or looks toward a moving subject while still preserving authored camera movement.

---

# Camera Motion Analysis

OmniCam can analyze the complete trajectory rather than only comparing the first and last frame.

Metrics can include:

```text
Path Length
Translation
Orbit Angle
Angular Motion
Speed
Acceleration
Jerk
Path Curvature
Target Distance
FOV Evolution
Framing
```

This analysis is used to create more useful motion descriptions for AI video models.

---

# Installation

## ComfyUI Registry / Manager

Once the Registry release is available:

1. Open ComfyUI.
2. Open **Manager**.
3. Search for:

```text
Majoor OmniCam
```

4. Install the node.
5. Restart ComfyUI if requested.

---

## Manual Installation

Clone the repository inside:

```text
ComfyUI/custom_nodes/
```

Example:

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam.git
```

Install Python dependencies if required:

```bash
cd ComfyUI-Majoor-OmniCam
pip install -r requirements.txt
```

Restart ComfyUI.

The nodes should appear under:

```text
Majoor / OmniCam
```

---

# Requirements

Current package requirements include:

```text
ComfyUI >= 0.31.0
Python >= 3.10
comfyui-frontend-package >= 1.48.7  (shipped with ComfyUI)
```

`comfyui-frontend-package` is declared in `pyproject.toml`, which is the
mechanism the [Registry specification](https://docs.comfy.org/registry/specifications)
defines for frontend compatibility. It is a lower bound: it only pulls an
upgrade when your ComfyUI frontend is actually older than OmniCam needs.

OmniCam is tested against supported ComfyUI versions in CI.

Some adapters require additional model-specific custom nodes.

---

# Compatibility

OmniCam does **not modify ComfyUI core files**.

The core camera track is model-agnostic.

Model-specific behavior is isolated inside adapters.

Compatibility with external workflows depends on the installed versions of those integrations.

Current integration targets include:

| Integration | Status |
|---|---|
| ComfyUI native Wan Camera | Supported |
| MiniMax H3 Reference Video | Supported workflow |
| LTX Video IC-LoRA Guide | Supported workflow |
| WanVideoWrapper ATI | Supported adapter |
| Generic prompt workflows | Supported |

Adapter compatibility is checked at runtime where possible.

---

# Philosophy

OmniCam follows one core rule:

```text
What you author
=
What the camera track describes
=
What adapters receive
```

The project separates:

```text
Editor State
     ↓
Validation
     ↓
Canonical Camera Track
     ↓
Camera Sampling
     ↓
Adapters
```

Model-specific logic does not belong inside the viewport engine.

---

# Proxy Philosophy

The default proxy should make motion easy to understand rather than look visually impressive.

The proxy prioritizes:

```text
Parallax
Depth
Perspective
Scale
Velocity
Direction
Framing
```

over:

```text
Beauty Lighting
Complex Materials
Photorealism
Heavy Rendering
```

This keeps camera authoring lightweight and makes the reference easier for compatible AI video systems to interpret.

---

# Documentation

More detailed documentation is available here:

- [Node Guide](docs/NODES.md)
- [Keyboard Shortcuts](docs/SHORTCUTS.md)
- [Security and File Limits](docs/SECURITY.md)
- [Validation Report](docs/VALIDATION_REPORT.md)

---

# Security

OmniCam follows ComfyUI-managed input/output paths and does not intentionally expose arbitrary filesystem access.

The project includes protections for:

- upload size;
- supported file types;
- managed directories;
- path traversal;
- temporary file cleanup;
- video metadata validation.

See:

[Security and file handling](docs/SECURITY.md)

---

# Development

The repository separates the camera core from ComfyUI and model integrations.

```text
omnicam/
├── core/
├── adapters/
├── nodes/
└── ...

web-src/
├── director/
├── curve editor
├── viewport
└── ...

web/
└── omnicam.js
```

The production frontend is bundled into a single public JavaScript entrypoint.
ComfyUI eagerly imports every `.js` found recursively under a node's web
directory, so code-splitting the bundle would not defer anything; instead the
three.js surface is narrowed to what the viewport actually uses, in
`web-src/three-runtime.js`.

Local checks:

```text
npm run check          # line limits, encoding, three.js surface, locales, DOM contract, licences, bundle syntax
npm run test:unit      # frontend unit tests
npm run test:browser   # Playwright viewport tests
pytest -q              # Python suite (skips ComfyUI-only suites when absent)
ruff check .
mypy                   # scoped to the pure camera math, see pyproject.toml
```

---

# Testing

The project includes tests for areas such as:

- track validation;
- migrations;
- camera interpolation;
- Bézier timing;
- JavaScript / Python sampling parity;
- camera projection;
- Look-At targets;
- object hierarchy;
- quaternion generation;
- adapter payloads;
- runtime capability detection;
- frontend behavior;
- ComfyUI integration.

CI currently covers:

```text
Python 3.10 / 3.12, core only (no ComfyUI, no torch)
Python 3.12 with the ComfyUI runtime dependencies present
Lint (ruff) and type-check (mypy)
ComfyUI minimum supported version
Current ComfyUI
Frontend unit tests
Browser tests
Production bundle validation
```

The core suite deliberately runs without ComfyUI or torch installed: suites that
genuinely need them skip themselves via `pytest.importorskip`, and a second job
installs those dependencies so nothing is silently never exercised.

---

# Known Scope

OmniCam is currently focused on **camera authoring and camera-conditioning workflows**.

The following systems may exist internally or experimentally but are not currently part of the main public node surface:

```text
Internal camera-math helpers
Scene-motion analysis helpers
Development utilities
```

The sequencer, the Sequence/EDL nodes, the sequence data model, the Track
Sampler and Camera Tools nodes, the audio/video assembly stack and the
Blender/Unreal DCC exporters were removed from the shipped package: none of them
were reachable from the public nodes. Their history remains in git.

The public interface intentionally remains small.

---

# Public Node Surface

The current Registry release exposes exactly:

```text
1. OmniCam Director
2. Universal Reference & AI Prompts
3. OmniCam → Wan Native Camera
4. OmniCam → LTX Camera Guide
5. OmniCam → WanVideoWrapper ATI
```

---

# Feedback and Issues

If you find a bug, camera mismatch, integration issue or have a workflow suggestion, please open an issue:

https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/issues

Useful reports include:

- ComfyUI version;
- OmniCam version;
- model / adapter being used;
- workflow JSON if possible;
- screenshots or proxy examples;
- expected camera behavior;
- actual camera behavior.

---

# License

Majoor OmniCam is released under the **MIT License**.

Third-party models, ComfyUI integrations and external custom nodes retain their respective licenses.

---

<p align="center">
  <strong>Author the camera. Then generate the shot.</strong>
</p>

<p align="center">
  Majoor OmniCam for ComfyUI
</p>
