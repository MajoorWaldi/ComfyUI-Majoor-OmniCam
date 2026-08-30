from __future__ import annotations

import hashlib
import json
from typing import Any


def monitor_fingerprint(*, track: dict[str, Any], adapter: str, settings: dict[str, Any]) -> str:
    encoded = json.dumps(
        {"track": track, "adapter": adapter, "settings": settings},
        sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False,
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()
