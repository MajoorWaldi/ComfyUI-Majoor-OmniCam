# OmniCam Compatibility

This document records what OmniCam is designed and tested to connect to.

A valid socket/schema contract does not automatically mean the downstream model
has been visually certified.

All three product nodes (Director, Extractor, Monitor) ship with
`is_experimental=True`. The Monitor profile set and the Director **Motion
Tracks** authoring surface are the least settled parts and may change before a
stable release.

## ComfyUI

| Surface | Policy |
|---|---|
| Minimum Core | ComfyUI 0.31.0 |
| Stable Integration | ComfyUI 0.34.0 |
| Core Canary | ComfyUI master |
| Frontend minimum | comfyui-frontend-package >= 1.48.7 |
| Current Frontend Gate | pinned in GitHub Actions |
| Nodes 2.0 | live Playwright validation |

## Scene format — unified assets & characters

The unified asset library adds fields to a scene object — `asset_id`,
`asset_kind`, `tags`, `annotation`, `character` (`rig_profile` / `pose` /
`motion`) — and a `metadata.viewport_labels` preference.

| | |
|---|---|
| Old workflows | load unchanged; missing fields default to `null` / empty. |
| Object `type` | still `"glb"` for a character — the new fields are additive. |
| MotionScene schema | **no version bump** — existing `type` values and field meanings are unchanged. |
| Older OmniCam | renders the GLB and ignores `asset_kind` / `character` / `tags`. |
| Conversion | an existing GLB stays a normal model; the user opts in with the Asset Browser or a `Convert to Character` action. |
| Reconstruction | `MotionScene` objects gain factual `tags` / `asset_id` / `asset_kind`; the blockout library remains a compatibility fallback. |

The low-poly `human` primitive is unaffected and still available.

## Monitor Profiles

| Profile | Semantic | Downstream | Contract | Model Certification |
|---|---|---|---|---|
| external_reference_video | reference video | generic reference-video input | generic | pending |
| wan_camera_native | camera embedding | WanCameraImageToVideo.camera_conditions | verified by capability gate | pending |
| wan_move_native | screen tracks | Wan Move | verified by capability gate | pending |
| wan_track_native | tracks JSON | Wan Track | verified by capability gate | pending |
| wanvideo_ati | tracks JSON | WanVideoWrapper ATI | verified by capability gate | pending |
| ltx25_motion_track | screen tracks | LTX Motion Track | verified by capability gate | pending |
| h3_native | IMAGE reference + prompt | MiniMaxH3ReferenceToVideo | verified by capability gate | pending |
| h3_api | VIDEO reference + prompt | MinimaxHailuo03ReferenceNode | verified by capability gate | pending |

`Contract` verifies representation/socket compatibility.

`Model Certification` verifies a real generated result.

Those are separate claims. The real-model conformance procedure and its current
results live in [CONFORMANCE.md](CONFORMANCE.md).

## Extractor Backends

| Backend | State |
|---|---|
| DPVO | optional |
| pycolmap | optional |
| OpenCV/SIFT | optional |
| auto | DPVO → pycolmap → OpenCV/SIFT |

OmniCam never installs these packages at runtime.

## Geometry Estimation Providers (Scene Reconstruction)

| Provider | Host Subsystem | Required Checkpoint Path | State | Policy |
|---|---|---|---|---|
| `comfy_moge` | `comfy_extras.nodes_moge` | `ComfyUI/models/geometry_estimation/` | optional / native core | No auto-download; graceful degradation if missing |
| `comfy_sam3` | `comfy_extras.nodes_sam3` (`CheckpointLoaderSimple → CLIPTextEncode → SAM3_Detect`) | `ComfyUI/models/checkpoints/sam3*` (e.g. `sam3.1_multiplex_fp16.safetensors`) | optional / native core | No second segmentation dependency; capability `false` until a `sam3*` checkpoint is installed |
| `vggt` | `vggt` Python package | `ComfyUI/models/geometry_estimation/vggt/VGGT-1B-Commercial/model.pt` | optional / manual | No auto-download (`from_pretrained` is never called); needs CUDA. `VGGT-1B-Commercial` is the recommended commercial checkpoint |
| `vggt_omega_research` | `vggt` Python package | `ComfyUI/models/geometry_estimation/vggt/VGGT-Omega/` | optional / research | **Non-commercial / research only** (FAIR Noncommercial Research License); never auto-selected. The Aug 18 2026 benchmark-contamination notice affects benchmark interpretation only |
| `sam3d_objects` | `sam3d_objects` package | `ComfyUI/models/sam3d_objects/pipeline.yaml` | optional / gated | Official baseline: **Linux 64-bit + NVIDIA CUDA GPU with ≥ 32 GB VRAM** + gated model access. No lower-memory override. Absence does not affect Depth Mesh / Blockout / Scan |

When a required checkpoint is not present, `/majoor/omnicam/reconstruction/capabilities` reports `available: false` with the target folder path and reason. Extractor displays each requirement in the UI (unsupported options stay visible with reason text, not hidden) and keeps camera tracking and the other reconstruction modes functional without runtime exceptions. If SAM3 is missing, the UI may still show Blockout but the run button explains the missing checkpoint and offers Depth Mesh; queued execution never silently changes the requested mode.

