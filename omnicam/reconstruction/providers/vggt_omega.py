"""Research-only VGGT-Omega adapter.

Provider id ``vggt_omega_research``. Explicitly non-commercial and never
auto-selected: OmniCam does not fall back from ``VGGT-1B-Commercial`` to Omega
on its own. The Aug 18 2026 benchmark-contamination notice affects benchmark
interpretation, not basic downstream operation, so it is a compatibility note,
not an availability failure.
"""

from __future__ import annotations

from .base import ProviderCapabilities
from .vggt import VggtProvider

LICENSE_LABEL = "FAIR Noncommercial Research License"


class VggtOmegaResearchProvider(VggtProvider):
    provider_id = "vggt_omega_research"
    adapter_version = "1"
    commercial_use = False

    def capabilities(self) -> ProviderCapabilities:
        caps = super().capabilities()
        caps.metadata.update(
            {
                "commercial_use": False,
                "license_label": LICENSE_LABEL,
                "auto_select": False,
                "display_name": "VGGT-Ω — Research / noncommercial",
                "benchmark_note": (
                    "Aug 18 2026 benchmark-contamination notice affects benchmark "
                    "interpretation only, not downstream operation."
                ),
            }
        )
        caps.recommended = False
        return caps


__all__ = ["LICENSE_LABEL", "VggtOmegaResearchProvider"]
