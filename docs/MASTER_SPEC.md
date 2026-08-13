# Majoor OmniCam — Master Specification

**Repository:** `ComfyUI-Majoor-OmniCam`  
**Product name:** Majoor OmniCam  
**Initial architecture baseline:** ComfyUI v0.32.0 / 13 August 2026  
**Purpose:** author a reusable virtual-camera move inside ComfyUI, turn it into a neutral proxy/playblast, and adapt the same canonical camera track to video-generation models and DCCs.

**0.3.0 implementation note:** the specification below preserves the original product requirements and staged design language. The current implementation includes the bundled WebGL viewport, Nodes 2.0 lifecycle support, axis transform gizmos, GLB proxies, deterministic WebCodecs playblasts, multi-item upstream media previews, pinned adapters, DCC round trips, camera tools, and `MAJOOR_OMNICAM_SEQUENCE` V1. `ROADMAP.md` is authoritative for checked status and external QA gates.

---

## 1. Product vision

Majoor OmniCam is a small shot-layout / camera-directing environment embedded in a ComfyUI node.

The user should be able to:

1. open an interactive viewport;
2. place a subject reference card or simple proxy geometry in a scene;
3. navigate the camera as in a lightweight DCC;
4. press `I` to insert camera keyframes;
5. scrub and play a timeline;
6. preview the camera path;
7. render a simple camera-readable proxy clip;
8. output both the proxy `VIDEO` and a versioned canonical `MAJOOR_OMNICAM_TRACK`;
9. reuse that track for H3 Omni Reference, Wan/ATI, LTX camera conditioning, Blender, Unreal and future models.

The product is deliberately not a miniature Blender. Its job is **shot layout and camera motion authoring**, with enough spatial cues to communicate perspective, parallax, velocity and framing to downstream video models.

---

## 2. Core product invariant

```text
Viewport / Timeline
        │
        ▼
MAJOOR_OMNICAM_TRACK
        │
        ├── Proxy Renderer ──► VIDEO ──► MiniMax H3 Omni Reference
        ├── ATI Bridge ────────────────► Wan / ATI
        ├── LTX Bridge ────────────────► LTX camera conditioning
        ├── Blender Export
        ├── Unreal Export
        └── Future model adapters
```

The **canonical camera track is the source of truth**. Model-specific semantics must stay in adapters.

---

## 3. User experience

### Viewport navigation

| Input | Action |
|---|---|
| Left drag | Orbit around target |
| Shift + drag | Pan |
| Wheel | Dolly |
| W / A / S / D | Fly camera |
| Q / E | Down / up |
| Shift + movement | Faster move |
| F | Frame subject |
| I | Insert/replace camera keyframe |
| Space | Play/stop timeline |

### Timeline

Baseline controls:

- current frame;
- frame scrubber;
- visible camera keys;
- insert/delete key;
- FOV;
- roll;
- interpolation;
- play/stop.

Production target adds:

- draggable keys;
- copy/paste;
- spline/graph editor;
- camera path handles;
- per-segment easing;
- procedural shake layers.

---

## 4. Scene/reference objects

### Media cards

A media card is a plane representing an `IMAGE` or `VIDEO` subject/reference in 3D space.

Required eventual behavior:

- preserve source aspect ratio;
- fit/fill/crop modes;
- billboard or free rotation;
- transform gizmos;
- timeline-synchronized video playback;
- direct upstream ComfyUI image/video connection.

The current Director supports managed uploads, multiple cards, and optional upstream ComfyUI `IMAGE`/`VIDEO` previews.

### Proxy primitives

Baseline:

- cube;
- sphere;
- human proxy;
- null/target;
- floor grid;
- sparse 3D point field.

Additional production cues:

- managed GLB scene proxies are implemented;
- depth poles;
- frustums;
- measurement markers;
- safe-frame guides.

---

## 5. Proxy render modes

Proxy output is a **conditioning signal**, not a beauty render.

### `omni_ref`

Default intended H3 reference mode:

- subject card;
- floor grid;
- sparse depth/point cues;
- simple neutral geometry;
- camera path only in authoring preview, optionally hidden in final playblast.

### `card_grid`

Subject card + grid; useful for framing and perspective.

### `graybox`

Simple neutral scene geometry.

### `grid`

Grid-only camera move reference.

### `point_field`

Sparse 3D points for strong optical-flow/parallax cues.

### `wireframe`

Geometry lines only.

Model-specific benchmarks must determine which proxy mode transfers camera motion most reliably.

---

## 6. Canonical camera track

Schema version 1:

```json
{
  "schema_version": 1,
  "fps": 24,
  "duration_frames": 120,
  "width": 1280,
  "height": 720,
  "render_mode": "omni_ref",
  "keyframes": [
    {
      "frame": 0,
      "camera": {
        "position": [6.0, 4.0, 6.0],
        "target": [0.0, 1.5, 0.0],
        "fov": 35.0,
        "roll": 0.0,
        "camera_type": "perspective",
        "zoom": 1.0,
        "near": 0.01,
        "far": 10000.0
      },
      "interpolation": "ease"
    }
  ],
  "objects": [],
  "metadata": {}
}
```

Coordinate policy:

- right-handed conceptual world;
- X right;
- Y up;
- units conceptually meters;
- camera represented by position + target + roll + FOV;
- each adapter owns explicit handedness/axis/unit conversion.

---

## 7. ComfyUI nodes included

### `Majoor OmniCam Director`

Outputs:

- `MAJOOR_OMNICAM_TRACK`;
- `VIDEO` proxy/playblast;
- `LOAD3D_CAMERA` snapshot;
- JSON string.

### `OmniCam Track Sampler`

Samples the canonical track at a requested frame and emits camera state.

### `OmniCam → MiniMax H3 Omni Reference`

Passes the proxy video through and builds a prompt fragment instructing H3 to use the video for camera movement rather than proxy appearance.

### `OmniCam → Wan ATI Bridge`

Projects stable synthetic 3D reference points through the authored camera to generate per-frame 2D trajectories. The versioned WanVideoWrapper adapter translates this bridge into the exact pinned `WanVideoATITracks` string contract.

### `OmniCam → LTX Camera Bridge`

Outputs version-neutral per-frame camera position, target, FOV, roll and timing. The companion guide node supports the pinned integration's public IC-LoRA frame and camera-LoRA route.

### `OmniCam → Blender Export`

Writes canonical JSON + Blender Python camera import script.

### `OmniCam → Unreal Export`

Writes canonical JSON plus a versioned Unreal 5.3–5.6 CineCamera/Level Sequence script with transform/lens keys and round-trip export.

---

## 8. Backend architecture

```text
omnicam/
├── extension.py
├── nodes.py
├── routes.py
├── core/
│   ├── track.py
│   └── projection.py
└── adapters/
    ├── h3.py
    ├── ati.py
    ├── ltx.py
    ├── blender.py
    └── unreal.py
```

### Principles

- modern ComfyUI V3 extension API;
- pure camera math independent from ComfyUI imports;
- no core ComfyUI patching;
- browser/frontend performs interactive authoring;
- backend turns serialized state/files into graph outputs;
- upload routes are constrained to ComfyUI-managed directories;
- no arbitrary filesystem route;
- no shell execution;
- no hidden network telemetry.

---

## 9. Frontend architecture

### Current MVP

`web/omnicam.js` owns Comfy integration and uses the locally bundled Three.js renderer from `web/omnicam-webgl.js`; Canvas2D remains the fallback and overlay/capture surface.

It includes:

- camera navigation;
- keyframes;
- timeline playback;
- camera path;
- proxy scene;
- media card;
- deterministic frame-stepped WebCodecs playblast with realtime `MediaRecorder` fallback;
- upload through ComfyUI server route;
- workflow state serialization.

### Production target

```text
web-src/
├── OmniCamNode.vue
├── viewport/
│   ├── OmniViewport.ts
│   ├── CameraRig.ts
│   ├── SceneProxy.ts
│   ├── CardObject.ts
│   ├── PrimitiveFactory.ts
│   └── ProxyRenderer.ts
├── timeline/
│   ├── TimelineStore.ts
│   ├── Interpolation.ts
│   └── CameraTrackView.vue
└── adapters/
```

Production viewer should use locally bundled/pinned Three.js/WebGL concepts compatible with ComfyUI's current Load3D direction, without importing private frontend internals that may change.

---

## 10. H3 strategy

The generated proxy `VIDEO` is intended to be used as a camera-motion Omni Reference.

Default generated prompt fragment:

```text
Use <Video 1> exclusively as the camera-motion reference. Reproduce its camera trajectory, framing evolution, speed, acceleration, parallax and timing. Do not copy the proxy geometry, grid, markers, textures or colors from <Video 1>. Preserve identity, scene and styling from the other Omni References.
```

Benchmark matrix:

- orbit 45° / 90° / 180°;
- dolly in/out;
- crane up/down;
- truck left/right;
- pan/tilt;
- roll;
- combined moves;
- handheld layer;
- dolly zoom.

---

## 11. Wan native camera / ATI strategy

### Native ComfyUI camera embedding

The v0.32.0 baseline contains a core `WanCameraEmbedding` node producing Plücker camera embeddings and a `WanCameraImageToVideo` input for that embedding. A production OmniCam adapter should convert arbitrary authored tracks into that native embedding once axis/handedness conversion is validated.

### ATI

ATI is treated as trajectory-based motion control.

Generic bridge:

```text
3D reference point cloud
        +
OmniCam camera track
        │
        ▼
project each 3D point per frame
        │
        ▼
2D pixel + normalized trajectories
        │
        ▼
version-specific Wan/ATI adapter
```

This makes camera parallax emerge geometrically rather than from a hard-coded pan/zoom preset.

---

## 12. LTX strategy

Keep a stable camera bridge independent of a specific LTX custom-node release:

- frame/time;
- camera position;
- target;
- FOV;
- roll;
- projection type;
- output dimensions.

A direct LTX control adapter must pin and test the exact official/current control representation before implementation.

---

## 13. Blender / Unreal strategy

### Blender

Current export script reconstructs:

- scene fps/range/resolution;
- camera position;
- look-at orientation;
- FOV keyframes.

Planned:

- roll;
- exact OmniCam interpolation mapping;
- proxy/card import;
- round-trip camera export.

### Unreal

Current bootstrap:

- spawns CineCameraActor;
- applies first camera position/FOV;
- writes canonical JSON into project Saved directory.

Planned:

- pinned Unreal 5.x version bridges;
- Level Sequence creation;
- transform/lens tracks;
- round-trip Sequencer export.

---

## 14. Camera authoring tools

Implemented by 0.3.0, including the toggleable viewport speed heatmap:

- orbit preset;
- dolly;
- crane;
- truck;
- pedestal;
- pan;
- tilt;
- 360° product orbit;
- look-at constraint;
- follow target;
- arc constraint;
- camera shake;
- dolly zoom;
- focal-length animation;
- path smoothing;
- motion-speed heatmap;
- multi-shot sequencer.

---

## 15. Release roadmap

### Phase 0 — foundation

Implemented in this ZIP:

- V3 extension skeleton;
- canonical track;
- interpolation/projection math;
- secure routes;
- adapter boundaries;
- tests/CI/docs/agent instructions.

### Phase 1 — MVP

Mostly implemented:

- Canvas viewport;
- navigation;
- timeline/keyframes;
- proxies/card;
- playblast upload;
- graph outputs.

Current MVP also includes camera speed/reset, draggable timeline keys, object transform gizmos and an exact frame-stepped encoder. The remaining timeline feature is the curve/graph editor.

### Phase 2 — WebGL production viewport

- bundled Three.js with legacy and Nodes 2.0 DOM lifecycle support;
- GPU proxy scene;
- transform gizmos;
- camera frustum/path spline;
- synchronized video textures;
- robust disposal/performance tests.
- managed GLB import.

### Phase 3 — native Comfy media

- direct upstream IMAGE/VIDEO cards;
- update when upstream output changes;
- crop/fit controls.
- multi-item execution reference selector.

### Phase 4 — H3 production adapter

- current H3-node detection/wiring;
- reference presets;
- empirical transfer benchmark suite.

### Phase 5 — Wan native camera + ATI direct adapters

- validate direct arbitrary-track conversion to core `WAN_CAMERA_EMBEDDING`;
- pin current WanVideoWrapper commit/release;
- map generic bridge to exact ATI inputs;
- visual trajectory preview;
- regression tests.

### Phase 6 — LTX 2.5 direct camera conditioning

- pin current official LTX 2.5 camera API/control;
- coordinate conversion;
- temporal resampling;
- compatibility tests.

### Phase 7 — DCC interoperability

- full Blender round trip;
- versioned Unreal Sequencer bridge.

### Phase 8 — advanced camera tools

Procedural/preset camera authoring.

### Phase 9 — multi-shot Sequencer

Create `OMNICAM_SEQUENCE` with shots, cuts, handles, per-shot adapter settings and batch proxies.

### Phase 10 — release quality

- browser automation;
- Windows Portable/Desktop QA;
- macOS/Linux QA;
- registry metadata;
- docs/help pages;
- compatibility matrix;
- security review.

See `docs/ROADMAP.md` for the checkbox version.

---

## 16. Agent execution contract

Every automated coding agent must read `AGENTS.md` first.

Before modifying code it must consult the official sources listed in `docs/OFFICIAL_SOURCES.md`, especially:

- ComfyUI Core;
- ComfyUI Server docs;
- ComfyUI Frontend;
- ComfyUI Desktop;
- ComfyUI Manager;
- Embedded Docs;
- Registry docs.

For a full autonomous implementation brief, use `docs/PROMPT_AUTOCODER.md`.

---

## 17. Definition of done

A production feature is done only when:

1. current official APIs were checked;
2. no ComfyUI core patch is required;
3. workflow save/reload preserves state;
4. path/security validation exists;
5. pure camera tests pass;
6. browser/manual viewport QA passes;
7. docs are updated;
8. adapter behavior is version-pinned when it depends on a third-party node/model;
9. model-specific logic does not leak into `core/`.

---

## 18. Current limitations of the ZIP

This package contains the integrated 0.3.0 implementation, but does not claim that external model, DCC, cross-platform or Registry validation is complete.

In particular:

- deterministic WebCodecs playblasts are implemented, with full-duration/cross-browser acceptance still external QA;
- curve/graph editing and one-click batch recording remain open;
- WanVideoWrapper support is limited to the explicitly pinned commit;
- the inspected LTX integration exposes proxy/IC-LoRA guidance but no arbitrary-extrinsics public socket;
- live model generations, DCC execution, full Comfy workflow QA and cross-platform QA remain external gates.

Those boundaries are intentional to prevent a brittle custom node whose core breaks every time a fast-moving integration changes.
