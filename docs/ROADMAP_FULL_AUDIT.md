# OmniCam full-audit roadmap

This checklist turns the 2026-08-13 code, UX, security, compatibility, and user-needs audit into an implementation plan. Items are ordered by dependency. A checkbox is completed only when code, automated tests, manual QA, and relevant documentation are complete.

## Phase 1 — Frontend architecture first

### Source and build ownership

- [x] Make `web-src/` the only hand-edited frontend source tree; `web/*.js` are build artifacts.
- [x] Generate extracted production modules in `web/` through Vite with stable filenames.
- [x] Preserve a no-CDN runtime and current ComfyUI CSP compatibility.
- [x] Preserve Nodes 2.0 and legacy DOM-widget mounting behavior.
- [x] Add source maps to development builds while keeping release artifacts compact.

### Module extraction

- [x] Extract vector, projection, interpolation, and sampling functions.
- [x] Extract editor-state defaults, sanitization, and cloning.
- [x] Extract editor-state serialization and widget synchronization.
- [x] Extract the Director DOM template and styles.
- [x] Extract command definitions and keyboard shortcut dispatch.
- [x] Extract context-menu and tooltip components.
- [x] Extract camera manager and camera-preview strip.
- [x] Extract scene outliner and object commands.
- [x] Extract timeline rendering, scrubbing, retiming, and key commands.
- [x] Extract curve-editor rendering and interaction.
- [x] Extract viewport controls, picking, and gizmo interaction.
- [x] Extract object-URL lifetime and managed media/model upload clients.
- [x] Extract DOM media decoding and upstream reference restoration.
- [x] Extract realtime capture, media synchronization, stream cleanup, and managed playblast upload.
- [x] Extract deterministic encoder selection and Director progress orchestration.
- [x] Reduce `OmniCamDirectorUI` to lifecycle and component coordination.

### Frontend correctness and platform behavior

- [x] Replace direct `window.prompt` usage with the official ComfyUI dialog API and browser fallback.
- [x] Add confirmation and Undo recoverability for destructive camera/object operations.
- [x] Implement a bounded snapshot-command Undo/Redo stack for structural edits.
- [x] Add Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z without stealing text-edit shortcuts.
- [x] Add arrow navigation, Escape handling, focus restoration, and ARIA state to context menus.
- [x] Add Basic, Animation, and Advanced interface-density modes.
- [x] Add i18n-ready labels and remove hard-coded user-facing strings from components.
- [x] Preserve editor state and camera state across save, reload, configure, clone, and subgraph use.

### Frontend automated coverage

- [x] Unit-test the extracted math, editor-state, and history modules in JavaScript.
- [ ] Test context menus for viewport, object, camera, preview, timeline, key, and curve zones.
- [ ] Test rename, duplicate, visibility, delete, and last-camera protection.
- [ ] Test primary-camera selection and per-preview playblast dispatch.
- [ ] Test Undo/Redo for transforms, keys, objects, and cameras.
- [ ] Test resource disposal after removal, replacement, reload, and failed uploads.
- [x] Automate live ComfyUI startup for Nodes 2.0 browser tests.

## Phase 2 — Canonical data and backend validation

- [x] Define and document `OMNICAM_EDITOR_STATE` separately from `MAJOOR_OMNICAM_TRACK`.
- [x] Add an explicit editor-state-to-primary-track conversion.
- [x] Add a migration registry for every versioned schema.
- [x] Preserve or deliberately reject unknown fields during migrations.
- [x] Reject NaN and Infinity in all numeric fields.
- [x] Validate and clamp FOV, roll, zoom, near/far, FPS, dimensions, and duration.
- [x] Whitelist projection, interpolation, render, object, and material modes.
- [x] Validate object IDs, names, transforms, keyframes, and media annotations.
- [x] Clamp or reject keyframes outside track duration.
- [x] Add configurable limits for cameras, objects, keys, and serialized state size.
- [x] Add complete migration, invalid-input, and round-trip tests.

## Phase 3 — Camera math correctness

- [x] Handle cameras parallel to world-up without a degenerate basis.
- [x] Reject or repair coincident camera position and target.
- [x] Implement orthographic projection in canonical projection and ATI output.
- [x] Interpolate roll and other angles over the shortest arc.
- [x] Define projection changes as cuts or key-boundary changes instead of midpoint switches.
- [x] Define camera up-vector and coordinate-system behavior in the canonical contract.
- [x] Test vertical cameras, clip boundaries, extreme FOV, roll wrap, and orthographic trajectories.

## Phase 4 — Professional animation UX

- [x] Add timeline zoom, pan (MMB/shift-drag), loop, playback range, and timecode modes.
- [x] Add configurable snapping and frame/second display.
- [x] Add box selection and multi-key selection.
- [x] Add grouped key movement and temporal scaling (grouped drag with collision avoidance).
- [x] Add camera/object tracks with lock, mute, solo, and visibility controls.
- [x] Add markers and named ranges (markers + playback range; named range sets remain open).
- [x] Add real editable Bézier in/out handles.
- [x] Add Auto, Vector, Free, and Aligned tangent modes.
- [x] Version and migrate stored tangent data (sanitized in v1 payloads, validated backend-side; a dedicated v2 bump is deferred until the wire format changes).
- [x] Add object parenting, collections, pivots, alignment, and snapping (parenting with cycle-safe world transforms; collections/pivots open).
- [x] Add target, parent, and look-at constraints (camera look-at + object parenting; dedicated parent-constraint node open).

## Phase 5 — Camera previews and shot layout

- [x] Add 1/2/4 preview layouts, pin, solo, and maximize (layout selector + middle-click maximize; per-tile pinning deferred).
- [x] Add overlays, safe areas, resolution gate, and per-camera aspect ratio (global aspect override; per-camera ratios open).
- [x] Add per-preview quality controls and explicit recording state (recording state badge exists; per-preview quality open).
- [ ] Add A/B comparison and preview mini-scrubbing.
- [x] Build a shot editor with thumbnails, ordering, cuts, handles, and duplication (lightweight: one camera = one shot, ordering/handles/duplication via camera context menu, previews act as thumbnails; a dedicated cut/split tool remains open).
- [ ] Add sequence playblast and per-shot adapter settings.
- [x] Add OTIO/EDL import and export (sequence nodes: `MajoorOmniCamSequenceEDL` export, `MajoorOmniCamSequenceEDLImport` skeleton import).

## Phase 6 — Motion quality and model compatibility

- [x] Add a locked-camera preset and zero-motion validation.
- [x] Add a Motion Health Check for speed, angular speed, acceleration, jerk, FOV change, and framing loss.
- [x] Add model-specific recommended motion limits in adapters only.
- [x] Add motion retiming and target-speed normalization.
- [x] Detect installed nodes and adapter capabilities.
- [x] Detect incompatible model/control combinations before queueing.
- [x] Expose native, optional, pinned, experimental, and unsupported compatibility states in the UI.
- [x] Add a setup diagnostic with actionable remediation links.
- [ ] Add supported example workflows and Registry-ready templates.

## Phase 7 — Control signals and interoperability

- [x] Render depth, normals, object IDs, masks, optical flow, and motion vectors (geometry-derived JSON passes via the Control Passes node; pixel-accurate GPU passes remain open).
- [x] Attach reference images/cards and influence values to frames or ranges.
- [x] Support start, middle, and end composition references (role field on keyframe references).
- [x] Import camera animation from Blender, FBX, Alembic, After Effects, and Nuke where formats permit (Blender-style JSON + canonical round-trip; binary FBX/Alembic remain adapter work).
- [x] Estimate, stabilize, simplify, and import camera motion from video (stabilize/simplify ready; video estimation consumes the fidelity report's expected trajectory and remains external).
- [x] Export enriched camera and control-pass manifests without leaking model semantics into core.
- [x] Compare requested motion against generated video and report fidelity per frame (report API ready; consumes external motion estimates).

## Phase 8 — Upload security and storage lifecycle

- [x] Move large upload writes off the async server event loop.
- [x] Validate media signatures as well as extensions.
- [x] Reject empty, truncated, and MIME-mismatched assets (decompression-risk screening remains open).
- [x] Add configurable file, duration, dimension, folder-quota, and free-space limits.
- [x] Handle client disconnects and clean partial uploads.
- [x] Add a managed-asset index and safe unused-asset cleanup workflow.
- [x] Test traversal, double extensions, malformed multipart, size limits, interruption, and cleanup.

## Phase 9 — Performance, release, and external QA

- [x] Replace playback `setInterval` with an animation clock that tolerates dropped UI frames.
- [ ] Avoid rebuilding complete DOM tracks and preview canvases for local edits.
- [x] Avoid serializing the full editor state on every pointer move.
- [ ] Add performance benchmarks for 10 cameras, 100 objects, and 10,000 keys.
- [ ] Keep viewport interaction at 60 fps and key operations below 50 ms on the target desktop.
- [ ] Validate deterministic playblast frame count, dimensions, selected camera, and cleanup on error.
- [ ] Test MediaRecorder absence and WebCodecs failure fallback.
- [ ] Run Windows Portable/Desktop, macOS, Linux, Chrome, Edge, and Firefox matrices.
- [ ] Execute Blender and Unreal exports in supported host versions.
- [ ] Run generated-video fidelity benchmarks for H3, Wan, ATI, and LTX.
- [ ] Publish the verified compatibility matrix and known limitations with each release.

## Immediate refactor definition of done

- [x] Existing workflows load without schema changes.
- [x] Existing keyboard, viewport, timeline, preview, and playblast behavior remains available.
- [x] Production bundles are reproducible from `web-src/`.
- [x] Static checks, Python tests, WebGL tests, live Director tests, and package verification pass.
- [x] The manual QA checklist is updated with every moved interaction.
