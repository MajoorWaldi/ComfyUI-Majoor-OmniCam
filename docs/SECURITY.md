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

## OmniCam Agent v1 (`omnicam/agent/`)

See `docs/AGENT_INTEGRATION.md` for the full design. Security-relevant facts:

- **Loopback-only external control.** `/majoor/omnicam/agent/v1/capabilities`,
  `/sessions`, `/query` and `/transaction` require the caller to be
  `127.0.0.1`/`::1` *and* send `X-OmniCam-Agent: 1`. A LAN or remote peer, or a
  loopback caller missing the header, gets `403 Forbidden`.
- **No remote Agent authentication is claimed.** The loopback check is a
  direct-peer trust boundary, not an auth scheme. Do not expose the ComfyUI
  server to an untrusted network; a reverse-proxy deployment needs its own
  authentication in front of it.
- **Browser callbacks use ephemeral, in-memory session tokens**, not
  loopback (a legitimate ComfyUI browser connection can itself be remote
  relative to the server). The actual sequence:
  1. the browser already owns a live ComfyUI WebSocket client id, issued by
     ComfyUI's own connection handshake;
  2. `/session/register` is authenticated by proving that -- it is rejected
     with `UNKNOWN_CLIENT` unless the supplied `client_id` is currently
     present in `PromptServer.instance.sockets` (`omnicam/agent/routes.py`),
     so nothing can register a session for a client_id that was never
     actually connected, and there is no pre-existing token to check yet;
  3. only on success does the broker mint a fresh, random `session_id` and
     an ephemeral `session_token`;
  4. every subsequent `/session/heartbeat`, `/session/close` and `/reply`
     call for that session must then present that exact token. A wrong or
     stale token is rejected; nothing is persisted across a server restart.
- **Session listing never exposes the token, the WebSocket client id, or any
  pending-request internals** -- only `session_id`, `node_id`, `label`,
  `director_api`, `revision` and the advertised operation/query vocabulary.
- **No second network listener.** Every route above is registered on the
  existing `PromptServer.instance`; dispatch to the browser reuses the
  existing WebSocket connection (`send_sync`), never a new socket.
- **Bounded everywhere.** Every JSON body is read through
  `read_bounded_json_object` (1 MiB cap); advertised operation/query lists,
  session count and pending-request count are all capped
  (`omnicam/agent/protocol.py`).
- **An external Agent transaction must always carry `baseRevision`.** The
  browser's own no-revision backwards-compatible mode is refused on this
  route (`BASE_REVISION_REQUIRED`) -- an Agent outside the browser has no
  other way to notice the scene changed under it.
- **No arbitrary-code surface.** An Agent transaction is a bounded list of
  named, validated operations over Director state -- never a script, a
  workflow submission, or a proxy to an arbitrary endpoint.

### Built-in OmniCam Agent: providers and the planner

The built-in Agent (`omnicam/agent/planner*.py`, `provider_routes.py`,
`omnicam/agent/providers/`) is a browser/ComfyUI surface -- the Director's own
Agent panel calling its own backend -- not a remote-Agent authentication API;
see `docs/AGENT_INTEGRATION.md` for how it composes with the Agent Contract
above.

- **Credentials live in a private, per-user secrets backend only**
  (`omnicam/agent/providers/secret_store.py`): never in a workflow, in
  `comfy.settings.json`, or anywhere an HTTP-exposed userdata route could
  serve them. Precedence is environment > local secret store > none, and an
  `OMNICAM_*_API_KEY` environment variable always wins; `SecretStore.set()`
  and `.delete()` themselves refuse to touch a provider an env var already
  controls (`CREDENTIAL_MANAGED_BY_ENV`) -- this is not only a route-level
  check, so a future direct caller cannot bypass it.
- **Remote custom provider endpoints are disabled by default.** A
  caller-supplied `base_url` (OpenAI-compatible, Ollama, or a native
  OpenAI/Anthropic override) is subject to the network policy in
  `omnicam/agent/providers/network.py`: loopback is always allowed; any other
  host is rejected with `REMOTE_CUSTOM_PROVIDER_BLOCKED` unless the operator
  sets `OMNICAM_AGENT_ALLOW_REMOTE_CUSTOM_PROVIDERS=1`. **Native custom base
  URLs are treated as custom endpoints too** -- `endpoint_is_custom()`
  compares a supplied OpenAI/Anthropic `base_url` against that provider's own
  hardcoded official endpoint, so a different host is never silently treated
  as official regardless of which provider it claims to be.
- **Even with that opt-in, sensitive infrastructure/metadata targets stay
  blocked unconditionally**: unspecified, multicast, and link-local
  addresses -- including `169.254.169.254`, the cloud-metadata IP on
  AWS/GCP/Azure. This is a literal-IP-address check only; it does not resolve
  or pin DNS names, so it is not a claim of full SSRF/DNS-rebinding
  protection.
- **Provider Test proves reachability, not model discovery.** `probe()` is a
  separate capability from `list_models()` specifically because the
  OpenAI-compatible adapter's model discovery intentionally degrades a
  failure to an empty list (for a nicer picker UX) -- without `probe()`, that
  same degrade would make a dead/blocked endpoint indistinguishable from
  "reachable, doesn't support discovery."
- **Provider/planner errors reaching the browser are redacted**
  (`omnicam/agent/providers/public_errors.py`). A curated exception
  (`NetworkPolicyError`, `SecretStoreError`, `AgentProtocolError`) keeps its
  own stable code/message; any other exception becomes a fixed, generic
  message -- never `str(error)` -- so a future exception type can never leak
  a credential, header, or internal detail through a catch-all handler.
- **The planner's own context is bounded.** It cannot request `scene.get`
  (a large, unbounded semantic snapshot; enforced, not just omitted from its
  prompt vocabulary -- a hallucinated request for it is rejected before
  reaching the Director session), a single query observation is capped at
  128 KiB, and the total conversation is capped at 512 KiB before every
  provider call.
- **Cloud/remote provider data disclosure.** Before Preview, the Agent panel
  states what leaves the machine for the currently configured provider:
  OpenAI/Anthropic and a non-loopback custom endpoint show an outbound
  notice; a loopback Ollama/OpenAI-compatible endpoint shows a local-only
  notice. Either way, only the user's instruction and the semantic Director
  query observations the planner requested are ever sent -- **Agent v1 never
  sends playblast video, source video, image pixels, 3D binary files, or
  secret values.**
- **Preview before Apply is mandatory, not a preference.** Every built-in
  Agent transaction is proposed with `validateOnly=true` first; there is no
  setting that lets the planner mutate the scene immediately.

## Monitor live-preflight boundary

`POST /majoor/omnicam/monitor/live_preflight` evaluates the currently connected
Director state against the selected Monitor profile without queueing a prompt.

The HTTP request is bounded by the fixed `MAX_LIVE_PREFLIGHT_BYTES` constant
(4 MiB). The nested Director `state_json` is additionally bounded to 2,000,000
characters by `omnicam/nodes/monitor_live.py`.

## Extractor no-run routes

`POST /majoor/omnicam/extractor/source` and `/extractor/frame` inspect a source
without starting a solve; `POST /majoor/omnicam/extractor/refine` re-derives a
track from the raw solve the queued Extractor emitted (`build_refined_track`
only -- no decode, no solver, no GPU, no job). None queue a prompt. The refine
body is bounded by `MAX_REFINE_BYTES` (4 MiB); a solve too large is refined by
re-running TRACK. Camera TRACK and Scene Reconstruction Start themselves run
through ComfyUI's native partial queue.

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
vertices, 10,000,000 triangles and 64 MiB for FBX; all are fixed constants (see
the table below). A file that exceeds the budget is deleted and its
managed-input quota is released.

Folder quota reservations are serialized so concurrent uploads cannot jointly
exceed the configured quota. A reservation starts from the client-declared
`Content-Length` rather than the per-file ceiling, so several small concurrent
uploads no longer reject one another; if a client streams past what it declared,
the reservation is grown incrementally and still refuses to cross the quota.
The cached folder size is re-scanned when it is older than
`QUOTA_CACHE_TTL_SECONDS` (300 s), so files deleted outside the cleanup route no
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

## Resource ceilings

Every upload, cache and complexity ceiling is a fixed constant in
`omnicam/routes.py`. They are deliberately **not** environment-configurable:
the extension performs no runtime process-environment read for them, so the
package published to the Comfy Registry has nothing there for a scanner to
flag, and the values act as a conservative safety floor rather than a tuning
knob. Adjusting one means editing the source.

| Constant (`omnicam/routes.py`) | Value | Purpose |
|---|---:|---|
| `MAX_CARD_BYTES` | 128 MiB | Maximum image/video card upload |
| `MAX_MODEL_BYTES` | 256 MiB | Maximum 3D model upload |
| `MAX_MODEL_VERTICES` | 5,000,000 | Maximum inspected 3D vertex count |
| `MAX_MODEL_TRIANGLES` | 10,000,000 | Maximum inspected 3D triangle count |
| `MAX_FBX_MODEL_BYTES` | 64 MiB | Conservative FBX complexity ceiling |
| `MAX_PLAYBLAST_BYTES` | 512 MiB | Maximum playblast upload |
| `MAX_FOLDER_BYTES` | 4 GiB | Total managed OmniCam input-asset quota |
| `MAX_EXPORT_FOLDER_BYTES` | 512 MiB | Total `output/omnicam/exports` quota |
| `MAX_IMPORT_BYTES` | 64 MiB | Maximum memory-only camera import |
| `MIN_FREE_BYTES` | 512 MiB | Disk space kept free after reservation/write |
| `MAX_IMAGE_PIXELS` | 80,000,000 | Maximum decoded image pixel count |
| `MAX_IMAGE_FRAMES` | 2,000 | Maximum animated-image frame count |
| `MAX_VIDEO_PIXELS` | 16,777,216 | Maximum video frame pixel count |
| `MAX_VIDEO_DURATION_SECONDS` | 3,600 | Maximum video duration |
| `QUOTA_CACHE_TTL_SECONDS` | 300 | Managed-folder size cache lifetime |

The asset-index directory scan cache (`omnicam/asset_index.py`) is likewise a
fixed 30 s.

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

## Unified asset library

The catalog lives under `<ComfyUI input>/omnicam/library/`. Every asset-library
route confines its paths to that folder and rejects an absolute path, a `..`
segment or a drive letter. `GET /majoor/omnicam/assets` (the managed **file**
index) is left exactly as it was — the semantic routes are additive.

- **Import** (`POST /library/import`) reuses the existing model-upload path:
  extension allow-list (`.glb` / `.fbx`), magic-byte signature check, the
  folder-quota reservation and the vertex / triangle / GLB-JSON-chunk
  complexity ceilings. FBX keeps its tighter byte budget.
- **Thumbnails** are WebP / PNG / JPEG only, bounded (`≤ 4 MiB`) and validated
  with the same image-metadata check as card uploads.
- **Catalog writes** are re-validated as a whole file and written atomically
  (`.tmp` + replace). Bounds: `≤ 5000` entries, `≤ 8 MiB` JSON, `≤ 32` tags and
  `≤ 256` clips and `≤ 128` bone mappings per asset.
- **Labels** are rendered with `textContent`, never `innerHTML`; annotation text
  rejects `<`, `>`, `://` and CSS `expression(`, and the colour is a strict hex.
- **Semantic Director API**: `asset.instantiate` never performs an HTTP lookup
  inside a transaction — the caller resolves the catalog row first and passes a
  bounded payload. No operation accepts code, a raw JSON patch, a shell string,
  a filesystem path or a DOM / three.js object.

## Extractor queue execution and browser inspection

Camera tracking and Scene Reconstruct execute through ComfyUI's prompt queue as
partial executions ending at `MajoorOmniCamExtractor`. The retired
`/majoor/omnicam/extractor/jobs/*` and `/majoor/omnicam/reconstruction/jobs/*`
schedulers are not execution surfaces. ComfyUI owns prompt admission, ordering,
cancellation, execution progress and cache semantics.

The browser still needs bounded helper routes that do **not** run a solver:

- `POST /majoor/omnicam/extractor/source` resolves and measures a managed source;
- `POST /majoor/omnicam/extractor/frame` decodes one bounded preview frame;
- `POST /majoor/omnicam/extractor/refine` rebuilds a cleaned track from the
  queued Extractor's immutable `raw_solve` payload; it performs no source decode,
  camera solve, GPU inference, background task or job scheduling.

`source_resolver.py` remains a trust boundary for browser source inspection. It
accepts a *reference*, never an arbitrary path, and resolves it only through
ComfyUI-managed input/output/temp roots. It rejects absolute paths, traversal,
network shares, remote URLs, root-escaping links, unsupported containers, empty
files and sources above the configured size ceiling. Managed picker sources
must remain below `input/omnicam/extractor_sources/`.

Uploads for the picker go through the same `_save_multipart_file` path as every
other OmniCam asset: extension whitelist, magic-byte check, quota reservation,
free-space check and post-write metadata validation. There is no second upload
implementation.

Source/frame JSON bodies are bounded to 256 KiB. Live refine bodies are bounded
to 4 MiB. Runtime `VIDEO`/`IMAGE` values used by queued execution are
materialized by backend code into OmniCam-managed storage; a frontend-supplied
filesystem path never becomes a solver input.

Media sockets accept a `VIDEO` or an `IMAGE` batch. An `IMAGE` batch is encoded
through the same managed path as a runtime `VIDEO`: it carries no filename of
its own, so nothing graph-supplied reaches the filesystem.

Runtime source values are materialized only by backend execution, never from a
frontend path. OmniCam generates the filename below
`temp/omnicam/extractor_runtime/` and returns an annotated relative reference.
Existing files are reused only when their resolved path is already below a
ComfyUI input, output or temp root and the VIDEO has no active trim.

### Scene Reconstruction models and scan sources

Model weights load only from fixed managed roots — `ComfyUI/models/geometry_estimation/` (MoGe, VGGT), `ComfyUI/models/checkpoints/` (SAM3), `ComfyUI/models/sam3d_objects/` (SAM 3D Objects). No config, checkpoint or executable path is ever accepted from an HTTP payload or the DOM. There is no runtime `pip`/`mamba`/`pixi` install and no hidden weight download; VGGT's `from_pretrained` (which can pull from Hugging Face) is never called.

Scan input takes a queued `IMAGE` batch (encoded through the managed path, no graph-supplied filename) or a managed `VIDEO` reference. The video resolver is a separate code path from the image resolver: it rejects absolute paths and `..`, resolves only references already under a ComfyUI input/output/temp root, and accepts only `.mp4 .mov .mkv .webm .avi`. Only the uniformly sampled frames are decoded.

Generated scan manifests (`<fingerprint>/blockout.json`, `<fingerprint>/scan_evidence.json`) are written atomically under the managed reconstruction subtree and contain only bounded scalars, strings and camera matrices/FOV — never dense depth tensors, point maps or masks, and no source image pixels unless the user explicitly saved a managed reference asset. Dense model tensors never enter `OMNICAM_MOTION_SCENE`; `max_state_bytes` is not raised to accommodate model evidence.

SAM 3D Objects is capability-gated (Linux 64-bit + CUDA GPU ≥ 32 GB VRAM + package + managed config) and fails that gate cleanly on unsupported systems; removing the package leaves Blockout and Scan fully operational.

DPVO runs in a fresh spawned child process. Its private frame exchange is a
generated `omnicam-dpvo-*` directory below ComfyUI temp, and cleanup validates
the exact owned directory before recursive removal. The child receives the
fixed managed checkpoint path and generated exchange path over a versioned
pipe; neither is accepted from the browser. All terminal paths join or
terminate the child, which also makes CUDA VRAM release independent of the
long-lived ComfyUI allocator.

## Starter asset bootstrap (`scripts/bootstrap_asset_library.py`)

The bootstrap is the only part of OmniCam that fetches 3D assets over the
network, and it does so only on an explicit `--download` run — never at
ComfyUI or Director start-up, never from asset browsing.

- **Source allow-list.** Pack pages must be `https://kenney.nl/assets/…`; the
  resolved archive must be `https://kenney.nl/media/pages/assets/….zip`. The
  final URL after redirects is re-checked. Any other host or path fails closed
  with a non-zero exit.
- **Licence gate.** The pack page must still contain visible
  *Creative Commons CC0* text or the download is refused.
- **Bounded download.** Standard-library HTTP only, 30 s timeout, 1 MiB chunks,
  512 MiB per pack, 4 MiB per HTML page. The stream is written to a `.partial`
  file, must begin with the ZIP magic `PK\x03\x04`, and is SHA-256 hashed into
  the lockfile before the atomic rename.
- **Archive safety.** Members with absolute paths, `..` traversal, drive
  letters or symlink bits reject the whole archive. `ZipFile.extractall()` is
  never used; extraction is one member at a time with a 256 MiB per-member and
  2 GiB per-archive uncompressed ceiling. Only `.glb` members are installed.
- **GLB inspection.** Only the 12-byte header + JSON chunk (≤ 16 MiB) are
  parsed to discover rigs; binary geometry is never loaded into memory.
- **Install transaction.** Files land via a temp sibling + atomic replace,
  under `<input>/omnicam/library/` only, through
  `manifest.register_asset()` (same validation as every other catalog write).
  Existing files are never overwritten without `--update`. A failed catalog
  write rolls the file back.
- **No new dependency, no pip, no Blender, no telemetry.** Quaternius, Mixamo
  and a Poly Haven mass downloader are deliberately absent.

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
