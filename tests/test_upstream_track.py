"""Precedence between a connected Extractor and the Director's own edits."""

import pytest

from omnicam.core.upstream_track import (
    UPSTREAM_METADATA_KEY,
    imported_fingerprint,
    resolve_director_camera_track,
    should_adopt_upstream,
    upstream_fingerprint,
)
from omnicam.core.validation import ValidationError

BASE_CAMERA = {"fov": 35.0, "roll": 0.0, "camera_type": "perspective", "zoom": 1.0,
               "near": 0.01, "far": 10000.0}


def camera(position, target=(0.0, 1.0, 0.0)):
    return {"position": list(position), "target": list(target), **BASE_CAMERA}


def director_state(*, imported=None, objects=None, keyframes=None):
    metadata = {"camera_id": "camera_1", "card_asset": "subject.png"}
    if imported:
        metadata[UPSTREAM_METADATA_KEY] = {"fingerprint": imported}
    return {
        "schema_version": 1, "fps": 24, "duration_frames": 48,
        "width": 1280, "height": 720, "render_mode": "omni_ref",
        "keyframes": keyframes if keyframes is not None else [
            {"frame": 0, "camera": camera([0, 1, 5]), "interpolation": "ease"},
        ],
        "objects": objects if objects is not None else [
            {"id": "subject", "type": "card", "name": "Subject", "position": [0, 1, 0],
             "rotation": [0, 0, 0], "size": [2, 2, 0.01], "material_mode": "textured",
             "keyframes": []},
        ],
        "metadata": metadata,
    }


def extractor_track(fingerprint="abc123", fps=30, duration=90, fov=53.0):
    return {
        "schema_version": 1, "fps": fps, "duration_frames": duration,
        "width": 1920, "height": 1080, "render_mode": "omni_ref",
        "keyframes": [
            {"frame": 0, "camera": {**BASE_CAMERA, "fov": fov, "position": [0, 0, 0],
                                    "target": [0, 0, -1]}, "interpolation": "linear"},
            {"frame": 60, "camera": {**BASE_CAMERA, "fov": fov, "position": [0, 0, -3],
                                     "target": [0, 0, -4]}, "interpolation": "linear"},
        ],
        "objects": [],
        "metadata": {"source": "omnicam_extractor", "backend": "dpvo", "confidence": 0.94,
                     "monocular_scale": True, "extractor_fingerprint": fingerprint},
    }


def resolve(local, upstream, **overrides):
    settings = {"width": 1280, "height": 720, "render_mode": "omni_ref"}
    settings.update(overrides)
    return resolve_director_camera_track(local_track=local, upstream_track=upstream, **settings)


# ---------------------------------------------------------------------------
# Precedence
# ---------------------------------------------------------------------------

def test_no_upstream_uses_local_director_track():
    local = director_state()
    resolved = resolve(local, None)
    assert resolved["keyframes"] == local["keyframes"]
    assert UPSTREAM_METADATA_KEY not in resolved["metadata"]


def test_unimported_upstream_fingerprint_uses_upstream_camera_motion():
    resolved = resolve(director_state(), extractor_track())
    assert [key["frame"] for key in resolved["keyframes"]] == [0, 60]
    assert resolved["fps"] == 30
    assert resolved["duration_frames"] == 90
    assert resolved["metadata"][UPSTREAM_METADATA_KEY]["fingerprint"] == "abc123"
    assert resolved["metadata"][UPSTREAM_METADATA_KEY]["backend"] == "dpvo"


def test_matching_imported_fingerprint_preserves_local_camera_edits():
    edited = director_state(imported="abc123", keyframes=[
        {"frame": 0, "camera": camera([9, 9, 9]), "interpolation": "ease"},
    ])
    resolved = resolve(edited, extractor_track(fingerprint="abc123"))
    assert resolved["keyframes"][0]["camera"]["position"] == [9.0, 9.0, 9.0]
    assert resolved["fps"] == 24, "a matched fingerprint must not re-adopt upstream timing either"


def test_a_changed_upstream_fingerprint_refreshes_the_trajectory():
    edited = director_state(imported="abc123", keyframes=[
        {"frame": 0, "camera": camera([9, 9, 9]), "interpolation": "ease"},
    ])
    resolved = resolve(edited, extractor_track(fingerprint="def456"))
    assert resolved["keyframes"][0]["camera"]["position"] == [0.0, 0.0, 0.0]
    assert resolved["metadata"][UPSTREAM_METADATA_KEY]["fingerprint"] == "def456"


def test_an_upstream_track_without_a_fingerprint_is_never_adopted():
    """Nothing could tell two runs of it apart, so it would overwrite edits forever."""
    anonymous = extractor_track()
    anonymous["metadata"].pop("extractor_fingerprint")
    local = director_state()
    assert not should_adopt_upstream(local, anonymous)
    assert resolve(local, anonymous)["keyframes"] == local["keyframes"]


def test_an_empty_upstream_track_is_ignored():
    empty = extractor_track()
    empty["keyframes"] = []
    assert not should_adopt_upstream(director_state(), empty)


# ---------------------------------------------------------------------------
# What the merge keeps
# ---------------------------------------------------------------------------

def test_upstream_merge_preserves_director_objects():
    local = director_state()
    resolved = resolve(local, extractor_track())
    assert [obj["id"] for obj in resolved["objects"]] == ["subject"]


def test_upstream_merge_preserves_local_scene_metadata():
    resolved = resolve(director_state(), extractor_track())
    assert resolved["metadata"]["card_asset"] == "subject.png"
    assert resolved["metadata"]["camera_id"] == "camera_1"


def test_upstream_merge_preserves_local_constraints():
    local = director_state()
    local["constraints"] = {"look_at": {"object_id": "subject", "offset": [0, 0, 0],
                                        "space": "world", "status": "active"}}
    resolved = resolve(local, extractor_track())
    assert resolved["constraints"]["look_at"]["object_id"] == "subject"


def test_upstream_merge_uses_director_render_dimensions():
    resolved = resolve(director_state(), extractor_track(), width=960, height=540,
                       render_mode="graybox")
    assert (resolved["width"], resolved["height"]) == (960, 540)
    assert resolved["render_mode"] == "graybox"


def test_upstream_merge_adopts_the_solved_lens():
    resolved = resolve(director_state(), extractor_track(fov=41.0))
    assert resolved["keyframes"][0]["camera"]["fov"] == pytest.approx(41.0)


def test_upstream_merge_strictly_validates():
    hostile = extractor_track()
    hostile["keyframes"][0]["camera"]["position"] = [float("nan"), 0.0, 0.0]
    with pytest.raises(ValidationError):
        resolve(director_state(), hostile)


def test_local_only_resolution_is_validated_too():
    broken = director_state()
    broken["keyframes"][0]["camera"]["fov"] = float("inf")
    with pytest.raises(ValidationError):
        resolve(broken, None)


# ---------------------------------------------------------------------------
# Fingerprint helpers
# ---------------------------------------------------------------------------

def test_fingerprint_readers_tolerate_junk():
    assert upstream_fingerprint(None) == ""
    assert upstream_fingerprint({"metadata": "not a dict"}) == ""
    assert imported_fingerprint({"metadata": {UPSTREAM_METADATA_KEY: "not a dict"}}) == ""
    assert imported_fingerprint(director_state(imported="xyz")) == "xyz"
