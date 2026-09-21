# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-09-21

### Added

- Director Graph Editor gained a camera-only **Timing / Speed** view backed by the existing per-key Timing Weight contract, with Custom / Constant / Ease In / Ease Out / Ease In-Out remap presets. Apply Remap bakes timing into ordinary camera key frames without changing MotionScene schema or introducing model-specific camera semantics.
- Camera Health gained **Inspect Timing**, which opens the active camera directly in the Timing / Speed graph for manual repair after speed, acceleration or jerk diagnostics.
- Extractor gained optional **Horizon Stabilization** (`0..1`): a per-pose residual-roll damper applied after global Level Horizon/alignment and before quaternion continuity/smoothing. It preserves position and look direction and defaults to zero for backward compatibility.
- Viewport label annotations now render into view-mode playblasts as well as capture mode, alongside multiselect group editing (select and transform several path keyframes or objects together) and a refreshed card design.

### Changed

- Director now shows a compact status shell with an OPEN DIRECTOR button
  instead of embedding the full editor in the graph; the heavy editor (and
  its three.js viewport) loads only when opened, in a body-level workbench
  window.
- Director's external Agent bridge and semantic API now work identically
  whether or not its workbench is open; a Director never needs to be opened
  for a workflow to save/reload its state or for an Extractor reconstruction
  to be adopted into it.
- Extractor reverted to mounting its full panel (DOM, media, 3D viewer)
  inline in the node for the node's whole lifetime, replacing the compact-
  shell/workbench toggle it briefly grew alongside Director's. A queued
  TRACK / Scene Reconstruct solve still only cancels on node removal, not on
  any close step -- there is no longer a separate close step at all.
- Extractor's Scene Reconstruct 3D preview now mounts automatically on
  entering Scene Reconstruct mode and stays active for the node's life,
  matching Camera Track's TRACK 3D tab instead of hiding behind its own gate.
- The floor grid is now built once as a persistent group instead of being
  rebuilt on every viewport `rebuild()`, and stays under `content` so
  capture-guide traversals and grid-only modes see it consistently.

### Fixed

- Label offset across HiDPI displays, playblasts, and human-origin objects
  in the viewport.
- `MoGeInference.execute()` is now called with `refine_steps` only when the
  installed ComfyUI core's signature accepts it, fixing a `TypeError` that
  broke every Scene Reconstruct run against stable ComfyUI builds that
  predate that parameter.
- Depth Mesh Scene Reconstruct now recentres its Source Camera and
  environment mesh onto the recovered floor plane, matching the
  Blockout/Hybrid/Scan leveling behaviour instead of leaving the camera at
  a literal `(0, 0, 0)` disconnected from the recovered floor.
- The shared subject-card placeholder texture is no longer disposed when a
  single viewport instance rebuilds or closes, which could flicker or
  corrupt the placeholder in other open Director nodes.
- A manually typed clip duration no longer gets silently reverted by the
  next upstream media re-sync; the duration widget is marked user-owned on
  manual edit and only re-derived when the connected media source actually
  changes.
- Capture grid is now kept under the viewport's content group across
  rebuilds instead of being dropped from grid-only and capture-guide
  traversals.

## [0.3.3] - 2026-09-14

### Security

- Removed the host-filesystem folder import route and its Director UI/API; user
  models continue to enter through bounded multipart upload into Comfy-managed
  directories.
- Kept developer asset bootstrap tooling in the repository while excluding it,
  its source registry, documentation and other development paths from the
  Registry runtime package.
- Removed installer command signatures from shipped runtime messages and help.
- Expanded the exact `node.zip` audit for process execution, unreviewed network
  clients, request-derived host paths, archive literals and JavaScript provenance.
- Preserved the exact archive, SHA256, audit JSON and Registry status response in
  the publish workflow; GitHub Release finalization remains gated on Active.

## [0.3.2] - 2026-09-14

### Added

- Spatial Camera Editor v2: the Director viewport's object, camera, camera
  target and camera-path transforms are now driven by a real Three.js
  `TransformControls` gizmo (World/Local space, live Ctrl/Cmd grid+angle
  snapping, Escape-to-cancel mid-drag), replacing the previous canvas-drawn
  handles end to end while keeping every existing shortcut (`T`/`R`/`S`),
  undo step and lock behaviour unchanged.
  - Camera path keyframes can now be multi-selected (click to select one,
    `Shift`+click to add/remove another) and transformed as a group or as
    the whole path, in addition to the existing single-key drag.
  - New spatial editing operations on a path: insert a keyframe by
    double-clicking the path line (preserves the existing Bézier shape),
    and delete one or more selected keyframes with `Delete`/`Backspace`.
  - A selected keyframe can now edit either its own **Position** or its
    look-at **Target**, switchable from its right-click menu; target
    editing is disabled while an active **Look At** constraint drives that
    camera, so a hand-drag can never silently fight the constraint.
  - A compact **Camera Path Presets** dialog (Static, Dolly, Truck,
    Pedestal, Crane, Arc, Orbit, Spiral) generates an ordinary, fully
    editable camera path over the active Playback Range.
  - New per-key **Timing Weight** and a **Redistribute Timing** action
    reflow a path's keys across its existing first/last frame by their
    relative weights, without changing its shape.
  - New read-only **Camera Path Diagnostics** (speed spikes, near-static
    holds, sharp direction changes, near-collision with a scene object)
    surface under the Shot Inspector's timing controls.
  - New `camera.path.insert_key`, `camera.path.delete_keys`,
    `camera.path.transform_keys`, `camera.path.redistribute_timing` and
    `camera.path.apply_preset` Semantic Director API operations give the
    Agent parity with the manual UI's path editing — both go through the
    same pure path math.
  - All of the above stay ordinary, model-independent `OMNICAM_MOTION_SCENE`
    camera keyframes: no MiniMax H3, Wan or LTX-specific behavior is
    encoded into a path by drawing, editing, multi-selecting or presetting
    it. Monitor profiles remain conditioning compilers, not path-execution
    engines — no profile, including either H3 profile, guarantees a
    downstream model reproduces an authored 3D path exactly.
- `h3_scene_coverage` Monitor profile: compiles the selected MotionScene
  camera directly into a MiniMax H3 scene-coverage prompt and
  `H3EDIT_OPTIONS`, without requiring a playblast. Covers one continuous,
  target-centric camera orbit/arc, with automatic loop-closure detection and
  strict representability preflight; blocks and recommends `h3_native` for
  moving targets, cuts, or more than one full turn.
- Monitor gained two new outputs, `h3edit_options` and `target_fps`, appended
  after the existing nine sockets.
- OmniCam Agent v1: a loopback-only PromptServer broker
  (`omnicam/agent/broker.py`, `omnicam/agent/routes.py`) plus a live Director
  browser bridge (`web-src/agent/bridge.js`) that let an external Agent
  process reach a specific, already-open Director's Semantic Director API
  (`ui.directorApi`) — the same bounded transaction/query surface an
  interactive edit uses. See `docs/AGENT_INTEGRATION.md`.
- Semantic Director API: transient `directorRevision` optimistic
  concurrency (a transaction's optional `baseRevision` is atomically
  rejected with `STALE_REVISION` when stale; every query and transaction
  response now reports `revision`), binding entity locks
  (`camera.set_locked`; every mutating camera/object/keyframe/character
  operation now checks it), bounded semantic queries (`scene.summary`,
  `object.list/get/search`, `camera.list`, `character.list`, `shot.list`,
  `keyframe.list`), and structural operations (`camera.create/duplicate/
  delete/rename/set_playblast`, `object.create/duplicate/delete/rename/
  set_parent`, `cut.upsert/remove/set_camera`).
- A `validateOnly` transaction now returns a bounded semantic diff
  (`changes`, capped at 100 records with `truncated` past that) of exactly
  what it would change, so a caller can preview a transaction before
  committing it.
- Monitor `Check` gained optional `code` / `recoverable` / `suggestions`
  fields (all absent by default; no profile call site changed) so an Agent
  or the panel can show static, reviewed recovery guidance for a known
  failure code instead of none at all.
- A working `AGENT` tab next to `SCENE` / `ASSETS` in the Director's left
  panel: describe a shot, generate a bounded Preview against a configured
  provider (Ollama / OpenAI / OpenAI-compatible / Anthropic), review the
  semantic diff, then explicit Apply or Cancel. See
  `docs/AGENT_INTEGRATION.md`'s "Built-in: the OmniCam Agent panel".
- `examples/agent/`: a headless-Agent reference workflow
  (Director -> Monitor) and a README distinguishing the headless (official
  Comfy MCP) and live (OmniCam Agent Contract v1) Agent paths.
- Agent v1 final hardening pass: native OpenAI/Anthropic custom `base_url`
  overrides are now subject to the same custom-endpoint network policy as
  `openai_compatible`/Ollama (previously hardcoded as always-official,
  letting a custom endpoint bypass the remote-provider gate); a dedicated
  `probe()` capability makes Provider Test prove real reachability instead
  of piggybacking on model discovery's intentional graceful-degrade; every
  provider/planner route redacts unknown exceptions through a single
  `public_errors.py` mapping instead of ever returning `str(error)`; the
  built-in planner is bounded to a 512 KiB total context and 128 KiB per
  observation and can no longer request the unbounded `scene.get`; the
  Agent panel discloses its outbound data boundary per provider before
  Preview; `Enable built-in Agent` now actually hides/disables the panel
  without touching the independent external Agent bridge; the inert
  `PreviewBeforeApply` setting (Preview -> Apply was always mandatory) was
  removed; `SecretStore` itself (not just the HTTP route layer) refuses to
  mutate an environment-managed credential; the provider network guard
  blocks unspecified/multicast/link-local addresses -- including the
  `169.254.169.254` cloud-metadata IP -- even when remote custom providers
  are explicitly opted in; and a post-commit viewport-resource
  reconciliation failure now surfaces as a bounded
  `VIEWPORT_RESOURCE_RECONCILE_FAILED` warning instead of a swallowed
  console message.
- The Agent's character workflow: the planner prefers a real, catalog-linked
  rigged character (`asset.catalog_search` + `asset.instantiate_by_id`) over
  the generic `human` primitive when representing a person, and chains a
  matching `character.set_motion` in the same transaction when the
  instruction names a specific action. Illustrative, file-less default
  catalog rows are excluded from this resolution so the Agent never silently
  degrades to a placeholder.

### Fixed

- A committed `camera.transform` transaction through the Semantic Director
  API could be silently overwritten by the next `serializeEditorState()`
  call, which copied the (stale) viewport camera back onto the active
  camera track after the transaction had already written its fresh values.
- `camera.create` now rejects a `far` that is invalid relative to the
  *effective* near plane (the supplied `near`, or the canonical default)
  at the API boundary, instead of relying on the state sanitizer to repair
  it downstream.
- Agent panel: `Agent.Model`/`Agent.BaseUrl` were a single pair shared by
  every provider, so switching Provider left the previous provider's model
  id and endpoint override in place (a remote proxy Base URL could
  silently carry over onto a different provider). They are now scoped per
  provider, with a one-time migration of any pre-existing value into the
  provider that was active when it was saved.
- Agent panel: a fresh install with no model configured now auto-selects
  and persists the first model the provider actually offers, instead of
  sending the first Plan request with `model: ""`.
- `POST /apply-plan` now rejects a truncated plan server-side
  (`PLAN_DIFF_TRUNCATED`) instead of relying solely on the panel disabling
  Apply client-side.
- `AgentSession` is now bound to the ComfyUI user who registered it;
  `/plan` and `/apply-plan` refuse a session or plan owned by a different
  user, reported exactly like "unknown" so existence cannot be probed
  across users.
- The Agent bridge now awaits the Director API's background viewport
  resource reconciliation before replying, so a reconciliation warning
  (design spec Task 11) reaches the external Agent's response instead of
  only ever landing in a same-process caller's already-returned `result`.
- `POST /providers/{provider}/test` now returns the failure's actual HTTP
  status instead of always answering 200 with `ok:false`.
- Agent provider network guard: outbound provider requests now resolve
  through a pinned DNS resolver that re-validates every resolved address
  against the same sensitive-address policy at actual connection time,
  closing a DNS-rebinding gap the literal-URL check alone could not.
- Reconstruction cache deletion no longer unloads every ComfyUI-resident
  model unconditionally: the global VRAM release is skipped while the
  queue is executing a (possibly unrelated) workflow, and the Clear Cache
  button now awaits its own job's cancellation before wiping the cache.
  Cache deletion and the model release now run off the HTTP event loop.
- Concurrent asset catalog registrations (register/patch/delete/prune, each
  dispatched into a worker thread by their route handlers) could race each
  other's read-modify-write and silently drop one caller's row; the whole
  transaction is now serialized, and the atomic-replace temp file is now
  unique per call, not just per process.
- Monitor now wraps an IMAGE-batch playblast at the frame rate the compile
  actually resolved to, instead of always the generic 24fps default --
  their duration and the compiled timeline could silently disagree.
- A disabled sequence edit (`sequence.enabled: false`) no longer leaks its
  dormant cuts into the compiled MotionScene; `is_multi_shot` and every
  profile gate built on it now reflect only the edit that was actually
  recorded.
- glTF camera import now composes every ancestor's transform (translation/
  rotation/scale, including animated ancestors) into world space instead of
  reading only the camera node's own local transform, and decodes a
  `matrix`-authored node the same as an explicit TRS one.
- glTF camera import now evaluates each animation channel's own
  interpolation mode: STEP holds the previous key instead of interpolating,
  CUBICSPLINE evaluates the Hermite basis through its in/out tangents
  instead of discarding them, and LINEAR rotation slerps instead of
  lerping raw quaternion components.
- Reset Scene now restores the exact snapshot Save Scene last submitted to
  the server, rather than a fresh read of the live editor state once the
  save request resolves -- an edit made while a save was in flight no
  longer gets silently promoted to "the last save".
- Extractor spike-repair (`apply_spike_actions`) no longer scans backward/
  forward per marked sample; a long contiguous marked run used to make
  refinement quadratic in the number of poses. The refine route now also
  runs off the HTTP event loop.

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
