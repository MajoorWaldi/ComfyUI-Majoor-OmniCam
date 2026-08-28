"""Generate committed Python golden samples for the JS camera parity test."""

from __future__ import annotations

import json
import sys
from dataclasses import asdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from omnicam.core.track import OmniCamTrack  # noqa: E402

OUTPUT = ROOT / "tests" / "fixtures" / "parity" / "camera_sampling.python-golden.json"


CASES = [
    {
        "name": "bezier_all_channels",
        "frames": [0, 1, 5, 10, 17, 23, 31],
        "track": {
            "schema_version": 1, "fps": 24, "duration_frames": 32, "width": 1280, "height": 720, "render_mode": "omni_ref",
            "keyframes": [
                {
                    "frame": 0, "interpolation": "bezier",
                    "camera": {"position": [-3, 2, 8], "target": [1, 0.5, -2], "fov": 52, "roll": 170, "camera_type": "perspective", "zoom": 0.8, "near": 0.02, "far": 800},
                    "tangents": {"channels": {
                        "pos_x": {"mode": "free", "out_x": 0.18, "out_y": 7.2},
                        "target_y": {"mode": "aligned", "out_x": 0.42, "out_y": 2.4},
                        "fov": {"mode": "free", "out_x": 0.3, "out_y": -12},
                        "roll": {"mode": "free", "out_x": 0.25, "out_y": 15},
                        "zoom": {"mode": "flat"}, "near": {"mode": "vector"}, "far": {"mode": "auto"},
                    }},
                },
                {
                    "frame": 17, "interpolation": "bezier",
                    "camera": {"position": [4, 7, 1], "target": [-2, 3, 5], "fov": 28, "roll": -175, "camera_type": "orthographic", "zoom": 2.2, "near": 0.2, "far": 1400},
                    "tangents": {"channels": {"pos_x": {"mode": "free", "in_x": -0.35, "in_y": -1.1, "out_x": 0.2, "out_y": 3.5}, "target_y": {"mode": "aligned", "in_x": -0.3, "in_y": -1.1, "out_x": 0.3, "out_y": 1.1}}},
                },
                {
                    "frame": 31, "interpolation": "ease_out",
                    "camera": {"position": [9, -1, -6], "target": [3, 2, 0], "fov": 67, "roll": -130, "camera_type": "perspective", "zoom": 1.1, "near": 0.05, "far": 3000},
                },
            ], "objects": [], "metadata": {},
        },
    },
    {
        "name": "look_at_animated_parent_hierarchy",
        "frames": [0, 3, 9, 17, 24, 30],
        "track": {
            "schema_version": 1, "fps": 30, "duration_frames": 31, "width": 1920, "height": 1080, "render_mode": "grid",
            "constraints": {"look_at": {"object_id": "actor", "offset": [0.25, 1.5, -0.75], "space": "world", "status": "active"}},
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 6, 14], "target": [99, 99, 99], "fov": 40, "roll": 5, "camera_type": "perspective", "zoom": 1, "near": 0.01, "far": 5000}, "interpolation": "linear"},
                {"frame": 30, "camera": {"position": [8, 9, 4], "target": [-99, -99, -99], "fov": 32, "roll": 25, "camera_type": "perspective", "zoom": 1, "near": 0.01, "far": 5000}, "interpolation": "ease"},
            ],
            "objects": [
                {"id": "root", "type": "null", "position": [2, 0, -1], "rotation": [0, 20, 0], "size": [1, 1, 1], "keyframes": [
                    {"frame": 0, "transform": {"position": [2, 0, -1], "rotation": [0, 20, 0], "size": [1, 1, 1]}, "interpolation": "linear"},
                    {"frame": 30, "transform": {"position": [10, 2, 6], "rotation": [15, 110, -20], "size": [1.5, 0.8, 2]}, "interpolation": "ease"},
                ]},
                {"id": "rig", "type": "null", "parent_id": "root", "position": [3, 1, 0], "rotation": [0, 0, 25], "size": [0.75, 1.2, 1]},
                {"id": "actor", "type": "human", "parent_id": "rig", "position": [1, 2, -2], "rotation": [0, 0, 0], "size": [1, 1, 1], "keyframes": [
                    {"frame": 0, "transform": {"position": [1, 2, -2], "rotation": [0, 0, 0], "size": [1, 1, 1]}, "interpolation": "bezier"},
                    {"frame": 30, "transform": {"position": [-2, 4, 3], "rotation": [0, 180, 0], "size": [1, 1, 1]}, "interpolation": "bezier"},
                ]},
            ], "metadata": {},
        },
    },
    {
        "name": "projection_switch_and_angle_wrap",
        "frames": [0, 7, 14, 15, 16, 22, 29, 30],
        "track": {
            "schema_version": 1, "fps": 24, "duration_frames": 31, "width": 1024, "height": 1024, "render_mode": "wireframe",
            "keyframes": [
                {"frame": 0, "camera": {"position": [0, 2, 9], "target": [0, 1, 0], "fov": 35, "roll": 179, "camera_type": "perspective", "zoom": 1, "near": 0.01, "far": 1000}, "interpolation": "linear"},
                {"frame": 15, "camera": {"position": [2, 3, 7], "target": [1, 2, 0], "fov": 45, "roll": -179, "camera_type": "orthographic", "zoom": 3, "near": 0.1, "far": 2000}, "interpolation": "linear"},
                {"frame": 30, "camera": {"position": [-4, 8, 2], "target": [0, 0, 0], "fov": 25, "roll": 170, "camera_type": "perspective", "zoom": 0.5, "near": 0.5, "far": 4000}, "interpolation": "ease_in"},
            ], "objects": [], "metadata": {},
        },
    },
]


def generate() -> dict:
    result = {"generator": "scripts/generate_parity_fixture.py", "epsilon": 1e-5, "cases": []}
    for case in CASES:
        track = OmniCamTrack.from_dict(case["track"])
        samples = [{"frame": frame, **asdict(track.sample(frame))} for frame in case["frames"]]
        result["cases"].append({**case, "python_samples": samples})
    return result


if __name__ == "__main__":
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(generate(), indent=2) + "\n", encoding="utf-8")
    print(OUTPUT.relative_to(ROOT))
