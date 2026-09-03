# AGENTS.md — ComfyUI-Majoor-OmniCam

These instructions apply to every automated coding agent working in this repository.

## 1. Read official sources before coding

For every code request, consult the relevant official ComfyUI source **before** writing or modifying Python, JavaScript/TypeScript/Vue, routes, packaging, docs, or model integrations.

### Required official sources

| Source | URL | Use it for |
|---|---|---|
| ComfyUI Core (Python) | https://github.com/Comfy-Org/ComfyUI | Python APIs, V3 nodes, `PromptServer`, routes, execution, `VIDEO`, `LOAD3D_CAMERA` |
| ComfyUI Server Docs | https://docs.comfy.org/development/comfyui-server/comms_overview | client/server communication, custom HTTP routes, websocket model |
| ComfyUI Frontend | https://github.com/Comfy-Org/ComfyUI_frontend | `app.registerExtension`, node lifecycle, DOM/Vue APIs, Load3D camera/recording patterns |
| ComfyUI Desktop | https://github.com/Comfy-Org/desktop | packaged-app constraints, install paths, Chromium/Electron behavior |
| ComfyUI Manager | https://github.com/Comfy-Org/ComfyUI-Manager | Registry/Manager install/update/security expectations |
| Embedded Docs | https://github.com/Comfy-Org/embedded-docs | user-facing help conventions |
| Registry docs | https://docs.comfy.org/registry/publishing | `pyproject.toml`, publishing, versioning |

If an API has changed since the last commit, adapt the implementation to the current official API rather than preserving obsolete local assumptions.

## 2. Core product invariant

**OmniCam core is model-agnostic.**

The canonical product flow is:

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

`OMNICAM_MOTION_SCENE` is the product interchange contract between Extractor,
Director and Monitor. It owns:

- authoring timeline;
- canvas;
- cameras;
- objects;
- motion layers;
- cuts;
- model-independent metadata.

`MAJOOR_OMNICAM_TRACK` remains the versioned camera primitive used inside
MotionScene and by solve/compiler internals. It is NOT the top-level OmniCam
product interchange contract.

No MiniMax-, Wan-, LTX-, Blender-, Unreal- or API-specific model semantics
belong in MotionScene authoring or the viewport engine. Model-specific behavior
belongs behind Monitor profiles.

## 3. Canonical document contracts

### MotionScene

The public product document is versioned through `motion_scene.version`.

An incompatible schema change requires:

1. incrementing the MotionScene version;
2. registering a migration in `omnicam/core/migrations.py`;
3. keeping previously saved workflows loadable;
4. adding a migration regression test;
5. adding a saved-workflow fixture.

Simply increasing the MotionScene version and rejecting every older workflow is
not a valid migration strategy.

Minimal shape:

```json
{
  "version": 1,

  "timeline": {
    "duration_seconds": 5.0,
    "authoring_fps": 24.0
  },

  "canvas": {
    "width": 1280,
    "height": 720
  },

  "cameras": [],
  "active_camera_id": "camera_1",
  "playblast_camera_id": "camera_1",

  "objects": [],
  "motion_layers": [],
  "cuts": [],

  "metadata": {}
}
```

### Camera Track

`MAJOOR_OMNICAM_TRACK` remains independently versioned as the canonical camera
primitive embedded in MotionScene.

The canonical track is versioned.

Required fields:

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

Do not silently break this format. Increment `schema_version` and provide migration code when required.

## 4. Backend rules

- Prefer the modern V3 API (`ComfyExtension`, `IO.Schema`, `IO.NodeOutput`).
- Keep pure math/track code independent of ComfyUI imports so it can be unit-tested.
- Validate all paths from frontend requests.
- Never accept arbitrary filesystem paths from upload routes.
- Restrict uploaded file extensions and size.
- Save user-authored card/playblast files below ComfyUI's managed input/output directories.
- Use `InputImpl.VideoFromFile` for `VIDEO` outputs when following current core behavior.
- Do not add heavyweight runtime dependencies if browser/core APIs already cover the task.

## 5. Frontend rules

- Use `app.registerExtension` or the current documented extension mechanism.
- Do not patch ComfyUI core files.
- Avoid deprecated `/extensions/core/...` imports.
- Preserve node serialization: camera state must survive workflow save/reload.
- Keep keyboard shortcuts scoped to the active OmniCam viewport.
- Do not steal shortcuts while the user is typing into inputs.
- The viewport must degrade gracefully if `MediaRecorder` is unavailable.
- Production WebGL work should use a bundled/pinned dependency, not a CDN, because ComfyUI CSP is restrictive.
- Dispose object URLs, observers, timers, GPU resources, and listeners.

## 6. Viewport UX

Required baseline:

- Orbit, pan, dolly.
- Fly camera (WASD/QE).
- `I` inserts/replaces keyframe at current frame.
- `Space` plays/stops.
- `F` frames the subject target.
- Timeline scrubber.
- Keyframe visibility.
- FOV and roll controls.
- Simple primitives.
- Image/video card.
- Camera path visualization.
- Neutral proxy render modes optimized for motion readability.

The UI should feel closer to a small shot-layout tool than a generic form node.

## 7. Proxy/playblast rules

Proxy video is a **conditioning signal**, not a beauty render.

Optimize for:

- parallax readability,
- perspective change,
- scale change,
- camera velocity,
- acceleration/deceleration,
- orbit direction,
- dolly/crane/pan readability,
- subject framing.

Default `omni_ref` should include card + floor grid + sparse depth/point cues and avoid distracting textures/lights.

## 8. Adapter rules

Model targets below are **Monitor profiles** — compilers from MotionScene to a
model-native artifact — not separate conditioning nodes on the public surface.
Blender and Unreal are **exchange / DCC interoperability** exports, not adapter
nodes either. The public node surface stays three product nodes; everything here
is downstream of the Monitor profile compiler.

### MiniMax H3

Primary product path: pass the proxy video as an Omni Reference and generate a prompt fragment that explicitly says to copy camera motion only, not proxy appearance.

### Wan / ATI

ATI is trajectory-based. The core adapter may project stable 3D reference points through the camera to generate 2D trajectories. A version-specific bridge may then translate those trajectories into the exact current WanVideoWrapper/ATI node representation.

Never hardcode undocumented third-party socket names without checking that repository/version first.

### LTX

Keep a version-neutral intrinsics/extrinsics payload. Only extend the LTX Monitor profile toward direct conditioning after checking the current official LTX implementation and current ComfyUI integration.

### Blender / Unreal (exchange / DCC interoperability)

These are file/script exports from the canonical MotionScene, not nodes.

- **Blender:** export a script that reconstructs camera transforms, lens/FOV and timeline timing.
- **Unreal:** keep canonical JSON as source of truth. Put Sequencer-specific logic behind a versioned exporter because Unreal Python APIs vary.

## 9. Testing requirements

Every PR touching camera math or track serialization must include tests for:

- interpolation,
- duplicated frame behavior,
- track migration/validation,
- camera projection,
- adapter payload dimensions.

Frontend changes must keep the automated suites green and extend them where the
change is testable: frontend unit (`npm run test:unit`), headless Playwright
(`npm run test:browser`), and the live suites against a real ComfyUI
(`live-ci.spec.js`, plus `live-vue-ci.spec.js` with `Comfy.VueNodes.Enabled`).
A manual QA checklist supplements these for viewport interaction that automation
does not yet cover; it does not replace them.

## 10. Performance requirements

Targets for the production WebGL viewport:

- 60 fps interaction at 720p viewport on a normal desktop GPU.
- < 50 ms UI response for keyframe insertion/scrubbing.
- no Comfy workflow execution required for camera editing.
- playblast capture must not load diffusion models.

## 11. Security requirements

- No shell execution from frontend values.
- No arbitrary `pip install` at runtime.
- No arbitrary file read route.
- No open remote-control server.
- No hidden outbound telemetry.
- No CDN dependency for runtime viewport code.

## 12. Documentation rule

When behavior changes, update the relevant maintained document:

- `README.md` for product behavior and setup;
- `docs/NODES.md` for node inputs, outputs, or usage;
- `docs/SHORTCUTS.md` for controls and interaction changes;
- `docs/SECURITY.md` for file handling, limits, or security changes.

## 13. Definition of done

A feature is done only when:

1. Official source/API checked.
2. Code implemented without core patches.
3. Workflow serialization survives save/reload.
4. Backend validation exists where applicable.
5. Tests pass.
6. Manual viewport QA passes.
7. Documentation updated.
8. No model-specific dependency leaked into the core track.

## 14. Source-file size and feature modules

- Hand-written source files must not exceed 800 lines.
- Do not satisfy this limit by minifying, joining statements, or otherwise
  hiding complexity on fewer physical lines.
- Every new feature, substantial behavior, or independent responsibility must
  be implemented in its own appropriately named module.
- Existing public import paths may remain as small facade modules that re-export
  the implementation from focused modules.
- Split a file before adding a feature when the change would push it beyond the
  800-line limit. The limit is a safety ceiling, not a target: prefer cohesive,
  focused modules and do not merge unrelated responsibilities merely because
  they fit below 800 lines.
