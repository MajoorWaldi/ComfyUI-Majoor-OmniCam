# OmniCam 0.3.1 Queue-Only + Registry Compliance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace OmniCam's out-of-queue Extractor/Reconstruction execution schedulers with native ComfyUI partial execution while preserving DPVO process isolation, then harden packaging and Registry verification so `0.3.1` is finalized only when the Comfy Registry accepts it.

**Architecture:** `TRACK` and Reconstruction `Start` become native partial queue requests targeting `MajoorOmniCamExtractor`. ComfyUI owns execution admission, dependency closure, ordering, cancellation, high-level progress, final output, and execution errors. OmniCam keeps solver/reconstruction internals, diagnostics, MotionScene compilation, and 3D visualization. DPVO remains a spawned child in the first release, with Comfy interruption propagated into that child.

**Tech Stack:** Python 3.10+, ComfyUI V3 nodes, ComfyUI frontend `app`/`api` public compatibility entry points, Comfy Jobs API, `ComfyAPISync`, multiprocessing DPVO isolation, Vite/JavaScript, pytest, Node tests, Playwright, GitHub Actions, Comfy Registry CLI.

**Spec:** `docs/superpowers/specs/2026-09-10-extractor-queue-only-design.md`

## Global Constraints

- Repository: `MajoorWaldi/ComfyUI-Majoor-OmniCam`.
- Baseline SHA: `5896642209ec6f6042f8003b6a37cbca9bdaef8e`.
- Current package version: `0.3.0`.
- Target release: `0.3.1`.
- Existing backend floor remains `requires-comfyui = ">=0.31.0"`; do not lower it.
- Existing frontend floor starts as `comfyui-frontend-package>=1.48.7`.
- Exactly three public nodes remain: `MajoorOmniCamExtractor`, `MajoorOmniCamDirector`, `MajoorOmniCamMonitor`.
- Heavy Camera Track and Scene Reconstruction become Queue-only.
- DPVO remains spawned in the first Queue-only release.
- Do not replace Three.js/WebAudio APIs merely to silence Registry heuristics.
- Never use scanner-evasion tricks: no encoded strings, `getattr` indirection, generated-file rewriting, obfuscation, or signature hiding.
- Do not patch ComfyUI core.
- No source file may exceed the repository's 800-line limit.
- Use TDD for every behavior change.
- Delete legacy schedulers only after Queue parity is proven live.

---

# 1. Official ComfyUI facts verified for this plan

## 1.1 Partial execution exists, but the frontend signature evolved

Frontend `v1.48.7` exposes:

```ts
async queuePrompt(
  number: number,
  batchCount: number = 1,
  queueNodeIds?: NodeExecutionId[]
): Promise<boolean>
```

and internally forwards the array as `partialExecutionTargets`.

Current frontend exposes an options object:

```ts
export interface QueuePromptOptions {
  queueNodeIds?: NodeExecutionId[]
  intent?: WorkflowQueueIntent
}
```

and current core code calls:

```ts
await app.queuePrompt(0, batchCount, {
  queueNodeIds: executionIds,
  intent: metadata,
})
```

**Critical safety rule:** never call one signature and fall back to the other after an exception. An unsupported argument shape can be accepted but interpreted as “no partial targets,” causing a full workflow execution.

## 1.2 Current Comfy Jobs API

Current ComfyUI exposes:

```text
GET  /api/jobs/{job_id}
POST /api/jobs/{job_id}/cancel
POST /api/jobs/cancel
```

Single-job cancel is idempotent. Pending jobs are dequeued; running jobs are interrupted.

## 1.3 Current Comfy V3 progress API

Current `comfy_api.latest` provides:

```python
await ComfyAPI().execution.set_progress(
    value=...,
    max_value=...,
)
```

and also exposes `ComfyAPISync` for synchronous execution code.

## 1.4 OmniCam already has the queued heavy-work path

`MajoorOmniCamExtractor.execute()` already handles:

```text
camera_track      -> extract_camera_track(...)
scene_reconstruct -> execute_reconstruction(...)
```

and already returns:

```text
motion_scene
solver_coverage
report
UI.PreviewText envelope
```

Frontend already contains:

```js
executed(message) {
  const result = parseExtractorMessage(message);
  if (!result) return;
  this.acceptSolvedResult(result, "queued");
}
```

Therefore this project consolidates execution lifecycle rather than rewriting the camera solver.

---

# 2. Target architecture

```text
                           COMFYUI
                 Queue / Jobs / Progress / Cancel
                              │
                     partial execution
                              │
                              ▼
                MajoorOmniCamExtractor
                              │
                          execute()
                              │
              ┌───────────────┴───────────────┐
              │                               │
          camera_track                  scene_reconstruct
              │                               │
        spawned DPVO*                  MoGe/VGGT/etc.
              │                               │
              └───────────────┬───────────────┘
                              ▼
                     OMNICAM_MOTION_SCENE
                              │
                       normal NodeOutput
                              │
                              ▼
                     OmniCam Extractor UI
                              │
               diagnostics / viewer / refine
```

`*` Spawned DPVO is intentionally retained in `0.3.1`.

> **ComfyUI owns execution. OmniCam owns solving, semantics and visualization.**

---

# 3. File map

## New frontend files

```text
web-src/extractor/queue/
├── compat.js
├── execution.js
├── job-state.js
└── events.js
```

Responsibilities:

```text
compat.js
  parse frontend version
  select exactly one queuePrompt signature
  normalize execution ID

execution.js
  queue current Extractor
  cancel current Comfy job
  no scheduling policy

job-state.js
  map Comfy state to OmniCam display state

events.js
  bind public Comfy execution/job events
  reject late events
```

## Existing frontend files modified

```text
web-src/extractor/index.js
web-src/extractor/state.js
web-src/extractor/result-cache.js
web-src/extractor/reconstruction/panel.js
web-src/extractor/reconstruction/settings-sync.js
web-src/comfy-runtime.js
```

## Frontend execution files retired after parity

```text
web-src/extractor/job-client.js
web-src/extractor/job-events.js
```

If source upload/description helpers are still needed, relocate them into:

```text
web-src/extractor/source-client.js
```

## Backend files added or modified

```text
omnicam/comfy_compat/api.py
omnicam/comfy_compat/progress.py
omnicam/comfy_compat/interrupt.py
omnicam/nodes/extractor.py
omnicam/extractor/pipeline.py
omnicam/extractor/backends/dpvo_worker.py
omnicam/reconstruction/node_bridge.py
omnicam/reconstruction/pipeline.py
```

## Legacy scheduler packages retired after parity

```text
omnicam/extractor/jobs/
omnicam/reconstruction/jobs/
```

Baseline `omnicam/extractor/jobs/`:

```text
__init__.py
api.py
control.py
events.py
manager.py
routes.py
types.py
worker.py
```

Baseline `omnicam/reconstruction/jobs/`:

```text
__init__.py
api.py
events.py
manager.py
routes.py
runner.py
types.py
```

## Registry and release files

```text
omnicam/asset_index.py
omnicam/routes.py
omnicam/reconstruction/providers/comfy_moge.py
scripts/registry_package_audit.py
scripts/check_registry_status.py
tests/test_registry_compliance.py
tests/test_registry_status_check.py
.github/workflows/test.yml
.github/workflows/publish_action.yml
tests/test_release_contract.py
docs/SECURITY.md
docs/NODES.md
docs/TECHNICAL_REFERENCE.md
CHANGELOG.md
pyproject.toml
package.json
package-lock.json
```

---

### Task 0: Baseline, sources, and isolated branch

**Files:** repository-wide read only.

**Interfaces:**
- Consumes: approved design spec and current `main`.
- Produces: a clean implementation branch with known baseline failures recorded.

- [ ] **Step 1: Read project rules and official sources**

Read `AGENTS.md` completely, then re-check:

```text
https://docs.comfy.org/
https://github.com/Comfy-Org/ComfyUI
https://github.com/Comfy-Org/ComfyUI_frontend
https://docs.comfy.org/registry/standards
https://docs.comfy.org/registry/publishing
```

- [ ] **Step 2: Confirm baseline**

```bash
git rev-parse HEAD
```

Expected when authored:

```text
5896642209ec6f6042f8003b6a37cbca9bdaef8e
```

If `main` moved, rebase the plan semantically; never overwrite newer fixes.

- [ ] **Step 3: Create isolated branch/worktree**

Recommended branch:

```text
feat/extractor-queue-only-0.3.1
```

- [ ] **Step 4: Run baseline tests**

```bash
python -m pip install -r requirements-dev.txt
npm ci
pytest -q
npm run test:unit
npm run check
npm run build
npm run test:browser
```

Record unrelated baseline failures before editing.

---

### Task 1: Safe partial-queue compatibility adapter

**Files:**
- Create: `web-src/extractor/queue/compat.js`
- Test: `tests/frontend/extractor-queue-compat.node.mjs`

**Interfaces:**
- Consumes: `app.queuePrompt`, `window.__COMFYUI_FRONTEND_VERSION__`, Extractor execution ID.
- Produces:

```js
getFrontendVersion(globalObject = globalThis): string
parseVersion(value): number[] | null
compareVersion(a, b): number
queuePartialPrompt(app, executionIds, options): Promise<boolean>
```

- [ ] **Step 1: Write failing tests for legacy and modern queue signatures**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { queuePartialPrompt } from "../../web-src/extractor/queue/compat.js";

test("legacy 1.48.7 uses queueNodeIds array", async () => {
  const calls = [];
  const app = { queuePrompt: async (...args) => { calls.push(args); return true; } };

  await queuePartialPrompt(app, ["7"], { frontendVersion: "1.48.7" });

  assert.deepEqual(calls, [[0, 1, ["7"]]]);
});

test("modern frontend uses QueuePromptOptions", async () => {
  const calls = [];
  const app = { queuePrompt: async (...args) => { calls.push(args); return true; } };

  await queuePartialPrompt(app, ["7"], {
    frontendVersion: "1.80.0",
    intent: { trigger_source: "omnicam_track" },
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0][2].queueNodeIds, ["7"]);
});

test("refuses to guess when frontend version is unavailable", async () => {
  await assert.rejects(
    () => queuePartialPrompt({ queuePrompt() {} }, ["7"], { frontendVersion: "" }),
    /frontend version/i,
  );
});
```

- [ ] **Step 2: Run and verify failure**

```bash
node --test tests/frontend/extractor-queue-compat.node.mjs
```

Expected: module/function missing.

- [ ] **Step 3: Implement strict version parsing**

```js
export function parseVersion(value) {
  const match = String(value || "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return match.slice(1).map(Number);
}

export function compareVersion(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) throw new Error("Unsupported ComfyUI frontend version");
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] < right[i] ? -1 : 1;
  }
  return 0;
}
```

- [ ] **Step 4: Determine the exact signature cutover**

Use official frontend Git history/releases to identify the first release where `QueuePromptOptions` replaced the array third argument. Store the exact proven version:

```js
export const QUEUE_OPTIONS_SIGNATURE_MIN = "X.Y.Z";
```

If this cutover cannot be proven, do **not** inspect minified function source or try both calls. Instead raise OmniCam's frontend minimum to one modern tested release and support only the modern signature.

- [ ] **Step 5: Implement one-shot dispatcher**

```js
export async function queuePartialPrompt(
  app,
  executionIds,
  { frontendVersion = getFrontendVersion(), intent } = {},
) {
  if (!Array.isArray(executionIds) || executionIds.length === 0) {
    throw new Error("OmniCam partial execution requires a target");
  }

  if (compareVersion(frontendVersion, QUEUE_OPTIONS_SIGNATURE_MIN) >= 0) {
    return app.queuePrompt(0, 1, { queueNodeIds: executionIds, intent });
  }

  return app.queuePrompt(0, 1, executionIds);
}
```

- [ ] **Step 6: Run tests and commit**

```bash
node --test tests/frontend/extractor-queue-compat.node.mjs
git add web-src/extractor/queue/compat.js tests/frontend/extractor-queue-compat.node.mjs
git commit -m "feat: add safe partial queue compatibility adapter"
```

---

### Task 2: Queue Camera TRACK through ComfyUI

**Files:**
- Create: `web-src/extractor/queue/execution.js`
- Modify: `web-src/extractor/index.js`
- Test: `tests/frontend/extractor-queue-execution.node.mjs`
- Live test: `tests/frontend/live-extractor.spec.js`

**Interfaces:**
- Consumes: `queuePartialPrompt(...)`.
- Produces:

```js
queueExtractor(ui, mode): Promise<{ accepted: boolean }>
```

- [ ] **Step 1: Write failing test that forbids old job-start route**

Fake `api.fetchApi` must throw if URL contains:

```text
/majoor/omnicam/extractor/jobs
```

Expected after TRACK:

```text
one app.queuePrompt call
zero /extractor/jobs calls
```

- [ ] **Step 2: Test missing source**

When source is unavailable, TRACK must not queue.

- [ ] **Step 3: Implement queue helper**

```js
export async function queueExtractor(ui, mode = "camera_track") {
  const source = ui.refreshSource();
  if (!source?.available) return { accepted: false };

  ui.setExtractMode(mode);
  ui.syncPanelToNodeWidgets();
  ui.prepareForQueuedRun();

  const executionId = ui.resolveExecutionId();
  const accepted = await queuePartialPrompt(ui.app, [executionId], {
    intent: {
      trigger_source: mode === "camera_track"
        ? "omnicam_track"
        : "omnicam_reconstruct",
    },
  });

  return { accepted: Boolean(accepted) };
}
```

- [ ] **Step 4: Replace `ExtractorUI.startSolve()`**

Camera TRACK must call `queueExtractor(this, "camera_track")` and dispatch a queued UI state.

Remove `this.client.startSolve(...)` from the camera-track execution path.

- [ ] **Step 5: Preserve existing queued result path**

Do not replace `executed() -> parseExtractorMessage() -> acceptSolvedResult(..., "queued")` unless needed for state naming.

- [ ] **Step 6: Unit and live smoke**

Run Node unit tests, then a tiny OpenCV/SIFT clip before testing DPVO.

- [ ] **Step 7: Commit**

```bash
git add web-src/extractor tests/frontend
git commit -m "feat: run Extractor TRACK through Comfy partial queue"
```

---

### Task 3: Make real Extractor widgets the single settings source

**Files:**
- Modify: `web-src/extractor/index.js`
- Modify: `web-src/extractor/reconstruction/settings-sync.js`
- Test: `tests/frontend/extractor-settings-sync.node.mjs`

**Produces:**

```js
ExtractorUI.syncPanelToNodeWidgets(): void
```

- [ ] **Step 1: Write failing settings round-trip test**

Cover all queued `execute()` inputs:

```text
extract_mode
method
lens_mode
fov_degrees
focal_length_mm
sensor_width_mm
max_dimension
frame_step
normalize_origin
motion_scale
position_smoothing
rotation_smoothing
simplify_keys
position_tolerance
rotation_tolerance_deg
all recon_* widgets
```

- [ ] **Step 2: Implement explicit widget synchronization**

Do not copy arbitrary DOM fields. Use the schema widget names deliberately.

- [ ] **Step 3: Delete obsolete `solveSettings()` payload builder if used only by old job-start code**

No second settings payload may influence heavy execution.

- [ ] **Step 4: Test and commit**

```bash
node --test tests/frontend/extractor-settings-sync.node.mjs
git add web-src/extractor tests/frontend/extractor-settings-sync.node.mjs
git commit -m "refactor: make Extractor widgets canonical for queued execution"
```

---

### Task 4: Add Comfy-native high-level progress

**Files:**
- Modify: `omnicam/comfy_compat/api.py`
- Create: `omnicam/comfy_compat/progress.py`
- Modify: `omnicam/nodes/extractor.py`
- Modify pipeline callback signatures as required
- Test: `tests/test_comfy_progress.py`

**Interfaces:**
- Produces:

```python
class ExecutionProgress:
    def update(self, value: float, max_value: float = 100.0) -> None: ...
```

- [ ] **Step 1: Expose `ComfyAPISync` in OmniCam compatibility layer**

Resolve stable numbered API first, `latest` only as fallback, consistent with existing compatibility policy.

- [ ] **Step 2: Write failing adapter test**

```python
def test_execution_progress_forwards_value_and_max():
    calls = []
    progress = ExecutionProgress(
        setter=lambda **kwargs: calls.append(kwargs),
    )
    progress.update(3, 10)
    assert calls == [{"value": 3.0, "max_value": 10.0}]
```

- [ ] **Step 3: Implement monotonic adapter**

Do not allow progress to move backward.

- [ ] **Step 4: Add phase mapping**

Camera Track:

```text
0-5%     source preparation
5-85%    tracking
85-97%   solver finalization
97-100%  MotionScene/envelope
```

Scene Reconstruction:

```text
0-10%    source preparation
10-45%   geometry
45-70%   segmentation
70-90%   completion/assets
90-100%  scene compilation
```

- [ ] **Step 5: Wire `MajoorOmniCamExtractor.execute()`**

Create one execution progress instance and pass callbacks downward. Do not report 100% until result serialization succeeds.

- [ ] **Step 6: Test and commit**

```bash
pytest -q tests/test_comfy_progress.py
git add omnicam/comfy_compat omnicam/nodes/extractor.py omnicam/extractor omnicam/reconstruction tests
git commit -m "feat: report Extractor progress through Comfy execution"
```

---

### Task 5: Propagate Comfy cancellation into DPVO child

**Files:**
- Create: `omnicam/comfy_compat/interrupt.py`
- Modify: DPVO parent orchestration
- Modify: `omnicam/extractor/backends/dpvo_worker.py` only where required
- Test: `tests/test_comfy_interrupt.py`
- Test: `tests/test_extractor_dpvo_worker.py`

**Interfaces:**
- Produces:

```python
check_interrupted() -> None
```

- [ ] **Step 1: Wrap current Comfy interruption primitive**

Prefer the official/core function used by long queued nodes:

```python
from comfy.model_management import throw_exception_if_processing_interrupted


def check_interrupted() -> None:
    throw_exception_if_processing_interrupted()
```

- [ ] **Step 2: Write interrupt adapter test**

Patch the underlying function and assert it is called.

- [ ] **Step 3: Add interrupt checks to every bounded DPVO child poll/wait**

- [ ] **Step 4: Preserve strict cleanup order**

```text
Comfy interrupt
 -> cooperative stop if available
 -> bounded join
 -> terminate if alive
 -> bounded join
 -> kill only if still alive and supported
 -> close IPC
 -> remove memmap
 -> remove exchange directory
 -> re-raise interrupt
```

- [ ] **Step 5: Test fake child cleanup on cancel**

Assert no orphan process or temporary directory remains.

- [ ] **Step 6: Run DPVO tests and commit**

```bash
pytest -q tests/test_comfy_interrupt.py tests/test_extractor_dpvo_worker.py
git add omnicam/comfy_compat/interrupt.py omnicam/extractor tests
git commit -m "feat: propagate Comfy cancellation into DPVO child"
```

---

### Task 6: Map real Comfy job state into OmniCam UI

**Files:**
- Create: `web-src/extractor/queue/job-state.js`
- Create: `web-src/extractor/queue/events.js`
- Modify: `web-src/extractor/state.js`
- Modify: `web-src/extractor/index.js`
- Test: `tests/frontend/extractor-queue-state.node.mjs`

**Produces:**

```js
mapComfyJobStatus(status): string | null
bindExtractorQueueEvents(ui, api): () => void
```

- [ ] **Step 1: Extend presentation states**

```text
IDLE
QUEUED
PREPARING
TRACKING
SOLVING
RECONSTRUCTING
FINALIZING
CANCELLING
COMPLETED
FAILED
CANCELLED
```

- [ ] **Step 2: Implement Comfy state map**

```js
export function mapComfyJobStatus(status) {
  switch (status) {
    case "waiting_to_dispatch":
    case "pending": return "QUEUED";
    case "in_progress": return "PREPARING";
    case "completed": return "COMPLETED";
    case "error": return "FAILED";
    case "cancelled": return "CANCELLED";
    default: return null;
  }
}
```

- [ ] **Step 3: Track transient prompt/job identity**

Needed for STOP, status display, telemetry filtering and late-event rejection. Never serialize it into MotionScene/workflow state.

- [ ] **Step 4: Keep rich telemetry non-authoritative**

Feature points/poses/quality may refine a non-terminal display state, but Comfy terminal state always wins.

- [ ] **Step 5: Test and commit**

```bash
node --test tests/frontend/extractor-queue-state.node.mjs
git add web-src/extractor/queue web-src/extractor/state.js web-src/extractor/index.js tests/frontend
git commit -m "feat: map Comfy job lifecycle into Extractor UI"
```

---

### Task 7: Replace STOP with Comfy Jobs cancellation

**Files:**
- Modify: `web-src/extractor/queue/execution.js`
- Modify: `web-src/extractor/index.js`
- Test: `tests/frontend/extractor-queue-cancel.node.mjs`
- Live: `tests/frontend/live-extractor.spec.js`

**Produces:**

```js
cancelExtractorJob(api, jobId): Promise<boolean>
```

- [ ] **Step 1: Write cancellation request test**

Expected:

```text
POST /api/jobs/<encoded-job-id>/cancel
```

- [ ] **Step 2: Implement**

```js
export async function cancelExtractorJob(api, jobId) {
  if (!jobId) return false;
  const response = await api.fetchApi(
    `/api/jobs/${encodeURIComponent(jobId)}/cancel`,
    { method: "POST" },
  );
  if (!response.ok) {
    throw new Error(`Comfy job cancellation failed (${response.status})`);
  }
  const payload = await response.json();
  return Boolean(payload?.cancelled);
}
```

- [ ] **Step 3: Replace old STOP binding**

Do not call `/majoor/omnicam/extractor/jobs/{id}/stop` after migration.

- [ ] **Step 4: Test idempotency**

Repeated STOP on a terminal job must not resurrect state or throw a product error.

- [ ] **Step 5: Live test both pending and running cancellation**

- [ ] **Step 6: Commit**

```bash
git add web-src/extractor tests/frontend
git commit -m "feat: cancel Extractor solves through Comfy jobs API"
```

---

### Task 8: Convert Scene Reconstruction Start to the same partial queue path

**Files:**
- Modify: `web-src/extractor/reconstruction/panel.js`
- Modify: `web-src/extractor/reconstruction/settings-sync.js`
- Modify: `web-src/extractor/index.js`
- Test: `tests/frontend/extractor-reconstruction-queue.node.mjs`
- Live: reconstruction browser/live tests

- [ ] **Step 1: Write failing test**

Press Reconstruction Start and assert:

```text
extract_mode widget = scene_reconstruct
reconstruction widgets synchronized
one partial Extractor queue
zero /reconstruction/jobs start requests
```

- [ ] **Step 2: Replace heavy Start path**

The reconstruction panel delegates to the parent queue function rather than owning a job manager.

- [ ] **Step 3: Preserve non-job helpers**

Keep capabilities, source inspection, preview and Director adoption where still needed.

- [ ] **Step 4: Preserve result adoption**

Queued result arrives through the Extractor NodeOutput/UI envelope and routes to reconstruction preview/adoption based on `mode`.

- [ ] **Step 5: Test and commit**

```bash
npm run test:unit
npm run test:browser
git add web-src/extractor/reconstruction web-src/extractor/index.js tests/frontend
git commit -m "feat: run scene reconstruction through Extractor queue"
```

---

### Task 9: Make queued result envelopes mode-aware and canonical

**Files:**
- Modify: `omnicam/nodes/extractor.py`
- Modify: `web-src/extractor/result-cache.js`
- Modify: `web-src/extractor/index.js`
- Test: existing Extractor link/result tests and Python node tests

**Canonical envelope:**

```json
{
  "kind": "omnicam_extractor_result_v2",
  "mode": "camera_track | scene_reconstruct",
  "motion_scene": {},
  "solver_coverage": 0.0,
  "report": "",
  "source": ""
}
```

- [ ] **Step 1: Add tests for both modes**
- [ ] **Step 2: Keep camera-track compatibility**
- [ ] **Step 3: Make reconstruction use the same outer transport contract**
- [ ] **Step 4: Route frontend result by `mode`**
- [ ] **Step 5: Preserve hidden cache widgets for save/reload**
- [ ] **Step 6: Commit**

```bash
git add omnicam/nodes/extractor.py web-src/extractor tests
git commit -m "refactor: unify queued Extractor result envelopes"
```

---

### Task 10: Hard safety test — TRACK must never execute downstream generation

**Files:**
- Add: `tests/frontend/live-extractor-partial-queue.spec.js`
- Add/modify deterministic workflow fixture

**Test graph:**

```text
Load Video -> Extractor -> Director -> Downstream Sentinel
```

- [ ] **Step 1: Create a cheap downstream sentinel**

It records whether it executed; it must not invoke a real diffusion model.

- [ ] **Step 2: Press TRACK**

Expected:

```text
upstream loader may execute
Extractor executes
downstream sentinel count = 0
```

- [ ] **Step 3: Repeat for Reconstruction Start**
- [ ] **Step 4: Repeat on minimum supported frontend**
- [ ] **Step 5: Repeat on current stable frontend**
- [ ] **Step 6: Add subgraph case if Extractor-in-subgraph is supported**

Do not blindly use `String(node.id)` for nested execution if Comfy requires an execution path.

- [ ] **Step 7: Commit**

```bash
git add tests/frontend
git commit -m "test: prove OmniCam partial queue stops at Extractor"
```

This task is a hard gate before deleting the old scheduler.

---

### Task 11: Replace custom GPU-busy rejection with normal queue waiting

**Files:**
- Modify/remove callers of `omnicam/extractor/jobs/control.py`
- Modify/remove reconstruction execution-probe callers
- Add live queue-order test

- [ ] **Step 1: Start a deliberately long Comfy job**
- [ ] **Step 2: Press TRACK while it runs**

Expected:

```text
TRACK accepted
Extractor display = QUEUED
no custom "GPU busy" rejection
```

- [ ] **Step 3: Let first job finish**

Extractor must start automatically.

- [ ] **Step 4: Remove custom admission gates whose sole purpose is parallel-execution protection**

- [ ] **Step 5: Keep deliberate VRAM handoff/unload before DPVO if still needed**

Queue serialization does not automatically free models already resident in Comfy's allocator.

- [ ] **Step 6: Commit**

```bash
git add omnicam web-src tests
git commit -m "refactor: let Comfy queue arbitrate OmniCam GPU execution"
```

---

### Task 12: Retire camera interactive job frontend

**Files:**
- Delete/relocate: `web-src/extractor/job-client.js`
- Delete/trim: `web-src/extractor/job-events.js`
- Create if needed: `web-src/extractor/source-client.js`
- Modify imports/tests

- [ ] **Step 1: Inventory current dependencies**

```bash
git grep -n "SolveJobClient"
git grep -n "job-client"
git grep -n "SolveEventSubscription"
```

- [ ] **Step 2: Move only non-execution helpers**

Source upload/description may survive in `source-client.js`.

- [ ] **Step 3: Delete old execution methods**

```text
startSolve
getSolveStatus
stopSolve
refineSolve as job operation
getSolveResult
deleteSolve
```

- [ ] **Step 4: Remove custom recovery polling**

Comfy events/results now own lifecycle.

- [ ] **Step 5: Run frontend suite**

```bash
npm run test:unit
npm run check
npm run build
npm run test:browser
```

- [ ] **Step 6: Commit**

```bash
git add -A web-src/extractor tests/frontend
git commit -m "refactor: retire Extractor interactive job client"
```

---

### Task 13: Retire backend camera scheduler

**Files:**
- Delete/relocate from `omnicam/extractor/jobs/`
- Modify route registration, tests, docs

- [ ] **Step 1: Classify every symbol**

```text
DELETE = scheduler/job ownership only
MOVE   = pure reusable solver/source utility
KEEP   = optional non-authoritative telemetry helper
```

Record classification in PR description.

- [ ] **Step 2: Remove old execution routes**

```text
POST   /majoor/omnicam/extractor/jobs
GET    /majoor/omnicam/extractor/jobs/{job_id}
POST   /majoor/omnicam/extractor/jobs/{job_id}/stop
POST   /majoor/omnicam/extractor/jobs/{job_id}/refine
GET    /majoor/omnicam/extractor/jobs/{job_id}/result
DELETE /majoor/omnicam/extractor/jobs/{job_id}
```

- [ ] **Step 3: Relocate rich telemetry if retained**

Suggested neutral module:

```text
omnicam/extractor/telemetry.py
```

It may emit diagnostics but may not start, own, stop, or persist jobs.

- [ ] **Step 4: Remove obsolete global manager shutdown hooks**
- [ ] **Step 5: Run Python suite**
- [ ] **Step 6: Commit**

```bash
git add -A omnicam/extractor tests docs
git commit -m "refactor: remove out-of-queue Extractor scheduler"
```

---

### Task 14: Retire Reconstruction heavy scheduler

**Files:**
- Delete/relocate from `omnicam/reconstruction/jobs/`
- Modify route registration, reconstruction tests, docs

- [ ] **Step 1: Move pure stage orchestration into pipeline/node bridge as needed**
- [ ] **Step 2: Delete independent job manager/runner ownership**
- [ ] **Step 3: Delete heavy start/status/stop/result job routes**
- [ ] **Step 4: Remove "refuse GPU while prompt running" execution probe**
- [ ] **Step 5: Preserve capabilities/preflight/source endpoints**
- [ ] **Step 6: Run reconstruction suite**

```bash
pytest -q tests/reconstruction
npm run test:unit
npm run test:browser
```

- [ ] **Step 7: Commit**

```bash
git add -A omnicam/reconstruction web-src/extractor/reconstruction tests
git commit -m "refactor: remove reconstruction side scheduler"
```

---

### Task 15: Separate post-solve refinement from execution scheduling

**Files:**
- Inspect/modify: `web-src/extractor/refine-controls.js`
- Inspect old backend refine code before deletion
- Modify tests as needed

- [ ] **Step 1: Inventory refinement operations**

Expected:

```text
normalize origin
motion scale
position smoothing
rotation smoothing
key simplification
trim
world alignment
```

- [ ] **Step 2: Prefer pure deterministic local/canonical refine**

- [ ] **Step 3: If Python is required, use a small synchronous bounded endpoint**

Example:

```text
POST /majoor/omnicam/extractor/refine
```

It accepts solved canonical data + settings and returns refined data.

It must not create:

```text
job ID
manager
worker lifecycle
GPU admission
background task
```

- [ ] **Step 4: Verify Apply produces the same refined MotionScene**
- [ ] **Step 5: Commit only if code changes are required**

---

# Registry Compliance phase

Apply these only after Queue parity is green. Keep the commits separate from execution migration so scanner changes cannot hide Queue regressions.

---

### Task 16: Remove avoidable environment-read scanner triggers

**Files:**
- Modify: `omnicam/asset_index.py`
- Modify: `omnicam/routes.py`
- Modify: `docs/SECURITY.md`
- Modify tests

- [ ] **Step 1: Replace asset-index TTL environment read**

```python
_CACHE_TTL_SECONDS = 30
```

- [ ] **Step 2: Remove runtime `_env_limit()` configuration for security ceilings**

Preserve exact current defaults:

```python
MAX_CARD_BYTES = 128 * 1024 * 1024
MAX_MODEL_BYTES = 256 * 1024 * 1024
MAX_MODEL_VERTICES = 5_000_000
MAX_MODEL_TRIANGLES = 10_000_000
MAX_FBX_MODEL_BYTES = 64 * 1024 * 1024
MAX_PLAYBLAST_BYTES = 512 * 1024 * 1024
MAX_FOLDER_BYTES = 4 * 1024 * 1024 * 1024
MIN_FREE_BYTES = 512 * 1024 * 1024
MAX_IMAGE_PIXELS = 80_000_000
MAX_IMAGE_FRAMES = 2_000
MAX_VIDEO_PIXELS = 16_777_216
MAX_LIVE_PREFLIGHT_BYTES = 4 * 1024 * 1024
MAX_VIDEO_DURATION_SECONDS = 3_600
MAX_CLEANUP_JSON_BYTES = 256 * 1024
MAX_EXPORT_JSON_BYTES = 8 * 1024 * 1024
MAX_EXPORT_FOLDER_BYTES = 512 * 1024 * 1024
QUOTA_CACHE_TTL_SECONDS = 300
```

Do not remove `import os` from `routes.py` if normal filesystem code still uses it.

- [ ] **Step 3: Update browser/backend limit parity tests**
- [ ] **Step 4: Update SECURITY docs to describe fixed conservative ceilings**
- [ ] **Step 5: Commit**

```bash
git add omnicam/asset_index.py omnicam/routes.py docs/SECURITY.md tests
git commit -m "security: make OmniCam runtime limits deterministic"
```

---

### Task 17: Replace dynamic native MoGe import

**Files:**
- Modify: `omnicam/reconstruction/providers/comfy_moge.py`
- Test: provider tests

- [ ] **Step 1: Write missing/present-module tests**
- [ ] **Step 2: Replace string-based dynamic import**

```python
def _get_moge_module(self):
    try:
        from comfy_extras import nodes_moge
    except ImportError:
        return None
    return nodes_moge
```

Keep import lazy.

- [ ] **Step 3: Run provider tests**
- [ ] **Step 4: Commit**

```bash
git add omnicam/reconstruction/providers/comfy_moge.py tests
git commit -m "fix: use normal lazy import for native MoGe"
```

---

### Task 18: Optional refactor of OmniCam-owned `this.listen`

**Files:** relevant OmniCam UI controllers only.

This task is conditional: do it only if the next Registry report still explicitly points at OmniCam's own `this.listen(` helper.

Preferred replacement:

```js
this.events.on(target, eventName, handler, options)
```

with scoped cleanup.

Do not change:

```text
Function.prototype.bind
Three.js bind
WebAudio connect
browser addEventListener
```

This must be a clarity refactor, not signature hiding.

---

### Task 19: Audit the exact Registry `node.zip`

**Files:**
- Create: `scripts/registry_package_audit.py`
- Create: `tests/test_registry_compliance.py`
- Modify: `.github/workflows/test.yml`
- Modify: `.github/workflows/publish_action.yml`

**Produces:**

```bash
python scripts/registry_package_audit.py node.zip
```

- [ ] **Step 1: Fail on development paths shipped accidentally**

```text
tests/
scripts/
web-src/
.github/
node_modules/
.venv/
```

- [ ] **Step 2: Require runtime package paths**

```text
web/omnicam.js
web-chunks/
omnicam/
pyproject.toml
```

- [ ] **Step 3: AST-scan shipped Python**

Fail on direct runtime:

```text
eval(...)
exec(...)
pip-install subprocess patterns
```

Do not substring-match comments/docstrings for eval/exec.

- [ ] **Step 4: Fail if removed avoidable patterns return**

```text
os.environ.get(
importlib.import_module("comfy_extras.nodes_moge")
```

- [ ] **Step 5: Report, but do not fail, legitimate known heuristics**

```text
connection.send(
connection.recv(
.bind(
.connect(
.listen(
```

- [ ] **Step 6: Wire audit immediately after the exact Registry pack command**

```bash
comfy --skip-prompt --no-enable-telemetry node pack
python scripts/registry_package_audit.py node.zip
```

- [ ] **Step 7: Test and commit**

```bash
pytest -q tests/test_registry_compliance.py
git add scripts/registry_package_audit.py tests .github/workflows
git commit -m "ci: audit exact Comfy Registry package"
```

---

### Task 20: Gate GitHub Release on Registry Active status

**Files:**
- Create: `scripts/check_registry_status.py`
- Create: `tests/test_registry_status_check.py`
- Modify: `.github/workflows/publish_action.yml`
- Modify: `tests/test_release_contract.py`

**CLI:**

```bash
python scripts/check_registry_status.py \
  --node majoor-omnicam \
  --version 0.3.1 \
  --timeout 900 \
  --interval 15
```

- [ ] **Step 1: Test state policy**

```text
NodeVersionStatusActive  -> success
NodeVersionStatusPending -> poll
NodeVersionStatusFlagged -> fail immediately and print reason
NodeVersionStatusBanned  -> fail
NodeVersionStatusDeleted -> fail
initial 404              -> retry until bounded timeout
5xx/network              -> bounded retry
```

- [ ] **Step 2: Implement using Python standard library**

Prefer `urllib.request`; no new runtime dependency.

- [ ] **Step 3: Add workflow gate**

```text
release-test
  ↓
release-build
  ↓
release-registry
  ↓
registry-verify
  ↓
release-github
```

- [ ] **Step 4: Make `release-github` depend on `registry-verify`**

A successful upload is not release success.

- [ ] **Step 5: Test and commit**

```bash
pytest -q tests/test_registry_status_check.py tests/test_release_contract.py
git add scripts/check_registry_status.py tests .github/workflows/publish_action.yml
git commit -m "ci: gate releases on Comfy Registry acceptance"
```

---

### Task 21: Verify compatibility floor

**Files:**
- Modify: `pyproject.toml` only if evidence requires
- Modify: `tests/test_release_contract.py`

Current metadata:

```toml
dependencies = ["comfyui-frontend-package>=1.48.7"]
requires-comfyui = ">=0.31.0"
```

- [ ] **Step 1: Run Queue-only live suite against frontend `1.48.7`**
- [ ] **Step 2: Run against current stable frontend**
- [ ] **Step 3: Run current nightly smoke**
- [ ] **Step 4: If version-aware queue adapter proves both signatures, retain `>=1.48.7`**
- [ ] **Step 5: If exact cutover cannot be proven or old path is unreliable, raise minimum to the first tested modern release**
- [ ] **Step 6: Add release contract assertion for final floor**

Do not raise backend `>=0.31.0` without a concrete missing-API reason.

---

### Task 22: Prepare `0.3.1`

**Files:**
- Modify: `pyproject.toml`
- Modify: `package.json`
- Update: `package-lock.json`
- Modify: `CHANGELOG.md`
- Modify: `docs/NODES.md`
- Modify: `docs/TECHNICAL_REFERENCE.md`
- Modify: `docs/SECURITY.md`

- [ ] **Step 1: Bump package version**

```diff
-version = "0.3.0"
+version = "0.3.1"
```

and package JSON parity.

- [ ] **Step 2: Refresh lockfile**

```bash
npm install --package-lock-only
```

- [ ] **Step 3: Add changelog**

```markdown
## [0.3.1] - 2026-09-XX

### Changed
- Extractor TRACK and Scene Reconstruction now use native ComfyUI partial
  execution instead of OmniCam's parallel heavy-job schedulers.
- ComfyUI owns heavy-job ordering, cancellation and high-level progress.
- DPVO remains isolated in a spawned process; Comfy cancellation propagates
  into that process.

### Removed
- Out-of-queue camera solve scheduler and its job lifecycle routes.
- Independent Scene Reconstruction heavy execution scheduler after parity.

### Security
- Runtime upload/cache ceilings are deterministic rather than environment-driven.
- Native MoGe is loaded through a normal lazy import.
- Registry packages are audited before publication and GitHub release
  finalization waits for Registry Active status.
```

- [ ] **Step 4: Update docs that currently say TRACK must never queue**

New wording:

```text
TRACK queues a partial Comfy execution ending at MajoorOmniCamExtractor;
downstream Director/Monitor/video generation is not executed.
```

- [ ] **Step 5: Commit**

```bash
git add pyproject.toml package.json package-lock.json CHANGELOG.md docs
git commit -m "chore: prepare OmniCam 0.3.1 queue-only release"
```

---

### Task 23: Full local verification

**Files:** none unless failures expose defects.

- [ ] **Step 1: Python suite**

```bash
python -m pip install -r requirements-dev.txt
pytest -q
```

- [ ] **Step 2: Frontend suite**

```bash
npm ci
npm run test:unit
npm run check
npm run build
npm run test:browser
```

- [ ] **Step 3: Pack exact Registry archive**

```bash
python -m pip install comfy-cli==1.20.0
comfy --skip-prompt --no-enable-telemetry node pack
python scripts/registry_package_audit.py node.zip
```

- [ ] **Step 4: Inspect archive composition**

Absent:

```text
tests/
scripts/
web-src/
.github/
```

Present:

```text
web/omnicam.js
web-chunks/
omnicam/
pyproject.toml
```

- [ ] **Step 5: Confirm avoidable scanner patterns are absent from shipped Python**

Do not require legitimate DPVO IPC or generated JS `.bind/.connect` strings to disappear.

---

### Task 24: Required live ComfyUI verification matrix

**Files:** live/browser tests and fixtures.

#### Camera Track

```text
[ ] TRACK from idle
[ ] TRACK while another job is running
[ ] cancel while queued
[ ] cancel while DPVO running
[ ] DPVO success
[ ] DPVO forced failure
[ ] OpenCV/SIFT fallback
[ ] VIDEO source
[ ] IMAGE batch source
[ ] upstream cache behavior
[ ] downstream heavy node NOT executed
[ ] result appears in Extractor
[ ] result survives workflow save/reload
[ ] normal global Queue still executes workflow normally
```

#### Scene Reconstruction

```text
[ ] Depth Mesh queued
[ ] Blockout queued
[ ] Hybrid if still supported
[ ] provider error
[ ] cancel before execution
[ ] cancel during execution
[ ] downstream Director/H3 NOT executed
[ ] result preview works
[ ] adoption into Director works
```

#### Cleanup

```text
[ ] no DPVO child after success
[ ] no DPVO child after cancel
[ ] no DPVO child after failure
[ ] no temporary exchange-directory leak
[ ] VRAM returns after child exit
[ ] next normal video generation succeeds
```

#### Frontend compatibility

```text
[ ] minimum supported frontend
[ ] current stable frontend
[ ] current nightly smoke
```

---

# PR decomposition

Recommended:

```text
PR A — Queue compatibility + Camera TRACK
PR B — Native progress/cancel + DPVO interrupt propagation
PR C — Scene Reconstruction Queue-only
PR D — Remove legacy schedulers
PR E — Registry compliance + 0.3.1 release hardening
```

If release urgency requires one PR, preserve the same commit boundaries so review can isolate regressions.

---

# Manual Registry review template if 0.3.1 is still Flagged

```markdown
# Manual review request — majoor-omnicam 0.3.1

Node ID: `majoor-omnicam`
Publisher: `majoor-waldi`
Repository: https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam
Version: `0.3.1`

OmniCam 0.3.1 moved all heavy Extractor/Reconstruction execution to the
native ComfyUI queue and removed its parallel heavy-job schedulers.

The release also removed the avoidable findings from 0.3.0:
- process-environment reads for runtime cache/security limits;
- string-based `importlib.import_module("comfy_extras.nodes_moge")`.

Any remaining `multiprocessing.Connection.send()/recv()` finding is local IPC
between the queued Extractor parent and an isolated DPVO child process. It is
not outbound networking. The child is used for CUDA/native-extension isolation
and is terminated on Comfy job cancellation.

Any `.bind()`, `.connect()` or `.listen()` findings in generated JavaScript
should be reviewed as frontend APIs (Three.js, WebAudio, normal event/function
binding), not Python networking.

The exact Registry `node.zip` is audited in CI before publication and the
GitHub release is gated on the Registry version becoming Active.

Please review the remaining findings and identify any concrete Registry
standards violation that requires source changes.
```

---

# Separate post-0.3.1 DPVO inline spike

Do not mix this experiment into the production Queue migration.

Recommended branch:

```text
spike/dpvo-inline
```

Compare:

```text
spawned DPVO
vs
inline DPVO inside queued Extractor.execute()
```

Stress matrix:

```text
50 sequential solves
random cancellation during prepare/tracking/finalizing
VRAM before/after every solve
H3/Wan/LTX generation after every solve
intentional Python exception
malformed input
native-extension failure where safely reproducible
Comfy server survival
```

Measure:

```text
startup cost
solve duration
peak VRAM
post-solve reserved VRAM
cancel latency
crash containment
server stability
```

Inline may replace spawned only if there is no material regression in VRAM, cancellation, post-solve generation, or server stability.

Until that evidence exists:

```text
Queue-only != inline DPVO
```

---

# Definition of Done

```text
[ ] TRACK uses native Comfy partial execution
[ ] Scene Reconstruction Start uses native Comfy partial execution
[ ] required upstream dependencies execute
[ ] downstream Director/Monitor/video generation do not execute from those buttons
[ ] Extractor.execute() is the only heavy-processing authority
[ ] high-level progress is Comfy-native
[ ] STOP cancels the actual Comfy job
[ ] Comfy cancel terminates the spawned DPVO child
[ ] busy GPU means QUEUED rather than custom rejection
[ ] result arrives through normal NodeOutput/UI envelope
[ ] result survives workflow save/reload
[ ] old camera interactive scheduler is removed
[ ] old reconstruction heavy scheduler is removed
[ ] no duplicate heavy execution manager remains
[ ] no new public node is introduced
[ ] MotionScene format is unchanged
[ ] frontend queuePrompt signature handling is proven
[ ] avoidable environment scanner triggers are removed
[ ] dynamic MoGe import is removed
[ ] exact node.zip audit passes
[ ] Registry post-publish status gate exists
[ ] package version parity is 0.3.1
[ ] Python suite passes
[ ] frontend unit/check/build/browser suites pass
[ ] live Camera Track matrix passes
[ ] live Reconstruction matrix passes
[ ] no DPVO orphan/temp leak
[ ] next video generation works after DPVO
[ ] Registry reports 0.3.1 Active OR only documented false positives remain for manual review
```

---

# Flash execution prompt

```text
Implement:
docs/superpowers/plans/2026-09-10-queue-only-registry-compliance-0.3.1.md

Repository:
https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam

Mode: autonomous / FLASH.

Before editing:
1. Read AGENTS.md.
2. Read the linked Queue-only design spec.
3. Re-check current official ComfyUI Core, frontend, Registry standards, and publishing docs.
4. Confirm current HEAD and adapt semantically if main moved beyond
   5896642209ec6f6042f8003b6a37cbca9bdaef8e.
5. Work in an isolated branch/worktree.
6. Use TDD for every behavior change.

Non-negotiable:
- TRACK and Reconstruction Start become native partial Comfy execution.
- Never call both legacy and modern queuePrompt signatures as fallback.
- Never allow wrong signature selection to queue the whole workflow.
- Keep DPVO spawned during this release.
- Propagate Comfy cancellation into the DPVO child and prove cleanup.
- Do not patch ComfyUI core.
- Do not rewrite Three.js/WebAudio just to avoid scanner heuristics.
- Do not use scanner-evasion tricks.
- Remove old schedulers only after live Queue parity is proven.
- Do not publish 0.3.1 until the full verification matrix is green.
- A successful Registry upload is not success; verify Registry status is Active.
```
