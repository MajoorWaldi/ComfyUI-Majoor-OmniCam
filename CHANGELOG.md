# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Director: added freehand **Draw Camera Path** authoring in Top View with
  playback-range timing, tangent Follow Path orientation, non-destructive Look At,
  cancel-safe pointer handling, and editor-only path preview.
- Director: the active camera's keyframes are now an **editable spatial curve** in
  the viewport — enlarged control dots (a fixed colour, distinct from the camera's
  path line), draggable in 3D, each with in/out **Bézier tangent handles** you can
  grab to reshape the move without redrawing. A keyframe's right-click menu adds a
  **Handle Type** submenu — Auto Smooth / Aligned / Free / Corner — stored on the
  keyframe's tangents and round-tripped through save and undo.
- **Resizable Director panels**: the Outliner object list and the lower-deck
  camera-preview column can be dragged to any size (a horizontal splitter
  between the previews and the timeline, a vertical handle under the object
  list). Both handles are keyboard-operable (`role="separator"`, arrow keys to
  nudge, `Shift`+arrow for a larger step, `Home` / double-click to reset), and
  the chosen sizes persist in the editor state (`outliner_height`,
  `preview_width`) so a saved workflow reopens with the same layout. The
  Outliner list gets an explicit, drag-controlled height and the node grows to
  fit, so a long scene is read at full height instead of through a cramped
  inner scrollbar.

### Changed
- Camera-preview strip re-laid-out as a flex column (was a CSS grid whose
  aspect-ratio tiles could overlap and mis-frame in Chromium/Edge when the
  column was widened); the strip is no longer height-capped, so a wider column
  genuinely enlarges each preview.
- Playback no longer rebuilds the whole timeline every frame. A frame tick now
  updates only the playhead / timecode / viewport / motion heads; the keyframe
  lane, the audio-waveform canvas and the `O(duration)` Camera Health pass are
  rebuilt only when the timeline structure changes.
- Camera previews render round-robin during playback (active camera every
  frame, the rest one per frame) instead of a full WebGL scene render per tile
  per frame.
- A single `requestRender()` frame scheduler coalesces high-frequency repaint
  sources (playback, viewport drags, wheel / keyboard navigation) into one
  render per frame; editorial-view navigation defers full state serialization
  to the rAF-batched path.
- The Monitor's live poll memoizes the motion-scene fingerprint by exact
  `state_json` and skips re-encoding the preflight payload when nothing an
  edit could touch has changed.
- A live viewport-language change now re-renders the state-driven parts of every
  mounted Director and states plainly that a reload is needed for the rest.

### Fixed
- Media lifecycle: a replaced `<video>` is stopped and unloaded, `ui.disposed`
  / request-generation guards run after every `await`, and node removal tears
  down its decoder — no more decoding continuing behind a dropped reference.
- Oversized uploads are refused in the browser before the file is read into
  memory (FBX, model, card, audio, background image / sequence), mirroring the
  `omnicam/routes.py` ceilings.
- Viewport quality / adaptive-quality settings now repaint mounted Directors
  immediately (the previous `ui.invalidate()` call did nothing).
- Point-field 2D fallback caches its static geometry, caps the drawn point
  count and batches by colour + radius instead of one `fillStyle` / `arc` /
  `fill` per point.

### Accessibility
- The per-node help popup is a real modal dialog (`role="dialog"`,
  `aria-modal`, initial focus, focus trap, focus returned to the opener on
  close). The Director status pill is a polite live region; the 3D viewport
  canvas has an accessible name.

### Internal
- `viewport-controls/interactions.js` drag/snap/marquee helpers extracted to
  `viewport-controls/drag-helpers.js`.
- New non-blocking Playwright frame-budget suite
  (`tests/frontend/playback-budget.spec.js`).

---

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
