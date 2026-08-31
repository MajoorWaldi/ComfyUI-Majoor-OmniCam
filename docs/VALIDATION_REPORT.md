# Validation report

Last updated: 31 August 2026

## Results observed locally

- [x] Core Python suite without ComfyUI on `PYTHONPATH`: **681 passed, 8
      skipped** (`pytest -q`).
- [x] Full Python suite with the local ComfyUI runtime on `PYTHONPATH`: **724
      passed, 3 skipped** (`pytest -q`).
- [x] Python quality gates: `ruff check .` passed; scoped `mypy` passed for 14
      source files.
- [x] Python 3.10 dependency resolution selected
      `numpy-2.2.6-cp310-cp310-win_amd64.whl` in a targeted pip dry run.
- [x] Fresh frontend production build completed with Vite (245 modules).
- [x] Frontend static and contract checks passed (`npm run check`): line limit,
      UTF-8/mojibake guard, three.js surface, locale coverage, template
      contract, notices and bundle syntax.
- [x] Frontend unit discovery ran every `tests/frontend/*.node.mjs` module:
      **377 passed**.
- [x] Playwright viewport suite: **58 passed**.
- [x] Live ComfyUI browser gate: **6 passed** against local ComfyUI 0.34.1,
      covering Director creation/reload/recreation/queue, Extractor attachment,
      TRACK 3D, subgraph FPS, v1 workflow loading and diagnostics.
- [x] Hand-written source ceiling: 376 files checked, maximum 800 lines.
- [x] UTF-8/encoding gate: 420 files checked.
- [x] Three.js API contract: 58 symbols checked.
- [x] French locale coverage: 100% of 479 source messages.

The live run also reported local environment warnings for an older installed
frontend package, a missing optional `comfy_angle` package and an already locked
ComfyUI database. OmniCam still imported in 0.0 seconds and all six live tests
passed; those warnings were not hidden or counted as OmniCam failures.

## Coverage configured in CI

The following are configured GitHub Actions lanes. They describe expected
remote coverage; they are not presented as locally observed runs:

- `python-core` on Python 3.10, 3.12 and 3.13, with `fail-fast: false`;
- `python-full` on Python 3.12 with the runtime video/route dependencies;
- blocking ComfyUI integration lanes for `v0.31.0` (minimum) and `v0.34.0`;
- non-blocking ComfyUI `master` canary;
- blocking live browser integration against ComfyUI `v0.34.0`;
- frontend build, static checks, automatic unit discovery, generated-bundle
  parity and Playwright browser tests.

The exact required branch-protection contexts are documented in
[BRANCH_PROTECTION.md](BRANCH_PROTECTION.md).

## Manual checks still required before a public release

- [ ] Complete workflow save and reload in the intended release installation.
- [ ] Full playblast recording with every supported production browser.
- [ ] Real model generations with installed third-party integrations (MiniMax
      H3, Wan native camera, WanVideoWrapper ATI and LTX IC-LoRA).
- [ ] Camera interchange round-trip (`.glb`, `.usda`, `.chan`) in a target DCC
      such as Blender, Maya, Nuke or Houdini.

Passing automated checks confirms code integrity. It does not replace the
manual generation, recording and DCC checks above.
