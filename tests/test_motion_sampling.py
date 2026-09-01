from __future__ import annotations

import pytest

from omnicam.core.motion_sampling import sample_motion_layer, sample_motion_layers
from omnicam.core.motion_scene import MotionKey, MotionLayer


def _layer(interpolation: str = "linear", *, enabled: bool = True) -> MotionLayer:
    return MotionLayer(
        id="subject",
        label="Subject",
        enabled=enabled,
        semantic="screen_point",
        source_kind="manual_2d",
        keys=[
            MotionKey(0.0, 0.1, 0.2, True, interpolation),
            MotionKey(4.0, 0.9, 0.6, False, "linear"),
        ],
        source={},
    )


@pytest.mark.parametrize(
    ("interpolation", "expected_x", "expected_y"),
    [
        ("linear", 0.3, 0.3),
        ("smooth", 0.225, 0.2625),
        ("hold", 0.1, 0.2),
    ],
)
def test_sample_motion_layer_interpolation(
    interpolation: str, expected_x: float, expected_y: float
):
    sampled = sample_motion_layer(
        _layer(interpolation), sample_count=3, in_seconds=0.0, out_seconds=2.0
    )

    assert sampled.xy[1][0] == pytest.approx(expected_x)
    assert sampled.xy[1][1] == pytest.approx(expected_y)


def test_visibility_is_discrete_and_changes_on_the_right_key():
    sampled = sample_motion_layer(
        _layer(), sample_count=3, in_seconds=3.999, out_seconds=4.0
    )

    assert sampled.visible == [True, True, False]


def test_static_anchor_repeats_across_the_requested_range():
    layer = MotionLayer(
        id="anchor",
        label="Anchor",
        enabled=True,
        semantic="screen_point",
        source_kind="static_anchor",
        keys=[MotionKey(2.0, 0.4, 0.7, False, "hold")],
        source={},
    )

    sampled = sample_motion_layer(layer, sample_count=4, in_seconds=1.0, out_seconds=3.0)

    assert sampled.xy == [(0.4, 0.7)] * 4
    assert sampled.visible == [False] * 4


def test_sampling_uses_inclusive_in_out_range():
    sampled = sample_motion_layer(
        _layer(), sample_count=3, in_seconds=1.0, out_seconds=3.0
    )

    expected = [(0.3, 0.3), (0.5, 0.4), (0.7, 0.5)]
    for actual, target in zip(sampled.xy, expected, strict=True):
        assert actual == pytest.approx(target)


def test_sample_motion_layers_skips_disabled_layers():
    enabled = _layer()
    disabled = _layer(enabled=False)
    disabled.id = "disabled"

    sampled = sample_motion_layers(
        [enabled, disabled], sample_count=2, in_seconds=0.0, out_seconds=4.0
    )

    assert [track.id for track in sampled] == ["subject"]


@pytest.mark.parametrize(
    ("sample_count", "in_seconds", "out_seconds", "message"),
    [
        (0, 0.0, 1.0, "sample_count"),
        (2, -1.0, 1.0, "in_seconds"),
        (2, 2.0, 1.0, "out_seconds"),
        (2, 0.0, float("inf"), "finite"),
    ],
)
def test_sampling_rejects_invalid_ranges(
    sample_count: int, in_seconds: float, out_seconds: float, message: str
):
    with pytest.raises(ValueError, match=message):
        sample_motion_layer(
            _layer(),
            sample_count=sample_count,
            in_seconds=in_seconds,
            out_seconds=out_seconds,
        )
