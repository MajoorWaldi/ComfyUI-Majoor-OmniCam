"""USD (.usda) camera export.

USD is the interchange Maya, Houdini, Unreal and Blender all converge on, and
the ASCII flavour is plain text, so it needs no library at all.

Conventions:
  - USD cameras look down -Z with +Y up, matching OmniCam and glTF;
  - the aperture is stated explicitly (24mm high) so `focalLength` means the
    same millimetres the Lens card shows, instead of depending on the reader's
    default gate;
  - `clippingRange` and `shutter` come straight from the track.
"""

from __future__ import annotations

from ..core.track import OmniCamTrack
from .baking import SENSOR_HEIGHT_MM, bake_camera, is_static


def _vec(values) -> str:
    return "(" + ", ".join(f"{float(value):.6g}" for value in values) + ")"


def _quat(rotation) -> str:
    # USD writes quaternions real-part first, the opposite of glTF's [x,y,z,w].
    x, y, z, w = rotation
    return f"({w:.6g}, {x:.6g}, {y:.6g}, {z:.6g})"


def write_usda(track: OmniCamTrack, name: str = "OmniCam") -> str:
    samples = bake_camera(track)
    first = samples[0]
    fps = max(1, int(track.fps))
    aspect = max(1e-6, track.width / max(1, track.height))
    vertical_aperture = SENSOR_HEIGHT_MM
    horizontal_aperture = vertical_aperture * aspect
    ortho_vertical = first.ortho_half_height * 2.0 * 10.0
    ortho_horizontal = ortho_vertical * aspect
    static = is_static(samples)

    lines = [
        "#usda 1.0",
        "(",
        f'    defaultPrim = "{name}"',
        '    upAxis = "Y"',
        "    metersPerUnit = 1",
        f"    timeCodesPerSecond = {fps}",
        "    startTimeCode = 0",
        f"    endTimeCode = {max(0, len(samples) - 1)}",
        f'    doc = "Baked by ComfyUI-Majoor-OmniCam: one sample per frame at {fps} fps."',
        ")",
        "",
        f'def Xform "{name}"',
        "{",
        '    def Camera "camera"',
        "    {",
        f'        uniform token projection = "{"orthographic" if first.orthographic else "perspective"}"',
        # USD measures an orthographic aperture in scene units x10 (tenths of a
        # world unit), which is why the ortho branch scales rather than reusing
        # the 24mm film gate.
        f"        float horizontalAperture = {ortho_horizontal if first.orthographic else horizontal_aperture:.6g}",
        f"        float verticalAperture = {ortho_vertical if first.orthographic else vertical_aperture:.6g}",
        f"        float2 clippingRange = ({max(1e-4, first.near):.6g}, {max(first.near + 1e-3, first.far):.6g})",
        '        uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:orient"]',
    ]

    if static:
        lines += [
            f"        float focalLength = {first.focal_length:.6g}",
            f"        double3 xformOp:translate = {_vec(first.translation)}",
            f"        quatf xformOp:orient = {_quat(first.rotation)}",
        ]
    else:
        lines.append("        float focalLength.timeSamples = {")
        lines += [f"            {sample.frame}: {sample.focal_length:.6g}," for sample in samples]
        lines.append("        }")
        lines.append("        double3 xformOp:translate.timeSamples = {")
        lines += [f"            {sample.frame}: {_vec(sample.translation)}," for sample in samples]
        lines.append("        }")
        lines.append("        quatf xformOp:orient.timeSamples = {")
        lines += [f"            {sample.frame}: {_quat(sample.rotation)}," for sample in samples]
        lines.append("        }")

    lines += [
        "        custom int omnicam:durationFrames = " + str(track.duration_frames),
        "        custom int omnicam:width = " + str(track.width),
        "        custom int omnicam:height = " + str(track.height),
        f'        custom string omnicam:renderMode = "{track.render_mode}"',
        "    }",
        "}",
        "",
    ]
    return "\n".join(lines)
