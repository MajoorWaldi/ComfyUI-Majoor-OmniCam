# Examples

## Canonical payloads

- `omnicam_track.example.json` — a single V1 camera track.
- `omnicam_sequence.example.json` — a multi-shot V1 composition with cuts and metadata.

## Workflows (`examples/workflows/`)

Drag one into ComfyUI to start. These are **complete, runnable graphs**, not
fragments: the model starters adapt official Comfy-Org or Lightricks templates
with their motion source replaced by an OmniCam Director → Monitor pair.

Model, LoRA, sampler and step choices follow the upstream recipe. Workflow 10
also uses a shorter, smaller smoke test and bundled media; its changed sizes
and timing are documented in [LTX setup](../docs/LTX.md#layout-to-render).

| File | Profile | Based on | Replaces |
|---|---|---|---|
| `01_wan22_fun_camera_embedding.json` | `wan_camera_native` | `video_wan2_2_14B_fun_camera.json` | `WanCameraEmbedding` presets |
| `02_wan_ati_track_to_video.json` | `wan_track_native` | `video_wan_ati.json` | the hand-drawn trajectory string |
| `03_wan_move_native_tracks.json` | `wan_move_native` | `video_wanmove_480p.json` | the `GenerateTracks` chain |
| `04_minimax_h3_native_reference.json` | `h3_native` | `video_minimax_h3_r2v.json` | the manual prompt and the 17n+5 expression |
| `05_minimax_h3_api_reference.json` | `h3_api` | `api_minimax_h3_r2v.json` | the uploaded reference video |
| `06_image_scene_reconstruction_to_director.json` | `h3_api` | OmniCam image reconstruction starter | a manual proxy scene setup |
| [`07_minimax_h3_native_global_example.json`](workflows/07_minimax_h3_native_global_example.json) | `h3_native` | `video_minimax_h3_r2v.json` | a global MiniMax H3 native reference setup |
| [`08_minimax_h3_scene_coverage.json`](workflows/08_minimax_h3_scene_coverage.json) | `h3_scene_coverage` | ComfyUI-MiniMax-H3-Edit `TextEncodeH3Edit` | recording and resampling a playblast |
| [`09_ltx25_motion_track.json`](workflows/09_ltx25_motion_track.json) | `ltx25_motion_track` | ComfyUI-LTXVideo `LTX-2.5_ICLoRA_Motion_Track_Distilled.json` | the LTX Sparse Track Editor |
| [`10_ltx25_layout_to_render.json`](workflows/10_ltx25_layout_to_render.json) | `external_reference_video` | Lightricks' two-stage Layout to Render workflow | layout video, plus bundled appearance reference |

Each carries a Note explaining what changed and how to drive it, plus the
upstream MarkdownNotes with model download links and VRAM figures.

The shipped workflows are refreshed for OmniCam `0.3.0`: Director nodes carry
an explicit starter state with Perspective view, Simple navigation, Animation
interface density, and the radar mini-map enabled.

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
| `ltx25_motion_track` | 1 + floor(fps × duration / 8) × 8 | 5.0 s @ 24 fps → **121** |

Change the Director's duration and the whole chain follows. Do not hand-edit
the length on the downstream node.

### Not shipped as workflows

`wanvideo_ati` targets WanVideoWrapper's `WanVideoATITracks`, which has no
official template to build on. It is a `screen_tracks` profile, so workflow 2
is the wiring: swap the profile and connect `tracks_json` to that node's
`tracks` input instead. LTX-2.5 versions, weights and limits are in
[docs/LTX.md](../docs/LTX.md); running workflow 10 from a script is in
[sdk/README.md](sdk/README.md).

### These are checked

`10_ltx25_layout_to_render.json` is the two-stage Layout to Render starter.
It routes an OmniCam playblast through `external_reference_video`, with a
separate Look Still image; motion layers are not required. Upload the bundled
files from [assets/ltx-layout/](assets/ltx-layout/) into its loaders before queuing.
See [the recorded validation and usage](../docs/LTX.md#layout-to-render).

`tests/test_example_workflows.py` validates every file against the **live** node
schemas — sockets, link integrity on both sides, no orphans, and that each
Monitor duration resolves to the frame count its note claims. A workflow cannot
quietly go stale the way the previous set did.
