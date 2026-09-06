# OmniCam Semantic Blockout + Multi-View Reconstruction Design

**Date:** 2026-09-06  
**Target repository:** `MajoorWaldi/ComfyUI-Majoor-OmniCam`  
**Base commit:** `e32ec1db1a950b009959df0f5c732affde403f92`  
**Status:** implementation design approved by the prior product discussion; this document is the source of truth for the implementation plan that accompanies it.

---

## 1. Problem

The current Scene Reconstruction mode is useful as a geometric reference but it is not yet a useful blocking system.

Current single-image path:

```text
IMAGE
  ↓
MoGe
  ↓
point/depth map
  ↓
triangulated textured proxy
```

This is inherently a visible-surface / 2.5D representation. It preserves what the source camera saw but does not recover hidden surfaces. Large truck/orbit moves expose holes, stretched triangles and missing backsides.

OmniCam Director does not need a photorealistic reconstruction to solve this problem. It needs a robust editable scene abstraction:

- floor and walls;
- closed object proxies;
- approximate object position, scale and yaw;
- a source camera whose framing matches the source;
- optional dense geometry as a reference layer;
- enough structure to author camera motion without geometry disappearing when the camera changes axis.

The product therefore moves from **dense reconstruction as the scene** to **dense geometry as evidence for a semantic blockout**.

---

## 2. Product decision

Scene Reconstruction remains a mode inside the existing **OmniCam Extractor**. No fourth public node is introduced.

The public product surface remains:

```text
Extractor → OMNICAM_MOTION_SCENE → Director → Monitor
```

The new Scene Reconstruction modes are:

| Mode | Purpose | Dense reference | Semantic primitives | Object completion |
|---|---|---:|---:|---:|
| `depth_mesh` | Preserve current behavior | yes | room planes only | no |
| `blockout` | Fast editable blocking | optional/hidden | yes | no |
| `hybrid` | Blocking + geometric reference | yes | yes | optional |
| `scan` | Multi-view/video blocking | anchor reference | yes | optional |

`blockout` becomes the recommended default when SAM3 is available.

---

## 3. Core architecture

```text
                               SOURCE
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
               Single image             Image set / video
                    │                           │
                    ▼                           ▼
                  MoGe                        VGGT
                    │                           │
             GeometryEvidence            MultiViewEvidence
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                                  ▼
                                SAM3
                         semantic instances
                                  │
                                  ▼
                            SceneEvidence
                                  │
                 ┌────────────────┼────────────────┐
                 ▼                ▼                ▼
            Room Solver      Object Fitter    SAM3D Objects
                                              optional completion
                 │                │                │
                 └────────────────┼────────────────┘
                                  ▼
                            BlockoutScene
                                  │
                                  ▼
                       OMNICAM_MOTION_SCENE
                                  │
                                  ▼
                              Director
```

### Architectural rule

The ML providers never emit a MotionScene directly.

Providers emit evidence. Deterministic OmniCam code converts evidence into a blockout. The MotionScene compiler consumes only the blockout domain objects.

This keeps SAM3, SAM3D, VGGT, MoGe and future models out of the canonical authoring contract.

---

## 4. Upstream facts verified for this design

### 4.1 ComfyUI native MoGe

Current ComfyUI core exposes `LoadMoGeModel`, `MoGeInference`, `MoGePanoramaInference`, `MoGeRender` and `MoGePointMapToMesh` in `comfy_extras/nodes_moge.py`.

The current inference path calls:

```python
moge_model.infer(
    chunk,
    resolution_level=resolution_level,
    fov_x=fov,
    force_projection=force_projection,
    apply_mask=apply_mask,
)
```

MoGe v2 can apply predicted metric scale inside `MoGeModel.infer` when the checkpoint exposes it.

### 4.2 ComfyUI native SAM3

Current ComfyUI core has native SAM3 detection/segmentation in `comfy_extras/nodes_sam3.py`.

The official image blueprint uses:

```text
CheckpointLoaderSimple
        │
        ├── MODEL ───────► SAM3_Detect
        │
        └── CLIP ────────► CLIPTextEncode ───► SAM3_Detect conditioning
```

The current official blueprint references `sam3.1_multiplex_fp16.safetensors` under the normal ComfyUI `checkpoints` model folder.

`SAM3_Detect` supports text conditioning, boxes and point prompts and can return individual masks plus bounding boxes.

### 4.3 SAM 3D Objects

The official Meta repository describes SAM 3D Objects as reconstructing full object geometry, texture and layout from a single masked image. The public quick-start API loads `Inference`, calls it with `(image, mask, seed)` and exposes a Gaussian representation through `output["gs"]`.

Important deployment constraints from the official setup document:

- Linux 64-bit;
- NVIDIA GPU;
- at least 32 GB VRAM;
- separate environment with PyTorch3D / Kaolin and repository-specific setup;
- gated checkpoint download;
- SAM License.

Therefore SAM3D Objects is **not** a base dependency and **not** the default path.

### 4.4 VGGT

The official VGGT repository predicts cameras, intrinsics, depth, world point maps and tracks from one, several or hundreds of images.

The official pose utilities state that camera extrinsics are OpenCV convention, camera-from-world `[R|t]`.

The repository currently provides a dedicated `VGGT-1B-Commercial` checkpoint for commercial use. The original checkpoint has different usage terms.

### 4.5 VGGT-Ω

VGGT-Ω is newer and has attractive memory behavior, but the repository license is currently FAIR Noncommercial Research License. It is therefore a research-only optional adapter and must never be automatically selected in a commercial OmniCam workflow.

---

## 5. New domain contracts

### 5.1 `InstanceEvidence`

Transient. Never serialized into MotionScene.

```python
@dataclass(slots=True)
class InstanceEvidence:
    instance_id: str
    label: str
    score: float
    mask: Any
    bbox_xyxy: tuple[float, float, float, float]
    view_index: int = 0
```

### 5.2 `ViewCameraEvidence`

```python
@dataclass(slots=True)
class ViewCameraEvidence:
    view_index: int
    width: int
    height: int
    world_from_camera: Any
    intrinsics: Any
    source_frame: int | None = None
```

### 5.3 `MultiViewEvidence`

```python
@dataclass(slots=True)
class MultiViewEvidence:
    images: Any
    depth: Any
    depth_confidence: Any
    points_world: Any
    point_confidence: Any
    cameras: list[ViewCameraEvidence]
    coordinate_system: str
    scale_mode: str = "relative"
    provider_id: str = "vggt"
    provider_version: str = ""
```

### 5.4 `AxisConfidence`

```python
@dataclass(slots=True)
class AxisConfidence:
    width: float
    height: float
    depth: float
    yaw: float
```

### 5.5 `BlockoutObject`

```python
@dataclass(slots=True)
class BlockoutObject:
    object_id: str
    label: str
    semantic_class: str
    primitive: str
    position: tuple[float, float, float]
    rotation: tuple[float, float, float]
    size: tuple[float, float, float]
    confidence: float
    axis_confidence: AxisConfidence
    source_instance_ids: list[str]
    completion_provider: str = "none"
```

`primitive` is restricted to object types already understood by MotionScene v1 for the first release:

```text
cube
sphere
human
card
ground
null
```

A new `cylinder` primitive is intentionally deferred so this feature does not require a MotionScene enum/schema compatibility decision.

### 5.6 `BlockoutScene`

```python
@dataclass(slots=True)
class BlockoutScene:
    objects: list[BlockoutObject]
    room_planes: list[ReconstructedPlane]
    source_camera: ReconstructedCamera
    scan_camera_track: dict[str, Any] | None
    reference_asset: ReconstructedAsset | None
    provider_summary: dict[str, Any]
    warnings: list[str]
```

---

## 6. Single-image blockout flow

```text
image
  ↓
MoGe
  ├── points/depth
  ├── FOV / intrinsics
  ├── normals
  └── mask
  ↓
SAM3 taxonomy segmentation
  ↓
InstanceEvidence[]
  ↓
masked 3D point extraction
  ↓
robust object fit
  ├── centroid
  ├── ground-relative yaw
  ├── visible extents
  └── hidden-depth estimate
  ↓
Primitive Resolver
  ↓
BlockoutObject[]
```

### 6.1 Default semantic taxonomy

The default taxonomy is deliberately small. It is a blocking taxonomy, not a universal detector.

```text
person
chair
armchair
sofa
table
desk
bed
cabinet
shelf
counter
door
window
television
monitor
lamp
plant
bottle
box
suitcase
car
```

Room surfaces (`floor`, `wall`, `ceiling`) remain primarily geometry-driven rather than SAM3-driven.

Advanced UI can append custom comma-separated labels.

### 6.2 SAM3 detection policy

For each semantic label:

1. encode the label once with the SAM3 checkpoint CLIP;
2. call native `SAM3_Detect` with `individual_masks=True`;
3. reject detections below `sam3_threshold`;
4. reject tiny masks below `min_instance_area_ratio`;
5. deduplicate overlapping labels using mask IoU and detection score;
6. cap the final scene at `max_blockout_objects`.

Default values:

```text
sam3_threshold            = 0.55
sam3_refine_iterations    = 2
min_instance_area_ratio   = 0.0015
instance_iou_dedup        = 0.72
max_blockout_objects      = 24
```

---

## 7. Deterministic object fitting

SAM3 tells OmniCam *which pixels belong to an object*. MoGe/VGGT tells OmniCam *where those pixels are in 3D*.

For an instance mask:

```python
object_points = scene_points[mask]
```

The fitter must:

1. remove NaN/inf points;
2. optionally erode the mask before sampling to reduce edge/background contamination;
3. reject statistical outliers using robust median/MAD or percentile bounds;
4. transform points into the final OmniCam Y-up coordinate system;
5. compute ground-relative 2D PCA in XZ for yaw;
6. compute 5th/95th percentile extents in the rotated local frame;
7. snap/contact the object to a high-confidence ground plane when appropriate;
8. estimate confidence separately for width, height, depth and yaw.

### 7.1 Hidden depth

Single-view depth is often the weakest dimension.

For every object:

```text
observed_depth = robust extent of visible points along local depth axis
minimum_depth  = semantic minimum-depth ratio × robust lateral extent
resolved_depth = max(observed_depth, minimum_depth)
```

The inferred extension is explicitly recorded as lower-confidence evidence.

This is intentional hallucination for blocking. It is not presented as measured geometry.

### 7.2 Primitive resolver

Initial mapping:

| Semantic | MotionScene primitive |
|---|---|
| person | `human` |
| television / monitor / window / door | `card` or thin `cube` |
| plant | `sphere` over a narrow `cube` only if compound proxies are enabled; otherwise `cube` |
| furniture / props | `cube` |
| unknown custom label | `cube` |

V1 should prefer one object = one primitive. Compound semantic proxies are a later enhancement.

---

## 8. Room shell

The existing plane detector is retained but upgraded into a deterministic `RoomShellBuilder`.

Input:

- geometry points;
- normals when available;
- detected planes;
- source camera.

Output:

- ground;
- up to four walls;
- optional ceiling only when confidence is high.

Rules:

- ground establishes the scene up vector;
- wall normals are projected to the horizontal plane;
- each wall cube is rotated so its local normal aligns with the detected wall normal;
- wall thickness is a small proxy constant, not copied from measured extent;
- low-confidence walls are omitted, never invented;
- blockout objects are editable; room shell objects are locked by default but can be unlocked in Director.

---

## 9. SAM3D object completion

SAM3D completion exists to improve **hidden volume**, not to replace the blockout with heavy Gaussian assets.

### 9.1 Default state

```text
Completion Provider: None
```

SAM3D is opt-in.

### 9.2 Capability gate

`sam3d_objects` is available only if all checks pass:

```text
platform is Linux
CUDA available
reported VRAM >= 32 GB
sam3d_objects package imports
configured pipeline.yaml exists under an approved model root
required checkpoints exist
```

No runtime package install. No automatic Hugging Face download. No shell command from a frontend value.

### 9.3 Completion policy

```text
off
low_depth_confidence
selected
all_bounded
```

Default: `off`.

`all_bounded` is limited to at most four objects per reconstruction job by default.

### 9.4 SAM3D output usage

For each selected object:

```text
image + SAM3 mask
       ↓
SAM3D Objects
       ↓
full Gaussian object
       ↓
robust completed bounds
       ↓
align to MoGe/VGGT object anchor
       ↓
replace only weak dimensions
       ↓
BlockoutObject
```

The Gaussian is not inserted into MotionScene by default.

The implementation extracts active Gaussian XYZ points, computes robust local bounds, and uses those bounds to improve depth/shape estimates.

Optional debug persistence can write PLY under the managed reconstruction cache, but the production MotionScene remains primitive-based.

### 9.5 Registration rule

Measured geometry wins.

- position stays anchored to MoGe/VGGT;
- visible width/height stay anchored to measured points;
- SAM3D may replace or blend low-confidence depth;
- SAM3D may improve yaw only when the measured yaw confidence is low;
- no SAM3D coordinate frame is trusted as a scene-global frame without deterministic re-registration.

---

## 10. VGGT multi-view / video scan

### 10.1 Product behavior

A new source mode is added under Scene Reconstruction:

```text
Source Mode
Auto
Single Image
Multi-View / Video Scan
```

`Auto` resolves:

- one IMAGE → single image;
- IMAGE batch > 1 → multi-view;
- VIDEO / managed video file → video scan.

### 10.2 Recommended provider

For commercial production, use local `VGGT-1B-Commercial` weights.

VGGT-Ω is supported only behind an explicitly labelled research provider:

```text
vggt_omega_research
```

It must never be the automatic default.

### 10.3 Video sampling

Presets:

| Quality | VGGT geometry views | SAM3 segmentation views |
|---|---:|---:|
| Fast | 12 | 3 |
| Balanced | 24 | 6 |
| High | 48 | 10 |

V1 uses deterministic uniform temporal sampling. More advanced keyframe selection is out of scope.

### 10.4 VGGT evidence

Run VGGT once over sampled views.

Use the official camera pose conversion utilities to obtain OpenCV extrinsics/intrinsics.

Prefer depth unprojection through predicted cameras for fused geometry because the official VGGT documentation notes this generally gives more accurate points than the direct point-map branch.

### 10.5 Coordinate normalization

VGGT world scale and basis are normalized into an OmniCam anchor frame.

The first accepted view is the anchor:

```text
anchor camera position = [0,0,0]
anchor camera forward  = -Z
anchor camera up       = +Y
```

All points and all subsequent camera poses receive the same rigid transform.

No independent per-view axis conversion is allowed.

### 10.6 Scan camera

For video scans, the sampled VGGT camera poses compile into one read-only `Scan Camera` track with keyframes at their original source-frame indices.

This provides Director with a useful 3D path without consuming one MotionScene camera per sampled frame.

For unordered image sets, only the anchor source camera is inserted into `cameras`; the remaining view poses stay in the managed reconstruction evidence manifest.

---

## 11. Multi-view semantic fusion

Running SAM3 on every VGGT frame is wasteful. Only selected segmentation views are processed.

For every SAM3 instance:

1. take the corresponding VGGT depth/world point evidence;
2. extract its object point cloud;
3. transform into the shared anchor world;
4. compute preliminary center/size/yaw;
5. associate it with existing semantic clusters.

Association uses:

```text
same semantic label
AND
normalized center distance < threshold
AND/OR
3D AABB overlap > threshold
```

The merged object cluster accumulates points from multiple sides and therefore provides a much more complete proxy volume than a single image.

This is the preferred way to eliminate hidden-side uncertainty. SAM3D remains optional even in scan mode.

---

## 12. MotionScene compilation

No MotionScene version bump is required for the first implementation because the feature uses existing cameras, objects and additive metadata.

Hierarchy:

```text
Reconstruction Root            null
├── Room Root                  null
│   ├── Ground                 ground
│   ├── Wall 1                 cube
│   └── Wall 2                 cube
├── Blockout Root              null
│   ├── Sofa                   cube
│   ├── Coffee Table           cube
│   ├── Person                 human
│   └── Television             card
└── Reference Root             null
    └── Depth Reference        glb
```

Blockout object metadata:

```json
{
  "reconstruction": {
    "version": 2,
    "role": "blockout_object",
    "semantic": "sofa",
    "provider": "comfy_moge+comfy_sam3",
    "confidence": 0.81,
    "axis_confidence": {
      "width": 0.93,
      "height": 0.88,
      "depth": 0.51,
      "yaw": 0.76
    },
    "completion_provider": "none"
  }
}
```

The `reconstruction.version` metadata may increment independently of `motion_scene.version` because it is additive metadata.

---

## 13. Director UX

### 13.1 Outliner

Example:

```text
▼ Reconstructed Scene
  ▼ Room
    Ground                    HIGH
    Back Wall                 HIGH
    Left Wall                 MEDIUM
  ▼ Blockout
    Sofa                      HIGH
    Coffee Table              HIGH
    Armchair                  MEDIUM
    Floor Lamp                LOW
  ▼ Reference
    Depth Reference           REF
  Source Camera               HIGH
```

### 13.2 Default lock policy

```text
Room shell        locked
Blockout objects  unlocked
Depth reference   locked
```

### 13.3 Reference visibility

`blockout` mode hides the dense reference after adoption.

`hybrid` mode shows the dense reference with the existing neutral/source-texture appearance control.

### 13.4 Inspector

For reconstructed blockout objects show:

- semantic class;
- overall confidence;
- width/height/depth confidence;
- completion provider;
- `Use measured size` / `Reset fitted proxy` actions later, not in V1.

---

## 14. Provider registries

Keep the current geometry provider registry for MoGe and VGGT.

Add separate registries:

```text
reconstruction/segmentation/
    base.py
    comfy_sam3.py
    registry.py

reconstruction/completion/
    base.py
    sam3d_objects.py
    registry.py
```

This avoids pretending a segmentation model and an object-completion model are interchangeable geometry providers.

---

## 15. GPU policy

All out-of-band GPU inference must obey one shared rule:

```text
OmniCam GPU work MUST NOT compete with an executing ComfyUI prompt.
```

Scene Reconstruction should reuse/generalize the existing DPVO contention strategy.

Every GPU stage checks ComfyUI execution before acquiring the stage and at safe boundaries.

If a prompt starts mid-stage and the provider cannot safely preempt inside a forward pass, the stage completes the current atomic forward and cancels before the next GPU stage.

Stable error:

```text
RECON_GPU_CONTENTION
```

No forced thread termination.

---

## 16. Model lifecycle

### MoGe / SAM3

These use native ComfyUI model objects and model management.

Models should be cached by exact checkpoint identity so repeated taxonomy passes do not reload the same checkpoint.

### VGGT

VGGT is an optional Python package. OmniCam never downloads it or its weights.

The provider loads a local checkpoint, runs inference, then returns the model to CPU or releases it according to the configured cache policy.

### SAM3D

SAM3D is never loaded unless completion is requested.

The model lives behind a provider cache and is not imported while capability probing unless the import is explicitly needed.

---

## 17. Cache identity

The reconstruction fingerprint must include every result-affecting model identity.

```text
source fingerprint(s)
source sampling spec
geometry provider + checkpoint identity
segmentation provider + checkpoint identity
completion provider + checkpoint identity
semantic taxonomy
all fit thresholds
quality settings
algorithm version
```

Changing a SAM3 checkpoint, VGGT checkpoint or completion provider must invalidate the relevant cache.

No cache entry may be reused across model identities solely because the provider id stayed constant.

---

## 18. Managed files

```text
ComfyUI/input/majoor_omnicam/reconstruction/<fingerprint>/
├── environment.glb              optional dense reference
├── reconstruction.json          cache manifest
├── asset.json                   reference asset metadata
├── blockout.json                deterministic BlockoutScene artifact
├── scan_evidence.json           VGGT camera/view summary, when applicable
└── completion/                  debug-only when enabled
    └── <object_id>.ply
```

Large masks, full VGGT point maps and tensors are not serialized.

---

## 19. Error catalogue additions

```text
RECON_SEGMENTATION_UNAVAILABLE
RECON_SEGMENTATION_MODEL_MISSING
RECON_SEGMENTATION_FAILED
RECON_NO_INSTANCES
RECON_BLOCKOUT_EMPTY
RECON_VGGT_UNAVAILABLE
RECON_VGGT_MODEL_MISSING
RECON_VGGT_INFERENCE_FAILED
RECON_SAM3D_UNAVAILABLE
RECON_SAM3D_MODEL_MISSING
RECON_SAM3D_INFERENCE_FAILED
RECON_GPU_CONTENTION
RECON_SOURCE_SET_INVALID
RECON_TOO_MANY_VIEWS
```

Errors from the HTTP layer must preserve `{error:{code,message}}` JSON all the way to the frontend.

---

## 20. Performance bounds

Single image / Balanced target:

```text
SAM3 instances       <= 24
fit points/object    <= 20,000
room RANSAC points   <= 50,000
dense reference      <= 120k triangles
```

Multi-view / Balanced target:

```text
VGGT views                 24
SAM3 segmentation views     6
fused fit cloud          <= 500k points
instances before fusion  <= 96
final blockout objects    <= 32
```

SAM3D completion default cap:

```text
0 objects because provider is disabled by default
4 objects maximum when all_bounded is explicitly selected
```

---

## 21. Security and licensing

- No runtime pip/mamba/pixi installation.
- No hidden model download.
- No user-provided arbitrary executable path.
- No unmanaged filesystem path.
- No remote inference server added by this feature.
- SAM3D capability is false when its runtime is unsupported.
- VGGT commercial workflows should select `VGGT-1B-Commercial`.
- VGGT-Ω is labelled research/noncommercial and never auto-selected.
- SAM3D use remains subject to its SAM License and gated checkpoint terms.

---

## 22. Testing strategy

### Pure deterministic tests

No model required:

- masked point extraction;
- robust outlier rejection;
- yaw-only OBB fitting;
- hidden-depth inference;
- primitive mapping;
- room wall orientation;
- multi-view cluster association;
- anchor-frame camera conversion;
- cache fingerprinting;
- MotionScene compile/round-trip.

### Fake providers

Add deterministic fake:

- segmentation provider;
- multi-view provider;
- completion provider.

The complete blockout pipeline must be testable without CUDA.

### Official integration tests

ComfyUI integration lane:

- import native SAM3 classes;
- verify current SAM3 node signature;
- verify native MoGe signature;
- verify checkpoint capability detection without downloading models.

Optional GPU/manual gates:

- real SAM3 segmentation;
- real VGGT scan;
- real SAM3D completion on supported hardware.

---

## 23. Rollout

### Wave A — deterministic blockout core

No SAM3 yet. Build the domain, fitter, room shell and fake evidence tests.

### Wave B — native SAM3 single-image blockout

Deliver useful `MoGe + SAM3 → primitives`.

This is the first production milestone.

### Wave C — hybrid reference and Director UX

Reference hierarchy, confidence inspector, mode persistence.

### Wave D — VGGT commercial multi-view provider

Image batch + video scan, shared anchor world, semantic fusion.

### Wave E — SAM3D optional completion

Only after the blockout path is stable. Non-blocking capability gate.

### Wave F — research providers

VGGT-Ω and future models behind explicit noncommercial/research labels.

---

## 24. Definition of done

The feature is done when:

1. A single room image can create editable closed object proxies and room planes without relying on the MoGe depth mesh as the scene.
2. A camera can orbit at least 90° around the blockout without objects visually opening into holes.
3. Blockout objects remain editable in Director and survive workflow save/reload.
4. Dense reference is optional and can be hidden independently.
5. Scene settings used interactively are the exact settings used by queued graph execution.
6. A video scan can produce a fused blockout and one scan-camera trajectory using VGGT.
7. SAM3D absence never breaks MoGe/SAM3/VGGT paths.
8. SAM3D unsupported hardware produces a clear capability reason rather than an import/runtime crash.
9. Cache keys include exact model identities.
10. All standard Python/frontend/live ComfyUI tests are green.
11. No public node is added.
12. No heavyweight optional model package becomes a base dependency.

---

## 25. Source references checked

Official/current references used to define this design:

- ComfyUI Core `comfy_extras/nodes_moge.py` and `comfy/ldm/moge/model.py`.
- ComfyUI Core `comfy_extras/nodes_sam3.py`.
- ComfyUI official `Image Segmentation (SAM3)` blueprint using `CheckpointLoaderSimple → CLIPTextEncode → SAM3_Detect` and `sam3.1_multiplex_fp16.safetensors`.
- Meta `facebookresearch/sam-3d-objects` README, setup instructions and public inference API.
- Meta/Oxford `facebookresearch/vggt` README, model class and pose conversion utilities.
- Meta/Oxford `facebookresearch/vggt-omega` README and license.
- OmniCam `AGENTS.md` and current Scene Reconstruction code at base commit `e32ec1d`.
