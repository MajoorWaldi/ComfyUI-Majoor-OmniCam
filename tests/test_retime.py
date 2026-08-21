"""Unit tests for RetimeCurve, speed sampling, RetimeMap, and F-Curve splitting."""

from omnicam.core.retime import (
    RetimeCurve,
    RetimeKey,
    build_retime_map,
    integrate_speed,
    output_frame_to_source_frame,
    sample_speed,
    split_retime_curve,
)


def test_constant_speed_sampling_and_integration():
    curve = RetimeCurve(keys=[RetimeKey(frame=0.0, value=1.0, interpolation="constant")])
    assert sample_speed(curve, 0.0) == 1.0
    assert sample_speed(curve, 50.0) == 1.0
    integral = integrate_speed(curve, 0.0, 10.0)
    assert abs(integral - 10.0) < 1e-3


def test_linear_and_bezier_ramp_sampling():
    curve = RetimeCurve(
        keys=[
            RetimeKey(frame=0.0, value=0.5, interpolation="linear"),
            RetimeKey(frame=10.0, value=2.0, interpolation="linear"),
        ]
    )
    assert abs(sample_speed(curve, 5.0) - 1.25) < 1e-4
    assert abs(sample_speed(curve, 0.0) - 0.5) < 1e-4
    assert abs(sample_speed(curve, 10.0) - 2.0) < 1e-4


def test_build_retime_map_absolute_speed_half_speed():
    # 0.5x speed on 10 source frames should yield 20 output frames
    curve = RetimeCurve(keys=[RetimeKey(frame=0.0, value=0.5)])
    rmap = build_retime_map(curve, source_duration=10, mode="absolute_speed")
    assert rmap.output_duration == 20
    assert rmap.source_duration == 10
    assert abs(rmap.average_speed - 0.5) < 1e-3
    assert output_frame_to_source_frame(0, rmap) == 0.0
    assert abs(output_frame_to_source_frame(10, rmap) - 5.0) < 0.2


def test_build_retime_map_fit_duration():
    # Fit 100 source frames into exactly 50 target frames
    curve = RetimeCurve(keys=[RetimeKey(frame=0.0, value=1.0)])
    rmap = build_retime_map(curve, source_duration=100, target_duration=50, mode="fit_duration")
    assert rmap.output_duration == 50
    assert abs(rmap.average_speed - 2.0) < 1e-2


def test_split_retime_curve_continuity_and_rebase():
    curve = RetimeCurve(
        keys=[
            RetimeKey(frame=0.0, value=1.0, interpolation="linear"),
            RetimeKey(frame=100.0, value=3.0, interpolation="linear"),
        ]
    )
    # Split at frame 40 (speed should be 1.0 + 0.4*2.0 = 1.8)
    curve_a, curve_b = split_retime_curve(curve, split_frame=40.0)

    # Curve A spans [0, 40]
    assert curve_a.keys[0].frame == 0.0
    assert curve_a.keys[-1].frame == 40.0
    assert abs(curve_a.keys[-1].value - 1.8) < 1e-3

    # Curve B spans [0, 60] rebased
    assert curve_b.keys[0].frame == 0.0
    assert abs(curve_b.keys[0].value - 1.8) < 1e-3
    assert curve_b.keys[-1].frame == 60.0
    assert curve_b.keys[-1].value == 3.0
