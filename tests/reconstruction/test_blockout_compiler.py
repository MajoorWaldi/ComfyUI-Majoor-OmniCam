"""Tests for the BlockoutScene -> MotionScene compiler (plan Task 12)."""

from __future__ import annotations

import pytest

from omnicam.core.motion_scene import MotionScene
from omnicam.core.validation import DEFAULT_LIMITS, ValidationError, validate_object
from omnicam.reconstruction.blockout.compiler import compile_blockout_scene
from omnicam.reconstruction.blockout.types import AxisConfidence, BlockoutObject, BlockoutScene
from omnicam.reconstruction.types import ReconstructedCamera, ReconstructedPlane


def _chair(oid="chair_1", depth_conf=0.5):
    return BlockoutObject(
        object_id=oid,
        label="Chair",
        semantic_class="chair",
        primitive="cube",
        position=(1.0, 0.5, -3.0),
        rotation=(0.0, 20.0, 0.0),
        size=(0.7, 1.0, 0.7),
        confidence=0.8,
        axis_confidence=AxisConfidence(0.9, 0.9, depth_conf, 0.7),
        source_instance_ids=["fake_chair_0"],
    )


def _scene(**kw):
    defaults = dict(
        objects=[_chair()],
        room_planes=[
            ReconstructedPlane("ground", (0.0, -1.4, -3.0), (0.0, 1.0, 0.0), (6.0, 4.0), 0.8),
            ReconstructedPlane("wall", (0.0, 0.0, -5.0), (0.0, 0.0, 1.0), (5.0, 3.0), 0.6),
        ],
        source_camera=ReconstructedCamera(fov_x_degrees=65.0, fov_y_degrees=45.0),
        provider_summary={"geometry": "fake", "segmentation": "fake"},
    )
    defaults.update(kw)
    return BlockoutScene(**defaults)


def test_compiles_to_valid_motion_scene_with_hierarchy():
    scene = compile_blockout_scene(_scene(), canvas_width=1920, canvas_height=1080)
    # Round-trips through the real validator.
    MotionScene.from_dict(scene)

    by_id = {o["id"]: o for o in scene["objects"]}
    assert by_id["reconstruction_room"]["parent_id"] == "reconstruction_root"
    assert by_id["reconstruction_blockout"]["parent_id"] == "reconstruction_root"
    assert by_id["reconstruction_ground"]["parent_id"] == "reconstruction_room"
    assert by_id["chair_1"]["parent_id"] == "reconstruction_blockout"
    assert scene["canvas"] == {"width": 1920, "height": 1080}


def test_blockout_object_is_unlocked_room_is_locked():
    scene = compile_blockout_scene(_scene(), canvas_width=1024, canvas_height=1024)
    by_id = {o["id"]: o for o in scene["objects"]}
    assert by_id["chair_1"]["locked"] is False
    assert by_id["reconstruction_ground"]["locked"] is True
    assert by_id["reconstruction_wall_1"]["locked"] is True


def test_blockout_metadata_carries_bounded_semantic_fields():
    scene = compile_blockout_scene(_scene(), canvas_width=800, canvas_height=600)
    chair = next(o for o in scene["objects"] if o["id"] == "chair_1")
    recon = chair["reconstruction"]
    assert recon["role"] == "blockout_object"
    assert recon["semantic"] == "chair"
    assert recon["version"] == 2
    assert set(recon["axis_confidence"]) == {"width", "height", "depth", "yaw"}
    assert 0.0 <= recon["axis_confidence"]["depth"] <= 1.0
    assert recon["completion_provider"] == "none"


def test_vertical_fov_and_source_canvas_preserved():
    scene = compile_blockout_scene(_scene(), canvas_width=1080, canvas_height=1920)
    track = scene["cameras"][0]["track"]
    assert (track["width"], track["height"]) == (1080, 1920)
    assert track["keyframes"][0]["camera"]["fov"] == 45.0


def test_reference_root_only_present_in_hybrid():
    plain = compile_blockout_scene(_scene(), canvas_width=640, canvas_height=480)
    assert not any(o["id"] == "reconstruction_reference" for o in plain["objects"])

    hybrid = compile_blockout_scene(
        _scene(reference_asset={"asset_path": "majoor_omnicam/reconstruction/x/environment.glb [input]", "confidence": 0.7, "textured": True}),
        canvas_width=640,
        canvas_height=480,
        mode="hybrid",
    )
    by_id = {o["id"]: o for o in hybrid["objects"]}
    assert by_id["reconstruction_reference"]["parent_id"] == "reconstruction_root"
    assert by_id["reconstruction_reference_mesh"]["type"] == "glb"
    assert by_id["reconstruction_reference_mesh"]["locked"] is True


def test_validator_rejects_oversized_semantic_and_out_of_range_axis_confidence():
    good = {
        "id": "x",
        "type": "cube",
        "reconstruction": {"semantic": "chair", "axis_confidence": {"depth": 5.0}},
    }
    cleaned = validate_object(good, 120, "objects[0]", DEFAULT_LIMITS)
    assert cleaned["reconstruction"]["axis_confidence"]["depth"] == 1.0  # clamped

    bad = {
        "id": "y",
        "type": "cube",
        "reconstruction": {"semantic": "s" * 65},
    }
    with pytest.raises(ValidationError):
        validate_object(bad, 120, "objects[1]", DEFAULT_LIMITS)


def _placement(source_object_id="chair_1", semantic="chair"):
    from omnicam.reconstruction.asset_library import AssetPlacement

    return AssetPlacement(
        source_object_id=source_object_id,
        semantic_class=semantic,
        category="interior",
        asset_ref="majoor_omnicam/blockout_library/interior/chair.glb [input]",
        position=(1.0, 0.5, -3.0),
        rotation=(0.0, 20.0, 0.0),
        size=(0.7, 1.0, 0.7),
        confidence=0.8,
    )


def test_asset_placements_add_a_glb_branch_and_keep_the_box_in_proxy_mode():
    scene = compile_blockout_scene(
        _scene(),
        canvas_width=1280,
        canvas_height=720,
        asset_placements=[_placement()],
        asset_mode="proxy",
    )
    by_id = {o["id"]: o for o in scene["objects"]}
    assert by_id["reconstruction_assets"]["type"] == "null"
    asset = by_id["chair_1_asset"]
    assert asset["type"] == "glb"
    assert asset["parent_id"] == "reconstruction_assets"
    assert asset["asset"] == "majoor_omnicam/blockout_library/interior/chair.glb [input]"
    assert asset["reconstruction"]["role"] == "asset_proxy"
    assert asset["reconstruction"]["source_object_id"] == "chair_1"
    # proxy mode keeps the fitted box visible next to the prop.
    assert by_id["chair_1"]["enabled"] is True
    assert scene["metadata"]["reconstruction"]["asset_mode"] == "proxy"
    assert scene["metadata"]["reconstruction"]["asset_count"] == 1


def test_catalog_resolved_placement_forwards_tags_asset_id_and_kind():
    from omnicam.reconstruction.asset_library import AssetPlacement

    placement = AssetPlacement(
        source_object_id="person_1", semantic_class="person", category="characters",
        asset_ref="omnicam/library/characters/walker.glb [input]",
        position=(0.0, 0.0, -2.0), rotation=(0.0, 0.0, 0.0), size=(0.6, 1.8, 0.4), confidence=0.8,
        tags=("reconstruction", "person"), asset_id="omnicam.character.walker", asset_kind="character",
    )
    scene = compile_blockout_scene(
        _scene(), canvas_width=1280, canvas_height=720, asset_placements=[placement], asset_mode="proxy",
    )
    asset = {o["id"]: o for o in scene["objects"]}["person_1_asset"]
    # survives MotionScene validation (compile returns MotionScene.from_dict(...).to_dict())
    assert asset["asset_id"] == "omnicam.character.walker"
    assert asset["asset_kind"] == "character"
    assert asset["tags"] == ["reconstruction", "person"]


def test_replace_mode_hides_the_box_the_prop_stands_in_for():
    scene = compile_blockout_scene(
        _scene(),
        canvas_width=1280,
        canvas_height=720,
        asset_placements=[_placement()],
        asset_mode="replace",
    )
    by_id = {o["id"]: o for o in scene["objects"]}
    assert by_id["chair_1"]["enabled"] is False
    assert by_id["chair_1_asset"]["enabled"] is True


def test_no_placements_leaves_the_scene_and_metadata_untouched():
    scene = compile_blockout_scene(_scene(), canvas_width=1280, canvas_height=720)
    assert "reconstruction_assets" not in {o["id"] for o in scene["objects"]}
    assert scene["metadata"]["reconstruction"]["asset_mode"] == "off"
