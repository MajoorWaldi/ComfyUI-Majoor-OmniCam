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
- [x] ComfyUI 0.31.0 integration smoke imports all five public nodes and evaluates every schema.

## Manual checks still required before a public release

- [ ] Complete workflow save and reload in a running ComfyUI installation.
- [ ] Full playblast recording with the supported browsers.
- [ ] Real model generations with installed third-party integrations.
- [ ] Blender and Unreal export verification in their target applications.

Passing automated checks confirms code integrity. It does not replace the manual checks above.
