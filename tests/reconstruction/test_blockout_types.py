"""Tests for the semantic blockout domain types (plan Task 2)."""

from __future__ import annotations

from omnicam.reconstruction.blockout.types import (
    AxisConfidence,
    BlockoutObject,
    BlockoutScene,
    InstanceEvidence,
)


def _sample_object() -> BlockoutObject:
    return BlockoutObject(
        object_id="chair_1",
        label="Chair",
        semantic_class="chair",
        primitive="cube",
        position=(1.0, 0.5, -3.0),
        rotation=(0.0, 25.0, 0.0),
        size=(0.7, 1.0, 0.7),
        confidence=0.82,
        axis_confidence=AxisConfidence(0.9, 0.9, 0.5, 0.7),
        source_instance_ids=["view0_chair_0"],
    )


def test_blockout_object_serializes_bounded_metadata():
    data = _sample_object().to_dict()
    assert data["semantic_class"] == "chair"
    assert data["primitive"] == "cube"
    assert data["axis_confidence"]["depth"] == 0.5
    assert data["position"] == [1.0, 0.5, -3.0]
    assert data["completion_provider"] == "none"
    assert data["source_instance_ids"] == ["view0_chair_0"]


def test_blockout_object_round_trips_through_dict():
    obj = _sample_object()
    restored = BlockoutObject.from_dict(obj.to_dict())
    assert restored.to_dict() == obj.to_dict()


def test_confidences_are_clamped_into_unit_range():
    obj = BlockoutObject(
        object_id="x",
        label="X",
        semantic_class="x",
        primitive="cube",
        position=(0.0, 0.0, 0.0),
        rotation=(0.0, 0.0, 0.0),
        size=(1.0, 1.0, 1.0),
        confidence=1.9,
        axis_confidence=AxisConfidence(2.0, -0.5, 0.5, 0.7),
    )
    data = obj.to_dict()
    assert data["confidence"] == 1.0
    assert data["axis_confidence"]["width"] == 1.0
    assert data["axis_confidence"]["height"] == 0.0


def test_instance_evidence_keeps_mask_off_serialized_types():
    inst = InstanceEvidence(
        instance_id="view0_chair_0",
        label="chair",
        score=0.77,
        mask=[[0, 1], [1, 0]],
        bbox_xyxy=(1.0, 2.0, 3.0, 4.0),
        view_index=0,
    )
    assert inst.score == 0.77
    # A BlockoutObject built from it references it by id only, never the mask.
    obj = _sample_object()
    assert "mask" not in obj.to_dict()
    assert inst.instance_id in obj.to_dict()["source_instance_ids"]


def test_blockout_scene_is_tensor_free_and_json_light():
    scene = BlockoutScene(
        objects=[_sample_object()],
        room_planes=[],
        source_camera=None,
        provider_summary={"geometry": "fake", "segmentation": "fake"},
        warnings=["w"] * 50,
    )
    data = scene.to_dict()
    assert data["version"] == 1
    assert len(data["objects"]) == 1
    assert data["objects"][0]["semantic_class"] == "chair"
    assert len(data["warnings"]) == 32  # capped
    assert data["scan_camera_track"] is None
