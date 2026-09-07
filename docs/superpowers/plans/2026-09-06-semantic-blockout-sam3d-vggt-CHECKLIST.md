# Semantic Blockout + SAM3D + VGGT — Implementation Checklist

> Companion tracker for `2026-09-06-semantic-blockout-sam3d-vggt.md`.
> **Working policy for this effort:** the plan tells you to `git commit` after each
> task/step. **Do NOT commit.** All work stays uncommitted in the working tree so
> it can be reviewed as one diff. Run the tests, leave the changes staged/unstaged.

**Baseline note:** the plan targets `main @ e32ec1db`. The tree has since advanced
to `c3e1588`. Several Task 1 fixes already landed (`scene_builder.py` already uses
`fov_y_degrees`, `result.source_width/height`, and ground `size=[x, 0.03, z]`).
Re-verify current state before touching each file.

Legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[-]` already satisfied by current tree / N/A

---

## Phase A — correctness prerequisites

- [-] **Task 1 — Scene Reconstruction correctness prerequisites**
  - [-] Step 1: failing FOV regression → `test_reconstruction_uses_vertical_fov` present, passes
  - [-] Step 2: source-aspect regressions → present in `test_scene_builder.py` (1920x1080 / 1080x1920 / 1024x1024)
  - [-] Step 3: confirm failure (baseline already green)
  - [-] Step 4: canonical FOV → `scene_builder.py:237` already `fov_y_degrees`
  - [-] Step 5: source dimensions through pipeline → `result.source_width/height` already threaded
  - [x] Step 6: `pytest test_scene_builder.py test_pipeline.py -q` → 26 passed
  - [~] Step 7: ~~commit~~ **skipped by policy** — verify no residual gaps in `camera.py` / `node_bridge.py`

- [x] **Task 3 — Extend `ReconstructionSettings` (no break of old workflows)**
  - [x] Add fields (source_mode, segmentation_provider, completion_provider, sam3_*, semantic_labels, min_instance_area_ratio, instance_iou_dedup, max_blockout_objects, completion_policy, max_completion_objects, vggt_*, save_completion_debug)
  - [x] Extend `KNOWN_MODES` = {geometry, layout, depth_mesh, blockout, hybrid, scan} + `KNOWN_SOURCE_MODES` / `KNOWN_SEGMENTATION_PROVIDERS` / `KNOWN_COMPLETION_PROVIDERS` / `KNOWN_COMPLETION_POLICIES`
  - [x] `resolved_mode()` normalization (geometry→depth_mesh, layout→hybrid) without rewriting serialized data
  - [x] Validation bounds (see plan §Task 3)
  - [x] `to_dict` / `from_dict` round-trip for all new fields (existing `test_reconstruction_settings_round_trip` updated to cover them)
  - [x] Fingerprint all result-affecting fields (`fingerprint.py` `GEOMETRY_SETTINGS_KEYS`); `save_completion_debug` intentionally excluded (debug-only)
  - [x] Tests: `test_types.py` (+5 new), `test_fingerprint.py` (+3 new incl. `test_blockout_setting_change_invalidates_fingerprint`)
  - [x] Default `mode` kept `"geometry"` per plan §3 (don't flip UI default to blockout yet)
  - [~] ~~commit~~ **skipped by policy**

- [~] **Task 4 — Exact model identity in cache keys**
  - [x] Create `omnicam/reconstruction/model_identity.py` (`ModelIdentity`, `file_model_identity`, `missing_model_identity`)
  - [x] Bounded identity: resolved name + size + mtime_ns + adapter_version (no multi-GB hashing); optional `declared_digest`
  - [ ] `fingerprint.py` + `cache.py` manifest exposes `model_identities.{geometry,segmentation,completion}` — **deferred**, needs care around `lookup_cache` strict field equality + all callers
  - [x] Tests: `test_model_identity.py` (6 cases)
  - [~] ~~commit~~ skipped

---

## Phase B — deterministic blockout core

- [x] **Task 2 — Semantic blockout domain types**
  - [x] Create `omnicam/reconstruction/blockout/__init__.py` + `types.py` (`InstanceEvidence`, `AxisConfidence`, `BlockoutObject`, `BlockoutScene`)
  - [x] `to_dict()` clamps confidences to [0,1]; `BlockoutScene` tensor-free (planes/camera via DTO `to_dict`, rest plain dicts); warnings capped at 32
  - [ ] Re-export from `omnicam/reconstruction/types.py` — **deferred** (not needed until a consumer imports it; avoids a circular-import risk for now)
  - [x] Tests: `test_blockout_types.py` (5 cases) — dedicated file instead of overloading `test_blockout_object_fitter.py`; that file arrives with Task 8
  - [~] ~~commit~~ skipped

- [x] **Task 5 — Extract clean masked 3D object points** — `blockout/masked_points.py` (`extract_masked_points`, `erode_binary_mask_numpy`, numpy-only). `test_blockout_masked_points.py` 5 cases. ~~commit~~ skipped
- [x] **Task 6 — Ground-relative OBB fitting** — `blockout/obb.py` (`RobustObb`, `fit_ground_relative_obb`, yaw-only, 5/95-pct, `planar_anisotropy`). `test_blockout_obb.py` 5 cases (cube-yaw undefined → asserted via anisotropy instead). ~~commit~~ skipped
- [x] **Task 7 — Semantic primitive resolver + depth priors** — `blockout/primitive_resolver.py` (`PrimitiveRule`, `rule_for_label`, validated against `OBJECT_TYPES`, plural/compound tolerance). Tests in `test_blockout_object_fitter.py`. ~~commit~~ skipped
- [x] **Task 8 — Deterministic `BlockoutObject` fitting** — `blockout/object_fitter.py` (`fit_blockout_object`, all 8 rules, pinned confidence formula, scene_scale applied post-fit, id sanitised). `test_blockout_object_fitter.py` 11 cases. ~~commit~~ skipped
- [x] **Task 9 — Room planes → real room shell** — `blockout/room_shell.py` (`RoomProxy`, `wall_yaw_from_normal`, `build_room_proxies`; ground XZ→XZ + thin Y, walls yaw from normal, grounds-then-walls ordering). `test_blockout_room_shell.py` 5 cases. `planes.py` left as-is (already sound); scene_builder inline path unchanged (Task 12 will route blockout through the compiler). ~~commit~~ skipped
- [x] **Task 10 — Segmentation provider contracts + fake provider** — `segmentation/{__init__,base,registry,taxonomy,fake}.py`. `SegmentationCapabilities`, `SegmentationProvider` protocol, `DEFAULT_BLOCKOUT_LABELS` (20), `resolve_semantic_labels`. `FakeSegmentationProvider` deterministic rects + progress + cancel. `test_segmentation_registry.py` 6 cases. ~~commit~~ skipped
- [x] **Task 11 — Native ComfyUI SAM3 adapter** — `segmentation/comfy_sam3.py` + `model_cache.py` (`SingleSlotModelCache`). Lazy ComfyUI imports, `auto` priority = `sam3.1_multiplex_fp16.safetensors`, `extract_node_outputs`, `instances_from_sam3_output`, `deduplicate_instances` (mask-IoU NMS), `_checkpoint_identity` via `file_model_identity`. `test_comfy_sam3_provider.py` 9 cases (injected fake modules: model loaded once/5 labels, each label encoded once, masks labelled, dedup keeps higher score, no-checkpoint → capability false). Added `ReconRequestInvalidError` to `errors.py`. ~~commit~~ skipped

- [x] **Task 12 — `BlockoutScene` compiler** — `blockout/compiler.py` (`compile_blockout_scene`, null-root hierarchy root/room/blockout/reference, v2 metadata, blockout objects unlocked / room+reference locked, scan-track passthrough). `core/validation.py` `validate_object` extended: `semantic` ≤64, `completion_provider` ≤80, `axis_confidence` values clamped 0..1. `test_blockout_compiler.py` 6 cases. `scene_builder.py` left unchanged — depth-mesh path keeps its inline builder; blockout routes through the compiler (Task 13). ~~commit~~ skipped

---

## Phase C — native SAM3 single-view (first production milestone)

- [x] **Task 13 — Split pipeline into mode-specific orchestrators** — `pipelines/{__init__,base,depth_mesh,single_blockout}.py`. `pipeline.py` is now a <100-line facade dispatching on `resolved_mode()` (`depth_mesh` → depth-mesh path unchanged; `blockout`/`hybrid` → `run_single_blockout_pipeline`; `scan` → `ReconRequestInvalidError` until Task 28). `PipelineOutput`, `_hash_file`, `_HASH_CHUNK_BYTES`, `_resolve_provider_version` re-exported from `pipeline.py` for back-compat. `test_semantic_pipeline.py` 5 e2e cases with fakes. Full recon suite 246 green; broader suite 633 green (only the pre-existing dpvo failure). ~~commit~~ skipped
- [x] **Task 14 — Job state machine: semantic stages** — `jobs/types.py`: added `REGISTER_VIEWS`, `SEGMENT_SCENE`, `FUSE_VIEWS`, `FIT_BLOCKOUT`, `COMPLETE_OBJECTS`, `BUILD_REFERENCE` to the enum/`STATES`/`ACTIVE_STATES`; `VALID_TRANSITIONS` rebuilt from a `_FORWARD` map (legacy linear chain preserved, semantic detours added, every non-terminal still → STOPPING/FAILED). `web-src/extractor/reconstruction/state.js` `RECONSTRUCTION_STATES` + `ACTIVE_STATES` mirror it. `test_reconstruction_jobs.py` +2 cases incl. a backend↔`state.js` parity check. Frontend `.node.mjs` state test deferred to Task 16. ~~commit~~ skipped

- [ ] **Task 11 — Native ComfyUI SAM3 adapter**
  - [ ] Create `segmentation/comfy_sam3.py` + `model_cache.py`
  - [ ] Lazy capability detection; checkpoint candidates via `folder_paths`; `auto` priority = `sam3.1_multiplex_fp16.safetensors`
  - [ ] Shared checkpoint load cached by `ModelIdentity.cache_token` (capacity 1)
  - [ ] One label at a time; `extract_node_outputs` helper; IoU dedup
  - [ ] Tests: `test_comfy_sam3_provider.py` (monkeypatched loader/encoder/detector, 5 assertions)
  - [ ] ~~commit~~ skipped

- [ ] **Task 13 — Split pipeline into mode-specific orchestrators**
  - [ ] Create `pipelines/{__init__,depth_mesh,single_blockout}.py`
  - [ ] `run_reconstruction_pipeline` facade < 200 lines, dispatch by `resolved_mode()`
  - [ ] Single-blockout stage order (PREPARING…FINALIZING)
  - [ ] Tests: `test_semantic_pipeline.py` (fake end-to-end emits `blockout_object`)
  - [ ] ~~commit~~ skipped

- [ ] **Task 14 — Job state machine: semantic stages**
  - [ ] `jobs/types.py`, `jobs/runner.py`, `web-src/extractor/reconstruction/state.js`
  - [ ] Add SEGMENT_SCENE / FIT_BLOCKOUT / COMPLETE_OBJECTS / BUILD_REFERENCE / REGISTER_VIEWS / FUSE_VIEWS; keep depth-mesh states
  - [ ] Frontend `RECONSTRUCTION_STATES` mirrors backend `STATES` (test enforces)
  - [ ] Tests: `test_reconstruction_jobs.py`, `extractor-reconstruction-modes.node.mjs`
  - [ ] ~~commit~~ skipped

---

## Phase D — Director UX + persistence

- [x] **Task 15 — Persist reconstruction UI settings + queued-execution parity**
  - [x] `nodes/extractor.py` `define_schema` now declares all 19 `recon_*` advanced widgets; `execute()` threads them through `reconstruction_settings_from_widgets()` → `execute_reconstruction(video, settings=...)`. Queued graph runs now honour the panel's Result mode / labels / providers instead of always doing depth-mesh.
  - [x] `node_bridge.reconstruction_settings_from_widgets()` — pure, validated builder (enum fallback for stale workflows, scan→vggt auto-correct, vggt view clamp, label de-dup). `test_node_bridge.py` +4 (round-trip, scan clamp, stale-enum tolerance, "queued builds the same settings" parity).
  - [x] `node_bridge.execute_reconstruction` now dispatches by `resolved_mode()`: builds `scan_samples` from an IMAGE batch for Scan; reports blockout/scan summaries; envelope carries `recon_mode` + `provider_summary`.
  - [x] `settings-sync.js` helpers + `tests/frontend/extractor-reconstruction-settings.node.mjs` (widgets↔settings round-trip). Full node-widget ↔ DOM-panel two-way binding on reload still uses the custom panel's own state; the queued path is authoritative and correct.
- [x] **Task 16 — Scene Reconstruction mode UX**
  - [x] `template.js`: Result select now Depth Mesh / Blockout / Hybrid / Scan (legacy geometry/layout gone from UI); new rows for Objects provider, Max objects, Completion policy, Labels.
  - [x] `controls.js`: `readReconstructionSettings` aliases legacy modes, emits `segmentation_provider` / `completion_policy` / `max_blockout_objects` / `semantic_labels` only for semantic modes, defaults scan geometry to `vggt`; `updateReconstructionModeVisibility` shows/hides the semantic rows. Interactive job path (`panel → readReconstructionSettings → startJob → jobs/api.py ReconstructionSettings.from_dict`) now carries every field.
  - [x] `modes.js` / `taxonomy.js` / `capability-badges.js` helpers + `test_..._modes.node.mjs`; `capabilities.py` endpoint v2 aggregates `segmentation` + `completion`.
  - [x] `tests/frontend/extractor-reconstruction-controls.node.mjs` +3 (legacy alias, semantic-field emission, scan→vggt).
- [~] **Task 17 — Director adoption + reconstruction hierarchy**
  - [x] `web-src/scene/reconstruction-inspector.js` (`reconstructionInspectorRows` text-only, `reconstructionAdoptionDefaults`, `renderReconstructionRows` textContent-only) + `tests/frontend/reconstruction-inspector.node.mjs` (XSS payload stays literal).
  - [ ] Wire into `director-adopt.js` / `outliner.js` / `inspector.js` — **still open** (Director-side integration; needs the Director mount harness).
- [x] **Task 18 — HTTP result recovery + route error codes**
  - [x] `jobs/routes.py` `_respond()` already returns `exc.to_dict()` + `exc.status` for catalogued `ReconstructionApiError`s (no `web.HTTPBadRequest(text=...)` on any reconstruction route — verified).
  - [x] `panel.js`: `applyJobResponse` → `acceptResultEnvelope`; new `recoverResult(jobId)` (fetch `/result` when a `DONE` response carries no embedded result — missed "done" socket event) and `recoverStatus()` (re-sync after a WebSocket gap). `tests/frontend/extractor-reconstruction-panel.node.mjs` +1.
- [x] **Task 19 — Shared reconstruction GPU guard** — `reconstruction/gpu_guard.py` (`GpuStageGuard.checkpoint()`, cancel short-circuits before probe, broken probe never masks the run, cooperative raise only). `test_gpu_guard.py` 4 cases. Provider adapters (VGGT) accept a `gpu_guard=` and call `checkpoint()` before/after the forward; job runner keeps its existing `GpuContentionGuard`. ~~commit~~ skipped

---

## Phase E — VGGT multi-view / video scan

- [x] **Task 20 — `MultiViewEvidence` + input sampling contract** — `multiview/{__init__,types,sampling}.py`. `ViewSample`, `ViewCameraEvidence` (`.to_summary()` JSON-light), `MultiViewEvidence` (dense fields transient). `uniform_sample_indices` (endpoints always included, dup-collapse). `test_multiview_sampling.py`. ~~commit~~ skipped
- [x] **Task 21 — Managed image-set + video-scan sources** — `multiview/source.py`: `sample_image_batch` (dims/order preserved, `image_batch_fingerprint` order-sensitive), `sample_video_scan` (managed-root + traversal guard, `.mp4/.mov/.mkv/.webm/.avi` whitelist, lazy PyAV, decodes only selected frames). Image and video resolvers kept separate. Tests in `test_multiview_sampling.py`. Node-bridge wiring of scan sources deferred to frontend Task 15. ~~commit~~ skipped
- [x] **Task 22 — VGGT provider capability + local model load** — `providers/vggt.py` (`VggtProvider`, registered). Capability false when `vggt` pkg missing / no checkpoint under `models/geometry_estimation/vggt/` / no CUDA. `auto` → `VGGT-1B-Commercial`. No `from_pretrained`; `torch.load(weights_only=True)`; model moved to CPU + `empty_cache()` in `finally`. `test_vggt_provider.py` 8 cases (all capability paths injectable). ~~commit~~ skipped
- [x] **Task 23 — Normalize VGGT cameras/points to OmniCam anchor coords** — `multiview/coordinates.py`: single global `T = CV_TO_OMNICAM @ E0` from view 0; `normalize_vggt_evidence`, `transform_points_world`, `normalize_camera`, `camera_world_position`. `test_multiview_coordinates.py`: anchor → origin looking −Z, right-camera stays right, points+cameras share one rigid transform, det(R)=+1 (no reflection). ~~commit~~ skipped
- [x] **Task 24 — Prefer VGGT depth-unprojection geometry** — inside `providers/vggt.py`: `unproject_depth_map_to_point_map(depth, extr, intr)` on the inference path; `depth_conf` carried but points kept transient (numpy, not serialized). ~~commit~~ skipped
- [x] **Task 25 — Scan camera track from VGGT poses** — `multiview/camera_track.py` `build_scan_camera_track`: one trajectory track, one keyframe per view with a `source_frame`, `fov_y = 2·atan(h/2 / fy)`, `target = position + forward`, frame-dedup. `test_multiview_coordinates.py`. Compiler updated so scene `timeline.duration_seconds` follows a supplied scan track (MotionScene validator requires the match). ~~commit~~ skipped
- [x] **Task 26 — SAM3 only on selected key views** — `multiview/sampling.py` `choose_segmentation_views(total, count)` (uniform subset). Used by the scan pipeline; default 24 VGGT / 6 SAM3 from settings. ~~commit~~ skipped
- [x] **Task 27 — Fuse same-semantic objects across views** — `blockout/fusion.py`: `FusionCandidate`/`FusedInstance`, greedy deterministic clustering (label + centre-dist ≤1.25·scale OR AABB 3D-IoU ≥0.10), 40k-point cap, one refit OBB per cluster. `test_multiview_fusion.py` 4 cases incl. two-chairs-stay-two and order-independence. ~~commit~~ skipped
- [x] **Task 28 — `scan` pipeline** — `pipelines/scan.py` `run_scan_pipeline` (full PREPARING→…→FINALIZING sequence, per-view masked-point extraction → fusion → per-cluster `BlockoutObject` with a bounded multi-view depth-confidence bump, room shell from unioned world points, single VGGT-pose camera track). Wired into the facade (`scan_samples=` passthrough; node-bridge sample resolution still TODO). `test_scan_pipeline.py` 6 e2e cases with a fake VGGT provider (validates, one track not one-cam-per-view, source frames preserved, same chair fuses, two chairs stay two, multi-view depth bump). ~~commit~~ skipped

---

## Phase G — research-only VGGT-Ω

- [x] **Task 34 — Research-only VGGT-Ω adapter** — `providers/vggt_omega.py` `VggtOmegaResearchProvider(VggtProvider)`, id `vggt_omega_research`, registered. `commercial_use=False`, `auto_select=False`, `license_label="FAIR Noncommercial Research License"`, `display_name`, benchmark-note in metadata; never `recommended`. Tested in `test_vggt_provider.py`. Frontend `capability-badges.js` copy deferred to frontend phase. ~~commit~~ skipped

---

## Phase F — SAM3D optional completion

- [x] **Task 29 — Completion provider contract + fake provider** — `completion/{__init__,base,registry,fake}.py`. `CompletedObjectEvidence`, `CompletionCapabilities`, `CompletionProvider` protocol. `FakeCompletionProvider` returns a filled box with a known hidden depth. ~~commit~~ skipped
- [x] **Task 30 — SAM3D capability gate** — `completion/sam3d_objects.py` `capabilities()`: Linux + CUDA + ≥32 GB VRAM + `sam3d_objects` pkg + `pipeline.yaml` under `models/sam3d_objects/`. **No 24 GB override.** All probes injectable. `test_sam3d_capabilities.py` covers every failing path. ~~commit~~ skipped
- [x] **Task 31 — SAM3D inference adapter** — `_load_inference_class()` isolates `sam3d_objects.inference.Inference` / `inference.Inference` fallback (never touches sys.path from HTTP); `SingleSlotModelCache` engine cache keyed by config `ModelIdentity`; `_active_gaussian_points(gs, 0.5)`; <32 points → `ReconInferenceFailedError`; no PLY write. Tested with a fake `Inference`. ~~commit~~ skipped
- [x] **Task 32 — Align SAM3D completion to measured geometry** — `completion/alignment.py` `merge_completion_into_blockout`: measured world centre kept; width/height/yaw kept when axis conf ≥0.65; depth replaced (scaled to kept width) only when depth conf <0.65; `completion_provider="sam3d_objects"`; per-axis conf capped at 0.80. `test_sam3d_alignment.py` incl. the plan's exact regression. ~~commit~~ skipped
- [x] **Task 33 — Bounded completion policy** — `completion/apply.py` `select_completion_objects` (off / low_depth_confidence / all_bounded / selected — `selected` needs explicit validated ids, never inferred) + `apply_completion_policy` (best-effort, order-preserving, capability-checked). Wired into `single_blockout.py`; facade resolves a completion provider from settings. Scan-mode completion left as a stage marker (fusion discards per-view masks — noted in `scan.py`). Policy tests in `test_sam3d_alignment.py`. ~~commit~~ skipped

---

---

## Cache / asset / job hardening

- [x] **Task 35 — Persist `blockout.json` + scan evidence** — `asset_writer.py`: `write_blockout_json` (`<fp>/blockout.json`, deterministic light data only) + `write_scan_evidence_json` (`<fp>/scan_evidence.json`, cameras capped at `vggt_max_views`, no depth/masks), both atomic (`.tmp` → `replace`), both containment-checked. Wired into `single_blockout.py` and `scan.py` (best-effort). `test_blockout_persistence.py` 4 cases incl. pipeline round-trip. ~~commit~~ skipped
- [x] **Task 36 — Job admission / history limits** — `jobs/manager.py`: `DEFAULT_MAX_ACTIVE_OR_PENDING=4` / `DEFAULT_MAX_HISTORY=16`; admission counts only non-terminal jobs (`JobLimitReachedError` when full), then `_evict_terminal_history_locked` + oldest-terminal trim. Legacy `max_jobs=` still means the single total cap. GPU semaphore stays 1. Existing job tests green. ~~commit~~ skipped
- [~] **Task 4 step 3 — `model_identities` in cache manifest** — `CacheEntry.model_identities` field added, round-trips in the manifest. Not yet a strict `lookup_cache` miss trigger (fingerprint + `provider_version` still are); wiring the per-stage tokens through the blockout/scan writers is a follow-up. ~~commit~~ skipped

---

## CI / verification

- [~] **Task 37 — Split Python CI by dependency class** — `pyproject.toml` mypy `files=` now includes the pure reconstruction modules (`settings.py`, `model_identity.py`, `blockout/{types,obb,primitive_resolver,room_shell}.py`, `multiview/{types,sampling,coordinates}.py`); `mypy` clean over 39 files. The dynamic SAM3/VGGT/SAM3D adapters are deliberately left to tests. Splitting `.github/workflows/test.yml` into the 5 job classes — **not done** (CI-only, can't verify here).
- [x] **Task 38 — Official API smoke assertions** — `scripts/comfy_integration_smoke.py` now asserts `nodes_moge.MoGeInference`, `nodes_sam3.SAM3_Detect`, `nodes.CheckpointLoaderSimple`, `nodes.CLIPTextEncode` exist and that `SAM3_Detect.execute` still has `model/image/conditioning/threshold/refine_iterations/individual_masks`. Runs only with a real ComfyUI checkout on PYTHONPATH. ~~commit~~ skipped
- [ ] **Task 39 — Frontend live regression** — **not done.** Playwright 7-case spec; needs the browser harness.

---

## Documentation / product finish

- [x] **Task 40 — Update docs** — `README.md` (4 result modes + SAM3D note), `docs/NODES.md` (result modes + full provider/capability table incl. SAM3/VGGT/VGGT-Ω/SAM3D), `docs/COMPATIBILITY.md` (provider table with checkpoint paths + gating policy, capability-false messaging, no silent mode change), `docs/SECURITY.md` (managed model roots, no runtime install/download, video ext/traversal limits, scan manifests carry camera metadata but no source pixels, SAM3D gate). ~~commit~~ skipped

---

## Definition of done (plan §12) — final gate

- [ ] Depth Mesh reproduces existing MoGe behavior
- [ ] Blockout = MoGe + SAM3 → closed editable primitives
- [ ] Hybrid = primitives + independently toggleable dense reference
- [ ] 90° Director orbit exposes no holes in blocking objects
- [ ] Source aspect ratio + vertical FOV correct
- [ ] Ground maps XZ→XZ, walls honor normals
- [ ] SAM3 uses current native ComfyUI API, no duplicate segmentation dep
- [ ] SAM3 checkpoint identity in reconstruction cache key
- [ ] Interactive + queued settings identical, survive reload
- [ ] Scan accepts IMAGE batches + managed VIDEO sources
- [ ] VGGT cameras/points share one tested anchor-frame conversion
- [ ] Scan creates one trajectory track (not one camera per view)
- [ ] Multi-view fusion deterministic + bounded
- [ ] `VGGT-1B-Commercial` documented production checkpoint
- [ ] VGGT-Ω noncommercial/research, never auto-selected
- [ ] SAM3D optional, capability-gated, doesn't break 24 GB Windows install
- [ ] SAM3D modifies weak hidden dims, not measured transforms
- [ ] No runtime installer / hidden download
- [ ] No new public OmniCam node
- [ ] MotionScene v1 remains public contract
- [ ] Python + frontend + browser + live ComfyUI tests green
- [ ] README/NODES/COMPATIBILITY/SECURITY updated

---

## Code-review response (2026-09-07, round 2)

A review checked the work against the real `comfy_extras/nodes_sam3.py` and the
actual panel wiring. Fixes applied (all in the working tree, tested):

| # | Sev | Finding | Fix |
|---|-----|---------|-----|
| 1 | P1 | `SAM3_Detect` returns per-frame `list[list[{x,y,width,height,score}]]`, not a numeric array — `np.asarray(boxes, dtype=float)` crashed | `_normalize_sam3_boxes()` decodes the dict form (top-left + w/h → xyxy), per-frame unwrap, numeric fallback kept. Test doubles rewritten to the real contract. `test_comfy_sam3_provider.py`. |
| 2 | P1 | SAM3's internal `comfy.utils.ProgressBar` needs a node context; MoGe's is already closed → `AttributeError` on `last_prompt_id` before the first workflow | `segment()` GPU loop wrapped in `_node_execution_context()` (`CurrentNodeContext`, same escape hatch as the MoGe adapter). |
| 3 | P1 | `layout` → `hybrid` silently forced a SAM3 checkpoint on MoGe-only workflows | `_MODE_ALIASES["layout"] = "depth_mesh"` (both legacy names ran MoGe-only + planes). `modes.js` mirrored. `test_legacy_layout_mode_stays_mo_ge_only`. |
| 4 | P1 | Panel/node integration incomplete | **Partial:** capabilities endpoint now v2, aggregates `segmentation` + `completion` so options can be gated with a reason. Panel consumer wiring (`template.js`, `recon_*` node widgets, `extractor.py` settings passthrough) still needs the browser/ComfyUI harness — **open**. |
| 5 | P2 | Single conditioning fixes `max_detections=1`; `individual_masks` doesn't lift it | `segment()` emits the official `"{label} : {N}"` prompt syntax (N = `max_blockout_objects`, hard-capped 64) → 6 chairs yield 6. `test_segment_loads_model_once_and_requests_multi_detection_per_label`. |
| 6 | P1 | `segmentation_provider="none"` silently selected the fake provider → synthetic objects | `_resolve_segmentation_provider` raises `ReconRequestInvalidError` for blockout/hybrid/scan. `test_segmentation_none_is_a_hard_error_not_synthetic_objects`. |
| 7 | P2 | Cache didn't track the actually-used models | `ComfyMoGeProvider.active_checkpoint_identity(settings)` resolves the *selected* checkpoint; `stage_cache_version()` folds geometry + segmentation identity into the blockout/depth-mesh cache key. `ComfySam3Provider.identity_token()`. `test_blockout_cache_invalidates_when_segmentation_checkpoint_changes`. |
| 8 | P2 | Blockout ground forced to zero rotation | `room_shell._ground_proxy` rotation follows `plane.normal` via new shared `rotation_utils.euler_aligning_axis_to_normal` (de-dupes scene_builder's helper). `test_tilted_ground_follows_the_fitted_normal`. Full scene re-leveling (geometry+camera+objects together) — **open follow-up**. |
| + | — | SAM3 model cache rebuilt per provider/job | Module-level `_SHARED_MODEL_CACHE` (capacity 1) — checkpoint loads once across jobs. |
| + | — | Blockout-only produced no `lookup_cache`-usable manifest | `single_blockout.py` always writes `reconstruction.json` + `blockout.json`; `lookup_cache(require_glb=False)` gates a Blockout hit on the sidecar. `test_blockout_pipeline_reuses_cache_on_second_run` proves the 2nd run does not re-infer. |

### Round 19 — Clear Cache dead, no way to discard a result, VRAM never freed

Three complaints on the Extractor Scene Reconstruct panel:

- **"Clear Cache" (header trash icon) not clickable (P1, fixed)** — two causes:
  1. `confirmAction` / `promptText` only worked when ComfyUI's `app.extensionManager.dialog`
     could be reached; when it could not (wrong `app` instance behind the bundle, or a build
     that does not expose it) they logged a warning and returned "no", so the button
     silently did nothing. Added a self-contained DOM modal (`omnicamModal` in
     `web-src/director/ui-services.js`) — our own element, not a blocked browser modal API,
     so the anti-native-fallback test still passes — used as the fallback for both helpers.
     Also un-breaks Director rename / delete when the dialog manager is missing.
  2. **Node 2.0 only** (legacy renderer was fine): the new Vue DOM-widget layer drops a
     `clip-path` / z-index notch over the widget's extreme top edge (see
     `Comfy.DOMClippingEnabled` + `calculateClipPath` in the frontend), so a control in row 1
     — our `<header>` — gets the clicks eaten while row 2+ works. Moved the trash button out
     of `<header>` into the **mode bar** (row 2, right-aligned, `data-role` unchanged so
     `index.js` wiring is untouched); the header now carries only the brand + status pill,
     and `.oc-extractor` gets `isolation:isolate`.
- **No way to discard one reconstruction you don't like (P1, fixed)** — the only reset was
  "Clear Cache", which wipes the camera track and *every* cached reconstruction. Added a
  **✕ DISCARD** button in the reconstruction `oc-actions` (enabled only with a result and
  no job running): deletes just that reconstruction's `<fingerprint>/` cache folder so the
  next identical run recomputes, closes the 3D preview, resets the panel to IDLE. New
  `cache.delete_reconstruction_cache_entry(fingerprint)` (hex-guarded, bounded to the
  managed subtree) + `api.handle_delete_cache_entry` + `DELETE
  /majoor/omnicam/reconstruction/cache/{fingerprint}` + `job-client.deleteCacheEntry`. The
  result envelope's top-level `fingerprint` is now threaded into panel state.
- **VRAM never released after a reconstruction (P1, fixed)** — the interactive job runs
  out-of-band from ComfyUI's executor, and `comfy_moge._model_cache` /
  `comfy_sam3._SHARED_MODEL_CACHE` hold strong refs to the weights, so a finished blockout
  left MoGe + SAM3 resident and `model_management` could not evict the SAM3 ModelPatcher.
  Measured on the RTX 4090: a blockout run pinned **14.1 GiB** (22.45 → 8.19 GiB free) and
  never gave it back. New `reconstruction/model_release.py::release_reconstruction_models()`
  drops both caches, `gc.collect()`, then `model_management.unload_all_models()` +
  `soft_empty_cache(force=True)`. Called from the job runner's `finally` (any outcome) and
  from `handle_clear_cache` / `handle_delete_cache_entry`. Post-run free VRAM: 8.19 →
  **22.31 GiB** (recovered the full 14.1 GiB). Best-effort — a no-op without ComfyUI.

- **Tests**: `test_cache.py` +3 (targeted delete: only that fp, hex guard, missing-folder
  noop); `test_reconstruction_api.py` +1 (`handle_delete_cache_entry` shape + 400);
  `test_model_release.py` new (safe without comfy, clears both caches);
  `extractor-reconstruction-state` covers `canDiscard`. Frontend node **681 green**,
  `tests/reconstruction` **382 green**, ruff clean, `npm run check` clean, vite build clean.
  Real VRAM check kept in scratchpad (`vram_release_check.py`). **No commit.**
- **Follow-up (same round)**: Clear Cache still dead in **Node 2.0** while fine in legacy —
  the Vue DOM-widget clip/stacking eats row-1 clicks. Moved the button from `<header>` to
  the mode bar (row 2); `.oc-extractor` gets `isolation:isolate`. `npm run check` + node
  **681** still green. **No commit.**
- **Follow-up 4 (same round)**: CI `python-reconstruction` red — `pytest -q tests/reconstruction`
  with no ComfyUI on `sys.path`. **11 of the failures pre-date this branch** (`main` fails
  them identically: verified in a clean `git worktree` — `test_comfy_moge_provider.py` ×7,
  `test_geometry.py` ×1, `test_node_bridge.py` ×2, `test_reconstruction_routes.py` ×1 all do
  a bare `import folder_paths` / hit `comfy.ldm.moge.geometry`). This branch's new/expanded
  test files added ~4 more (`test_semantic_pipeline.py` hybrid/depth-mesh routing tests reach
  `build_proxy_mesh` → real `comfy`). Fixes:
  - `tests/reconstruction/conftest.py` (new): installs a minimal `folder_paths` stub with the
    names those tests patch/call, **only when the real module is absent** (a ComfyUI checkout
    / the integration lane is untouched; a bare stub from another test file is topped up).
  - `pytest.importorskip("comfy.ldm.moge.geometry")` / `("comfy_execution")` on the few tests
    that need real ComfyUI triangulation or the executing-context helper; a
    `requires_moge_mesh` skipif on the 4 `test_semantic_pipeline.py` hybrid/depth-mesh tests.
  CI-sim (ComfyUI blocked): `tests/reconstruction tests/test_validation.py tests/test_schemas.py`
  → **434 passed, 7 skipped, 0 failed** (was 15+ failed). Local (ComfyUI present): **445 passed**,
  nothing skipped. ruff + mypy clean. **No commit.**
- **Follow-up 3 (same round)**: CI `test:browser` flake — `playback-budget.spec.js`
  "five-camera shot ... per-render ceiling" hit 435 ms vs a hard `< 90` on a contended
  runner (whole run 8 min, `lower-deck.spec.js` alone 5.5 min; retry also ~432 ms). The
  test is Director-only, untouched by this branch. Absolute-ms on CI's software renderer is
  ~5x noisy, so rewrote it as a **ratio**: measure a 1-camera vs a 5-camera render in the
  same session and assert `5cam/1cam < 12` (runner-speed independent, and it's what the
  "preview strip goes quadratic" regression would actually trip). Local ratio ≈ 1.0
  (6.4 → 6.3 ms — the preview strip is already throttled). 4/4 in the file green, 3 reruns
  stable. **No commit.**
- **Follow-up 2 (same round)**: in the Scene Reconstruct tab the camera-track menus
  (VIDEO/TRACK 3D tabs, stage, transport + dope timeline, Solve card, Cleanup / RAW-REFINED
  columns) still showed, stacked under the reconstruction panel — `setExtractMode` only
  hid `data-role="stage"`. Wrapped the entire camera-track UI in one
  `data-role="camera-track-body"` `<main>` and `setExtractMode` now `toggleAttribute`s the
  whole container (reconstruction panel is its sibling, outside it). `extractor-dom` +1
  (structure: camera-track sections inside, reconstruction panel + Clear Cache outside).
  Node **682 green**, `npm run check` clean. **No commit.**

### Round 18 — SAM3 phantom furniture in "add props" on an exterior scene (`Lens_00001_.png`)

User: *"dans add prop jai des chaise des plant etc alors que ce n'est pas dans l'image."* The
photo is a **rainy night city street** (one Porsche, a partial second car, ~3 pedestrians,
glass storefronts, neon signs) — no chair, plant, desk, counter, monitor or box anywhere in
it. SAM3 is open-vocabulary: given the old indoor taxonomy it forced a match for every
furniture label onto whatever texture blob looked closest (a lit shop counter → `table` @ 0.67,
the "Lens" neon → `monitor`, dark glass → `plant`). In `proxy` mode each phantom became a fully
modelled GLB prop.

- **Default taxonomy was indoor-only (P1, fixed)** — `DEFAULT_BLOCKOUT_LABELS` was 20 labels,
  16 of them interior furniture (`armchair`, `desk`, `cabinet`, `shelf`, `counter`, `monitor`,
  `lamp`, `bottle`, `box`, `suitcase`, …). Replaced with a 15-label **scene-agnostic** set —
  layout anchors + large occluders that read reliably indoors *and* outdoors: `person`, `car`,
  `truck`, `bicycle`, `motorcycle`, `chair`, `sofa`, `table`, `bed`, `door`, `window`,
  `television`, `plant`, `building`, `tree`. `primitive_resolver` gains rules for the new
  exterior classes (`truck`/`bus`/`building`/`tree` deep, ground-snapped). A user targeting an
  interior can still list the dropped props explicitly via `recon_semantic_labels`.
- **SAM3 threshold floor (P2, fixed)** — default `sam3_threshold` 0.55 → **0.60**. On this photo
  it drops the weakest phantoms outright (`chair` @ 0.51, `box`, `desk`) while keeping every
  structural detection (both cars, all 3 people, the storefront doors/windows survive to 0.66+).
- **Asset-proxy confidence gate (P2, fixed)** — `resolve_placements(..., min_confidence=0.55)`:
  a shaky detection stays a plain grey blockout box; only a confident one is promoted to a GLB
  prop. A wrong faint box is tolerable, a wrong photorealistic chair is not.

Result on `Lens_00001_.png`: default-label `blockout` 19→**16** objects (no `chair`); with an
explicit `car, person, building, window, door` set → **13** objects, every one plausible for the
scene (2 cars, 3 people, 3 doors, 5 storefront windows), zero phantom furniture. `proxy` mode
tracks the same object list.

- **Tests**: `test_segmentation_registry.py` `test_default_taxonomy_shape` updated (15 labels,
  asserts exterior coverage + no indoor-only props); `test_comfy_sam3_provider.py` threshold
  assertion 0.55 → 0.60; `test_asset_library.py` +1 (`test_resolve_placements_gates_low_confidence_detections`).
- **Verification**: `tests/reconstruction` **377 green**; ruff clean; mypy unchanged (pre-existing
  errors only, none in touched files). Diagnostic `real_sam3_recon.py` + `lbl_test.py` in the
  session scratchpad. **No commit.**

### Round 17 — Real blockout / add-props / hybrid run on `Lens_00001_.png` (RTX 4090)

Ran all three result modes for real on one 1440×1440 photo (32 SAM3 instances → 20 objects after the round-16 dedup).

- **Asset props stretched 10–22× (P1, fixed)** — in `proxy`/`replace` mode, `wallWindow.glb` (`base_size` z = 0.1 m) placed against a fitted window OBB whose depth axis read 2.25 m gave a `stretch` scale of **×22.5** on that axis; doors and the tv/monitor were similarly blown up. `AssetLibrary._scale_for` now clamps every `stretch` axis to `[gmean/3, gmean·3]` around the geometric mean of the three box/base ratios. Result on the same photo: window depth-scale 22.5→3.2, 10.8→2.6; doors ≤3.6; proportions still track the box. `_STRETCH_CLAMP = 3.0`; `test_asset_library.py` +1.
- **Verified OK**: `proxy` keeps the 20 boxes *and* 20 `asset_proxy` props (`enabled=True`, `asset_mode=proxy`, `asset_count=20`); `hybrid` adds one `reconstruction_reference_mesh` whose `position` equals the pipeline's recenter offset, i.e. superimposed on the blockout (round-13 F07 holding on real data); `blockout` plain = 20 clean objects, no NaN warning.
- **Verification**: `tests/reconstruction` **375 green**; whole Python suite green; frontend node **681**; ruff + mypy clean. **No commit.**

### Round 16 — Real SAM3 + MoGe reconstruction on the RTX 4090 (live findings)

Ran the blockout pipeline for real (`sam3.1_multiplex_fp16.safetensors` + `moge-2-vitl-normal.pt`, embedded python cu130, RTX 4090) on 3 interior photos. Findings + fixes:

- **NaN matmul warning** — `leveling.py::apply_rotation_to_points` did `pts @ rot.T` on MoGe's NaN pixels → `RuntimeWarning: invalid value encountered in matmul` on every run. Wrapped in `np.errstate(invalid="ignore")` (NaN→NaN is correct; the fitter filters non-finite points).
- **Cross-label duplicate proxies** — SAM3 gives semantically-adjacent labels overlapping masks on one surface (tv/monitor/door/window, person/armchair, bottle/suitcase/lamp/box) → their 3D proxies collapse onto one box. Real runs produced **11–14 "objects" that were really 3–6**. New `single_blockout._dedupe_and_bound_objects`: after the confidence sort, drop a proxy whose OBB centre is within 40 % of the box max-dim of an already-kept one and whose volume is within ~1.75× (highest confidence wins; merged instance ids folded into the survivor).
- **Background-blob proxies** — a wall / background mis-segmented as a giant `television` (4.3 × 2.6 × 5.0). Same helper rejects a proxy that is big in *every* axis relative to a **robust** scene extent (`_finite_extent` = 2nd/98th-percentile diagonal, so far MoGe outliers don't inflate it).
- **Per-label detection count** — `comfy_sam3` asked SAM3 for `max_blockout_objects` (24) detections *per label*. Soft-capped at **6** (`_DEFAULT_DETECTIONS_PER_LABEL`): one photo rarely holds >6 of one furniture type, and a high N only feeds junk into the dedup.

Result on the same 3 photos: 10→**6**, 14→**5**, 5→**3** clean objects; no NaN warning; the giant TV blob gone.

- **Tests**: `test_leveling.py` +1 (NaN-safe, no RuntimeWarning), `test_semantic_pipeline.py` +2 (cross-label + blob drop; two real chairs kept), `test_comfy_sam3_provider.py` updated for the `: 6` cap.
- **Verification**: `tests/reconstruction` **372 → all green**; whole Python **1351 passed / 3 skipped**; frontend node **681**; ruff + mypy clean. Diagnostic script kept in the session scratchpad (`real_sam3_recon.py`). **No commit.**

### Round 15 — Extractor 3D preview of the reconstructed scene

The Extractor already had a lazy read-only three.js viewer (`viewer/track-viewer.js`, the TRACK 3D tab) but it only knew how to draw the solved camera path/frustums/points. Extended it to also render a reconstructed MotionScene, so a Scene Reconstruct result can be eyeballed without opening the Director.

- **New `web-src/viewer/scene-overlay.js`** (`SceneOverlay`) — a `Group` added to `TrackScene`. `setScene(motionScene, { resolveAssetUrl, onPropLoaded })` builds: wireframe box / sphere / cylinder from `objects` (degrees→radians, size→dims, faint solid backing), colour by `reconstruction.role` (room grey / blockout violet / asset_proxy green / reference dim), GLB props streamed via `GLTFLoader` (shared `vendor-three` chunk, non-fatal on 404), and the source-camera **frustum** (reuses `track-frustums.frustumLines`). Skips `enabled:false` and `null`. `bounds()` via `Box3` for fit.
- **`TrackScene`** holds `this.sceneOverlay`; `setReconstructedScene()` + `hasReconstructedScene()`; `bounds()` unions path + overlay; disposed in `dispose()`.
- **`TrackViewer`** — `setReconstructedScene(scene, opts)` public method (async props each `requestRender`).
- **Panel** (`reconstruction/panel.js`): a **3D PREVIEW** toggle button + a `reconstruction-3d` `<canvas>` in the panel; `ensurePreview()` lazy-imports `track-viewer.js` (three.js stays off startup), `pushSceneToPreview()` on the toggle and on every fresh `state.result`; `resolveAssetUrl = annotatedAssetUrl(api, ref)`; disposed with the panel. `reconstructionActions().canPreview` gates the button (any result, even mid-flight).
- **Tests**: `tests/frontend/reconstruction-scene-overlay.node.mjs` (5 — transform, role colour, skip disabled/null, GLB request + non-fatal, frustum, bounds), `extractor-reconstruction-state.node.mjs` +`canPreview` assertions. FR locale +3.
- **Verification**: frontend node **681 passed**; `npm run check` (three-surface, locales 100%, contract) + `npm run build` green; three.js stays lazy (`production-bundle` test green). **No commit.**

### Round 14 — Extractor "Clear Cache" dead + black viewer after browser cache

- **Clear Cache button did nothing** — `clearExtractorCache` called `confirmAction(t("Clear Cache"), …)` with strings only, so `confirmAction` fell to `window.app`, which behind the bundle can be a different `app` instance without `extensionManager.dialog` → the confirm never opened → the function returned at `if (!proceed)`. Fix: `ExtractorUI.app = app` (from `comfy-runtime`), passed as the first arg to `confirmAction`. Same one-line fix for `cameras.js` `renameCamera` / `deleteCamera` (`promptText(ui.app, …)` / `confirmAction(ui.app, …)`). The click handler now also disables the button while running and surfaces a thrown error as `FAILED` instead of an unhandled rejection. No native `window.confirm` fallback (ComfyUI Desktop/Electron blocks it — enforced by `director-modules` test).
- **Viewer goes black after a rebuild + browser cache** — `routes_chunks.py` served `web-chunks/` with aiohttp's plain static handler, so the browser kept a stale copy of the **stable-URL** `omnicam.js` entry; its list of hashed `chunk-*.js` imports had changed, the old files 404'd, the module graph failed and the whole extension silently did not mount. Fix: a custom GET handler serves `omnicam.js` `Cache-Control: no-cache` (revalidate every load) and the content-hashed `chunk-*.js` / `asset-*.js` / `vendor-*.js` `immutable`. Path-safety (single segment, no traversal, inside `web-chunks/`) kept. Pure helpers `resolve_chunk_path` / `cache_control_for` + `tests/test_routes_chunks.py`. A currently-broken browser still needs one hard refresh; recurrence is prevented.
- **Verification:** whole Python **1348 passed / 3 skipped**; frontend node **676 passed**; `npm run check` + `npm run build` green; ruff + mypy clean. **No commit.**

### Round 13 — Audit corrections part 2 (F01, F15, F17, F18-roll)

- **F01 panel↔widgets** — `settings-sync.js` gets `RECON_PANEL_FIELDS` (widget↔data-role↔kind table) + `hydratePanelFromWidgets` / `syncWidgetsFromPanel`. `panel.js` hydrates the DOM from widgets on mount and after capabilities load, mirrors every edit + the pre-run flush back onto the widgets, and exposes `syncFromWidgets()` called by `lifecycle.js::onAfterGraphConfigured` on workflow reload. A non-off completion policy also sets `recon_completion_provider="sam3d_objects"`. `RECON_WIDGET_NAMES` now includes `recon_blockout_assets` / `recon_asset_library_path` / `recon_completion_object_ids`. +3 `extractor-reconstruction-settings.node.mjs` tests.
- **F15 completion outcome** — `apply_completion_policy` now returns `(objects, CompletionOutcome)` with `state` ∈ {disabled, unsupported, no_targets, failed, partial, applied}, `requested`/`applied` counts and a `.warning`. `single_blockout` writes `provider_summary["completion_status"]` + appends the warning to `evidence.warnings`; `scan` records an explicit `unsupported` status instead of a silent progress message. New `settings.completion_object_ids` + `recon_completion_object_ids` widget make the `selected` policy usable. `test_sam3d_alignment.py` +6.
- **F17 SAM3D alignment** — `merge_completion_into_blockout` resolves **one** similarity factor from the most trustworthy measured axis (height preferred), rescales the completion box, overwrites only the weak axes (floored by the `measured_points` extent so nothing shrinks below what was observed), and **keeps the measured world yaw** (the completion frame is local, not registered). `test_sam3d_alignment.py` +2.
- **F18 roll** — `camera_track._pose_full` returns the camera up too; `_roll_degrees` recovers the optical-axis roll (reference up = world +Y de-tilted onto forward) and writes it into every trajectory keyframe. New `tests/reconstruction/test_camera_track.py` (5).
- **Verification:** `tests/reconstruction` still green; whole Python **1346 passed / 3 skipped**; frontend node **675 passed**; `npm run check` + `npm run build` green; ruff + mypy clean. **No commit.**

### Round 12 — Audit `AUDIT_SEMANTIC_BLOCKOUT_SAM3D_VGGT_2026-09-07.md` corrections

Applied 16 of the 21 findings (revision `b10faa9`); 5 are deferred with rationale below.

**Scan unblocked (F03–F05, F10, F21):**
- `pipeline.py::_resolve_scan_input` — the interactive HTTP job carries only a file `source`; a managed **video** is now decoded into frames (`sample_video_scan`) here, a single still raises `RECON_SOURCE_SET_INVALID` instead of dying on `samples is None` deep in the orchestrator.
- `comfy_sam3.py::_as_comfy_image` — coerces an HWC NumPy frame (the scan path) to the `[B,H,W,3]` float tensor SAM3's `execute` expects (`movedim` + 4-D unpack would crash on HWC).
- `scan.py` now works entirely in the **point-map pixel grid**: canvas/camera/fov all read `points_world.shape`, segmentation runs on `evidence.images[i]` (or a resize of the source frame) so masks line up with the points — no more `mask (720,1280) vs point map (294,518)` and no 52°→100° fov drift.
- `scan.py::_scan_fingerprint` — content-addressed plain-hex key (ordered view pixels + result-affecting settings + provider ids); passes the asset writer's `^[0-9a-fA-F]{1,64}$` gate, so `blockout.json` / `scan_evidence.json` are actually written; write failures now surface as a warning, and the fingerprint is returned.
- `scan.py` arms `gpu_guard.arm()` before VGGT (parity with single-blockout).

**Spatial consistency (F06, F07, F18):**
- `scene_scale` is applied as **one similarity about the origin** to points + camera (single-blockout) / points + every view camera (scan), before levelling/recentring; objects are then fitted at `scene_scale=1.0`. No more double-scale / plane-vs-point desync (repro `(1,-2,-3)` → `(-1,2,3)` fixed).
- Hybrid dense mesh: `single_blockout.py` composes `p_final = R·(s·p_raw)+offset` and hands that TRS to `compiler._reference_object`, so the reference mesh sits on the blockout instead of at identity.
- Scan camera: `build_scan_camera_track` gets the real container fps (`_probe_video_fps`); the compiled camera is labelled **"Scan Camera"** and `locked: true` for a video trajectory.

**Provider fidelity (F11, F12, F16):**
- `vggt_omega.py` — VGGT-Ω now requires its **own** checkpoint (folder name contains `omega`); with only the commercial weights installed it reports unavailable and `resolve_checkpoint` raises, instead of silently running `VGGT-1B-Commercial`.
- `vggt.py::_load_vggt_state_dict` — `.safetensors` goes through `safetensors.torch.load_file`, not `torch.load`; a >8-key `missing_keys` mismatch now raises (wrong arch / corrupt file) instead of being swallowed by `strict=False`.
- `stage_cache_version` folds in the **completion** provider id + config identity + policy, so a blockout cached without completion is invalidated once SAM3D is installed.

**Frontend / hardening (F02, F13, F19, F20):**
- `controls.js` emits `completion_provider` (`sam3d_objects` when the policy is on, else `none` — a policy alone resolved to nothing) and forwards the checkpoint as `vggt_checkpoint` in Scan mode.
- `fusion.py` never fuses two detections from the **same view**; `.gltf` members are no longer copied as `.glb` by `fetch_blockout_library.py` (JSON + sidecars → broken asset).
- `director-adopt.js` merge builds an old→new id map and rewrites `parent_id`, so a second reconstruction stays under its own groups.
- `_resolve_asset_library` stages a **custom** library folder into the managed dir so its annotated-input GLB refs load (F09).

**Deferred (rationale):**
- **F01** panel↔widget authority — `settings-sync.js` exists but isn't wired into the live controller; a real fix is a panel-mount/edit/reload refactor, out of scope for a correctness pass.
- **F14** SAM3D import bridge — needs the actual `sam-3d-objects` layout (`notebook/inference.py` + `sys.path`) to verify; the Linux/32 GB gate already returns unavailable on this machine.
- **F15 / F17** completion status taxonomy + weak-depth alignment math — deep `completion/*` rework; current behaviour is "no observable effect", not wrong output.
- **F18 roll** — the trajectory keeps `roll=0`; preserving optical-axis roll needs the full camera basis out of `camera_track._pose` (P2).

**Verification:** `tests/reconstruction` **362 passed**; whole Python **1336 passed / 3 skipped**; frontend node **672 passed**; `npm run check` green; `npm run build` refreshed `web-chunks/`; ruff + mypy clean. **No commit** — working tree only.

### Round 11 — Blockout asset library ("bibliothèque 3D") (2026-09-07)

User request: for Blockout / Hybrid, place a real GLB prop per detected object instead of a bare box — a lightweight CC0 library covering interior + exterior + posed humans.

- **New package `omnicam/reconstruction/asset_library/`**: `types.py` (`AssetEntry` with `category` interior/exterior/human, `fit` stretch/uniform/upright, `base_size`, `poses` map for humans; `AssetPlacement`), `poses.py` (pick a human pose from the box proportions), `library.py` (`load_asset_library` + `AssetLibrary.status()` gate on every referenced GLB existing, `.resolve()` box→placement with per-fit scaling, `.identity_token()` for the cache key), `resolver.py` (`resolve_placements`, capped at 48).
- **Compiler** (`blockout/compiler.py`): `compile_blockout_scene(..., asset_placements, asset_mode)` adds a `reconstruction_assets` null + one `type:"glb"` object per placement (`role:"asset_proxy"`); `replace` mode also sets the matched box `enabled=False`. `metadata.reconstruction` gains `asset_mode` / `asset_count`.
- **Settings**: `blockout_assets` (`off`/`proxy`/`replace`, `KNOWN_BLOCKOUT_ASSET_MODES`) + `asset_library_path`. Round-trips.
- **Errors** (§19 style): `RECON_ASSET_LIBRARY_UNAVAILABLE` (installed but GLBs missing) / `RECON_ASSET_LIBRARY_INVALID` (no/bad `library.json`). Facade `_resolve_asset_library` raises rather than silently producing boxes only — same "explicit error over silent substitution" rule as the segmentation resolver.
- **Pipelines**: `single_blockout.py` + `scan.py` resolve placements after object fitting, thread `asset_library`/`asset_mode` to the compiler; `stage_cache_version` folds in the library digest.
- **Capabilities**: `get_reconstruction_capabilities()["asset_library"]` = `{available, reason, entry_count, categories, classes}`.
- **Node surface**: `recon_blockout_assets` + `recon_asset_library_path` widgets on the Extractor; panel `3D assets` select on the Labels row (`Boxes only` / `Add props` / `Replace boxes`); `controls.js` emits `blockout_assets` for semantic modes; `director-adopt` role default for `asset_proxy` (unlocked, visible). FR locale +5.
- **`omnicam/reconstruction/asset_library/library.default.json`**: the reference manifest (23 classes → 5 Kenney CC0 kits, with `base_size` and `source`). **`scripts/fetch_blockout_library.py`**: `--download` scrapes each Kenney asset page's direct CC0 .zip link and builds the library, or `--from-dir` imports pre-downloaded kit ZIPs; writes `library.json` + `SOURCES.md`; missing members are non-fatal.
- **Docs**: new `docs/BLOCKOUT_ASSET_LIBRARY.md` (install, schema, placement math, BYO library); NODES.md + README updated.
- **Installed**: ran `python scripts/fetch_blockout_library.py --from-dir <kits>` against the 5 Kenney ZIPs → **23 GLBs (~0.5 MB)** written to `ComfyUI/input/majoor_omnicam/blockout_library/` + `library.json` + `SOURCES.md`. `get_reconstruction_capabilities()["asset_library"]` reports `available: true`, 23 entries (16 interior / 6 exterior / 1 human).
- **Tests**: `tests/reconstruction/test_asset_library.py` (11, incl. a check that the shipped `library.default.json` parses) + compiler (+3) + semantic pipeline (+2) + `extractor-reconstruction-controls.node.mjs` (+2). `test_types.py` round-trip updated for the 2 new fields. mypy `files=` extended (4 modules, 45 files clean).
- **Verification**: whole Python suite **1329 passed / 3 skipped**; frontend node **670 passed**; `npm run check` green (100% fr, template contract, licences); `npm run build` refreshed `web-chunks/`; ruff + mypy clean on the new code (pre-existing `cache.py` / `comfy_moge.py` / `scan.py` / `single_blockout.py` mypy noise unchanged). **No commit** — working tree only (the GLB library lives under `ComfyUI/input/`, outside the repo).

### Round 10 — Director bugs: node refresh on disconnect + outliner multi-select / delete / rename (2026-09-07)

Live Director feedback: (1) *"problème de refresh des nodes lorsqu'un input est déconnecté"* — pulling the Load Image/Video off the Extractor, or image/audio/scene_3d off the Director, left the panel showing the stale source / upstream card / upstream object; (2) *"multiselection et suppression edit dans outliner impossible"* — could not multi-select in the outliner, Delete did nothing there, and there was no inline rename.

- **Reliable disconnect signal** — new `web-src/graph-connection-watch.js` (`watchGraphConnections`): chains `LGraph.onConnectionChange` (fires for *every* connect/disconnect on any node, including the implicit disconnects when an upstream node is deleted — the cases `node.onConnectionsChange` misses in some builds) and fans it out to per-node subscribers. Wired as a backstop in `extractor/lifecycle.js` (→ `ui.refreshSource()` + `setDirtyCanvas`) and `director.js` (→ `ui.syncUpstreamInputs()` + `setDirtyCanvas`), each disposed in `onRemoved`. The Extractor's own `onConnectionsChange` wrapper also gained a settle pass (`60ms` + `400ms`) and a canvas redraw.
- **Outliner keyboard zone** — `commands.js` `ZONE_SELECTORS` gains `["scene", '[data-tab-panel="scene"]']` + a `sceneKeymap` (Delete/Backspace, F2 rename, H hide, Escape clear). Before this, Delete with a scene row focused fell through to the last-touched zone (usually the timeline, which only deletes keyframes), so tree objects could not be removed at all.
- **Batch delete** — new `deleteSelectedObjects(ui)` in `scene/objects.js`: one confirm, one history checkpoint, unparents surviving children, clears the selection; a lone selection still defers to per-object `deleteObject` for its wording. Wired through `director.js` deps + `director/methods/scene.js`; the viewport & scene Delete keymaps use it only when `selectedObjectIds.size > 1`.
- **Shift-range + Ctrl-toggle selection** — both outliner selection closures (`event-bindings/editor-global.js::selectOutlinerItem`, `scene/outliner.js::selectObjectRow`) now track `ui.outlinerAnchorId`: plain / Ctrl click sets the anchor, Ctrl/Cmd toggles one row, Shift selects the contiguous run between the anchor and the clicked row in tree order.
- **Inline rename** — double-clicking an object's name in the tree swaps it for an `<input>` (`startInlineRename` in `outliner.js`); Enter / blur commits (`checkpoint("Rename object")`), Escape reverts. Double-click elsewhere on the row still toggles visibility.
- **Tests** — `tests/frontend/graph-connection-watch.node.mjs` (+4), `tests/frontend/outliner-multiselect.node.mjs` (+4), `commands.node.mjs` +1 (scene zone routes Delete to objects, single vs. multi, F2). `el()` test helper extended for `[attr="value"]` selectors. FR locale +5 keys, dynamic `t()` calls converted to `{placeholder}` + `.replace()` to stay within the untranslatable budget (76/76).
- **Verification** — `npm run test:unit` **669 passed**; `npm run check` green (100% fr, template contract, licences, line limit); `npm run build` refreshed `web-chunks/`. **No commit** (working tree only).

### Round 9 — Director bugs: scene never at origin / cameras "undefined" (2026-09-07)

Live Director feedback: (1) *"les object ou scene n'arrive jamais a l'origin, et sont souvent en desous du grid"* — the reconstructed scene floated away from the world origin and often sat below the grid; (2) *"les camera cree sont toujours undefini, et non pas la vue de l'image reconstruit"* — adopted cameras showed as "undefined" and framed the default view, not the reconstructed one.

- **Recenter onto the grid (`leveling.py`):** new `recenter_translation(ground, points)` + `recenter_scene(...)` (plus `_translate_camera` / `_translate_plane` / `_translate_view_camera`, and a shared `_xyz` 3-tuple helper). With a confident ground plane its centre is moved to `(0,0,0)` so the floor rests at `Y=0` and the room is centred on the origin; without one, the point cloud's XZ median → origin and its 2nd-percentile Y (robust floor) → 0. The offset is a single rigid translation applied to points + camera + planes, so framing is preserved.
- **Wired in:** `single_blockout.py` calls `recenter_scene` right after `level_scene`; `scan.py` applies `recenter_translation` + `_translate_view_camera` to `points_world` and every view camera after `level_scan_evidence`.
- **Camera shape mismatch (`director-adopt.js`):** `adoptReconstructedScene` handed raw MotionScene v1 (`cameras:[{id,label,track:{keyframes:[{frame,camera}]}}]`, `canvas`, `timeline`) straight to `sanitizeState`, which expects the flat editor shape (`{id,name,camera,keyframes}` + top-level `width/height/fps/duration_frames`) — so the name read "undefined" and the reconstructed framing + keyframes were dropped. New `motionSceneToEditorCameras` / `motionSceneToEditorState` converters map `label`→`name` (fallback `"Source Camera"`), lift `track.keyframes[0].camera` into `camera`, flatten the keyframes, and fold `canvas`/`timeline` into `width/height/fps/duration_frames`. Wired into both the `replace` (`sanitizeState(motionSceneToEditorState(...))`) and `merge` branches.
- **Tests:** `test_leveling.py` +2 (`recenter_scene` drops a confident ground to the origin; no-ground path uses robust floor + XZ median). `extractor-reconstruction-director-adopt.node.mjs` +3 (`motionSceneToEditorCameras` flattens v1 nesting; `motionSceneToEditorState` never yields an undefined camera; replace keeps the reconstructed framing).
- **Verification:** `tests/reconstruction` **339 passed**; frontend node **660 passed** (director-adopt 11); `check:locales` 100% fr; `npm run build` refreshed `web-chunks/`; ruff + mypy clean on the touched files (pre-existing mypy noise in `cache.py` / `comfy_moge.py` / `sam3d_objects.py` / `comfy_sam3.py` / `scan.py` / `single_blockout.py` unchanged — confirmed via `git stash`). **No commit** (working tree only).

### Round 8 — frontend rebuild + locale

The panel changes (`template.js`, `controls.js`) were never bundled — the running ComfyUI served the Sep-7-09:30 `web-chunks/` build, so the Result select still showed the old "Geometry/Layout". Ran `npm run build`; the new bundle carries the Depth Mesh / Blockout / Hybrid / Scan select + the "Objects" (SAM3) / Labels / Completion rows. Added the 16 new UI strings to `web-src/locales/fr.js` and removed the 2 stale keys ("Mode", "Geometry") → `npm run check` green (100% fr coverage). `web-chunks/` / `web/` are gitignored (build output); the user's local ComfyUI now serves the fresh bundle after a hard browser refresh.

**Where SAM3 lives in the UI:** Extractor → *Scene Reconstruct* tab → *Result* = Blockout/Hybrid/Scan → the *Objects* dropdown (= segmentation provider, defaults to SAM3) + *Labels* appear. On *Depth Mesh* those rows are hidden (no segmentation). The node body also has advanced `recon_*` widgets driving queued runs.

### Round 7 — bugfix: vggt provider + non-scan mode crashed

Live instance reported `AttributeError: 'VggtProvider' object has no attribute 'reconstruct'` — a job with `provider="vggt"` (now available after the checkpoint install) but a single-view mode was routed into `run_depth_mesh_pipeline`, which calls `provider.reconstruct()` (VGGT only has `reconstruct_views`).

- **Facade guard** (`pipeline.py`): a scan-only provider (`vggt` / `vggt_omega_research`) outside Scan mode, or a single-view provider *in* Scan mode, now raises `ReconRequestInvalidError` (`RECON_REQUEST_INVALID`) with an actionable message — caught by the job runner as a normal failure instead of an uncaught `AttributeError`.
- **Frontend** (`controls.js`): `readReconstructionSettings` coerces the Result mode to `scan` when a vggt-family provider is selected (mirrors the existing scan → vggt default), so the panel can't submit the bad combination.
- `test_semantic_pipeline.py` +2 regression cases. `tests/reconstruction` **337 passed** (system + embedded python); ruff + mypy clean.

### Round 6 — audit against the design spec (`specs/2026-09-06-semantic-blockout-multiview-design.md`)

Closed the gaps between the implementation and the source-of-truth design doc:

- **§19 granular error catalogue** — added `RECON_SEGMENTATION_UNAVAILABLE / _MODEL_MISSING / _FAILED`, `RECON_NO_INSTANCES`, `RECON_BLOCKOUT_EMPTY`, `RECON_VGGT_UNAVAILABLE / _MODEL_MISSING / _INFERENCE_FAILED`, `RECON_SAM3D_UNAVAILABLE / _MODEL_MISSING / _INFERENCE_FAILED`, `RECON_SOURCE_SET_INVALID`, `RECON_TOO_MANY_VIEWS`. Each subclasses the existing broad category (`ReconProviderUnavailableError` / `ReconInferenceFailedError` / `ReconRequestInvalidError` / `ReconSourceInvalidError`) so old `except` sites keep catching them while the wire `code` is specific. Wired at every raise site (SAM3 adapter, VGGT provider, SAM3D provider, `_resolve_segmentation_provider`, single-blockout no-instances / empty-blockout, scan source/view guards). `test_error_catalogue.py` (16 cases) + envelope-code assertion in the pipeline test.
- **§10.3 scan quality presets** — `ReconstructionSettings.scan_view_counts()` returns Fast 12/3, Balanced 24/6, High 48/10; `custom` keeps the explicit `vggt_*` fields. `scan.py` trims the submitted views to the geometry budget (uniform) and uses the preset segmentation-view count.
- **§10.6 image-set vs video** — `source_mode` gains `video_scan`. `run_scan_pipeline` builds the one-trajectory Scan Camera track only for `video_scan`; an unordered image set (`multi_view`) inserts just the anchor source camera (`_anchor_source_camera`) and reports `provider_summary["scan_kind"]`. `node_bridge` treats a queued IMAGE batch as `multi_view` unless the widget says otherwise; the `recon_source_mode` combo offers `video_scan`.
- **§20 scan performance bounds** — `_MAX_INSTANCES_BEFORE_FUSION = 96` (score-sorted trim before fusion), final scan objects capped at `min(max_blockout_objects, 32)`, `_ABSOLUTE_MAX_VIEWS = 128` → `RECON_TOO_MANY_VIEWS`.
- **§5.2** — `ViewCameraEvidence.world_from_camera` property (inverse of the stored camera-from-world extrinsic), the name the spec uses.

`tests/reconstruction` **335 passed**; whole repo **1318 passed / 3 skipped**; frontend node **657**; ruff + mypy (41 files) clean. Docs (NODES) updated for scan source modes + presets. **No commit** (working tree only).

### Round 5 — model/dependency install + real-hardware validation (2026-09-07)

Installed into the ComfyUI runtime (`python_embeded`, Python 3.12, torch 2.9.1+cu130, RTX 4090 / 24 GB):

| Component | Result |
|---|---|
| MoGe (`moge-2-vitl-normal.pt`) | already present |
| SAM3.1 (`models/checkpoints/sam3.1_multiplex_fp16.safetensors`) | already present — adapter's exact auto target |
| `av`, `aiohttp` | already present |
| **`vggt` package** | installed from GitHub with `--no-deps` (protects numpy/opencv) |
| **VGGT-1B checkpoint** | `models/geometry_estimation/vggt/VGGT-1B/model.pt` (4.68 GB, `facebook/VGGT-1B`, **non-commercial licence** — `VGGT-1B-Commercial` is HF-gated, no token) |
| SAM 3D Objects | **not installable here** — needs Linux 64-bit + ≥32 GB VRAM (this box is Windows + 24 GB); capability gate refuses it cleanly |

**Incident + recovery:** the first `pip install vggt` (with deps) downgraded numpy 2.4.6→1.26.4 and partially uninstalled `opencv-python` (aborted on a locked `cv2.pyd`, `WinError 5`). Restored numpy 2.4.6 (`--force-reinstall --no-deps`) and repaired `cv2` by re-extracting the 4 removed files (`__init__.py`, `__init__.pyi`, `config.py`, `config-3.py`) from a fresh wheel. Verified: `numpy 2.4.6 · cv2 4.13.0 · torch 2.9.1+cu130 (CUDA) · vggt 0.0.1` all import together. `vggt`'s `numpy<2` metadata pin is over-conservative — real inference runs fine on numpy 2.x (kept, since ComfyUI needs it).

**Real-hardware validation (RTX 4090) — found & fixed 2 bugs the fake providers missed:**
- **VGGT** forward through the adapter: 3 views in 11.3 s, `points_world` 100 % finite, every camera `det(R)=+1` (orthonormality err ~1e-8), **anchor camera at world origin**, 7.2 GB peak VRAM. **Bug fixed:** `_preprocess_vggt_samples` now resizes to 518-width / multiple-of-14 and white-pads mixed aspect ratios — VGGT's ViT `assert W % 14 == 0` was never exercised by the fakes. +1 test.
- **SAM3** detection through the adapter: 4 instances in 3.9 s, **bbox `{x,y,width,height,score}` → xyxy decode verified against ground-truth rectangles**, multi-detection via the `"label : N"` prompt confirmed (2 boxes for one category), `CurrentNodeContext` fallback works (no `last_prompt_id` crash), 2 GB VRAM. All three review-finding fixes (#1 box format, #2 node context, #5 max-detections) validated on real model output.
- **Code:** `VggtProvider.capabilities().metadata["commercial_use"]` is now `False` when only the non-commercial `VGGT-1B` is installed (+ `noncommercial_checkpoints` list, `auto_select` gated on a commercial checkpoint). +2 tests.

`tests/reconstruction`: **317 passed** on both the system python and the ComfyUI embedded python; ruff + mypy clean.

### Round 4 — remaining code work (2026-09-07)

- **Full scene re-levelling (finding #8):** new `omnicam/reconstruction/leveling.py` — one rigid rotation applied to points + camera + planes so a confident, gently-tilted floor (`MIN_GROUND_CONFIDENCE` 0.60, tilt in 1°–30°) becomes world-horizontal *before* fitting. Wired into `single_blockout.py` (`level_scene`) and `scan.py` (`level_scan_evidence`, rotates every `ViewCameraEvidence` too; an early plane pass supplies the ground). `provider_summary["levelled"]` reports it. `test_leveling.py` 5 cases. mypy-checked.
- **Task 17 Director wiring:** `director-adopt.js` now applies `reconstructionAdoptionDefaults` per adopted object (blockout unlocked; room/reference locked; dense reference `enabled:false` in Blockout, visible in Hybrid) via `applyReconstructionAdoptionDefaults` + `reconstructionModeOf`. `reconstruction-badges.js` folds the per-axis inspector rows into the badge tooltip and exposes `semantic`/`role`; `objects.js` prefixes the badge with the semantic class ("chair · High (82%)"). +2 director-adopt tests.
- **Task 37 CI:** `python-full` → **`python-reconstruction`** job — CPU torch + aiohttp + pillow + PyAV, runs `tests/reconstruction` + validation/schema + the reconstruction `.node.mjs` frontend tests. `python-core` comment clarified. YAML validated.
- **Task 39 Playwright:** `stubs/api.js` capabilities → **v2** with `segmentation` + an unavailable `sam3d_objects` (reason text). `scene-reconstruction.spec.js` +2: Result-mode select shows the 4 current modes and Blockout reveals the semantic rows while Depth Mesh hides them; capabilities endpoint exposes segmentation/completion with SAM3D unavailable.

**Still open:** Task 16 capability-badge rendering *inside* the live panel (helpers + stub data ready, DOM binding not done); real GPU inference + live/Vue Playwright runs; deployed-instance 404 (deployment).

Verification (round 4): whole repo **1298 passed / 3 skipped** (3 pre-existing env failures deselected); frontend node **657 passed**; ruff + mypy (41 files) + 800-line check clean.

### Round 3 — remaining work attacked (2026-09-07)

- **#4 done:** `nodes/extractor.py` declares all 19 `recon_*` widgets; `execute()` builds `ReconstructionSettings` via `reconstruction_settings_from_widgets()` and passes it to `execute_reconstruction`. Scan mode consumes an IMAGE batch (`sample_image_batch`). `template.js` + `controls.js` panel now exposes Depth Mesh / Blockout / Hybrid / Scan + segmentation/completion/labels/max-objects; interactive path carries every field to `jobs/api.py`. `capabilities.py` v2 aggregates segmentation + completion.
- **#18 done:** route error codes already correct (verified); `panel.js` gained `recoverResult` / `recoverStatus` for missed "done" events / WebSocket gaps.

**Still open (need runtime / harness):** Task 17 Director-side wiring (`director-adopt.js` / `outliner.js` / `inspector.js`); Task 37 `.github/workflows/test.yml` job split (CI-only); Task 39 Playwright specs; full scene re-levelling for tilted photos (the ground *proxy* now follows the normal, but geometry+camera+objects aren't re-levelled together); real GPU inference + live/Vue suites; the deployed instance's `/majoor/omnicam/reconstruction/*` returning 404 (deployment, not code).

Verification (round 3): `tests/reconstruction` **310 passed**; whole repo **1293 passed / 3 skipped** (3 pre-existing env failures deselected); frontend node tests **655 passed**; ruff + mypy + 800-line check clean.

---

## Running log

| Date | Task | Notes |
|------|------|-------|
| 2026-09-07 | Task 1 | Verified already satisfied by tree `c3e1588`; `test_scene_builder.py` + `test_pipeline.py` → 26 passed. No changes needed. |
| 2026-09-07 | Task 3 | `settings.py` + `fingerprint.py` extended. `tests/reconstruction` 182→193 passed, ruff clean, mypy clean on `settings.py`. No commit (policy). |
| 2026-09-07 | Task 2 | New `omnicam/reconstruction/blockout/` package (`__init__.py`, `types.py`) + `test_blockout_types.py`. Green, ruff+mypy clean. |
| 2026-09-07 | Task 4 | Pure part done: `model_identity.py` + `test_model_identity.py` (6 cases). Cache-manifest wiring deferred. |
| 2026-09-07 | — | Pre-existing unrelated failure noted: `tests/test_extractor_jobs.py::test_dpvo_does_not_start_while_comfyui_is_executing` fails on clean `c3e1588` too (not caused by this work). |
| 2026-09-07 | Tasks 5–12 | Deterministic blockout core: masked_points, obb, primitive_resolver, object_fitter, room_shell, segmentation contracts + fake, native SAM3 adapter, compiler. `tests/reconstruction` 302 green, ruff+mypy clean on pure modules. |
| 2026-09-07 | Tasks 13–14 | Pipeline split into `pipelines/` + facade; job state machine extended with semantic/scan stages, frontend `state.js` mirrored. 246 recon green; 633 broader green. |
| 2026-09-07 | Tasks 19–28, 34 | GPU stage guard; full VGGT multi-view phase (types/sampling/source/provider/coordinates/camera-track/fusion/scan pipeline) + research-only VGGT-Ω. All with fakes — no CUDA / no `vggt` pkg needed. `tests/reconstruction` **331 passed**, ruff clean. Deferred: node-bridge scan-source wiring (needs frontend Task 15); cache-manifest model_identities (Task 4 step 3). |
| 2026-09-07 | Tasks 29–36, 38 | SAM3D completion phase (contract/fake/capability gate/inference adapter/bounded alignment/policy) + job admission-vs-history split + `blockout.json`/`scan_evidence.json` atomic persistence + comfy-integration smoke MoGe/SAM3 signature asserts. |
| 2026-09-07 | Tasks 15–17 (partial), 37, 40 | New frontend helper modules `settings-sync.js` / `modes.js` / `taxonomy.js` / `capability-badges.js` / `scene/reconstruction-inspector.js` + 3 `.node.mjs` tests (13 cases, green). mypy `files=` extended to the pure recon modules (39 files clean). Docs updated across README/NODES/COMPATIBILITY/SECURITY. |
| 2026-09-07 | full suite | `tests/reconstruction` **298 passed**; whole repo **1274 passed / 3 skipped** with only the 3 pre-existing env failures deselected (2× director-monitor `Torch not compiled with CUDA`, 1× dpvo). ruff + mypy + 800-line check all clean. **Nothing committed** — all in the working tree. |
| 2026-09-07 | Round 11 | Blockout asset library: `omnicam/reconstruction/asset_library/` (load/gate/resolve), compiler `asset_placements`, `blockout_assets` setting + `off`/`proxy`/`replace`, `RECON_ASSET_LIBRARY_*` errors, `scripts/fetch_blockout_library.py --download` + `library.default.json` (23 CC0 Kenney classes, installed to `input/majoor_omnicam/blockout_library/`), `docs/BLOCKOUT_ASSET_LIBRARY.md`. Python **1328**, frontend node **671**, `npm run check` green. No commit. |
| 2026-09-07 | Round 10 | Director: `graph-connection-watch.js` backstop for stale panels on input disconnect (Extractor + Director); outliner gains its own key zone + `sceneKeymap`, `deleteSelectedObjects` batch delete, shift-range / ctrl-toggle selection, double-click inline rename. node **669**, `npm run check` green, build refreshed. No commit. |
| 2026-09-07 | Round 9 | Director: `recenter_scene`/`recenter_translation` (floor→Y=0, room→origin) in `leveling.py`, wired into `single_blockout.py` + `scan.py`; `motionSceneToEditorState`/`motionSceneToEditorCameras` in `director-adopt.js` fix "undefined" cameras + lost framing. recon **339**, frontend node **660**, build refreshed. No commit. |
| 2026-09-07 | REMAINING | Frontend wiring into big existing files (panel/controls/views/director-adopt/outliner/inspector + `nodes/extractor.py` `recon_*` widgets), Task 18 (HTTP recovery + route error codes), Task 39 (Playwright), Task 37 CI YAML split, Task 4 step-3 (per-stage model_identity tokens into the manifest as a strict miss trigger). All need the browser / ComfyUI / CI harness. |
