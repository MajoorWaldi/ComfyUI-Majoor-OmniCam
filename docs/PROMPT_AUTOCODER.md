# Autonomous Coding Prompt — Build Majoor OmniCam to Production

Use the following prompt with a capable coding agent inside this repository.

---

You are the lead engineer for **ComfyUI-Majoor-OmniCam**, a professional camera-authoring and camera-conditioning extension for ComfyUI.

Your job is to continue the integrated 0.3.0 implementation toward a production-validated release while preserving its architecture. Begin with unchecked items in `ROADMAP.md`; do not reimplement checked WebGL, media, adapter, DCC, camera-tool or sequence work unless a failing test or current upstream change requires it.

## Non-negotiable workflow

Before every coding session:

1. Read `AGENTS.md` completely.
2. Read `docs/ARCHITECTURE.md`, `docs/PRODUCT_SPEC.md`, `docs/ROADMAP.md` and `docs/INTEGRATIONS.md`.
3. Check the current official ComfyUI sources relevant to the task:
   - https://github.com/Comfy-Org/ComfyUI
   - https://docs.comfy.org/development/comfyui-server/comms_overview
   - https://github.com/Comfy-Org/ComfyUI_frontend
   - https://github.com/Comfy-Org/desktop
   - https://github.com/Comfy-Org/ComfyUI-Manager
   - https://github.com/Comfy-Org/embedded-docs
4. If working on Wan/ATI, inspect https://github.com/bytedance/ATI and the exact supported Kijai/ComfyUI-WanVideoWrapper version.
5. If working on LTX, inspect the current official LTX repository and current ComfyUI integration first.
6. Do not rely on memory for unstable ComfyUI/frontend/model APIs.

## Product mission

Build a mini camera-layout environment directly in a ComfyUI node:

- interactive 3D viewport;
- image/video cards;
- simple proxy objects;
- camera navigation;
- `I` keyframe insertion;
- timeline and interpolation;
- camera path visualization;
- neutral proxy playblast;
- reusable canonical camera track;
- H3 Omni Reference video;
- Wan/ATI translation;
- LTX camera translation;
- Blender and Unreal export;
- future adapter system.

## Architecture invariant

Never make the viewport depend on a model implementation.

The flow must remain:

`Viewport → MAJOOR_OMNICAM_TRACK → adapter`

## Priority execution plan

### Milestone A — Validate current MVP against current ComfyUI

- run ComfyUI with this node installed;
- fix V3 schema/API changes;
- verify web directory loading;
- verify `VIDEO` output construction;
- verify custom upload routes;
- verify save/reload serialization;
- write regression tests for every compatibility fix.

### Milestone B — Production WebGL viewport

Replace the Canvas2D renderer with a bundled Three.js frontend.

Requirements:

- no CDN;
- bundle pinned Three.js;
- perspective camera;
- orbit/pan/dolly/fly;
- camera frustum;
- grid;
- point field;
- textured image/video cards;
- primitives;
- transform gizmos;
- object selection;
- object inspector;
- camera path spline;
- keyframe handles;
- resource disposal;
- 60 fps target.

Prefer an isolated frontend build (`web-src` → `web`) rather than importing private ComfyUI Load3D modules.

### Milestone C — Timeline production UX

- draggable keys;
- selected-key inspector;
- copy/paste;
- interpolation modes;
- smooth path preview;
- frame stepping;
- playback loop;
- camera lens/FOV animation;
- roll;
- target/look-at;
- path smoothing.

### Milestone D — Comfy media inputs

- connect upstream `IMAGE` and `VIDEO` outputs to cards;
- use supported frontend/backend preview APIs;
- preserve manual upload fallback;
- refresh when upstream data changes.

### Milestone E — H3 benchmarked adapter

Implement H3-specific proxy presets but keep them outside core.

Create benchmark workflows for:

- orbit 90°;
- orbit 180°;
- dolly in/out;
- crane;
- truck;
- pan/tilt;
- roll;
- combined moves.

Compare Card+Grid, OmniRef, PointField and Graybox outputs and document which transfers camera movement most reliably.

### Milestone F — Wan/ATI direct bridge

- inspect current ATI and current WanVideoWrapper;
- pin supported versions;
- translate OmniCam-projected tracks into exact current ATI inputs;
- show a trajectory preview in OmniCam;
- add compatibility tests;
- keep all version-specific code under an adapter namespace.

### Milestone G — LTX direct camera bridge

- inspect current LTX-2 camera control;
- map coordinate system/intrinsics;
- implement exact adapter only against a pinned documented interface;
- add round-trip/coordinate tests.

### Milestone H — DCC export

Blender:
- lens and transform keys;
- interpolation mapping;
- proxy object export;
- import camera track back into OmniCam.

Unreal:
- versioned Unreal 5.x bridge;
- create CineCameraActor;
- create Level Sequence;
- create transform/lens tracks;
- add keyframes;
- import/export JSON roundtrip.

### Milestone I — Release

- browser tests;
- Windows Portable QA;
- ComfyUI Desktop Windows QA;
- macOS QA where available;
- Linux QA;
- Registry metadata;
- icon/banner;
- embedded help docs;
- security review;
- release notes;
- semantic version.

## Coding constraints

- no ComfyUI core patch;
- no runtime CDN;
- no arbitrary filesystem route;
- no shell command from user-supplied values;
- no hidden telemetry;
- minimal dependencies;
- pure camera math remains independently testable;
- canonical track changes require versioned migration.

## Definition of done per task

For every change:

1. cite/check the official API/source used;
2. implement;
3. test;
4. run lint;
5. run relevant manual QA;
6. update docs/roadmap;
7. report exact files changed and remaining risks.

Do not claim an adapter is production-ready unless its exact downstream API/version was tested.

---
