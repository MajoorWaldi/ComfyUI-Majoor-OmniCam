"""The GitHub Release gate: wait for the Registry version to be Active.

scripts/check_registry_status.py polls
GET /nodes/{node}/versions/{version} and maps the NodeVersionStatus enum onto
an exit code. These tests drive it with an injected fetch / clock so no network
is touched.
"""

from __future__ import annotations

import pytest

from scripts.check_registry_status import check_registry_status


class FakeClock:
    def __init__(self) -> None:
        self.t = 0.0

    def now(self) -> float:
        return self.t

    def sleep(self, seconds: float) -> None:
        self.t += seconds


def run(responses, *, timeout=900.0, interval=15.0):
    """responses: list of (code, payload) served in order (last one repeats)."""
    clock = FakeClock()
    calls = {"n": 0}

    def fetch(_url):
        i = min(calls["n"], len(responses) - 1)
        calls["n"] += 1
        return responses[i]

    logs: list[str] = []
    code = check_registry_status(
        "majoor-omnicam",
        "0.3.1",
        timeout=timeout,
        interval=interval,
        fetch=fetch,
        sleep=clock.sleep,
        now=clock.now,
        log=lambda *a, **k: logs.append(str(a[0]) if a else ""),
    )
    return code, calls["n"], logs


def test_active_is_success_on_the_first_poll():
    code, polls, _ = run([(200, {"status": "NodeVersionStatusActive"})])
    assert code == 0
    assert polls == 1


def test_pending_is_polled_until_it_turns_active():
    code, polls, _ = run([
        (200, {"status": "NodeVersionStatusPending"}),
        (200, {"status": "NodeVersionStatusPending"}),
        (200, {"status": "NodeVersionStatusActive"}),
    ])
    assert code == 0
    assert polls == 3


def test_flagged_fails_immediately_and_prints_the_reason():
    code, polls, logs = run([
        (200, {"status": "NodeVersionStatusFlagged", "status_reason": "eval() in node.py"}),
    ])
    assert code == 1
    assert polls == 1
    assert any("eval() in node.py" in line for line in logs)


@pytest.mark.parametrize("status", ["NodeVersionStatusBanned", "NodeVersionStatusDeleted"])
def test_banned_and_deleted_fail_immediately(status):
    code, polls, _ = run([(200, {"status": status})])
    assert code == 1
    assert polls == 1


def test_initial_404_is_retried_until_the_version_appears():
    code, polls, _ = run([
        (404, {}),
        (404, {}),
        (200, {"status": "NodeVersionStatusActive"}),
    ])
    assert code == 0
    assert polls == 3


def test_5xx_and_network_errors_are_retried_within_the_budget():
    code, polls, _ = run([
        (500, {}),
        (0, {}),  # network blip
        (200, {"status": "NodeVersionStatusActive"}),
    ])
    assert code == 0
    assert polls == 3


def test_a_stuck_pending_times_out_as_failure():
    code, polls, logs = run(
        [(200, {"status": "NodeVersionStatusPending"})],
        timeout=60.0,
        interval=15.0,
    )
    assert code == 1
    # 0,15,30,45,60 -> 5 polls before the deadline is hit.
    assert polls == 5
    assert any("timed out" in line for line in logs)


def test_a_never_published_version_times_out_on_404():
    code, _polls, logs = run([(404, {})], timeout=30.0, interval=15.0)
    assert code == 1
    assert any("timed out" in line for line in logs)
