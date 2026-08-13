# Integrations

## MiniMax H3 Omni Reference

The camera proxy is a conditioning signal, not a beauty render. The adapter classifies the track and builds an orbit/dolly/crane/handheld-aware fragment that asks H3 to reproduce trajectory, framing, speed, parallax and timing while ignoring grid, geometry, markers, textures and colors.

The frontend recognizes the current core `MinimaxHailuo03ReferenceNode`, can create it with the OmniCam H3 adapter, and connects known sockets when present. Presets are balanced, parallax, subject and debug. Their comparative quality remains a paid empirical test; use `H3_BENCHMARK.md` rather than assuming a winner.

## Native Wan camera

The installed ComfyUI v0.32.0 implementation accepts `WAN_CAMERA_EMBEDDING`. OmniCam samples an arbitrary track, converts its Y-up look-at camera to Wan's +Z-forward camera-to-world matrix, derives normalized focal values from vertical FOV/aspect, produces the core 23-value rows, and calls official core `process_pose_params`.

Roll and vertical-camera degeneracy are handled at the adapter boundary. Unit tests verify axes, layout and temporal resampling. Generated-video quality is still external QA.

## ATI and WanVideoWrapper

The generic ATI bridge projects stable 3D points into every sampled camera, which naturally represents parallax from pans, trucks, dollies, cranes and orbits. A preview node overlays trajectories on an input image.

The exact adapter is isolated at `adapters/wanvideo_wrapper/v2026_08.py` for WanVideoWrapper commit `088128b224242e110d3906c6750e9a3a348a659b`. It outputs the `tracks` string accepted by `WanVideoATITracks`: a JSON list of point tracks, each containing exactly 121 `{x, y}` samples. Other commits are not implicitly supported.

## LTX

The stable bridge emits per-frame timing, position, target, FOV, roll, projection and intrinsics/extrinsics metadata with optional temporal resampling.

For inspected ComfyUI-LTXVideo commit `ac4d99839020b983e956a8ab67ec38aec1b6e65a`, the public camera-control route is image/video guidance and named camera-control LoRAs. `OmniCam → LTX Camera Guide` decodes proxy `VIDEO` into `IMAGE` frames for `LTXVAddVideoICLoRAGuide` and recommends the installed static/dolly/jib/pan LoRA profile. No undocumented arbitrary-extrinsics socket is fabricated.

## Blender

The generated script configures resolution, FPS and frame range; creates perspective or orthographic camera keys; maps position, target, roll, FOV/zoom and interpolation; applies world scale; and reconstructs supported proxy objects/cards. Its `export_omnicam(path)` function writes the edited camera back to canonical JSON.

## Unreal Engine

The generated script targets Unreal 5.3–5.6. It creates a CineCameraActor and Level Sequence, adds transform and focal-length channels, maps axes/units and sets timing. Its `export_sequence(path)` function emits canonical JSON. Editor execution is version-specific external QA.

## Coordinate policy

Canonical OmniCam uses X right, Y up, Z depth and conceptual meters, with position, target, roll, FOV, projection, zoom, near and far. Each adapter owns and tests its conversion; the core stays model-agnostic.
