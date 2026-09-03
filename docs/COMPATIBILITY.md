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
