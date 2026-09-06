# Semantic Blockout + SAM3D + VGGT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn OmniCam Scene Reconstruction from a primarily 2.5D MoGe depth mesh into an editable semantic 3D blocking system, add commercial-friendly VGGT multi-view/video scan support, and add SAM 3D Objects as an optional hidden-volume completion provider.

**Architecture:** MoGe/VGGT produce geometric evidence, native ComfyUI SAM3 produces semantic instance masks, deterministic OmniCam fitting converts masked 3D evidence into closed MotionScene primitives, and optional SAM3D Objects improves weak hidden dimensions without becoming the final scene representation. All model-specific code remains behind provider adapters; `OMNICAM_MOTION_SCENE` remains the public interchange contract and the public node surface remains Extractor / Director / Monitor.

**Tech Stack:** Python 3.10+, ComfyUI V3 APIs, native ComfyUI MoGe, native ComfyUI SAM3/SAM3.1, PyTorch, NumPy, optional `vggt`, optional `sam3d_objects`, aiohttp PromptServer routes, Three.js Director frontend, Node/Vite tests, Playwright.

**Spec:** `docs/superpowers/specs/2026-09-06-semantic-blockout-multiview-design.md`

## Global Constraints

- Base implementation target is OmniCam `main` at `e32ec1db1a950b009959df0f5c732affde403f92`; rebase and re-read affected files before coding if `main` moves.
- Read current official ComfyUI source before modifying Python, frontend, routes, packaging or model integration.
- Keep exactly three public product nodes: Extractor, Director, Monitor.
- `OMNICAM_MOTION_SCENE` remains model-agnostic.
- No ComfyUI core patches.
- No runtime `pip`, `mamba`, `pixi` or hidden model downloads.
- No arbitrary filesystem paths or executable paths from frontend payloads.
- Persist assets only under managed ComfyUI input/output/temp roots.
- Hand-written source files stay below 800 lines.
- Dense model tensors, masks and complete point maps never enter MotionScene JSON.
- SAM3D is optional and must fail capability checks cleanly on unsupported systems.
- VGGT commercial workflows default to `VGGT-1B-Commercial`; `VGGT-Ω` is explicitly research/noncommercial and never selected automatically.
- Every interactive setting must survive workflow save/reload and must be the same value used by queued graph execution.
- TDD for every deterministic component; fake providers must make the full pipeline testable without CUDA or model weights.

---

# 0. Upstream contracts that must be re-verified at execution time

Before touching code, the implementing agent must re-open these exact upstream files and compare signatures with the snippets below.

## ComfyUI MoGe

Current source:

```text
Comfy-Org/ComfyUI/comfy_extras/nodes_moge.py
Comfy-Org/ComfyUI/comfy/ldm/moge/model.py
```

Expected call shape:

```python
moge_model.infer(
    image_bchw,
    resolution_level=resolution_level,
    fov_x=fov,
    force_projection=True,
    apply_mask=True,
)
```

## ComfyUI SAM3

Current source:

```text
Comfy-Org/ComfyUI/comfy_extras/nodes_sam3.py
Comfy-Org/ComfyUI/blueprints/Image Segmentation (SAM3).json
Comfy-Org/ComfyUI/nodes.py
```

Expected official blueprint chain:

```text
CheckpointLoaderSimple
  ├─ MODEL ───────────────► SAM3_Detect.model
  └─ CLIP ─► CLIPTextEncode ─► SAM3_Detect.conditioning
```

Current official model example:

```text
sam3.1_multiplex_fp16.safetensors
```

Expected `SAM3_Detect.execute` arguments:

```python
SAM3_Detect.execute(
    model,
    image,
    conditioning=None,
    bboxes=None,
    positive_coords=None,
    negative_coords=None,
    threshold=0.5,
    refine_iterations=2,
    individual_masks=False,
)
```

## VGGT

Current official package:

```text
facebookresearch/vggt
```

Expected model output keys:

```text
pose_enc
depth
depth_conf
world_points
world_points_conf
images
```

Expected pose conversion:

```python
from vggt.utils.pose_enc import pose_encoding_to_extri_intri
extrinsics, intrinsics = pose_encoding_to_extri_intri(
    predictions["pose_enc"],
    images.shape[-2:],
)
```

Extrinsics are OpenCV camera-from-world `[R|t]`.

## SAM 3D Objects

Current official package:

```text
facebookresearch/sam-3d-objects
```

Expected public API:

```python
from inference import Inference
inference = Inference(config_path, compile=False)
output = inference(image, mask, seed=42)
gs = output["gs"]
```

Official baseline requirements currently include Linux 64-bit and >=32 GB NVIDIA VRAM. Do not weaken the capability gate merely to make a machine appear supported.

---

# 1. Target file map

## Existing files to modify

```text
omnicam/nodes/extractor.py
omnicam/reconstruction/settings.py
omnicam/reconstruction/types.py
omnicam/reconstruction/errors.py
omnicam/reconstruction/fingerprint.py
omnicam/reconstruction/cache.py
omnicam/reconstruction/pipeline.py
omnicam/reconstruction/scene_builder.py
omnicam/reconstruction/node_bridge.py
omnicam/reconstruction/capabilities.py
omnicam/reconstruction/jobs/types.py
omnicam/reconstruction/jobs/runner.py
omnicam/reconstruction/jobs/api.py
omnicam/reconstruction/jobs/routes.py
omnicam/comfy_compat/execution.py
omnicam/core/validation.py
web-src/extractor/index.js
web-src/extractor/source-resolver.js
web-src/extractor/reconstruction/state.js
web-src/extractor/reconstruction/controls.js
web-src/extractor/reconstruction/panel.js
web-src/extractor/reconstruction/views.js
web-src/extractor/reconstruction/director-adopt.js
web-src/scene/objects.js
web-src/viewport/resources.js
web-src/scene/outliner.js
web-src/scene/inspector.js
pyproject.toml
.github/workflows/test.yml
README.md
docs/NODES.md
docs/COMPATIBILITY.md
docs/SECURITY.md
```

## New backend files

```text
omnicam/reconstruction/blockout/__init__.py
omnicam/reconstruction/blockout/types.py
omnicam/reconstruction/blockout/masked_points.py
omnicam/reconstruction/blockout/obb.py
omnicam/reconstruction/blockout/primitive_resolver.py
omnicam/reconstruction/blockout/object_fitter.py
omnicam/reconstruction/blockout/room_shell.py
omnicam/reconstruction/blockout/fusion.py
omnicam/reconstruction/blockout/compiler.py

omnicam/reconstruction/segmentation/__init__.py
omnicam/reconstruction/segmentation/base.py
omnicam/reconstruction/segmentation/registry.py
omnicam/reconstruction/segmentation/taxonomy.py
omnicam/reconstruction/segmentation/comfy_sam3.py

omnicam/reconstruction/completion/__init__.py
omnicam/reconstruction/completion/base.py
omnicam/reconstruction/completion/registry.py
omnicam/reconstruction/completion/sam3d_objects.py
omnicam/reconstruction/completion/alignment.py

omnicam/reconstruction/providers/vggt.py
omnicam/reconstruction/providers/vggt_omega.py
omnicam/reconstruction/multiview/__init__.py
omnicam/reconstruction/multiview/types.py
omnicam/reconstruction/multiview/source.py
omnicam/reconstruction/multiview/sampling.py
omnicam/reconstruction/multiview/coordinates.py
omnicam/reconstruction/multiview/camera_track.py

omnicam/reconstruction/model_identity.py
omnicam/reconstruction/model_cache.py
omnicam/reconstruction/gpu_guard.py
```

## New frontend files

```text
web-src/extractor/reconstruction/modes.js
web-src/extractor/reconstruction/taxonomy.js
web-src/extractor/reconstruction/capability-badges.js
web-src/extractor/reconstruction/settings-sync.js
web-src/scene/reconstruction-inspector.js
```

## New tests

```text
tests/reconstruction/test_blockout_masked_points.py
tests/reconstruction/test_blockout_obb.py
tests/reconstruction/test_blockout_object_fitter.py
tests/reconstruction/test_blockout_room_shell.py
tests/reconstruction/test_blockout_compiler.py
tests/reconstruction/test_segmentation_registry.py
tests/reconstruction/test_comfy_sam3_provider.py
tests/reconstruction/test_model_identity.py
tests/reconstruction/test_multiview_coordinates.py
tests/reconstruction/test_multiview_sampling.py
tests/reconstruction/test_vggt_provider.py
tests/reconstruction/test_multiview_fusion.py
tests/reconstruction/test_sam3d_capabilities.py
tests/reconstruction/test_sam3d_alignment.py
tests/reconstruction/test_semantic_pipeline.py
tests/reconstruction/test_scan_pipeline.py
tests/reconstruction/test_gpu_guard.py

tests/frontend/extractor-reconstruction-modes.node.mjs
tests/frontend/extractor-reconstruction-settings.node.mjs
tests/frontend/reconstruction-adopt-blockout.node.mjs
tests/frontend/reconstruction-inspector.node.mjs
```

---

# 2. Delivery order

Do not start with SAM3D.

The implementation order is deliberately:

```text
A. correctness prerequisites
B. deterministic blockout core
C. native SAM3 single-view
D. Director UX + persistence
E. VGGT multi-view/video scan
F. SAM3D optional completion
G. research-only VGGT-Ω adapter
```

The first production-worthy milestone is **C**, not the end of the full plan.

---

## Task 1: Fix Scene Reconstruction correctness prerequisites

**Files:**
- Modify: `omnicam/reconstruction/scene_builder.py`
- Modify: `omnicam/reconstruction/camera.py`
- Modify: `omnicam/reconstruction/pipeline.py`
- Modify: `omnicam/reconstruction/node_bridge.py`
- Test: `tests/reconstruction/test_scene_builder.py`
- Test: `tests/reconstruction/test_pipeline.py`

**Interfaces:**
- Consumes: existing `ReconstructedCamera.fov_x_degrees`, `fov_y_degrees`.
- Produces: correct source canvas dimensions and vertical FOV in canonical `camera.fov`.

- [ ] **Step 1: Write failing FOV regression**

```python
def test_scene_builder_uses_vertical_fov():
    result = _sample_result()
    result.camera.fov_x_degrees = 65.0
    result.camera.fov_y_degrees = 45.0
    scene = build_reconstructed_scene(result, canvas_width=1920, canvas_height=1080)
    assert scene["cameras"][0]["track"]["keyframes"][0]["camera"]["fov"] == 45.0
```

- [ ] **Step 2: Write failing source-aspect regressions**

```python
@pytest.mark.parametrize("width,height", [(1920, 1080), (1080, 1920), (1024, 1024)])
def test_scene_builder_preserves_source_canvas(width, height):
    scene = build_reconstructed_scene(_sample_result(), canvas_width=width, canvas_height=height)
    assert scene["canvas"] == {"width": width, "height": height}
    track = scene["cameras"][0]["track"]
    assert (track["width"], track["height"]) == (width, height)
```

- [ ] **Step 3: Run tests and confirm failure**

```bash
pytest tests/reconstruction/test_scene_builder.py -q
```

- [ ] **Step 4: Patch canonical FOV**

```diff
--- a/omnicam/reconstruction/scene_builder.py
+++ b/omnicam/reconstruction/scene_builder.py
@@
-                    "fov": float(result.camera.fov_x_degrees),
+                    "fov": float(result.camera.fov_y_degrees),
```

- [ ] **Step 5: Carry source dimensions through pipeline output**

Add to `ReconstructionResult` in Task 2 or, for this prerequisite patch, pass dimensions obtained from `GeometryEvidence.image` into `build_reconstructed_scene` explicitly.

```python
def evidence_image_size(evidence: GeometryEvidence) -> tuple[int, int]:
    image = evidence.image
    if isinstance(image, torch.Tensor):
        if image.ndim == 4:
            return int(image.shape[2]), int(image.shape[1])
        if image.ndim == 3:
            return int(image.shape[1]), int(image.shape[0])
    raise ReconInferenceFailedError("Geometry provider returned no source image dimensions")
```

- [ ] **Step 6: Run focused tests**

```bash
pytest tests/reconstruction/test_scene_builder.py tests/reconstruction/test_pipeline.py -q
```

- [ ] **Step 7: Commit**

```bash
git add omnicam/reconstruction tests/reconstruction/test_scene_builder.py tests/reconstruction/test_pipeline.py
git commit -m "fix(reconstruction): preserve source framing"
```

---

## Task 2: Define semantic blockout domain types

**Files:**
- Create: `omnicam/reconstruction/blockout/types.py`
- Modify: `omnicam/reconstruction/types.py`
- Test: `tests/reconstruction/test_blockout_object_fitter.py`

**Interfaces:**
- Produces: `InstanceEvidence`, `AxisConfidence`, `BlockoutObject`, `BlockoutScene`.
- Later tasks must import these types instead of passing unstructured dictionaries.

- [ ] **Step 1: Add failing construction/round-trip tests**

```python
from omnicam.reconstruction.blockout.types import AxisConfidence, BlockoutObject


def test_blockout_object_serializes_bounded_metadata():
    obj = BlockoutObject(
        object_id="chair_1",
        label="Chair",
        semantic_class="chair",
        primitive="cube",
        position=(1.0, 0.5, -3.0),
        rotation=(0.0, 25.0, 0.0),
        size=(0.7, 1.0, 0.7),
        confidence=0.82,
        axis_confidence=AxisConfidence(0.9, 0.9, 0.5, 0.7),
        source_instance_ids=["view0_chair_0"],
    )
    data = obj.to_dict()
    assert data["semantic_class"] == "chair"
    assert data["axis_confidence"]["depth"] == 0.5
```

- [ ] **Step 2: Create types**

```python
from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class InstanceEvidence:
    instance_id: str
    label: str
    score: float
    mask: Any
    bbox_xyxy: tuple[float, float, float, float]
    view_index: int = 0


@dataclass(slots=True)
class AxisConfidence:
    width: float
    height: float
    depth: float
    yaw: float

    def to_dict(self) -> dict[str, float]:
        return {
            "width": float(max(0.0, min(1.0, self.width))),
            "height": float(max(0.0, min(1.0, self.height))),
            "depth": float(max(0.0, min(1.0, self.depth))),
            "yaw": float(max(0.0, min(1.0, self.yaw))),
        }


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
    source_instance_ids: list[str] = field(default_factory=list)
    completion_provider: str = "none"

    def to_dict(self) -> dict[str, Any]:
        return {
            "object_id": self.object_id,
            "label": self.label,
            "semantic_class": self.semantic_class,
            "primitive": self.primitive,
            "position": list(self.position),
            "rotation": list(self.rotation),
            "size": list(self.size),
            "confidence": float(max(0.0, min(1.0, self.confidence))),
            "axis_confidence": self.axis_confidence.to_dict(),
            "source_instance_ids": list(self.source_instance_ids),
            "completion_provider": self.completion_provider,
        }
```

Add `BlockoutScene` with typed fields from the spec; keep model tensors out of it.

- [ ] **Step 3: Run tests**

```bash
pytest tests/reconstruction/test_blockout_object_fitter.py -q
```

- [ ] **Step 4: Commit**

```bash
git add omnicam/reconstruction/blockout omnicam/reconstruction/types.py tests/reconstruction/test_blockout_object_fitter.py
git commit -m "feat(reconstruction): define semantic blockout domain"
```

---

## Task 3: Extend ReconstructionSettings without breaking old workflows

**Files:**
- Modify: `omnicam/reconstruction/settings.py`
- Modify: `omnicam/reconstruction/fingerprint.py`
- Test: `tests/reconstruction/test_types.py`
- Test: `tests/reconstruction/test_fingerprint.py`

**Interfaces:**
- Produces new settings used by all later pipeline tasks.

Add these fields with exact defaults:

```python
source_mode: str = "auto"                # auto | single_image | multi_view
segmentation_provider: str = "comfy_sam3"
completion_provider: str = "none"
sam3_checkpoint: str = "auto"
sam3_threshold: float = 0.55
sam3_refine_iterations: int = 2
semantic_labels: tuple[str, ...] = ()
min_instance_area_ratio: float = 0.0015
instance_iou_dedup: float = 0.72
max_blockout_objects: int = 24
completion_policy: str = "off"
max_completion_objects: int = 4
vggt_checkpoint: str = "auto"
vggt_max_views: int = 24
vggt_segmentation_views: int = 6
save_completion_debug: bool = False
```

Extend `KNOWN_MODES`:

```python
KNOWN_MODES = frozenset({"geometry", "layout", "depth_mesh", "blockout", "hybrid", "scan"})
```

Maintain compatibility:

```python
if mode == "geometry":
    mode = "depth_mesh"
if mode == "layout":
    mode = "hybrid"
```

Do this normalization in a method such as `resolved_mode()` rather than silently rewriting serialized data if existing tests rely on exact values.

Validation bounds:

```text
sam3_threshold             0..1
sam3_refine_iterations     0..5
min_instance_area_ratio    0..0.25
instance_iou_dedup         0..1
max_blockout_objects       1..128
max_completion_objects     0..16
vggt_max_views             2..128
vggt_segmentation_views    1..min(vggt_max_views, 32)
semantic label length      <= 64
semantic labels count      <= 64
```

Fingerprint all result-affecting fields.

Test:

```python
def test_blockout_setting_change_invalidates_fingerprint():
    base = ReconstructionSettings(mode="blockout", sam3_threshold=0.55)
    changed = ReconstructionSettings(mode="blockout", sam3_threshold=0.65)
    assert _fp(base) != _fp(changed)
```

Commit:

```bash
git add omnicam/reconstruction/settings.py omnicam/reconstruction/fingerprint.py tests/reconstruction
git commit -m "feat(reconstruction): add semantic and multiview settings"
```

---

## Task 4: Add exact model identity to cache keys

**Files:**
- Create: `omnicam/reconstruction/model_identity.py`
- Modify: `omnicam/reconstruction/fingerprint.py`
- Modify: `omnicam/reconstruction/cache.py`
- Test: `tests/reconstruction/test_model_identity.py`

**Interfaces:**
- Produces: `ModelIdentity`, `file_model_identity(path, provider_id, adapter_version)`.

- [ ] **Step 1: Write tests**

```python
def test_identity_changes_when_checkpoint_changes(tmp_path):
    path = tmp_path / "model.safetensors"
    path.write_bytes(b"a")
    first = file_model_identity(path, provider_id="comfy_sam3", adapter_version="1")
    path.write_bytes(b"different")
    second = file_model_identity(path, provider_id="comfy_sam3", adapter_version="1")
    assert first.cache_token != second.cache_token
```

- [ ] **Step 2: Implement bounded identity**

Do not hash multi-gigabyte checkpoints every run. Use canonical resolved filename + size + `mtime_ns` + adapter version as the default identity. Allow an optional stronger digest only when already known from a model manifest.

```python
@dataclass(frozen=True, slots=True)
class ModelIdentity:
    provider_id: str
    adapter_version: str
    model_name: str
    file_size: int
    mtime_ns: int
    declared_digest: str = ""

    @property
    def cache_token(self) -> str:
        raw = json.dumps(asdict(self), sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(raw.encode()).hexdigest()[:24]
```

- [ ] **Step 3: Put identity tokens in cache manifest**

Manifest must expose:

```json
"model_identities": {
  "geometry": "...",
  "segmentation": "...",
  "completion": "..."
}
```

- [ ] **Step 4: Run tests and commit**

```bash
pytest tests/reconstruction/test_model_identity.py tests/reconstruction/test_fingerprint.py -q
git add omnicam/reconstruction tests/reconstruction
git commit -m "fix(reconstruction): key cache by exact model identity"
```

---

## Task 5: Extract clean masked 3D object points

**Files:**
- Create: `omnicam/reconstruction/blockout/masked_points.py`
- Test: `tests/reconstruction/test_blockout_masked_points.py`

**Interfaces:**
- Produces: `extract_masked_points(points, mask, *, max_points, erode_pixels, seed) -> np.ndarray`.

Test cases:

```python
def test_masked_points_drop_inf_nan_and_background(): ...
def test_masked_points_are_deterministically_sampled(): ...
def test_mask_erosion_reduces_edge_contamination(): ...
```

Implementation requirements:

```python
def extract_masked_points(points, mask, *, max_points=20_000, erode_pixels=1, seed=0):
    pts = points.detach().cpu().numpy() if torch.is_tensor(points) else np.asarray(points)
    m = mask.detach().cpu().numpy() if torch.is_tensor(mask) else np.asarray(mask)
    m = np.asarray(m > 0.5)
    if erode_pixels > 0:
        m = erode_binary_mask_numpy(m, erode_pixels)
    selected = pts[m]
    selected = selected[np.isfinite(selected).all(axis=1)]
    if len(selected) == 0:
        return np.empty((0, 3), dtype=np.float32)
    center = np.median(selected, axis=0)
    radius = np.linalg.norm(selected - center, axis=1)
    cutoff = np.percentile(radius, 97.5)
    selected = selected[radius <= cutoff]
    if len(selected) > max_points:
        rng = np.random.default_rng(seed)
        selected = selected[rng.choice(len(selected), max_points, replace=False)]
    return selected.astype(np.float32, copy=False)
```

Implement erosion without OpenCV/scipy so no dependency is added. A repeated 3x3 boolean neighborhood reduction is sufficient for 0-3 pixels.

Commit:

```bash
git add omnicam/reconstruction/blockout/masked_points.py tests/reconstruction/test_blockout_masked_points.py
git commit -m "feat(reconstruction): extract robust masked 3d points"
```

---

## Task 6: Implement ground-relative OBB fitting

**Files:**
- Create: `omnicam/reconstruction/blockout/obb.py`
- Test: `tests/reconstruction/test_blockout_obb.py`

**Interfaces:**
- Produces: `RobustObb`, `fit_ground_relative_obb(points, up=(0,1,0))`.

Use yaw-only fitting for normal scene objects. Do not use unconstrained 3D PCA that can tilt a chair or table.

Core algorithm:

```python
@dataclass(slots=True)
class RobustObb:
    center: np.ndarray
    size: np.ndarray
    yaw_degrees: float
    planar_anisotropy: float
    sample_count: int


def fit_ground_relative_obb(points: np.ndarray) -> RobustObb:
    xz = points[:, [0, 2]]
    center2 = np.median(xz, axis=0)
    centered = xz - center2
    cov = np.cov(centered.T)
    values, vectors = np.linalg.eigh(cov)
    order = np.argsort(values)[::-1]
    major = vectors[:, order[0]]
    yaw = math.degrees(math.atan2(major[0], major[1]))
    # rotate XZ into local frame, use 5/95 percentiles for extents
```

Tests must cover:

- axis-aligned cube;
- 30° yaw rectangle;
- noisy outliers;
- near-square object with low yaw confidence.

Commit after green tests.

---

## Task 7: Add semantic primitive resolver and depth priors

**Files:**
- Create: `omnicam/reconstruction/blockout/primitive_resolver.py`
- Test: `tests/reconstruction/test_blockout_object_fitter.py`

**Interfaces:**
- Produces: `PrimitiveRule`, `rule_for_label(label)`.

Use existing MotionScene object types only.

Reference rules:

```python
_RULES = {
    "person": PrimitiveRule("human", min_depth_factor=0.30, snap_to_ground=True),
    "television": PrimitiveRule("card", min_depth_factor=0.04, snap_to_ground=False),
    "monitor": PrimitiveRule("card", min_depth_factor=0.05, snap_to_ground=False),
    "window": PrimitiveRule("card", min_depth_factor=0.02, snap_to_ground=False),
    "door": PrimitiveRule("card", min_depth_factor=0.03, snap_to_ground=True),
    "sofa": PrimitiveRule("cube", min_depth_factor=0.35, snap_to_ground=True),
    "bed": PrimitiveRule("cube", min_depth_factor=0.45, snap_to_ground=True),
    "table": PrimitiveRule("cube", min_depth_factor=0.25, snap_to_ground=True),
    "desk": PrimitiveRule("cube", min_depth_factor=0.25, snap_to_ground=True),
    "chair": PrimitiveRule("cube", min_depth_factor=0.30, snap_to_ground=True),
}
```

Fallback:

```python
PrimitiveRule("cube", min_depth_factor=0.20, snap_to_ground=True)
```

These factors are minimum proxy thickness ratios, not claims of real-world dimensions.

---

## Task 8: Implement deterministic BlockoutObject fitting

**Files:**
- Create: `omnicam/reconstruction/blockout/object_fitter.py`
- Test: `tests/reconstruction/test_blockout_object_fitter.py`

**Interfaces:**
- Consumes: `InstanceEvidence`, geometry points, optional ground plane.
- Produces: `BlockoutObject | None`.

Function signature:

```python
def fit_blockout_object(
    instance: InstanceEvidence,
    points: Any,
    *,
    ground: ReconstructedPlane | None,
    scene_scale: float,
    seed: int | str,
) -> BlockoutObject | None:
```

Rules:

1. extract clean masked points;
2. return `None` below 20 valid samples;
3. fit ground-relative OBB;
4. apply semantic minimum depth;
5. compute axis confidence;
6. snap to ground only if ground confidence >=0.60 and rule allows it;
7. clamp each size component to >=0.01;
8. sanitize id to <=80 chars.

Confidence example:

```python
depth_ratio = min(1.0, observed_depth / max(resolved_depth, 1e-6))
yaw_conf = min(1.0, max(0.0, obb.planar_anisotropy))
axis = AxisConfidence(
    width=min(1.0, instance.score * 1.05),
    height=min(1.0, instance.score * 1.05),
    depth=min(instance.score, depth_ratio),
    yaw=min(instance.score, yaw_conf),
)
overall = 0.25 * (axis.width + axis.height + axis.depth + axis.yaw)
```

Pin exact formula in tests so it does not drift accidentally.

---

## Task 9: Upgrade room planes into a real room shell

**Files:**
- Create: `omnicam/reconstruction/blockout/room_shell.py`
- Modify: `omnicam/reconstruction/planes.py`
- Test: `tests/reconstruction/test_blockout_room_shell.py`

**Interfaces:**
- Produces MotionScene-ready transforms for ground/walls.

Add:

```python
@dataclass(slots=True)
class RoomProxy:
    object_id: str
    primitive: str
    position: tuple[float, float, float]
    rotation: tuple[float, float, float]
    size: tuple[float, float, float]
    confidence: float
```

Ground mapping must be:

```python
size=(plane.size[0], 0.03, plane.size[1])
```

not `(x, z, 1)`.

Wall rotation must derive from `plane.normal`.

Reference helper:

```python
def wall_yaw_from_normal(normal: tuple[float, float, float]) -> float:
    nx, _, nz = normal
    return math.degrees(math.atan2(nx, nz))
```

Test side wall, back wall and 35° wall.

---

## Task 10: Create segmentation provider contracts and fake provider

**Files:**
- Create: `omnicam/reconstruction/segmentation/base.py`
- Create: `omnicam/reconstruction/segmentation/registry.py`
- Create: `omnicam/reconstruction/segmentation/taxonomy.py`
- Create: `omnicam/reconstruction/segmentation/__init__.py`
- Test: `tests/reconstruction/test_segmentation_registry.py`

**Interfaces:**

```python
@dataclass(slots=True)
class SegmentationCapabilities:
    provider_id: str
    available: bool
    reason: str
    checkpoints: list[str]


class SegmentationProvider(Protocol):
    provider_id: str
    def capabilities(self) -> SegmentationCapabilities: ...
    def segment(
        self,
        image: Any,
        labels: list[str],
        settings: ReconstructionSettings,
        *,
        progress: ProgressSink | None = None,
        cancel: CancelToken | None = None,
    ) -> list[InstanceEvidence]: ...
```

Default taxonomy constant:

```python
DEFAULT_BLOCKOUT_LABELS = (
    "person", "chair", "armchair", "sofa", "table", "desk", "bed",
    "cabinet", "shelf", "counter", "door", "window", "television",
    "monitor", "lamp", "plant", "bottle", "box", "suitcase", "car",
)
```

Fake provider must generate deterministic rectangular masks over a fake grid.

---

## Task 11: Implement native ComfyUI SAM3 adapter

**Files:**
- Create: `omnicam/reconstruction/segmentation/comfy_sam3.py`
- Create: `omnicam/reconstruction/model_cache.py`
- Test: `tests/reconstruction/test_comfy_sam3_provider.py`

**Interfaces:**
- Produces: `ComfySam3Provider.segment()`.

### Capability detection

Check lazily:

```python
import comfy_extras.nodes_sam3 as sam3_nodes
import nodes
import folder_paths
```

Checkpoint candidates:

```python
[name for name in folder_paths.get_filename_list("checkpoints") if "sam3" in name.lower()]
```

Prefer exact requested checkpoint. For `auto`, deterministic priority:

```text
sam3.1_multiplex_fp16.safetensors
then lexical order of other sam3 checkpoints
```

### Shared checkpoint load

```python
model, clip, _vae = nodes.CheckpointLoaderSimple().load_checkpoint(checkpoint_name)
```

Cache `(model, clip)` by `ModelIdentity.cache_token` for the duration of the process with capacity 1.

### Text encoding

```python
conditioning = nodes.CLIPTextEncode().encode(clip, label)[0]
```

### Detection

```python
out = sam3_nodes.SAM3_Detect.execute(
    model,
    image,
    conditioning=conditioning,
    threshold=settings.sam3_threshold,
    refine_iterations=settings.sam3_refine_iterations,
    individual_masks=True,
)
```

Create a shared `extract_node_outputs(out)` helper rather than repeating fragile `.args/.outputs/.result` logic.

### Per-label association

Call one label at a time so every returned mask is unambiguously associated with that semantic class.

Deduplicate all instances at the end using mask IoU.

### Test without model

Monkeypatch loader, encoder and detector. Verify:

- model loaded once for 5 labels;
- label encoded once each;
- all masks receive correct semantic label;
- duplicate high-IoU instances collapse to the higher score;
- checkpoint absence returns capability false instead of throwing on module import.

Commit:

```bash
git add omnicam/reconstruction/segmentation omnicam/reconstruction/model_cache.py tests/reconstruction/test_comfy_sam3_provider.py
git commit -m "feat(reconstruction): add native SAM3 semantic segmentation"
```

---

## Task 12: Build `BlockoutScene` compiler

**Files:**
- Create: `omnicam/reconstruction/blockout/compiler.py`
- Modify: `omnicam/reconstruction/scene_builder.py`
- Modify: `omnicam/core/validation.py`
- Test: `tests/reconstruction/test_blockout_compiler.py`

**Interfaces:**
- Consumes: `BlockoutScene`.
- Produces: validated MotionScene v1 dict.

Hierarchy:

```python
reconstruction_root = {
    "id": "reconstruction_root",
    "name": "Reconstructed Scene",
    "type": "null",
    ...
}
room_root = {"id": "reconstruction_room", "parent_id": "reconstruction_root", "type": "null", ...}
blockout_root = {"id": "reconstruction_blockout", "parent_id": "reconstruction_root", "type": "null", ...}
reference_root = {"id": "reconstruction_reference", "parent_id": "reconstruction_root", "type": "null", ...}
```

Blockout object metadata:

```python
"reconstruction": {
    "version": 2,
    "role": "blockout_object",
    "provider": provider_summary,
    "source_kind": source_kind,
    "confidence": obj.confidence,
    "semantic": obj.semantic_class,
    "axis_confidence": obj.axis_confidence.to_dict(),
    "completion_provider": obj.completion_provider,
}
```

`validate_object` currently bounds only some reconstruction fields. Extend it to:

- preserve `semantic` <=64 chars;
- validate `axis_confidence` dictionary values 0..1;
- preserve `completion_provider` <=80 chars.

Do not allow arbitrary nested model output.

---

## Task 13: Split current reconstruction pipeline into mode-specific orchestrators

**Files:**
- Modify: `omnicam/reconstruction/pipeline.py`
- Create: `omnicam/reconstruction/pipelines/__init__.py`
- Create: `omnicam/reconstruction/pipelines/depth_mesh.py`
- Create: `omnicam/reconstruction/pipelines/single_blockout.py`
- Test: `tests/reconstruction/test_semantic_pipeline.py`

If `pipelines/` does not yet exist, create it. Keep `run_reconstruction_pipeline` as a small compatibility facade under 200 lines.

Facade:

```python
def run_reconstruction_pipeline(...):
    mode = settings.resolved_mode()
    if mode == "depth_mesh":
        return run_depth_mesh_pipeline(...)
    if mode in {"blockout", "hybrid"}:
        return run_single_blockout_pipeline(...)
    if mode == "scan":
        return run_scan_pipeline(...)
    raise ReconRequestInvalidError(f"Unsupported reconstruction mode {mode}")
```

Single blockout stage order:

```text
PREPARING
INFER_GEOMETRY
SEGMENT_SCENE
ANALYZE_LAYOUT
FIT_BLOCKOUT
COMPLETE_OBJECTS (only when requested)
BUILD_REFERENCE (hybrid only)
SAVE_ASSETS
FINALIZING
```

Fake-provider end-to-end test:

```python
def test_single_blockout_pipeline_emits_closed_primitives(tmp_path):
    out = run_single_blockout_pipeline(
        source=_image_source(tmp_path),
        settings=ReconstructionSettings(mode="blockout", provider="fake"),
        geometry_provider=FakeReconstructionProvider(...),
        segmentation_provider=FakeSegmentationProvider(...),
        input_root=tmp_path,
    )
    roles = [o.get("reconstruction", {}).get("role") for o in out.motion_scene["objects"]]
    assert "blockout_object" in roles
```

---

## Task 14: Extend reconstruction job state machine for semantic stages

**Files:**
- Modify: `omnicam/reconstruction/jobs/types.py`
- Modify: `omnicam/reconstruction/jobs/runner.py`
- Modify: `web-src/extractor/reconstruction/state.js`
- Test: `tests/reconstruction/test_reconstruction_jobs.py`
- Test: `tests/frontend/extractor-reconstruction-modes.node.mjs`

Add states:

```text
SEGMENT_SCENE
FIT_BLOCKOUT
COMPLETE_OBJECTS
BUILD_REFERENCE
REGISTER_VIEWS
FUSE_VIEWS
```

Preserve existing states for depth mesh.

The frontend `RECONSTRUCTION_STATES` list must exactly mirror backend `STATES`.

Test that every backend state appears in the JS source or expose a machine-readable endpoint used by frontend tests.

---

## Task 15: Persist reconstruction UI settings into ComfyUI widgets

**Files:**
- Modify: `omnicam/nodes/extractor.py`
- Create: `web-src/extractor/reconstruction/settings-sync.js`
- Modify: `web-src/extractor/reconstruction/controls.js`
- Modify: `web-src/extractor/index.js`
- Modify: `omnicam/reconstruction/node_bridge.py`
- Test: `tests/frontend/extractor-reconstruction-settings.node.mjs`
- Test: `tests/reconstruction/test_node_bridge.py` or create equivalent if absent.

The DOM panel must not own authoritative settings.

Add advanced V3 widgets to `MajoorOmniCamExtractor.define_schema`:

```text
recon_mode
recon_source_mode
recon_geometry_provider
recon_segmentation_provider
recon_completion_provider
recon_quality
recon_sam3_checkpoint
recon_sam3_threshold
recon_semantic_labels
recon_max_objects
recon_vggt_checkpoint
recon_vggt_max_views
recon_vggt_segmentation_views
recon_completion_policy
recon_max_completion_objects
recon_source_texture
recon_detect_ground
recon_detect_walls
recon_scene_scale
```

All are advanced; the custom panel mirrors them.

JS helper:

```javascript
export function widgetValue(node, name, fallback) {
  const item = node?.widgets?.find((w) => w.name === name);
  return item ? item.value : fallback;
}

export function setWidgetValue(node, name, value) {
  const item = node?.widgets?.find((w) => w.name === name);
  if (!item || item.value === value) return false;
  item.value = value;
  node.setDirtyCanvas?.(true, true);
  return true;
}
```

On constructor/reload, initialize panel from widgets before rendering.

Queued `execute(...recon_*)` constructs exactly the same `ReconstructionSettings` as interactive start.

Regression:

```text
set hybrid/high/walls=true
save workflow
reload
panel displays hybrid/high/walls=true
queued execution receives hybrid/high/walls=true
```

---

## Task 16: Add Scene Reconstruction mode UX

**Files:**
- Create: `web-src/extractor/reconstruction/modes.js`
- Create: `web-src/extractor/reconstruction/taxonomy.js`
- Modify: `web-src/extractor/reconstruction/views.js`
- Modify: `web-src/extractor/reconstruction/controls.js`
- Test: `tests/frontend/extractor-reconstruction-modes.node.mjs`

UI grouping:

```text
Scene Reconstruction

Result
[ Blockout ▼ ]
  Depth Mesh
  Blockout
  Hybrid
  Scan

Geometry
[ MoGe ▼ ]                 single/hybrid
[ VGGT ▼ ]                 scan

Objects
[ SAM3 ▼ ]
Labels: [ Default interior taxonomy ... ]
Max objects: 24

Completion
[ None ▼ ]
  None
  SAM3D Objects
Policy: Off / Low confidence / Selected / All bounded

Advanced
...
```

Capabilities decide whether options are enabled. Unsupported options stay visible with reason text; do not silently hide them.

---

## Task 17: Improve Director adoption and reconstruction hierarchy

**Files:**
- Modify: `web-src/extractor/reconstruction/director-adopt.js`
- Create: `web-src/scene/reconstruction-inspector.js`
- Modify: `web-src/scene/outliner.js`
- Modify: `web-src/scene/inspector.js`
- Test: `tests/frontend/reconstruction-adopt-blockout.node.mjs`
- Test: `tests/frontend/reconstruction-inspector.node.mjs`

Rules:

- `blockout_object` defaults unlocked.
- `room` and `reference` roles default locked.
- Blockout mode hides dense reference after adoption.
- Hybrid mode keeps it visible.
- Inspector renders semantic + confidence values as text only; never inject metadata through `innerHTML`.

Example inspector model:

```javascript
export function reconstructionInspectorRows(object) {
  const recon = object?.reconstruction;
  if (!recon) return [];
  const axis = recon.axis_confidence || {};
  return [
    ["Semantic", String(recon.semantic || "")],
    ["Confidence", Number(recon.confidence ?? 0).toFixed(2)],
    ["Width", Number(axis.width ?? 0).toFixed(2)],
    ["Height", Number(axis.height ?? 0).toFixed(2)],
    ["Depth", Number(axis.depth ?? 0).toFixed(2)],
    ["Yaw", Number(axis.yaw ?? 0).toFixed(2)],
    ["Completion", String(recon.completion_provider || "none")],
  ];
}
```

---

## Task 18: Fix HTTP result recovery before adding heavier providers

**Files:**
- Modify: `web-src/extractor/reconstruction/panel.js`
- Modify: `omnicam/reconstruction/jobs/routes.py`
- Test: `tests/frontend/extractor-reconstruction-job-client.node.mjs`
- Test: `tests/reconstruction/test_reconstruction_job_routes.py`

After `startJob`:

```javascript
const resp = await this.client.startJob(...);
this.dispatch({ type: "STATE", jobState: resp.state || "PREPARING", jobId: resp.job_id });
if (resp.result) {
  this.acceptResultEnvelope(resp.result);
} else if (resp.state === "DONE") {
  await this.recoverResult(resp.job_id);
}
```

Add `recoverStatus()` for WebSocket gaps.

HTTP errors must preserve JSON codes:

```python
except api.ReconstructionApiError as exc:
    return web.json_response(exc.to_dict(), status=exc.status)
```

Do not throw `web.HTTPBadRequest(text=...)` for catalogued API errors.

---

## Task 19: Add shared reconstruction GPU guard

**Files:**
- Create: `omnicam/reconstruction/gpu_guard.py`
- Modify: `omnicam/reconstruction/jobs/runner.py`
- Reuse: `omnicam/comfy_compat/execution.py`
- Test: `tests/reconstruction/test_gpu_guard.py`

**Interfaces:**

```python
class ReconstructionGpuContentionError(ReconstructionError): ...

@dataclass(slots=True)
class GpuStageGuard:
    execution_probe: Callable[[], bool]
    cancel: CancelToken | None

    def checkpoint(self) -> None: ...
```

Behavior:

```python
def checkpoint(self):
    if self.cancel and self.cancel.is_cancelled():
        raise ReconCancelledError("Reconstruction cancelled")
    if self.execution_probe():
        raise ReconGpuContentionError(
            "Scene reconstruction stopped because a ComfyUI workflow started using the GPU."
        )
```

Call before each atomic provider forward and immediately after it.

Do not kill a running CUDA forward from another thread.

---

# VGGT MULTI-VIEW PHASE

## Task 20: Define MultiViewEvidence and input sampling contract

**Files:**
- Create: `omnicam/reconstruction/multiview/types.py`
- Create: `omnicam/reconstruction/multiview/sampling.py`
- Test: `tests/reconstruction/test_multiview_sampling.py`

Types:

```python
@dataclass(slots=True)
class ViewSample:
    view_index: int
    image: Any
    source_frame: int | None
    width: int
    height: int


@dataclass(slots=True)
class ViewCameraEvidence:
    view_index: int
    width: int
    height: int
    extrinsic_camera_from_world: Any
    intrinsics: Any
    source_frame: int | None = None


@dataclass(slots=True)
class MultiViewEvidence:
    images: Any
    depth: Any
    depth_confidence: Any
    points_world: Any
    point_confidence: Any
    cameras: list[ViewCameraEvidence]
    provider_id: str
    provider_version: str
    coordinate_system: str = "opencv_x_right_y_down_z_forward"
    scale_mode: str = "relative"
```

Uniform sample indices:

```python
def uniform_sample_indices(frame_count: int, max_views: int) -> list[int]:
    if frame_count <= 0:
        return []
    count = min(frame_count, max_views)
    if count == 1:
        return [0]
    return sorted({round(i * (frame_count - 1) / (count - 1)) for i in range(count)})
```

Pin deterministic examples in tests.

---

## Task 21: Support managed image-set and video-scan sources

**Files:**
- Create: `omnicam/reconstruction/multiview/source.py`
- Modify: `omnicam/reconstruction/source.py`
- Reuse: `omnicam/extractor/materialize.py`
- Reuse: PyAV patterns from `omnicam/extractor/preview_frame.py`
- Test: `tests/reconstruction/test_multiview_sampling.py`

Queued IMAGE batch:

- write deterministic PNG views under managed reconstruction input;
- never expose arbitrary path;
- hash pixel bytes + order;
- preserve original dimensions per view.

VIDEO:

- materialize runtime ComfyUI VIDEO using existing `materialize_video_reference` when needed;
- resolve only managed refs;
- sample frames with PyAV;
- decode only selected frames into RGB tensors.

Video extensions whitelist:

```text
.mp4 .mov .mkv .webm .avi
```

Keep image and video resolvers separate internally so image-only security assumptions do not weaken.

---

## Task 22: Implement VGGT provider capability and local model loading

**Files:**
- Create: `omnicam/reconstruction/providers/vggt.py`
- Modify: `omnicam/reconstruction/providers/__init__.py`
- Modify: `omnicam/reconstruction/capabilities.py`
- Test: `tests/reconstruction/test_vggt_provider.py`

No auto-download.

Approved model root:

```text
ComfyUI/models/geometry_estimation/vggt/
```

Recommended layout:

```text
models/geometry_estimation/vggt/
└── VGGT-1B-Commercial/
    └── model.pt
```

Capability false if:

- Python package `vggt` missing;
- checkpoint missing;
- CUDA unavailable when provider is selected.

Provider skeleton:

```python
class VggtProvider:
    provider_id = "vggt"
    adapter_version = "1"

    def reconstruct_views(self, samples, settings, *, progress=None, cancel=None):
        import torch
        from vggt.models.vggt import VGGT
        from vggt.utils.pose_enc import pose_encoding_to_extri_intri

        checkpoint = self.resolve_checkpoint(settings.vggt_checkpoint)
        model = VGGT().eval()
        state = torch.load(checkpoint, map_location="cpu", weights_only=True)
        model.load_state_dict(state, strict=True)
        device = torch.device("cuda")
        dtype = torch.bfloat16 if torch.cuda.get_device_capability()[0] >= 8 else torch.float16
        images = self.preprocess_samples(samples).to(device)
        model = model.to(device)
        with torch.inference_mode(), torch.autocast("cuda", dtype=dtype):
            predictions = model(images)
        extrinsics, intrinsics = pose_encoding_to_extri_intri(
            predictions["pose_enc"], images.shape[-2:]
        )
        ...
```

Do not use `VGGT.from_pretrained()` because it can download from Hugging Face.

If the commercial checkpoint file is wrapped differently from a raw state dict, detect the exact official format at implementation time and pin a fixture/test around the loader.

After inference move model to CPU or release it before returning.

---

## Task 23: Normalize VGGT cameras and points into OmniCam anchor coordinates

**Files:**
- Create: `omnicam/reconstruction/multiview/coordinates.py`
- Test: `tests/reconstruction/test_multiview_coordinates.py`

**Interfaces:**
- Produces `normalize_vggt_evidence(evidence) -> MultiViewEvidence` with OmniCam coordinates.

Do not convert every camera independently.

Use one global anchor transform derived from view 0.

OpenCV camera 0:

```text
x right
y down
z forward
```

OmniCam anchor:

```text
x right
y up
z backward
```

Axis flip:

```python
CV_TO_OMNICAM = np.diag([1.0, -1.0, -1.0, 1.0])
```

The test must prove:

- anchor camera position becomes `(0,0,0)`;
- anchor forward maps to OmniCam `-Z`;
- a second camera translated right remains right;
- all transformed point clouds and camera positions share the same rigid transform;
- no reflection mismatch in yaw/orbit direction.

Do the algebra in one helper and compare to a simple synthetic two-camera case.

---

## Task 24: Prefer VGGT depth-unprojection geometry

**Files:**
- Modify: `omnicam/reconstruction/providers/vggt.py`
- Test: `tests/reconstruction/test_vggt_provider.py`

The official VGGT README says depth unprojected with predicted cameras is generally more accurate than the direct point-map branch.

Use official helper when present:

```python
from vggt.utils.geometry import unproject_depth_map_to_point_map
points = unproject_depth_map_to_point_map(
    predictions["depth"].squeeze(0),
    extrinsics.squeeze(0),
    intrinsics.squeeze(0),
)
```

Filter using confidence.

Balanced default:

```python
confidence_floor = torch.quantile(depth_confidence.float(), 0.25)
valid = torch.isfinite(points).all(dim=-1) & (depth_confidence >= confidence_floor)
```

Do not serialize the full points. Keep them transient.

---

## Task 25: Build scan camera track from VGGT video poses

**Files:**
- Create: `omnicam/reconstruction/multiview/camera_track.py`
- Test: `tests/reconstruction/test_multiview_coordinates.py`

Function:

```python
def build_scan_camera_track(
    cameras: list[ViewCameraEvidence],
    *,
    fps: float,
    duration_frames: int,
    width: int,
    height: int,
) -> dict[str, Any]:
```

Each sampled view with a `source_frame` becomes a camera keyframe.

Use vertical FOV:

```python
fov_y = math.degrees(2.0 * math.atan((height * 0.5) / fy))
```

Target is derived from camera forward direction:

```python
target = position + forward
```

Do not insert one MotionScene camera per sample.

---

## Task 26: Run SAM3 only on selected multiview key views

**Files:**
- Modify: `omnicam/reconstruction/multiview/sampling.py`
- Modify: `omnicam/reconstruction/pipelines/scan.py`
- Test: `tests/reconstruction/test_scan_pipeline.py`

Select segmentation views uniformly from geometry view indices:

```python
def choose_segmentation_views(total_views, count):
    return uniform_sample_indices(total_views, min(total_views, count))
```

Balanced:

```text
VGGT views = 24
SAM3 views = 6
```

Do not run SAM3 24 times unless High/custom explicitly requests it.

---

## Task 27: Fuse same semantic objects across views

**Files:**
- Create: `omnicam/reconstruction/blockout/fusion.py`
- Test: `tests/reconstruction/test_multiview_fusion.py`

Each candidate has:

```text
semantic label
world-space point cloud
center
size
yaw
score
view index
```

Association gate:

```python
same_label = a.label == b.label
scale = max(np.linalg.norm(a.size), np.linalg.norm(b.size), 1e-3)
center_distance = np.linalg.norm(a.center - b.center) / scale
match = same_label and center_distance <= 1.25
```

When AABB overlap is measurable, accept high-overlap matches even if center distance is slightly larger:

```text
3D IoU >= 0.10
```

Use deterministic greedy matching sorted by descending score then view index.

Merge raw points from matched instances, cap cluster points at 40k, then refit one OBB.

Test two chairs of same label at different world positions do not collapse.

---

## Task 28: Implement `scan` pipeline

**Files:**
- Create: `omnicam/reconstruction/pipelines/scan.py`
- Modify: `omnicam/reconstruction/pipeline.py`
- Test: `tests/reconstruction/test_scan_pipeline.py`

Stage sequence:

```text
PREPARING
REGISTER_VIEWS       load/sample source
INFER_GEOMETRY       VGGT
SEGMENT_SCENE        selected SAM3 views
FUSE_VIEWS           associate instances
ANALYZE_LAYOUT       room shell
FIT_BLOCKOUT         closed proxies
COMPLETE_OBJECTS     optional SAM3D
BUILD_REFERENCE      optional anchor reference
SAVE_ASSETS
FINALIZING
```

Fake end-to-end test must assert:

- two views of same chair produce one blockout chair;
- two physical chairs remain two objects;
- scan camera track keyframes preserve sampled source frames;
- output MotionScene validates.

---

# SAM3D OBJECT COMPLETION PHASE

## Task 29: Define completion provider contract and fake provider

**Files:**
- Create: `omnicam/reconstruction/completion/base.py`
- Create: `omnicam/reconstruction/completion/registry.py`
- Create: `omnicam/reconstruction/completion/__init__.py`
- Test: `tests/reconstruction/test_sam3d_alignment.py`

Interfaces:

```python
@dataclass(slots=True)
class CompletedObjectEvidence:
    points_local: Any
    confidence: float
    provider_id: str
    provider_version: str


class CompletionProvider(Protocol):
    provider_id: str
    def capabilities(self) -> CompletionCapabilities: ...
    def complete(
        self,
        image: Any,
        mask: Any,
        *,
        seed: int,
        cancel: CancelToken | None = None,
    ) -> CompletedObjectEvidence: ...
```

Fake provider returns a complete rectangular point cloud whose hidden depth is known.

---

## Task 30: Implement SAM3D capability gate

**Files:**
- Create: `omnicam/reconstruction/completion/sam3d_objects.py`
- Test: `tests/reconstruction/test_sam3d_capabilities.py`

Exact checks:

```python
def capabilities(self):
    if platform.system() != "Linux":
        return unavailable("SAM3D Objects official runtime currently requires Linux 64-bit")
    if not torch.cuda.is_available():
        return unavailable("SAM3D Objects requires an NVIDIA CUDA GPU")
    total_gb = torch.cuda.get_device_properties(0).total_memory / 1024**3
    if total_gb < 32.0:
        return unavailable(f"SAM3D Objects official baseline requires >=32 GB VRAM; detected {total_gb:.1f} GB")
    if importlib.util.find_spec("sam3d_objects") is None:
        return unavailable("sam3d_objects Python package is not installed")
    config = self.resolve_pipeline_config()
    if config is None:
        return unavailable("SAM3D Objects pipeline.yaml/checkpoints were not found in models/sam3d_objects")
    return available(...)
```

Do not add a 24 GB override. If future official guidance proves a lower-memory mode, add it in a separately reviewed change.

Approved model root:

```text
ComfyUI/models/sam3d_objects/
```

No arbitrary config path from HTTP/DOM.

---

## Task 31: Implement SAM3D inference adapter

**Files:**
- Modify: `omnicam/reconstruction/completion/sam3d_objects.py`
- Test: `tests/reconstruction/test_sam3d_capabilities.py`

Import official public API lazily.

Because the official quick-start exposes `notebook/inference.py`, isolate import compatibility in one private method.

```python
def _load_inference_class(self):
    # First support an installed package exposing the public Inference class.
    try:
        from sam3d_objects.inference import Inference
        return Inference
    except ImportError:
        pass
    # If the official package layout exposes notebook.inference in the installed environment,
    # import that exact documented public wrapper. Never mutate sys.path from an HTTP value.
    from inference import Inference
    return Inference
```

At execution time re-check actual installed package layout and change only this adapter.

Inference:

```python
engine = self._engine_cache.get_or_load(config_identity, lambda: Inference(str(config), compile=False))
output = engine(image_np, mask_np, seed=seed)
gs = output["gs"]
xyz = gs.get_xyz.detach().float().cpu()
opacity = gs.get_opacity.detach().float().cpu().squeeze(-1)
points = xyz[opacity > 0.5]
```

If `get_xyz/get_opacity` names differ in current official code, adapt here and pin an integration test.

Do not save PLY unless debug persistence is enabled.

---

## Task 32: Align SAM3D completion to measured OmniCam geometry

**Files:**
- Create: `omnicam/reconstruction/completion/alignment.py`
- Modify: `omnicam/reconstruction/blockout/object_fitter.py`
- Test: `tests/reconstruction/test_sam3d_alignment.py`

Function:

```python
def merge_completion_into_blockout(
    blockout: BlockoutObject,
    measured_points: np.ndarray,
    completed_points: np.ndarray,
) -> BlockoutObject:
```

Rules:

1. fit robust OBB to completed local points;
2. keep measured world center;
3. keep measured width if width confidence >=0.65;
4. keep measured height if height confidence >=0.65;
5. replace depth with aligned completion depth only when depth confidence <0.65;
6. keep measured yaw if yaw confidence >=0.65;
7. set `completion_provider="sam3d_objects"`;
8. raise depth/yaw confidence only to a bounded value <=0.80 because completion is generated, not measured.

Regression:

```python
def test_completion_only_replaces_low_confidence_depth():
    before = _blockout(depth_conf=0.30, width_conf=0.90)
    after = merge_completion_into_blockout(before, measured_points, completed_box_points)
    assert after.size[0] == pytest.approx(before.size[0])
    assert after.size[2] > before.size[2]
    assert after.axis_confidence.depth <= 0.80
```

---

## Task 33: Add bounded completion policy to pipelines

**Files:**
- Modify: `omnicam/reconstruction/pipelines/single_blockout.py`
- Modify: `omnicam/reconstruction/pipelines/scan.py`
- Test: `tests/reconstruction/test_semantic_pipeline.py`
- Test: `tests/reconstruction/test_scan_pipeline.py`

Selection:

```python
def select_completion_objects(objects, settings):
    if settings.completion_policy == "off":
        return []
    if settings.completion_policy == "low_depth_confidence":
        candidates = [o for o in objects if o.axis_confidence.depth < 0.55]
    elif settings.completion_policy == "all_bounded":
        candidates = list(objects)
    else:
        candidates = []  # selected is UI-driven and uses explicit ids when that UI exists
    return sorted(candidates, key=lambda o: o.axis_confidence.depth)[:settings.max_completion_objects]
```

`selected` can be accepted only if `completion_object_ids` is explicitly provided and validated. Do not infer DOM selection from global frontend state in backend jobs.

---

# RESEARCH-ONLY VGGT-Ω PHASE

## Task 34: Add explicit research-only VGGT-Ω adapter

**Files:**
- Create: `omnicam/reconstruction/providers/vggt_omega.py`
- Modify: `omnicam/reconstruction/capabilities.py`
- Modify: `web-src/extractor/reconstruction/capability-badges.js`
- Test: `tests/reconstruction/test_vggt_provider.py`

Provider id:

```text
vggt_omega_research
```

Capability metadata must include:

```json
{
  "commercial_use": false,
  "license_label": "FAIR Noncommercial Research License",
  "auto_select": false
}
```

Frontend renders:

```text
VGGT-Ω — Research / noncommercial
```

Do not fall back from commercial VGGT to Ω automatically.

The August 18, 2026 benchmark contamination notice affects benchmark interpretation, not the provider's basic downstream operation; document it in compatibility notes without using it as an availability failure.

---

# CACHE / ASSET / JOB HARDENING

## Task 35: Persist `blockout.json` and scan evidence

**Files:**
- Modify: `omnicam/reconstruction/asset_writer.py`
- Modify: `omnicam/reconstruction/cache.py`
- Test: `tests/reconstruction/test_cache.py`

Write:

```text
<fingerprint>/blockout.json
<fingerprint>/scan_evidence.json   only for scan
```

`blockout.json` contains deterministic light data only:

```json
{
  "version": 1,
  "objects": [...],
  "room": [...],
  "source_camera": {...},
  "provider_summary": {...}
}
```

`scan_evidence.json` contains sampled frame numbers + camera matrices/FOV summaries, capped to `vggt_max_views`; no depth tensors or masks.

Atomic write pattern:

```python
tmp = path.with_suffix(path.suffix + ".tmp")
tmp.write_text(json.dumps(data, ...), encoding="utf-8")
tmp.replace(path)
```

---

## Task 36: Fix job admission/history limits

**Files:**
- Modify: `omnicam/reconstruction/jobs/manager.py`
- Test: `tests/reconstruction/test_reconstruction_jobs.py`

Do not count terminal history as active capacity.

Reference policy:

```python
DEFAULT_MAX_ACTIVE_OR_PENDING = 4
DEFAULT_MAX_HISTORY = 16
```

Before admitting:

```python
active = [j for j in self._jobs.values() if j.state not in TERMINAL_STATES]
if len(active) >= self._max_active_or_pending:
    raise JobLimitReachedError(...)
self._evict_terminal_history_locked(self._max_history)
```

Keep GPU semaphore at 1.

---

# CI / VERIFICATION

## Task 37: Split Python CI by dependency class

**Files:**
- Modify: `.github/workflows/test.yml`
- Modify: `pyproject.toml`

Targets:

```text
python-core
  tests excluding torch/aiohttp/comfy-specific model adapters
  ruff
  mypy

python-reconstruction
  torch CPU
  pillow
  aiohttp
  fake provider / deterministic reconstruction tests

comfyui-integration
  real ComfyUI checkout
  V3 node imports
  SAM3/MoGe signature smoke
  no model weights

frontend
  build/check/unit/browser

live ComfyUI
  existing live-ci + VueNodes
```

Add pure reconstruction modules to mypy:

```text
omnicam/reconstruction/settings.py
omnicam/reconstruction/types.py
omnicam/reconstruction/model_identity.py
omnicam/reconstruction/blockout/types.py
omnicam/reconstruction/blockout/obb.py
omnicam/reconstruction/blockout/primitive_resolver.py
omnicam/reconstruction/multiview/types.py
omnicam/reconstruction/multiview/coordinates.py
```

Do not mypy the dynamic upstream adapters unless practical.

---

## Task 38: Add official API smoke assertions

**Files:**
- Modify: `scripts/comfy_integration_smoke.py`

Assert without loading weights:

```python
from comfy_extras import nodes_moge, nodes_sam3
import nodes

assert hasattr(nodes_moge, "MoGeInference")
assert hasattr(nodes_sam3, "SAM3_Detect")
assert hasattr(nodes, "CheckpointLoaderSimple")
assert hasattr(nodes, "CLIPTextEncode")
```

Inspect function signatures and fail CI if mandatory parameters disappear:

```python
import inspect
sam3_sig = inspect.signature(nodes_sam3.SAM3_Detect.execute)
for name in ("model", "image", "conditioning", "threshold", "refine_iterations", "individual_masks"):
    assert name in sam3_sig.parameters
```

Do the same for MoGe.

---

## Task 39: Frontend live regression

**Files:**
- Modify/add Playwright specs under existing frontend test layout.

Cases:

```text
1. Load Image → Scene Reconstruct → Blockout mode visible.
2. Reload workflow → same reconstruction mode/settings restored.
3. Unsupported SAM3D shows reason and cannot run completion.
4. Cached DONE result still enables Open in Director without receiving WebSocket done.
5. Adopt blockout → hierarchy appears in Director.
6. Blockout object unlocked; reference mesh locked.
7. Scan mode with Load Video resolves as a valid source.
```

No actual VGGT/SAM3D weights required in browser CI; stub capability/result endpoints.

---

# DOCUMENTATION / PRODUCT FINISH

## Task 40: Update docs

**Files:**
- Modify: `README.md`
- Modify: `docs/NODES.md`
- Modify: `docs/COMPATIBILITY.md`
- Modify: `docs/SECURITY.md`

README positioning:

```text
Scene Reconstruct
- Depth Mesh: visible-surface MoGe reference.
- Blockout: MoGe + SAM3 → closed editable primitives.
- Hybrid: blockout plus dense reference.
- Scan: VGGT multi-view/video scene blocking.
```

Compatibility must clearly state:

- native SAM3 checkpoint requirement;
- VGGT package/checkpoint is optional/manual;
- `VGGT-1B-Commercial` recommended for commercial use;
- VGGT-Ω research/noncommercial;
- SAM3D official baseline Linux + >=32 GB VRAM and gated model access;
- SAM3D absence does not affect standard OmniCam operation.

Security must document:

- managed model roots;
- no runtime installation/download;
- video source extension/size limits;
- generated scan manifests contain camera metadata but no source image pixels unless explicitly saved as managed reference assets.

---

# 3. Reference patch: settings

The final implementation may differ slightly after rebase, but the resulting settings contract must be equivalent to this patch.

```diff
--- a/omnicam/reconstruction/settings.py
+++ b/omnicam/reconstruction/settings.py
@@
-KNOWN_MODES = frozenset({"geometry", "layout"})
+KNOWN_MODES = frozenset({"geometry", "layout", "depth_mesh", "blockout", "hybrid", "scan"})
+KNOWN_SOURCE_MODES = frozenset({"auto", "single_image", "multi_view"})
+KNOWN_SEGMENTATION_PROVIDERS = frozenset({"none", "comfy_sam3", "fake"})
+KNOWN_COMPLETION_PROVIDERS = frozenset({"none", "sam3d_objects", "fake"})
+KNOWN_COMPLETION_POLICIES = frozenset({"off", "low_depth_confidence", "selected", "all_bounded"})
@@
 class ReconstructionSettings:
     provider: str = "comfy_moge"
-    mode: str = "geometry"
+    mode: str = "blockout"
     quality: str = "balanced"
+    source_mode: str = "auto"
+    segmentation_provider: str = "comfy_sam3"
+    completion_provider: str = "none"
+    sam3_checkpoint: str = "auto"
+    sam3_threshold: float = 0.55
+    sam3_refine_iterations: int = 2
+    semantic_labels: tuple[str, ...] = ()
+    min_instance_area_ratio: float = 0.0015
+    instance_iou_dedup: float = 0.72
+    max_blockout_objects: int = 24
+    completion_policy: str = "off"
+    max_completion_objects: int = 4
+    vggt_checkpoint: str = "auto"
+    vggt_max_views: int = 24
+    vggt_segmentation_views: int = 6
+    save_completion_debug: bool = False
```

Do not switch the user-facing default to blockout until SAM3 capability-aware fallback is implemented. If SAM3 is missing, UI may default visually to blockout but the run button must explain the missing checkpoint and offer Depth Mesh; queued execution must not silently change the requested mode.

---

# 4. Reference patch: provider orchestration

```python
# omnicam/reconstruction/pipelines/single_blockout.py

def run_single_blockout_pipeline(
    *,
    source,
    settings,
    geometry_provider,
    segmentation_provider,
    completion_provider=None,
    progress=None,
    cancel=None,
    input_root=None,
):
    evidence = geometry_provider.reconstruct(
        source=source,
        settings=settings,
        progress=_subprogress(progress, "INFER_GEOMETRY", 0.08, 0.36),
        cancel=cancel,
    )

    image = evidence.image
    labels = resolve_semantic_labels(settings.semantic_labels)
    instances = segmentation_provider.segment(
        image,
        labels,
        settings,
        progress=_subprogress(progress, "SEGMENT_SCENE", 0.36, 0.56),
        cancel=cancel,
    )

    planes = scale_planes(
        detect_planes(evidence, settings, seed="blockout"),
        settings.scene_scale,
    )
    ground = next((p for p in planes if p.plane_type == "ground"), None)

    objects = []
    for instance in instances:
        obj = fit_blockout_object(
            instance,
            evidence.points,
            ground=ground,
            scene_scale=settings.scene_scale,
            seed=instance.instance_id,
        )
        if obj is not None:
            objects.append(obj)
    objects = sorted(objects, key=lambda o: o.confidence, reverse=True)[: settings.max_blockout_objects]

    if completion_provider is not None:
        objects = complete_selected_objects(...)

    reference_asset = None
    if settings.resolved_mode() == "hybrid":
        reference_asset = build_and_save_reference_mesh(...)

    blockout = BlockoutScene(
        objects=objects,
        room_planes=planes,
        source_camera=reconstruct_camera_from_evidence(evidence, settings),
        scan_camera_track=None,
        reference_asset=reference_asset,
        provider_summary=build_provider_summary(...),
        warnings=list(evidence.warnings),
    )
    motion_scene = compile_blockout_scene(blockout, ...)
    return PipelineOutput(...)
```

The real patch must not use ellipsis; the task implementation defines each referenced helper before calling it.

---

# 5. Reference patch: native SAM3 adapter

```python
# omnicam/reconstruction/segmentation/comfy_sam3.py

class ComfySam3Provider:
    provider_id = "comfy_sam3"
    adapter_version = "1"

    def segment(self, image, labels, settings, *, progress=None, cancel=None):
        sam3_nodes, core_nodes = self._modules_or_raise()
        checkpoint = self.resolve_checkpoint(settings.sam3_checkpoint)
        identity = self.checkpoint_identity(checkpoint)
        model, clip = self._model_cache.get_or_load(
            identity.cache_token,
            lambda: core_nodes.CheckpointLoaderSimple().load_checkpoint(checkpoint)[:2],
        )

        instances = []
        for label_index, label in enumerate(labels):
            if cancel and cancel.is_cancelled():
                raise ReconCancelledError("Segmentation cancelled")
            conditioning = core_nodes.CLIPTextEncode().encode(clip, label)[0]
            output = sam3_nodes.SAM3_Detect.execute(
                model,
                image,
                conditioning=conditioning,
                threshold=settings.sam3_threshold,
                refine_iterations=settings.sam3_refine_iterations,
                individual_masks=True,
            )
            masks, boxes = extract_node_outputs(output, expected=2)
            instances.extend(
                instances_from_sam3_output(
                    label=label,
                    label_index=label_index,
                    masks=masks,
                    boxes=boxes,
                    min_area_ratio=settings.min_instance_area_ratio,
                )
            )
            if progress:
                progress("SEGMENT_SCENE", (label_index + 1) / max(1, len(labels)), f"Detecting {label}")

        return deduplicate_instances(instances, iou_threshold=settings.instance_iou_dedup)
```

---

# 6. Reference patch: VGGT provider

```python
# omnicam/reconstruction/providers/vggt.py

class VggtProvider:
    provider_id = "vggt"
    adapter_version = "1"

    def reconstruct_views(self, samples, settings, *, progress=None, cancel=None):
        checkpoint = self.resolve_checkpoint(settings.vggt_checkpoint)
        self._guard_supported_runtime()

        import torch
        from vggt.models.vggt import VGGT
        from vggt.utils.pose_enc import pose_encoding_to_extri_intri
        from vggt.utils.geometry import unproject_depth_map_to_point_map

        model = self._load_model_cpu(VGGT, checkpoint)
        images = preprocess_vggt_samples(samples)
        device = torch.device("cuda")
        dtype = torch.bfloat16 if torch.cuda.get_device_capability()[0] >= 8 else torch.float16

        if cancel and cancel.is_cancelled():
            raise ReconCancelledError("VGGT scan cancelled")

        model = model.to(device).eval()
        images_gpu = images.to(device)
        try:
            with torch.inference_mode(), torch.autocast("cuda", dtype=dtype):
                pred = model(images_gpu)
            extr, intr = pose_encoding_to_extri_intri(pred["pose_enc"], images_gpu.shape[-2:])
            points = unproject_depth_map_to_point_map(
                pred["depth"].squeeze(0),
                extr.squeeze(0),
                intr.squeeze(0),
            )
            return multiview_evidence_from_vggt(samples, pred, points, extr, intr, checkpoint)
        finally:
            model.to("cpu")
            del images_gpu
            torch.cuda.empty_cache()
```

If current VGGT package exposes different checkpoint wrappers, keep the discrepancy inside `_load_model_cpu`.

---

# 7. Reference patch: SAM3D completion provider

```python
# omnicam/reconstruction/completion/sam3d_objects.py

class Sam3dObjectsCompletionProvider:
    provider_id = "sam3d_objects"
    adapter_version = "1"

    def complete(self, image, mask, *, seed, cancel=None):
        caps = self.capabilities()
        if not caps.available:
            raise ReconSam3dUnavailableError(caps.reason)
        if cancel and cancel.is_cancelled():
            raise ReconCancelledError("SAM3D completion cancelled")

        Inference = self._load_inference_class()
        config = self.resolve_pipeline_config()
        engine = self._cache.get_or_load(
            self.config_identity(config).cache_token,
            lambda: Inference(str(config), compile=False),
        )
        image_np = image_tensor_to_uint8_numpy(image)
        mask_np = mask_tensor_to_bool_numpy(mask)
        output = engine(image_np, mask_np, seed=int(seed))
        gs = output["gs"]
        points = active_gaussian_points(gs, opacity_threshold=0.5)
        if len(points) < 32:
            raise ReconSam3dInferenceFailedError("SAM3D returned too little usable object geometry")
        return CompletedObjectEvidence(
            points_local=points,
            confidence=0.75,
            provider_id=self.provider_id,
            provider_version=self.adapter_version,
        )
```

---

# 8. Performance acceptance gates

## Single image / Balanced

The feature passes performance QA when:

```text
final objects              <= 24
fit points / object        <= 20k
room RANSAC points         <= 50k
dense reference            <= 120k triangles
Director adoption           < 250 ms excluding GLB network/file load
scrubbing after adoption    remains interactive
```

## Scan / Balanced

```text
VGGT views                 24
SAM3 views                  6
final objects              <= 32
fused point reservoir      <= 500k
MotionScene JSON           < existing 2 MB validator limit
```

Do not raise MotionScene `max_state_bytes` to accommodate model evidence. Evidence belongs in managed files, not the scene document.

---

# 9. Manual VFX QA matrix

Use at least these source types:

```text
A. interior living room, wide lens
B. bedroom, frontal furniture
C. product on table, shallow depth of field
D. office with many chairs/monitors
E. portrait 9:16 room image
F. scan video walking around a table/object
G. scan video with repeated same-class objects
```

For each single-image source:

- verify source camera framing against original image;
- toggle depth reference and blockout independently;
- orbit 30°, 60°, 90° from source axis;
- verify no blockout object opens into a hole;
- inspect object scale/yaw;
- unlock/move/scale object;
- save workflow;
- reload workflow;
- queue graph and compare settings/result mode.

For scan:

- verify scan camera path direction;
- verify repeated semantic objects do not collapse incorrectly;
- verify objects seen from multiple sides have stronger depth confidence;
- verify changing `vggt_max_views` invalidates cache;
- verify ComfyUI workflow execution and reconstruction do not run GPU stages concurrently.

For SAM3D on supported hardware:

- pick a frontal object with low visible depth;
- compare blockout before/after completion;
- visible width/height must stay stable;
- hidden depth may improve;
- removing SAM3D package must leave Blockout and Scan modes operational.

---

# 10. Full verification commands before merge

Run from repository root:

```bash
python -m pytest tests/reconstruction -q
python -m pytest tests/test_validation.py tests/test_schemas.py -q
ruff check .
mypy
npm ci
npm run build
npm run check
npm run test:unit
npm run test:browser
python scripts/verify_package.py
```

Then live ComfyUI integration using the repository's existing test harness:

```bash
npm run test:live
```

Run both standard and VueNodes-enabled live specs according to the current CI environment.

Optional provider tests are explicit manual/integration jobs, never silently skipped while claiming model certification:

```text
SAM3 real checkpoint        manual GPU gate
VGGT commercial checkpoint manual GPU gate
SAM3D Objects              supported Linux >=32GB gate
VGGT-Ω                     research-only gate
```

---

# 11. Merge / PR strategy

Do not deliver the entire plan as one giant PR.

Recommended reviewable PR sequence:

```text
PR 1  reconstruction correctness + settings persistence + cache identity
PR 2  deterministic Blockout core + room shell + fake providers
PR 3  native SAM3 single-image Blockout
PR 4  Director Blockout UX + HTTP recovery + GPU guard
PR 5  VGGT source sampling + provider + coordinates
PR 6  multi-view semantic fusion + Scan mode
PR 7  SAM3D optional completion
PR 8  VGGT-Ω research provider + final docs/compatibility
```

Every PR must leave all previously supported modes functional.

---

# 12. Definition of done

Implementation is complete only when all of the following are true:

- [ ] `Depth Mesh` still reproduces existing MoGe behavior.
- [ ] `Blockout` uses MoGe + SAM3 and outputs closed editable primitives.
- [ ] `Hybrid` outputs those primitives plus an independently toggleable dense reference.
- [ ] A 90° Director orbit no longer exposes holes in the *blocking objects* because they are closed primitives.
- [ ] Source aspect ratio and vertical FOV are correct.
- [ ] Ground dimensions map XZ→XZ and walls honor their normals.
- [ ] SAM3 uses the current native ComfyUI API and does not add a duplicate segmentation dependency.
- [ ] SAM3 checkpoint identity participates in the reconstruction cache key.
- [ ] Interactive and queued settings are identical and survive reload.
- [ ] `Scan` accepts IMAGE batches and managed VIDEO sources.
- [ ] VGGT output cameras/points share one tested anchor-frame conversion.
- [ ] Scan creates one trajectory track rather than one MotionScene camera per sampled view.
- [ ] Multi-view same-object fusion is deterministic and bounded.
- [ ] `VGGT-1B-Commercial` is the documented production checkpoint target.
- [ ] VGGT-Ω is explicitly noncommercial/research and never auto-selected.
- [ ] SAM3D is optional, capability-gated and does not break a 24 GB Windows OmniCam installation.
- [ ] SAM3D completion modifies weak hidden dimensions rather than replacing measured transforms wholesale.
- [ ] No runtime dependency installer or hidden download was introduced.
- [ ] No public OmniCam node was added.
- [ ] MotionScene v1 remains the public product contract.
- [ ] Python, frontend, browser and live ComfyUI tests are green.
- [ ] README/NODES/COMPATIBILITY/SECURITY are updated.

---

# 13. One-line implementation brief for Codex / agent workers

> Extend OmniCam Extractor Scene Reconstruction into a semantic blockout system: keep MoGe as single-view geometry evidence, use native ComfyUI SAM3.1 for instance masks, deterministically fit closed MotionScene primitives and a correctly oriented room shell, retain the depth mesh only as an optional reference, add commercial VGGT multi-view/video scan with a single tested anchor-coordinate transform and cross-view semantic fusion, then add SAM 3D Objects strictly as an optional Linux/32GB hidden-dimension completion provider; preserve the three-node product surface, managed-path security, workflow serialization, cache/model identity correctness, GPU contention policy and full ComfyUI test coverage.
