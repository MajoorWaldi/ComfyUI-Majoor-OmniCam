# Viewport Quick Views and Selection Outline Design

**Date:** 2026-08-31  
**Status:** Approved  
**Scope:** Frontend viewport interaction only

## Objective

Improve shot-layout navigation and active-object readability with two focused
frontend changes:

1. expose Camera, Perspective, Front, Right, Top, and ISO views directly in the
   viewport, together with an interactive compact axis tripod;
2. render a light-purple silhouette around the active object without including
   it in playblasts or conditioning captures.

The canonical camera-track schema and backend behavior remain unchanged.

## Non-goals

This work does not include:

- adaptive shadow-frustum fitting;
- Outliner thumbnails or thumbnail caching;
- new backend routes or persistence;
- new global keyboard shortcuts;
- changes to the canonical camera-track contract;
- model-specific behavior.

## Architecture

The feature is divided into focused frontend modules that consume the existing
viewport/director state. Existing facade modules may wire these features into
the viewport, but view navigation and selection highlighting remain independent
responsibilities.

The quick-view controls update editor-view state only. They do not insert camera
keyframes or mutate the animated shot camera unless the existing Camera mode is
explicitly active. The outline is an interaction-only render layer and is not
part of the base scene render used for exported imagery.

No hand-written source file may exceed 800 lines. If an existing integration
file would cross that limit, it must delegate to a new focused module.

## Quick-view toolbar

The viewport displays six directly accessible controls in this order:

1. Camera
2. Perspective
3. Front
4. Right
5. Top
6. ISO

The active control uses a restrained purple state consistent with the selection
color. Controls expose accessible labels and tooltips. They remain usable at
narrow viewport widths by wrapping or collapsing without covering the axis
tripod.

The existing view selector may remain as the access point for Back, Left, and
Bottom, provided there is only one authoritative view-state transition path.

### View semantics

- **Camera:** display the current evaluated shot camera using existing behavior.
- **Perspective:** restore the saved free perspective editor view.
- **Front:** face the current editor target from the positive Z side.
- **Right:** face the current editor target from the positive X side.
- **Top:** face the current editor target from the positive Y side.
- **ISO:** use a stable isometric orientation with equal X/Z contribution and a
  conventional elevated Y angle, centered on the current editor target.

Switching between editor views preserves a useful framing distance or
orthographic scale. ISO is an editor view and must not change the shot camera,
camera track, current frame, or keyframes.

Editor-view state continues to survive workflow save and reload through the
existing serialized `editor_views` mechanism. Adding ISO must use a backward-
compatible default when older workflows do not contain an ISO entry.

## Compact axis tripod

The current top-right axis indicator becomes interactive while retaining the
established X/Y/Z colors and compact visual footprint.

- First click on **X** activates Right; a consecutive click on X flips to Left.
- First click on **Y** activates Top; a consecutive click on Y flips to Bottom.
- First click on **Z** activates Front; a consecutive click on Z flips to Back.
- Clicking the purple center frames the active selection using the existing
  framing behavior.
- Hovering an interactive target displays the destination view name.

The flip decision is based on the current view, not on an independent click
counter, so toolbar changes and restored workflows cannot desynchronize the
tripod. Pointer targets must be large enough to operate reliably without making
the visual tripod substantially larger.

Tripod actions are scoped to the active viewport and do not register global
shortcuts. Existing keyboard behavior remains unchanged.

## Selection silhouette

The active object receives one light silhouette outline:

- base color approximately `#A78BFA`;
- low glow/intensity suitable for a dark neutral viewport;
- stable apparent thickness at normal viewport resolutions;
- limited to the active object.

Secondary selected objects retain a quieter existing indicator. They do not
receive additional full silhouette passes, preventing visual clutter and
unnecessary GPU work.

The outline is implemented as a separate interaction render pass or overlay,
not by permanently modifying object materials. Selection changes update the
pass's selected-object set. Clearing selection disables the pass.

Unsupported object types or unavailable outline facilities must fall back to
the existing selection helper without breaking viewport rendering.

## Capture exclusion

The outline must never appear in:

- playblast frames;
- conditioning captures;
- other scene-only viewport exports.

The capture path renders the base scene without the interaction outline pass.
If the existing capture implementation shares the interactive renderer, capture
must enter a guarded scene-only mode and restore interaction rendering in a
`finally`-equivalent cleanup path, including after capture errors.

This exclusion is structural rather than timing-dependent: delaying capture or
briefly hiding a visible object is not sufficient unless restoration is
guaranteed.

## Lifecycle and performance

- View changes should respond within the existing 50 ms UI target.
- The outline pass renders only when an active supported object exists.
- Resizes update any outline render targets once through the existing resize
  lifecycle.
- Renderer resources, render targets, observers, tooltips, and event listeners
  introduced by these features are disposed with the viewport.
- No CDN or heavyweight runtime dependency is added.
- Existing WebGL fallback behavior remains functional when the outline feature
  cannot initialize.

## Validation

Automated tests should cover pure view-transition behavior:

- each toolbar view maps to the expected editor view;
- repeated X/Y/Z actions flip to the opposite orthographic view;
- changing view through another control resets the effective flip direction;
- ISO obtains a backward-compatible default and survives serialization;
- editor-view changes do not mutate the canonical camera track.

Manual viewport QA must verify:

- all six quick-view controls and active states;
- tripod clicks, opposite-view flips, tooltips, and center framing;
- workflow save/reload with ISO state;
- light-purple active-object silhouette on supported object types;
- secondary-selection readability;
- outline absence from playblast and conditioning captures;
- capture-error recovery restores the interactive outline;
- viewport resize and disposal do not leak UI or GPU resources;
- narrow viewport layout remains usable.

## Documentation

Update `README.md` if the viewport overview enumerates navigation controls, and
update `docs/SHORTCUTS.md` to describe the clickable quick views and tripod while
making clear that no new keyboard shortcut is introduced.

