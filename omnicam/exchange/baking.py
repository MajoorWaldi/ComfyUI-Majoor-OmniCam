"""Turn an OmniCam track into per-frame camera samples for interchange.

Every exchange format here is *baked*: one sample per frame, at the track's own
fps. That is deliberate. OmniCam interpolates with ease / smooth / bezier /
hold, none of which have an equivalent in glTF (LINEAR, STEP, CUBICSPLINE),
USD (linear or held) or .chan (no interpolation at all). Writing only the
keyframes would hand the receiving application a different curve than the one
the animator authored and the playblast recorded.

Baking every frame makes the exported motion identical to what OmniCam
computed, at the cost of a larger file. For a shot-layout tool that trade is
the right way round: fidelity to the authored move is the whole point.
"""

from __future__ import annotations

from dataclasses import dataclass

from ..core.camera_math import camera_quaternion, euler_from_quaternion, fov_to_focal_length
from ..core.track import OmniCamTrack

# The reference gate OmniCam uses everywhere for "35mm equivalent". The track's
# fov is vertical, so the matching reference is the 24mm gate height.
SENSOR_HEIGHT_MM = 24.0


@dataclass(frozen=True)
class CameraSample:
    """One frame of camera motion, in the conventions interchange formats want."""

    frame: int
    time: float
    """Seconds from the start of the track."""
    translation: list[float]
    rotation: list[float]
    """Quaternion as [x, y, z, w], the ordering glTF and USD both use."""
    euler: list[float]
    """XYZ Euler in degrees, for the text formats that cannot take a quaternion."""
    orthographic: bool
    """OmniCam supports an orthographic camera; glTF and USD both have one too."""
    ortho_half_height: float
    """Half the visible height in world units, matching projection.py's 5 / zoom."""
    vertical_fov: float
    focal_length: float
    """Millimetres on a 24mm-high gate."""
    near: float
    far: float


def bake_camera(track: OmniCamTrack) -> list[CameraSample]:
    """Sample `track` once per frame. Never empty: a track always has one frame."""
    fps = max(1, int(track.fps))
    samples: list[CameraSample] = []
    for frame in range(max(1, int(track.duration_frames))):
        camera = track.sample(frame)
        quaternion = camera_quaternion(camera.position, camera.target, camera.roll)
        rotation = [quaternion["x"], quaternion["y"], quaternion["z"], quaternion["w"]]
        fov = float(camera.fov)
        samples.append(CameraSample(
            frame=frame,
            time=frame / fps,
            translation=[float(value) for value in camera.position],
            rotation=rotation,
            euler=euler_from_quaternion(rotation),
            orthographic=camera.camera_type == "orthographic",
            ortho_half_height=5.0 / max(0.01, float(camera.zoom)),
            vertical_fov=fov,
            focal_length=fov_to_focal_length(fov, SENSOR_HEIGHT_MM),
            near=float(camera.near),
            far=float(camera.far),
        ))
    return samples


def is_static(samples: list[CameraSample], epsilon: float = 1e-6) -> bool:
    """True when nothing moves, so a writer can emit a single pose instead of a curve."""
    if len(samples) < 2:
        return True
    first = samples[0]
    return all(
        all(abs(a - b) <= epsilon for a, b in zip(first.translation, sample.translation, strict=True))
        and all(abs(a - b) <= epsilon for a, b in zip(first.rotation, sample.rotation, strict=True))
        and abs(first.vertical_fov - sample.vertical_fov) <= epsilon
        for sample in samples[1:]
    )
