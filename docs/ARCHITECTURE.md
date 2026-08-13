# Architecture

## System boundary

```text
Comfy frontend
  Director DOM UI + bundled Three.js viewport + timeline
              │ state_json / managed uploads / native previews
              ▼
Comfy Python backend
  Director → MAJOOR_OMNICAM_TRACK v1 + VIDEO + LOAD3D_CAMERA + JSON
              │
              ├─ H3 proxy adapter
              ├─ native Wan / ATI adapters
              ├─ LTX bridge and guide
              ├─ Blender / Unreal exporters
              ├─ camera tools
              └─ MAJOOR_OMNICAM_SEQUENCE v1
```

The camera track is the source of truth. Model-specific prompts, tensors, LoRA names and third-party payloads never enter the viewport engine or track schema.

## Modules

```text
omnicam/
├─ extension.py                 V3 extension entrypoint
├─ nodes.py                     15 node schemas and execution boundaries
├─ routes.py                    managed card/GLB/playblast uploads
├─ core/
│  ├─ track.py                  schema, normalization, interpolation
│  ├─ projection.py             pure camera projection
│  ├─ camera_tools.py           pure presets/constraints/smoothing
│  └─ sequence.py               sequence schema and manifests
└─ adapters/
   ├─ h3.py                     proxy/prompt policy
   ├─ wan.py                    native camera convention conversion
   ├─ ati.py                    generic projected trajectories
   ├─ wanvideo_wrapper/v2026_08.py  pinned exact ATI contract
   ├─ ltx.py                    neutral bridge and current control profile
   ├─ blender.py
   └─ unreal.py

web-src/viewport.js             Three.js renderer source
web/omnicam-webgl.js            committed production bundle
web/omnicam.js                  Comfy extension, UI, timeline and capture
```

`omnicam/core` has no ComfyUI import and is unit-testable in isolation. Comfy types and tensor conversion remain at the node boundary.

## Frontend and serialization

`app.registerExtension` attaches the UI only to `MajoorOmniCamDirector`. The full authoring state is stored in the normal `state_json` widget, so workflows retain camera keys, objects, media references, proxy settings and UI choices. The backend reparses and normalizes the state before execution.

The WebGL implementation uses pinned Three.js bundled locally. It loads managed GLB proxies and applies serialized position, Euler rotation and scale. Canvas2D remains a graceful fallback and receives the final GPU frame plus guides/burn-in, allowing the same canvas to be encoded. Object URLs, listeners, observers, timers, video playback, GLB resources and GPU resources have explicit disposal.

Optional upstream `IMAGE`/`VIDEO` data is previewed through the supported Comfy execution UI payload and same-origin view URL. Up to 32 returned items are selectable; only the selected index and managed asset references are serialized, never arbitrary filesystem access.

The Director DOM widget implements the current `addDOMWidget` height callbacks and restores `state_json` from graph lifecycle hooks. Its interaction boundary follows core Load3D: focusable Director/viewport containers own pointer, wheel and keyboard input, and handled events stop before the global LiteGraph canvas/window keybinding service. Keyboard filtering mirrors the official frontend's target-based policy for inputs, selects, textareas and content-editable elements. Pointer coordinates come from live viewport or timeline client rectangles, including when the graph is zoomed. This keeps the same node implementation working in legacy LiteGraph rendering and frontend 1.48.7 Nodes 2.0.

Timeline selection is UI state; canonical keyframes remain the serialized source of truth. The editor enforces integer frames, one key per frame and the existing interpolation enum. Clicking a key loads it, dragging changes only its frame, and the selected-key inspector edits the complete camera snapshot without changing schema v1.

The Director may retain several named camera tracks in its private serialized UI state. `active_camera_id` owns timeline editing; `playblast_camera_id` owns the highlighted multiview monitor and export. Before execution, the frontend mirrors the selected playblast camera into the top-level schema-v1 `camera` and `keyframes` fields, so the model-agnostic `MAJOOR_OMNICAM_TRACK` contract and every existing adapter remain unchanged. Legacy workflows without `cameras` migrate to a single `Camera 1`.

The compact control layout follows the public Load3D + Animation structure: category menus above the viewport, icon-only transport/key commands in the timeline, and collapsible inspectors below it. PrimeIcons come from the host frontend stylesheet, so OmniCam adds no icon dependency. Yellow denotes selection; red denotes the active edited key. Camera navigation commits directly to that active canonical key rather than requiring a second insert action.

## Playblast

```text
authoring canvas → exact timeline frames → WebCodecs → local WebM muxer
  → realtime MediaRecorder only when WebCodecs is unavailable or explicitly selected
  → POST /majoor/omnicam/upload_playblast
  → input/omnicam/playblasts
  → InputImpl.VideoFromFile → VIDEO
```

Capture performs no diffusion execution. Deterministic timestamps are derived from frame index and FPS rather than wall-clock delays. File routes enforce allowlists, limits and managed-directory containment.

## Adapter contracts

- H3 consumes a visual proxy and a prompt that separates motion from appearance.
- Native Wan consumes a core Plücker camera embedding created from the canonical track.
- ATI consumes projected stable points; the versioned module owns the exact third-party string format.
- LTX retains a neutral camera payload but uses proxy frames for the currently exposed IC-LoRA guide path.
- Blender and Unreal scripts reconstruct native cameras and include a generated round-trip exporter.

No adapter becomes a second camera source of truth.

## Sequence

`MAJOOR_OMNICAM_SEQUENCE` v1 composes complete V1 tracks as ordered shots with cut positions, handles, references and adapter settings. It deliberately does not add cuts or per-model fields to the camera-track schema.
