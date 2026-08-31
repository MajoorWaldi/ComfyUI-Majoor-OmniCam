# OmniCam Release Stabilization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve every P0–P2 audit finding and restore evidence-backed release readiness without changing OmniCam's canonical camera-track contract.

**Architecture:** Apply focused TDD fixes at the existing boundaries: media facts in Monitor, compatibility in legacy nodes, explicit dependencies in the Director viewport, per-stage adapter capability checks, and CI discovery/configuration. Preserve the model-agnostic core and existing socket order; update release documentation only from final observed results.

**Tech Stack:** Python 3.10–3.13, pytest, ComfyUI V3 `IO`/`VIDEO`, JavaScript ES modules, Node 22 test runner, Three.js 0.180.0 post-processing addons, Vite, Playwright, GitHub Actions, ruff, mypy.

**Spec:** `docs/superpowers/specs/2026-08-31-release-stabilization-design.md`

## Global Constraints

- The canonical `MAJOOR_OMNICAM_TRACK` schema remains at version 1 and is not modified.
- Existing legacy node socket order and output indices remain unchanged.
- `MajoorOmniCamH3Adapter` remains registered, deprecated, and functional.
- H3 Native references are not silently truncated by OmniCam.
- No ComfyUI core patch, runtime CDN, package installation, arbitrary path access, or telemetry is introduced.
- Every production behavior change follows RED → GREEN → REFACTOR.
- Hand-written source files remain at or below 800 physical lines.
- The pre-existing local `pyproject.toml` work is preserved.
- **Never stage or commit `pyproject.toml`; the user explicitly requires it to remain uncommitted when the work is finished.**
- Every `git add` command below names exact files and excludes `pyproject.toml`.

---

### Task 1: Correct Monitor VIDEO metadata facts

**Files:**
- Modify: `tests/test_monitor_execute.py`
- Modify: `omnicam/monitor/execute.py`

**Interfaces:**
- Consumes: `inspect_video(video) -> VideoMetadata`
- Produces: `proxy_media_facts(video) -> {available, fps, frame_count, duration_seconds, width, height}` using `VideoMetadata.frame_rate`

- [ ] **Step 1: Write the failing realistic VIDEO test**

Add a complete ComfyUI-shaped double and literal expectations:

```python
class FakeVideo:
    def get_frame_rate(self):
        return 24.0

    def get_frame_count(self):
        return 120

    def get_dimensions(self):
        return 1280, 720


def test_proxy_media_facts_reads_a_real_video_contract():
    facts = monitor_execute.proxy_media_facts(FakeVideo())
    assert facts == {
        "available": True,
        "fps": 24.0,
        "frame_count": 120,
        "duration_seconds": 5.0,
        "width": 1280,
        "height": 720,
    }
```

This catches the mutation `metadata.frame_rate -> metadata.fps` because successful introspection must reach the returned dictionary.

- [ ] **Step 2: Run the test and verify RED**

Run: `python -B -m pytest tests/test_monitor_execute.py::test_proxy_media_facts_reads_a_real_video_contract -q -p no:cacheprovider`

Expected: FAIL with `AttributeError: 'VideoMetadata' object has no attribute 'fps'`.

- [ ] **Step 3: Use the declared metadata field**

Change both accesses in `proxy_media_facts()`:

```python
frame_rate = metadata.frame_rate
return {
    "available": True,
    "fps": frame_rate,
    "frame_count": metadata.frame_count,
    "duration_seconds": metadata.frame_count / max(1e-6, frame_rate),
    "width": metadata.width,
    "height": metadata.height,
}
```

Remove the obsolete `type: ignore[attr-defined]` comments.

- [ ] **Step 4: Verify GREEN and nearby H3 execution tests**

Run: `python -B -m pytest tests/test_monitor_execute.py tests/test_monitor_preflight.py tests/test_monitor_snapshot.py -q -p no:cacheprovider`

Expected: all tests pass.

- [ ] **Step 5: Commit only Task 1 files**

```bash
git add omnicam/monitor/execute.py tests/test_monitor_execute.py
git commit -m "fix: read ComfyUI video frame rate in monitor"
```

---

### Task 2: Preserve full H3 Native reference duration

**Files:**
- Modify: `tests/test_nodes_media.py`
- Modify: `omnicam/nodes/monitor.py`

**Interfaces:**
- Consumes: `resample_video_frames(video, target_fps=24.0, max_seconds=None)`
- Produces: the complete 24 fps `reference_frames` IMAGE output for `adapter="h3_native"`
- Produces test helper: `canonical_track_payload(duration_frames: int) -> dict`

- [ ] **Step 1: Expand the node-level regression to a 20-second reference**

Replace the five-second-only test with a duration that exposes the hard truncation:

```python
def canonical_track_payload(duration_frames):
    base = {"camera_type": "perspective", "zoom": 1.0, "near": 0.05, "far": 5000.0}
    camera = {
        "position": [0, 1, 4], "target": [0, 1, 0], "fov": 35, "roll": 0, **base,
    }
    return {
        "schema_version": 1, "fps": 24, "duration_frames": duration_frames,
        "width": 320, "height": 180, "render_mode": "omni_ref", "objects": [],
        "keyframes": [{"frame": 0, "camera": camera, "interpolation": "smooth"}],
    }


def test_h3_native_reference_frames_preserve_the_complete_reference(monkeypatch):
    from types import SimpleNamespace
    from omnicam.nodes.monitor import MajoorOmniCamMonitor

    class Video:
        def get_frame_rate(self): return 30.0
        def get_frame_count(self): return 600
        def get_dimensions(self): return (24, 16)
        def as_trimmed(self, *, start_time, duration, strict_duration=False):
            start = round(start_time * 30.0)
            count = max(1, round(duration * 30.0))
            images = torch.full((count, 16, 24, 3), float(start))
            return SimpleNamespace(get_components=lambda: SimpleNamespace(images=images))

    # Keep the existing execute_monitor_adapter monkeypatch and canonical track
    # fixture, but use duration_frames=480 and assert the complete 20 seconds.
    output = MajoorOmniCamMonitor.execute(
        camera_track=canonical_track_payload(duration_frames=480),
        proxy_video=Video(),
        adapter="h3_native",
    )
    assert output.args[-1].shape[0] == 480
```

Keep the payload literal or a local test helper; do not derive the expected count with production resampling code.

- [ ] **Step 2: Run against a ComfyUI-capable environment and verify RED**

Run: `python -B -m pytest tests/test_nodes_media.py::test_h3_native_reference_frames_preserve_the_complete_reference -q -p no:cacheprovider`

Expected in the full runtime environment: FAIL because the current output contains 360 frames. In a core-only environment, record the skip and repeat this RED step in the `python-full`/ComfyUI environment before editing production code.

- [ ] **Step 3: Remove only the OmniCam duration cap**

Change the H3 Native call in `MajoorOmniCamMonitor.execute()` to:

```python
reference_frames = (
    resample_video_frames(
        result["reference_video"],
        target_fps=24.0,
    )
    if adapter == "h3_native" and result["reference_video"] is not None
    else image_twin(result["reference_video"])
)
```

Do not remove `max_seconds` support from the reusable sampling functions or their direct limit tests; other callers may still request explicit trimming.

- [ ] **Step 4: Verify GREEN and resampling architecture**

Run:

```bash
python -B -m pytest tests/test_nodes_media.py::test_h3_native_reference_frames_preserve_the_complete_reference tests/test_video_sampling.py -q -p no:cacheprovider
```

Expected: the node emits 480 frames and contiguous-range/memory tests remain green.

- [ ] **Step 5: Commit only Task 2 files**

```bash
git add omnicam/nodes/monitor.py tests/test_nodes_media.py
git commit -m "fix: preserve full H3 native references"
```

---

### Task 3: Restore the deprecated H3 node as a functional facade

**Files:**
- Modify: `tests/test_nodes_media.py`
- Modify: `omnicam/nodes/adapters.py`

**Interfaces:**
- Consumes: `validated_track`, `analyze_camera_trajectory`, `build_cinematic_motion_prompt`, `build_h3_prompt`, `as_video`, `image_twin`
- Consumes test helper: `canonical_track_payload()` created in Task 2
- Produces: the unchanged five-output `MajoorOmniCamH3Adapter` contract plus `DeprecationWarning`

- [ ] **Step 1: Make the existing legacy execution test assert compatibility behavior**

Extend `test_h3_legacy_adapter_gains_an_image_twin_of_its_reference_video`:

```python
with pytest.warns(DeprecationWarning, match="OmniCam Monitor"):
    output = MajoorOmniCamH3Adapter.execute(
        camera_track=canonical_track_payload(duration_frames=2),
        proxy_video=image_batch(3),
        base_prompt="A brass robot",
        prompt_style="h3",
    )

assert len(output.args) == 5
assert output.args[0].get_frame_count() == 3
assert "camera-motion" in output.args[1]
assert "A brass robot" in output.args[2]
assert json.loads(output.args[3])["classification"]
assert output.args[4].shape[0] == 3
```

Keep `canonical_track_payload()` in `tests/test_nodes_media.py`; both node-level regressions consume the same literal canonical contract.

- [ ] **Step 2: Verify RED**

Run: `python -B -m pytest tests/test_nodes_media.py::test_h3_legacy_adapter_gains_an_image_twin_of_its_reference_video -q -p no:cacheprovider`

Expected in the full runtime environment: FAIL with `NotImplementedError` after the warning.

- [ ] **Step 3: Restore the previous implementation with a warning**

At module scope import `warnings` and `build_h3_prompt`; keep camera-tool imports local if that avoids startup coupling. Implement:

```python
warnings.warn(
    "MajoorOmniCamH3Adapter is deprecated; use OmniCam Monitor for new workflows.",
    DeprecationWarning,
    stacklevel=2,
)
from ..core.camera_tools import analyze_camera_trajectory, build_cinematic_motion_prompt

track = validated_track(camera_track)
analysis = analyze_camera_trajectory(track)
cinematic = build_cinematic_motion_prompt(track, base_prompt=base_prompt, style=prompt_style)
proxy_video = as_video(proxy_video)
return IO.NodeOutput(
    proxy_video,
    build_h3_prompt(track, video_ref_token=video_ref_token),
    cinematic,
    json.dumps(analysis, indent=2),
    image_twin(proxy_video),
)
```

- [ ] **Step 4: Verify GREEN and all legacy facade schemas**

Run: `python -B -m pytest tests/test_nodes_media.py tests/test_monitor_node.py -q -p no:cacheprovider`

Expected: all available tests pass; core-only skips are explicitly recorded rather than counted as execution evidence.

- [ ] **Step 5: Commit only Task 3 files**

```bash
git add omnicam/nodes/adapters.py tests/test_nodes_media.py
git commit -m "fix: keep deprecated H3 workflows functional"
```

---

### Task 4: Make the axis gizmo's i18n dependency explicit

**Files:**
- Create: `tests/frontend/axis-gizmo-view.node.mjs`
- Modify: `web-src/axis-gizmo-view.js`

**Interfaces:**
- Consumes: `t(source)` from `web-src/i18n.js`
- Produces: `drawAxisGizmo(ui)` that works without any global `t`

- [ ] **Step 1: Write a real DOM-surface regression test**

Create a tiny SVG element double that records attributes and children, install only `document.createElementNS`, and call the production function:

```javascript
import assert from "node:assert/strict";
import test from "node:test";
import { drawAxisGizmo } from "../../web-src/axis-gizmo-view.js";

function element(name) {
  return {
    name, attributes: new Map(), children: [], textContent: "",
    setAttribute(key, value) { this.attributes.set(key, value); },
    appendChild(child) { this.children.push(child); },
    replaceChildren(...children) { this.children = children; },
  };
}

test("drawAxisGizmo owns its translation dependency", () => {
  const previous = globalThis.document;
  const svg = element("svg");
  globalThis.document = { createElementNS: (_ns, name) => element(name) };
  try {
    drawAxisGizmo({
      root: { querySelector: () => svg },
      viewportCamera: () => ({ position: [0, 0, 10], target: [0, 0, 0], roll: 0 }),
    });
  } finally {
    globalThis.document = previous;
  }
  assert.equal(svg.children[0].attributes.get("aria-label"), "Frame selection");
  assert.equal(svg.children.filter((child) => child.attributes.get("data-axis")).length, 3);
});
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/frontend/axis-gizmo-view.node.mjs`

Expected: FAIL with `ReferenceError: t is not defined`.

- [ ] **Step 3: Import the standard translator**

Add:

```javascript
import { t } from "./i18n.js";
```

Do not pass `t` through the Director dependency object and do not create a global.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/frontend/axis-gizmo-view.node.mjs tests/frontend/chrome-modules.node.mjs`

Expected: both files pass.

- [ ] **Step 5: Commit only Task 4 files**

```bash
git add web-src/axis-gizmo-view.js tests/frontend/axis-gizmo-view.node.mjs
git commit -m "fix: bind axis gizmo translations explicitly"
```

---

### Task 5: Implement and integrate Selection Outline

**Files:**
- Modify: `tests/frontend/selection-outline.node.mjs`
- Modify: `web-src/viewport/selection-outline.js`
- Modify: `web-src/viewport.js`
- Modify if the integration assertion needs strengthening: `tests/frontend/viewport.spec.js`

**Interfaces:**
- Produces: `hasOutlineMesh(root: Object3D) -> boolean`
- Produces: `new SelectionOutlineRenderer(renderer, scene, postprocessing?)`
- Produces: `render(camera, width, height, selectedObjects)` and idempotent `dispose()`
- Consumed by: `createSceneMethods(viewportDependencies)` and `createRenderMethods(viewportDependencies)`

- [ ] **Step 1: Write failing unit tests for hierarchy eligibility**

Use Object3D-shaped doubles with a real `traverse(callback)` behavior:

```javascript
function mesh(overrides = {}) {
  return {
    isMesh: true,
    visible: true,
    geometry: {},
    material: {},
    userData: {},
    ...overrides,
  };
}

function group(...children) {
  return {
    traverse(callback) {
      callback(this);
      for (const child of children) {
        if (typeof child.traverse === "function") child.traverse(callback);
        else callback(child);
      }
    },
  };
}

test("hasOutlineMesh finds renderable meshes inside groups and excludes helpers", () => {
  assert.equal(hasOutlineMesh(group(group(mesh()))), true);
  assert.equal(hasOutlineMesh(group(mesh({ visible: false }))), false);
  assert.equal(hasOutlineMesh(group(mesh({ userData: { omnicamHelper: true } }))), false);
  assert.equal(hasOutlineMesh(group(mesh({ userData: { omnicamCaptureGuide: true } }))), false);
  assert.equal(hasOutlineMesh(group({ isMesh: false })), false);
});
```

- [ ] **Step 2: Write failing renderer lifecycle tests**

Inject fake `EffectComposer`, `RenderPass`, `OutlinePass`, `OutputPass`, and `Vector2` constructors through the optional third constructor argument. Assert observable state:

```javascript
function fakePostprocessing() {
  const state = {};
  class EffectComposer {
    constructor() {
      this.sizes = [];
      this.renderCount = 0;
      this.disposeCount = 0;
      this.passes = [];
      state.composer = this;
    }
    addPass(pass) { this.passes.push(pass); }
    setSize(width, height) { this.sizes.push([width, height]); }
    render() { this.renderCount += 1; }
    dispose() { this.disposeCount += 1; }
  }
  class RenderPass {
    constructor(scene, camera) { this.scene = scene; this.camera = camera; state.renderPass = this; }
    dispose() { this.disposeCount = (this.disposeCount || 0) + 1; }
  }
  class OutlinePass {
    constructor(_size, scene, camera) {
      this.renderScene = scene;
      this.renderCamera = camera;
      this.selectedObjects = [];
      this.disposeCount = 0;
      this.visibleEdgeColor = { set() {} };
      this.hiddenEdgeColor = { set() {} };
      state.outlinePass = this;
    }
    dispose() { this.disposeCount += 1; }
  }
  class OutputPass { dispose() { this.disposeCount = (this.disposeCount || 0) + 1; } }
  class Vector2 { constructor(x, y) { this.x = x; this.y = y; } }
  return {
    ...state,
    classes: { EffectComposer, RenderPass, OutlinePass, OutputPass, Vector2 },
    get composer() { return state.composer; },
    get renderPass() { return state.renderPass; },
    get outlinePass() { return state.outlinePass; },
  };
}

test("outline rendering updates camera, selection and size before rendering", () => {
  const fakes = fakePostprocessing();
  const outline = new SelectionOutlineRenderer("renderer", "scene", fakes.classes);
  outline.render("camera-a", 640, 360, ["mesh-a"]);
  outline.render("camera-b", 640, 360, ["mesh-b"]);
  assert.deepEqual(fakes.composer.sizes, [[640, 360]]);
  assert.equal(fakes.renderPass.camera, "camera-b");
  assert.equal(fakes.outlinePass.renderCamera, "camera-b");
  assert.deepEqual(fakes.outlinePass.selectedObjects, ["mesh-b"]);
  assert.equal(fakes.composer.renderCount, 2);
});

test("outline disposal releases every owned GPU surface exactly once", () => {
  const fakes = fakePostprocessing();
  const outline = new SelectionOutlineRenderer("renderer", "scene", fakes.classes);
  outline.dispose();
  outline.dispose();
  assert.equal(fakes.composer.disposeCount, 1);
  assert.equal(fakes.outlinePass.disposeCount, 1);
});
```

- [ ] **Step 3: Verify RED**

Run: `node --test tests/frontend/selection-outline.node.mjs`

Expected: FAIL because the module exports neither symbol.

- [ ] **Step 4: Implement the focused post-processing module**

Use the pinned addons and explicit defaults:

```javascript
import * as THREE from "../three-runtime.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";

const DEFAULT_POSTPROCESSING = {
  EffectComposer, OutlinePass, OutputPass, RenderPass, Vector2: THREE.Vector2,
};

export function hasOutlineMesh(root) {
  let found = false;
  root?.traverse?.((object) => {
    if (found || object.visible === false || !object.isMesh) return;
    if (object.userData?.omnicamHelper || object.userData?.omnicamCaptureGuide) return;
    found = Boolean(object.geometry && object.material);
  });
  return found;
}
```

`SelectionOutlineRenderer` must create one composer, add render/outline/output passes in that order, set visible color `0x8b5cf6`, a subdued hidden color, zero glow, stable thickness/strength, cache the last size, update both camera properties and `selectedObjects`, call `composer.render(0)`, and guard disposal with `this.disposed`.

Implement the lifecycle with this shape:

```javascript
export class SelectionOutlineRenderer {
  constructor(renderer, scene, postprocessing = DEFAULT_POSTPROCESSING) {
    const { EffectComposer, RenderPass, OutlinePass, OutputPass, Vector2 } = postprocessing;
    this.disposed = false;
    this.width = 0;
    this.height = 0;
    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, null);
    this.outlinePass = new OutlinePass(new Vector2(1, 1), scene, null, []);
    this.outlinePass.visibleEdgeColor.set(0x8b5cf6);
    this.outlinePass.hiddenEdgeColor.set(0x312e81);
    this.outlinePass.edgeGlow = 0;
    this.outlinePass.edgeStrength = 4;
    this.outlinePass.edgeThickness = 1;
    this.outputPass = new OutputPass();
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.outlinePass);
    this.composer.addPass(this.outputPass);
  }

  render(camera, width, height, selectedObjects) {
    if (this.disposed) return;
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.composer.setSize(width, height);
    }
    this.renderPass.camera = camera;
    this.outlinePass.renderCamera = camera;
    this.outlinePass.selectedObjects = [...selectedObjects];
    this.composer.render(0);
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.renderPass.dispose?.();
    this.outlinePass.dispose?.();
    this.outputPass.dispose?.();
    this.composer.dispose();
  }
}
```

- [ ] **Step 5: Verify unit GREEN**

Run: `node --test tests/frontend/selection-outline.node.mjs`

Expected: all selection-outline tests pass and at least one test is registered.

- [ ] **Step 6: Inject the implementation into the viewport**

In `web-src/viewport.js`:

```javascript
import { hasOutlineMesh, SelectionOutlineRenderer } from "./viewport/selection-outline.js";
```

Add both symbols to `viewportDependencies`. Do not import them from `render.js` or `scene.js`; those factories remain dependency-injected and testable.

- [ ] **Step 7: Verify browser RED is resolved and capture bypass remains correct**

Run: `npm run test:browser -- --grep "renders perspective|interactive object selection"`

Expected: the previous `hasOutlineMesh is not a function` failure is gone; selection invokes the outline path, and clean capture uses the ordinary renderer.

- [ ] **Step 8: Run viewport-adjacent tests**

Run:

```bash
node --test tests/frontend/selection-outline.node.mjs tests/frontend/mesh-overlays.node.mjs tests/frontend/transform-gizmo.node.mjs
npm run test:browser -- --grep "viewport|selection|quick views|axis"
```

Expected: all selected tests pass with no page errors.

- [ ] **Step 9: Commit only Task 5 files**

```bash
git add web-src/viewport/selection-outline.js web-src/viewport.js tests/frontend/selection-outline.node.mjs tests/frontend/viewport.spec.js
git commit -m "feat: complete viewport selection outline"
```

If `tests/frontend/viewport.spec.js` did not change, omit it from `git add`.

---

### Task 6: Verify adapter capabilities stage by stage

**Files:**
- Modify: `tests/test_capabilities.py`
- Modify: `tests/test_adapter_contracts.py`
- Modify: `omnicam/adapters/registry.py`
- Modify: `omnicam/capabilities.py`

**Interfaces:**
- Produces registry entry `requirements: list[{any_of, expected_inputs, expected_widgets}]`
- Produces overall capability state from every required stage
- Preserves existing aggregate registry fields for 0.3.x consumers

- [ ] **Step 1: Write the failing mixed-stage LTX test**

```python
def _node_with_inputs(*names: str):
    class Node:
        @classmethod
        def INPUT_TYPES(cls):
            return {"required": {name: ("ANY",) for name in names}}

    return Node


def test_ltx_motion_track_is_not_verified_when_the_guide_stage_is_incompatible():
    draw_tracks = _node_with_inputs("tracks", "width", "height")
    wrong_guide = _node_with_inputs("mask")
    report = detect_capabilities({
        "LTXVDrawTracks": draw_tracks,
        "LTXAddVideoICLoRAGuide": wrong_guide,
    })
    ltx = next(item for item in report["capabilities"] if item["adapter"] == "ltx_motion_track")
    assert ltx["state"] == "incompatible"
    assert [stage["state"] for stage in ltx["requirements"]] == ["verified", "incompatible"]
```

Add a companion test where both stages expose their correct, distinct sockets and the result is `verified`.

- [ ] **Step 2: Verify RED**

Run: `python -B -m pytest tests/test_capabilities.py::test_ltx_motion_track_is_not_verified_when_the_guide_stage_is_incompatible -q -p no:cacheprovider`

Expected: FAIL because the global `tracks,width,height` check incorrectly accepts the first node.

- [ ] **Step 3: Add explicit stage requirements without removing aggregate fields**

Add a small registry helper:

```python
def _requirement(
    any_of: list[str], inputs: list[str], widgets: list[str] | None = None,
) -> dict[str, list[str]]:
    return {
        "any_of": list(any_of),
        "expected_inputs": list(inputs),
        "expected_widgets": list(widgets or []),
    }
```

Extend `_contract(..., requirements=None)` so single-stage contracts generate one requirement from their existing arguments. For `ltx_motion_track`, pass exactly:

```python
requirements=[
    _requirement(["LTXVDrawTracks"], ["tracks"], ["width", "height"]),
    _requirement(
        ["LTXAddVideoICLoRAGuide", "LTXAddVideoICLoRAGuideAdvanced", "LTXVAddGuide"],
        ["image"],
    ),
]
```

- [ ] **Step 4: Evaluate each stage independently**

Extract a private stage evaluator returning state, detected nodes, and expected sockets. Aggregate with this precedence:

```python
states = [stage["state"] for stage in stage_reports]
if "missing" in states:
    state = "missing"
elif "incompatible" in states:
    state = "incompatible"
elif "detected_unverified" in states:
    state = "detected_unverified"
else:
    state = "verified"
```

Include the stage reports as the additive `requirements` field in each capability entry.

- [ ] **Step 5: Replace the masking contract-matrix fixture**

Update `tests/test_adapter_contracts.py` so each candidate node receives only the sockets for its own stage. Do not union all adapter sockets onto every node. Assert all valid staged fixtures verify, plus the mixed-stage failure from Step 1.

- [ ] **Step 6: Verify GREEN**

Run: `python -B -m pytest tests/test_capabilities.py tests/test_adapter_contracts.py -q -p no:cacheprovider`

Expected: all capability and pinned-contract tests pass.

- [ ] **Step 7: Commit only Task 6 files**

```bash
git add omnicam/adapters/registry.py omnicam/capabilities.py tests/test_capabilities.py tests/test_adapter_contracts.py
git commit -m "fix: verify adapter capabilities by stage"
```

---

### Task 7: Separate global readiness from selected-adapter blocking

**Files:**
- Modify: `tests/test_capabilities.py`
- Modify: `omnicam/capabilities.py`
- Create: `web-src/shared/setup-diagnostic.js`
- Create: `tests/frontend/setup-diagnostic.node.mjs`
- Modify: `web-src/diagnostics.js`
- Modify: `web-src/locales/fr.js`

**Interfaces:**
- Produces: global diagnostic `ok=true` for usable core with optional adapter warnings
- Produces: pure `setupBadgeModel(issues)` for truthful frontend copy
- Preserves: selected-adapter preflight as the blocking boundary

- [ ] **Step 1: Write failing backend diagnostic tests**

```python
def test_an_incompatible_optional_adapter_warns_without_blocking_global_setup():
    report = diagnose_setup({
        "capabilities": [{
            "adapter": "ltx_motion_track", "display": "LTX Motion Track",
            "state": "incompatible", "docs": "https://example.test/ltx",
        }],
        "extractor": {},
    })
    assert report["ok"] is True
    assert report["issues"][0]["severity"] == "warning"


def test_wanvideowrapper_legacy_node_does_not_claim_native_tracks():
    capabilities = detect_capabilities({"WanVideoATITracks": _node_with_inputs("tracks", "width", "height")})
    report = check_workflow_compatibility(["MajoorOmniCamWanVideoWrapperATI"], capabilities)
    assert "wan_tracks_native" not in {problem["adapter"] for problem in report["problems"]}
```

- [ ] **Step 2: Verify RED**

Run: `python -B -m pytest tests/test_capabilities.py -q -p no:cacheprovider`

Expected: the optional incompatible adapter is currently an error and/or the workflow reports `wan_tracks_native`.

- [ ] **Step 3: Correct diagnostic severity and workflow usage**

In `diagnose_setup()`, map `incompatible` to `warning`, `missing` to `info`, and `detected_unverified` to `warning`. Keep `ok` derived from true errors so this adapter-only diagnostic remains true for optional integration problems.

In `check_workflow_compatibility()`, set:

```python
"wan_ati": {"MajoorOmniCamWanVideoWrapperATI"},
"wan_tracks_native": set(),
```

- [ ] **Step 4: Add a pure frontend badge model test**

```javascript
test("global setup copy says core ready while optional adapters need attention", () => {
  assert.deepEqual(setupBadgeModel([]), { tone: "ok", label: "Core ready" });
  assert.deepEqual(setupBadgeModel([{ severity: "warning" }]), {
    tone: "warn", label: "1 optional adapter issue",
  });
  assert.deepEqual(setupBadgeModel([{ severity: "warning" }, { severity: "info" }]), {
    tone: "warn", label: "2 optional adapter issues",
  });
});
```

Implement `setupBadgeModel()` in the new dependency-free shared module and have `diagnostics.js` translate its returned label. Add exact French catalogue entries for the three new source strings and stop calling every issue “missing”.

- [ ] **Step 5: Verify backend and frontend GREEN**

Run:

```bash
python -B -m pytest tests/test_capabilities.py -q -p no:cacheprovider
node --test tests/frontend/setup-diagnostic.node.mjs tests/frontend/monitor-capabilities.node.mjs
npm run check:locales
```

Expected: all commands pass.

- [ ] **Step 6: Commit only Task 7 files**

```bash
git add omnicam/capabilities.py tests/test_capabilities.py web-src/shared/setup-diagnostic.js web-src/diagnostics.js web-src/locales/fr.js tests/frontend/setup-diagnostic.node.mjs
git commit -m "fix: report optional adapter health without blocking core"
```

---

### Task 8: Harden frontend test discovery and Python CI

**Files:**
- Create: `scripts/run_node_tests.mjs`
- Create: `tests/frontend/node-test-runner.node.mjs`
- Modify: `package.json`
- Modify: `requirements-dev.txt`
- Modify: `.github/workflows/test.yml`
- Modify but never stage/commit: `pyproject.toml`

**Interfaces:**
- Produces: automatic discovery and execution of every `tests/frontend/*.node.mjs`
- Produces: CI-compatible NumPy pin for Python 3.10–3.13
- Produces: explicit mypy scope/options resolved by bare `mypy`

- [ ] **Step 1: Write failing test-registration policy tests**

Create a pure test for the runner helpers:

```javascript
import assert from "node:assert/strict";
import test from "node:test";
import { hasRegisteredTest } from "../../scripts/run_node_tests.mjs";

test("node test discovery rejects empty and comment-only modules", () => {
  assert.equal(hasRegisteredTest(""), false);
  assert.equal(hasRegisteredTest("// test('pretend', () => {})"), false);
  assert.equal(hasRegisteredTest("/* test('pretend', () => {}) */"), false);
});

test("node test discovery recognises a real top-level registration", () => {
  assert.equal(hasRegisteredTest('test("real", () => {});'), true);
});
```

- [ ] **Step 2: Verify the repository-level RED signal before filling the old empty file**

First run the future policy logic against the current checkout during implementation, before Task 5 fills `selection-outline.node.mjs`, or reproduce it with a temporary empty fixture in the helper test. Expected: discovery reports `selection-outline.node.mjs` as registering zero tests.

Then run: `node --test tests/frontend/node-test-runner.node.mjs`

Expected before the helper exists: FAIL to import it.

- [ ] **Step 3: Implement the discovery runner**

`scripts/run_node_tests.mjs` must:

- list and sort every `.node.mjs` file in `tests/frontend`;
- strip line and block comments before matching a line-start `test(` registration;
- print every offending path and exit nonzero when any file has no registration;
- when invoked as the CLI, spawn `process.execPath` with `--test` and the complete discovered list;
- when imported, export helpers without spawning tests recursively;
- propagate the child exit status.

Use `pathToFileURL(process.argv[1]).href === import.meta.url` for the CLI guard and `spawnSync(..., { stdio: "inherit" })` for transparent output.

Implement the runner around these exact exported boundaries:

```javascript
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function hasRegisteredTest(source) {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  return /^\s*(?:test|it)\s*\(/m.test(withoutComments);
}

export function discoverNodeTests(directory = resolve("tests/frontend")) {
  return readdirSync(directory)
    .filter((name) => name.endsWith(".node.mjs"))
    .sort()
    .map((name) => resolve(directory, name));
}

export function runNodeTests(files = discoverNodeTests()) {
  const empty = files.filter((file) => !hasRegisteredTest(readFileSync(file, "utf8")));
  if (empty.length) {
    throw new Error(`Node test modules without test registrations:\n${empty.join("\n")}`);
  }
  const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
  return result.status ?? 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    process.exitCode = runNodeTests();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
```

- [ ] **Step 4: Replace the hand-maintained package list**

Change only:

```json
"test:unit": "node scripts/run_node_tests.mjs"
```

This must automatically include `view-navigation.node.mjs`, `axis-gizmo-view.node.mjs`, `selection-outline.node.mjs`, `setup-diagnostic.node.mjs`, and future files.

- [ ] **Step 5: Verify frontend discovery GREEN**

Run:

```bash
node --test tests/frontend/node-test-runner.node.mjs
npm run test:unit
```

Expected: all discovered files contain tests and the full Node suite passes.

- [ ] **Step 6: Make NumPy compatible with the declared Python floor**

Replace `numpy==2.3.4` with:

```text
numpy==2.2.6
```

No conditional marker is needed because 2.2.6 supports every matrix interpreter and the repository uses no 2.3-only API.

- [ ] **Step 7: Keep all Python matrix results visible**

In `.github/workflows/test.yml` add under `python-core.strategy`:

```yaml
fail-fast: false
```

Give the jobs stable display names so branch-protection contexts are unambiguous:

```yaml
python-core:
  name: python-core (${{ matrix.python-version }})
python-full:
  name: python-full
comfyui-integration:
  name: comfyui-integration (${{ matrix.label }})
comfyui-browser:
  name: comfyui-browser
frontend:
  name: frontend
```

- [ ] **Step 8: Complete the existing local mypy configuration without replacing it**

Add the missing options to the existing `[tool.mypy]` block in the dirty `pyproject.toml`; keep the existing `warn_unused_ignores = true` line exactly once:

```toml
check_untyped_defs = true
warn_unused_ignores = true
warn_redundant_casts = true
no_implicit_optional = true
show_error_codes = true
```

Keep its current `python_version`, explicit file list, `mypy_path`, `ignore_missing_imports`, and `explicit_package_bases`.

- [ ] **Step 9: Verify CI configuration locally**

Run:

```bash
python -m pip install --dry-run "numpy==2.2.6"
mypy
ruff check .
npm run check
```

Expected: every command passes. Also inspect `git diff -- pyproject.toml` to confirm the user's earlier work remains present.

- [ ] **Step 10: Commit Task 8 while explicitly excluding pyproject.toml**

```bash
git add scripts/run_node_tests.mjs tests/frontend/node-test-runner.node.mjs package.json requirements-dev.txt .github/workflows/test.yml
git commit -m "ci: enforce complete tests across supported runtimes"
```

After the commit, run `git status --short` and verify `M pyproject.toml` is still present and unstaged.

---

### Task 9: Build generated assets and run complete verification

**Files:**
- Generated by the existing build: `web/omnicam.js`, `web-chunks/*`
- No production source changes unless a failing test identifies a new root cause

**Interfaces:**
- Verifies every release gate from source through generated bundle
- Preserves: `pyproject.toml` uncommitted

- [ ] **Step 1: Read the verification skill before claiming success**

Invoke `superpowers:verification-before-completion` and follow its evidence requirements.

- [ ] **Step 2: Run Python gates**

```bash
python -B -m pytest -q -p no:cacheprovider
ruff check .
mypy
```

Record exact pass/skip counts and any environment-driven skips.

- [ ] **Step 3: Run frontend gates from clean generated output**

```bash
npm run build
npm run check
npm run test:unit
npm run test:browser
```

Expected: all commands exit zero; Playwright no longer reports `hasOutlineMesh is not a function` or a Director attach timeout.

- [ ] **Step 4: Run live ComfyUI verification when available**

If a runnable ComfyUI checkout is present, run the stable live gate with the repository's documented environment variables:

```bash
npm run test:live
```

If no checkout/server is available, do not mark the live gate passed; record it as not run and rely on the configured CI lane for later remote evidence.

- [ ] **Step 5: Verify generated bundle parity and line ceiling**

Run:

```bash
git diff -- web web-chunks
npm run check:lines
git diff --check
```

If `npm run build` legitimately updates committed `web/` or `web-chunks/`, inspect the generated diff and commit only the generated files with:

```bash
git add web web-chunks
git commit -m "build: refresh stabilized frontend bundle"
```

Never include `pyproject.toml`.

After any generated-assets commit, run `git diff --exit-code -- web web-chunks` and require exit zero.

- [ ] **Step 6: Recheck the protected dirty file**

Run:

```bash
git status --short
git diff -- pyproject.toml
```

Expected: `pyproject.toml` remains modified and uncommitted; no unrelated user file is staged.

---

### Task 10: Replace stale release evidence with observed results

**Files:**
- Modify: `docs/VALIDATION_REPORT.md`
- Modify: `README.md`
- Modify: `docs/NODES.md`
- Create: `docs/BRANCH_PROTECTION.md`
- Modify only if behavior actually changed: `docs/SHORTCUTS.md`
- Modify only if a trust/resource boundary actually changed: `docs/SECURITY.md`

**Interfaces:**
- Produces: release evidence that distinguishes local results, configured CI, and manual work
- Produces: exact required-check list for remote branch protection

- [ ] **Step 1: Update node behavior documentation**

Document in `docs/NODES.md` and the relevant README tables:

- legacy H3 is deprecated but executable in 0.3.x;
- H3 Native preserves the complete supplied reference and resamples it to 24 fps;
- Native duration guidance is advisory while the five-frame minimum is blocking;
- global setup health does not block on unused optional adapters;
- selected-adapter preflight still blocks incompatible contracts.

- [ ] **Step 2: Write branch-protection instructions without mutating GitHub**

Create `docs/BRANCH_PROTECTION.md` with the exact workflow jobs required on `main`:

```text
python-core (3.10)
python-core (3.12)
python-core (3.13)
python-full
frontend
comfyui-integration (minimum)
comfyui-integration (v0.34.0)
comfyui-browser
```

Explain that the `master` ComfyUI integration is a non-blocking canary and that applying the rule requires separate explicit authorization to change remote repository settings.

- [ ] **Step 3: Rewrite validation evidence from Task 9 output**

In `docs/VALIDATION_REPORT.md`:

- put the exact current date;
- list exact local commands and observed counts;
- mark live ComfyUI as passed only if Task 9 actually ran it successfully;
- describe Python 3.10/3.12/3.13 as configured matrix coverage unless remote results were observed;
- retain manual generation, playblast, and DCC checks as unchecked until performed;
- remove the stale `642 passed / 8 skipped` claim unless that is the fresh result.

- [ ] **Step 4: Run documentation and repository checks**

Run:

```bash
npm run check:encoding
npm run check:lines
git diff --check
```

Expected: all checks pass and no maintained document contradicts the implementation.

- [ ] **Step 5: Commit documentation without pyproject.toml**

```bash
git add README.md docs/NODES.md docs/VALIDATION_REPORT.md docs/BRANCH_PROTECTION.md
git commit -m "docs: record stabilized release evidence"
```

Add `docs/SHORTCUTS.md` or `docs/SECURITY.md` only if they changed for the conditional reasons above.

- [ ] **Step 6: Final audit and handoff**

Run:

```bash
git status --short
git log --oneline --decorate -12
```

Confirm:

- every audit finding maps to a passing test or an explicitly documented remote/manual action;
- no model-specific code entered the core track;
- no hand-written source exceeds 800 lines;
- `pyproject.toml` is modified but not committed;
- no other unrelated user changes were committed;
- remote branch protection has not been changed without separate authorization.
