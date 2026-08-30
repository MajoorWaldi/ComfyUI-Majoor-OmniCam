from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(slots=True)
class MonitorText:
    cinematography: str
    camera_prompt: str
    final_prompt: str
    camera_data: dict[str, Any]
    # What the target model's prompt surface actually demands: H3 reference
    # dialect, character budget, reference socket. Empty for adapters whose
    # control path is not textual.
    contract: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class HealthMetric:
    id: str
    label: str
    value: float | int | str
    unit: str = ""
    state: str = "ready"
    recommended_max: float | None = None
    message: str = ""


@dataclass(slots=True)
class MonitorHealth:
    """Track validity and motion risk, kept deliberately apart.

    ``state`` answers "is this trajectory usable at all?" -- non-finite values,
    a subject that leaves frame. ``risk`` is an *empirical OmniCam estimate* of
    how well a model is likely to follow it, graded against limit tables that
    no upstream project publishes; it never blocks anything.
    """

    state: str
    metrics: list[HealthMetric]
    violations: list[dict[str, Any]] = field(default_factory=list)
    risk: str = "LOW"
    risk_reasons: list[str] = field(default_factory=list)
    profile: str = "generic"
    heuristic: bool = True


@dataclass(slots=True)
class MonitorPreview:
    kind: str
    label: str
    payload: dict[str, Any]
    exact_output_representation: bool


@dataclass(slots=True)
class MonitorPreflight:
    """READY / WARNING / BLOCKED, decided only by verifiable contract facts.

    ``risk`` rides alongside as a separate axis: it is reported to the user but
    deliberately does not participate in ``state``.
    """

    state: str
    adapter: str
    capability_state: str
    checks: list[dict[str, Any]]
    issues: list[dict[str, Any]]
    risk: str = "LOW"


@dataclass(slots=True)
class MonitorSnapshot:
    fingerprint: str
    source: dict[str, Any]
    health: MonitorHealth
    preflight: MonitorPreflight
    text: MonitorText
    preview: MonitorPreview
    # Adapter descriptor + roster, so the frontend renders only the controls
    # this target actually uses instead of every control that exists.
    adapter: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
