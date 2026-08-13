# Release process

## Prepare

1. Read `ROADMAP.md`, `COMPATIBILITY.md`, and unresolved external QA items.
2. Keep the track and sequence schemas backward compatible; add migration tests before changing either version.
3. Synchronize versions in `pyproject.toml`, `omnicam/__init__.py`, and `package.json`.
4. Replace `REPLACE_WITH_COMFY_REGISTRY_PUBLISHER_ID` with the owner's real Registry publisher ID.

## Validate

```text
python -B -m pytest -q -p no:cacheprovider
python -m compileall -q omnicam tests
python scripts/verify_package.py
npm ci
npm audit
npm run build
npm run check
npm run test:browser
npm run test:live
```

Then run `MANUAL_QA.md` in a live current ComfyUI install and execute the adapter/DCC rows being claimed in `COMPATIBILITY.md`.

## Publish

Use a short release note covering behavior, compatibility pins, schema status, tests, and known external limitations. Publish through the official Comfy Registry workflow only after the publisher metadata is valid. Do not label a model adapter production-tested until its exact downstream version and generation workflow passed.
