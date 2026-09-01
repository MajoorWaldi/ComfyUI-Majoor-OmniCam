"""Explicit registry for model motion profiles."""

from __future__ import annotations

from collections.abc import Iterable

from .base import (
    MotionProfile,
    validate_frame_policy,
    validate_profile_id,
    validate_semantic,
)


class ProfileRegistry:
    """Resolve only the profile ID selected by the workflow.

    Capability discovery belongs to preflight reporting. It must never choose a
    different compiler because two profiles happen to share a semantic.
    """

    def __init__(self, profiles: Iterable[MotionProfile] = ()) -> None:
        self._profiles: dict[str, MotionProfile] = {}
        for profile in profiles:
            self.register(profile)

    @property
    def ids(self) -> tuple[str, ...]:
        return tuple(sorted(self._profiles))

    def register(self, profile: MotionProfile) -> None:
        profile_id = validate_profile_id(getattr(profile, "id", None))
        display_name = getattr(profile, "display_name", None)
        if not isinstance(display_name, str) or not display_name.strip():
            raise ValueError("profile display_name must be a non-empty string")
        validate_semantic(getattr(profile, "semantic", None))
        validate_frame_policy(getattr(profile, "frame_policy", None))
        for method_name in ("resolve_timeline", "preflight", "compile"):
            if not callable(getattr(profile, method_name, None)):
                raise TypeError(f"profile {profile_id!r} must implement {method_name}()")
        if profile_id in self._profiles:
            raise ValueError(f"duplicate profile id: {profile_id!r}")
        self._profiles[profile_id] = profile

    def require(self, profile_id: str) -> MotionProfile:
        """Return the exact requested profile or fail without fallback."""
        try:
            return self._profiles[profile_id]
        except KeyError as error:
            raise KeyError(f"unknown motion profile: {profile_id!r}") from error

