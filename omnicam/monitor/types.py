from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(slots=True)
class MonitorText:
    cinematography: str
    camera_prompt: str
    final_prompt: str
    camera_data: dict[str, Any]


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
    state: str
    metrics: list[HealthMetric]
    violations: list[dict[str, Any]] = field(default_factory=list)


@dataclass(slots=True)
class MonitorPreview:
    kind: str
    label: str
    payload: dict[str, Any]
    exact_output_representation: bool


@dataclass(slots=True)
class MonitorPreflight:
    state: str
    adapter: str
    capability_state: str
    checks: list[dict[str, Any]]
    issues: list[dict[str, Any]]


@dataclass(slots=True)
class MonitorSnapshot:
    fingerprint: str
    source: dict[str, Any]
    health: MonitorHealth
    preflight: MonitorPreflight
    text: MonitorText
    preview: MonitorPreview

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
