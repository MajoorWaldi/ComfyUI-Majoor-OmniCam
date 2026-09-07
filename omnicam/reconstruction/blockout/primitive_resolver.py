"""Map a semantic label to a MotionScene primitive and a depth prior.

``min_depth_factor`` is a *minimum proxy thickness ratio* (of the object's
larger footprint extent), not a claim about real-world dimensions. A single
frontal view sees almost nothing of a TV's depth, so the resolver floors it at
a plausible value instead of letting the box collapse to a plane.
"""

from __future__ import annotations

from dataclasses import dataclass

from ...core.validation import OBJECT_TYPES


@dataclass(frozen=True, slots=True)
class PrimitiveRule:
    primitive: str
    min_depth_factor: float
    snap_to_ground: bool

    def __post_init__(self) -> None:
        if self.primitive not in OBJECT_TYPES:
            raise ValueError(f"primitive {self.primitive!r} is not a MotionScene object type")


_RULES: dict[str, PrimitiveRule] = {
    "person": PrimitiveRule("human", min_depth_factor=0.30, snap_to_ground=True),
    "television": PrimitiveRule("card", min_depth_factor=0.04, snap_to_ground=False),
    "tv": PrimitiveRule("card", min_depth_factor=0.04, snap_to_ground=False),
    "monitor": PrimitiveRule("card", min_depth_factor=0.05, snap_to_ground=False),
    "screen": PrimitiveRule("card", min_depth_factor=0.05, snap_to_ground=False),
    "window": PrimitiveRule("card", min_depth_factor=0.02, snap_to_ground=False),
    "picture": PrimitiveRule("card", min_depth_factor=0.02, snap_to_ground=False),
    "painting": PrimitiveRule("card", min_depth_factor=0.02, snap_to_ground=False),
    "door": PrimitiveRule("card", min_depth_factor=0.03, snap_to_ground=True),
    "sofa": PrimitiveRule("cube", min_depth_factor=0.35, snap_to_ground=True),
    "couch": PrimitiveRule("cube", min_depth_factor=0.35, snap_to_ground=True),
    "armchair": PrimitiveRule("cube", min_depth_factor=0.33, snap_to_ground=True),
    "bed": PrimitiveRule("cube", min_depth_factor=0.45, snap_to_ground=True),
    "table": PrimitiveRule("cube", min_depth_factor=0.25, snap_to_ground=True),
    "desk": PrimitiveRule("cube", min_depth_factor=0.25, snap_to_ground=True),
    "chair": PrimitiveRule("cube", min_depth_factor=0.30, snap_to_ground=True),
    "cabinet": PrimitiveRule("cube", min_depth_factor=0.30, snap_to_ground=True),
    "shelf": PrimitiveRule("cube", min_depth_factor=0.22, snap_to_ground=True),
    "bookshelf": PrimitiveRule("cube", min_depth_factor=0.22, snap_to_ground=True),
    "counter": PrimitiveRule("cube", min_depth_factor=0.30, snap_to_ground=True),
    "plant": PrimitiveRule("cube", min_depth_factor=0.40, snap_to_ground=True),
    "lamp": PrimitiveRule("cube", min_depth_factor=0.35, snap_to_ground=True),
    "bottle": PrimitiveRule("cube", min_depth_factor=0.60, snap_to_ground=False),
    "box": PrimitiveRule("cube", min_depth_factor=0.55, snap_to_ground=False),
    "suitcase": PrimitiveRule("cube", min_depth_factor=0.35, snap_to_ground=True),
    "car": PrimitiveRule("cube", min_depth_factor=0.40, snap_to_ground=True),
}

_FALLBACK = PrimitiveRule("cube", min_depth_factor=0.20, snap_to_ground=True)


def rule_for_label(label: str) -> PrimitiveRule:
    """Resolve a rule by label, case- and whitespace-insensitively.

    Unknown labels get the conservative cube fallback (thin-ish, ground-snapped)
    rather than an error, so a custom taxonomy still produces closed proxies.
    """
    key = str(label).strip().lower()
    if key in _RULES:
        return _RULES[key]
    # tolerate simple plurals / compound tails ("dining table", "office chair")
    for known, rule in _RULES.items():
        if key.endswith(known) or key.endswith(known + "s"):
            return rule
    return _FALLBACK
