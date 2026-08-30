"""The target-model roster the Health panel grades against.

One place where the per-adapter limit tables are collected, so the frontend
never carries a second copy of them: it fetches this roster and grades locally
against the numbers Python owns.
"""

from __future__ import annotations

from typing import Any

from ..core.motion_health import GENERIC_RECOMMENDED_MOTION_LIMITS, WARN_RATIO
from .ati import ATI_RECOMMENDED_MOTION_LIMITS
from .h3 import H3_RECOMMENDED_MOTION_LIMITS
from .ltx import LTX_RECOMMENDED_MOTION_LIMITS
from .wan import WAN_RECOMMENDED_MOTION_LIMITS

MOTION_PROFILES: dict[str, dict[str, Any]] = {
    "generic": {"display_name": "Generic", "limits": GENERIC_RECOMMENDED_MOTION_LIMITS, "adapter": None},
    "h3": {"display_name": "MiniMax H3", "limits": H3_RECOMMENDED_MOTION_LIMITS, "adapter": "h3"},
    "wan_native": {"display_name": "Wan Native", "limits": WAN_RECOMMENDED_MOTION_LIMITS, "adapter": "wan_native"},
    "wan_ati": {"display_name": "ATI", "limits": ATI_RECOMMENDED_MOTION_LIMITS, "adapter": "wan_ati"},
    "ltx": {"display_name": "LTX", "limits": LTX_RECOMMENDED_MOTION_LIMITS, "adapter": "ltx"},
}

DEFAULT_PROFILE = "generic"


def profile_limits(profile: str | None) -> dict[str, Any]:
    """Limits for a profile id, falling back to the generic table."""
    entry = MOTION_PROFILES.get(str(profile or DEFAULT_PROFILE), MOTION_PROFILES[DEFAULT_PROFILE])
    return dict(entry["limits"])


def motion_profile_roster() -> dict[str, Any]:
    """Serializable roster for the frontend Health panel."""
    return {
        "default": DEFAULT_PROFILE,
        "warn_ratio": WARN_RATIO,
        "profiles": [
            {"id": key, "display_name": entry["display_name"], "adapter": entry["adapter"], "limits": dict(entry["limits"])}
            for key, entry in MOTION_PROFILES.items()
        ],
    }
