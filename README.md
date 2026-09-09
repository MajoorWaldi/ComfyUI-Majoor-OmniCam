> [!WARNING]
> **Work in progress — expect breaking changes.**
> Majoor OmniCam is under active construction. Nodes, inputs, outputs and the
> saved motion format may change from one release to the next, and existing
> workflows can break after an update. Pin a version if you need stability, and
> check the [CHANGELOG](CHANGELOG.md) before upgrading.

<p align="center">
  <img src="web/assets/omnicam-icon.png" width="112" alt="Majoor OmniCam">
</p>

<h1 align="center">Majoor OmniCam</h1>

<p align="center">
  <strong>Author camera and object motion in ComfyUI, then compile it for whichever video model you are using.</strong>
</p>

<p align="center">
  <a href="https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam"><img src="https://img.shields.io/badge/GitHub-Repo-181717?logo=github" alt="GitHub repo"></a>
  <a href="https://registry.comfy.org/nodes/majoor-omnicam"><img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.comfy.org%2Fnodes%2Fmajoor-omnicam&query=%24.downloads&label=registry%20installs&color=0b7285" alt="Comfy Registry installs"></a>
  <a href="https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/releases"><img src="https://img.shields.io/github/downloads/MajoorWaldi/ComfyUI-Majoor-OmniCam/total?label=GitHub%20downloads&style=flat" alt="GitHub release downloads"></a>
  <a href="https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/stargazers"><img src="https://img.shields.io/github/stars/MajoorWaldi/ComfyUI-Majoor-OmniCam?style=flat" alt="GitHub stars"></a>
  <a href="https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/issues"><img src="https://img.shields.io/github/issues/MajoorWaldi/ComfyUI-Majoor-OmniCam?style=flat" alt="GitHub issues"></a>
</p>

<p align="center">
  <a href="https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/actions/workflows/test.yml"><img src="https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/actions/workflows/test.yml/badge.svg" alt="CI status"></a>
  <img src="https://img.shields.io/badge/ComfyUI-0.31%2B-blue" alt="ComfyUI 0.31 or newer">
  <img src="https://img.shields.io/badge/Python-3.10--3.13-blue" alt="Python 3.10 to 3.13">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/MajoorWaldi/ComfyUI-Majoor-OmniCam?style=flat" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Status-experimental-e0a253" alt="Experimental">
  <a href="https://ko-fi.com/majoorwaldi"><img src="https://img.shields.io/badge/Ko--fi-Buy_Me_a_White_Monster_Drink-ff5e5b?logo=ko-fi" alt="Support on Ko-fi"></a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/main/docs/assets/omnicam-cover.png" width="900" alt="Majoor OmniCam — camera control for generative video: Extract, Direct, Monitor">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/main/docs/assets/omnicam-demo.gif" width="760" alt="Authoring a camera move in the OmniCam Director viewport">
</p>

<p align="center"><em><a href="https://raw.githubusercontent.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/main/docs/assets/omnicam-preview.mp4">▶ Full walkthrough (MP4)</a></em></p>

Video models do not agree on how to be told about motion. One wants camera
extrinsics, another wants 2D trajectories, a third wants a reference video and a
prompt. OmniCam separates the two halves of that problem: you describe the motion
once, and a compiler translates it per model.

```text
Extractor ─┐
           ├─> OMNICAM_MOTION_SCENE ─> Monitor ─> camera embedding
Director ──┘        + playblast                   trajectory JSON / TRACKS
                                                  reference video + prompt
```

A **MotionScene** is the canonical model-independent authoring document:
cameras, objects, motion layers, cuts and an authoring timeline. Motion layers
and cuts use time-based scene semantics; camera and object tracks in v1 still
retain authoring-grid information (canvas size, authoring fps, duration) where
required, and compile to any model resolution or frame rate. It is what travels
between the nodes.

![The full OmniCam graph: Load Video, Extractor, Director, Monitor, Save Video](https://raw.githubusercontent.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/main/docs/assets/omnicam-overview.png)

## Install

Requires **ComfyUI 0.31+** and **Python 3.10–3.13**. After installing, restart
ComfyUI; the nodes appear in the node menu under **Majoor › OmniCam**.

### ComfyUI Manager (recommended)

Open **Manager -> Custom Nodes Manager**, search for **Majoor OmniCam**, and click
**Install**. This pulls the published
[Comfy Registry](https://registry.comfy.org/nodes/majoor-omnicam) release with
its prebuilt frontend bundle.

For normal users, **ComfyUI Manager is strongly recommended**. Use the source
checkout path only for development or when intentionally following `main`.

### Manual - source checkout (`git clone`)

A raw Git checkout contains the frontend **source**, not the generated Vite
bundle. Build it once after cloning:

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam.git
cd ComfyUI-Majoor-OmniCam

npm ci
npm run build
```

Then restart ComfyUI.

The generated runtime files are:

```text
web/omnicam.js
web-chunks/
```

They are intentionally not committed to Git. ComfyUI Manager / Registry
installations already receive these generated files inside the published
package and therefore do **not** need Node.js or a local frontend build.

There are no mandatory Python packages beyond OmniCam's declared ComfyUI
frontend compatibility dependency. Extractor solver backends and advanced
reconstruction providers remain optional; see the
[User Guide](docs/USER_GUIDE.md#install).

## The three nodes

> All three nodes are marked **experimental** in ComfyUI. Camera authoring and
> the playblast are stable in practice; the Monitor profile set and the Director
> Motion Tracks surface may still change before a stable release.

### OmniCam Director

The viewport opens in Perspective view with the Simple navigation profile and
mini-map enabled by default. It also supports Maya/Blender navigation profiles, selection-preserving
navigation gestures, display-scale-aware pan and normalized wheel zoom. Press
`F` to fit the entire selection in perspective or orthographic views, and
`Escape` to cancel a drag. See [controls and shortcuts](docs/SHORTCUTS.md).

![OmniCam Director](https://raw.githubusercontent.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/main/docs/assets/director-panel.png)

A small shot-layout tool in a live 3D viewport. Animate cameras and scene
references, draw motion layers over the frame, cut between cameras, and record a
neutral proxy playblast. This is where a MotionScene is authored:

- **3D Scene Primitives**: Instant creation of **Card** (media billboard), **Cube**, **Sphere**, **Cylinder**, **Torus**, **Null**, and an authentic **procedural low-poly Human mannequin** (faceted torso, limbs in relaxed A-pose, grounded at $y=0$ for realistic human scale cues).
- **Viewport HUD & Tool Rail Ergonomics**: On-screen Camera HUD (Lens mm, FOV, target distance, Camera Lock `🔒`, roll leveler `⮑`), readable 1-click World/Local coordinate space toggle (`W`/`L`) and Snapping (`OFF`/`GRID`) on the tool rail, quick-toggle overlay cluster, and fullscreen floating transport.
- **Graph Editor & Animation Curves**: 12 easing interpolation modes (`ease`, `smooth`, `bezier`, `linear`, `ease_in`, `ease_out`, `hold`, `sine`, `cubic`, `quintic`, `expo`, `back`) and 6 Bézier tangent modes (`auto`, `clamped`, `vector`, `free`, `aligned`, `flat`) with dynamic aspect-ratio canvas scaling.
- **Dynamic Layout Splitters**: Drag-resizable Outliner list, Camera Previews column, Right Inspector / Side Panel, and Graph Editor — all persistent in saved workflows and fully keyboard-operable (`role="separator"`).
- **Interactive Camera Authoring**: Freehand **Draw Camera Path** in Top View with automatic keyframe timing, Follow Path orientation, Look At targets, and editable 3D spatial Bézier control handles.
- **Inspector & Quick Controls**: Axis scrubbing, vector reset buttons (`⟲`), lens presets (`14mm`–`135mm`, including `18mm`), and Camera Health analysis.
- **Unified Asset Library & Characters**: a **SCENE / ASSETS** left panel with a filtered thumbnail grid over one semantic catalog (characters, props, environments, vehicles). Double-click to instantiate. Rigged characters map any Mixamo / generic-GLTF rig to `OMNICAM_HUMANOID_V1`, with an FK **Pose editor** (canonical-joint overlay + X/Y/Z rotation + source-independent presets) and **Motion clips** (timeline-driven, speed / loop / range, *Bake current frame to pose*). Objects carry semantic **tags** and visible viewport **Labels** (`Off / Selected / All`). A fresh install ships no heavy models; run `python scripts/bootstrap_asset_library.py --preset starter --download` once for a ~30–45 GLB CC0 starter set (Kenney only, licence-gated, nothing vendored in Git). See [Asset Library](docs/ASSET_LIBRARY.md) and [Characters](docs/CHARACTERS.md).

### OmniCam Extractor

![OmniCam Extractor](https://raw.githubusercontent.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/main/docs/assets/extractor-panel.png)

Two extraction modes:
- **Camera Track**: Recover a relative 6DoF camera track from one continuous reference shot and hand it on as a solved MotionScene. Connect it to the Director's `solved_scene` input to keep editing the recovered move, or take it straight to Monitor.
- **Scene Reconstruct**: Turn a still image or a scan into an editable 3D blocking scene, adopted directly into Director with lock controls, confidence badges, and neutral/textured playblast rendering.
  - **Depth Mesh**: visible-surface MoGe reference proxy.
  - **Blockout**: MoGe + native ComfyUI SAM3.1 → closed, editable MotionScene primitives + an oriented room shell (no holes on a 90° orbit).
  - **Hybrid**: blockout primitives plus an independently toggleable dense reference.
  - **Scan**: VGGT multi-view / video scene blocking with a single camera trajectory and cross-view object fusion.
  - Optional SAM 3D Objects completion refines weak hidden dimensions (Linux + ≥ 32 GB VRAM; absence does not affect the other modes).
  - Optional **asset library**: swap each fitted box for a real CC0 GLB prop (interior / exterior furniture + posed humans). Populate once with `python scripts/fetch_blockout_library.py --download` (23 CC0 Kenney props, ~0.5 MB); see [docs/BLOCKOUT_ASSET_LIBRARY.md](docs/BLOCKOUT_ASSET_LIBRARY.md).

Solves and reconstructions run interactively outside the prompt queue without loading diffusion models or executing the workflow. Preview uses native browser video first and falls back to server-decoded frames when a container will not decode in the browser.

### OmniCam Monitor

![OmniCam Monitor](https://raw.githubusercontent.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/main/docs/assets/monitor-panel.png)

The model compiler. Pick a target profile; Monitor resolves the timeline,
compiles the MotionScene into that model's representation, and runs a preflight
that reports what will and will not survive the translation.

Preflight is binding, not decorative: for every named model profile, a downstream
node that is missing or whose socket contract has changed blocks the run rather
than producing a payload with nowhere to go. `external_reference_video` is the
one exception, by design -- see below.

## Profiles

| Profile | Semantic | Monitor output | Connect to |
|---|---|---|---|
| `external_reference_video` | `reference_video` | `reference_video` + `final_prompt` | any destination model's own reference-video input |
| `wan_camera_native` | `camera_embedding` | `camera_embedding` | `WanCameraImageToVideo.camera_conditions` |
| `wan_move_native` | `screen_tracks` | `native_tracks` | `WanMoveTrackToVideo.tracks` |
| `wan_track_native` | `screen_tracks` | `tracks_json` | `WanTrackToVideo.tracks` |
| `wanvideo_ati` | `screen_tracks` | `tracks_json` | `WanVideoATITracks.tracks` |
| `ltx25_motion_track` | `screen_tracks` | `tracks_json` | `LTXVDrawTracks.tracks` |
| `h3_native` | `reference_video` | `reference_frames` + `final_prompt` | `MiniMaxH3ReferenceToVideo.ref_videos` |
| `h3_api` | `reference_video` | `reference_video` + `final_prompt` | `MinimaxHailuo03ReferenceNode.reference_video` |

`external_reference_video` is the Monitor default and the odd one out: it names
no upstream node, imposes no frame grid or fps conversion, and never blocks on
a missing or unrecognized downstream. Use it for a model OmniCam has no named
profile for. Every other profile is strict on purpose -- it encodes one real
model's contract, and a payload that contract cannot satisfy is a bug worth
stopping the queue for.

Switching profile never changes the MotionScene. It does change which Monitor output carries the result, so connect the output this table lists for the profile you selected.

## Start here

1. Add **OmniCam Director** and compose a shot. Press `I` at each pose to key it.
2. Connect `motion_scene` and `playblast_video` to **OmniCam Monitor**.
3. Choose the profile your downstream model needs, and queue.
4. Read the preflight, then connect the output named in the table above.

To start from footage instead, put **OmniCam Extractor** in front and wire its
`motion_scene` output to the Director's `solved_scene` input. To start from a still image, use Extractor in Scene Reconstruct mode to create a 3D proxy environment and open it in Director.

Complete runnable graphs are in [`examples/workflows/`](examples/workflows):
each is the official Comfy-Org template for that model with its motion source
replaced by OmniCam, so every model, LoRA and sampler setting is upstream's.
Direct MiniMax starter: [`07_minimax_h3_native_global_example.json`](examples/workflows/07_minimax_h3_native_global_example.json).

## What OmniCam will refuse to do

These are preflight results, not bugs:

- **A multi-shot edit on a single-camera profile is blocked.** One camera
  embedding, or one projection basis, cannot describe an edit that cuts to a
  second camera. Reference-video profiles accept it — the playblast carries the
  cuts — and drop the single-camera prompt in favour of a neutral one.
- **Trajectories the JSON track formats cannot carry are reported.** A layer
  hidden on the first sample cannot be expressed and is dropped; one that
  disappears and returns is cut at the gap. Monitor names the affected layers
  instead of quietly encoding less than you authored.
- **A missing or changed downstream node blocks the run**, per profile, so a
  missing LTX install never blocks a Wan Camera compile.

## Documentation

- [Node Guide](docs/NODES.md) — inputs, outputs, profiles and workflow contracts.
- [User Guide](docs/USER_GUIDE.md) — authoring, playblasts, extraction, installation.
- [In-app help](web-src/help/defs.js) — contextual help from each node.
- [Shortcuts](docs/SHORTCUTS.md) — viewport, timeline and editing controls.
- [Asset Library](docs/ASSET_LIBRARY.md) — the unified catalog, routes, Semantic API, limits.
- [Characters](docs/CHARACTERS.md) — `OMNICAM_HUMANOID_V1`, Rig Mapper, FK poses, motion clips.
- [Technical Reference](docs/TECHNICAL_REFERENCE.md) — runtime behaviour, DPVO, validation, development.
- [Security](docs/SECURITY.md) — managed files, upload limits, request boundaries.

## License

MIT. See [LICENSE](LICENSE).
