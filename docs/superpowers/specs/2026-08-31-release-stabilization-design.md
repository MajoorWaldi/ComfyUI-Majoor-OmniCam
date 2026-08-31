# OmniCam Release Stabilization Design

**Date:** 2026-08-31

**Status:** Approved in chat; pending written-spec review

## Goal

Restore release readiness across every finding in the 2026-08-31 audit: Monitor H3 runtime behavior, legacy workflow compatibility, Director frontend stability, capability detection, CI reliability, and validation documentation.

## Scope

This stabilization covers all P0, P1, and P2 findings in the audit. It does not redesign the canonical `MAJOOR_OMNICAM_TRACK`, camera math, Director state format, Extractor architecture, lazy-loading architecture, or adapters already demonstrated to be correct.

The work must preserve these invariants:

- OmniCam core remains model-agnostic.
- Existing socket order and indices remain stable for registered legacy nodes.
- `MajoorOmniCamH3Adapter` remains deprecated but functional throughout the 0.3.x line.
- Camera state continues to survive workflow save and reload.
- No runtime CDN, package installation, arbitrary path access, or core patch is introduced.
- Hand-written source files remain at or below 800 physical lines.
- Existing uncommitted user changes in `pyproject.toml` are preserved and extended only where required for this stabilization.

## Delivery Strategy

Implementation is split into independently testable TDD batches. Each regression first receives a focused test that fails for the expected reason, followed by the smallest production change that makes it pass. Targeted tests run after each batch; broader suites run at integration checkpoints.

The batches are:

1. Monitor media facts and H3 behavior.
2. Legacy H3 execution compatibility.
3. Director i18n and Selection Outline.
4. Stage-aware capability detection and workflow diagnostics.
5. CI dependency, type-check, and frontend-test discovery hardening.
6. Full verification and evidence-based documentation.

## Monitor Media Facts and H3 Behavior

`omnicam.core.video_sampling.inspect_video()` remains the single boundary for reading a ComfyUI `VIDEO`. Its `VideoMetadata` result exposes `frame_rate`; consumers must not invent an `fps` alias.

`proxy_media_facts()` will use `metadata.frame_rate` for both the `fps` fact and duration calculation. A realistic test double will implement the official `VIDEO` methods `get_frame_rate()`, `get_frame_count()`, and `get_dimensions()`. The expected facts for 120 frames at 24 fps are an fps of 24.0 and a duration of 5.0 seconds. This test must exercise successful introspection rather than the exception fallback used by string placeholders.

The H3 Native node will resample the complete reference to 24 fps without an OmniCam-owned 15-second truncation. The upstream node remains responsible for its native frame-grid behavior. The pinned ComfyUI v0.34.0 implementation aligns frame counts to `17n+5`, accepts generation lengths up to 3600 frames, and only requires reference input to contain at least five frames. OmniCam preflight may warn about durations outside the trained range but execution must not silently contradict that warning by truncating the reference.

## Legacy H3 Compatibility

`MajoorOmniCamH3Adapter.execute()` will restore its prior functional behavior:

- validate and reconstruct the canonical track;
- analyze the camera trajectory;
- build the legacy H3 prompt and model-tailored cinematic prompt;
- coerce an optional IMAGE batch to `VIDEO` using the existing media boundary;
- return the original outputs in their original order, including the appended IMAGE twin.

Execution will emit a deprecation warning that directs new workflows to OmniCam Monitor, but it will not raise `NotImplementedError`. Tests will cover both the warning and the returned payload so registration cannot again be mistaken for compatibility.

## Director Attachment and Axis Gizmo

The existing ComfyUI lifecycle remains unchanged. Official frontend lifecycle documentation places `nodeCreated()` after node construction for both newly added and workflow-restored nodes. Evidence from the live harness shows that the Director-specific attach path is entered; the synchronous Director constructor fails during its first render before `attachDirector()` can assign `node.__majoorOmniCam`.

The root cause is `drawAxisGizmo()` calling the translation function without importing or receiving it. The module will import OmniCam's standard `t` function explicitly. A focused test will execute `drawAxisGizmo()` with a minimal real DOM surface and no global `t`, proving the dependency is local. The live ComfyUI test remains the integration guard that the Director marker, root, workflow restore, recreation, and queueing all work.

No new attach system, hook replay, or core node-class patch will be introduced.

## Selection Outline

`web-src/viewport/selection-outline.js` will become a complete, focused WebGL module.

It will export:

- `hasOutlineMesh(root)`, which returns true when a selected Object3D hierarchy contains at least one visible, renderable mesh with geometry and material, excluding OmniCam helpers and capture guides;
- `SelectionOutlineRenderer`, a lazy post-processing wrapper around the pinned Three.js addons `EffectComposer`, `RenderPass`, `OutlinePass`, and `OutputPass`.

The renderer will:

- own one composer and its passes;
- update the render and outline cameras on every outlined frame;
- update `selectedObjects` on every outlined frame;
- resize only when width or height changes;
- render the normal scene and visible/hidden outline colors through the composer;
- release the composer, passes, and GPU render targets through an idempotent `dispose()` method.

`viewport.js` will import and inject both exports explicitly into the existing viewport method factories. No implicit global or circular dependency is permitted.

Outline rendering is editor-only. Clean captures and playblasts continue through the ordinary renderer, with no selection outline. Objects without eligible meshes keep the existing box or overlay fallback. The composer is created only when an eligible object is selected, avoiding post-processing overhead for ordinary viewport frames.

Tests will cover hierarchy detection, helper exclusion, lazy construction, camera and selection updates, size changes, rendering, clean-capture bypass, and idempotent disposal. Playwright will cover the real viewport render path and interactive selection.

## Stage-Aware Capability Contracts

The adapter registry will add a `requirements` collection. Each requirement represents one downstream stage and contains:

- `any_of`: acceptable node class names for that stage;
- `expected_inputs`: required input sockets for that stage;
- `expected_widgets`: required widget/input names for that stage.

Single-stage adapters will be represented as one generated requirement. Existing aggregate fields (`required_node_classes`, `expected_inputs`, `expected_widgets`, and the existing aggregate fingerprint) will remain available during 0.3.x for internal and diagnostic compatibility, but detection decisions will use the stage collection.

LTX Motion Track will use two requirements:

1. `LTXVDrawTracks` with `tracks`, `width`, and `height`.
2. One supported LTX guide node with `image`.

Each stage is evaluated independently. The overall adapter state is:

- `missing` when any required stage has no installed candidate;
- `incompatible` when all stages are present but at least one introspectable stage has no compatible candidate;
- `detected_unverified` when every stage is present, none is known incompatible, and at least one stage cannot be introspected;
- `verified` only when every stage has at least one verified candidate.

Tests will construct distinct node doubles for each stage. The mandatory regression case is a valid draw-tracks stage plus an incompatible guide stage, which must not produce `verified`.

## Setup and Workflow Diagnostics

Global setup diagnostics report product readiness rather than treating every optional integration as mandatory:

- a missing adapter is informational;
- an installed but incompatible optional adapter is a warning;
- a missing Extractor backend remains a warning;
- global `ok` remains true while the OmniCam core is usable.

The selected adapter's preflight remains the enforcement boundary. Selecting an incompatible adapter produces a blocking preflight result even though an unrelated incompatible adapter does not make the global setup fail.

Workflow compatibility will map `MajoorOmniCamWanVideoWrapperATI` only to `wan_ati`. `wan_tracks_native` has no legacy per-adapter node and therefore receives an empty legacy usage set.

## CI and Test Discovery

`requirements-dev.txt` will pin NumPy 2.2.6 for all supported Python versions. Repository code uses no NumPy 2.3-only API, and NumPy 2.2.6 supports Python 3.10 through 3.13. The `python-core` matrix will set `fail-fast: false` so a failure in one interpreter does not cancel evidence from the others.

The existing local `[tool.mypy]` work will be preserved. Its explicit file scope will be retained and completed with `check_untyped_defs`, `warn_unused_ignores`, `warn_redundant_casts`, `no_implicit_optional`, and `show_error_codes`. The bare `mypy` CI command must resolve this configuration and pass.

A focused Node test runner will discover every `tests/frontend/*.node.mjs` file, reject files that register no `test(...)`, and pass the discovered files to Node's test runner. `npm run test:unit` will invoke this runner instead of maintaining a hand-written file list. This prevents both empty tests and silently omitted test files from producing a green signal.

Frontend CI continues to require build, static checks, unit tests, generated-bundle parity, and Playwright. The live ComfyUI lane continues to verify Director, Extractor, and Monitor attachment against the pinned stable ComfyUI environment.

## Error Handling and Resource Safety

- VIDEO introspection failures continue to produce an unknown-media fact rather than crash preflight, but successful introspection must never be caught by that fallback.
- Legacy H3 emits a deprecation warning without suppressing valid output.
- Selection outline initialization is lazy; ordinary rendering remains available for selections without eligible meshes.
- Clean capture never routes through post-processing.
- WebGL post-processing resources are disposed exactly once with the viewport.
- Capability introspection errors remain contained to the affected candidate and produce an unverified state rather than stopping OmniCam import.

## Verification

Verification will record exact commands and results for:

- focused regression tests for every changed behavior;
- the full Python suite available in the current environment;
- `ruff check .`;
- scoped `mypy`;
- `npm run build`;
- `npm run check`;
- `npm run test:unit`;
- `npm run test:browser`;
- live ComfyUI browser tests when a runnable ComfyUI checkout is available;
- generated frontend bundle parity;
- the 800-line source ceiling.

`docs/VALIDATION_REPORT.md` will list only evidence actually observed. It will distinguish local passes, configured CI matrix coverage, and manual checks still required. Counts will be copied from final command output rather than retained from an older run.

Relevant behavior documentation will be updated where needed:

- `README.md` for supported behavior and validation commands;
- `docs/NODES.md` for Monitor and legacy H3 behavior;
- `docs/SHORTCUTS.md` only if interaction wording changes;
- `docs/SECURITY.md` only if the final implementation changes a documented resource or trust boundary;
- `docs/VALIDATION_REPORT.md` for final evidence.

## Branch Protection

The repository should require these checks before merging to `main`:

- `python-core` for every matrix interpreter;
- `python-full`;
- `frontend`;
- blocking minimum and stable ComfyUI integration lanes;
- `comfyui-browser`.

Branch protection is remote repository state and can affect all contributors. The implementation will provide the exact required-check list and verify local workflow job names. Applying the GitHub setting itself requires a separate explicit authorization and an authenticated GitHub session.

## Official References

- ComfyUI frontend extension lifecycle: <https://github.com/Comfy-Org/ComfyUI_frontend/blob/main/docs/extensions/core.md>
- ComfyUI server communication: <https://docs.comfy.org/development/comfyui-server/comms_overview>
- ComfyUI v0.34.0 VIDEO implementation: <https://github.com/Comfy-Org/ComfyUI/blob/v0.34.0/comfy_api/latest/_input_impl/video_types.py>
- ComfyUI v0.34.0 MiniMax H3 implementation: <https://github.com/Comfy-Org/ComfyUI/blob/v0.34.0/comfy_extras/nodes_minimax_h3.py>
- ComfyUI Registry `pyproject.toml` specification: <https://docs.comfy.org/registry/specifications>
- Three.js OutlinePass: <https://threejs.org/docs/pages/OutlinePass.html>
- Three.js EffectComposer: <https://threejs.org/docs/pages/EffectComposer.html>
- NumPy 2.2.6 metadata: <https://pypi.org/project/numpy/2.2.6/>
- NumPy 2.3.4 metadata: <https://pypi.org/project/numpy/2.3.4/>
