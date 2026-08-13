# Roadmap

Status date: 13 August 2026. Checked items are implemented in this repository. Items labelled **external QA** require a model, DCC, operating system, or publishing account not available in the local validation environment.

## Phase 0 — Repository foundation ✅

- [x] V3 `ComfyExtension` entrypoint and 15 schema-based nodes.
- [x] Canonical camera-track schema v1, version validation, interpolation and projection tests.
- [x] Managed upload routes with extension, size, filename, and containment validation.
- [x] Model-agnostic core and isolated H3/Wan/LTX/DCC adapters.
- [x] Python/frontend CI and package verification.

## Phase 1 — Functional authoring tool

- [x] Orbit, pan, dolly, scoped WASD/QE, frame subject, speed, reset, perspective/orthographic.
- [x] Compact Load3D-style menus, PrimeIcon timeline transport, yellow selection/red edit states, automatic active-key recording, navigation, insert/replace/delete/drag/copy/paste and complete key camera inspector.
- [x] Subject card, multiple media cards, cube, sphere, human, null, floor grid and point field.
- [x] Object inspector, visibility and basic transform fields.
- [x] Browser capture, managed upload, Comfy `VIDEO`, H.264/MP4 capability path and WebM fallback.
- [x] Burn-in, safe composition guides and model proxy presets.
- [ ] Curve/graph editor.
- [x] Selected-object axis display and interactive screen-plane translate handle.
- [x] Axis-constrained translate/rotate/scale gizmos in world/local space.
- [x] Deterministic frame-stepped WebCodecs encoder with realtime fallback.
- [ ] **External QA:** complete live workflow save/reload/playblast acceptance pass.

## Phase 2 — Production WebGL viewport

- [x] `web-src/` and Vite build.
- [x] Three.js `0.180.0` pinned and bundled locally; no CDN.
- [x] GPU grid, point field, cards, video textures, primitives and orthographic/perspective cameras.
- [x] Catmull-Rom camera-path visualization and key markers.
- [x] Thirds/center guides, depth sorting and perspective card mapping.
- [x] Timeline-synchronized video cards.
- [x] Automated render and GPU/resource-disposal browser test.
- [x] Managed GLB/OBJ/FBX/STL/PLY scene import and bundled Three.js loading.
- [x] Safe one-shot key editing, Auto Key, and viewport edit-state borders.
- [x] Parallel `VIDEO` and decoded `IMAGE` proxy outputs.
- [x] Clean playblast frames with guides, paths and gizmos suppressed, plus an independent optional capture grid.
- [x] Selectable and transformable Ground scene object.
- [x] Per-object transform animation and Position/Rotation/Scale curve editing.
- [x] Geometry raycast selection and Blender-style viewport T/R/S manipulation.
- [x] Original texture, checker, neutral and wireframe object inspection modes.
- [x] Independent Perspective/orthographic Editor View and separately docked multi-camera preview strip.
- [x] Full-size scene Editor View, extended layout grid and compact multi-camera monitor strip with explicit playblast-camera selection.
- [x] Timeline-sampled FBX/GLB animation clips and animation-only skeleton previews.
- [x] In-viewport scene/transform HUD with object picking and `T`/`R`/`S` shortcuts.
- [x] Editable Position/Target/Lens curve editor with interpolation presets.
- [x] Live Duration/FPS synchronization across timeline rulers, keys and curves.
- [x] Keyframe camera-frustum visualization.
- [x] TransformControls-style translate/rotate/scale gizmos.
- [ ] **External QA:** sustained 60 fps measurement at a 720p viewport on representative hardware.

## Phase 3 — Native Comfy media integration

- [x] Optional `IMAGE` and `VIDEO` inputs.
- [x] Supported preview URLs through the Comfy frontend API and refresh on upstream execution.
- [x] Fit, fill and stretch card modes.
- [x] Multi-item upstream reference selector (up to 32 execution previews).
- [ ] **External QA:** live `Load Image → Director` acceptance pass in the full frontend.

## Phase 4 — MiniMax H3 adapter

- [x] Proxy video pass-through and motion-only prompt fragment.
- [x] Current core `MinimaxHailuo03ReferenceNode` detection and one-click setup.
- [x] Balanced, parallax, subject and debug proxy presets.
- [x] Orbit/dolly/crane/handheld-aware prompt templates.
- [x] Reproducible benchmark matrix documented in `H3_BENCHMARK.md`.
- [ ] **External QA:** execute paid H3 grid/card/point/graybox transfer benchmark and record scores.

## Phase 5 — Wan native camera and ATI

- [x] Arbitrary OmniCam track → core 23-value camera rows → native `WAN_CAMERA_EMBEDDING`.
- [x] OmniCam Y-up look-at → Wan +Z-forward camera conversion, including roll and vertical-camera guard.
- [x] Generic 3D reference-point projection with arbitrary pan/orbit/crane paths.
- [x] WanVideoWrapper commit `088128b224242e110d3906c6750e9a3a348a659b` pinned.
- [x] Exact `WanVideoATITracks.tracks` JSON bridge with 121 samples.
- [x] ATI trajectory overlay preview and contract regression tests.
- [ ] **External QA:** generate representative orbit/dolly/crane clips with native Wan conditioning.
- [ ] **External QA:** execute a pinned WanVideoWrapper ATI workflow without the manual trajectory editor.

## Phase 6 — LTX camera control

- [x] Version-neutral per-frame intrinsics/extrinsics and temporal resampling.
- [x] ComfyUI-LTXVideo commit `ac4d99839020b983e956a8ab67ec38aec1b6e65a` pinned.
- [x] Current supported path: proxy `VIDEO` decoded to `IMAGE` guide frames for `LTXVAddVideoICLoRAGuide`.
- [x] Motion classification and recommendation for the installed camera-control LoRA names.
- [x] Direct arbitrary-extrinsics conditioning intentionally not fabricated: the inspected integration exposes no such public socket.
- [ ] **External QA:** generate and compare representative IC-LoRA camera-controlled clips.

## Phase 7 — DCC interoperability

- [x] Blender camera, lens/FOV, orthographic zoom, roll, timing, interpolation, world scale and proxy reconstruction.
- [x] Blender-generated `export_omnicam(path)` round trip.
- [x] Unreal 5.3–5.6 CineCamera and Level Sequence script with transform/lens keys.
- [x] Unreal-generated `export_sequence(path)` round trip.
- [ ] **External QA:** execute round trips inside supported Blender releases.
- [ ] **External QA:** execute round trips inside Unreal 5.3, 5.4, 5.5 and 5.6.

## Phase 8 — Camera tools

- [x] Dolly, orbit, crane, truck, pedestal, pan, tilt and sampled 360° product-orbit presets.
- [x] Deterministic shake, look-at, follow target, arc/auto-orbit, dolly zoom and FOV animation.
- [x] Path smoothing and motion-speed profile output.
- [x] Toggleable viewport motion-speed heatmap visualization and numeric profile output.

## Phase 9 — Multi-shot sequence

- [x] Versioned `MAJOOR_OMNICAM_SEQUENCE` format.
- [x] Ordered shots/cuts, names, handles, per-shot adapter settings and reference assignment.
- [x] Shot extraction node and playblast manifest.
- [ ] One-click batch playblast recording/export in the browser.

## Phase 10 — Release quality

- [x] Python unit tests, package verification and browser automated test.
- [x] Bundled frontend build, exact dependency lock, zero npm audit findings at validation time.
- [x] Icon/banner, embedded help, compatibility matrix, security review and release procedure.
- [x] Nodes 2.0 live automation covers DOM mounting, interactions and workflow-state restoration.
- [x] Semantic version synchronized at `0.3.0`.
- [ ] Windows portable live UI QA.
- [ ] ComfyUI Desktop Windows live UI QA.
- [ ] macOS Desktop QA.
- [ ] Linux manual-install QA.
- [ ] Registry publisher ID and publication (requires project owner account).

## Release gate

The implementation phases are integrated. Nodes 2.0 lifecycle and in-memory serialize/reconfigure restoration are automated; a public production claim remains gated on user-driven workflow-file/playblast acceptance, paid model benchmarks, DCC execution, cross-platform validation, and Registry publisher metadata.
