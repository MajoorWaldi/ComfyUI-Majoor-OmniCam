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

## Upload validation

Uploads are restricted by route and extension, sanitized to a generated file
name, streamed in bounded chunks, checked against file signatures, and removed
when validation or the client connection fails. Image uploads are decoded with
Pillow to validate dimensions, frame count, and structural integrity. Video
duration and dimensions are validated with ComfyUI's PyAV stack. WebP requires
both the `RIFF` prefix and the `WEBP` marker at byte offset 8; signature and
byte limits always remain active.

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
| `OMNICAM_MAX_PLAYBLAST_BYTES` | 512 MiB | Maximum playblast upload |
| `OMNICAM_MAX_FOLDER_BYTES` | 4 GiB | Total managed OmniCam asset quota |
| `OMNICAM_MIN_FREE_BYTES` | 512 MiB | Disk space kept free after reservation |
| `OMNICAM_MAX_IMAGE_PIXELS` | 80,000,000 | Maximum decoded image pixel count |
| `OMNICAM_MAX_IMAGE_FRAMES` | 2,000 | Maximum animated-image frame count |
| `OMNICAM_MAX_VIDEO_PIXELS` | 16,777,216 | Maximum video frame pixel count |
| `OMNICAM_MAX_VIDEO_DURATION_SECONDS` | 3,600 | Maximum video duration |
| `OMNICAM_QUOTA_CACHE_TTL_SECONDS` | 300 | Managed-folder size cache lifetime |

Les previews VIDEO et les guides LTX ne materialisent pas le clip complet:
l'echantillonnage est planifie depuis les metadonnees, puis decode par plages
`as_trimmed()` bornees. Le budget LTX de 2 Gio est controle avant decodage.

## Frontend trust boundary

Camera and object names are treated as text, including after workflow reload.
Dynamic names are never interpolated into `innerHTML`. Static icon markup is
created separately from user-controlled labels.

Asynchronous media loads are generation-scoped: results from a disconnected or
replaced upstream node cannot overwrite newer viewport state. Managed media
annotations retain their `input`, `output`, or `temp` storage type and subfolder.

OmniCam contains no runtime package installation, shell route, remote-control
server, CDN dependency, or hidden telemetry.
