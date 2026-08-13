# Compatibility matrix

Validated source baseline: 13 August 2026.

| Component | Pinned/inspected version | Integration | Local validation | External validation still required |
|---|---|---|---|---|
| ComfyUI | v0.32.0 installed tree | V3 nodes, `VIDEO`, `LOAD3D_CAMERA`, routes | 15 schemas imported with embedded Python | Full live workflow UI/save/reload |
| ComfyUI frontend | installed 1.48.7 | `app.registerExtension`, public `addDOMWidget`, `api.apiURL`, execution preview | Live Nodes 2.0 mount/interactions/restore + Edge harness | Desktop/browser matrix |
| Three.js | 0.180.0 exact lock | Bundled WebGL renderer | Vite build + Edge render/disposal test | GPU performance matrix |
| Mediabunny | 1.53.1 exact lock | WebCodecs encoding + WebM muxing | Two-frame Edge encode | Non-Chromium codec matrix |
| MiniMax H3 | core `MinimaxHailuo03ReferenceNode` | Omni Reference video + prompt fragment | Node detection/wiring code checked | Paid generation benchmark |
| ComfyUI native Wan | v0.32.0 `nodes_camera_trajectory.py` | Arbitrary track → native Plücker embedding | Layout/axis/unit tests | Model generation quality |
| ComfyUI-WanVideoWrapper | `088128b224242e110d3906c6750e9a3a348a659b` | Exact `WanVideoATITracks.tracks` string, 121 samples | Contract tests | Pinned workflow generation |
| ComfyUI-LTXVideo | `ac4d99839020b983e956a8ab67ec38aec1b6e65a` | IC-LoRA guide frames + camera-LoRA profile | Contract/resampling tests | Model generation quality |
| Blender | script uses stable camera/action APIs | Import/export camera and proxies | Script-content tests | Execute per supported Blender release |
| Unreal Engine | 5.3–5.6 target | CineCamera + Level Sequence script | Script-content tests | Execute in each targeted editor |
| Browser capture | WebCodecs, MediaRecorder fallback | Deterministic WebM; realtime browser fallback | Edge frame encode + live UI path | Full-duration capture/queue across browser matrix |

Unsupported claims:

- OmniCam does not claim an arbitrary-extrinsics socket for LTX because the inspected integration does not expose one.
- Other WanVideoWrapper commits may change the ATI contract and are not covered by the pinned adapter.
- Safari/iOS, remote browsers, and non-Chromium capture behavior are not validated.
