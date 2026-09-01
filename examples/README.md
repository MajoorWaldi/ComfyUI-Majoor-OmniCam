# Examples

## Canonical payloads

- `omnicam_track.example.json` — a single V1 camera track.
- `omnicam_sequence.example.json` — a multi-shot V1 composition with cuts and metadata.

## Workflows (`examples/workflows/`)

Drag one into ComfyUI to start. Each is a Director wired to a Monitor, with a
note explaining where the Monitor output goes. There is one per Monitor
semantic rather than one per model, because the wiring is the same for every
profile that shares a semantic.

| File | Semantic | Monitor output to connect |
|---|---|---|
| `01_wan_camera_embedding.json` | `camera_embedding` | `camera_embedding` -> `WanCameraImageToVideo.camera_conditions` |
| `02_wan_ati_motion_tracks.json` | `screen_tracks` | `tracks_json` -> the target's `tracks` input, or `native_tracks` for Wan Move |
| `03_minimax_h3_reference.json` | `reference_video` | `reference_video` (API) or `reference_frames` (native), plus `final_prompt` |

Switching profile inside a semantic is a widget change, not a rewiring: pick
`wan_track_native`, `wanvideo_ati` or `ltx25_motion_track` in workflow 2 and
connect `tracks_json` to whichever node that profile names.

`tests/test_example_workflows.py` checks these against the live node schemas, so
a workflow cannot quietly go stale the way the previous set did.
