# OmniCam Technical Reference

## Architecture

OmniCam keeps camera authoring model-agnostic:

```text
Viewport / timeline -> MAJOOR_OMNICAM_TRACK -> adapters
```

Director, Extractor, and Monitor are the product nodes. Model-specific logic belongs behind Monitor adapters and must not enter the canonical track.

The frontend has a small extension bootstrap in `web/omnicam.js`; product surfaces load from code-split chunks. Three.js and media components load only when their respective UI needs them. Do not move these dependencies into startup imports.

## DPVO Runtime

DPVO is optional and runs in a fresh spawned process. Frames travel through a private NumPy memmap in ComfyUI's temporary directory, and the child process is reaped on success, stop, and failure so its CUDA context can be released.

Read-only memmap frames are copied into writable, C-contiguous NumPy arrays before `torch.from_numpy`. The worker reports `finalizing` after frame ingest and immediately before `slam.terminate()`. Interactive jobs display that period as `SOLVING`.

A 120-second watchdog applies only while DPVO global optimization is finalizing. It reports an actionable failure when `slam.terminate()` does not return; it recommends a shorter clip, a lower `max_dimension`, or `opencv_sift`.

The checkpoint location is fixed and managed:

```text
ComfyUI/models/omnicam/dpvo/dpvo.pth
```

OmniCam never installs packages, executes a shell command, or accepts a checkpoint path from a workflow or browser request.

## Adapter Contracts

Adapter capability detection checks actual node classes and input contracts. Pinned support and compatibility details are maintained in [NODES.md](NODES.md) and [COMPATIBILITY.md](COMPATIBILITY.md).

The weekly `adapter-contract-canary` GitHub Action checks current LTX-Video and WanVideoWrapper source contracts. It is advisory only and never changes declared compatibility automatically.

## Validation and Development

Run the maintained checks from the repository root:

```text
python -m pytest tests/ -q
python scripts/verify_package.py
python -m ruff check .
npm run check
npm run test:unit
npm run test:browser
```

The live ComfyUI gate additionally needs a ComfyUI checkout:

```text
OMNICAM_LIVE_AUTOSTART=1
OMNICAM_COMFYUI_ROOT=/path/to/ComfyUI
OMNICAM_LIVE_MATCH=live-ci.spec.js
npm run test:live
```

Validation coverage and branch-check policy are recorded in [VALIDATION_REPORT.md](VALIDATION_REPORT.md) and [BRANCH_PROTECTION.md](BRANCH_PROTECTION.md). Internal module boundaries and schema rules are documented in [INTERNALS.md](INTERNALS.md).

## Security

Managed assets, upload validation, source resolution, request limits, and environment configuration are specified in [SECURITY.md](SECURITY.md).
