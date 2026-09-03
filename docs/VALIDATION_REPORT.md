# Validation report

**Status: uncommitted working tree, not a released commit.**

| | |
|---|---|
| Base commit | `99fbb4afa1268a6027cfc5f4a5a4ad1ec003fc40` (*Handle orthographic viewport rendering and steady CI browser tests*) |
| Validated | uncommitted working tree on top of that commit — a hardening pass (see *Fixed on top of the base commit*) |
| Date | 3 September 2026 |
| ComfyUI | 0.34.1, local install |
| GitHub Actions | run `33678187191` — **success** — was produced for the **base commit** `99fbb4a`, *not* for this working tree. The tree below has not yet been committed or re-run through CI. |

This file records what was *observed*, not what is expected. It must be
regenerated against a committed SHA with its own green Actions run before it can
be cited as release evidence; until then the rows above say so plainly, because
an earlier version of this file once reported a green suite for a commit whose
CI was red.

## Gates

- [x] **Full Python lane** — `pytest -q` with the ComfyUI runtime and torch
      present: **937 passed, 3 skipped** (940 collected). Includes the four new
      suites this pass: motion-scene invariants, playblast freshness, the DPVO
      pre-release guard, and the Monitor duration/fps inheritance.
- [ ] **Model-agnostic Python lane** — numpy / jsonschema / pytest-asyncio only,
      no torch, no ComfyUI. Not re-run this session (no isolated env here); CI
      runs it on 3.10 / 3.12 / 3.13 and it was green for the base commit.
- [ ] **`ruff check .`** — not re-run this session (`ruff` absent from this
      interpreter). Green for the base commit in CI.
- [ ] **`mypy`** — not re-run this session (`mypy` absent from this
      interpreter). Green for the base commit in CI. The scoped set in
      `pyproject.toml` is 30 source files; none were changed in a way that
      alters their type surface.
- [x] **`npm run build`** — Vite production build; the committed bundle in
      `web-chunks/` was regenerated from source in this pass and matches it.
- [x] **`npm run check`** — 446 files under the 800-line ceiling, 503 files
      UTF-8 clean, 58 three.js symbols all used, template contract across 19
      template sources, third-party notices current.
- [x] **French locale** — 100.0% of 525 source messages (0 untranslated).
- [x] **Frontend unit modules** — **511 passed**.
- [ ] **Playwright viewport suite** — not re-run this session. 59 passed for the
      base commit.
- [x] **`scripts/verify_package.py`** — OK.
- [~] **Real DPVO solve on GPU** — not re-run this session. Last observed on the
      base commit: 96 frames at 640x384 through `DpvoBackend.solve`, 96 poses,
      coverage 1.0, ~6.5 s, RTX 4090, with ComfyUI's `PYTORCH_CUDA_ALLOC_CONF`
      set in the parent. The pre-release guard added this pass has unit
      coverage (`tests/test_extractor_dpvo_worker.py`,
      `tests/test_extractor_jobs.py`) but not a fresh end-to-end GPU run.

## Not covered here

- **GitHub Actions on this tree.** The `comfyui-integration` (0.31 / 0.34 /
  master) and `comfyui-browser` lanes ran for the base commit only. Commit this
  pass and let CI re-run before citing it.
- **Live ComfyUI browser gate** (`npm run test:live`) — not re-run.
- **Generation.** No model has been loaded. Every profile claim here is about
  the payload OmniCam compiles and the socket contract it targets, not the
  video a model produces from it. The eight target profiles have **not** been
  smoke-tested against their real downstream nodes:

  | Profile | Real-model smoke |
  |---|---|
  | External / Generic Reference Video | ⬜ |
  | Wan Camera (native) | ⬜ |
  | Wan Move (native) | ⬜ |
  | Wan Track (native) | ⬜ |
  | WanVideo ATI | ⬜ |
  | H3 Native | ⬜ |
  | H3 API | ⬜ |
  | LTX Motion Track | ⬜ |

  Each needs a 2–5 s generation checked for: direction, timing, framing, frame
  count, target dimensions, trajectory scale, visibility, cuts where relevant,
  no proxy-appearance leakage, no socket/runtime error.

- **Branch protection.** Documented in `docs/BRANCH_PROTECTION.md`. Not verified
  this session (the connected GitHub integration returns `403 Resource not
  accessible by integration` for the protection endpoints); check it directly
  in the repository settings before release. The eight required check contexts
  the policy names do match the job names in `.github/workflows/test.yml`.

## Fixed on top of the base commit

This pass is edge-invariant hardening — no architecture change, no new node,
no schema break beyond widening two Monitor float widgets to accept `0`.

| Was | Now |
|---|---|
| Monitor `duration_seconds` / `target_fps` were manual widgets (default `2.0` / `24.0`); a Director authoring a different shot had its length silently ignored | both default to `0` = *inherit the connected shot* (`timeline.duration_seconds` / `timeline.authoring_fps`); the widgets are optional overrides. Live preflight and queued `execute()` agree. |
| `World Point` and `Track Object` share the internal `project` tool, and `projectLayer()` picked `object_point` vs `world_point` from "is an object still selected?" — so a `World Point` chosen with an object selected recorded `object_point` | an ephemeral `ui.motionCreationKind` carries the artist's choice through to layer creation; the selection heuristic is the fallback only when the raw tool is armed with no creation card |
| DPVO released ComfyUI's VRAM just before spawning its child with no re-check; the in-loop contention probe is throttled 0.5 s and `watch_gpu_contention()` pushes the first probe past that window | `SolveControl.assert_gpu_free()` — an unthrottled contention + stop check — runs immediately before `_release_vram()` via `DpvoProcessRunner.solve(pre_release_guard=…)`; a workflow that started since admission aborts the solve before anything is freed or spawned |
| `MotionScene` accepted a camera track whose `fps` differed from `timeline.authoring_fps`; a cut could end past the timeline; `MotionLayer.semantic` accepted any non-empty string | all three are invariants now: `camera.track.fps == timeline.authoring_fps`, `cut.end_time_seconds <= timeline.duration_seconds`, `semantic ∈ {screen_point}` |
| A Director playblast recorded before the scene changed still reached H3 unchallenged; the "outdated" fingerprint check was frontend-only | the Director stamps `metadata.motion_scene_fingerprint_live` into the serialized state; `h3_native` / `h3_api` preflight (and queued `compile()`) go **BLOCKED** on a recorded-vs-current mismatch, `external_reference_video` goes **WARNING**, other profiles are unaffected |

## Re-run after this pass

```
python -m pytest -q          # 937 passed, 3 skipped
node scripts/run_node_tests.mjs   # 511 passed
npm run build && npm run check    # pass
python scripts/verify_package.py  # OK
```

Still owed before this file becomes release evidence: commit the tree, let CI
run all lanes green on the new SHA, run the eight real-model smoke tests, then
regenerate this report against that SHA.
