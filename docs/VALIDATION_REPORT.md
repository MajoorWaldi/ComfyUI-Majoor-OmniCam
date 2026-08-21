# Validation report

Last updated: 20 August 2026

## Current automated checks

- [x] Frontend production build.
- [x] Frontend syntax checks.
- [x] Frontend unit and parity tests.
- [x] Python test suite.
- [x] Handwritten source files are limited to 800 lines.
- [x] Source text passes the UTF-8 and mojibake guard.
- [x] Production exposes one JavaScript extension bundle (`web/omnicam.js`).
- [x] Python core matrix covers 3.10 and 3.12 in CI.
- [x] ComfyUI 0.31.0 and current `master` integration lanes import all five public nodes, call `extension.on_load()`, and evaluate every schema.
- [x] Capability discovery tests V3 `define_schema()` before legacy `INPUT_TYPES()`.
- [x] LOAD3D quaternion edge cases cover roll 90/180 degrees, vertical up/down and coincident position/target.

## Manual checks still required before a public release

- [ ] Complete workflow save and reload in a running ComfyUI installation.
- [ ] Full playblast recording with the supported browsers.
- [ ] Real model generations with installed third-party integrations.
- [ ] Blender and Unreal export verification in their target applications.

Passing automated checks confirms code integrity. It does not replace the manual checks above.
