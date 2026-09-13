# OmniCam Release Audit — Agent v1 final hardening

**Audited SHA:** `7223b03eef9d4a27acdddf28d6a80dbb66061bdd` (branch
`fix/agent-v1-final-security-audit`, based on `main` @ `eac318354d167e17f05a0a8223ed32799d2749fa`)
**Date:** 2026-09-13
**Python floor:** >= 3.10 (`pyproject.toml`) — verified locally on 3.14
**ComfyUI / frontend / Comfy MCP exact stable releases:** not independently
re-verified in this local pass (no network access to check current
upstream releases); the compatibility lanes in
`.github/workflows/test.yml` remain the source of truth for those and were
not re-run here. `requires-comfyui = ">=0.31.0"` per `pyproject.toml`.

Scope: implementation of the 2026-09-12 "OmniCam Agent v1 Final Hardening &
MCP Readiness" plan (11 of 15 tasks: Groups A–C in full; Group D docs +
local verification only — the live GitHub ruleset sync (plan Task 13) was
explicitly deferred to the maintainer, since it mutates real branch
protection and needs admin credentials this session does not have).

## Local verification (this pass)

| Check | Result |
|---|---|
| `pytest -q` (full suite) | 1760 passed, 18 skipped, **2 failed** — both `AssertionError: Torch not compiled with CUDA enabled` in `tests/test_director_monitor_integration.py`, unrelated to any file this plan touched; a pre-existing CPU-only-environment failure (this machine's torch has no CUDA build), not a regression from this pass |
| `ruff check .` | pass (0 findings) |
| `mypy` | pass, 0 issues, 45 source files |
| `npm run build` then `git diff --exit-code -- web/ web-chunks/` | pass — committed bundle is byte-identical to a fresh build |
| `npm run check` (lines/encoding/three-surface/locales/template-contract/licenses/bundle syntax) | pass (fr.js sits at pre-existing 91.3% coverage — informational, not a hard-fail gate, and no new untranslated strings were left behind by this plan's own additions) |
| `npm run test:unit` (Node test runner) | 1156 passed |
| `npm run test:browser` (Playwright, full non-live suite) | 117 passed |
| `comfy node pack` + `python scripts/registry_package_audit.py node.zip` | **Registry package audit: OK** (0 violations; the Agent provider env-var allowlist added earlier this cycle still holds) |
| `python scripts/verify_package.py` | OK |
| ComfyUI compatibility lanes (`v0.31.0`/`v0.34.0`/`v0.35.0`, pinned/stable/minimum frontend) | not run locally — CI-only, unchanged by this plan |
| Live GitHub ruleset sync (plan Task 13) | **not performed** — requires `gh api --method PUT` with ruleset-admin rights; left for the maintainer to run and verify per the plan's own instructions |

## Agent v1 security regressions added this pass

| Contract | Result | Commit |
|---|---|---|
| native OpenAI/Anthropic custom `base_url` uses the custom-endpoint network policy | PASS | `fix(agent): enforce network policy on native provider overrides` |
| Provider Test proves real reachability (`probe()`), not model-discovery's graceful degrade | PASS | `fix(agent): separate provider connectivity probe from model discovery` |
| provider/planner routes never return `str(error)` from a generic exception | PASS | `fix(agent): redact provider and planner errors` |
| built-in planner cannot request `scene.get`; 512 KiB context / 128 KiB observation caps | PASS | `fix(agent): bound planner context and prefer targeted scene queries` |
| Agent panel discloses the outbound data boundary before Preview | PASS | `feat(agent): disclose planner provider data boundary` |
| `Enable built-in Agent` hides/disables only the built-in UI; external bridge unaffected | PASS | `fix(agent): wire the built-in Agent enable setting` |
| `PreviewBeforeApply` (a bypass that never did anything) removed; Preview → Apply mandatory | PASS | `fix(agent): make Preview and Apply a mandatory safety flow` |
| `camera.create` rejects `far` invalid relative to the effective `near` at the boundary | PASS | `fix(director-api): validate camera clipping planes at the boundary` |
| `SecretStore` itself (not just the route layer) refuses to mutate an env-managed credential | PASS | `fix(agent): enforce env credential ownership in SecretStore` |
| unspecified/multicast/link-local (incl. `169.254.169.254`) blocked even with the remote-provider opt-in | PASS | `fix(agent): block sensitive link-local provider targets` |
| a failed post-commit viewport-resource reconciliation surfaces as a bounded warning | PASS | `fix(agent): report viewport resource reconciliation warnings` |

Every row above shipped with a failing-test-first regression covering exactly
that contract (see the commit's own test diff); none are house-of-cards
assertions written after the fact.

## Release verdict

🟢 **GO** for the scope audited above (Groups A–C, the security-relevant
Agent v1 hardening). Governance items outside this session's authority
remain open: the live GitHub ruleset (Task 13) and the multi-version
ComfyUI/frontend compatibility matrix (CI-only, not re-run locally).

---

# OmniCam deep audit — 31 August 2026

> **Historical.** This audit describes the repository as it stood on
> 31 August 2026, before the MotionScene refactor and the stabilisation pass
> that followed. The node surface, adapter ids and example workflows it
> describes no longer exist. Kept as a record of what was found and why; see
> `.github/workflows/test.yml` for the current CI matrix and
> `docs/CONFORMANCE.md` for real-model conformance status.

Scope: full pass over the shipped Python package (`omnicam/`, ~11.9k LOC),
the frontend source (`web-src/`, ~15.3k LOC), the maintained documentation
(`README.md`, `docs/`), the in-app help (`web-src/help/`), the i18n catalogue
(`web-src/locales/fr.js`) and the example workflows.

Method: every claim below was checked against the code that ships in this
commit, not against prior documentation. Node identity and registration were
read from `omnicam/node_registry.py` and the `define_schema()` of each node
class; shortcuts from `web-src/commands.js`; limits from `omnicam/routes*.py`
and `omnicam/http_json.py`.

---

## 1. Overall health

| Check | Result |
|---|---|
| `pytest -q` | **642 passed, 8 skipped** |
| `npm run check` (lines, encoding, three-surface, locales, template contract, licences, bundle syntax) | **pass** |
| Hand-written source ≤ 800 lines | pass (362 files, max 630) |
| UTF-8 / mojibake guard | pass (399 files) |
| `TODO` / `FIXME` / `HACK` markers | none |
| `fr.js` locale coverage | 100.0% (0 untranslated of 468) |
| `ruff check .` | **FAIL — 11 findings** (see §4) |
| Frontend Playwright suite | not re-run in this audit |

The engineering substance is in good shape. The issues that follow are almost
entirely **alignment** issues: the docs describe an earlier node surface and an
earlier shortcut set, and the repository never settled on one documentation
language.

---

## 2. The node surface (authoritative)

From `omnicam/node_registry.py` and each `define_schema()`:

| Node id | Display name | Category | State |
|---|---|---|---|
| `MajoorOmniCamDirector` | OmniCam Director | `Majoor/OmniCam` | product, `is_experimental=True` |
| `MajoorOmniCamExtractor` | OmniCam Extractor | `Majoor/OmniCam` | product, `is_experimental=True` |
| `MajoorOmniCamMonitor` | OmniCam Monitor | `Majoor/OmniCam` | product, `is_experimental=True` |
| `MajoorOmniCamH3Adapter` | OmniCam → Universal Reference & AI Prompts | `Majoor/OmniCam/Legacy` | **deprecated** (`is_deprecated=True`) |
| `MajoorOmniCamWanNativeCamera` | OmniCam → Wan Native Camera | `Majoor/OmniCam/Legacy` | **deprecated** |
| `MajoorOmniCamLTXCameraGuide` | OmniCam → LTX Camera Guide | `Majoor/OmniCam/Legacy` | **deprecated** |
| `MajoorOmniCamWanVideoWrapperATI` | OmniCam → WanVideoWrapper ATI | `Majoor/OmniCam/Legacy` | **deprecated** |

Seven nodes register. **Three** are the product surface (Director, Extractor,
Monitor); **four** are deprecated compatibility shims kept loadable for pinned
workflows, all in the `Legacy` sub-category with `is_deprecated=True`.

`node_list.json` matches (7 ids). `omnicam/nodes/adapters.py` additionally
*defines* `MajoorOmniCamWanATIAdapter`, `MajoorOmniCamATIPreview`,
`MajoorOmniCamLTXAdapter` and `MajoorOmniCamControlPasses`, but
`get_registered_nodes()` never returns them and `REGISTERED_NODE_IDS` never
lists them — see F-CODE-2.

### Director outputs (schema order)

`camera_track`, `proxy_video`, `audio`, `shot_collection`, `proxy_frames`.

### Extractor outputs

`camera_track`, `confidence`, `report`.

### Monitor outputs (schema order)

`reference_video`, `camera_prompt`, `cinematic_prompt`, `final_prompt`,
`camera_data_json`, `wan_camera`, `tracks`, `adapter_width`, `adapter_height`,
`adapter_length`, `guide_frames`, `adapter_profile_json`, `reference_frames`.

### Monitor `adapter` enum

`h3`, `h3_native`, `wan_native`, `wan_ati`, `wan_tracks_native`,
`ltx_motion_track`, `ltx` — **seven** values.

---

## 3. Documentation findings

Severity: **High** = a reader is actively misled about what ships;
**Medium** = stale or self-contradictory; **Low** = cosmetic / incomplete.

### F-DOC-1 — README presents deprecated nodes as the public surface — High

`README.md` `# Public Nodes` opens with *"OmniCam currently exposes six public
nodes"* and then gives four of the deprecated Legacy nodes their own
emoji-headed sections (`✨ Universal Reference & AI Prompts`, `🟣 OmniCam → Wan
Native Camera`, `🔵 OmniCam → LTX Camera Guide`, `🟠 OmniCam → WanVideoWrapper
ATI`) with no mention that they are `is_deprecated=True` and live under
`Majoor/OmniCam/Legacy`.

`README.md` `# Public Node Surface` then states the Registry release exposes
*"exactly"*:

```
1. OmniCam Director
2. Universal Reference & AI Prompts
3. OmniCam → Wan Native Camera
4. OmniCam → LTX Camera Guide
5. OmniCam → WanVideoWrapper ATI
```

This list **omits Extractor and Monitor entirely** and promotes three
deprecated nodes. It also contradicts the same file's own `# Product workflow`
section ("The three product nodes ... Extractor ... Director ... Monitor") and
`docs/NODES.md` ("trois nodes produit et quatre nodes de compatibilité").

Count is stated three ways in one file: "six public nodes", "exactly [five]",
and (Product workflow) "three product nodes".

**Fix (applied this pass):** one `## Node surface` section — 3 product nodes +
4 deprecated compatibility nodes — replacing both `# Public Nodes` and
`# Public Node Surface`. The deprecated adapters keep a short compatibility
subsection that points at Monitor.

### F-DOC-2 — `docs/VALIDATION_REPORT.md` is stale — Medium

* "import **all five public nodes**" — there is no five-node surface. CI imports
  the **seven** registered nodes and evaluates every schema (see
  `.github/workflows/test.yml`); the *product* surface is three.
* "ComfyUI 0.31.0 and current `master`" — README and NODES describe
  `v0.31.0` + `v0.34.0` as the two blocking stable lanes and `master` as a
  non-blocking canary. The report should name all three.
* Manual-checks list still contains *"Blender and Unreal export verification in
  their target applications"* — the DCC exporters were **removed from the
  shipped package** (`README.md` `# Known Scope`). Dead manual check.
* "Last updated: 20 August 2026" — bump on refresh.

**Fix (applied this pass):** rewritten against the current CI matrix and node
count; Blender/Unreal line removed.

### F-DOC-3 — `docs/SHORTCUTS.md` disagrees with `web-src/commands.js` — Medium

Verified against `dispatchDirectorKey` / `viewportKeymap` / `timelineKeymap` /
`sequenceKeymap`:

| SHORTCUTS.md says | Code actually does |
|---|---|
| `[` / `]` — set playback start/end | **No such key binding.** `setPlaybackRange()` is wired only to the two transport buttons in `web-src/event-bindings/transport-media.js`. |
| `Home` / `End` — first / last **frame** | In the timeline/graph zone `timelineKeymap` selects the first / last **keyframe** (`ui.selectKeyframe(ui.timelineKeyframes()[0])`). Only the *sequence* zone maps them to frame 0 / last frame. |
| `I` — insert / replace key | `I` **or `K`** insert / replace key. |
| (not documented) | `N` — toggle the Inspector panel. |
| (not documented) | `C`, or `Shift`+`` ` `` — toggle Fly mode. The doc never says how to *enter* Fly. |
| (not documented) | `Numpad 5` — toggle camera / perspective view. |
| (not documented) | `Numpad 9` — bottom view. |
| Numpad 0/1/3/7 only | plus `1` `2` `3` `4` (non-numpad) — component select mode vertex / edge / face / object. |
| Up / Down — prev / next key | plus `.` / `,` and `Shift`+`←` / `Shift`+`→` — same action. |
| (sequence zone absent) | `S` / `A` split / auto-split shot, `Delete` remove shot — only in the sequence editor zone. |

The file is also **entirely in French** while `README.md` links to it as
"Keyboard shortcuts and controls" and the rest of the docs are English.

**Fix (applied this pass):** rewritten in English, corrected against
`commands.js`, `[`/`]` moved to a "transport buttons" note, `Home`/`End`
split by zone.

### F-DOC-4 — `docs/NODES.md` language and internal drift — Medium

* Entire file is French; README and `web-src/help/` are English. The repo has
  no bilingual policy for `docs/` — pick one. (This pass: English.)
* Extractor intro says *"Le transport expose `TRACK` et `STOP`"* and *"deux
  vues"*, but the same file's job-state section lists `PAUSING`/`PAUSED`/
  `RESUME` and the routes section lists `/pause` and `/resume`, and README
  describes four transport controls and three tabs (`SOURCE` / `TRACK 3D` /
  `COMPARE`). The intro under-describes its own node.
* The "Interface density: Basic / Animation / Advanced" table is duplicated
  almost verbatim in `README.md` and `docs/NODES.md`. Keep one canonical copy
  (README) and cross-link.
* Accurate and worth keeping: the media-socket conversion table, the
  `shot_collection` output, the five adapter families table, the ATI
  resolution/visibility notes.

**Fix (applied this pass):** full English rewrite, Extractor transport section
reconciled with the routes, interface-density table replaced by a cross-link.

### F-DOC-5 — README Director output list is wrong order and omits one — Low

`README.md` `## 🎥 OmniCam Director` lists:

```
camera_track
proxy_video
proxy_frames  (an IMAGE twin of proxy_video ...)
audio
```

Schema order is `camera_track, proxy_video, audio, shot_collection,
proxy_frames`. `shot_collection` (an `MAJOOR_OMNICAM_SHOT_COLLECTION` of every
authored camera) is missing, and `audio` / `proxy_frames` are transposed.
`docs/NODES.md` has this right.

**Fix (applied this pass):** README list matches the schema.

### F-DOC-6 — `docs/SECURITY.md` has an orphan French paragraph — Low

Lines 79–81 ("Les previews VIDEO et les guides LTX ne materialisent pas le clip
complet…") are French in an otherwise English document, and duplicate the
English "bounded sampling" point already made in `## Managed model directory`.

**Fix (applied this pass):** translated and merged; the `master`-lane wording
in the same file aligned with README ("0.31.0 + 0.34.0 blocking, master
canary").

### F-DOC-7 — in-app help: Monitor adapter list incomplete — Low

`web-src/help/defs.js` → `MajoorOmniCamMonitor` → "Choosing an adapter" lists
`h3`, `wan_native`, `wan_ati`, `wan_tracks_native`, `ltx`. The node's `adapter`
combo (`omnicam/nodes/adapters.py` / `monitor.py`) also has **`h3_native`** and
**`ltx_motion_track`**. Two of seven adapters are undocumented in the help
popup.

**Fix (applied this pass):** both added, with the family they belong to.

### F-DOC-8 — example workflows: two are unloadable, all five use Legacy nodes — Medium

`examples/workflows/` (out of the rewrite scope you selected, reported for
completeness):

| Workflow | Uses | Problem |
|---|---|---|
| `01_minimax_h3_omni_reference.json` | `MajoorOmniCamH3Adapter` | deprecated node |
| `02_wan21_native_camera_plucker.json` | `MajoorOmniCamWanNativeCamera` | deprecated node |
| `03_wan21_ati_trajectory_control.json` | `MajoorOmniCamATIPreview`, `MajoorOmniCamWanVideoWrapperATI` | **`MajoorOmniCamATIPreview` is not registered** → workflow fails to load |
| `04_ltx_video_ic_lora_guide.json` | `MajoorOmniCamLTXCameraGuide` | deprecated node |
| `05_universal_cinematic_director.json` | `MajoorOmniCamControlPasses`, `MajoorOmniCamH3Adapter` | **`MajoorOmniCamControlPasses` is not registered** → workflow fails to load |

`examples/README.md` is also French. Recommend re-authoring all five around
`Director → Monitor` (Monitor covers H3, Wan native, ATI, Wan tracks, LTX
motion track and LTX guide in one node), which also removes the two broken
node references. Not done this pass (outside selected scope).

### F-DOC-9 — README "Public nodes" count in the shields badge — Low

The Version badge says `0.1.0` (matches `pyproject.toml`), the Python badge
says `3.10 | 3.12` (matches CI). No change needed; noted so the next version
bump touches `README.md:21` and `README.md:5` (`web/assets/omnicam-icon.svg`
path is correct).

---

## 4. Code / lint findings

### F-CODE-1 — `ruff check .` fails on current ruff — Medium

`requirements-dev.txt` pins only `ruff>=0.6`; CI runs a bare `ruff check .`
(`.github/workflows/test.yml:23`). On ruff 0.15.x this reports **11 findings**,
so the lint lane is red. The `pyproject.toml` comment claims the rule set is
pinned, but only the `select` *groups* are pinned — new rules inside `RUF` /
`S` / `B` still activate on a ruff upgrade.

Breakdown:

| Rule | Location | Nature |
|---|---|---|
| `RUF046` | `omnicam/core/motion_phases.py:186` | `int(round(...))` — `round()` with no ndigits already returns `int`. Safe source fix. |
| `RUF100` | `omnicam/extractor/backends/dpvo_worker.py:273` | `# noqa: BLE001` now unused (the `except Exception` there no longer trips BLE001). Safe source fix. |
| `I001` | `tests/test_extractor_dpvo_worker.py:3` | import block ordering. `ruff --fix`. |
| `S102` ×3 | `tests/test_wan_adapters.py`, `tests/test_wan_native_golden.py` | `exec()` of a sliced upstream module — deliberate parity harness. |
| `S301` | `tests/test_extractor_dpvo_worker.py:281` | `pickle.loads(pickle.dumps(...))` round-trip assertion — deliberate. |
| `B905` / `RUF007` ×2 each | `tests/test_motion_phases.py` | `zip(x, x[1:])` pairwise — style. |

**Fix (applied this pass):**
* `pyproject.toml` `[tool.ruff.lint.per-file-ignores]` `"tests/**"` gains
  `S102`, `S301`, `B905`, `RUF007` (consistent with the existing test-scoped
  `S101`/`S603`/`S607` rationale — test code is trusted).
* `motion_phases.py:186` — drop the redundant `int(...)`.
* `dpvo_worker.py:273` — drop the unused `noqa`.
* `tests/test_extractor_dpvo_worker.py` import sort via `ruff --fix`.

After these, `ruff check .` is clean. **Recommendation not applied (your
call):** also pin `ruff==<current>` in `requirements-dev.txt` so a future
upgrade is a deliberate PR, matching the file's stated intent.

### F-CODE-2 — unregistered node classes in `adapters.py` — Low

`MajoorOmniCamWanATIAdapter`, `MajoorOmniCamATIPreview`,
`MajoorOmniCamLTXAdapter`, `MajoorOmniCamControlPasses` are fully defined
`IO.ComfyNode` subclasses (~150 LOC) that nothing registers. Their ids appear
only in `LEGACY_NODE_IDS` (for Node Replacement id resolution).

If the classes are needed for the Node Replacement mechanism to resolve the old
`comfy_class`, that dependency is invisible — add a module docstring note. If
they are not (Node Replacement usually only needs the id string), they are dead
code and should move to git history like the Sequencer stack did. The two
broken example workflows in F-DOC-8 are the only things still referencing
`MajoorOmniCamATIPreview` / `MajoorOmniCamControlPasses`.

**Recommendation:** confirm intent, then either annotate or delete. Not changed
this pass (needs a maintainer decision).

### F-CODE-3 — `MajoorOmniCamWanATIAdapter` display category drift — Low

The unregistered `MajoorOmniCamWanATIAdapter` / `MajoorOmniCamATIPreview` /
`MajoorOmniCamLTXAdapter` / `MajoorOmniCamControlPasses` still declare
`category="Majoor/OmniCam/Adapters"` — a category no registered node uses
(registered ones are `Majoor/OmniCam` and `Majoor/OmniCam/Legacy`). Moot while
they are unregistered; fold into the F-CODE-2 decision.

### F-CODE-4 — `docs/` link target exists — no finding

`README.md` links `docs/NODES.md`, `docs/SHORTCUTS.md`, `docs/SECURITY.md`,
`docs/VALIDATION_REPORT.md`; all present. `pyproject.toml` `Documentation`
URL points at `.../tree/main/docs`. Consistent.

---

## 5. What was changed in this pass

Applied (safe, mechanical, or pure doc realignment):

* `README.md` — node-surface sections rewritten around 3 product + 4 deprecated
  nodes; Director output list fixed; shortcut table extended with Fly toggle.
* `docs/NODES.md` — rewritten in English, realigned, Extractor transport
  reconciled with routes, interface-density de-duplicated.
* `docs/SHORTCUTS.md` — rewritten in English, corrected against `commands.js`.
* `docs/VALIDATION_REPORT.md` — refreshed against current CI matrix and node
  count; dead Blender/Unreal check removed.
* `docs/SECURITY.md` — orphan French paragraph translated and merged; lane
  wording aligned.
* `web-src/help/defs.js` — Monitor adapter list completed (`h3_native`,
  `ltx_motion_track`).
* `pyproject.toml` — `tests/**` ruff ignores extended (`S102`, `S301`, `B905`,
  `RUF007`).
* `omnicam/core/motion_phases.py`, `omnicam/extractor/backends/dpvo_worker.py`,
  `tests/test_extractor_dpvo_worker.py` — the three `ruff` source/import nits.
* Screenshots: `tests/frontend/director-docs-mount.html` (a clean-fixture copy
  of `director-mount.html` — real names, three keyframes) and
  `tests/frontend/docs-screens.spec.js` capture the Director and Monitor images
  now embedded in `README.md` and `docs/NODES.md`. Committed under
  `docs/assets/`. `.gitignore` gained `!docs/AUDIT.md` and `!docs/assets/` (the
  repo ignores `docs/*` bar an allowlist).

Not applied (needs a maintainer decision):

* F-CODE-2 / F-CODE-3 — keep or delete the four unregistered adapter classes.
* F-DOC-8 — re-author the five example workflows around Director → Monitor
  (fixes the two unloadable ones); translate `examples/README.md`.
* F-CODE-1 recommendation — pin `ruff==` in `requirements-dev.txt`.

## 6. Re-run after this pass

```
pytest -q            # 642 passed, 8 skipped
ruff check .          # clean
npm run check         # pass
```
