# Development guide

## Install and build

Place the repository below `ComfyUI/custom_nodes`, restart ComfyUI after Python changes, and hard-refresh after frontend changes. End users use the committed bundle. Frontend contributors run:

```text
npm ci
npm run build
npm run check
npm run test:browser
npm run test:live
```

Pure Python validation:

```text
python -B -m pytest -q -p no:cacheprovider
python -m compileall -q omnicam tests
python scripts/verify_package.py
ruff check omnicam tests
```

## Health route

`GET /majoor/omnicam/health` returns:

```json
{"ok": true, "name": "ComfyUI-Majoor-OmniCam", "api": 2}
```

## Implementation rules

- Inspect current official ComfyUI and exact downstream source before changing a contract.
- Keep `core` free of Comfy imports and model semantics.
- Rebuild `web/omnicam-webgl.js` after changing `web-src/viewport.js`; never hand-edit the generated bundle.
- Keep routes same-origin, local-only, size-limited and contained in managed directories.
- Add math/serialization tests for every track, projection, sequence or adapter-contract change.
- Update behavior documentation with code changes.

## Live QA and versioning

Run every applicable item in `MANUAL_QA.md`. The runtime should expose all 15 nodes. Verify save/reload, Nodes 2.0 and legacy rendering, multi-item upstream preview refresh, playblast queue output and disposal after deletion. `test:live` expects an isolated ComfyUI at `127.0.0.1:8191`.

Use patch for compatible fixes, minor for compatible features/adapters and major for workflow/schema breaks. Schema changes require migration code and tests; third-party bridges pin the supported commit.
