


<p align="center">
  <!-- Replace with your final icon -->
  <!-- <img src="docs/assets/omnicam-icon.png" width="120" alt="Majoor OmniCam"> -->
</p>

<h1 align="center">Majoor OmniCam</h1>

<p align="center">
  <strong>Camera direction, animation and motion-reference authoring directly inside ComfyUI.</strong>
</p>

<p align="center">
  Design the camera before generating the video.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ComfyUI-0.31%2B-blue" alt="ComfyUI 0.31+">
  <img src="https://img.shields.io/badge/Python-3.10%20%7C%203.12-blue" alt="Python 3.10 / 3.12">
  <img src="https://img.shields.io/badge/Version-0.3.0-orange" alt="Version 0.3.0">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
</p>

---

<!-- BANNER -->
<!--
<p align="center">
  <img src="docs/assets/omnicam-banner.png" alt="Majoor OmniCam">
</p>
-->

## What is OmniCam?

**Majoor OmniCam** is a camera layout and animation system for ComfyUI.

Instead of describing camera movement only with text such as:

> *"Slow cinematic orbit around the subject."*

OmniCam lets you **build the actual camera trajectory**.

Position the camera in a 3D viewport, create keyframes, edit animation curves, preview the shot in real time and record a lightweight proxy video that can be used as camera-motion guidance for compatible AI video workflows.

```text
Camera Layout
     ↓
Animation
     ↓
Canonical Camera Track
     ↓
Proxy / Camera Data
     ↓
AI Video Model
```

OmniCam does not run a diffusion model while you are authoring the shot.

The goal is to make camera direction fast, visual and predictable before generation.

---

## Director Preview

<!-- Add an animated GIF or WebP here later -->

<!--
<p align="center">
  <img src="docs/assets/director-demo.gif" alt="OmniCam Director Demo">
</p>
-->

The **OmniCam Director** provides a small shot-layout environment directly inside ComfyUI with:

- interactive 3D camera navigation;
- keyframe animation;
- F-Curve editing;
- multiple cameras;
- simple scene geometry;
- image and video cards;
- 3D model import;
- Look-At targets;
- parented animated objects;
- camera-path visualization;
- proxy playblast recording;
- camera motion analysis.

---

# Why OmniCam?

Text prompts are useful for describing intent.

But camera movement is spatial and temporal.

A prompt such as:

```text
Slow dolly forward while slightly orbiting around the house.
```

still requires the video model to interpret:

- the exact trajectory;
- the amount of translation;
- acceleration;
- framing;
- perspective change;
- orbit radius;
- timing;
- subject scale.

OmniCam lets you author those properties visually.

```text
PROMPT ONLY

"orbit around the subject"
        ↓
model interpretation


OMNICAM

authored camera trajectory
        ↓
camera reference / conditioning
        ↓
model generation
```

---

# How it works

OmniCam is built around a model-agnostic camera representation.

```text
                         ┌────────────────────────┐
                         │   MiniMax H3           │
                         └────────────▲───────────┘
                                      │
                         ┌────────────┴───────────┐
                         │ Universal Reference    │
                         │ & AI Prompts           │
                         └────────────▲───────────┘
                                      │
                                      │
┌─────────────────┐        ┌──────────┴─────────┐
│ OmniCam         │        │ MAJOOR_OMNICAM_   │
│ Director        ├───────►│ TRACK             │
└───────┬─────────┘        └──────────┬─────────┘
        │                              │
        │                              ├────────────► Wan Native Camera
        │                              │
        │                              ├────────────► Wan / ATI
        │                              │
        ▼                              │
   Proxy Video                        └────────────► LTX Camera Guide
```

The camera track is the canonical source of truth.

The viewport, backend and adapters are designed around the same camera motion.

---

# The OmniCam Proxy

The OmniCam proxy is **not a beauty render**.

It is a lightweight spatial reference designed to communicate camera motion clearly.

It focuses on:

- camera trajectory;
- parallax;
- framing;
- perspective changes;
- subject scale;
- velocity;
- acceleration and deceleration;
- orbit direction;
- dolly / truck / crane movement;
- depth relationships.

For reference-video models such as MiniMax H3:

```text
Proxy Video
=
Camera Motion Reference
```

while:

```text
Image References
=
Subject
Appearance
Materials
Lighting
Environment
Style
```

The proxy geometry, grid, markers and neutral viewport appearance are not intended to appear in the final generated video.

---

# Public Nodes

OmniCam currently exposes **five public nodes**.

## 🎥 OmniCam Director

The main camera-authoring environment.

Use it to:

- create and animate cameras;
- edit keyframes;
- edit F-Curves;
- create Look-At relationships;
- add simple scene objects;
- preview camera movement;
- record camera-reference playblasts;
- output the canonical OmniCam camera track.

Main outputs include:

```text
camera_track
proxy_video
audio
```

---

## ✨ Universal Reference & AI Prompts

Analyzes the authored camera trajectory and creates camera-motion prompts for video-generation workflows.

Designed for workflows including:

- MiniMax H3;
- Kling;
- Luma;
- HunyuanVideo;
- Wan;
- generic / universal video prompting.

The node can analyze:

- dolly;
- truck;
- crane / pedestal;
- pan;
- tilt;
- orbit;
- roll;
- zoom;
- compound camera moves;
- camera speed;
- acceleration;
- path curvature;
- FOV evolution.

For MiniMax H3, the generated prompt explicitly treats the OmniCam proxy as **camera-motion guidance only**.

---

## 🟣 OmniCam → Wan Native Camera

Converts an OmniCam camera track to ComfyUI's native Wan camera-conditioning representation.

```text
OmniCam Director
       ↓
camera_track
       ↓
Wan Native Camera
       ↓
WAN_CAMERA_EMBEDDING
       ↓
Wan Camera Image To Video
```

This path is intended for perspective camera tracks compatible with Wan camera conditioning.

---

## 🔵 OmniCam → LTX Camera Guide

Converts the OmniCam proxy video into guide frames for compatible LTX IC-LoRA workflows.

Features include:

- frame-range selection;
- maximum-frame limits;
- contiguous or uniform sampling;
- optional resizing;
- decoded-frame memory safeguards;
- camera-motion prompt generation;
- camera-profile metadata.

```text
OmniCam Director
       │
       ├── camera_track
       │
       └── proxy_video
              ↓
       LTX Camera Guide
              ↓
        IMAGE guide frames
              ↓
   LTX Add Video IC-LoRA Guide
```

---

## 🟠 OmniCam → WanVideoWrapper ATI

Projects stable 3D reference points through the authored camera and converts the resulting trajectories into ATI-compatible 2D tracks.

Useful for WanVideoWrapper trajectory-control workflows.

```text
3D Reference Points
        ↓
OmniCam Camera
        ↓
2D Projected Trajectories
        ↓
ATI Tracks
```

---

# Quick Start

## 1. Add OmniCam Director

Search for:

```text
OmniCam Director
```

under:

```text
Majoor / OmniCam
```

---

## 2. Position the camera

Navigate the viewport using the camera controls.

Typical controls include:

```text
Orbit
Pan
Dolly
Fly Camera
```

---

## 3. Create the first keyframe

Move to the desired timeline frame and press:

```text
I
```

to insert or replace a camera keyframe.

---

## 4. Create another camera position

Move to another frame on the timeline.

Reposition the camera and press:

```text
I
```

again.

---

## 5. Preview the animation

Press:

```text
Space
```

to play or pause the camera animation.

---

## 6. Refine the motion

Use the F-Curve editor to adjust:

- timing;
- easing;
- acceleration;
- deceleration;
- position;
- target;
- FOV;
- roll.

---

## 7. Record a proxy

Generate a lightweight playblast that represents the authored camera motion.

---

## 8. Connect an adapter

Choose the output path appropriate for your workflow:

```text
MiniMax H3
Wan Native Camera
Wan / ATI
LTX
Universal Prompt
```

---

# Useful Shortcuts

| Shortcut | Action |
|---|---|
| `I` | Insert / replace camera keyframe |
| `Space` | Play / pause |
| `F` | Frame the current subject / target |
| `W A S D` | Fly camera |
| `Q / E` | Vertical fly movement |

See the full control reference:

[Keyboard shortcuts and controls](docs/SHORTCUTS.md)

---

# Workflow Examples

Screenshots and example workflows will be added progressively.

## MiniMax H3

```text
OmniCam Director
       │
       ├───────────────────────────────┐
       │                               │
camera_track                      proxy_video
       │                               │
       ▼                               │
Universal Reference                   │
& AI Prompts                           │
       │                               │
       ▼                               ▼
camera prompt                    H3 Video 1
       │                               │
       └───────────────┬───────────────┘
                       ▼
                 MiniMax H3
```

<!--
<p align="center">
  <img src="docs/assets/workflow-h3.png" alt="OmniCam MiniMax H3 Workflow">
</p>
-->

---

## Wan Native Camera

```text
OmniCam Director
       ↓
camera_track
       ↓
Wan Native Camera
       ↓
camera_embedding
       ↓
Wan Camera Image To Video
```

<!--
<p align="center">
  <img src="docs/assets/workflow-wan.png" alt="OmniCam Wan Workflow">
</p>
-->

---

## LTX

```text
OmniCam Director
       │
       ├── camera_track
       │
       └── proxy_video
              ↓
       LTX Camera Guide
              ↓
         guide_frames
              ↓
 LTX Add Video IC-LoRA Guide
```

<!--
<p align="center">
  <img src="docs/assets/workflow-ltx.png" alt="OmniCam LTX Workflow">
</p>
-->

---

# Camera Animation

OmniCam supports animated camera properties including:

```text
Position X / Y / Z
Target X / Y / Z
FOV
Roll
Zoom
Projection
```

Keyframes support interpolation modes and editable Bézier tangents.

The camera sampler is shared between the authored viewport representation and the canonical camera track, with frontend/backend parity testing used to reduce differences between previewed and executed motion.

---

# Scene Layout

The Director also includes lightweight scene-layout tools.

Supported scene elements include simple primitives and reference objects useful for camera blocking.

Typical uses:

- subject placeholders;
- architecture blocking;
- ground reference;
- product layout;
- parallax references;
- image cards;
- video cards;
- imported 3D assets.

The goal is not to replace Blender, Maya or Unreal.

OmniCam is designed as a **fast shot-layout environment inside ComfyUI**.

---

# Look-At and Object Tracking

Cameras can target scene objects.

Target relationships support:

- animated objects;
- target offsets;
- object hierarchy;
- parented transforms.

This makes it possible to create shots where the camera follows or looks toward a moving subject while still preserving authored camera movement.

---

# Camera Motion Analysis

OmniCam can analyze the complete trajectory rather than only comparing the first and last frame.

Metrics can include:

```text
Path Length
Translation
Orbit Angle
Angular Motion
Speed
Acceleration
Jerk
Path Curvature
Target Distance
FOV Evolution
Framing
```

This analysis is used to create more useful motion descriptions for AI video models.

---

# Installation

## ComfyUI Registry / Manager

Once the Registry release is available:

1. Open ComfyUI.
2. Open **Manager**.
3. Search for:

```text
Majoor OmniCam
```

4. Install the node.
5. Restart ComfyUI if requested.

---

## Manual Installation

Clone the repository inside:

```text
ComfyUI/custom_nodes/
```

Example:

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam.git
```

Install Python dependencies if required:

```bash
cd ComfyUI-Majoor-OmniCam
pip install -r requirements.txt
```

Restart ComfyUI.

The nodes should appear under:

```text
Majoor / OmniCam
```

---

# Requirements

Current package requirements include:

```text
ComfyUI >= 0.31.0
Python >= 3.10
comfyui-frontend-package >= 1.48.7
```

OmniCam is tested against supported ComfyUI versions in CI.

Some adapters require additional model-specific custom nodes.

---

# Compatibility

OmniCam does **not modify ComfyUI core files**.

The core camera track is model-agnostic.

Model-specific behavior is isolated inside adapters.

Compatibility with external workflows depends on the installed versions of those integrations.

Current integration targets include:

| Integration | Status |
|---|---|
| ComfyUI native Wan Camera | Supported |
| MiniMax H3 Reference Video | Supported workflow |
| LTX Video IC-LoRA Guide | Supported workflow |
| WanVideoWrapper ATI | Supported adapter |
| Generic prompt workflows | Supported |

Adapter compatibility is checked at runtime where possible.

---

# Philosophy

OmniCam follows one core rule:

```text
What you author
=
What the camera track describes
=
What adapters receive
```

The project separates:

```text
Editor State
     ↓
Validation
     ↓
Canonical Camera Track
     ↓
Camera Sampling
     ↓
Adapters
```

Model-specific logic does not belong inside the viewport engine.

---

# Proxy Philosophy

The default proxy should make motion easy to understand rather than look visually impressive.

The proxy prioritizes:

```text
Parallax
Depth
Perspective
Scale
Velocity
Direction
Framing
```

over:

```text
Beauty Lighting
Complex Materials
Photorealism
Heavy Rendering
```

This keeps camera authoring lightweight and makes the reference easier for compatible AI video systems to interpret.

---

# Documentation

More detailed documentation is available here:

- [Node Guide](docs/NODES.md)
- [Keyboard Shortcuts](docs/SHORTCUTS.md)
- [Security and File Limits](docs/SECURITY.md)
- [Validation Report](docs/VALIDATION_REPORT.md)

---

# Security

OmniCam follows ComfyUI-managed input/output paths and does not intentionally expose arbitrary filesystem access.

The project includes protections for:

- upload size;
- supported file types;
- managed directories;
- path traversal;
- temporary file cleanup;
- video metadata validation.

See:

[Security and file handling](docs/SECURITY.md)

---

# Development

The repository separates the camera core from ComfyUI and model integrations.

```text
omnicam/
├── core/
├── adapters/
├── nodes/
└── ...

web-src/
├── director/
├── curve editor
├── viewport
└── ...

web/
└── omnicam.js
```

The production frontend is bundled into a single public JavaScript entrypoint.

---

# Testing

The project includes tests for areas such as:

- track validation;
- migrations;
- camera interpolation;
- Bézier timing;
- JavaScript / Python sampling parity;
- camera projection;
- Look-At targets;
- object hierarchy;
- quaternion generation;
- adapter payloads;
- runtime capability detection;
- frontend behavior;
- ComfyUI integration.

CI currently covers:

```text
Python 3.10
Python 3.12
ComfyUI minimum supported version
Current ComfyUI
Frontend unit tests
Browser tests
Production bundle validation
```

---

# Known Scope

OmniCam is currently focused on **camera authoring and camera-conditioning workflows**.

The following systems may exist internally or experimentally but are not currently part of the main public node surface:

```text
Sequencer
Blender transfer
Unreal transfer
Internal camera tools
Scene-motion analysis helpers
Development utilities
```

The public interface intentionally remains small.

---

# Public Node Surface

The current Registry release exposes exactly:

```text
1. OmniCam Director
2. Universal Reference & AI Prompts
3. OmniCam → Wan Native Camera
4. OmniCam → LTX Camera Guide
5. OmniCam → WanVideoWrapper ATI
```

---

# Feedback and Issues

If you find a bug, camera mismatch, integration issue or have a workflow suggestion, please open an issue:

https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/issues

Useful reports include:

- ComfyUI version;
- OmniCam version;
- model / adapter being used;
- workflow JSON if possible;
- screenshots or proxy examples;
- expected camera behavior;
- actual camera behavior.

---

# License

Majoor OmniCam is released under the **MIT License**.

Third-party models, ComfyUI integrations and external custom nodes retain their respective licenses.

---

<p align="center">
  <strong>Author the camera. Then generate the shot.</strong>
</p>

<p align="center">
  Majoor OmniCam for ComfyUI
</p>
