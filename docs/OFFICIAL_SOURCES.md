# Official Source Baseline

Checked for the initial architecture on 13 August 2026. Baseline ComfyUI release: **v0.32.0** (published 11 August 2026).

## ComfyUI

- Core: https://github.com/Comfy-Org/ComfyUI
- V3 migration: https://docs.comfy.org/custom-nodes/v3_migration
- Server overview: https://docs.comfy.org/development/comfyui-server/comms_overview
- Routes: https://docs.comfy.org/development/comfyui-server/comms_routes
- Frontend: https://github.com/Comfy-Org/ComfyUI_frontend
- JavaScript extensions: https://docs.comfy.org/custom-nodes/js/javascript_overview
- Load3D docs: https://docs.comfy.org/built-in-nodes/Load3D
- Native camera trajectory implementation: https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_extras/nodes_camera_trajectory.py
- Native Wan conditioning implementation: https://github.com/Comfy-Org/ComfyUI/blob/master/comfy_extras/nodes_wan.py
- Desktop: https://github.com/Comfy-Org/desktop
- Manager: https://github.com/Comfy-Org/ComfyUI-Manager
- Embedded docs: https://github.com/Comfy-Org/embedded-docs
- Registry publishing: https://docs.comfy.org/registry/publishing
- Registry specifications: https://docs.comfy.org/registry/specifications

## Camera-control integrations

- ATI official implementation: https://github.com/bytedance/ATI
- LTX official implementation: https://github.com/Lightricks/LTX-Video
- Current ComfyUI release: https://github.com/Comfy-Org/ComfyUI/releases/tag/v0.32.0

## Source-derived implementation decisions

1. Use V3 node schema and `ComfyExtension`.
2. Register frontend via ComfyUI extension APIs rather than patching core.
3. Use `PromptServer.instance.routes` + `api.fetchApi` for custom client/server communication.
4. Use current core `VIDEO` handling patterns (`InputImpl.VideoFromFile`).
5. Mirror current Load3D camera fields where compatibility is useful.
6. Keep runtime frontend assets local/bundled because ComfyUI server CSP is restrictive.
7. Keep Manager/Registry metadata in `pyproject.toml` and do not assume repository directory name equals installed node folder name.
8. Follow current Load3D focus/event containment for interactive DOM surfaces and the frontend keybinding service's event-target filtering for text controls.

## August 2026 observations

- ComfyUI v0.32.0 contains current MiniMax H3 fixes/optimizations and LTX 2.5 support.
- Core includes `WanCameraEmbedding`, which generates Plücker camera embeddings, and `WanCameraImageToVideo` accepts `WAN_CAMERA_EMBEDDING`. OmniCam 0.3.0 uses the same core `process_pose_params` path for arbitrary authored tracks.
- ATI remains useful as a separate trajectory-control route, especially for object/local/camera trajectory workflows.
- Installed WanVideoWrapper commit `088128b224242e110d3906c6750e9a3a348a659b` exposes `WanVideoATITracks.tracks` as a JSON string of 121-sample point tracks.
- Installed ComfyUI-LTXVideo commit `ac4d99839020b983e956a8ab67ec38aec1b6e65a` exposes video IC-LoRA guide frames and named camera-control LoRAs, but no public arbitrary-extrinsics input.
