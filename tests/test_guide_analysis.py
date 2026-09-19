from __future__ import annotations

import pytest
from h3_track_fixtures import base_track, orbit_track, pan_in_place_track

from omnicam.guides.analysis import build_shot_compile_ir, camera_phases_from_track
from omnicam.guides.model import (
    MAPPING_QUALITIES,
    REFERENCE_ROLES,
    CameraPhase,
    ReferenceSpec,
    ShotCompileIR,
    ShotIntent,
    omnicam_guide_reference,
    parse_reference_plan,
    validate_mapping_quality,
    validate_reference_role,
)

# ---------------------------------------------------------------------------
# ReferenceSpec
# ---------------------------------------------------------------------------

def test_reference_spec_accepts_valid_roles():
    spec = ReferenceSpec(
        id="omnicam_guide", media_type="guide", slot_hint=2,
        roles=("camera_motion", "camera_framing"),
    )
    assert spec.roles == ("camera_motion", "camera_framing")
    assert spec.ignore == ()
    assert spec.source == "omnicam_guide"


def test_reference_spec_rejects_an_unknown_role():
    with pytest.raises(ValueError):
        ReferenceSpec(id="x", media_type="guide", slot_hint=1, roles=("not_a_real_role",))


def test_reference_spec_rejects_invalid_media_type():
    with pytest.raises(ValueError):
        ReferenceSpec(id="x", media_type="holograph", slot_hint=1, roles=())


def test_reference_spec_rejects_non_positive_slot_hint():
    with pytest.raises(ValueError):
        ReferenceSpec(id="x", media_type="guide", slot_hint=0, roles=())


def test_reference_spec_validates_temporal_range():
    spec = ReferenceSpec(
        id="x", media_type="video", slot_hint=1, roles=("subject_action",),
        temporal_range=(2.5, 5.0),
    )
    assert spec.temporal_range == (2.5, 5.0)
    with pytest.raises(ValueError):
        ReferenceSpec(id="x", media_type="video", slot_hint=1, roles=(), temporal_range=(5.0, 2.5))


def test_reference_spec_validates_strength_range():
    with pytest.raises(ValueError):
        ReferenceSpec(id="x", media_type="video", slot_hint=1, roles=(), strength=1.5)


def test_omnicam_guide_reference_factory_shape():
    spec = omnicam_guide_reference(slot_hint=2, roles=("camera_motion", "camera_framing"))
    assert spec.id == "omnicam_guide"
    assert spec.source == "omnicam_guide"
    assert spec.slot_hint == 2
    assert spec.media_type == "guide"


# ---------------------------------------------------------------------------
# ShotIntent
# ---------------------------------------------------------------------------

def test_shot_intent_net_preserve_subtracts_ignore():
    intent = ShotIntent(
        preserve=("camera_motion", "spatial_layout", "blocking"),
        ignore=("spatial_layout",),
    )
    assert intent.net_preserve == ("camera_motion", "blocking")


def test_shot_intent_accepts_concepts_outside_reference_roles():
    # change/ignore carry broader concepts (final_appearance, proxy_materials)
    # that are not in REFERENCE_ROLES -- must not raise.
    intent = ShotIntent(change=("final_appearance",), ignore=("proxy_materials",))
    assert intent.change == ("final_appearance",)


def test_shot_intent_dedups_while_preserving_order():
    intent = ShotIntent(preserve=("camera_motion", "camera_framing", "camera_motion"))
    assert intent.preserve == ("camera_motion", "camera_framing")


# ---------------------------------------------------------------------------
# Mapping quality / role validators
# ---------------------------------------------------------------------------

def test_mapping_qualities_are_the_documented_four():
    assert {"DIRECT", "CONDITIONAL", "APPROXIMATED", "UNSUPPORTED"} == MAPPING_QUALITIES


def test_validate_mapping_quality_rejects_unknown_value():
    with pytest.raises(ValueError):
        validate_mapping_quality("MOSTLY_FINE")


def test_validate_reference_role_rejects_unknown_value():
    with pytest.raises(ValueError):
        validate_reference_role("telepathy")
    assert "camera_motion" in REFERENCE_ROLES


# ---------------------------------------------------------------------------
# camera_phases_from_track / build_shot_compile_ir
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("track_factory", [base_track, lambda: orbit_track(90.0), lambda: orbit_track(-90.0), pan_in_place_track])
def test_camera_phases_from_track_returns_typed_phases(track_factory):
    phases = camera_phases_from_track(track_factory())
    assert phases
    assert all(isinstance(phase, CameraPhase) for phase in phases)
    assert phases[0].start_seconds == 0.0
    assert phases[-1].end_seconds > 0.0


def test_camera_phases_are_contiguous():
    phases = camera_phases_from_track(orbit_track(180.0, frames=124))
    for previous, current in zip(phases, phases[1:]):
        assert current.start_seconds == previous.end_seconds


def test_build_shot_compile_ir_assembles_one_guide_reference():
    track = orbit_track(90.0)
    guide = omnicam_guide_reference(slot_hint=1, roles=("camera_motion", "camera_framing", "camera_pacing"))
    intent = ShotIntent(preserve=("camera_motion", "camera_framing", "camera_pacing"))
    ir = build_shot_compile_ir(
        track, guide_reference=guide, intent=intent,
        mapping_quality={"camera_motion_mapping": "CONDITIONAL"},
    )
    assert isinstance(ir, ShotCompileIR)
    assert ir.references == (guide,)
    assert ir.intent is intent
    assert ir.mapping_quality == {"camera_motion_mapping": "CONDITIONAL"}
    assert ir.camera_phases


def test_shot_compile_ir_rejects_an_invalid_mapping_quality_value():
    track = base_track()
    guide = omnicam_guide_reference(slot_hint=1, roles=("camera_motion",))
    with pytest.raises(ValueError):
        build_shot_compile_ir(
            track, guide_reference=guide, intent=ShotIntent(),
            mapping_quality={"camera_motion_mapping": "SORT_OF"},
        )


def test_build_shot_compile_ir_with_additional_references():
    track = base_track()
    guide = omnicam_guide_reference(slot_hint=1, roles=("camera_motion",))
    identity = ReferenceSpec(id="identity_img", media_type="image", slot_hint=1, roles=("identity", "design"))
    ir = build_shot_compile_ir(
        track, guide_reference=guide, intent=ShotIntent(), mapping_quality={},
        additional_references=(identity,),
    )
    assert ir.references == (guide, identity)


# ---------------------------------------------------------------------------
# parse_reference_plan (P2)
# ---------------------------------------------------------------------------

def test_parse_reference_plan_empty_string_is_no_references():
    assert parse_reference_plan("") == ()
    assert parse_reference_plan("   ") == ()


def test_parse_reference_plan_parses_a_single_entry():
    plan = parse_reference_plan(
        '[{"id": "identity_img", "media_type": "image", "slot_hint": 1, "roles": ["identity", "design"]}]'
    )
    assert len(plan) == 1
    spec = plan[0]
    assert spec.id == "identity_img"
    assert spec.media_type == "image"
    assert spec.slot_hint == 1
    assert spec.roles == ("identity", "design")
    assert spec.source == "external"


def test_parse_reference_plan_parses_temporal_range_and_ignore():
    plan = parse_reference_plan(
        '[{"id": "action_video", "media_type": "video", "slot_hint": 2, '
        '"roles": ["subject_action"], "ignore": ["camera_motion"], "temporal_range": [2.5, 5.0]}]'
    )
    spec = plan[0]
    assert spec.temporal_range == (2.5, 5.0)
    assert spec.ignore == ("camera_motion",)


def test_parse_reference_plan_rejects_malformed_json():
    with pytest.raises(ValueError, match="not valid JSON"):
        parse_reference_plan("{not json")


def test_parse_reference_plan_rejects_a_non_array_payload():
    with pytest.raises(ValueError, match="JSON array"):
        parse_reference_plan('{"id": "x"}')


def test_parse_reference_plan_rejects_a_non_object_entry():
    with pytest.raises(ValueError, match="must be an object"):
        parse_reference_plan("[1, 2]")


def test_parse_reference_plan_rejects_an_invalid_role():
    with pytest.raises(ValueError):
        parse_reference_plan('[{"id": "x", "media_type": "image", "roles": ["not_a_role"]}]')


def test_parse_reference_plan_rejects_duplicate_ids():
    with pytest.raises(ValueError, match="unique"):
        parse_reference_plan(
            '[{"id": "x", "media_type": "image", "roles": []}, '
            '{"id": "x", "media_type": "video", "roles": []}]'
        )


def test_parse_reference_plan_rejects_the_reserved_guide_id():
    with pytest.raises(ValueError, match="omnicam_guide"):
        parse_reference_plan('[{"id": "omnicam_guide", "media_type": "image", "roles": []}]')
