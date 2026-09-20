"""Role-conflict detection across declared references (doc section 12.9).

The compiler never guesses which reference wins when two claim the same role
without enough information to separate them -- it reports a WARNING and lets
the artist resolve it with a narrower temporal range, an explicit ignore, or
accepting that the target model itself resolves the ambiguity.
"""

from __future__ import annotations

from itertools import combinations

from ..monitor.result import Check
from .model import ReferenceSpec


def _overlaps(a: ReferenceSpec, b: ReferenceSpec) -> bool:
    """Whether two references are active over the same span.

    ``None`` means "the whole shot" (doc 12.3's default), so it overlaps
    everything; otherwise this is a standard half-open interval overlap test.
    """
    if a.temporal_range is None or b.temporal_range is None:
        return True
    a_start, a_end = a.temporal_range
    b_start, b_end = b.temporal_range
    return a_start < b_end and b_start < a_end


def detect_role_conflicts(references: tuple[ReferenceSpec, ...]) -> list[Check]:
    """One WARNING Check per pair of references that overlap on an unresolved role."""
    checks: list[Check] = []
    for a, b in combinations(references, 2):
        shared = (set(a.roles) - set(a.ignore)) & (set(b.roles) - set(b.ignore))
        if not shared or not _overlaps(a, b):
            continue
        roles = ", ".join(sorted(shared))
        checks.append(Check(
            id="role_conflict",
            label=f"Role conflict: {a.id!r} and {b.id!r} both claim {roles}",
            state="WARNING",
            message=(
                f"{a.id!r} and {b.id!r} both declare {roles} over the same time range with no "
                "priority between them. Give one a narrower temporal_range, remove the shared "
                "role from one side's roles or ignore list, or accept that the target model "
                "resolves the ambiguity on its own."
            ),
        ))
    return checks
