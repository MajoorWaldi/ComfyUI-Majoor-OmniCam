<p align="center">
  <img src="web/assets/omnicam-icon.svg" width="112" alt="Majoor OmniCam">
</p>

<h1 align="center">Majoor OmniCam</h1>

<p align="center">
  <strong>Author camera and object motion in ComfyUI, then compile it for whichever video model you are using.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ComfyUI-0.31%2B-blue" alt="ComfyUI 0.31 or newer">
  <img src="https://img.shields.io/badge/Version-0.1.0-orange" alt="Version 0.1.0">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
  <img src="https://img.shields.io/badge/Status-experimental-e0a253" alt="Experimental">
</p>

<p align="center">
  <img src="docs/assets/omnicam-demo.gif" width="900" alt="Authoring a camera move in the OmniCam Director viewport">
</p>

<p align="center"><em><a href="docs/assets/omnicam-preview.mp4">▶ Full walkthrough (MP4)</a></em></p>

Video models do not agree on how to be told about motion. One wants camera
extrinsics, another wants 2D trajectories, a third wants a reference video and a
prompt. OmniCam separates the two halves of that problem: you describe the motion
once, and a compiler translates it per model.

```text
Extractor ─┐
           ├─> OMNICAM_MOTION_SCENE ─> Monitor ─> camera embedding
Director ──┘        + playblast                   trajectory JSON / TRACKS
                                                  reference video + prompt
```

A **MotionScene** is the canonical document: cameras, objects, motion layers,
cuts and an authoring timeline, all resolution- and frame-rate-independent. It
is what travels between the nodes.

![The full OmniCam graph: Load Video, Extractor, Director, Monitor, Save Video](docs/assets/omnicam-overview.png)

## The three nodes

> All three nodes are marked **experimental** in ComfyUI. Camera authoring and
> the playblast are stable in practice; the Monitor profile set and the Director
> Motion Tracks surface may still change before a stable release.

### OmniCam Director

![OmniCam Director](docs/assets/director-panel.png)

A small shot-layout tool in a live 3D viewport. Animate cameras and scene
references, draw motion layers over the frame, cut between cameras, and record a
neutral proxy playblast. This is where a MotionScene is authored.

### OmniCam Extractor

![OmniCam Extractor](docs/assets/extractor-panel.png)

Recover a relative 6DoF camera track from one continuous reference shot and hand
it on as a solved MotionScene. Connect it to the Director's `solved_scene` input
to keep editing the recovered move, or take it straight to Monitor.

Solves run outside the prompt queue, so you are not queueing a workflow to see a
trajectory. Preview uses native browser video first and falls back to
server-decoded frames when a container will not decode in the browser.

### OmniCam Monitor

![OmniCam Monitor](docs/assets/monitor-panel.png)

The model compiler. Pick a target profile; Monitor resolves the timeline,
compiles the MotionScene into that model's representation, and runs a preflight
that reports what will and will not survive the translation.

Preflight is binding, not decorative: for every named model profile, a downstream
node that is missing or whose socket contract has changed blocks the run rather
than producing a payload with nowhere to go. `external_reference_video` is the
one exception, by design -- see below.

## Profiles

| Profile | Semantic | Monitor output | Connect to |
|---|---|---|---|
| `external_reference_video` | `reference_video` | `reference_video` + `final_prompt` | any destination model's own reference-video input |
| `wan_camera_native` | `camera_embedding` | `camera_embedding` | `WanCameraImageToVideo.camera_conditions` |
| `wan_move_native` | `screen_tracks` | `native_tracks` | `WanMoveTrackToVideo.tracks` |
| `wan_track_native` | `screen_tracks` | `tracks_json` | `WanTrackToVideo.tracks` |
| `wanvideo_ati` | `screen_tracks` | `tracks_json` | `WanVideoATITracks.tracks` |
| `ltx25_motion_track` | `screen_tracks` | `tracks_json` | `LTXVDrawTracks.tracks` |
| `h3_native` | `reference_video` | `reference_frames` + `final_prompt` | `MiniMaxH3ReferenceToVideo.ref_videos` |
| `h3_api` | `reference_video` | `reference_video` + `final_prompt` | `MinimaxHailuo03ReferenceNode.reference_video` |

`external_reference_video` is the Monitor default and the odd one out: it names
no upstream node, imposes no frame grid or fps conversion, and never blocks on
a missing or unrecognized downstream. Use it for a model OmniCam has no named
profile for. Every other profile is strict on purpose -- it encodes one real
model's contract, and a payload that contract cannot satisfy is a bug worth
stopping the queue for.

Switching profile never changes the MotionScene. It does change which Monitor output carries the result, so connect the output this table lists for the profile you selected.

## Start here

1. Add **OmniCam Director** and compose a shot. Press `I` at each pose to key it.
2. Connect `motion_scene` and `playblast_video` to **OmniCam Monitor**.
3. Choose the profile your downstream model needs, and queue.
4. Read the preflight, then connect the output named in the table above.

To start from footage instead, put **OmniCam Extractor** in front and wire its
`motion_scene` output to the Director's `solved_scene` input.

Complete runnable graphs are in [`examples/workflows/`](examples/workflows):
each is the official Comfy-Org template for that model with its motion source
replaced by OmniCam, so every model, LoRA and sampler setting is upstream's.

## What OmniCam will refuse to do

These are preflight results, not bugs:

- **A multi-shot edit on a single-camera profile is blocked.** One camera
  embedding, or one projection basis, cannot describe an edit that cuts to a
  second camera. Reference-video profiles accept it — the playblast carries the
  cuts — and drop the single-camera prompt in favour of a neutral one.
- **Trajectories the JSON track formats cannot carry are reported.** A layer
  hidden on the first sample cannot be expressed and is dropped; one that
  disappears and returns is cut at the gap. Monitor names the affected layers
  instead of quietly encoding less than you authored.
- **A missing or changed downstream node blocks the run**, per profile, so a
  missing LTX install never blocks a Wan Camera compile.

## Documentation

- [Node Guide](docs/NODES.md) — inputs, outputs, profiles and workflow contracts.
- [User Guide](docs/USER_GUIDE.md) — authoring, playblasts, extraction, installation.
- [In-app help](web-src/help/defs.js) — contextual help from each node.
- [Shortcuts](docs/SHORTCUTS.md) — viewport, timeline and editing controls.
- [Technical Reference](docs/TECHNICAL_REFERENCE.md) — runtime behaviour, DPVO, validation, development.
- [Security](docs/SECURITY.md) — managed files, upload limits, request boundaries.

## License

MIT. See [LICENSE](LICENSE).
