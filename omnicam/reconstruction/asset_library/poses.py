"""Pick a human pose from the shape of the fitted box.

A single frontal detection never tells us what a person is *doing*, but the
box proportions are a decent prior: a tall, narrow box is someone standing, a
low box that is deep front-to-back is someone sitting, a low flat box is
someone lying down. The chosen name must exist in the entry's ``poses`` map;
otherwise the first declared pose is used.
"""

from __future__ import annotations

from .types import AssetEntry

#: Ordered rules: (name, predicate on (width, height, depth) in metres).
_STANDING = "standing"
_SITTING = "sitting"
_LYING = "lying"
_CROUCHING = "crouching"


def select_pose(entry: AssetEntry, box_size: tuple[float, float, float]) -> str:
    """Return a pose name present in ``entry.poses``."""
    poses = entry.poses
    if not poses:
        return ""
    w, h, d = (max(1e-3, float(v)) for v in box_size)
    ground_span = max(w, d)

    def pick(name: str) -> str | None:
        return name if name in poses else None

    if h >= 1.4 and h >= 1.6 * ground_span:
        choice = pick(_STANDING)
    elif h < 0.8 and ground_span > 1.3:
        choice = pick(_LYING)
    elif h < 1.3 and d >= 0.45:
        choice = pick(_SITTING)
    elif h < 1.3:
        choice = pick(_CROUCHING) or pick(_SITTING)
    else:
        choice = pick(_STANDING)

    return choice or next(iter(poses))
