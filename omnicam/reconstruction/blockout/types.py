"""Semantic blockout domain types.

These are the structured hand-off between segmentation, deterministic fitting
and the MotionScene compiler. Later tasks import these instead of passing
unstructured dictionaries around.

``InstanceEvidence.mask`` is the one field that may carry a dense array; it is
transient provider output consumed by the fitter and never serialized. Every
other type here is JSON-light by construction.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


def _clamp01(value: float) -> float:
    return float(max(0.0, min(1.0, value)))


@dataclass(slots=True)
class InstanceEvidence:
    """One segmented instance in one view.

    ``mask`` is provider-owned dense data (bool/float array or tensor). It is
    consumed by ``fit_blockout_object`` and must not be placed on any type that
    is serialized.
    """

    instance_id: str
    label: str
    score: float
    mask: Any
    bbox_xyxy: tuple[float, float, float, float]
    view_index: int = 0


@dataclass(slots=True)
class AxisConfidence:
    """Per-axis trust in a fitted proxy, each in ``[0, 1]``.

    ``depth`` is typically the weakest for a single frontal view -- it is what
    optional SAM3D completion is allowed to touch.
    """

    width: float
    height: float
    depth: float
    yaw: float

    def to_dict(self) -> dict[str, float]:
        return {
            "width": _clamp01(self.width),
            "height": _clamp01(self.height),
            "depth": _clamp01(self.depth),
            "yaw": _clamp01(self.yaw),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> AxisConfidence:
        return cls(
            width=float(data.get("width", 0.0)),
            height=float(data.get("height", 0.0)),
            depth=float(data.get("depth", 0.0)),
            yaw=float(data.get("yaw", 0.0)),
        )


@dataclass(slots=True)
class BlockoutObject:
    """A closed editable primitive fitted from masked 3D evidence."""

    object_id: str
    label: str
    semantic_class: str
    primitive: str
    position: tuple[float, float, float]
    rotation: tuple[float, float, float]
    size: tuple[float, float, float]
    confidence: float
    axis_confidence: AxisConfidence
    source_instance_ids: list[str] = field(default_factory=list)
    completion_provider: str = "none"

    def to_dict(self) -> dict[str, Any]:
        return {
            "object_id": self.object_id,
            "label": self.label,
            "semantic_class": self.semantic_class,
            "primitive": self.primitive,
            "position": [float(v) for v in self.position],
            "rotation": [float(v) for v in self.rotation],
            "size": [float(v) for v in self.size],
            "confidence": _clamp01(self.confidence),
            "axis_confidence": self.axis_confidence.to_dict(),
            "source_instance_ids": list(self.source_instance_ids),
            "completion_provider": self.completion_provider,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> BlockoutObject:
        return cls(
            object_id=str(data["object_id"]),
            label=str(data.get("label", "")),
            semantic_class=str(data.get("semantic_class", "")),
            primitive=str(data.get("primitive", "cube")),
            position=tuple(float(v) for v in data.get("position", (0.0, 0.0, 0.0))),  # type: ignore[arg-type]
            rotation=tuple(float(v) for v in data.get("rotation", (0.0, 0.0, 0.0))),  # type: ignore[arg-type]
            size=tuple(float(v) for v in data.get("size", (1.0, 1.0, 1.0))),  # type: ignore[arg-type]
            confidence=float(data.get("confidence", 0.0)),
            axis_confidence=AxisConfidence.from_dict(data.get("axis_confidence", {})),
            source_instance_ids=[str(v) for v in data.get("source_instance_ids", [])],
            completion_provider=str(data.get("completion_provider", "none")),
        )


@dataclass(slots=True)
class BlockoutScene:
    """The deterministic-fit result, before MotionScene compilation.

    Deliberately tensor-free: ``room_planes`` are fitted ``ReconstructedPlane``
    DTOs, ``source_camera`` a ``ReconstructedCamera`` DTO, and
    ``scan_camera_track`` / ``reference_asset`` / ``provider_summary`` are plain
    JSON-serializable dicts.
    """

    objects: list[BlockoutObject] = field(default_factory=list)
    room_planes: list[Any] = field(default_factory=list)
    source_camera: Any | None = None
    scan_camera_track: dict[str, Any] | None = None
    reference_asset: dict[str, Any] | None = None
    provider_summary: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        camera = self.source_camera
        if camera is not None and hasattr(camera, "to_dict"):
            camera = camera.to_dict()
        return {
            "version": 1,
            "objects": [o.to_dict() for o in self.objects],
            "room": [
                p.to_dict() if hasattr(p, "to_dict") else dict(p)
                for p in self.room_planes
            ],
            "source_camera": camera,
            "scan_camera_track": self.scan_camera_track,
            "reference_asset": self.reference_asset,
            "provider_summary": dict(self.provider_summary),
            "warnings": [str(w)[:240] for w in self.warnings[:32]],
        }
