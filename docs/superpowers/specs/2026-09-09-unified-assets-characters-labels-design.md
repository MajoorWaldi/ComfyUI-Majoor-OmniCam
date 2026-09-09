# OmniCam Unified Asset Library, Rigged Characters & Semantic Labels — Design Specification

**Status:** Approved architecture, design-spec stage  
**Date:** 2026-09-09  
**Repository:** `MajoorWaldi/ComfyUI-Majoor-OmniCam`  
**Plan-1 baseline:** `feat/director-console-foundation`  
**Baseline SHA:** `7cc3ba13578106bd1d1ab8a57f42b1c7a1ff515e`

## 1. Purpose

This specification defines the next OmniCam layer after the Director Console foundation:

1. promote the reconstruction-only asset library into one unified OmniCam asset catalog;
2. expose it in Director as a compact 3D Asset Browser;
3. add semantic tags and visible viewport annotations;
4. formalize rigged 3D characters as authorable assets;
5. standardize humanoid rigs behind `OMNICAM_HUMANOID_V1`;
6. provide manual FK pose editing and a pose library;
7. formalize character animation clips and timing;
8. extend the Semantic Director API for the same operations a later Agent will use;
9. preserve the three public nodes and model-independent MotionScene architecture.

The goal is a stronger shot-layout/previs system, not a Maya/Blender replacement.

## 2. Product architecture

```text
                        ◉ OmniCam Director
                               │
               ┌───────────────┴───────────────┐
               │                               │
             SCENE                           ASSETS
               │                               │
               │                        Semantic Catalog
               │                               │
               └───────────────┬───────────────┘
                               ▼
                        Director objects
                               │
                ┌──────────────┼───────────────┐
                │              │               │
             cameras         props         characters
                                               │
                                          Rig / Pose /
                                          Motion Clip
                               │
                               ▼
                     OMNICAM_EDITOR_STATE
                               │
                               ▼
                     OMNICAM_MOTION_SCENE
                               │
                    ┌──────────┼───────────┐
                    ▼          ▼           ▼
                   H3         Wan         LTX
                 Monitor     Monitor      Monitor
```

The future Agent sits beside Manual UI and consumes the same Semantic Director API.

## 3. Hard invariants

- Public nodes remain exactly `Extractor`, `Director`, `Monitor`.
- MotionScene remains model-agnostic.
- No VCam in this phase.
- No Claude/OpenAI/Ollama provider in this phase.
- No skin weighting, rig creation, mesh editor, NLA, mocap, full IK, physics or facial rig.
- No ComfyUI core patch.
- Hand-written source modules remain below the repository 800-line ceiling.

## 4. Current-code audit

### 4.1 Semantic Director API exists

Plan 1 already provides:

```text
web-src/director-api/
├── apply.js
├── constants.js
├── errors.js
├── index.js
├── query.js
├── transaction.js
└── validate.js
```

`ui.directorApi.execute()` validates, applies operations to a cloned state, checkpoints once, sanitizes, swaps state, serializes and performs targeted repaint. This remains the future Agent mutation boundary.

### 4.2 Runtime is already character-capable

The current viewport already loads GLB/GLTF and FBX, detects `SkinnedMesh`/bones, creates `AnimationMixer`, reads clips, updates mixer time from the Director timeline and can display `SkeletonHelper`.

Therefore this project formalizes existing runtime behavior instead of introducing another 3D engine.

### 4.3 Bone-level access already exists

`web-src/aim-constraint.js` can already resolve a loaded model bone to a world-space aim target. The new rig layer reuses this runtime mapping.

### 4.4 Reconstruction already owns a small asset library

Current:

```text
omnicam/reconstruction/asset_library/
├── library.default.json
├── library.py
├── poses.py
├── resolver.py
└── types.py
```

It already stores semantic class, GLB, category, fit, base dimensions, source/license and simple posed-human variants. This code is promoted/adapted rather than duplicated.

### 4.5 Managed upload/index infrastructure already exists

`omnicam/routes.py` already has managed-root confinement, model upload checks, byte/vertex/triangle limits, quotas and:

```text
POST /majoor/omnicam/upload_model
GET  /majoor/omnicam/assets
POST /majoor/omnicam/cleanup
```

Important: `/majoor/omnicam/assets` currently means **managed file index**. It must not silently become the semantic catalog.

## 5. Official ComfyUI alignment

Current official ComfyUI frontend guidance continues to favor registered extensions/hooks rather than core modification. The official frontend retains a dedicated `load3d` subsystem, and current core retains `PromptServer` custom-route registration.

Current ComfyUI_frontend issue #13992 also documents that local/OSS 3D uploads do not yet universally get usable persisted 3D thumbnails in the global Assets browser. OmniCam therefore owns its Director catalog/preview layer instead of depending on that unfinished path.

Official references checked 2026-09-09:

- https://github.com/Comfy-Org/ComfyUI_frontend/blob/main/docs/extensions/core.md
- https://github.com/Comfy-Org/ComfyUI_frontend
- https://github.com/Comfy-Org/ComfyUI/blob/master/server.py
- https://github.com/Comfy-Org/ComfyUI_frontend/issues/13992

## 6. Unified Asset Catalog

Create:

```text
omnicam/assets/
├── __init__.py
├── types.py
├── catalog.py
├── manifest.py
├── storage.py
├── validation.py
├── rig.py
├── pose_library.py
├── legacy_reconstruction.py
└── routes.py
```

Frontend:

```text
web-src/assets/
├── api.js
├── catalog-store.js
├── filters.js
├── instantiate.js
├── preview-cache.js
├── thumbnail-renderer.js
├── labels.js
├── label-overlay.js
└── character/
    ├── rig-profile.js
    ├── rig-runtime.js
    ├── rig-overlay.js
    ├── pose-state.js
    ├── pose-editor.js
    └── motion-state.js
```

The current reconstruction package becomes a compatibility facade/delegate over `omnicam.assets`.

## 7. Storage

```text
<ComfyUI input>/
└── omnicam/
    └── library/
        ├── catalog.json
        ├── characters/
        ├── props/
        ├── environments/
        ├── vehicles/
        ├── poses/
        ├── animations/
        └── thumbnails/
```

Existing files are not automatically moved/deleted. No absolute path is serialized.

## 8. Catalog sources and precedence

Sources:

1. repository metadata `omnicam/assets/catalog.default.json`;
2. writable `<input>/omnicam/library/catalog.json`;
3. legacy reconstruction library as read-only compatibility source.

Precedence:

```text
user catalog > legacy mapped entry > default definition
```

Duplicate IDs in one source are invalid.

## 9. AssetDefinition v2

```json
{
  "version": 2,
  "id": "omnicam.character.human_01",
  "name": "Human 01",
  "kind": "character",
  "category": "characters",
  "file": "characters/human_01.glb",
  "format": "glb",
  "base_size": [0.62, 1.81, 0.42],
  "fit": "upright",
  "tags": ["human", "adult", "neutral"],
  "thumbnail": "thumbnails/human_01.webp",
  "rig": {
    "profile": "omnicam_humanoid_v1",
    "root_bone": "Hips",
    "bone_map": {
      "pelvis": "Hips",
      "spine": "Spine",
      "chest": "Spine2",
      "neck": "Neck",
      "head": "Head"
    },
    "forward_axis": "-Z",
    "up_axis": "+Y"
  },
  "animations": [
    {"id": "idle", "name": "Idle", "clip": "Idle", "tags": ["idle"]},
    {"id": "walk", "name": "Walk", "clip": "Walk", "tags": ["walk", "locomotion"]}
  ],
  "license": {"spdx": "CC0-1.0", "source": "..."}
}
```

Initial kinds:

```text
character
prop
environment
vehicle
helper
```

## 10. Compatibility decision: no `type:"character"` yet

A scene character remains a renderable GLB/model:

```json
{
  "type": "glb",
  "asset_kind": "character",
  "asset_id": "omnicam.character.human_01",
  "character": {}
}
```

Older OmniCam can still render the GLB while ignoring richer semantics. This keeps the first implementation additive and avoids an unnecessary MotionScene version bump.

## 11. Scene object additions

```json
{
  "id": "character_01",
  "name": "John",
  "type": "glb",
  "asset": "omnicam/library/characters/human_01.glb [input]",
  "asset_id": "omnicam.character.human_01",
  "asset_kind": "character",
  "position": [0, 0, 0],
  "rotation": [0, 0, 0],
  "size": [1, 1, 1],
  "tags": ["hero", "subject"],
  "annotation": {
    "text": "HERO",
    "visible": true,
    "color": "#8d7ee8",
    "anchor": "top"
  },
  "character": {
    "rig_profile": "omnicam_humanoid_v1",
    "pose": {"preset_id": "neutral", "root_offset": [0, 0, 0], "joints": {}},
    "motion": null
  }
}
```

`asset_id` identifies the catalog entry; `asset` remains the managed media reference understood by the existing loader.

## 12. Validation

### Tags

- max 32/object;
- max 64 chars;
- lowercase ASCII semantic slug (`a-z`, `0-9`, `_`, `-`);
- deduplicated.

### Annotation

```json
{"text":"HERO","visible":true,"color":"#8d7ee8","anchor":"top"}
```

- text <= 128 UTF-8 chars;
- `anchor = top|center|bottom`;
- strict hex color;
- no HTML/URL/CSS expression.

### Asset linkage

- `asset_id <= 120`;
- bounded `asset_kind` enum.

Scene may still load from stored managed `asset` if the catalog row is missing.

### Character

- `rig_profile <= 80`;
- <=128 pose joints;
- joint ID <=64;
- animation ID <=80;
- all quaternions finite, normalized and stored `[x,y,z,w]`.

## 13. Name vs tags vs annotation

These are intentionally separate:

- `name`: human-facing Outliner identity (`John`, `Camera A`);
- `tags`: machine semantics (`hero`, `subject`, `foreground`);
- `annotation`: visible viewport label (`HERO`, `JOHN`).

The future Agent resolves semantic references through tags, not viewport text.

## 14. Viewport Labels

Global mode:

```text
Labels: Off | Selected | All
Content: Annotation | Object Name | Primary Tag
```

Default: `Selected + Annotation`.

Use one pooled HTML overlay above the WebGL canvas. Each update projects an entity world anchor through the current viewport camera and moves the existing DOM node. Do not create another renderer per label.

Anchors:

- static model: world bounds top-center;
- Character: mapped head joint, fallback bounds top-center;
- camera/light/null: position plus small vertical offset.

Labels are editor-only and excluded from clean playblast/reference capture by default. V1 has no mesh-occlusion raycast for every label.

## 15. Outliner integration

```text
▾ John                      👁 🔒
   CHAR   hero subject
```

Show at most two tag chips and `+N` for additional tags. Search covers name, tags, asset name/kind and reconstruction semantic class.

## 16. Asset Browser

Plan-1 left panel becomes:

```text
┌──────────────────────────────┐
│ SCENE          ASSETS        │
├──────────────────────────────┤
```

Asset tab:

```text
Search assets...
[All] [Characters] [Props] [Env] [Vehicles]

┌──────────┐ ┌──────────┐
│ preview  │ │ preview  │
│ Human A  │ │ Chair A  │
│ RIGGED   │ │ PROP     │
└──────────┘ └──────────┘
```

Initial interactions: click/select, double-click instantiate, Add, Import. Drag-to-viewport is deferred until deterministic instantiate is stable.

Placement priority: viewport ground hit, else orbit target projected to ground, else world origin.

## 17. Semantic catalog routes

Keep current `GET /majoor/omnicam/assets` unchanged.

Add:

```text
GET    /majoor/omnicam/library
GET    /majoor/omnicam/library/{asset_id}
POST   /majoor/omnicam/library/import
POST   /majoor/omnicam/library/register
PATCH  /majoor/omnicam/library/{asset_id}
DELETE /majoor/omnicam/library/{asset_id}

GET    /majoor/omnicam/library/poses
POST   /majoor/omnicam/library/poses
DELETE /majoor/omnicam/library/poses/{pose_id}
```

Routes operate only inside managed OmniCam directories and never accept arbitrary absolute paths.

## 18. Import

Reuse current upload security/complexity checks.

Catalog formats: GLB preferred, FBX accepted. Character import additionally scans bones and attempts rig mapping.

```text
file -> upload validation -> managed destination -> inspect -> register -> thumbnail
```

OBJ/STL/PLY remain usable generic 3D imports but are not Character catalog formats.

## 19. Thumbnail architecture

Catalog thumbnail is preferred. Missing thumbnails are lazily generated using one shared small Three.js renderer with neutral studio and model-bound fitting.

- 256×256 default;
- one preview job at a time;
- lazy visible-card loading;
- temporary resources disposed;
- optional WebP persistence only through a bounded managed route.

Cache key includes asset ID, asset file fingerprint and thumbnail-renderer version.

## 20. Character system

Character = renderable model + semantic `asset_kind=character` + known rig profile + optional pose + optional clip.

It reuses the existing model loader and AnimationMixer.

## 21. `OMNICAM_HUMANOID_V1`

Canonical joints:

```text
root, pelvis, spine, chest, neck, head,
clavicle_l, upper_arm_l, lower_arm_l, hand_l,
clavicle_r, upper_arm_r, lower_arm_r, hand_r,
upper_leg_l, lower_leg_l, foot_l, toe_l,
upper_leg_r, lower_leg_r, foot_r, toe_r
```

Optional: `eye_l`, `eye_r`, `hand_tip_l`, `hand_tip_r`. Finger chains are out of v1.

## 22. Rig mapping

The catalog owns source-bone mapping; scene state stores only canonical joints.

```text
Mixamo / GLTF / custom source rig
             ↓
          Rig Mapper
             ↓
      OMNICAM_HUMANOID_V1
```

Auto-mapper v1 recognizes Mixamo, common generic GLTF names and OmniCam-native rigs through normalized aliases + hierarchy + left/right consistency. Incomplete required mapping means the asset remains a normal model until manually corrected.

No false `RIGGED` badge.

## 23. Rig Mapper UI

```text
RIG MAPPER
────────────────────────
Pelvis       [ Hips              ✓ ]
Spine        [ Spine             ✓ ]
Chest        [ Spine2            ✓ ]
Head         [ Head              ✓ ]
...
[Auto Map] [Validate] [Save Mapping]
```

Runtime bone names come from the loaded model. Saved mapping updates the local catalog row.

## 24. Character Inspector

```text
CHARACTER
──────────────────────────
John

Transform
Asset       Human 01
Rig         Humanoid v1 ✓

Pose
Preset      Neutral
[Edit Pose] [Save Pose…]

Motion
Clip        None
Start       0
Speed       1.00
Loop        ✓

Labels
Annotation  HERO
Tags        hero, subject
```

No separate permanent Character panel; Inspector remains contextual.

## 25. Pose authoring v1

FK first.

```text
Edit Pose -> canonical joint overlay -> select joint -> rotation gizmo -> save quaternion
```

No per-bone translation gizmo in v1. Pose rotations use normalized local quaternions `[x,y,z,w]`.

A dedicated `CharacterRigOverlay` shows/picks only canonical mapped joints, instead of exposing raw helper/twist/finger bones.

## 26. Pose state and library

```json
{
  "pose": {
    "preset_id": "neutral",
    "root_offset": [0,0,0],
    "joints": {
      "upper_arm_r": [0,0.2588,0,0.9659]
    }
  }
}
```

Evaluation:

```text
asset rest pose -> pose preset -> scene joint overrides
```

Pose presets are source-rig-independent and target `omnicam_humanoid_v1`.

Initial target set: Standing Neutral, Standing Relaxed, Arms Crossed, Pointing, Reaching, Hands on Hips, Sitting, Crouching, Kneeling, Looking Up, Looking Down. Actual rotations must be authored/verified; implementation must not fabricate final pose data.

User can save current pose as a local custom pose.

## 27. Character animation timing

Formalize current clip playback:

```json
{
  "motion": {
    "clip_id": "walk",
    "start_frame": 24,
    "end_frame": 120,
    "speed": 1.0,
    "loop": true,
    "offset_seconds": 0.0
  }
}
```

Speed is finite `[0.05, 8.0]`; ranges must be valid.

Pose editing and active motion are mutually exclusive in v1. `Bake current frame to pose` samples the current mixer pose, maps it to canonical joints, clears motion and enters Pose mode. Additive pose-over-animation is deferred.

Embedded root translation is ignored by default; scene/world movement remains controlled by Director object transform/path.

## 28. Semantic Director API expansion

Add, as deterministic implementations land:

```text
asset.instantiate
object.set_tags
object.set_annotation
character.set_pose
character.set_joint_rotation
character.set_motion
character.clear_motion
```

Queries:

```text
asset.list
asset.get
character.get_rig
character.get_pose
```

`asset.instantiate` must not perform HTTP lookup inside an atomic transaction. Resolve the catalog entry first and compile a bounded deterministic object payload.

No operation accepts arbitrary code, raw JSON patch, shell, filesystem path or DOM/Three.js object.

## 29. Runtime Character API

Transient frontend helper:

```text
ui.characterRuntime
```

Methods:

```text
getRigInfo(objectId)
resolveJoint(objectId, canonicalJoint)
getJointWorldTransform(objectId, canonicalJoint)
applyPose(objectId, characterState)
setMotion(objectId, motionState)
sampleCanonicalPose(objectId, frame)
```

This is never serialized and never given directly to the future Agent.

## 30. Dirty-domain integration

Use Plan-1 scheduler:

```text
tag edit          -> outliner + inspector
annotation edit   -> viewport + outliner + inspector
pose joint drag   -> viewport + inspector
motion timing     -> viewport + timeline + inspector
asset instantiate -> viewport + outliner + inspector
```

## 31. Performance

Target 1–5 rigged previs characters while preserving the repository 60fps/720p interaction target on normal desktop GPU.

- one mixer per animated loaded model;
- cache canonical-joint -> Bone map after load;
- no skeleton rediscovery every frame;
- rig overlay only for selected Pose-mode Character;
- pooled label DOM;
- no per-frame catalog HTTP;
- no thumbnail rendering while playback is active;
- catalog responses are metadata only and paginated (`100` default, `500` hard max).

## 32. Security

Reuse existing managed-root and model-upload protections.

Additional bounds:

```text
catalog entries       <= 5000
catalog JSON          <= 8 MiB
tags/asset            <= 32
clips/asset           <= 256
bone mappings/asset   <= 128
```

Labels are rendered with `textContent`, not `innerHTML`. Thumbnail formats are WebP/PNG/JPEG only. No hidden runtime asset download.

## 33. Reconstruction migration

New flow:

```text
semantic class
 ↓
Unified Asset Catalog resolver
 ↓
AssetDefinition
 ↓
placement adapter
 ↓
AssetPlacement
```

The existing reconstruction library API remains as a compatibility facade.

Reconstructed assets receive only factual tags such as `reconstruction`, `chair`, `person`. Do not infer editorial roles such as `hero` or `subject`.

A detected `person` becomes `asset_kind=character` only when the resolved catalog asset actually has a valid rig. A static posed human remains a static model/prop.

## 34. Scene persistence and fallback

Saved Director scenes persist asset reference, asset ID/kind, character state, tags and annotation.

Graceful fallback:

```text
catalog + file + rig          -> full Character
catalog + file, invalid rig   -> normal model
file exists, catalog missing  -> normal model + warning
file missing                  -> placeholder + warning
```

One bad asset must not fail the Director.

## 35. Undo/selection

One logical action = one checkpoint. Joint drag checkpoints once at drag start.

Joint selection is transient:

```js
subSelection = {
  type: "character_joint",
  objectId: "character_01",
  jointId: "upper_arm_r"
}
```

It is never serialized.

## 36. Initial library target

```text
Characters    3–5
Props         15–25
Environment   5–10
Vehicles      3–5
Pose presets  10–15
```

Default/distributed assets carry explicit SPDX/source metadata and should prefer CC0/permissive licensing.

## 37. Error codes

Catalog:

```text
ASSET_CATALOG_INVALID
ASSET_NOT_FOUND
ASSET_FILE_MISSING
ASSET_FILE_INVALID
ASSET_IMPORT_TOO_LARGE
ASSET_LICENSE_INVALID
```

Rig/Pose/Character:

```text
RIG_NOT_FOUND
RIG_PROFILE_UNSUPPORTED
RIG_MAPPING_INCOMPLETE
RIG_MAPPING_INVALID
RIG_JOINT_UNMAPPED
POSE_NOT_FOUND
POSE_PROFILE_MISMATCH
POSE_INVALID_QUATERNION
POSE_LIMIT_EXCEEDED
CHARACTER_NOT_RIGGED
CHARACTER_MOTION_NOT_FOUND
CHARACTER_MOTION_INVALID_RANGE
TAG_INVALID
TAG_LIMIT_EXCEEDED
ANNOTATION_INVALID
```

## 38. Testing

Python:
- catalog parsing/precedence/path confinement/legacy mapping;
- rig mapping and required joints;
- pose quaternion validation/round-trip;
- catalog/thumbnail routes and quotas;
- object state validation/backward compatibility.

Frontend unit:
- catalog store/filtering/instantiate compiler;
- labels projection/modes;
- rig-profile resolver/pose state/motion timing;
- semantic API operations.

Playwright:
- Scene/Assets switch;
- instantiate;
- tags/annotations;
- Labels Off/Selected/All;
- rigged character load;
- Pose mode/joint rotation;
- pose preset and motion clip;
- scene save/reload and undo/redo.

Live ComfyUI:
- GLB rig;
- FBX rig;
- workflow reload;
- Node 2.0/Vue-enabled mount;
- no page errors.

## 39. Migration policy

Existing workflows load unchanged. Missing new fields default to null/empty values.

Existing GLB/model objects remain normal models and are not silently converted. User may explicitly `Convert to Character`.

The existing low-poly `human` primitive remains available.

No MotionScene version bump is required for the first implementation because existing object `type` values and existing field meanings remain unchanged; new fields are additive. If implementation requires changing an existing meaning or adding a mandatory new type, stop and add a versioned migration.

## 40. Delivery phases

### Phase 0 — Plan-1 stabilization
Rebase/merge against final Plan-1 and verify Semantic API, Solve Health, dirty scheduler and shell.

### Phase 1 — Unified backend catalog
`omnicam/assets/*`, default catalog, legacy adapter and tests.

### Phase 2 — Semantic Library API
Safe catalog routes/import/register/delete and thumbnail persistence.

### Phase 3 — Director Asset Browser
Scene/Assets tabs, grid, filters, thumbnails and instantiate.

### Phase 4 — Tags + viewport Labels
Validated tags/annotation, Outliner chips, Inspector, overlay and Semantic API operations.

### Phase 5 — Character identification + rig mapping
`asset_kind=character`, Humanoid v1, auto mapper and Rig Mapper UI.

### Phase 6 — FK Pose editor
Rig overlay, joint picking, rotation gizmo, pose serialization/presets/custom pose save.

### Phase 7 — Character motion clips
Clip timing, speed, loop, offset and Bake current frame to pose.

### Phase 8 — Reconstruction migration
Resolver delegates to unified catalog while preserving legacy behavior.

### Phase 9 — Semantic API completion
Asset/label/character operations hardened for future Agent consumption.

### Phase 10 — QA/performance/docs
Full test matrix, live ComfyUI, 5-character performance, disposal and docs.

## 41. Deferred

```text
full IK
foot locking
arbitrary animation retargeting
animation blending/NLA
mocap
facial rig/blendshapes
finger posing
physics/ragdoll
VCam
Agent provider
voice direction
root-motion path authoring
```

FK ships before IK because it gives useful blocking without committing OmniCam to pole-vector/joint-limit/foot-lock complexity across arbitrary imported rigs.

## 42. Documentation

Update:

```text
README.md
docs/NODES.md
docs/USER_GUIDE.md
docs/SHORTCUTS.md
docs/SECURITY.md
docs/COMPATIBILITY.md
docs/BLOCKOUT_ASSET_LIBRARY.md
```

Add:

```text
docs/ASSET_LIBRARY.md
docs/CHARACTERS.md
```

## 43. Definition of done

The project is complete when:

1. one unified semantic catalog serves Director and Reconstruction;
2. the legacy reconstruction library remains compatible;
3. Director has a usable Asset Browser;
4. asset files remain in managed ComfyUI directories;
5. assets have stable IDs and license metadata;
6. GLB/FBX catalog assets can be instantiated;
7. objects support bounded semantic tags and safe annotations;
8. viewport Labels support Off/Selected/All and stay out of playblast by default;
9. valid rigged GLB/FBX can be recognized as Character;
10. source rigs map to `OMNICAM_HUMANOID_V1`;
11. FK joints can be edited and pose survives save/reload;
12. source-independent pose presets work;
13. animation clips have explicit timing/speed/loop state;
14. pose/motion behavior is deterministic;
15. mutations are exposed through bounded Semantic Director API operations;
16. no Agent provider, VCam or public node is added;
17. MotionScene remains model-independent and old workflows load;
18. missing assets degrade gracefully;
19. GPU/model resources are disposed correctly;
20. unit/browser/live/security/serialization tests and docs are complete.

## 44. Strategic sequence

```text
Plan 1 Director Foundation
        ↓
Unified Asset Catalog
        ↓
Asset Browser
        ↓
Tags + visible Labels
        ↓
Rigged Character semantic layer
        ↓
OMNICAM_HUMANOID_V1
        ↓
FK Pose Library
        ↓
Character Motion Clips
        ↓
Semantic API Character operations
        ↓
Director Agent
        ↓
VCam much later
```

This layer gives the future Agent a real semantic mise-en-scène vocabulary rather than only cameras and anonymous meshes.
