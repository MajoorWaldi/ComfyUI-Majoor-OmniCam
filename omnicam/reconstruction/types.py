"""Provider-independent reconstruction domain data transfer objects."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

VALID_SOURCE_KINDS = frozenset({"annotated_input", "annotated_output"})


@dataclass(slots=True)
class ReconstructionSource:
    kind: str
    value: str
    subfolder: str = ""

    def __post_init__(self) -> None:
        if self.kind not in VALID_SOURCE_KINDS:
            raise ValueError(f"Invalid source kind {self.kind!r}; must be one of {sorted(VALID_SOURCE_KINDS)}")
        if not self.value:
            raise ValueError("ReconstructionSource value cannot be empty")

    def to_dict(self) -> dict[str, Any]:
        return {"kind": self.kind, "value": self.value, "subfolder": self.subfolder}

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ReconstructionSource:
        if not isinstance(data, dict):
            raise TypeError(f"Expected dict for ReconstructionSource, got {type(data).__name__}")
        return cls(
            kind=str(data.get("kind", "")),
            value=str(data.get("value", "")),
            subfolder=str(data.get("subfolder", "")),
        )


@dataclass(slots=True)
class GeometryEvidence:
    points: Any
    depth: Any = None
    intrinsics: Any = None
    mask: Any = None
    normals: Any = None
    image: Any = None
    coordinate_system: str = "opencv_x_right_y_down_z_forward"
    provider_version: str = ""
    scale_mode: str = "relative"
    confidence: float = 1.0
    warnings: list[str] = field(default_factory=list)


@dataclass(slots=True)
class ReconstructedCamera:
    fov_x_degrees: float
    fov_y_degrees: float
    position: tuple[float, float, float] = (0.0, 0.0, 0.0)
    target: tuple[float, float, float] = (0.0, 0.0, -1.0)
    near: float = 0.01
    far: float = 10000.0
    scale_mode: str = "relative"

    def to_dict(self) -> dict[str, Any]:
        return {
            "position": list(self.position),
            "target": list(self.target),
            "fov_x_degrees": float(self.fov_x_degrees),
            "fov_y_degrees": float(self.fov_y_degrees),
            "near": float(self.near),
            "far": float(self.far),
            "scale_mode": self.scale_mode,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ReconstructedCamera:
        pos = data.get("position", (0.0, 0.0, 0.0))
        target = data.get("target", (0.0, 0.0, -1.0))
        return cls(
            position=(float(pos[0]), float(pos[1]), float(pos[2])),
            target=(float(target[0]), float(target[1]), float(target[2])),
            fov_x_degrees=float(data.get("fov_x_degrees", 53.0)),
            fov_y_degrees=float(data.get("fov_y_degrees", 53.0)),
            near=float(data.get("near", 0.01)),
            far=float(data.get("far", 10000.0)),
            scale_mode=str(data.get("scale_mode", "relative")),
        )


@dataclass(slots=True)
class ReconstructedPlane:
    plane_type: str
    center: tuple[float, float, float]
    normal: tuple[float, float, float]
    size: tuple[float, float]
    confidence: float
    inlier_ratio: float = 0.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "plane_type": self.plane_type,
            "center": list(self.center),
            "normal": list(self.normal),
            "size": list(self.size),
            "confidence": float(self.confidence),
            "inlier_ratio": float(self.inlier_ratio),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ReconstructedPlane:
        c = data["center"]
        n = data["normal"]
        s = data["size"]
        return cls(
            plane_type=str(data["plane_type"]),
            center=(float(c[0]), float(c[1]), float(c[2])),
            normal=(float(n[0]), float(n[1]), float(n[2])),
            size=(float(s[0]), float(s[1])),
            confidence=float(data.get("confidence", 0.0)),
            inlier_ratio=float(data.get("inlier_ratio", 0.0)),
        )


@dataclass(slots=True)
class ReconstructedAsset:
    role: str
    asset_path: str
    triangle_count: int
    textured: bool
    confidence: float

    def to_dict(self) -> dict[str, Any]:
        return {
            "role": self.role,
            "asset_path": self.asset_path,
            "triangle_count": int(self.triangle_count),
            "textured": bool(self.textured),
            "confidence": float(self.confidence),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ReconstructedAsset:
        return cls(
            role=str(data["role"]),
            asset_path=str(data["asset_path"]),
            triangle_count=int(data["triangle_count"]),
            textured=bool(data["textured"]),
            confidence=float(data["confidence"]),
        )


@dataclass(slots=True)
class ReconstructionMetrics:
    duration_seconds: float = 0.0
    triangle_count: int = 0
    ground_confidence: float = 0.0
    warnings_count: int = 0

    def to_dict(self) -> dict[str, Any]:
        return {
            "duration_seconds": float(self.duration_seconds),
            "triangle_count": int(self.triangle_count),
            "ground_confidence": float(self.ground_confidence),
            "warnings_count": int(self.warnings_count),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ReconstructionMetrics:
        return cls(
            duration_seconds=float(data.get("duration_seconds", 0.0)),
            triangle_count=int(data.get("triangle_count", 0)),
            ground_confidence=float(data.get("ground_confidence", 0.0)),
            warnings_count=int(data.get("warnings_count", 0)),
        )


@dataclass(slots=True)
class ReconstructionResult:
    provider: str
    mode: str
    camera: ReconstructedCamera
    environment_asset: ReconstructedAsset
    planes: list[ReconstructedPlane] = field(default_factory=list)
    metrics: ReconstructionMetrics = field(default_factory=ReconstructionMetrics)
    warnings: list[str] = field(default_factory=list)
    confidence: float = 1.0

    def to_dict(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "mode": self.mode,
            "camera": self.camera.to_dict(),
            "environment_asset": self.environment_asset.to_dict(),
            "planes": [p.to_dict() for p in self.planes],
            "metrics": self.metrics.to_dict(),
            "warnings": list(self.warnings),
            "confidence": float(self.confidence),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ReconstructionResult:
        return cls(
            provider=str(data["provider"]),
            mode=str(data["mode"]),
            camera=ReconstructedCamera.from_dict(data["camera"]),
            environment_asset=ReconstructedAsset.from_dict(data["environment_asset"]),
            planes=[ReconstructedPlane.from_dict(p) for p in data.get("planes", [])],
            metrics=ReconstructionMetrics.from_dict(data.get("metrics", {})),
            warnings=[str(w) for w in data.get("warnings", [])],
            confidence=float(data.get("confidence", 1.0)),
        )
