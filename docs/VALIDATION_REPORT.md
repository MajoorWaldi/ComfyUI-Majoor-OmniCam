# Validation report

**Status: working tree, not a released commit.**

| | |
|---|---|
| Base commit | `067a610536b7063a1f7a5b55b27d43814ce29c10` (*chore: sync extractor and frontend updates*) |
| Validated | uncommitted working tree on top of that commit |
| Date | 2 September 2026 |
| ComfyUI | 0.34.1, local install |
| GitHub Actions run | none — these are local results |

This file records what was *observed*, not what is expected. It must be
regenerated against a committed SHA with a green Actions run before it can be
cited as release evidence; until then the row above says so plainly, because an
earlier version of this file reported a green suite for a commit whose CI was
red.

## Gates

- [x] **Model-agnostic Python lane** — `pytest -q` with numpy, jsonschema and
      pytest-asyncio only, no torch and no ComfyUI: **820 passed, 17 skipped**.
      This is the lane CI runs on 3.10 / 3.12 / 3.13.
- [x] **Full Python lane** — same suite with the ComfyUI runtime and torch
      present: **884 passed, 3 skipped**.
- [x] **`ruff check .`** — clean.
- [x] **`mypy`** — clean across the 29 scoped source files. Run bare, as CI
      does: passing an explicit path overrides `files` in `pyproject.toml` and
      lints the unscoped node and route layers, which are covered by tests.
- [x] **`npm run build`** — Vite production build; the committed bundle in
      `web-chunks/` matches the source.
- [x] **`npm run check`** — 416 files under the 800-line ceiling, 472 files
      UTF-8 clean, 58 three.js symbols all used, template contract across 14
      template sources, third-party notices current.
- [x] **French locale** — 100.0% of 502 source messages.
- [x] **Frontend unit modules** — **429 passed**.
- [x] **Playwright viewport suite** — **59 passed**.
- [x] **`scripts/verify_package.py`** — OK.
- [x] **Real DPVO solve on GPU** — 96 frames at 640x384 through
      `DpvoBackend.solve`, 96 poses, coverage 1.0, 6.5 s, on an RTX 4090 with
      ComfyUI's `PYTORCH_CUDA_ALLOC_CONF` set in the parent.

## Not covered here

- **GitHub Actions.** Nothing in this file was produced by CI. The
      `comfyui-integration` (0.31 / 0.34 / master) and `comfyui-browser` lanes
      were not run locally.
- **Live ComfyUI browser gate** (`npm run test:live`) — not re-run.
- **Generation.** No model was loaded. Every profile claim here is about the
      payload OmniCam compiles and the socket contract it targets, not about
      the video a model produces from it. The seven target profiles have not
      been smoke-tested against their real downstream nodes.
- **Branch protection.** Documented in `docs/BRANCH_PROTECTION.md`; verified on
      2 September 2026 as **not applied** to `main` — the remote reports neither
      classic protection nor any ruleset. The eight required check contexts the
      policy names do match the job names in `.github/workflows/test.yml`.

## Fixed on top of the base commit

| Was | Now |
|---|---|
| The DPVO child ran tracking and `terminate()` with autograd enabled | the solve runs under `torch.no_grad()`, as upstream's `demo.py` does |
| A 48-frame clip peaked at 27.38 GiB and OOMed mid bundle adjustment | the same clip peaks at 0.41 GiB |
| The start gate read ComfyUI's queue once, then never again | a GPU solve re-reads it twice a second and yields the card when a workflow starts |
| The parent unset `PYTORCH_*` allocator tuning around every spawn | the child drops it for itself, before it imports torch |
| "Switching profile is a widget change, not a rewiring" | profiles publish different Monitor outputs, and the docs and in-app help now say which one to connect |
| Monitor compile tests asserted against the machine's installed nodes | the downstream preflight is pinned by a fixture, so they measure the compiler |
