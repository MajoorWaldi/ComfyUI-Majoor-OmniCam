<p align="center">
  <img src="web/assets/omnicam-icon.svg" width="112" alt="Majoor OmniCam">
</p>

<h1 align="center">Majoor OmniCam</h1>

<p align="center">
  <strong>Camera direction, animation, and motion-reference authoring inside ComfyUI.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/ComfyUI-0.31%2B-blue" alt="ComfyUI 0.31 or newer">
  <img src="https://img.shields.io/badge/Version-0.1.0-orange" alt="Version 0.1.0">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
</p>

Majoor OmniCam lets you author camera motion before generating video. Its three product nodes share one portable, model-agnostic camera track:

```text
Extractor -> Director -> MAJOOR_OMNICAM_TRACK -> Monitor -> AI video workflow
```

## Product Nodes

### OmniCam Director

![OmniCam Director](docs/assets/director-outliner.png)

Build a shot in a live 3D viewport. Animate cameras and scene references, edit timing, preview the move, and record a neutral proxy playblast. The Director is where the camera path is authored.

### OmniCam Extractor

Turn one continuous reference shot into an editable, relative 6DoF camera track. Use the recovered motion directly, or bring it into Director to retime, refine, and reframe it for a new scene.

### OmniCam Monitor

![OmniCam Monitor](docs/assets/monitor-panel.png)

Inspect a track, check its delivery readiness, preview the output, and route it to the selected AI-video adapter. Monitor is the supported exit point for new OmniCam workflows.

## Start Here

1. Add **OmniCam Director** and compose a shot.
2. Press `I` at each camera pose to create keyframes.
3. Connect `camera_track` to **OmniCam Monitor**.
4. Select the adapter required by the downstream workflow.

For recovered camera motion, start with **OmniCam Extractor** and connect its `camera_track` to Director or Monitor.

## Documentation

- [Node Guide](docs/NODES.md): inputs, outputs, adapters, and workflow contracts.
- [User Guide](docs/USER_GUIDE.md): authoring workflow, playblasts, extraction, and installation.
- [In-app Help](web-src/help/defs.js): concise contextual help shown from each OmniCam node.
- [Shortcuts](docs/SHORTCUTS.md): viewport, timeline, and editing controls.
- [Technical Reference](docs/TECHNICAL_REFERENCE.md): runtime behavior, DPVO, integrations, validation, and development.
- [Security](docs/SECURITY.md): managed files, upload limits, and request boundaries.
- [Compatibility](docs/COMPATIBILITY.md): supported ComfyUI versions and adapter status.

The four nodes under `Majoor/OmniCam/Legacy` remain available only for existing workflows. Use Director, Extractor, and Monitor for new work.

## License

MIT. See [LICENSE](LICENSE).
