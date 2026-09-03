# OmniCam User Guide

All three nodes are marked **experimental** in ComfyUI. Camera authoring and the
playblast are stable in practice; the **Monitor** profile set and the Director
**Motion Tracks** surface may still change before a stable release.

![Authoring a camera move in the Director viewport](assets/omnicam-demo.gif)

The full graph — Extractor, Director and Monitor wired end to end — is in
[`assets/omnicam-overview.png`](assets/omnicam-overview.png); a longer
walkthrough is [`assets/omnicam-preview.mp4`](assets/omnicam-preview.mp4).

## Author a Camera Move

1. Add **OmniCam Director**.
2. Compose the opening frame in the 3D viewport.
3. Press `I` to insert a camera keyframe.
4. Move the playhead, reposition the camera, then press `I` again.
5. Press `Space` to preview the shot.
6. Record a playblast when a reference-video workflow needs one.

Director keeps the authored camera track as the source of truth. The playblast is a motion reference, not a final render.

## Recover Motion from Video

1. Add **OmniCam Extractor**.
2. Connect one continuous video shot.
3. Use `auto` to prefer DPVO, then `pycolmap`, then `opencv_sift` -- or select one of the three directly.
4. Review Solver Coverage and the report.
5. Connect `motion_scene` to the Director's `solved_scene` input to keep editing the recovered move, or straight to Monitor to deliver it.

Extractor returns relative camera motion. It does not reconstruct metric scene scale or stitch across hard cuts.

## Deliver to a Video Workflow

1. Connect `motion_scene` from Director or Extractor to **OmniCam Monitor**.
2. Connect `playblast_video` as well. Reference-video profiles require it, and
   every profile uses it for the preview.
3. Choose the `target_profile` your downstream model needs.
4. Queue, then read the preflight. Anything `BLOCKED` stops the compile and says
   why; resolve it before wiring the output.
5. Wire the one output that profile populates:
   - `reference_video`, plus `final_prompt`, for `external_reference_video` (the
     default) or the H3 profiles
   - `reference_frames`, plus `final_prompt`, for `h3_native`
   - `camera_embedding` for `wan_camera_native`
   - `native_tracks` for `wan_move_native`
   - `tracks_json` for `wan_track_native`, `wanvideo_ati`, `ltx25_motion_track`

`external_reference_video` applies no model-specific contract: no frame grid, no
fps conversion, no required downstream node, and it never blocks. Use it for a
model OmniCam has no named profile for -- Seedance, Kling, Veo, a private API.
Choose a named profile only when you want OmniCam to enforce that model's exact
contract and block the compile when the scene or the connected media cannot
satisfy it.

Switching profile never changes the MotionScene. It does change which Monitor output carries the result, so connect the one listed above for the profile you selected.

The player above the preflight shows the Director's actual recorded playblast,
not its live edit viewport. If the scene has changed since that file was
recorded, it reads `PLAYBLAST OUTDATED` — the compile still sends the old
footage until you re-record.

Use the [Node Guide](NODES.md) for exact sockets and profile requirements, and
[`examples/workflows/`](../examples/workflows) for a ready-made graph per family.

## Interface Modes

Director offers Basic, Animation, and Advanced interface modes. They reveal progressively more of the same shot editor; camera data and workflow serialization remain unchanged.

Use [Shortcuts](SHORTCUTS.md) for the complete viewport and timeline control reference.

## Install

Install Majoor OmniCam through ComfyUI Manager when it is available in the registry. For a source checkout, place the repository in ComfyUI's `custom_nodes` directory, install its documented dependencies, and restart ComfyUI.

All three Extractor backends are optional. DPVO requires a compatible local
installation and its checkpoint at:

```text
ComfyUI/models/omnicam/dpvo/dpvo.pth
```

pycolmap needs nothing beyond `python_embeded\python.exe -m pip install pycolmap`
-- no compiler, no CUDA toolkit, prebuilt Windows wheels. OpenCV/SIFT needs
`opencv-python`. `auto` tries DPVO, then pycolmap, then OpenCV/SIFT, and uses
the first one actually installed. See
[Installing DPVO](TECHNICAL_REFERENCE.md#installing-dpvo) for the DPVO build
procedure, and the rest of the [Technical Reference](TECHNICAL_REFERENCE.md)
for runtime details.

## Help and Troubleshooting

Use the `?` button for concise help about the selected OmniCam node. For detailed contracts, profile compatibility, and managed-file behavior, see the [Node Guide](NODES.md), [Compatibility Guide](COMPATIBILITY.md), and [Security Guide](SECURITY.md).
