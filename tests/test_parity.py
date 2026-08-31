from __future__ import annotations

import json
import math
import subprocess
from dataclasses import asdict
from pathlib import Path

import pytest

from omnicam.core.track import OmniCamTrack

ROOT = Path(__file__).resolve().parents[1]
FIXTURES_DIR = ROOT / "tests" / "fixtures" / "tracks"
PYTHON_GOLDEN = ROOT / "tests" / "fixtures" / "parity" / "camera_sampling.python-golden.json"


def assert_nested_close(actual, expected, *, path="root"):
    """Compare golden structures while tolerating cross-runtime float noise."""
    if isinstance(expected, dict):
        assert isinstance(actual, dict), f"{path}: expected object"
        assert actual.keys() == expected.keys(), f"{path}: keys differ"
        for key in expected:
            assert_nested_close(actual[key], expected[key], path=f"{path}.{key}")
        return
    if isinstance(expected, list):
        assert isinstance(actual, list), f"{path}: expected list"
        assert len(actual) == len(expected), f"{path}: lengths differ"
        for index, (actual_item, expected_item) in enumerate(zip(actual, expected, strict=True)):
            assert_nested_close(actual_item, expected_item, path=f"{path}[{index}]")
        return
    if isinstance(expected, (int, float)) and not isinstance(expected, bool):
        assert isinstance(actual, (int, float)) and not isinstance(actual, bool), f"{path}: expected number"
        assert math.isfinite(float(actual)) and math.isfinite(float(expected)), f"{path}: non-finite number"
        assert actual == pytest.approx(expected, rel=1e-9, abs=1e-10), f"{path}: floats differ"
        return
    assert actual == expected, f"{path}: values differ"


def get_js_samples(track_dict: dict, frames: list[int]) -> list[dict]:
    """Execute node to sample the track via web-src/director/core.js."""
    script = f"""
import {{ sampleCamera }} from './web-src/director/core.js';
const track = {json.dumps(track_dict)};
const frames = {json.dumps(frames)};
const results = frames.map(f => sampleCamera(track, f));
console.log(JSON.stringify(results));
"""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=str(ROOT),
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout.strip())


@pytest.mark.parametrize("fixture_path", sorted(FIXTURES_DIR.glob("*.json")))
def test_cross_language_camera_parity(fixture_path: Path):
    track_data = json.loads(fixture_path.read_text(encoding="utf-8"))
    track = OmniCamTrack.from_dict(track_data)
    test_frames = [0, 1, 6, 12, 18, track.duration_frames - 1]

    js_samples = get_js_samples(track_data, test_frames)

    for frame, js_sample in zip(test_frames, js_samples, strict=True):
        py_sample = track.sample(frame)

        # Position parity
        for i in range(3):
            assert py_sample.position[i] == pytest.approx(js_sample["position"][i], abs=1e-5), (
                f"Mismatch in position[{i}] for {fixture_path.name} at frame {frame}: "
                f"py={py_sample.position[i]} vs js={js_sample['position'][i]}"
            )

        # Target parity
        for i in range(3):
            assert py_sample.target[i] == pytest.approx(js_sample["target"][i], abs=1e-5), (
                f"Mismatch in target[{i}] for {fixture_path.name} at frame {frame}: "
                f"py={py_sample.target[i]} vs js={js_sample['target'][i]}"
            )

        # FOV, Roll, Zoom, Near, Far, CameraType
        assert py_sample.fov == pytest.approx(js_sample["fov"], abs=1e-5)
        assert py_sample.roll == pytest.approx(js_sample["roll"], abs=1e-5)
        assert py_sample.zoom == pytest.approx(js_sample["zoom"], abs=1e-5)
        assert py_sample.near == pytest.approx(js_sample["near"], abs=1e-5)
        assert py_sample.far == pytest.approx(js_sample["far"], abs=1e-5)
        assert py_sample.camera_type == js_sample["camera_type"]


def test_committed_python_camera_golden_is_fresh():
    golden = json.loads(PYTHON_GOLDEN.read_text(encoding="utf-8"))
    assert golden["generator"] == "scripts/generate_parity_fixture.py"
    assert golden["epsilon"] <= 1e-5
    for case in golden["cases"]:
        track = OmniCamTrack.from_dict(case["track"])
        regenerated = [{"frame": frame, **asdict(track.sample(frame))} for frame in case["frames"]]
        assert_nested_close(regenerated, case["python_samples"], path=case["name"])


def test_nested_golden_tolerance_accepts_sub_ulp_noise_but_not_real_differences():
    assert_nested_close({"value": [2.152891949165152]}, {"value": [2.1528919491651513]})
    with pytest.raises(AssertionError):
        assert_nested_close({"value": [2.1528]}, {"value": [2.1529]})
    for invalid in (math.nan, math.inf, -math.inf):
        with pytest.raises(AssertionError, match="non-finite"):
            assert_nested_close({"value": invalid}, {"value": invalid})
