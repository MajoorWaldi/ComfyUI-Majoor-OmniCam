# Product Specification — Majoor OmniCam

Implementation note (0.3.0): this document defines product behavior. Current checked implementation and remaining external validation gates are tracked in `ROADMAP.md` and `VALIDATION_REPORT.md`.

## 1. Product statement

Majoor OmniCam is a camera-layout and camera-conditioning authoring environment embedded directly in ComfyUI.

Its job is not to render final imagery. Its job is to let a user **direct a camera visually**, then emit reusable signals that video-generation models can understand.

## 2. Problem

Modern video models increasingly support reference video, trajectories, structural controls and explicit camera logic, but ComfyUI users often lack a unified place to author the camera itself.

Typical workarounds require:

- Blender or Unreal just to create a camera proxy;
- manually typed camera prompts;
- drawing trajectories in model-specific editors;
- different tools for every model family.

This creates unnecessary context switching and makes camera intent hard to reuse.

## 3. Product goals

### Primary goal

Create a small but serious shot-layout tool in ComfyUI that can author and preview camera motion without running an AI model.

### Secondary goals

- produce H3 Omni Reference camera proxy videos;
- translate a camera track into ATI-compatible trajectory information;
- expose camera intrinsics/extrinsics for LTX and future models;
- export the same shot to DCCs;
- make camera authoring portable across workflows and models.

## 4. Non-goals

OmniCam is not intended to become:

- a full 3D DCC;
- a mesh modeler;
- a material editor;
- a character animation package;
- a final renderer;
- a replacement for Blender/Unreal.

The design should stay focused on **camera, spatial proxies and conditioning**.

## 5. Core user story

> I load an image or video card representing my subject, position it in a simple 3D scene, navigate with a camera, insert keyframes with `I`, preview the shot, generate a neutral playblast, and send that playblast directly to an Omni Reference video input.

## 6. Main node: Majoor OmniCam Director

### Viewport

- perspective camera;
- optional orthographic mode later;
- grid;
- point/depth field;
- proxy primitives;
- subject card;
- camera path;
- frame guides later.

### Navigation

- orbit;
- pan;
- dolly;
- fly navigation;
- frame target;
- reset camera;
- adjustable speed later.

### Timeline

- frame-based timeline;
- arbitrary duration;
- fps setting;
- camera keyframes;
- interpolation modes;
- keyframe delete/replace;
- playback.

### Camera parameters

- position;
- target;
- FOV;
- roll;
- projection type;
- zoom;
- near/far.

Future camera parameters:

- focal length / sensor width abstraction;
- aperture metadata;
- focus distance;
- shutter metadata;
- camera shake layers;
- lens breathing;
- dolly-zoom constraint.

## 7. Scene proxies

### MVP

- image/video card;
- cube;
- sphere;
- human proxy;
- null/target;
- floor grid;
- point field.

### Extended proxies

- managed GLB import is implemented; broader GLTF/OBJ/FBX/STL interoperability remains future work;
- depth cards;
- billboard vs world-oriented cards;
- multiple cards;
- collision-free camera gizmos;
- safe-frame overlays.

## 8. Render modes

### Omni Ref

Default conditioning mode. Prioritize parallax and camera readability.

Components:

- subject card;
- floor grid;
- sparse 3D points;
- optional proxy primitives;
- neutral background;
- minimal visual noise.

### Card + Grid

Most direct H3 reference mode.

### Graybox

Simple geometry plus subject proxy.

### Grid

Useful for pan/tilt/roll and global perspective motion.

### Point Field

Useful for depth/parallax and more abstract camera transfer.

### Wireframe

Useful when explicit scene geometry exists.

## 9. Outputs

### `MAJOOR_OMNICAM_TRACK`

Canonical model-independent camera data.

### `VIDEO`

Proxy/playblast.

### `LOAD3D_CAMERA`

Compatibility camera snapshot with current ComfyUI 3D ecosystem.

### JSON

Portable/debuggable version of the canonical track.

## 10. Adapter nodes

- OmniCam → MiniMax H3 Omni Reference
- OmniCam → Wan ATI Bridge
- OmniCam → LTX Camera Bridge
- OmniCam → Blender Export
- OmniCam → Unreal Export

Future:

- camera-conditioned open video models;
- MotionCtrl-style adapters;
- depth/pose/canny proxy generation;
- multi-shot camera sequencer.

## 11. UX target

The mental model should be:

> “Layout a shot, not configure a node.”

The node should therefore spend most of its visual area on the viewport and timeline, not dozens of standard Comfy widgets.

## 12. Success criteria

A user who knows basic 3D camera navigation should be able to author a 5-second orbit shot and produce an H3 camera-reference playblast without opening Blender.
