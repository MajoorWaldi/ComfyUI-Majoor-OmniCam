"""Generate committed Python golden reports for the JS motion-health parity test.

web-src/motion-health.js re-implements omnicam/core/motion_health.py so the
Health panel can grade live. Two implementations of one formula drift silently;
this fixture is what makes the drift fail a test instead.

Run after changing either side:  python scripts/generate_motion_health_fixture.py
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from omnicam.adapters.motion_profiles import MOTION_PROFILES, profile_limits  # noqa: E402
from omnicam.core.motion_health import motion_health_report  # noqa: E402
from omnicam.core.track import OmniCamTrack  # noqa: E402

OUTPUT = ROOT / "tests" / "fixtures" / "parity" / "motion_health.python-golden.json"

BASE = {"schema_version": 1, "width": 1280, "height": 720, "render_mode": "omni_ref", "objects": [], "metadata": {}}

CASES = [
    {
        # A lurch after an idle head: the segments must localize it.
        "name": "burst_after_idle",
        "profile": "h3",
        "track": {**BASE, "fps": 24, "duration_frames": 25, "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
            {"frame": 18, "camera": {"position": [0.2, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
            {"frame": 24, "camera": {"position": [6, 1, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
        ]},
    },
    {
        # Eased bezier moves exercise the interpolation both samplers must share.
        "name": "eased_orbit_with_lens_ramp",
        "profile": "ltx",
        "track": {**BASE, "fps": 30, "duration_frames": 31, "keyframes": [
            {"frame": 0, "camera": {"position": [4, 2, 4], "target": [0, 1.5, 0], "fov": 24, "roll": 0}, "interpolation": "bezier"},
            {"frame": 15, "camera": {"position": [0, 3, 6], "target": [0, 1.5, 0], "fov": 45, "roll": 8}, "interpolation": "ease"},
            {"frame": 30, "camera": {"position": [-4, 2, 4], "target": [0, 1.5, 0], "fov": 60, "roll": -6}, "interpolation": "ease_out"},
        ]},
    },
    {
        # The subject leaves the frame: framing loss must land on the same frames.
        "name": "subject_swings_out_of_frame",
        "profile": "wan_ati",
        "track": {**BASE, "fps": 24, "duration_frames": 21, "width": 640, "height": 360, "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1.5, 5], "target": [0, 1.5, 0]}, "interpolation": "linear"},
            {"frame": 20, "camera": {"position": [0, 1.5, 5], "target": [60, 1.5, 0]}, "interpolation": "linear"},
        ]},
    },
    {
        # A pure zoom: fov_drift must stay a track-level alert, no frame blamed.
        "name": "static_camera_pure_zoom",
        "profile": "wan_native",
        "track": {**BASE, "fps": 24, "duration_frames": 13, "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1.5, 6], "target": [0, 1.5, 0], "fov": 20}, "interpolation": "linear"},
            {"frame": 12, "camera": {"position": [0, 1.5, 6], "target": [0, 1.5, 0], "fov": 75}, "interpolation": "linear"},
        ]},
    },
    {
        # No limits at all: every frame must grade ok, both sides.
        "name": "generic_profile_no_violations",
        "profile": "generic",
        "track": {**BASE, "fps": 24, "duration_frames": 17, "keyframes": [
            {"frame": 0, "camera": {"position": [2, 1.5, 5], "target": [0, 1.5, 0]}, "interpolation": "ease"},
            {"frame": 16, "camera": {"position": [-2, 1.5, 5], "target": [0, 1.5, 0]}, "interpolation": "ease"},
        ]},
    },
]


def generate() -> dict:
    result = {"generator": "scripts/generate_motion_health_fixture.py", "epsilon": 1e-6, "cases": []}
    for case in CASES:
        assert case["profile"] in MOTION_PROFILES, case["profile"]
        limits = profile_limits(case["profile"])
        track = OmniCamTrack.from_dict(case["track"])
        report = motion_health_report(track, limits, profile=case["profile"])
        result["cases"].append({**case, "limits": limits, "python_report": report})
    return result


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(generate(), indent=2) + "\n", encoding="utf-8")
    print(OUTPUT.relative_to(ROOT))
