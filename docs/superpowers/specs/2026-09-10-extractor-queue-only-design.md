# OmniCam Extractor Queue-Only Architecture — Design Specification

**Status:** Approved  
**Date:** 2026-09-10  
**Repository:** `MajoorWaldi/ComfyUI-Majoor-OmniCam`  
**Baseline SHA:** `5896642209ec6f6042f8003b6a37cbca9bdaef8e`

## Decision

All heavy OmniCam Extractor work becomes Queue-only.

`TRACK` and Scene Reconstruction `Start` remain OmniCam UI controls, but they enqueue a **partial ComfyUI execution** targeting `MajoorOmniCamExtractor`. The custom out-of-queue job schedulers stop being execution authorities and are removed once parity is proven.

```text
TRACK / RECONSTRUCT
        ↓
sync real Extractor widgets
        ↓
Comfy partial execution
        ↓
MajoorOmniCamExtractor.execute()
        ↓
camera_track or scene_reconstruct
        ↓
normal NodeOutput + UI envelope
        ↓
Extractor UI
```

ComfyUI owns queue admission, dependency execution, execution ordering, cancellation, high-level progress, final output and execution errors. OmniCam owns camera solving, reconstruction semantics, diagnostics, MotionScene compilation and 3D visualization.

## Partial execution compatibility

The current frontend supports partial execution using `queueNodeIds` / `partialExecutionTargets`. The implementation must preserve OmniCam's current declared frontend floor (`comfyui-frontend-package>=1.48.7`) unless evidence proves that floor must move.

Important compatibility detail:

- frontend `v1.48.7` exposes `app.queuePrompt(number, batchCount, queueNodeIdsArray)`;
- current frontend exposes `app.queuePrompt(number, batchCount, { queueNodeIds, intent })`.

The adapter must select exactly one signature using a tested version-aware compatibility path. It must never "try both": the wrong shape can silently degrade into a full-workflow queue.

## DPVO

The first Queue-only release keeps DPVO in a spawned child process for CUDA/native-extension isolation.

```text
Comfy queued Extractor.execute()
        ↓
spawn DPVO child
```

Comfy cancellation must propagate into the child and perform bounded join/terminate/kill/cleanup. A later separate spike compares spawned DPVO against inline DPVO. Subprocess IPC is not removed until inline mode proves equivalent under repeated solve/cancel/VRAM/generation stress tests.

## Progress

Queued execution uses Comfy's execution progress API as the high-level progress authority. Rich diagnostics such as feature points, pose samples and quality telemetry may remain as an optional non-authoritative PromptServer side channel.

## Cancellation

Use Comfy's job cancellation endpoint for the queued solve. A pending solve is dequeued; a running solve is interrupted. OmniCam's old `/extractor/jobs/{id}/stop` execution route is retired after parity.

## Reconstruction

`scene_reconstruct` follows the same Queue-only lifecycle. Heavy MoGe/VGGT/SAM3D work must not retain a separate GPU scheduler.

## Results

The existing queued `IO.NodeOutput(..., ui=UI.PreviewText(...))` remains canonical. `ExtractorUI.executed()` and `parseExtractorMessage()` remain the browser bridge. Hidden result cache widgets remain serialized so solved state survives workflow save/reload.

## Registry

Queue-only reduces duplicate scheduling/control code but does not itself guarantee Registry acceptance. The same release also removes avoidable runtime scanner triggers, audits the exact `node.zip`, and refuses to finalize a GitHub Release unless Registry reports the version Active.

## Invariants

- Exactly three public nodes: Extractor, Director, Monitor.
- MotionScene format unchanged.
- No VCam.
- No new heavy dependency.
- No manual construction of private Comfy prompt JSON when native graph partial execution can be used.
- No scanner-evasion tricks.
- Three.js/WebAudio semantics remain intact.
- DPVO child remains intact until the separate inline stability spike passes.

> **ComfyUI owns execution. OmniCam owns solving, semantics and visualization.**
