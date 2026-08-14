# ComfyUI-Majoor-OmniCam

Majoor OmniCam 0.3.0 is a model-agnostic camera-layout tool embedded in ComfyUI. It authors a versioned camera track, records a neutral proxy playblast, and exposes isolated adapters for MiniMax H3, native Wan camera conditioning, WanVideoWrapper ATI, LTX, Blender, and Unreal.

## Included

- Bundled Three.js/WebGL viewport with Canvas fallback; no CDN or runtime network request.
- Orbit, pan, dolly, scoped WASD/QE fly controls, perspective/orthographic cameras, FOV and roll.
- Load3D-style compact `Scene`, `Camera`, `Show` and `Output` menus plus a graduated timeline with PrimeIcon playback/key controls, playhead, visible keys, retiming and a complete camera-key inspector.
- Native tooltips and zone-aware right-click menus for the viewport, scene objects, cameras, timeline keys, curve editor and camera previews. These expose create, rename, duplicate, show/hide, delete, set-key, interpolation, primary-camera and per-preview playblast actions.
- Multi-camera preview strip with an explicit primary/playblast camera, per-preview recording, camera creation/duplication/renaming/deletion, and visible Bézier tangent handles in the curve editor.
- Image/video cards from optional upstream Comfy inputs or local managed uploads, a multi-item upstream selector, managed GLB/OBJ/FBX/STL/PLY scenes, fit/fill/stretch, primitives, inspector, guides, proxy presets, and burn-in.
- World/local axis-constrained translate, rotate and scale gizmos whose transforms survive workflow reload.
- Deterministic frame-stepped WebCodecs/WebM playblast encoding with a realtime MediaRecorder fallback, stored below `ComfyUI/input/omnicam/playblasts/`.
- Canonical `MAJOOR_OMNICAM_TRACK` schema v1 and `MAJOOR_OMNICAM_SEQUENCE` schema v1.
- H3 camera-motion prompt profiles and optional one-click setup for the current core H3 node.
- Native `WAN_CAMERA_EMBEDDING`, generic projected ATI trajectories, exact pinned `WanVideoATITracks` JSON, and trajectory preview.
- Version-neutral LTX intrinsics/extrinsics plus the supported current IC-LoRA proxy-frame path and camera-LoRA recommendation.
- Blender and Unreal 5.3–5.6 scripts, camera tools, shot sequence tools, tests, CI, and release documentation.

The extension registers 15 V3 nodes under `Majoor / OmniCam`.

## Installation

Place the repository at:

```text
ComfyUI/custom_nodes/ComfyUI-Majoor-OmniCam/
```

Restart ComfyUI and hard-refresh the browser. The production frontend bundle is committed, so end users do not need Node.js or pip dependencies beyond the current ComfyUI installation.

Frontend development only:

```text
npm ci
npm run build
npm run check
npm run test:browser
```

## First H3 shot

1. Add **Majoor OmniCam Director** and optionally connect an upstream `IMAGE` or `VIDEO`.
2. Compose the first frame, press `I`, move to another frame, move the camera, and press `I` again.
3. Select an H3 proxy preset, enable burn-in only for diagnostics, then click **Playblast**.
4. Queue the workflow to obtain `proxy_video`, decoded `proxy_frames`, and `camera_track`.
5. Connect them to **OmniCam → MiniMax H3 Omni Reference**, or use **H3 Setup** in the viewport when the current core H3 node is installed.
6. Use the generated prompt fragment and camera reference video. The prompt explicitly asks H3 to copy camera motion, not proxy appearance.

## Viewport controls

| Control | Action |
|---|---|
| Left drag | Orbit around target |
| Shift + drag | Pan |
| Mouse wheel | Dolly |
| W / A / S / D | Translate camera rig |
| Q / E | Down / up |
| Shift + WASD/QE | Faster movement |
| I | Insert or replace keyframe |
| Space | Play or stop |
| F | Frame subject target |
| Left / Right | Step one frame |
| , / . | Previous / next keyframe |
| Delete / Backspace | Delete selected keyframe |
| Ctrl/Cmd + C / V | Copy selected keyframe / paste at playhead |
| Right click | Open the contextual menu for the viewport, object, camera, key, curve, or camera preview under the pointer |

Keyboard shortcuts act only when focus is inside OmniCam. They stop before ComfyUI's global graph handler and remain inactive while the user edits an input, select or content-editable field.

Camera preview behavior: click a preview to make it the primary playblast output, double-click to edit that camera, or right-click to edit, rename, duplicate, delete, set a key, make primary, or record that preview. The curve editor displays Bézier tangent handles for a selected Bézier key; the **Handles** control and curve context menu toggle them.

A selected key is yellow and becomes red only during its next camera edit. At the end of that viewport interaction it is disarmed and returns to blue, preventing later moves from rewriting it. Enable **Auto Key** to create or replace the key at the playhead on every camera edit; the viewport border is red while editing and orange while Auto Key is enabled.

## Architecture

```text
Viewport / Timeline
        ↓
MAJOOR_OMNICAM_TRACK v1
        ├─ proxy VIDEO → MiniMax H3 / LTX IC-LoRA guide
        ├─ native Plücker embedding → Wan
        ├─ projected trajectories → ATI / WanVideoWrapper
        ├─ Blender / Unreal exports
        └─ MAJOOR_OMNICAM_SEQUENCE v1
```

Model-specific formats stay inside adapters; the viewport and canonical track contain no model inference logic.

## Verified baseline and remaining external QA

Locally verified on 13 August 2026:

- 15 Python tests, Ruff, package validation, byte compilation, frontend build and syntax checks.
- Browser WebGL, GLB loading and WebCodecs encoding tests in headless Microsoft Edge.
- Live ComfyUI frontend 1.48.7 test for Nodes 2.0 mounting, scoped viewport/timeline input, key selection/retiming/editing shortcuts, gizmos, multi-reference selection, serialization/reconfiguration and renderer-mode switching.
- Import and schema construction of all 15 nodes in the installed ComfyUI v0.32.0 embedded Python runtime.
- Exact source contracts inspected for core Wan, core MiniMax H3, WanVideoWrapper commit `088128b224242e110d3906c6750e9a3a348a659b`, and ComfyUI-LTXVideo commit `ac4d99839020b983e956a8ab67ec38aec1b6e65a`.

Still requiring the corresponding external environment: paid H3 transfer benchmarks, generated-video evaluation with Wan/LTX models, execution of export scripts inside Blender/Unreal, full live ComfyUI workflow UI QA, macOS/Linux/Desktop matrices, and Registry publishing. See [the roadmap](docs/ROADMAP.md), [compatibility matrix](docs/COMPATIBILITY.md), and [validation report](docs/VALIDATION_REPORT.md).

## Documentation

- [Guide complet des 15 nœuds](docs/NODES.md)
- [Product and architecture](docs/MASTER_SPEC.md)
- [Roadmap](docs/ROADMAP.md)
- [Full audit implementation checklist](docs/ROADMAP_FULL_AUDIT.md)
- [Integrations](docs/INTEGRATIONS.md)
- [Development](docs/DEVELOPMENT.md)
- [Manual QA](docs/MANUAL_QA.md)
- [Security](docs/SECURITY.md)
- [Release process](docs/RELEASE.md)

## License

MIT for this repository. Models and downstream node packs retain their own licenses.
