# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `h3_scene_coverage` Monitor profile: compiles the selected MotionScene
  camera directly into a MiniMax H3 scene-coverage prompt and
  `H3EDIT_OPTIONS`, without requiring a playblast. Covers one continuous,
  target-centric camera orbit/arc, with automatic loop-closure detection and
  strict representability preflight; blocks and recommends `h3_native` for
  moving targets, cuts, or more than one full turn.
- Monitor gained two new outputs, `h3edit_options` and `target_fps`, appended
  after the existing nine sockets.

## [0.3.1] - 2026-09-10

### Changed

- Extractor TRACK and Scene Reconstruction now use native ComfyUI partial
  execution instead of OmniCam's parallel heavy-job schedulers. TRACK /
  Reconstruct enqueue a partial prompt ending at `MajoorOmniCamExtractor`;
  downstream Director / Monitor / video generation is not executed.
- ComfyUI owns heavy-job ordering, cancellation and high-level progress. A
  busy GPU means the solve waits in the queue rather than a custom rejection.
- STOP cancels the actual ComfyUI job through the Jobs API.
- DPVO stays isolated in a spawned process; a ComfyUI cancel propagates into
  that process and reaps it.
- The queued result still returns through the Extractor's `NodeOutput` / UI
  envelope; both modes now share one outer transport contract.
- Post-solve refinement is decoupled from execution: dragging a cleanup slider
  re-derives the track through the bounded `POST /majoor/omnicam/extractor/refine`
  route (no decode, no solver, no job) instead of re-running TRACK.

### Removed
- The out-of-queue camera solve scheduler and reconstruction job scheduler,
  and their `/majoor/omnicam/{extractor,reconstruction}/jobs*` routes.

### Security

- Runtime upload / cache / complexity ceilings are fixed constants rather
  than `os.environ` reads.
- Native MoGe is loaded through a normal lazy import, not
  `importlib.import_module`.
- The exact Registry `node.zip` is audited before publication
  (`scripts/registry_package_audit.py`), and the GitHub Release is gated on
  the Registry reporting the version Active
  (`scripts/check_registry_status.py`).

### Added

- **Display ▸ Burn labels / annotations into the playblast** (`playblast_labels`,
  off by default): paints the viewport Labels overlay onto the recorded 2D
  canvas during a capture. The live overlay is DOM and still hides itself for a
  clean capture; this draws the same text / annotation pills via `project()` so
  they scale with the playblast resolution. Mirrors *Keep the grid in the
  playblast*; also a Settings default (`MajoorOmniCam.Defaults.PlayblastLabels`).
- Starter asset library bootstrap (`scripts/bootstrap_asset_library.py`): an
  explicit, opt-in pipeline that resolves approved CC0 Kenney packs, inventories
  and validates their GLB contents, curates a ~30–45 GLB previs starter set,
  installs it under `<input>/omnicam/library/` via `manifest.register_asset()`,
  detects real humanoid rigs from inspected GLB skin/joint data, and writes a
  provenance lockfile + `SOURCES.md` + report. Never runs implicitly; licence-
  and host-gated; nothing vendored in Git. Presets: `starter`, `characters`,
  `characters-extra`, `props`, `vehicles`, `environment`, `environments-extra`.
  `--dry-run` / `--verify` / `--from-dir` / `--update` / `--json` supported.
- `omnicam.assets.bootstrap` package (source registry, Kenney resolver, bounded
  downloader, ZIP-safe archive inventory, header-only GLB inspector, curation
  engine, install transaction, lockfile + report) and
  `omnicam.assets.rig.hierarchy_is_plausible()`.
- Local restricted-licence character import: `bootstrap_asset_library.py
  --character-dir <folder>` (+ `--license-note`, `--id-prefix`) inspects every
  `.glb` / `.fbx` in a pack you downloaded yourself (e.g. Quaternius *Universal
  Animation Library* — QAL v1.0 forbids automatic download / redistribution),
  and installs the rig-complete ones as `character` rows with the real bone map
  and embedded clips. Merges into the existing lockfile / `SOURCES.md`; no
  network. `SOURCES.md` is now regenerated from the full lockfile. Also exposed
  in the Director → ASSETS panel as a folder button + `POST
  /majoor/omnicam/library/import-local` (Scan / Install; the panel refreshes
  itself, no ComfyUI restart).
- Binary-FBX skeleton inspector (`omnicam.assets.bootstrap.fbx_inspect`) and
  `omnicam.assets.rig.deform_joint_names()` (strips IK/control/`_end` bones
  before rig mapping). The `starter` preset now also downloads Kenney's three
  *Animated Characters* packs, whose `characterMedium.fbx` is the only Kenney
  rig that satisfies all 22 `OMNICAM_HUMANOID_V1` joints; *Blocky* / *Mini
  Characters* install as animated proxy props (7-bone stylised rig). GLB is
  preferred over the FBX mirror when a pack ships both.

### Changed

- The unified asset catalog is now the single source of truth for **both** the
  Director and Reconstruction. Blockout / hybrid / scan asset retrieval resolves
  placements through the catalog first; the legacy `blockout_library/library.json`
  is only an optional compatibility fallback. When no blockout library is
  installed at the managed location (e.g. after `--disable-legacy-blockout`) but
  the catalog holds file-backed assets, reconstruction uses the catalog instead
  of failing with "asset library unavailable". An explicit
  `recon_asset_library_path` that is missing or empty is still a hard error.
- `scripts/fetch_blockout_library.py` now shares the Kenney page resolver,
  bounded download and ZIP-safety core with `omnicam.assets.bootstrap` — one
  Kenney downloader in the project. Its legacy flags and `library.json` /
  `SOURCES.md` output are unchanged.
- Examples: `07_minimax_h3_native_global_example.json` is now the full
  Omnicam → MiniMax H3 reference production graph (external-reference Monitor,
  Set/Get virtual wiring, upscale + interpolation chain). The example-workflow
  test suite now exempts graphs that use Set/Get virtual wiring from the
  `links[]`-topology checks and reads the Monitor profile / timeline widgets by
  value rather than by fixed index.

### Fixed

- `bootstrap_asset_library.py --disable-legacy-blockout` (and `--enable-…` to
  undo) renames `<input>/majoor_omnicam/blockout_library/library.json` so the
  unified catalog stops mounting it as the `legacy` source — after the starter
  library is installed its ~23 rows (Chair, Table, Sofa…) duplicate the
  `_01` starter props.
- Rig auto-mapper (`omnicam.assets.rig` + `web-src/.../rig-profile.js`) now
  knows the Epic / Unreal *SK_Mannequin* skeleton (`spine_01/02/03`, `calf_l`,
  `ball_l`) used by Quaternius UAL2, MetaHuman and many CC0 packs — previously
  `chest` / `lower_leg_*` stayed unmapped and the character was rejected.
  `--character-dir` also de-duplicates a pack that ships one rig as several
  exports (mesh-only / +anims / +root-motion, GLB and FBX).
- `manifest._write_rows` retries the catalog `os.replace` on a Windows
  `PermissionError` (AV / indexer holding the file), which a rapid install loop
  of dozens of `register_asset` calls could hit intermittently.
- Settings: every OmniCam preference now shows up in **Settings > OmniCam**. The
  catalogue declared a shared 3-segment `category` path (`OmniCam / Director /
  <group>`), and ComfyUI's settings dialog collapses entries that share a full
  path onto one tree node — so only the last-registered preference of each group
  survived and 47 of 58 (including **Default playblast resolution** and **Default
  playblast quality**) were invisible. Category paths are now `OmniCam / <group>
  / <name>`, one leaf per preference.
- Playblast: deterministic WebCodecs recording no longer fails with
  `options.quality must be a number, or one of 'very-low', 'low', 'medium', …`.
  The `balanced` quality preset was passed straight to mediabunny's `Quality()`,
  which rejects it; `low` / `balanced` / `high` now map to `QUALITY_LOW` /
  `QUALITY_MEDIUM` / `QUALITY_HIGH`.

## [0.3.0] - 2026-09-09

- Director Viewport: improved **Camera Near Clipping & Backface Culling**:
  - **Double-Sided Shading by Default (`THREE.DoubleSide`)**: Studio clay (`neutral`), dark matte (`matte`), and UV checkerboard now render two-sided by default. Interior architectural models, rooms, walls, and thin single-sided polygons remain solid and visible from both interior and exterior camera angles.
  - **Backface Culling Quick Toggle**: added a dedicated Backface Culling toggle button (`overlay-cull-btn` / `toggle-cull-overlay`) in the viewport header overlay cluster and under the Display toolbar menu (`backface-culling`), allowing single-sided culling inspection at will.
  - **Ultra-Close Near Clipping**: reduced the minimum safe near clipping clamp from `0.005` to `0.0005`, preventing camera lenses from slicing through close-up walls, ceilings, and indoor architectural geometry in tight shot layouts.
  - **Two-Way Near/Far Clip Synchronization**: synchronized `[data-role="camera-near"]` and `[data-role="camera-far"]` DOM inputs in `setFrame` and `syncFromWidgets`, ensuring real-time display and updates of camera clipping planes.
  - **Quick Near-Clip Presets**: added one-click preset buttons (`0.001` Interior, `0.01` Standard, `0.1` Large) under the Inspector's Projection & Clipping section.
- Director Viewport: completely overhauled **3D Viewport Look & Aesthetics**:
  - **Atmospheric Studio Cyclorama**: graded 6-stop sky dome with horizon glow, eliminating pitch-black voids.
  - **Atmospheric Distance Fog**: soft exponential distance fog fading grid and distant geometry smoothly into the horizon.
  - **Expansive Floor Sweep & Contact Shadows**: widened floor plane (180x180) with smooth radial falloff and natural contact shadows.
  - **Velvety Studio Clay Material**: upgraded neutral proxy shader (`roughness: 0.48`, `metalness: 0.06`) catching soft environmental specular highlights on mannequins, cylinders, toruses, and custom 3D models.
  - **Three-Point Studio Rig**: calibrated Key (3400K, soft PCF shadows), Fill, Rim kick, and cavity bounce lighting.
  - **Dual-Tier 3D Grid & Ground Axes**: major 5-unit grid, fine 1-unit grid, plus Ruby Red X and Cobalt Blue Z ground coordinate lines.
  - **Luminous Camera Trajectory & Frustum**: glowing spline with flight direction chevrons, keyframe waypoint halos, active amber beacons, and volumetric translucent film gate quads.
  - **Polished Transform Gizmos**: vibrant modern DCC colors (`#f43f5e`, `#10b981`, `#3b82f6`), shaded arrowheads, and circular frosted glass navigation widget.
- Director Viewport: added **Camera HUD & OSD** displaying live lens focal length, FOV, target distance,
  **Camera Lock toggle (`🔒`)** preventing accidental navigation, and quick horizon roll reset (`⮑`).
- Director Viewport: added **Coordinate Space toggle (`W` / `L`)** and **Snapping quick toggle (🧲)**
  directly to the vertical tool rail.
- Director Viewport: added **Quick Overlays cluster** (Floor Grid, Wireframe on Mesh, Gizmos, Thirds Guides, Safe Areas, 2D Radar)
  and **Shading Mode selector** (Omni Ref, Graybox, Textured, Wireframe, Wireframe + Texture, Grid, Beauty) in the viewport header corner.
- Director Materials & Shading: overhauled **Materials & Display Modes**:
  - **Expanded Object Material Modes**: `textured` (Textures/Media), `wireframe_texture` (Wireframe on Textured/Media), `checker` (UV Checkerboard), `neutral` (Velvety Studio Clay), `wireframe_neutral` (Wireframe on Clay), `wireframe` (Pure Wireframe lines), and `matte` (Matte Dark), with live per-object color tinting.
  - **Wireframe Overlay Quick Toggle**: added a dedicated wireframe overlay button (`data-role="overlay-wireframe-btn"`) in the viewport header to toggle edge visualization over any shaded surface instantly.
  - **Depth-Tested & Animated Mesh Overlays**: wireframe overlay lines render with proper depth testing (`depthTest: true`) over shaded geometry and remain dynamically bound to rigged character/model skeletons during animation playback.
- Director Viewport: added **Fullscreen Floating Mini-Transport** with transport controls, SMPTE timecode, and frame counter.
- Director Outliner: added **Alt+Click Isolate mode** on the visibility eye icon to quickly isolate or restore scene objects.
- Director Inspector: added standard **Sensor / Gate Presets** (`Full Frame 35mm`, `Super 35`, `Micro 4/3`, `16:9 Digital Cinema`, `Mobile 9:16 Vertical`).
- Director: added **Card (`card`)**, **Cylinder (`cylinder`)**, and **Torus (`torus`)**
  primitive creation buttons to the Outliner quick-bar, toolbar, and viewport context menus.
  "Ground" in the quick-bar is replaced by "Card", while preserving full backward compatibility
  for scenes containing legacy `ground` objects.
- Director: replaced the human proxy box with an authentic **low-poly human figure (mannequin)**
  procedural 3D mesh (faceted head, neck, chest, pelvis, arms in relaxed A-pose, and legs
  grounded at y = 0 on the floor plane), optimized into a single draw call BufferGeometry.
- Director: expanded keyframe interpolation with **12 easing modes** (`ease`, `smooth`, `bezier`,
  `linear`, `ease_in`, `ease_out`, `hold`, `sine`, `cubic`, `quintic`, `expo`, `back`) and
  **6 tangent modes** (`auto`, `clamped`, `vector`, `free`, `aligned`, `flat`) with handle editing.
- Director: added **Graph Editor vertical drag-resize** (`graph-resize` / `graph_height`) and
  **Side Panel horizontal drag-resize** (`side-resize` / `side_width`), both persisting in
  workflow state and keyboard-accessible.
- Director: added **Vector Axis Quick-Reset (`⟲`)** buttons next to Position, Rotation, Scale,
  and Camera coordinates in the Outliner and Inspector.
- Director: added `18mm` lens preset, sticky headers for outliner and health panels, and
  smooth arrow-key navigation across scene tree items and inspector tabs.
- Director: added freehand **Draw Camera Path** authoring in Top View with
  playback-range timing, tangent Follow Path orientation, non-destructive Look At,
  cancel-safe pointer handling, and editor-only path preview.
- Director: **Draw Camera Path now works in every editor view** — the stroke is
  laid on a plane chosen from the current view (top/bottom → horizontal,
  front/back → Z-fixed, left/right → X-fixed, perspective/iso → the view-facing
  plane), so a path can be sketched with real height changes, not only on the
  ground. Keys pick up a 3D tangent aim; top/bottom keep the source pitch.
- Director: added **Continue Camera Path** (toolbar arrow beside the pencil) —
  seeds a new stroke from the active camera's last keyframe and appends the new
  keys to that track, extending duration / playback range when needed, instead
  of creating a camera.
- Director: a camera's **whole path is now a transform target**. Select it from
  the camera context menu, the Outliner row action, or by clicking the path line
  in an editor view; the gizmo sits at the path centroid and one drag
  **moves / scales / rotates every keyframe together** (position and target).
  With a path selected: `T`/`R`/`S` pick the gizmo mode and arrows / `PageUp`–
  `PageDown` nudge the whole path by a grid step. Undo reverts the drag in one
  step.
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
- Example workflows refreshed for OmniCam `0.3.0`, with explicit Director
  starter state matching the new Perspective / Simple / Animation defaults and
  the reconstruction workflow listed in `examples/README.md`.
- Added `07_minimax_h3_native_global_example.json` as a shipped MiniMax H3 native
  workflow example, linked directly from the README files.

### Changed
- Graph Editor curve and dope-sheet canvas now dynamically reads `clientHeight` instead
  of a hardcoded 220px baseline, completely eliminating vertical stretching or distortion
  when resizing the graph panel.
- Outliner quick-bar and creation menus replaced "Ground" with "Card" to prioritize
  media billboard workflows, while maintaining strict backward compatibility for existing
  scenes with legacy `ground` primitives.
- Outliner search input, quick primitive buttons, and category filter chips are styled with
  sticky positioning to remain accessible during vertical list scrolling.
- Scene validation schema (`OBJECT_TYPES`) in `omnicam/core/validation.py` expanded to
  formally validate `cylinder` and `torus` primitives alongside `card`, `cube`, `sphere`,
  `human`, and `null`.
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
- Director viewport defaults now open consistently in Perspective view with
  Simple navigation, Animation density and the radar mini-map enabled; the
  quick-view buttons are synchronized during initial widget sync so `Camera`
  no longer remains visually active after a new node is created.
- Batch Hide / Show now writes the canonical scene-object `enabled` field
  instead of a non-rendered `visible` mirror, so hiding multiple selected
  objects actually removes them from the viewport and serialized scene.
- The radar mini-map selection highlight now reads the canonical transient UI
  selection (`ui.selectedObjectId` / `ui.selectedObjectIds`) instead of a stale
  `state` mirror.
- Monitor UI mounting now recognizes ComfyUI nodes whose class name is exposed
  through `constructor.comfyClass`, preventing the Monitor from falling back to
  its raw backend widgets on affected frontend builds.
- H3 Native reference-frame coverage now has regression tests for real
  `VideoFromFile`-style video batches and the MiniMax H3 reference socket
  contract.
- Fixed Graph Editor canvas vertical stretching and curve point misalignments caused
  by a static 220px coordinate scale when `graph_height` was resized.
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
