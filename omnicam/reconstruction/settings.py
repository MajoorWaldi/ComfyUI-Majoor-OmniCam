"""Reconstruction settings and presets."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

KNOWN_PROVIDERS = frozenset({"comfy_moge", "fake", "vggt", "sam3d", "lucida"})
KNOWN_MODES = frozenset({"geometry", "layout"})
KNOWN_QUALITIES = frozenset({"fast", "balanced", "high", "custom"})

MAX_TRIANGLE_BUDGET = 500_000

QUALITY_PRESETS: dict[str, dict[str, Any]] = {
    "fast": {
        "resolution_level": 5,
        "initial_decimation": 4,
        "triangle_budget": 40_000,
        "discontinuity_threshold": 0.06,
    },
    "balanced": {
        "resolution_level": 7,
        "initial_decimation": 2,
        "triangle_budget": 120_000,
        "discontinuity_threshold": 0.04,
    },
    "high": {
        "resolution_level": 9,
        "initial_decimation": 1,
        "triangle_budget": 250_000,
        "discontinuity_threshold": 0.03,
    },
}


@dataclass(slots=True)
class ReconstructionSettings:
    provider: str = "comfy_moge"
    mode: str = "geometry"
    quality: str = "balanced"
    recover_fov: bool = True
    source_texture: bool = True
    detect_ground: bool = True
    detect_walls: bool = False
    triangle_budget: int = 120_000
    discontinuity_threshold: float = 0.04
    scene_scale: float = 1.0

    def __post_init__(self) -> None:
        if self.provider not in KNOWN_PROVIDERS:
            raise ValueError(
                f"Unknown reconstruction provider {self.provider!r}; expected one of {sorted(KNOWN_PROVIDERS)}"
            )
        if self.mode not in KNOWN_MODES:
            raise ValueError(
                f"Unknown reconstruction mode {self.mode!r}; expected one of {sorted(KNOWN_MODES)}"
            )
        if not (1 <= self.triangle_budget <= MAX_TRIANGLE_BUDGET):
            raise ValueError(
                f"triangle_budget must be between 1 and {MAX_TRIANGLE_BUDGET}, got {self.triangle_budget}"
            )
        if not (0.0 <= self.discontinuity_threshold <= 1.0):
            raise ValueError(
                f"discontinuity_threshold must be in [0.0, 1.0], got {self.discontinuity_threshold}"
            )
        if self.scene_scale <= 0.0:
            raise ValueError(f"scene_scale must be positive, got {self.scene_scale}")

    def to_dict(self) -> dict[str, Any]:
        return {
            "provider": self.provider,
            "mode": self.mode,
            "quality": self.quality,
            "recover_fov": bool(self.recover_fov),
            "source_texture": bool(self.source_texture),
            "detect_ground": bool(self.detect_ground),
            "detect_walls": bool(self.detect_walls),
            "triangle_budget": int(self.triangle_budget),
            "discontinuity_threshold": float(self.discontinuity_threshold),
            "scene_scale": float(self.scene_scale),
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> ReconstructionSettings:
        if not isinstance(data, dict):
            raise TypeError(f"Expected dict for ReconstructionSettings, got {type(data).__name__}")
        return cls(
            provider=str(data.get("provider", "comfy_moge")),
            mode=str(data.get("mode", "geometry")),
            quality=str(data.get("quality", "balanced")),
            recover_fov=bool(data.get("recover_fov", True)),
            source_texture=bool(data.get("source_texture", True)),
            detect_ground=bool(data.get("detect_ground", True)),
            detect_walls=bool(data.get("detect_walls", False)),
            triangle_budget=int(data.get("triangle_budget", 120_000)),
            discontinuity_threshold=float(data.get("discontinuity_threshold", 0.04)),
            scene_scale=float(data.get("scene_scale", 1.0)),
        )
