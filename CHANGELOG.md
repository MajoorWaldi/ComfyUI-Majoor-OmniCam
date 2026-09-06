# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-06

### Added
- **Scene Reconstruction Mode in Extractor (`MajoorOmniCamExtractor`)**:
  - Alternate operating mode allowing 3D proxy scene reconstruction directly from a single reference image (`extract_mode: "camera_track" | "scene_reconstruct"`).
  - Single-image geometry estimation powered by native ComfyUI MoGe integration (`comfy_extras.nodes_moge`).
  - Three resolution & triangle budget presets:
    - `Fast`: 360 px resolution, 32,000 triangle budget for instant scene blocking.
    - `Balanced` (default): 512 px resolution, 64,000 triangle budget.
    - `High`: 720 px resolution, 120,000 triangle budget for detailed surface contours.
  - Deterministic seeded RANSAC ground plane analysis with multi-factor confidence scoring (`0.55 * inlier_ratio + 0.25 * orientation + 0.20 * coverage`).
  - Optional vertical wall plane detection and proxy bounding boxes (`detect_walls`).
  - Automated UV generation and source texture baking into the managed proxy GLB (`majoor_omnicam/reconstruction/<fingerprint>/environment.glb [input]`).
  - Fingerprint-keyed reconstruction cache for instant cache hits on identical input images and settings.
  - Interactive, no-prompt background job execution (`/majoor/omnicam/reconstruction/*`) and WebSocket event stream (`omnicam.reconstruction.*`) with cooperative cancellation and memory management.
  - Extractor UI Scene Reconstruct panel with provider selection, quality presets, real-time monotonic progress bars, and execution summary.
- **Director Scene Adoption & Inspection Controls**:
  - Seamless "Open in Director" flow: adopts reconstructed environment GLB and ground plane with collision-safe IDs.
  - Creates a stationary hold camera keyframe at frame 0 matching the estimated vertical FOV.
  - Smart scene replacement: replaces empty default Director scenes or cleanly merges environment into existing authored workflows.
  - Confidence badges in Director Outliner and Inspector (`High`, `Medium`, `Low`).
  - Object locking: reconstructed proxy meshes and ground planes default to `locked: true` to prevent accidental transforms, with an interactive unlock toggle in the Inspector.
  - Dual playblast appearance toggle: switch between `Neutral` proxy shading (optimized for `omni_ref` video conditioning) and `Source Texture` (for staging and visual alignment).
- **Workflows & Documentation**:
  - New example workflow `examples/workflows/06_image_scene_reconstruction_to_director.json` demonstrating image input to proxy scene to Director camera animation to Monitor model compilation.
  - Complete documentation of Scene Reconstruction, quality presets, and checkpoint requirements across `USER_GUIDE.md`, `NODES.md`, `COMPATIBILITY.md`, and `README.md`.
  - Comprehensive Playwright end-to-end test suite (`tests/frontend/scene-reconstruction.spec.js`).

### Changed
- `MajoorOmniCamExtractor` now accepts both video and still image sources without node graph modification.
- Hardened `OMNICAM_MOTION_SCENE` validation: seamlessly accepts additive `reconstruction` metadata without bumping `MotionScene.version` (remains version 1).

### Security & Reliability
- Strict "no auto-download" policy: OmniCam never downloads weights or executes background package installations; missing MoGe checkpoints in `ComfyUI/models/geometry_estimation/` degrade gracefully with clear UI instructions.
- Strict path sanitization and asset confinement: all generated reconstruction GLB meshes and manifests are kept strictly within ComfyUI's managed input directories.

---

## [0.1.2] - 2026-09-06

### Fixed
- Fixed release packaging to include committed frontend bundle and avoid rebuild churn on different platforms.
- Updated release contract checks for gitignored generated bundle files.

---

## [0.1.1] - 2026-09-05

### Added
- Alt-free viewport navigation options for improved ergonomics across different keyboard/mouse setups.
- `F` framing shortcut to frame selected objects or entire scene in the 3D viewport.
- New animated demo GIF and visual walkthrough documentation.

---

## [0.1.0] - 2026-09-04

### Added
- Initial public release of **Majoor OmniCam**.
- Three core product nodes:
  - `MajoorOmniCamDirector`: 3D viewport layout, keyframe animation, timeline scrubber, motion layers, and proxy playblast recorder.
  - `MajoorOmniCamExtractor`: 6DoF camera odometry solver from video (DPVO, pycolmap, OpenCV/SIFT).
  - `MajoorOmniCamMonitor`: Model profile compiler supporting Wan, LTX, MiniMax H3, and generic reference video workflows.
- Canonical `OMNICAM_MOTION_SCENE` v1 interchange contract.
