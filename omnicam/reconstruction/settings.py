"""Reconstruction settings and presets."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

KNOWN_PROVIDERS = frozenset({"comfy_moge", "fake", "vggt", "vggt_omega_research", "sam3d", "lucida"})
#: ``geometry`` and ``layout`` are the historical mode names kept for backward
#: compatibility with serialized workflows; ``resolved_mode()`` maps them onto
#: the current names. New code should read ``resolved_mode()`` rather than the
#: raw ``mode`` field.
KNOWN_MODES = frozenset(
    {"geometry", "layout", "depth_mesh", "blockout", "hybrid", "scan"}
)
KNOWN_SOURCE_MODES = frozenset({"auto", "single_image", "multi_view", "video_scan"})

#: Scan view counts per quality preset (design doc section 10.3):
#: (VGGT geometry views, SAM3 segmentation views). ``custom`` keeps whatever
#: the explicit ``vggt_max_views`` / ``vggt_segmentation_views`` fields hold.
SCAN_QUALITY_PRESETS: dict[str, tuple[int, int]] = {
    "fast": (12, 3),
    "balanced": (24, 6),
    "high": (48, 10),
}
KNOWN_SEGMENTATION_PROVIDERS = frozenset({"none", "comfy_sam3", "fake"})
KNOWN_COMPLETION_PROVIDERS = frozenset({"none", "sam3d_objects", "fake"})
KNOWN_COMPLETION_POLICIES = frozenset(
    {"off", "low_depth_confidence", "selected", "all_bounded"}
)
#: Blockout asset-library retrieval (design: "bibliothèque 3D"):
#:  ``off``     -- deterministic boxes only (default, no library needed)
#:  ``proxy``   -- add a GLB from the library inside each matched box, box kept
#:  ``replace`` -- add the GLB and hide the box it stands in for
KNOWN_BLOCKOUT_ASSET_MODES = frozenset({"off", "proxy", "replace"})
KNOWN_QUALITIES = frozenset({"fast", "balanced", "high", "custom"})

#: Legacy mode -> current mode. Applied by ``resolved_mode()`` only; the raw
#: ``mode`` value is preserved through ``to_dict``/``from_dict`` so existing
#: tests and stored workflows keep the value they were saved with.
#:
#: Both legacy names ran the MoGe-only depth-mesh + plane-detection pipeline;
#: neither ever required a segmentation checkpoint. They therefore map to
#: ``depth_mesh`` (not ``blockout``/``hybrid``), so a workflow saved as
#: ``layout`` keeps working with MoGe alone. A user who wants the new semantic
#: primitives selects ``blockout``/``hybrid`` explicitly.
_MODE_ALIASES = {
    "geometry": "depth_mesh",
    "layout": "depth_mesh",
}

MAX_TRIANGLE_BUDGET = 500_000
MAX_SEMANTIC_LABEL_LENGTH = 64
MAX_SEMANTIC_LABELS = 64

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
    # "auto" (default) keeps today's behavior of silently picking the
    # provider's first checkpoint; anything else names one explicitly, so a
    # user with several geometry_estimation checkpoints installed is not
    # stuck on whichever one folder_paths happens to list first.
    checkpoint: str = "auto"

    # --- semantic blockout + multi-view (added for the SAM3/VGGT plan) ---
    # All fields below have defaults that reproduce today's depth-mesh-only
    # behavior, so a workflow saved before this change deserializes unchanged.
    source_mode: str = "auto"  # auto | single_image | multi_view
    segmentation_provider: str = "comfy_sam3"
    completion_provider: str = "none"
    sam3_checkpoint: str = "auto"
    sam3_threshold: float = 0.55
    sam3_refine_iterations: int = 2
    semantic_labels: tuple[str, ...] = ()
    min_instance_area_ratio: float = 0.0015
    instance_iou_dedup: float = 0.72
    max_blockout_objects: int = 24
    completion_policy: str = "off"
    max_completion_objects: int = 4
    #: Asset-library retrieval. ``blockout_assets`` in KNOWN_BLOCKOUT_ASSET_MODES;
    #: ``asset_library_path`` empty = the managed default
    #: (<input>/majoor_omnicam/blockout_library), otherwise an explicit folder.
    blockout_assets: str = "off"
    asset_library_path: str = ""
    vggt_checkpoint: str = "auto"
    vggt_max_views: int = 24
    vggt_segmentation_views: int = 6
    save_completion_debug: bool = False

    def __post_init__(self) -> None:
        if self.provider not in KNOWN_PROVIDERS:
            raise ValueError(
                f"Unknown reconstruction provider {self.provider!r}; expected one of {sorted(KNOWN_PROVIDERS)}"
            )
        if self.mode not in KNOWN_MODES:
            raise ValueError(
                f"Unknown reconstruction mode {self.mode!r}; expected one of {sorted(KNOWN_MODES)}"
            )
        if self.quality not in KNOWN_QUALITIES:
            raise ValueError(
                f"Unknown reconstruction quality {self.quality!r}; expected one of {sorted(KNOWN_QUALITIES)}"
            )
        if self.source_mode not in KNOWN_SOURCE_MODES:
            raise ValueError(
                f"Unknown source_mode {self.source_mode!r}; expected one of {sorted(KNOWN_SOURCE_MODES)}"
            )
        if self.segmentation_provider not in KNOWN_SEGMENTATION_PROVIDERS:
            raise ValueError(
                f"Unknown segmentation_provider {self.segmentation_provider!r}; "
                f"expected one of {sorted(KNOWN_SEGMENTATION_PROVIDERS)}"
            )
        if self.completion_provider not in KNOWN_COMPLETION_PROVIDERS:
            raise ValueError(
                f"Unknown completion_provider {self.completion_provider!r}; "
                f"expected one of {sorted(KNOWN_COMPLETION_PROVIDERS)}"
            )
        if self.completion_policy not in KNOWN_COMPLETION_POLICIES:
            raise ValueError(
                f"Unknown completion_policy {self.completion_policy!r}; "
                f"expected one of {sorted(KNOWN_COMPLETION_POLICIES)}"
            )
        if self.blockout_assets not in KNOWN_BLOCKOUT_ASSET_MODES:
            raise ValueError(
                f"Unknown blockout_assets {self.blockout_assets!r}; "
                f"expected one of {sorted(KNOWN_BLOCKOUT_ASSET_MODES)}"
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

        if not (0.0 <= self.sam3_threshold <= 1.0):
            raise ValueError(f"sam3_threshold must be in [0.0, 1.0], got {self.sam3_threshold}")
        if not (0 <= self.sam3_refine_iterations <= 5):
            raise ValueError(
                f"sam3_refine_iterations must be in [0, 5], got {self.sam3_refine_iterations}"
            )
        if not (0.0 <= self.min_instance_area_ratio <= 0.25):
            raise ValueError(
                f"min_instance_area_ratio must be in [0.0, 0.25], got {self.min_instance_area_ratio}"
            )
        if not (0.0 <= self.instance_iou_dedup <= 1.0):
            raise ValueError(
                f"instance_iou_dedup must be in [0.0, 1.0], got {self.instance_iou_dedup}"
            )
        if not (1 <= self.max_blockout_objects <= 128):
            raise ValueError(
                f"max_blockout_objects must be in [1, 128], got {self.max_blockout_objects}"
            )
        if not (0 <= self.max_completion_objects <= 16):
            raise ValueError(
                f"max_completion_objects must be in [0, 16], got {self.max_completion_objects}"
            )
        if not (2 <= self.vggt_max_views <= 128):
            raise ValueError(f"vggt_max_views must be in [2, 128], got {self.vggt_max_views}")
        seg_view_ceiling = min(self.vggt_max_views, 32)
        if not (1 <= self.vggt_segmentation_views <= seg_view_ceiling):
            raise ValueError(
                f"vggt_segmentation_views must be in [1, {seg_view_ceiling}], "
                f"got {self.vggt_segmentation_views}"
            )
        if len(self.semantic_labels) > MAX_SEMANTIC_LABELS:
            raise ValueError(
                f"semantic_labels may hold at most {MAX_SEMANTIC_LABELS} entries, "
                f"got {len(self.semantic_labels)}"
            )
        for label in self.semantic_labels:
            if len(label) > MAX_SEMANTIC_LABEL_LENGTH:
                raise ValueError(
                    f"semantic label {label!r} exceeds {MAX_SEMANTIC_LABEL_LENGTH} characters"
                )

    def scan_view_counts(self) -> tuple[int, int]:
        """(VGGT geometry views, SAM3 segmentation views) for this run.

        Driven by the quality preset (Fast 12/3, Balanced 24/6, High 48/10);
        ``custom`` quality uses the explicit ``vggt_max_views`` /
        ``vggt_segmentation_views`` fields verbatim.
        """
        preset = SCAN_QUALITY_PRESETS.get(self.quality)
        if preset is None:
            return int(self.vggt_max_views), int(self.vggt_segmentation_views)
        geom, seg = preset
        return geom, min(seg, geom, 32)

    def resolved_mode(self) -> str:
        """Current-name mode, mapping the legacy ``geometry``/``layout`` aliases.

        The raw ``mode`` field and its serialized form are left untouched so
        stored workflows keep round-tripping to the exact value they hold; only
        pipeline dispatch reads through this.
        """
        return _MODE_ALIASES.get(self.mode, self.mode)

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
            "checkpoint": self.checkpoint,
            "source_mode": self.source_mode,
            "segmentation_provider": self.segmentation_provider,
            "completion_provider": self.completion_provider,
            "sam3_checkpoint": self.sam3_checkpoint,
            "sam3_threshold": float(self.sam3_threshold),
            "sam3_refine_iterations": int(self.sam3_refine_iterations),
            "semantic_labels": list(self.semantic_labels),
            "min_instance_area_ratio": float(self.min_instance_area_ratio),
            "instance_iou_dedup": float(self.instance_iou_dedup),
            "max_blockout_objects": int(self.max_blockout_objects),
            "completion_policy": self.completion_policy,
            "max_completion_objects": int(self.max_completion_objects),
            "blockout_assets": self.blockout_assets,
            "asset_library_path": self.asset_library_path,
            "vggt_checkpoint": self.vggt_checkpoint,
            "vggt_max_views": int(self.vggt_max_views),
            "vggt_segmentation_views": int(self.vggt_segmentation_views),
            "save_completion_debug": bool(self.save_completion_debug),
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
            checkpoint=str(data.get("checkpoint", "auto")),
            source_mode=str(data.get("source_mode", "auto")),
            segmentation_provider=str(data.get("segmentation_provider", "comfy_sam3")),
            completion_provider=str(data.get("completion_provider", "none")),
            sam3_checkpoint=str(data.get("sam3_checkpoint", "auto")),
            sam3_threshold=float(data.get("sam3_threshold", 0.55)),
            sam3_refine_iterations=int(data.get("sam3_refine_iterations", 2)),
            semantic_labels=tuple(str(x) for x in data.get("semantic_labels", ()) or ()),
            min_instance_area_ratio=float(data.get("min_instance_area_ratio", 0.0015)),
            instance_iou_dedup=float(data.get("instance_iou_dedup", 0.72)),
            max_blockout_objects=int(data.get("max_blockout_objects", 24)),
            completion_policy=str(data.get("completion_policy", "off")),
            max_completion_objects=int(data.get("max_completion_objects", 4)),
            blockout_assets=str(data.get("blockout_assets", "off")),
            asset_library_path=str(data.get("asset_library_path", "")),
            vggt_checkpoint=str(data.get("vggt_checkpoint", "auto")),
            vggt_max_views=int(data.get("vggt_max_views", 24)),
            vggt_segmentation_views=int(data.get("vggt_segmentation_views", 6)),
            save_completion_debug=bool(data.get("save_completion_debug", False)),
        )
