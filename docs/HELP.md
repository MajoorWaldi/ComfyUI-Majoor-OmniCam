# OmniCam help

Use **Majoor OmniCam Director** as a small shot-layout tool:

1. Connect optional batched images/video and choose a reference, add a managed media card, or import a managed GLB/OBJ/FBX/STL/PLY scene. Alembic ABC must first be converted to one of these browser-supported formats.
2. Compose frame 0 and press `I` while focus is inside the Director.
3. Scrub or drag the timeline playhead, move the camera, and press `I` again.
4. Press Space to preview, then encode a deterministic playblast.
5. Queue the node to expose the versioned track and Comfy `VIDEO`.

The default `omni_ref` proxy deliberately looks simple. It communicates camera direction, parallax, scale and timing; it is not a beauty render. Disable burn-in for final model references unless diagnostic text is useful.

Use the native Wan node for core Plücker conditioning, the pinned WanVideoWrapper node for ATI, and the LTX Camera Guide for the current IC-LoRA route. Keep downstream model settings outside the Director.

If capture is unavailable, camera authoring and track outputs continue to work. Check the browser console, `/majoor/omnicam/health`, managed input permissions, and `docs/MANUAL_QA.md`.

Select Translate, Rotate or Scale in the object inspector and drag a colored X/Y/Z handle. World/local space is selectable; Alt-dragging the origin retains screen-plane translation.

The timeline diamonds show every camera key. Click one to select and load it, drag it to retime, or edit its frame, interpolation, position, target, FOV, roll, zoom and projection in the selected-key inspector. Arrow keys step frames; `,` and `.` jump between keys; Delete/Backspace removes the selected key; Ctrl/Cmd+C and Ctrl/Cmd+V copy it to the playhead. These shortcuts are scoped to the Director and are ignored while typing in a field.

Use the compact top menus for `Scene` objects/imports, `Camera` keys and lens settings, `Show` overlays/proxy appearance, and `Output` encoder/H3 settings. Menus close when focus moves elsewhere. **Playblast Record** and **H3 Setup** remain directly accessible at the upper-left of the viewport. Timeline transport and key commands use the same compact icon pattern as ComfyUI Load3D + Animation.

A key is yellow when selected, red during its next camera edit, then blue and disarmed when that interaction ends or another area is clicked. **Auto Key** creates or replaces the key at the current frame whenever the camera changes. The viewport has a red edit border and an orange Auto Key border.

Imported scenes are automatically centered, grounded and normalized for the layout viewport; use the Scale gizmo afterward for shot-specific sizing. An FBX containing animation bones but no mesh is shown as an animated skeleton and reports `animation only: … bones, no mesh`. To see a textured character, export/download the FBX with its skin/mesh or import the matching character model separately.

FBX and GLB animation clips are listed on the selected object in the viewport HUD and are sampled from the OmniCam timeline, including deterministic playblast encoding. The Scene HUD lists the camera and all objects; select an item there or click an object's origin in the viewport. For an object, `T`, `R`, and `S` activate Translate, Rotate, and Scale while the numeric transform fields remain directly editable. Select Camera to edit `Near Clip` and `Far Clip`; lower Near Clip when nearby geometry disappears, while keeping Far Clip greater than Near Clip.

Objects can be selected directly on their rendered geometry. Press `I` with an object selected to insert or replace its Position/Rotation/Scale key at the playhead; Auto Key also records gizmo and numeric HUD edits. The Curve Editor follows the active Camera or object and exposes the corresponding transform channels. The material selector offers original `Textures`, `Checker`, `Neutral`, and `Wireframe` inspection modes; imported GLB/FBX materials remain the default when textures are available.

The viewport selector provides `Camera`, independent `Perspective`, and `Top`, `Right`, `Left`, `Bottom` orthographic layout views. Moving an editor view never changes an animated camera. The large Editor View remains the complete scene-layout surface. Its floor grid extends across the working space instead of ending near the subject. A compact multiview strip is docked immediately below it and can be hidden or restored with the camera-view button.

Use `Camera > Add Camera` to create another independently animated camera. Every camera automatically receives its own monitor in the multiview strip: Camera 1, Camera 2, Camera 3, and so on. Select a camera in the Scene HUD or Camera menu before editing its keys and curves. Click a monitor, or use `Output > Playblast camera`, to choose the camera exported to the playblast, `camera_track`, `camera_info`, and adapters. Double-click a monitor to edit that camera. The gold monitor border and filled dot in the Scene HUD mark the output camera.

The Curve Editor displays Position XYZ, Target XYZ, or FOV/Roll/Zoom. Click or drag a key point to select and change its value, then choose Linear, Smooth, Bezier, Ease In, Ease Out, or Ease In/Out for the outgoing segment. Changing Duration or FPS in the timeline immediately updates its frame range, scrubber, rulers, playhead and curve width. During Playblast Record, OmniCam removes composition guides, camera path, key cameras, transform gizmo and speed overlay. Enable `Show > Playblast Grid` to record the grid, independently from the editor display; an explicitly enabled burn-in remains available. `Scene > Objects > Ground` adds a selectable, transformable ground slab to the scene.
