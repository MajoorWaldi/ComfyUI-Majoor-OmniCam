# Task 1 — Browser-safe fallback frame API

## Implementation summary

- Added `decode_preview_frame(source_ref, frame, max_dimension) -> PreviewFrame`.
  It resolves only through the existing interactive-source resolver, rejects
  non-positive dimensions before applying the 64–1920 bound, clamps the frame
  to the source timeline, resizes without changing aspect ratio, and returns a
  JPEG plus immutable frame metadata.
- Added the thin `POST /majoor/omnicam/extractor/frame` aiohttp binding. It
  validates the existing source-reference shape through the jobs API, applies
  bounded numeric parsing, emits only JPEG bytes and metadata headers, and sets
  `Cache-Control: private, max-age=300`.
- Kept decoding out of the route module; the jobs API converts source/decoder
  validation failures into existing `ApiError` responses.

Official sources checked before implementation:

- ComfyUI server overview: current server uses aiohttp HTTP routes alongside
  `PromptServer` communication.
- Current ComfyUI `server.py`: `PromptServer.instance.routes` uses
  `RouteTableDef` decorators and routes return `aiohttp.web.Response` objects.
- Current ComfyUI `folder_paths.py` plus the local resolver: managed paths stay
  behind ComfyUI-controlled resolution rather than accepting browser paths.

## Files changed

- `omnicam/extractor/preview_frame.py` (new)
- `omnicam/extractor/jobs/api.py`
- `omnicam/extractor/jobs/routes.py`
- `tests/test_extractor_preview_frame.py` (new)
- `tests/test_extractor_job_routes.py`

## RED evidence

Command:

```text
python -m pytest tests/test_extractor_preview_frame.py -q
```

Result: collection failed as expected with
`ImportError: cannot import name 'preview_frame' from 'omnicam.extractor'`.
This proved the new decoder tests failed because the module/symbol did not yet
exist.

Route RED command:

```text
python -m pytest tests/test_extractor_job_routes.py::test_preview_frame_route_posts_a_browser_ready_jpeg -q -p no:cacheprovider --basetemp .pytest-tmp\task1_route_red
```

Result: failed as expected with
`AttributeError: ... jobs.api has no attribute 'decode_preview_frame'`.
This proved the route contract had no decoder boundary before implementation.

## GREEN evidence

Focused command:

```text
python -m pytest tests/test_extractor_preview_frame.py tests/test_extractor_job_routes.py -q -p no:cacheprovider --basetemp .pytest-tmp\task1_green_after_lint
```

Result: `42 passed in 0.46s`.

Lint command:

```text
python -m ruff check omnicam\extractor\preview_frame.py omnicam\extractor\jobs\api.py omnicam\extractor\jobs\routes.py tests\test_extractor_preview_frame.py tests\test_extractor_job_routes.py
```

Result: `All checks passed!`

Broader relevant backend command:

```text
python -m pytest tests -q -k extractor -p no:cacheprovider --basetemp .pytest-tmp\task1_broad
```

Result: `322 passed, 7 skipped, 370 deselected in 11.25s`.

## Self-review

- `PreviewFrame` is a frozen, slotted dataclass with all specified fields.
- Source inputs remain references validated by `validate_source` and then by
  `resolve_interactive_video_source`; no arbitrary path reaches PyAV.
- The maximum dimension is rejected at `<= 0` before clamping a valid positive
  value to 64–1920, matching the task ruling.
- The route receives JSON via the existing bounded body reader, exposes no
  filesystem path, contains no decode work, and supplies frame, count, width,
  and height metadata headers.
- Production files are 106, 217, and 106 lines respectively, below the
  repository's 800-line ceiling. `git diff --check` completed without errors.

## Concerns

- No functional concerns found. Windows denies the global pytest temp root;
  repository-local `.pytest-tmp/task1_*` roots were used for test execution and
  removed before commit.
