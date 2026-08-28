"""Camera interchange: glTF/GLB, USD ASCII and .chan, plus their readers."""

import json
import math
import struct

import pytest

from omnicam.core.camera_math import euler_from_quaternion, quaternion_from_euler
from omnicam.core.track import OmniCamTrack, sample_object_world_transform
from omnicam.exchange import EXPORT_FORMATS, export_camera, import_camera
from omnicam.exchange.baking import bake_camera, is_static
from omnicam.exchange.gltf_read import parse_container

BASE = {"camera_type": "perspective", "zoom": 1.0, "near": 0.05, "far": 5000.0}


def moving_track() -> OmniCamTrack:
    """A move that exercises everything the formats have to carry."""
    return OmniCamTrack.from_dict({
        "schema_version": 1, "fps": 30, "duration_frames": 24,
        "width": 1920, "height": 1080, "render_mode": "omni_ref",
        "keyframes": [
            {"frame": 0, "camera": {"position": [-4, 1.6, 5], "target": [0, 1, 0], "fov": 35, "roll": 0, **BASE},
             "interpolation": "smooth"},
            {"frame": 12, "camera": {"position": [0, 3.2, 6], "target": [0.5, 1, 0], "fov": 45, "roll": 12, **BASE},
             "interpolation": "smooth"},
            {"frame": 23, "camera": {"position": [4, 1.6, 5], "target": [0, 1, 0], "fov": 28, "roll": -8, **BASE},
             "interpolation": "smooth"},
        ],
    })


def worst_error(original: OmniCamTrack, restored: OmniCamTrack) -> dict[str, float]:
    """Largest per-frame disagreement, compared the way a viewer would see it."""
    worst = {"position": 0.0, "aim": 0.0, "fov": 0.0, "roll": 0.0}
    for frame in range(original.duration_frames):
        a, b = original.sample(frame), restored.sample(frame)
        worst["position"] = max(worst["position"], max(abs(x - y) for x, y in zip(a.position, b.position, strict=True)))
        # .chan carries no look-at distance, so aim is compared as a direction.
        da = [t - p for t, p in zip(a.target, a.position, strict=True)]
        db = [t - p for t, p in zip(b.target, b.position, strict=True)]
        la = math.sqrt(sum(v * v for v in da)) or 1.0
        lb = math.sqrt(sum(v * v for v in db)) or 1.0
        worst["aim"] = max(worst["aim"], max(abs(x / la - y / lb) for x, y in zip(da, db, strict=True)))
        worst["fov"] = max(worst["fov"], abs(a.fov - b.fov))
        worst["roll"] = max(worst["roll"], abs(((a.roll - b.roll + 180) % 360) - 180))
    return worst


# --------------------------------------------------------------------------
# The core-math bug the interchange work uncovered.
# --------------------------------------------------------------------------

@pytest.mark.parametrize("rotation", [[30, 40, 50], [0, 0, 0], [-19.9, -34.2, 24.3], [12, -5, 170], [0, 89.9, 0]])
def test_euler_and_quaternion_are_inverses(rotation):
    """They are named as an inverse pair, and object parenting relies on it.

    The old extraction read a ZYX sequence while the composer wrote XYZ, so the
    pair silently disagreed.
    """
    restored = euler_from_quaternion(quaternion_from_euler(rotation))
    a, b = quaternion_from_euler(rotation), quaternion_from_euler(restored)
    # A quaternion and its negation are the same rotation.
    assert all(abs(x - y) < 1e-6 for x, y in zip(a, b, strict=True)) or all(abs(x + y) < 1e-6 for x, y in zip(a, b, strict=True))


def test_identity_parent_leaves_a_child_rotation_untouched():
    """The user-visible symptom of the mismatch: [30,40,50] came back [48,-1,60]."""
    objects = [
        {"id": "parent", "position": [0, 0, 0], "rotation": [0, 0, 0], "size": [1, 1, 1], "keyframes": []},
        {"id": "child", "parent_id": "parent", "position": [0, 0, 0], "rotation": [30, 40, 50],
         "size": [1, 1, 1], "keyframes": []},
    ]
    world = sample_object_world_transform(objects, objects[1], 0)
    assert all(abs(a - b) < 1e-6 for a, b in zip(world["rotation"], [30, 40, 50], strict=True))


# --------------------------------------------------------------------------
# Baking
# --------------------------------------------------------------------------

def test_baking_produces_one_sample_per_frame():
    track = moving_track()
    samples = bake_camera(track)
    assert len(samples) == track.duration_frames
    assert [sample.frame for sample in samples] == list(range(track.duration_frames))
    assert samples[0].time == 0.0
    assert abs(samples[-1].time - (track.duration_frames - 1) / track.fps) < 1e-9


def test_a_still_camera_is_recognised_as_static():
    still = OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": 10,
        "keyframes": [{"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1, 0], **BASE}}],
    })
    assert is_static(bake_camera(still))
    assert not is_static(bake_camera(moving_track()))


# --------------------------------------------------------------------------
# Round trips
# --------------------------------------------------------------------------

@pytest.mark.parametrize(("fmt", "extension"), [("glb", ".glb"), ("gltf", ".gltf")])
def test_gltf_round_trip_is_lossless(fmt, extension):
    """glTF carries the canonical track in extras, so nothing is approximated."""
    track = moving_track()
    restored = OmniCamTrack.from_dict(import_camera(export_camera(track, fmt), extension))
    assert worst_error(track, restored) == {"position": 0.0, "aim": 0.0, "fov": 0.0, "roll": 0.0}
    assert restored.fps == track.fps
    assert restored.duration_frames == track.duration_frames
    assert (restored.width, restored.height) == (track.width, track.height)


def test_chan_round_trip_keeps_position_aim_fov_and_roll():
    """.chan has no look-at distance, so aim is only guaranteed as a direction."""
    track = moving_track()
    restored = OmniCamTrack.from_dict(
        import_camera(export_camera(track, "chan"), ".chan", fps=30, width=1920, height=1080))
    worst = worst_error(track, restored)
    assert worst["position"] < 1e-5
    assert worst["aim"] < 1e-6
    assert worst["fov"] < 1e-5
    assert worst["roll"] < 1e-5


# --------------------------------------------------------------------------
# Format shape
# --------------------------------------------------------------------------

def test_glb_container_is_well_formed():
    data = export_camera(moving_track(), "glb", "Shot")
    magic, version, total = struct.unpack("<III", data[:12])
    assert magic == 0x46546C67
    assert version == 2
    assert total == len(data), "the header length must match the file"
    assert len(data) % 4 == 0, "chunks are 4-byte aligned"
    document, buffer = parse_container(data)
    assert document["asset"]["version"] == "2.0"
    assert buffer, "an animated camera needs its sampler buffer"


def test_gltf_declares_a_standard_animated_perspective_camera():
    """Other applications read the node and animation, not our extras."""
    document = json.loads(export_camera(moving_track(), "gltf", "Shot").decode("utf-8"))
    camera = document["cameras"][0]
    assert camera["type"] == "perspective"
    assert math.degrees(camera["perspective"]["yfov"]) == pytest.approx(35.0)
    assert camera["perspective"]["aspectRatio"] == pytest.approx(1920 / 1080)
    paths = {channel["target"]["path"] for channel in document["animations"][0]["channels"]}
    assert paths == {"translation", "rotation"}
    assert all(sampler["interpolation"] == "LINEAR" for sampler in document["animations"][0]["samplers"])


def test_usda_is_time_sampled_and_states_its_aperture():
    text = export_camera(moving_track(), "usda", "Shot").decode("utf-8")
    assert text.startswith("#usda 1.0")
    assert "timeCodesPerSecond = 30" in text
    assert "endTimeCode = 23" in text
    # The gate is stated so focalLength means the same millimetres as the UI.
    assert "float verticalAperture = 24" in text
    for attribute in ("focalLength.timeSamples", "xformOp:translate.timeSamples", "xformOp:orient.timeSamples"):
        assert attribute in text


def test_chan_is_one_commented_line_per_frame():
    text = export_camera(moving_track(), "chan").decode("utf-8")
    body = [line for line in text.splitlines() if line and not line.startswith("#")]
    assert len(body) == 24
    assert len(body[0].split()) == 8, "frame + translation + rotation + fov"
    assert any("rotation order XYZ" in line for line in text.splitlines()), "the convention must be stated"


# --------------------------------------------------------------------------
# Failure modes
# --------------------------------------------------------------------------

def test_unknown_formats_are_refused_by_name():
    track = moving_track()
    with pytest.raises(ValueError, match="unsupported export format"):
        export_camera(track, "fbx")
    with pytest.raises(ValueError, match="unsupported export format"):
        export_camera(track, "obj")
    with pytest.raises(ValueError, match="unsupported import extension"):
        import_camera(b"", ".obj")


def test_import_rejects_files_without_a_camera():
    with pytest.raises(ValueError, match="no camera"):
        import_camera(json.dumps({"asset": {"version": "2.0"}, "nodes": []}).encode(), ".gltf")
    with pytest.raises(ValueError, match="no camera samples"):
        import_camera(b"# only comments\n\n", ".chan")


def test_chan_reader_tolerates_real_world_files():
    """Other tools emit comments, blank lines, commas and no fov column."""
    text = "# from a tracker\n\n0, 1, 2, 3, 0, 0, 0\n1 1 2 3 0 0 0\n"
    payload = import_camera(text.encode(), ".chan", fps=25)
    assert payload["fps"] == 25
    assert len(payload["keyframes"]) == 2
    assert payload["keyframes"][0]["camera"]["fov"] == 35.0


def test_every_declared_export_format_actually_writes_bytes():
    track = moving_track()
    for fmt, info in EXPORT_FORMATS.items():
        data = export_camera(track, fmt, "Shot")
        assert isinstance(data, bytes) and data, f"{fmt} produced nothing"
        assert info["extension"].startswith(".")
        if not info["binary"]:
            data.decode("utf-8")


# --------------------------------------------------------------------------
# Imported files are untrusted input.
# --------------------------------------------------------------------------

@pytest.mark.parametrize("token", ["nan", "inf", "-inf", "NaN", "Infinity"])
def test_chan_import_rejects_non_finite_values(token):
    """A bare NaN in the payload also serialises to invalid JSON downstream."""
    from omnicam.core.validation import ValidationError

    text = f"# hostile\n0 {token} 0 5 0 0 0 35\n"
    with pytest.raises(ValidationError, match="finite"):
        import_camera(text.encode(), ".chan")


def test_gltf_sidecar_is_validated_rather_than_trusted():
    """extras.omnicam.track is attacker-editable text like the rest of the file."""
    from omnicam.core.validation import ValidationError

    document = {
        "asset": {"version": "2.0"},
        "cameras": [{"type": "perspective", "perspective": {"yfov": 0.6}}],
        "nodes": [{"camera": 0}],
        "extras": {"omnicam": {"track": {
            "fps": 24, "duration_frames": 2, "width": 8, "height": 8, "render_mode": "omni_ref",
            "keyframes": [{"frame": 0, "camera": {"position": [float("inf"), 0, 0]}}],
        }}},
    }
    with pytest.raises(ValidationError, match="finite"):
        import_camera(json.dumps(document).encode(), ".gltf")


def test_imported_tracks_serialise_to_strict_json():
    """Response.json() refuses the bare NaN / Infinity tokens Python will emit."""
    payload = import_camera(export_camera(moving_track(), "chan"), ".chan", fps=30, width=1920, height=1080)
    text = json.dumps(payload)
    assert "NaN" not in text and "Infinity" not in text
    json.loads(text)  # strict parse, as a browser would


def test_import_clamps_a_hostile_sidecar_into_the_declared_limits():
    """Oversized values are repaired by the validator, not passed through."""
    from omnicam.core.validation import DEFAULT_LIMITS

    document = {
        "asset": {"version": "2.0"},
        "cameras": [{"type": "perspective", "perspective": {"yfov": 0.6}}],
        "nodes": [{"camera": 0}],
        "extras": {"omnicam": {"track": {
            "fps": 24, "duration_frames": 10**9, "width": 1280, "height": 720, "render_mode": "omni_ref",
            "keyframes": [{"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1, 0]}}],
        }}},
    }
    restored = import_camera(json.dumps(document).encode(), ".gltf")
    assert restored["duration_frames"] <= DEFAULT_LIMITS.max_duration_frames
