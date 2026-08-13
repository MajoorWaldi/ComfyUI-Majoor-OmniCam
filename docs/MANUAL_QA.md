# Manual QA Checklist

## Install / node discovery

- [ ] Put folder under `ComfyUI/custom_nodes/ComfyUI-Majoor-OmniCam`.
- [ ] Start current ComfyUI with no import errors from OmniCam.
- [ ] Search for `Majoor OmniCam Director`.
- [ ] Confirm all 15 nodes appear under `Majoor/OmniCam`.
- [ ] `GET /majoor/omnicam/health` returns API version 2.

## Viewport

- [ ] Node opens without changing other ComfyUI shortcuts.
- [ ] At graph zoom 65%, drag inside the viewport: the OmniCam camera moves and the Director node/global graph does not.
- [ ] Drag on the global ComfyUI canvas outside the Director: the OmniCam camera does not move.
- [ ] Wheel inside the viewport dollies the OmniCam camera without zooming the global graph.
- [ ] Orbit works.
- [ ] Shift+drag pans.
- [ ] Wheel dollies.
- [ ] WASD/QE moves only while OmniCam is active.
- [ ] `F` frames subject.
- [ ] Camera speed changes WASD/QE movement distance.
- [ ] Reset Camera restores the default view.
- [ ] Perspective/Orthographic switching updates the viewport and survives keyframing.
- [ ] FOV and roll update preview.
- [ ] Resize does not corrupt canvas.
- [ ] WebGL grid/cards/path remain sharp and Canvas fallback is usable when WebGL is disabled.
- [ ] Guides and burn-in can be toggled independently.
- [ ] Speed map colors slow-to-fast camera path segments without changing the track.

## Keyframes / serialization

- [ ] Insert key at frame 0.
- [ ] Move camera and insert key at frame 48.
- [ ] Confirm every key is visible as a diamond on the graduated timeline and the playhead matches the current frame.
- [ ] Select a key: it is yellow. Orbit/pan/dolly/fly once: it turns red while editing, updates, then returns to blue and is not rewritten by later moves.
- [ ] Enable Auto Key, move the camera on an empty frame, and confirm a key is created at the playhead with an orange viewport border.
- [ ] Click a key and verify the selected-key inspector shows its frame, interpolation, position, target, FOV, roll, zoom and camera type.
- [ ] Edit those fields and verify the viewport and serialized key update immediately.
- [ ] Scrub frames and verify interpolation.
- [ ] Drag a keyframe to a free frame and verify its camera state is preserved.
- [ ] Drag the timeline background to scrub continuously; use Left/Right to step and `,`/`.` to jump between keys.
- [ ] Copy a keyframe and paste it at another frame.
- [ ] With the Director focused, verify `I`, Space, Delete/Backspace and Ctrl/Cmd+C/V act on OmniCam without moving/deleting the Comfy node or entering global canvas pan mode.
- [ ] Focus a numeric/select field and verify OmniCam shortcuts do not fire while editing.
- [ ] Verify `Scene`, `Camera`, `Show` and `Output` menus are mutually exclusive and close on outside click, the Camera menu lists `Camera N · Key FN`, and transport/key actions appear only once in the timeline.
- [ ] Save workflow.
- [ ] Reload workflow.
- [ ] Camera track/keyframes remain identical.

## Proxy scene

- [ ] Load image card.
- [ ] Load short video card.
- [ ] Add cube/sphere/human/null.
- [ ] Toggle objects.
- [ ] Alt-click removes non-subject primitive.
- [ ] Test all proxy render modes.
- [ ] Add and select multiple cards; edit position and scale in the inspector.
- [ ] Import GLB, OBJ, FBX, STL and PLY samples and verify their managed references survive workflow reload.
- [ ] Import an animation-only FBX and verify its normalized skeleton is visible and changes pose while scrubbing the timeline.
- [ ] Select Camera, lower Near Clip and verify nearby geometry remains visible; verify Far Clip remains greater than Near Clip after invalid input.
- [ ] Toggle Show > Playblast Grid and verify the grid is included only when enabled; add a Ground object and verify T/R/S and workflow restore.
- [ ] Click visible object surfaces (not only their origins), select them, then move/rotate/scale with T/R/S in Perspective and every orthographic view.
- [ ] Insert two object transform keys, scrub the interpolated motion, drag Position/Rotation/Scale points in the Curve Editor, then save/reload the workflow.
- [ ] Switch an imported textured model between Textures, Checker, Neutral and Wireframe without losing its original material.
- [ ] Navigate Perspective/Top/Right/Left/Bottom and verify the animated camera is unchanged, the large Editor View fills the scene area, its grid no longer ends near the subject, and the compact multiview strip can be hidden/restored.
- [ ] Add Camera 2 and Camera 3 and verify three adjacent monitors appear below the Editor View without covering it. Animate different keys, click Camera 3's monitor, and verify its gold output border, `camera_track`, `camera_info` and recorded proxy all use Camera 3. Double-click Camera 2's monitor and verify its timeline becomes editable without changing the selected playblast camera.
- [ ] Import animated FBX/GLB files, select available clips in the viewport HUD, scrub and confirm the same pose appears in the playblast.
- [ ] Select Camera and objects from the Scene HUD and by clicking object origins; verify `T`, `R`, `S` and all numeric transforms.
- [ ] Drag Position/Target/Lens curve points and verify Linear, Smooth, Bezier, Ease In, Ease Out and Ease In/Out segment shapes.
- [ ] Change Duration and FPS from both the node widgets and timeline HUD; verify final frame, scrub range, ruler ticks, keys and curves update immediately.
- [ ] Test X/Y/Z translate, rotate and scale gizmos in world and local space.
- [ ] Alt-drag the selected object's origin and verify screen-plane translation.
- [ ] Verify fit, fill and stretch modes.
- [ ] Connect batched upstream `IMAGE` and `VIDEO`; queue upstream and switch the multi-item reference selector.

## Playblast

- [ ] Generate 5 s / 24 fps proxy.
- [ ] File appears under `ComfyUI/input/omnicam/playblasts`.
- [ ] Queue workflow.
- [ ] Director outputs both a valid ComfyUI `VIDEO` and its decoded `IMAGE` frames.
- [ ] H3 adapter passes the video through.
- [ ] H3 Setup creates the adapter and current core H3 node when installed.
- [ ] Confirm WebCodecs produces a frame-stepped WebM whose duration/frame count matches the timeline.
- [ ] Confirm recorded frames contain no floor grid, composition guides, camera path/key cameras, gizmo or speed map.
- [ ] Disable WebCodecs mode and confirm the realtime MediaRecorder fallback still uploads.

## Wan / LTX / sequence

- [ ] Native Wan node connects to `WanCameraImageToVideo` through `WAN_CAMERA_EMBEDDING`.
- [ ] Pinned WanVideoWrapper ATI node accepts the generated `tracks` string without editing.
- [ ] ATI preview overlays visible trajectories on an input image.
- [ ] LTX Camera Guide connects its frames to the pinned `LTXVAddVideoICLoRAGuide` workflow.
- [ ] Sequence Builder preserves names, handles, references and per-shot settings.
- [ ] Sequence Shot extracts the requested track; manifest lists recorded playblasts.

## Export

- [ ] Blender exporter writes `.blender.py` and JSON.
- [ ] Blender script creates camera when run in supported Blender version.
- [ ] Unreal exporter writes bootstrap script + JSON.
- [ ] Blender round trip exports canonical JSON after editing the camera.
- [ ] Unreal 5.3–5.6 script creates a Level Sequence with transform and focal keys.

## Browser / packaging

- [ ] Current Chrome/Chromium browser.
- [ ] Enable Nodes 2.0, save/reload the workflow, interact with the viewport, then toggle back to legacy nodes and to Nodes 2.0.
- [ ] ComfyUI Desktop Windows Chromium.
- [ ] No console errors after deleting an OmniCam node.
- [ ] No stale keyboard handlers after node removal.
