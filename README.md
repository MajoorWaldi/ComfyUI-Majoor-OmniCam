# Majoor OmniCam for ComfyUI

Majoor OmniCam is a camera layout and animation tool for ComfyUI. It lets you
prepare camera motion without running image or video generation while editing.

You can position cameras, create keyframes, preview motion, and record a simple
reference video for compatible video models.

## Main features

- orbit, pan, dolly, and free camera movement;
- timeline playback, keyframes, and animation curves;
- multiple cameras and simple scene objects;
- image, video, and 3D model imports;
- camera previews and playblast recording;
- outputs for MiniMax H3, Wan, ATI, and LTX workflows;
- camera export for Blender and Unreal.

## Installation

Place this folder in:

```text
ComfyUI/custom_nodes/ComfyUI-Majoor-OmniCam
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Restart ComfyUI. OmniCam nodes will appear under `Majoor / OmniCam`.

## Quick start

1. Add the **Majoor OmniCam Director** node.
2. Position the camera in the viewport.
3. Press `I` to create a keyframe.
4. Move to another frame and reposition the camera.
5. Press `I` again, then press `Space` to preview the motion.
6. Record a playblast and connect the appropriate adapter for your video model.

The playblast is a motion reference. Its visual appearance is not intended to
be copied into the final generated video.

## Documentation

- [Keyboard shortcuts and controls](docs/SHORTCUTS.md)
- [Node guide](docs/NODES.md)
- [File security and limits](docs/SECURITY.md)
- [Current validation status](docs/VALIDATION_REPORT.md)

## Compatibility

OmniCam does not modify ComfyUI core files. Compatibility with third-party
models depends on the versions of their installed custom nodes.

## License

MIT. Models and third-party custom nodes keep their own licenses.
