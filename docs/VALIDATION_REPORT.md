# Validation report

Last updated: 31 August 2026

## Current automated checks

- [x] Frontend production build (`vite build`).
- [x] Frontend syntax and contract checks (`npm run check`: line limit, UTF-8 /
      mojibake guard, three.js surface, locale coverage, template contract,
      third-party notices, `node --check web/omnicam.js`).
- [x] Frontend unit and parity tests (`npm run test:unit`).
- [x] Playwright viewport tests (`npm run test:browser`).
- [x] Python test suite (`pytest -q`): 642 passed, 8 skipped, core suite runs
      without ComfyUI or torch installed.
- [x] `ruff check .` and scoped `mypy` (see `pyproject.toml [tool.mypy]`).
- [x] Hand-written source files are limited to 800 lines.
- [x] Production exposes one JavaScript extension bundle (`web/omnicam.js`).
- [x] Python core matrix covers 3.10 and 3.12 in CI.
- [x] A second CI job installs the ComfyUI runtime dependencies so the route and
      node-schema suites are exercised, not silently skipped.
- [x] Integration lanes for ComfyUI `v0.31.0` (minimum supported) and `v0.34.0`
      (stable compatibility) are blocking; ComfyUI `master` is a non-blocking
      canary. Each lane imports the extension, calls `extension.on_load()` and
      evaluates `define_schema()` for all **seven** registered nodes (three
      product nodes — Director, Extractor, Monitor — plus four deprecated
      compatibility nodes).
- [x] Capability discovery tests V3 `define_schema()` before legacy
      `INPUT_TYPES()`.
- [x] LOAD3D quaternion edge cases cover roll 90/180 degrees, vertical up/down
      and coincident position/target.

## Manual checks still required before a public release

- [ ] Complete workflow save and reload in a running ComfyUI installation.
- [ ] Full playblast recording with the supported browsers.
- [ ] Real model generations with the installed third-party integrations
      (MiniMax H3, Wan native camera, WanVideoWrapper ATI, LTX IC-LoRA).
- [ ] Camera interchange round-trip (`.glb` / `.usda` / `.chan`) verified in a
      target DCC (Blender, Maya, Nuke, Houdini).

Passing automated checks confirms code integrity. It does not replace the manual
checks above.
