# Validation report — 0.3.0

Date: 13 August 2026

## Passed locally

- `python -B -m pytest -q -p no:cacheprovider` — 15 passed.
- `python -m compileall -q omnicam tests` — passed.
- `python scripts/verify_package.py` — passed, including both JSON examples and release assets.
- `npm run build` — passed with Vite 7.3.6, bundled Three.js 0.180.0 and Mediabunny 1.53.1.
- `npm run check` — both frontend production files parse.
- `npm run test:browser` — 1 passed in Microsoft Edge headless: perspective/orthographic render, all six proxy modes, GLB load, two-frame WebCodecs encode, and WebGL/model disposal.
- `npm run test:live` — 1 passed against installed frontend 1.48.7 with Nodes 2.0: DOM mount/resize, compact menus and PrimeIcon timeline controls, pointer and wheel capture at 65% graph zoom, yellow selection/red automatic camera-key editing, no camera response outside the node, real keyboard insertion/stepping/copy/paste/delete/play capture, input-field shortcut exclusion, timeline retiming/inspection, X/Y/Z translate/rotate/scale interactions, two-item upstream selection, serialize/reconfigure restore, and legacy/Nodes 2.0 switching.
- `npm audit` — zero findings at validation time.
- Installed ComfyUI embedded Python imported the extension and constructed all 15 V3 schemas.
- Isolated ComfyUI health/object-info checks passed; GLB route rejected invalid extension and invalid binary content with HTTP 400 without retaining a file.

- `ruff check omnicam tests` — passed in the local isolated development environment.
- Native Wan runtime smoke test — output shape `(1, 24, 2, 64, 64)` for a 5-frame/64px test, matching core folding.

## Source contracts inspected

- Installed ComfyUI v0.32.0 V3 API, `VIDEO`, `LOAD3D_CAMERA`, routes, MiniMax H3 node, Wan trajectory and conditioning.
- WanVideoWrapper commit `088128b224242e110d3906c6750e9a3a348a659b`, including exact `WanVideoATITracks` JSON.
- ComfyUI-LTXVideo commit `ac4d99839020b983e956a8ab67ec38aec1b6e65a`, including IC-LoRA guide and camera-control LoRAs.
- Official sources listed in `OFFICIAL_SOURCES.md`.

## Not claimed as passed

- Complete user-driven workflow file save/reload and full-duration playblast queue acceptance.
- H3, Wan and LTX model generations.
- Execution inside Blender or Unreal.
- Windows Portable/Desktop, macOS and Linux manual matrices.
- Registry publication; publisher metadata remains a placeholder.

The implementation is integrated and testable, but a public production-tested claim remains gated by those external checks. `MANUAL_QA.md`, `H3_BENCHMARK.md`, and `COMPATIBILITY.md` define the remaining evidence.
