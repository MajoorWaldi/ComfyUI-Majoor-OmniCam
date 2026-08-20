from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest

from omnicam.core.track import OmniCamTrack

ROOT = Path(__file__).resolve().parents[1]
FIXTURES_DIR = ROOT / "tests" / "fixtures" / "tracks"


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

    for frame, js_sample in zip(test_frames, js_samples):
        py_sample = track.sample(frame)

        # Position parity
        for i in range(3):
            assert py_sample.position[i] == pytest.approx(js_sample["position"][i], abs=1e-4), (
                f"Mismatch in position[{i}] for {fixture_path.name} at frame {frame}: "
                f"py={py_sample.position[i]} vs js={js_sample['position'][i]}"
            )

        # Target parity
        for i in range(3):
            assert py_sample.target[i] == pytest.approx(js_sample["target"][i], abs=1e-4), (
                f"Mismatch in target[{i}] for {fixture_path.name} at frame {frame}: "
                f"py={py_sample.target[i]} vs js={js_sample['target'][i]}"
            )

        # FOV, Roll, Zoom, Near, Far, CameraType
        assert py_sample.fov == pytest.approx(js_sample["fov"], abs=1e-4)
        assert py_sample.roll == pytest.approx(js_sample["roll"], abs=1e-4)
        assert py_sample.zoom == pytest.approx(js_sample["zoom"], abs=1e-4)
        assert py_sample.near == pytest.approx(js_sample["near"], abs=1e-4)
        assert py_sample.far == pytest.approx(js_sample["far"], abs=1e-4)
        assert py_sample.camera_type == js_sample["camera_type"]
