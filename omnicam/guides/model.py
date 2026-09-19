"""Model-agnostic guide-compiler vocabulary: OmniIR (P0).

This is a transient, compiler-side intermediate representation. Nothing here
is serialized into MotionScene -- the schema stays exactly what it was before
this package existed. A ``ShotCompileIR`` lives for the duration of one
``profile.compile()`` call and is thrown away after.

Pure Python, no ComfyUI imports: this module has to be importable outside a
running ComfyUI, same as every other ``core``/``guides`` module.
"""

from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from typing import Any

#: What a reference source is understood to be good for.
REFERENCE_ROLES = frozenset({
    "camera_motion", "camera_framing", "camera_pacing", "composition",
    "spatial_layout", "blocking", "subject_trajectory", "subject_action",
    "identity", "design", "materials", "lighting", "color", "atmosphere",
    "audio_voice", "audio_rhythm",
})

#: How honestly a compiled control maps onto the target's real capabilities.
MAPPING_QUALITIES = frozenset({"DIRECT", "CONDITIONAL", "APPROXIMATED", "UNSUPPORTED"})

_MEDIA_TYPES = frozenset({"image", "video", "audio", "guide"})


def validate_reference_role(value: Any) -> str:
    if value not in REFERENCE_ROLES:
        raise ValueError(f"reference role must be one of {sorted(REFERENCE_ROLES)}")
    return str(value)


def validate_mapping_quality(value: Any) -> str:
    if value not in MAPPING_QUALITIES:
        raise ValueError(f"mapping quality must be one of {sorted(MAPPING_QUALITIES)}")
    return str(value)


def _role_tuple(values: Any, *, name: str, restrict_vocabulary: bool) -> tuple[str, ...]:
    if isinstance(values, str) or not hasattr(values, "__iter__"):
        raise TypeError(f"{name} must be an iterable of strings")
    result: list[str] = []
    for value in values:
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{name} entries must be non-empty strings")
        if restrict_vocabulary:
            validate_reference_role(value)
        if value not in result:
            result.append(value)
    return tuple(result)


@dataclass(frozen=True, slots=True)
class ReferenceSpec:
    """One declared reference source and what it is good for (doc section 8.1)."""

    id: str
    media_type: str
    slot_hint: int | None
    roles: tuple[str, ...]
    ignore: tuple[str, ...] = ()
    temporal_range: tuple[float, float] | None = None
    strength: float | None = None
    source: str = "omnicam_guide"
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not isinstance(self.id, str) or not self.id.strip():
            raise ValueError("ReferenceSpec.id must be a non-empty string")
        if self.media_type not in _MEDIA_TYPES:
            raise ValueError(f"media_type must be one of {sorted(_MEDIA_TYPES)}")
        if self.slot_hint is not None and (
            isinstance(self.slot_hint, bool) or not isinstance(self.slot_hint, int) or self.slot_hint <= 0
        ):
            raise ValueError("slot_hint must be a positive integer or None")
        object.__setattr__(self, "roles", _role_tuple(self.roles, name="roles", restrict_vocabulary=True))
        object.__setattr__(self, "ignore", _role_tuple(self.ignore, name="ignore", restrict_vocabulary=True))
        if self.temporal_range is not None:
            start, end = self.temporal_range
            start, end = float(start), float(end)
            if not (math.isfinite(start) and math.isfinite(end)) or start < 0 or end <= start:
                raise ValueError("temporal_range must be (start, end) with 0 <= start < end")
            object.__setattr__(self, "temporal_range", (start, end))
        if self.strength is not None:
            strength = float(self.strength)
            if not math.isfinite(strength) or not (0.0 <= strength <= 1.0):
                raise ValueError("strength must be between 0.0 and 1.0")
            object.__setattr__(self, "strength", strength)
        if not isinstance(self.source, str) or not self.source.strip():
            raise ValueError("source must be a non-empty string")
        if not isinstance(self.metadata, dict):
            raise TypeError("metadata must be a dict")
        object.__setattr__(self, "metadata", dict(self.metadata))


@dataclass(frozen=True, slots=True)
class ShotIntent:
    """What the final generation should preserve, change or ignore (section 8.2).

    Deliberately not restricted to ``REFERENCE_ROLES``: ``change``/``ignore``
    carry broader concepts the doc itself uses loosely (``final_appearance``,
    ``proxy_materials``, ``diagnostic_markers``) that are not reference roles.
    """

    preserve: tuple[str, ...] = ()
    change: tuple[str, ...] = ()
    ignore: tuple[str, ...] = ()

    def __post_init__(self) -> None:
        object.__setattr__(self, "preserve", _role_tuple(self.preserve, name="preserve", restrict_vocabulary=False))
        object.__setattr__(self, "change", _role_tuple(self.change, name="change", restrict_vocabulary=False))
        object.__setattr__(self, "ignore", _role_tuple(self.ignore, name="ignore", restrict_vocabulary=False))

    @property
    def net_preserve(self) -> tuple[str, ...]:
        """``preserve`` minus anything ``ignore`` retracts, order preserved."""
        ignored = set(self.ignore)
        return tuple(item for item in self.preserve if item not in ignored)


def omnicam_guide_reference(
    *, slot_hint: int, roles: tuple[str, ...], ignore: tuple[str, ...] = (), media_type: str = "guide",
) -> ReferenceSpec:
    """The one auto-created ReferenceSpec P0 needs (doc section 8.5)."""
    return ReferenceSpec(
        id="omnicam_guide",
        media_type=media_type,
        slot_hint=slot_hint,
        roles=roles,
        ignore=ignore,
        temporal_range=None,
        strength=None,
        source="omnicam_guide",
        metadata={},
    )


def parse_reference_plan(raw: str) -> tuple[ReferenceSpec, ...]:
    """Parse the Monitor's ``reference_plan_json`` widget into declared ReferenceSpecs.

    Never returns the auto-created ``omnicam_guide`` entry -- that one is
    compiled separately and always occupies its own slot. An empty or blank
    string means "no additional references declared", not an error: P2 is
    opt-in, and every profile must keep compiling exactly as it did before a
    plan was ever authored.
    """
    text = (raw or "").strip()
    if not text:
        return ()
    try:
        payload = json.loads(text)
    except json.JSONDecodeError as error:
        raise ValueError(f"reference_plan_json is not valid JSON: {error}") from error
    if not isinstance(payload, list):
        raise ValueError("reference_plan_json must be a JSON array of reference objects")

    specs: list[ReferenceSpec] = []
    for index, entry in enumerate(payload):
        if not isinstance(entry, dict):
            raise ValueError(f"reference_plan_json[{index}] must be an object")
        entry_id = str(entry.get("id") or f"reference_{index + 1}")
        try:
            spec = ReferenceSpec(
                id=entry_id,
                media_type=str(entry.get("media_type", "")),
                slot_hint=entry.get("slot_hint"),
                roles=tuple(entry.get("roles") or ()),
                ignore=tuple(entry.get("ignore") or ()),
                temporal_range=tuple(entry["temporal_range"]) if entry.get("temporal_range") else None,
                strength=entry.get("strength"),
                source=str(entry.get("source") or "external"),
                metadata=dict(entry.get("metadata") or {}),
            )
        except (TypeError, ValueError) as error:
            raise ValueError(f"reference_plan_json[{index}] ({entry_id!r}): {error}") from error
        specs.append(spec)

    ids = [spec.id for spec in specs]
    if len(ids) != len(set(ids)):
        raise ValueError("reference_plan_json entries must have unique ids")
    if any(spec.id == "omnicam_guide" for spec in specs):
        raise ValueError("reference_plan_json must not declare the reserved id 'omnicam_guide'")
    return tuple(specs)


@dataclass(frozen=True, slots=True)
class CameraPhase:
    """One timecoded run of stable dominant camera motion (doc section 9)."""

    start_seconds: float
    end_seconds: float
    axis: str
    phrase: str
    pace: str
    magnitudes: dict[str, float]
    peak_speed: float

    def __post_init__(self) -> None:
        start = float(self.start_seconds)
        end = float(self.end_seconds)
        if not (math.isfinite(start) and math.isfinite(end)) or end < start:
            raise ValueError("end_seconds must be >= start_seconds")
        object.__setattr__(self, "start_seconds", start)
        object.__setattr__(self, "end_seconds", end)
        if not isinstance(self.axis, str) or not self.axis.strip():
            raise ValueError("axis must be a non-empty string")
        if not isinstance(self.phrase, str) or not self.phrase.strip():
            raise ValueError("phrase must be a non-empty string")
        if self.pace not in {"steady", "accelerating", "decelerating"}:
            raise ValueError("pace must be one of 'steady', 'accelerating', 'decelerating'")
        if not isinstance(self.magnitudes, dict):
            raise TypeError("magnitudes must be a dict")
        object.__setattr__(self, "magnitudes", dict(self.magnitudes))
        object.__setattr__(self, "peak_speed", float(self.peak_speed))


@dataclass(frozen=True, slots=True)
class ShotCompileIR:
    """Transient compiler-side IR (doc section 8). Never persisted."""

    camera_phases: tuple[CameraPhase, ...]
    references: tuple[ReferenceSpec, ...]
    intent: ShotIntent
    mapping_quality: dict[str, str]

    def __post_init__(self) -> None:
        phases = tuple(self.camera_phases)
        if not all(isinstance(phase, CameraPhase) for phase in phases):
            raise TypeError("camera_phases must contain CameraPhase values")
        object.__setattr__(self, "camera_phases", phases)

        references = tuple(self.references)
        if not all(isinstance(reference, ReferenceSpec) for reference in references):
            raise TypeError("references must contain ReferenceSpec values")
        object.__setattr__(self, "references", references)

        if not isinstance(self.intent, ShotIntent):
            raise TypeError("intent must be a ShotIntent")

        if not isinstance(self.mapping_quality, dict):
            raise TypeError("mapping_quality must be a dict")
        for value in self.mapping_quality.values():
            validate_mapping_quality(value)
        object.__setattr__(self, "mapping_quality", dict(self.mapping_quality))
