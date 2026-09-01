# Validation report

**Status: working tree, not a released commit.**

| | |
|---|---|
| Base commit | `6c6599a78c3d0cc658c7a383749bb19cc7305c71` (*refactor: modernize OmniCam workflow and Monitor*) |
| Validated | uncommitted working tree on top of that commit |
| Date | 1 September 2026 |
| ComfyUI | 0.34.1, local install |
| GitHub Actions run | none — these are local results |

This file records what was *observed*, not what is expected. It must be
regenerated against a committed SHA with a green Actions run before it can be
cited as release evidence; until then the row above says so plainly, because
the previous version of this file reported a green suite for a commit whose CI
was red.

## Gates

- [x] **Model-agnostic Python lane** — `pytest -q` with numpy, jsonschema and
      pytest-asyncio only, no torch and no ComfyUI: **614 passed, 59 skipped**.
      This is the lane CI runs on 3.10 / 3.12 / 3.13, and the one that was red
      at the base commit: three suites imported torch or `comfy_api` at module
      scope and failed collection for the whole run.
- [x] **Full Python lane** — same suite with the ComfyUI runtime and torch
      present: **820 passed, 3 skipped**.
- [x] **`ruff check .`** — clean.
- [x] **`mypy`** — clean across the 29 scoped source files.
- [x] **`npm run build`** — Vite production build; the committed bundle in
      `web-chunks/` matches the source.
- [x] **`npm run check`** — 412 files under the 800-line ceiling, 466 files
      UTF-8 clean, 58 three.js symbols all used, template contract across 14
      template sources, third-party notices current.
- [x] **French locale** — 100.0% of 502 source messages (was 95.4%).
- [x] **Frontend unit modules** — **422 passed**.
- [x] **Playwright viewport suite** — **59 passed**. The three Monitor specs
      that were failing pointed at a harness deleted in the base commit and at
      four view modules replaced during the Monitor refactor; both the harness
      and the specs are rewritten against the shipped UI.
- [x] **`scripts/verify_package.py`** — OK.
- [x] **Upstream contract parity** — every literal pinned in
      `tests/fixtures/upstream_contracts/` verified against the installed
      ComfyUI 0.34.1 source.

## Not covered here

- **GitHub Actions.** Nothing in this file was produced by CI. The
      `comfyui-integration` (0.31 / 0.34 / master) and `comfyui-browser` lanes
      were not run locally.
- **Live ComfyUI browser gate** (`npm run test:live`) — not re-run.
- **Generation.** No model was loaded. Every profile claim here is about the
      payload OmniCam compiles and the socket contract it targets, not about
      the video a model produces from it.

## Known state of the working tree

The base commit's CI was red. What was fixed on top of it:

| Was | Now |
|---|---|
| 3 suites failed collection on the core lane | torch is an `importorskip`; the MotionScene socket name lives in the pure domain |
| Trajectories sampled across `[0, duration]` | sampled across the shot's real frame span `[0, (n-1)/fps]` |
| Multi-shot edits compiled silently to one camera | BLOCKED on single-camera profiles; neutral prompt on reference-video profiles |
| H3 Native's five-frame minimum was a comment | enforced against the decoded playblast |
| H3 API media limits lost in the profile migration | fps and duration checked against the documented contract |
| Capability and profile registries used different ids | one vocabulary; the translation table is gone |
| Capability detection was advisory | the selected profile's downstream contract blocks the compile |
| Non-encodable tracks dropped silently | reported per layer before encoding |
| `cuts` and scene objects were untyped dicts | `CutEvent` is typed and validated; objects go through canonical validation |
| 4 of 5 example workflows wired removed nodes | 3 rebuilt, one per semantic, checked against the live schemas |
| README and NODES described the pre-MotionScene product | rewritten |
