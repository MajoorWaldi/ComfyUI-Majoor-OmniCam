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
| 2026-09-07 | REMAINING | Frontend wiring into big existing files (panel/controls/views/director-adopt/outliner/inspector + `nodes/extractor.py` `recon_*` widgets), Task 18 (HTTP recovery + route error codes), Task 39 (Playwright), Task 37 CI YAML split, Task 4 step-3 (per-stage model_identity tokens into the manifest as a strict miss trigger). All need the browser / ComfyUI / CI harness. |
