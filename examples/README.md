# Examples

## Canonical payloads

- `omnicam_track.example.json` — a single V1 camera track.
- `omnicam_sequence.example.json` — a multi-shot V1 composition with cuts and metadata.

## Workflows (`examples/workflows/`)

Drag one into ComfyUI to start. These are **complete, runnable graphs**, not
fragments: each is the official Comfy-Org template for that model with its
motion source replaced by an OmniCam Director → Monitor pair.

Every model, LoRA, sampler, scheduler, shift and step count is upstream's. The
only thing OmniCam changes is where the motion comes from — so if the template
runs on your machine, so does the example.

| File | Profile | Based on | Replaces |
|---|---|---|---|
| `01_wan22_fun_camera_embedding.json` | `wan_camera_native` | `video_wan2_2_14B_fun_camera.json` | `WanCameraEmbedding` presets |
| `02_wan_ati_track_to_video.json` | `wan_track_native` | `video_wan_ati.json` | the hand-drawn trajectory string |
| `03_wan_move_native_tracks.json` | `wan_move_native` | `video_wanmove_480p.json` | the `GenerateTracks` chain |
| `04_minimax_h3_native_reference.json` | `h3_native` | `video_minimax_h3_r2v.json` | the manual prompt and the 17n+5 expression |
| `05_minimax_h3_api_reference.json` | `h3_api` | `api_minimax_h3_r2v.json` | the uploaded reference video |

Each carries a Note explaining what changed and how to drive it, plus the
upstream MarkdownNotes with model download links and VRAM figures.

### Lengths are driven, not typed

`Monitor.target_length` feeds the downstream node, so the frame grid each model
demands is resolved for you from the Director's duration:

| Profile | Rule | Example |
|---|---|---|
| `wan_camera_native` | 4n+1 | 5.0 s @ 16 fps → 80 → **81** |
| `wan_track_native` | requested, on a 121-sample source grid | 5.0625 s @ 16 fps → **81** |
| `wan_move_native` | track length | 5.0625 s @ 16 fps → **81** |
| `h3_native` | 17n+5 at 24 fps | 5.0 s → 120 → **124** |
| `h3_api` | duration in seconds | 6.0 s @ 24 fps → **144** |

Change the Director's duration and the whole chain follows. Do not hand-edit
the length on the downstream node.

### Not shipped as workflows

`wanvideo_ati` and `ltx25_motion_track` target third-party nodes
(`WanVideoATITracks` from WanVideoWrapper, `LTXVDrawTracks` from
ComfyUI-LTXVideo) that have no official template to build on. Both are
`screen_tracks` profiles, so workflow 2 is the wiring: swap the profile and
connect `tracks_json` to that node's `tracks` input instead.

### These are checked

`tests/test_example_workflows.py` validates every file against the **live** node
schemas — sockets, link integrity on both sides, no orphans, and that each
Monitor duration resolves to the frame count its note claims. A workflow cannot
quietly go stale the way the previous set did.
