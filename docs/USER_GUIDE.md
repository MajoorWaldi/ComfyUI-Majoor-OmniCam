# OmniCam User Guide

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
3. Use `auto` to prefer DPVO when available, or select `opencv_sift` for the classical solver.
4. Review Solver Coverage and the report.
5. Connect `camera_track` to Director to edit the recovered path, or directly to Monitor to deliver it.

Extractor returns relative camera motion. It does not reconstruct metric scene scale or stitch across hard cuts.

## Deliver to a Video Workflow

1. Connect `camera_track` from Director or Extractor to **OmniCam Monitor**.
2. Connect `proxy_video` when the chosen adapter uses a visual reference.
3. Choose the adapter for the downstream workflow.
4. Resolve any blocking preflight messages before queueing the graph.
5. Wire only the populated outputs required by that adapter.

Use the [Node Guide](NODES.md) for exact sockets and adapter requirements.

## Interface Modes

Director offers Basic, Animation, and Advanced interface modes. They reveal progressively more of the same shot editor; camera data and workflow serialization remain unchanged.

Use [Shortcuts](SHORTCUTS.md) for the complete viewport and timeline control reference.

## Install

Install Majoor OmniCam through ComfyUI Manager when it is available in the registry. For a source checkout, place the repository in ComfyUI's `custom_nodes` directory, install its documented dependencies, and restart ComfyUI.

DPVO is optional. It requires a compatible local DPVO installation and its checkpoint at:

```text
ComfyUI/models/omnicam/dpvo/dpvo.pth
```

When DPVO is unavailable, select `opencv_sift` or use `auto` to fall back automatically. See the [Technical Reference](TECHNICAL_REFERENCE.md) for Windows and runtime details.

## Help and Troubleshooting

Use the `?` button for concise help about the selected OmniCam node. For detailed contracts, adapter compatibility, and managed-file behavior, see the [Node Guide](NODES.md), [Compatibility Guide](COMPATIBILITY.md), and [Security Guide](SECURITY.md).
