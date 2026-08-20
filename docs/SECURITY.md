# OmniCam security and managed assets

OmniCam does not accept arbitrary filesystem paths. Browser uploads are stored
below ComfyUI's managed `input/omnicam/` directory and API responses expose only
paths relative to that managed root.

## Upload validation

Uploads are restricted by route and extension, sanitized to a generated file
name, streamed in bounded chunks, checked against file signatures, and removed
when validation or the client connection fails. Image uploads are decoded with
Pillow to validate dimensions, frame count, and structural integrity. Video
duration and dimensions are validated with OpenCV when that host capability is
available; signature and byte limits always remain active.

Folder quota reservations are serialized so concurrent uploads cannot jointly
exceed the configured quota. Cleanup validates every requested relative path
before deleting any file.

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

## Frontend trust boundary

Camera and object names are treated as text, including after workflow reload.
Dynamic names are never interpolated into `innerHTML`. Static icon markup is
created separately from user-controlled labels.

OmniCam contains no runtime package installation, shell route, remote-control
server, CDN dependency, or hidden telemetry.

