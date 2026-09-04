# OmniCam security and managed assets

Track state is bounded to 14,400 frames, 16 cameras, 256 objects, 10,000 keys
per track, 4,096 characters per text field (metadata included, truncated rather
than rejected) and 16,777,216 pixels per output frame. The editor applies the
same ceilings in `sanitizeState()` before rendering, so a hostile workflow is
bounded before it reaches the browser as well as before it reaches Python. Non-finite values and unsupported slots or
modes are replaced with safe defaults before execution.

OmniCam does not accept arbitrary filesystem paths. Browser uploads are stored
below ComfyUI's managed `input/omnicam/` directory and API responses expose only
paths relative to that managed root.

## Monitor live-preflight boundary

`POST /majoor/omnicam/monitor/live_preflight` evaluates the currently connected
Director state against the selected Monitor profile without queueing a prompt.

The HTTP request is bounded by `OMNICAM_MAX_LIVE_PREFLIGHT_BYTES` (default
4 MiB). The nested Director `state_json` is additionally bounded to 2,000,000
characters by `omnicam/nodes/monitor_live.py`.

The route accepts:

### director

- `state_json`
- `recording_path`
- `card_asset`
- `width`
- `height`
- `fps`
- `duration_seconds`
- `render_mode`

### monitor

- `target_profile`
- `base_prompt`
- `target_width`
- `target_height`
- `duration_seconds`
- `target_fps`

The route never:

- queues a ComfyUI prompt;
- starts diffusion inference;
- installs dependencies;
- executes shell commands;
- accepts a remote URL;
- accepts arbitrary filesystem paths.

It compiles the live Director state through the same MotionScene compilation
path used by queued execution. Proxy playback is derived from the connected
Director's managed `recording_path` annotation and resolved through ComfyUI's
`/view` endpoint.

Additional read-only Monitor routes:

```text
GET /majoor/omnicam/monitor/profiles
GET /majoor/omnicam/motion_profiles
```

## Upload validation

Cleanup request JSON is bounded to 256 KiB and camera-export request JSON to
8 MiB. Both limits are enforced against `Content-Length` when present and
against the streamed body, so chunked requests cannot bypass them. Invalid or
non-object JSON is rejected before any managed file operation.

Uploads are restricted by route and extension, sanitized to a generated file
name, streamed in bounded chunks, checked against file signatures, and removed
when validation or the client connection fails. Image uploads are decoded with
Pillow to validate dimensions, frame count, and structural integrity. Video
duration and dimensions are validated with ComfyUI's PyAV stack. WebP requires
both the `RIFF` prefix and the `WEBP` marker at byte offset 8; signature and
byte limits always remain active.

3D uploads receive a second resource check after structural validation and
before the browser can create GPU buffers. OBJ, STL, PLY and GLB files are
inspected for bounded vertex/triangle counts. Binary FBX has no lightweight
parser in OmniCam, so it receives a tighter byte-complexity ceiling instead of
pretending that file size proves geometry safety. The defaults are 5,000,000
vertices, 10,000,000 triangles and 64 MiB for FBX; all are configurable through
the environment variables documented below. A file that exceeds the budget is
deleted and its managed-input quota is released.

Folder quota reservations are serialized so concurrent uploads cannot jointly
exceed the configured quota. A reservation starts from the client-declared
`Content-Length` rather than the per-file ceiling, so several small concurrent
uploads no longer reject one another; if a client streams past what it declared,
the reservation is grown incrementally and still refuses to cross the quota.
The cached folder size is re-scanned when it is older than
`OMNICAM_QUOTA_CACHE_TTL_SECONDS`, so files deleted outside the cleanup route no
longer keep the quota artificially full. Cleanup validates every requested
relative path before deleting any file, and ignores duplicates within one
request.

Camera imports remain memory-only, but the request is bounded to 64 MiB and is
accumulated into one `bytearray` rather than a list of chunks followed by a
second joined copy. Camera exports are written only below
`output/omnicam/exports/` and have a separate 512 MiB folder quota plus the same
minimum-free-space policy as uploads. This keeps generated DCC exchange files
from growing independently of every other OmniCam storage bound.

Viewport backgrounds use the same managed upload path as cards. Workflows store
ComfyUI input annotations rather than browser-local `blob:` URLs, so backgrounds
survive save/reload. Resolved upload roots and subfolders must remain below the
ComfyUI input directory, including through symbolic links or junctions.
Superseded background uploads are ignored and their partial managed files are
removed through the validated cleanup route.

## Configuration

Invalid, negative, empty, or excessively large environment values fall back to
the defaults instead of preventing the extension from loading.

| Variable | Default | Purpose |
|---|---:|---|
| `OMNICAM_MAX_CARD_BYTES` | 128 MiB | Maximum image/video card upload |
| `OMNICAM_MAX_MODEL_BYTES` | 256 MiB | Maximum 3D model upload |
| `OMNICAM_MAX_MODEL_VERTICES` | 5,000,000 | Maximum inspected 3D vertex count |
| `OMNICAM_MAX_MODEL_TRIANGLES` | 10,000,000 | Maximum inspected 3D triangle count |
| `OMNICAM_MAX_FBX_MODEL_BYTES` | 64 MiB | Conservative FBX complexity ceiling |
| `OMNICAM_MAX_PLAYBLAST_BYTES` | 512 MiB | Maximum playblast upload |
| `OMNICAM_MAX_FOLDER_BYTES` | 4 GiB | Total managed OmniCam input-asset quota |
| `OMNICAM_MAX_EXPORT_FOLDER_BYTES` | 512 MiB | Total `output/omnicam/exports` quota |
| `OMNICAM_MAX_IMPORT_BYTES` | 64 MiB | Maximum memory-only camera import |
| `OMNICAM_MIN_FREE_BYTES` | 512 MiB | Disk space kept free after reservation/write |
| `OMNICAM_MAX_IMAGE_PIXELS` | 80,000,000 | Maximum decoded image pixel count |
| `OMNICAM_MAX_IMAGE_FRAMES` | 2,000 | Maximum animated-image frame count |
| `OMNICAM_MAX_VIDEO_PIXELS` | 16,777,216 | Maximum video frame pixel count |
| `OMNICAM_MAX_VIDEO_DURATION_SECONDS` | 3,600 | Maximum video duration |
| `OMNICAM_QUOTA_CACHE_TTL_SECONDS` | 300 | Managed-folder size cache lifetime |

VIDEO previews and LTX guides never materialise the whole clip: sampling is
planned from the container metadata, then decoded through bounded
`VIDEO.as_trimmed()` ranges. The 2 GiB LTX decode budget is checked before any
frame is decoded.

## Managed model directory

The optional camera-tracking backends read their weights from one fixed,
managed location:

```text
ComfyUI/models/omnicam/dpvo/dpvo.pth
```

The node exposes **no checkpoint path widget**. A path taken from a frontend
field would turn a camera node into an arbitrary-file loader, so the directory
is derived from ComfyUI's own `folder_paths.models_dir` and nothing else.

OmniCam never installs Python packages at runtime. When a backend is missing,
the Extractor raises an actionable error naming the expected package and
checkpoint; it does not attempt to fetch or build either. Backend availability
is probed with `importlib.util.find_spec` plus a file existence check, and a
probe that raises is reported as unavailable rather than propagated: a broken
optional dependency must not be able to stop OmniCam from loading.

Decoded video is bounded like every other media path. Frames are downscaled
inside the decoder to the requested solver resolution, never upscaled, and a
solve is refused above a hard sample budget rather than allowed to exhaust
memory.

## Interactive solve jobs

An interactive solve runs outside the prompt queue, so its input arrives from
the browser rather than from an executed graph. That makes the source resolver
(`omnicam/extractor/source_resolver.py`) a trust boundary rather than a
convenience.

It accepts a *reference*, never a path, and resolves it through ComfyUI's own
annotated-input mechanism. It refuses absolute paths, `..` traversal, UNC and
network shares, remote URLs, symlinks escaping the approved roots, extensions
outside the video whitelist, files whose container does not decode as video,
empty files, and anything above the size ceiling. Managed picker sources must
additionally live under `input/omnicam/extractor_sources/`.

Uploads for the picker go through the same `_save_multipart_file` path as every
other OmniCam asset: extension whitelist, magic-byte check, quota reservation,
free-space check and post-write metadata validation. There is no second upload
implementation.

Every job route validates: the job id, the session that owns the job, the
source reference, the solve-method enum, every numeric setting against a
documented range, and the request body size (256 KiB). A job belongs to the
client that started it; another session gets 403 rather than the ability to
stop someone else's solve. Only one GPU-exclusive solve runs at a time, refused
with 409 rather than queued into an unbounded backlog. For `auto`, the slot is
reserved only when the backend that availability resolution would actually pick
is GPU-exclusive: a CPU pycolmap/OpenCV fallback is not blocked by unrelated
ComfyUI GPU execution. Terminal jobs are swept after 30 minutes, releasing pose
arrays, quality samples and solver buffers -- never the user's source video.

Interactive routes never queue a prompt, never execute a shell command, never
install a package, and never accept a remote URL to solve.

Media sockets accept a `VIDEO` or an `IMAGE` batch. An `IMAGE` batch is encoded
through the same managed path as a runtime `VIDEO`: it carries no filename of
its own, so nothing graph-supplied reaches the filesystem.

Runtime source values are materialized only by backend execution, never from a
frontend path. OmniCam generates the filename below
`temp/omnicam/extractor_runtime/` and returns an annotated relative reference.
Existing files are reused only when their resolved path is already below a
ComfyUI input, output or temp root and the VIDEO has no active trim.

DPVO runs in a fresh spawned child process. Its private frame exchange is a
generated `omnicam-dpvo-*` directory below ComfyUI temp, and cleanup validates
the exact owned directory before recursive removal. The child receives the
fixed managed checkpoint path and generated exchange path over a versioned
pipe; neither is accepted from the browser. All terminal paths join or
terminate the child, which also makes CUDA VRAM release independent of the
long-lived ComfyUI allocator.

## Frontend trust boundary

Camera and object names are treated as text, including after workflow reload.
Dynamic names are never interpolated into `innerHTML`. Static icon markup is
created separately from user-controlled labels.

Monitor health, preflight and adapter diagnostics HTML-escape all backend text
and whitelist state attributes before inserting static row markup.

Asynchronous media loads are generation-scoped: results from a disconnected or
replaced upstream node cannot overwrite newer viewport state. Managed media
annotations retain their `input`, `output`, or `temp` storage type and subfolder.

OmniCam contains no runtime package installation, shell route, remote-control
server, CDN dependency, or hidden telemetry.
