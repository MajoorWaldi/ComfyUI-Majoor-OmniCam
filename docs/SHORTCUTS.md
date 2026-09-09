<p align="center">
  <img src="../web/assets/omnicam-icon.png" width="72" alt="Majoor OmniCam">
</p>

# OmniCam keyboard shortcuts and controls

Shortcuts are live only while the OmniCam viewport or timeline has focus. They
never capture the keyboard while you are typing into a field, and OmniCam
claims a key from ComfyUI only when it actually handles it
(`web-src/commands.js`). `Space` and `Enter` are also left alone when focus sits
on something that activates with them -- a button, a disclosure `summary`, an
outliner row or the axis gizmo -- so the panels stay keyboard-operable.

Keys are scoped to the zone the event came from: the **viewport** owns the
spatial keys, the **timeline / graph editor** own the temporal keys, and the
**sequence editor** owns its own. Only a small transport set (undo/redo,
copy/paste, duplicate, `Ctrl`/`Cmd`+`,` preferences, `Space`, `Escape`) fires from any zone.

## Viewport navigation

Every camera gesture has **at least two independent bindings, and none of the
primary ones needs `Alt`**. That is deliberate: `Alt` never reaches the page on
a number of real setups -- a Linux window manager that claims `Alt` + drag to
move windows, a desktop shell that opens its menu bar on `Alt`, or a keyboard
whose right `Alt` is `AltGr` (which reports `Ctrl`+`Alt`, not `Alt`). A viewport
whose only orbit lives behind `Alt` is simply not navigable there.

| Gesture | Primary (no `Alt`) | `Alt` aliases | Left button only |
|---|---|---|---|
| Orbit | Middle drag | `Alt` + left | `Ctrl`/`Cmd` + drag over empty space |
| Pan | `Shift` + middle | `Alt` + middle, `Alt`+`Shift` + left | `Ctrl`+`Shift` + drag over empty space |
| Dolly | `Ctrl`/`Cmd` + middle, mouse wheel | `Alt` + right (Maya), `Alt`+`Ctrl` + left | Mouse wheel |

The middle-button family is Blender's, needs no modifier at all, and is what
this node's timeline and curve editor already use to pan. The `Ctrl` + left
fallbacks are for hardware with no middle button; they only fire over **empty
space**, so multi-select (`Ctrl` + *click*, which reaches the picker first) is
untouched.

The profile chosen in the toolbar's **Navigation & Selection** menu (seeded per
node by *Settings → OmniCam → Navigation*) decides two things. Between **Maya**
and **Blender**, only whether `Alt` + right drag dollies (Maya) or does nothing
(Blender) — every other gesture above is identical in both. The third profile,
**Simple**, is mouse-only for people with no modifier keys or middle button:
left drag orbits, right drag pans, the wheel zooms. It has no viewport marquee
(a bare left drag orbits instead) and no viewport right-click menu (that button
pans); a bare left *click* still selects, and the modified Maya/Blender bindings
above stay available underneath it.

The same Settings panel exposes global navigation sensitivity for orbit, pan,
dolly drag, mouse-wheel zoom and fly speed. These are user preferences: changing
them affects interaction speed, not the saved camera path. *Settings -> OmniCam
-> Controls -> Enable OmniCam shortcuts* releases all OmniCam keyboard shortcuts
back to ComfyUI while leaving pointer navigation available.

`Alt`/`Option` always means navigation and never opens a menu: an
`Alt` + right drag dollies without the context menu appearing on release.
An orthographic view has no orbit to give, so every orbit gesture pans there
instead; an unmodified drag still starts a marquee, as in perspective.

Explicit navigation gestures preserve the current selection, even when started
over an object or gizmo. In Fly mode, a primary drag looks around in both
profiles. The status bar identifies Orbit, Pan, Dolly or Fly while starting a
navigation gesture. Pan uses the displayed viewport size and camera FOV; wheel
input is normalized for devices reporting pixels, lines or pages.

`F` fits all selected visible objects with a margin, accounting for the viewport
aspect ratio and orthographic zoom. Loaded geometry bounds are used when
available, with animated world transforms as the fallback.

`Escape` cancels the current drag or marquee. A click without movement does not
consume an undo step. Losing pointer capture cancels the gesture and clears its
cursor/capture state, so the next interaction starts cleanly.

| Control | Action |
|---|---|
| Mouse wheel | Dolly in / out |
| Double-click in the viewport | Place the camera target under the cursor |
| `F` or `Numpad .` | Frame the selection (or the target) |
| `A` or `Home` | Frame every visible object (Maya `A`, Blender `Home`) |
| `C`, or `Shift` + `` ` `` | Toggle Fly mode |
| `W` `A` `S` `D` `Q` `E` (Fly mode only) | Fly move; `Shift` flies faster |
| Mouse wheel (Fly mode) | Adjust fly speed |
| Axis tripod (top right) | Click an axis tip to snap to that orthographic view. Click again to flip. Click the purple center to frame selection. |
| Drag (Fly mode) | Look around; `Esc` or `C` exits Fly |
| `Numpad 0` | Active-camera view |
| `Numpad 1` / `Ctrl`/`Cmd` + `Numpad 1` | Front / back view |
| `Numpad 3` / `Ctrl`/`Cmd` + `Numpad 3` | Right / left view |
| `Numpad 7` / `Ctrl`/`Cmd` + `Numpad 7` | Top / bottom view |
| `Numpad 9` | Flip to the opposite view (half turn from a free view) |
| `Numpad 4` / `Numpad 6` | Orbit left / right by 15 degrees |
| `Numpad 8` / `Numpad 2` | Orbit up / down by 15 degrees |
| `Numpad 5` | Toggle camera / perspective view |
| `N` | Toggle the Inspector panel |

Outside Fly mode, `W` `Q` `E` deliberately carry no competing tool command.
`A` frames the scene outside Fly mode and strafes left inside it.

## Selection and transformation (viewport zone)

| Shortcut | Action |
|---|---|
| Click | Select an object |
| `Shift`/`Ctrl`/`Cmd` + click | Add / remove from the selection |
| Left drag in empty space | Marquee selection (both profiles) |
| Hold `Shift` when the marquee starts | Additive marquee |
| `B` | Box / marquee selection tool toggle |
| `Ctrl`/`Cmd` + `A` | Select all objects |
| `Alt` + `A` | Deselect all |
| `Ctrl`/`Cmd` + `I` | Invert object selection |
| `Ctrl`/`Cmd` + `,` | Open OmniCam Preferences dialog |
| `Shift` + `G` | Select the active object and all its descendants |
| `Shift` + `D` or `Ctrl`/`Cmd` + `D` | Duplicate selected object(s) (batch duplicate when multiple selected) |
| `H` / `Alt`+`H` | Hide or toggle selected object(s) (batch if multiple selected) / show all |
| `L` | Lock / unlock selected object(s) (batch if multiple selected) |
| `Delete` / `Backspace` | Delete selected object(s) (batch if multiple selected, spares subject) |
| `T` | Modal translate |
| `R` | Modal rotate |
| `S` | Modal scale |
| `X` `Y` `Z` during `T`/`R`/`S` | Constrain or release the axis |
| digits, `-`, `.` or `,` during `T`/`R`/`S` | Type an exact value |
| `Shift` during a transform | Precision movement |
| `Enter` or left click | Confirm the transform |
| `Escape` or right click | Cancel the transform |
| `Tab` | Toggle Object Mode / Component Mode |
| `1` `2` `3` `4` (not numpad) | Component select mode: vertex / edge / face / object |
| Draw Camera Path + LMB drag | Draw and commit a new camera trajectory in the current editor view |
| Continue Camera Path + LMB drag | Append a new segment from the active camera's last key |
| Draw / Continue Camera Path + RMB | Cancel the uncommitted path |
| Escape while drawing | Cancel the uncommitted path without using Undo history |
| LMB drag a keyframe control dot | Move that waypoint in 3D (view-facing plane) |
| LMB drag a cyan handle knob | Bend the path through the selected keyframe |
| RMB a keyframe dot → Handle Type | Auto Smooth / Aligned / Free / Corner |
| RMB a camera → Select whole path | Select every keyframe as one transform target |
| LMB a camera's path line (editor view) | Same — select the whole path |
| `T` / `R` / `S` with a path selected | Pick move / rotate / scale gizmo mode for the path |
| Arrows / `PageUp` `PageDown` with a path selected | Nudge the whole path one grid step (XZ / Y) |

While Draw / Continue Camera Path is armed, MMB / Maya `Alt` navigation is never
stolen by the mode: only plain LMB draws and RMB cancels. Drawing is laid on a
plane fixed at pointer-down — horizontal in top/bottom, Z-fixed in front/back,
X-fixed in left/right, the view-facing plane in perspective/iso. After
committing, the active camera's keyframes are editable spatial control points
with Bézier tangent handles (see NODES.md → Draw Camera Path → Reshaping the
curve), and the whole path can be moved / scaled / rotated as one via the gizmo.

The toolbar's **Transform space** (World / Local) applies to **Move only**.
Scale and Rotate always use the object's own axes, as Maya's own manipulators
do, because that is the only frame their stored data has: handle *N* writes
`size[N]` or `rotation[N]`, a size triple lives in the object's frame, and an
XYZ euler composes as `Rz*Ry*Rx` so `rotation[0]` is a turn about the object's
own X. Drawing those handles along world axes promised a transform the data
cannot perform -- a world scale shears, and a world rotation has to recompose
the euler -- so a cube turned 90 degrees on Z grew and spun about the axis next
to the one whose handle was grabbed.

`T`/`R`/`S` transform every selected object around their shared pivot. Locked
objects stay selectable but are not transformed. The toolbar's **Spatial Snap**
menu is independent of the timeline's temporal snapping: **Grid** snaps to the
configured step, **Vertex** snaps the selection pivot to a visible vertex, and
holding `Ctrl`/`Cmd` engages the grid temporarily.

## Animation and editing

| Shortcut | Action |
|---|---|
| `I` or `K` | Insert / replace a keyframe at the current frame |
| `Space` | Play / stop |
| `←` / `→` | Previous / next frame |
| `↑` / `↓`, `.` / `,`, or `Shift` + `→` / `Shift` + `←` | Previous / next keyframe |
| `Delete` / `Backspace` (timeline zone) | Delete the selected keyframe |
| `Ctrl`/`Cmd` + `C` / `V` | Copy / paste a keyframe |
| `Ctrl`/`Cmd` + `D` | Duplicate the selected object or camera |
| `Ctrl`/`Cmd` + `Z` | Undo (viewport history) |
| `Ctrl`/`Cmd` + `Shift` + `Z`, or `Ctrl`/`Cmd` + `Y` | Redo |

`Home` / `End` select the **first / last keyframe** in the timeline and graph
zones. In the sequence editor they jump to frame 0 / the last frame instead.

Playback in / out points are set with the two range buttons in the transport
bar (`web-src/event-bindings/transport-media.js`); there is no keyboard
shortcut for them.

## Extractor transport

When focus is inside the **OmniCam Extractor** timeline (and not in a text or
number field), its read-only transport uses the source-frame clock:

| Shortcut | Action |
|---|---|
| `Space` | Play / stop source playback |
| `←` / `→` | Previous / next frame |
| `Home` / `End` | First / last source frame |

The Extractor transport's previous/next-key buttons visit detected anomaly
frames first, then solved camera keyframes. Drag anywhere across its ruler,
solve-health band, or channel lanes to scrub; the fixed lane-label gutter is
not part of the scrub range.

In the Extractor 3D tab, `SCENE` is the orbitable path and frustum inspection
view. `CAMERA` is the solved camera at the current source frame; scene view
presets and Fit Track are disabled while it is active.

## Timeline and Curve Editor

| Control | Action |
|---|---|
| Click / drag the ruler or the timeline | Scrub frames |
| Click a channel diamond | Jump to that key and select it |
| Graph Editor / Dope Sheet tabs | Switch the lower-panel view |
| Drag a key | Move it in time |
| `Shift` + click | Add a key to the selection |
| `Shift` + drag in empty space | Marquee-select keys |
| `Alt`/`Option` + drag a key | Duplicate and move the key |
| Mouse wheel | Time zoom |
| Middle drag, or `Alt`/`Option` + drag | Pan |
| Drag a point or tangent | Change the value or the interpolation |

## Sequence editor (Advanced interface tier)

Active only when the sequence editor zone has focus:

| Shortcut | Action |
|---|---|
| `←` / `→` | Previous / next frame |
| `Home` / `End` | Frame 0 / last frame |
| `S` | Split the shot at the playhead (auto-split if there are no cuts yet) |
| `A` | Auto-split the whole timeline into shots |
| `Delete` / `Backspace` | Remove the shot under the playhead |

## Viewport chrome

The vertical rail left of the viewport holds the select tool, the
translate / rotate / scale gizmos, the four component select modes, frame-target
and the side-panel toggle. The pills at top-left choose the view and the active
camera; the top-right corner shows the zoom and the full-screen toggle, which
hides the panels down to the image alone.

Below that corner, the axis gizmo shows world orientation — X red, Y green,
Z blue. The axis pointing toward you carries its letter; the one pointing away
is a dimmed dot. It is an SVG overlay, not a WebGL pass, so it never appears in
the playblast, which stays a neutral motion reference.

Two panels resize by drag: the handle under the **Outliner** list grows the
visible object list (the node grows with it), and the splitter between the
**camera previews** and the **timeline** trades width between them. Both are
`role="separator"` and keyboard-operable — arrow keys nudge, `Shift`+arrow
takes a larger step, `Home` or a double-click resets. The sizes serialize with
the workflow (`outliner_height`, `preview_width`).

## Mini-radar

*Display → 2D Radar Mini-Map* draws a top-down map at the bottom-right of the
viewport: every camera path (active one highlighted), the active camera's
position and view cone, the target, scene objects, trajectory keys and an
altitude dot coloured by height band. The scale adapts to keep the paths, the
## Viewport HUD & tool rail controls

- **Camera HUD & OSD**: Floating glassmorphic readout in Camera View showing lens focal length (`35mm`), field of view (`54.4°`), distance to subject (`Target: 4.2m`), and horizon roll reset button (`⮑ 0°`).
- **Camera Lock (`🔒` / `🔓`)**: Click the lock icon in the Camera HUD to freeze camera transforms and navigation, protecting your shot composition from accidental shifts.
- **World / Local Space Toggle (`W` / `L`)**: Switch the active transformation coordinate space directly on the vertical tool rail without opening menus.
- **Snapping Toggle (🧲)**: 1-click grid snapping toggle on the tool rail.
- **Quick Overlays Cluster**: Direct header toggle buttons for Floor Grid (⊞), Wireframe on Shaded Geometry, Backface Culling (Solid Interior / Single-Sided), Transform Gizmos (✛), Rule of Thirds Guides (#), Safe Areas (⊡), and 2D Radar (◎).
- **Shading Mode Selector**: Direct switch between Omni Ref, Graybox, Textured, Wireframe, Wireframe + Texture, Grid, and Beauty.
- **Fullscreen Floating Transport**: Glassmorphic player pill at the bottom of the viewport during fullscreen mode with step backward/forward, play/pause, timecode, and keyframe insertion (`I`).

## Inspector & Vector Scrubbing

- **Mouse Scrubbing**: Click and drag horizontally on any **X**, **Y**, or **Z** axis label in the Inspector or Outliner to smoothly increment or decrement values.
  - Hold `Shift` while dragging for fine precision (0.1x).
  - Hold `Ctrl` / `Cmd` for coarse adjustments (10x).
  - Creates a single grouped undo checkpoint upon release.
- **Quick Reset (`⟲`)**: Click the reset button next to Position, Target XYZ, Rotation, or Scale to restore default transforms.
- **Lens Presets**: Instant focal length buttons: `14mm`, `18mm`, `24mm`, `35mm`, `50mm`, `85mm`, `135mm`.
- **Near Presets**: Quick camera clipping presets: `0.001` (Interior / Close-up), `0.01` (Standard), `0.1` (Large scene / Exterior).
- **Sensor / Gate Presets**: Dropdown selection for standard camera formats: Full Frame 35mm, Super 35, Micro 4/3, 16:9 Digital Cinema, Mobile 9:16 Vertical.

## Outliner hierarchy & filter chips

- **Filter Chips**: Filter scene rows by category: `All`, `Cameras`, `Objects`, `Hidden`.
- **Collapsible Section Headers**: Toggle visibility of `Cameras (n)` and `Objects (n)` groups.
- **Parent/Child Tree Indentation**: Hierarchical nesting visualizes object `parent_id` relationships with subtle tree guide lines.
- **Entity Type Colors**: Color-coded type badges (Camera blue, Model purple, Card cyan, Primitive amber, Human emerald, Null slate).
- **Hover Quick Actions**: Direct buttons on rows for visibility toggle, lock/unlock, duplication, deletion, and context menus.
- **Alt+Click to Isolate**: Alt-click the visibility eye icon on any object to isolate it in the viewport, hiding all others. Alt-click again to restore previous scene visibility.

## Scene primitives & quick-bar

The Outliner quick-bar, toolbar, and viewport right-click menu provide instant one-click 3D staging primitives:

- **Card**: Media billboard plane oriented upright, ready for reference images or video textures.
- **Cube**: 1m³ reference bounding box.
- **Sphere**: 1m diameter spherical reference.
- **Cylinder**: 1m diameter, 2m high cylindrical column for architectural blocking and vertical pivots.
- **Torus**: Toroidal ring primitive (1m radius, 0.25m tube) for circular staging cues and orientation markers.
- **Human**: Authentic procedural **low-poly 3D human mannequin** (proportional head, neck, chest, pelvis, relaxed A-pose arms, and legs), grounded at $y = 0$ on the floor plane for accurate shot scale cues.
- **Null**: Empty 3D transform pivot for hierarchical parenting and camera target rigging.

## Shot panel & step navigation

- **Step Navigation**:
  - `◀` / `▶`: Jump to adjacent keyframe.
  - `-1f` / `+1f`: Nudge playhead by 1 frame.
  - Dual readout displaying both standard SMPTE timecode (`HH:MM:SS:FF`) and frame index.
- **12 Interpolation Modes**: `Ease`, `Smooth`, `Bezier`, `Linear`, `Ease In`, `Ease Out`, `Hold`, `Sine`, `Cubic`, `Quintic`, `Expo`, `Back`.
- **6 Bezier Tangent Modes**: `Auto`, `Clamped`, `Vector`, `Free`, `Aligned`, `Flat`.

## Camera Health & quality score

- **Trajectory Quality Score**: Header pill displays an overall score from 0-100% with letter grades (A: Optimal, B: Good, C: Caution, D: Critical).
- **Progress Gauge Bars**: Color-coded fill bars (green < 75%, amber 75-100%, red > 100%) against target model limits.
- **Per-Zone Direct Actions**: Jump to problem frame range or click the inline smooth button to blend flagged keys directly.

## Panel drag-resize & layout controls

- **Side Panel Width Resize (`side-resize`)**:
  - Drag the vertical bar between the 3D viewport and the right inspector panel to widen/narrow the side panel (min 200px, max 640px, default 280px).
  - Double-click resets to default.
  - Keyboard: `ArrowLeft` / `ArrowRight` (with `Shift` for larger steps), `Home` resets.
- **Graph Editor Height Resize (`graph-resize`)**:
  - Drag the horizontal bar at the bottom of the animation curve editor / dope sheet / sequence stage to expand or shrink the graph height (min 140px, max 720px, default 220px).
  - Double-click resets to default.
  - Keyboard: `ArrowUp` / `ArrowDown` (with `Shift` for larger steps), `Home` resets.
- **Outliner Height Resize (`outliner-resize`)**:
  - Drag the horizontal bar below the scene tree to resize the visible list.
- **Camera Previews Width Resize (`preview-resize`)**:
  - Drag the vertical splitter between camera previews and the timeline transport.
- **Tab & Panel Navigation**:
  - `ArrowLeft` / `ArrowRight` inside the tab strip (`.oc-side-tabs`) cycles between Outliner, Motion, Inspector, Shot, and Health tabs.
  - `ArrowLeft` / `ArrowRight` inside graph tabs cycles between Curves, Dope Sheet, and Sequence.
  - `ArrowUp` / `ArrowDown` inside the scene tree navigates through cameras and objects, scrolling items smoothly into view.
- **Smooth Scrolling & Sticky Headers**:
  - Outliner search, Add object dropdown, and category chips stick to the top while scrolling large scenes.
  - Shot panel transport/timecode bar sticks to the top while scrolling keyframe properties.
  - Health panel quality score banner remains anchored at top while reviewing problem zones.
  - Shift + Mouse Wheel or trackpad 2-finger horizontal swipe smoothly pans the timeline.

## Verification checklist

1. Create three centred objects, lock one, and multi-select.
2. Run `T X 2 Enter`, `R Z 45 Enter`, `S 1.5 Enter`, then Undo / Redo.
3. Test Grid and Vertex snapping without changing the timeline snap.
4. Test the additive marquee and `Shift`+`G` on a hierarchy.
5. Switch Maya / Blender / Simple and check orbit, pan and dolly in each
   profile. In Simple, confirm left drag orbits, right drag pans, the wheel
   zooms, a bare left click still selects, and no menu appears on right release.
6. Enter Fly with `C`, move with `W`/`A`/`S`/`D`/`Q`/`E`, exit with `Esc`.
7. Alt-drag over an object in Maya; check that the selection stays unchanged.
8. Frame two distant objects with `F` in perspective and front views, including
   a narrow viewport. Both objects must fit; Undo must restore the prior view.
9. Cancel a navigation drag and a Blender marquee with `Esc`; then start another
   drag. A stationary click followed by `Esc` must preserve the previous edit.
10. Compare pan at different display scales and wheel/trackpad zoom. Save and
    reload the workflow; the editor view and authored camera must survive.
