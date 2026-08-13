# Security review

Review date: 13 August 2026.

## Boundaries

- The extension adds no telemetry, analytics, update checks, remote control, CDN import, or background network request.
- The frontend calls only same-origin ComfyUI routes for managed uploads and previews.
- Runtime Three.js code is pinned and committed in the local bundle.
- No frontend value reaches a shell command or runtime package installer.

## File handling

- Card uploads allow only PNG, JPEG, WebP, GIF, MP4, WebM, and MOV, with a 128 MiB limit.
- Model uploads allow only binary GLB 2.0, with extension, magic/version/declared-length validation and a 256 MiB limit.
- Playblast uploads allow only MP4, WebM, and MOV, with a 512 MiB limit.
- Filenames are reduced to a basename, sanitized, length-limited, and suffixed with a random token.
- Destinations are resolved and checked for containment below `input/omnicam/cards`, `input/omnicam/models` or `input/omnicam/playblasts`.
- Export filenames are normalized by the node code and written only below ComfyUI's managed output directory.
- Unsupported extensions and oversized bodies fail explicitly; partial oversized files are removed.

## Resource lifecycle

- Object URLs, listeners, observers, timers, media playback and WebGL resources are disposed when the node is removed.
- The browser test checks all six proxy modes plus WebGL teardown and context release behavior.

## Dependencies

- Python runtime dependencies: none beyond ComfyUI.
- Frontend runtime dependencies: Three.js 0.180.0 and Mediabunny 1.53.1 (MPL-2.0), bundled locally.
- Build/test dependencies are exactly locked in `package-lock.json`.
- `npm audit` reported zero findings on the validation date.

Report vulnerabilities privately to the repository owner before public disclosure. Registry publication should replace the placeholder publisher ID and repeat dependency, route and live-upload checks.
