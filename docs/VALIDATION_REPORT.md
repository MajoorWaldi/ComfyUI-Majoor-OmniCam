# Validation report

**Status: uncommitted working tree, not a released commit.**

| | |
|---|---|
| Base commit | `1647006d4973c77a8a756c437c28e44c61774010` (*Fix ruff N818 / RUF059 in the new hardening tests*) |
| Validated | uncommitted working tree on top of that commit — the MotionScene-contract remediation pass (docs realignment, MotionScene migration registry, Nodes 2.0 / current-frontend CI, Extractor hardening, release adapter gate, conformance scaffold, legacy helper removal) |
| Date | 3 September 2026 |
| ComfyUI | 0.34.1, local install (`python_embeded`, Python 3.12.10) |
| Node / npm | Node v22.20.0 |
| Python (core lane) | 3.14.0, local |
| GitHub Actions | **not run for this tree.** The lanes below marked *CI-only* ran for the base commit; this working tree has not been committed or pushed. |

This file records what was *observed* this session, not what is expected. It
must be regenerated against a committed SHA with its own green Actions run
before it can be cited as release evidence.

## Gates observed this session

- [x] **`python -m pytest -q`** (Python 3.14, local) — **864 passed, 18 skipped**.
      Includes the new suites this pass: MotionScene migration-registry
      invariants (`tests/test_motion_scene.py`), bounded Extractor shutdown
      (`tests/test_extractor_jobs.py`), and the conformance scaffold guard
      (`tests/test_conformance_scaffold.py`). Two dead-code tests for the
      removed `check_workflow_compatibility` helper were deleted.
- [x] **`python -m ruff check .`** — all checks passed (two `os error 5`
      warnings on unreadable `.pytest_*` scratch dirs, unrelated to sources).
- [x] **`python -m mypy`** — success, no issues in the 30 scoped source files.
- [x] **`python scripts/verify_package.py`** — OK.
- [x] **`npm run build`** — Vite production build; `web-chunks/` regenerated
      from source and identical to the committed bundle (`git diff --exit-code
      -- web/ web-chunks/` clean).
- [x] **`npm run check`** — 448 files under the 800-line ceiling, 508 files
      UTF-8 clean, 58 three.js symbols all used, locales at budget
      (fr.js 100.0% of 525), template contract across 19 sources, third-party
      notices current.
- [x] **`npm run test:unit`** — **511 passed**, 0 failed.
- [x] **`npm run test:browser`** (Playwright, Chromium, no server) —
      **61 passed**.
- [x] **`npm run test:live` — `live-ci.spec.js`** against the local ComfyUI
      0.34.1 (`OMNICAM_LIVE_AUTOSTART=1`) — **6 passed** (Director reload /
      recreate / queue, Extractor lazy UI attach+detach, TRACK 3D render,
      Subgraph mount, ancient-v1 workflow load, epoch diagnostics).
- [x] **`npm run test:live` — `live-vue-ci.spec.js`** (new, Nodes 2.0 / Vue
      nodes enabled) against the same server — **3 passed**: Director,
      Extractor and Monitor each mount a connected Vue root and dispose it on
      node removal with zero page errors.

## Gates not run this session

- [ ] **Model-agnostic Python lane** (numpy only, no torch / ComfyUI) —
      *CI-only*; `python-core` matrix on 3.10 / 3.12 / 3.13.
- [ ] **`comfyui-integration`** (ComfyUI `v0.31.0` / `v0.34.0` / `master`) —
      *CI-only*. Local evidence for 0.34.x: the OmniCam nodes import in 0.34.1
      (import time reported 0.0 s) and every live browser test above passed
      against it. `scripts/comfy_integration_smoke.py` was not run locally —
      the embedded interpreter's `._pth` ignores `PYTHONPATH`.
- [ ] **`comfyui-browser-current-frontend`** (new lane: `live-ci` +
      `live-vue-ci` against a pinned newer frontend,
      `Comfy-Org/ComfyUI_frontend@1.54.1` via `OMNICAM_LIVE_COMFY_ARGS`) —
      *CI-only*; the pinned frontend package is not fetchable in this
      environment. The `OMNICAM_LIVE_COMFY_ARGS` plumbing in
      `playwright.live.config.mjs` is exercised by both live runs above (empty
      value, no behavior change).
- [ ] **Release adapter-contract gate** (`publish_action.yml`) — added; fires
      only on a `v*` tag. `python scripts/adapter_contract_canary.py` logic is
      covered by `tests/test_adapter_contract_canary.py` (**2 passed**).
- [~] **Real DPVO solve on GPU** — not re-run. Last observed on an earlier
      commit: 96 frames at 640×384, coverage 1.0, ~6.5 s on an RTX 4090. The
      pre-release contention guard retains unit coverage.
- [ ] **Branch protection** — documented in `docs/BRANCH_PROTECTION.md`; not
      verifiable from here. The new required context
      `comfyui-browser-current-frontend` must be added to the protected-branch
      check set before it can gate a merge.

## Real-model conformance — every profile PENDING

No Monitor profile has been certified against a real downstream model in this
pass. `docs/CONFORMANCE.md` and `tests/conformance/` were added as the
scaffold (cases, result schema, PASS criteria, minimum sets); the
`results/` directory is empty by design.

| Profile | Contract (socket/schema) | Model certification |
|---|---|---|
| external_reference_video | pass (permissive) | **PENDING** |
| wan_camera_native | verified by capability gate | **PENDING** |
| wan_move_native | verified by capability gate | **PENDING** |
| wan_track_native | verified by capability gate | **PENDING** |
| wanvideo_ati | verified by capability gate | **PENDING** |
| ltx25_motion_track | verified by capability gate | **PENDING** |
| h3_native | verified by capability gate | **PENDING** |
| h3_api | verified by capability gate | **PENDING** |

## Changes in this pass

Documentation, CI and hardening — no architecture change, no new node, no
MotionScene schema break (v1 stays v1; the registry is wired for a future v2).

| Area | Change |
|---|---|
| Contracts docs | `AGENTS.md`, `docs/TECHNICAL_REFERENCE.md`, `docs/SECURITY.md`, `docs/NODES.md` realigned on `OMNICAM_MOTION_SCENE` as the product interchange contract, with `MAJOOR_OMNICAM_TRACK` demoted to the embedded camera primitive. Stale `/monitor/snapshot` boundary replaced with the real `/monitor/live_preflight` boundary. Phantom Extractor `/jobs/{id}/pause` and `/resume` routes removed; `method` default corrected to `auto`. |
| New docs | `docs/COMPATIBILITY.md` (rewritten in English, contract-vs-certification split) and `docs/CONFORMANCE.md` added to the maintained set (`.gitignore` allowlist updated). |
| MotionScene migrations | `OMNICAM_MOTION_SCENE` registered in `omnicam/core/migrations.py` (`CURRENT_VERSIONS`, `_payload_version` handling the `version` field). `MotionScene.from_dict` now requires `version`, routes the payload through `migrate_payload`, and rejects a version newer than supported. `MOTION_SCENE_VERSION` is now owned by the registry. |
| Nodes 2.0 CI | `tests/frontend/live-vue-ci.spec.js` mounts/disposes all three nodes with `Comfy.VueNodes.Enabled`. `playwright.live.config.mjs` gained the test-only `OMNICAM_LIVE_COMFY_ARGS` knob. `test.yml`: the `comfyui-browser` job also runs `live-vue-ci`; new `comfyui-browser-current-frontend` job re-runs both live suites against a pinned newer frontend. |
| Extractor hardening | pycolmap diagnostic wording corrected ("five other nodes" → "the other OmniCam product nodes"); remediation now names DPVO, pycolmap **and** OpenCV/SIFT. `SolveJobManager.shutdown()` now terminates solver children, then joins worker threads with a bounded `SHUTDOWN_JOIN_SECONDS = 5.0` budget and logs any still-alive thread instead of blocking teardown. |
| Release gate | `publish_action.yml` clones current LTX-Video and WanVideoWrapper sources and runs `adapter_contract_canary.py` before `Publish Custom Node`: a `v*` tag does not publish on upstream contract drift. The weekly canary stays `continue-on-error`. |
| Legacy removal | dead `check_workflow_compatibility()` (always returned `{"ok": True, "problems": []}`) and its two tests removed. No replacement table. |
| Experimental status | `MajoorOmniCamMonitor` now ships `is_experimental=True` (Director and Extractor already did — all three product nodes are experimental). Director's **Motion Tracks** panel carries an `EXPERIMENTAL` badge and note. Docs (`NODES.md`, `COMPATIBILITY.md`, `CONFORMANCE.md`, `USER_GUIDE.md`, `AUDIT.md`) aligned; `tests/test_node_registry.py` asserts all three schemas are experimental. |
| Docs media | Added `docs/assets/omnicam-overview.png` (335 KB full-graph screenshot), `docs/assets/omnicam-demo.gif` (3.1 MB, downscaled/optimised from a 23 MB source), `docs/assets/omnicam-preview.mp4` (1.0 MB, re-encoded with `+faststart`). Embedded in `README.md`, `docs/NODES.md`, `docs/USER_GUIDE.md`. |

## Re-run to reproduce

```
python -m pytest -q                         # 864 passed, 18 skipped
python -m ruff check .                       # all checks passed
python -m mypy                               # success, 30 files
python scripts/verify_package.py             # OK
npm run build && npm run check               # pass; web/ diff clean
npm run test:unit                            # 511 passed
npm run test:browser                         # 61 passed
OMNICAM_LIVE_AUTOSTART=1 OMNICAM_LIVE_MATCH=live-ci.spec.js     npm run test:live   # 6 passed
OMNICAM_LIVE_AUTOSTART=1 OMNICAM_LIVE_MATCH=live-vue-ci.spec.js npm run test:live   # 3 passed
```

Still owed before this file is release evidence: commit the tree; let every CI
lane (including the new `comfyui-browser-current-frontend`) run green on the
new SHA; add that lane to branch protection; run the real-model conformance
sets in `docs/CONFORMANCE.md` and move certified profiles off PENDING; then
regenerate this report against that SHA.
