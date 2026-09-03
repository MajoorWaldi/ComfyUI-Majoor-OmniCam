"""Guards for the real-model motion conformance scaffold.

These do not run any model. They keep the scaffold honest: the case list stays
in sync with the profile registry, and any result file that lands in the tree
is a real one -- correct format, no template placeholders.
"""

from __future__ import annotations

import json
from pathlib import Path

from omnicam.profiles.catalog import PROFILE_REGISTRY

CONFORMANCE_DIR = Path(__file__).resolve().parent / "conformance"
CASES_PATH = CONFORMANCE_DIR / "cases.json"
RESULTS_DIR = CONFORMANCE_DIR / "results"

PLACEHOLDERS = ("REAL_TESTED_COMMIT", "REAL_MODEL_AND_REVISION")


def _cases() -> dict:
    return json.loads(CASES_PATH.read_text(encoding="utf-8"))


def test_cases_file_has_the_expected_shape():
    data = _cases()
    assert data["format"] == "majoor.omnicam.conformance.cases.v1"
    ids = [case["id"] for case in data["camera_cases"]]
    assert len(ids) == len(set(ids)), "duplicate camera case id"
    assert {"static", "truck_left", "orbit_right", "multi_shot_cut"} <= set(ids)
    for case in data["camera_cases"]:
        assert float(case["duration_seconds"]) > 0


def test_case_profiles_match_the_profile_registry():
    assert sorted(_cases()["profiles"]) == sorted(PROFILE_REGISTRY.ids)


def test_committed_results_are_real_not_template_stubs():
    result_files = sorted(RESULTS_DIR.glob("*.result.json"))
    for path in result_files:
        raw = path.read_text(encoding="utf-8")
        for token in PLACEHOLDERS:
            assert token not in raw, f"{path.name} still carries the {token} placeholder"
        payload = json.loads(raw)
        assert payload["format"] == "majoor.omnicam.conformance.result.v1"
        assert payload["profile"] in PROFILE_REGISTRY.ids
        assert payload["status"] in {"PASS", "FAIL"}
