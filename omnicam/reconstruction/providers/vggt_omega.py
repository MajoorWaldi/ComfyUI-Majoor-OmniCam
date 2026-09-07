"""Research-only VGGT-Ω adapter.

Provider id ``vggt_omega_research``. Explicitly non-commercial and never
auto-selected. It shares the VGGT forward pass but must run its **own**
checkpoint: a folder under ``models/geometry_estimation/vggt/`` whose name
contains ``omega`` (case-insensitive). Without one the provider reports
unavailable rather than quietly running the commercial ``VGGT-1B-Commercial``
weights -- announcing a model it is not executing (audit F11).
"""

from __future__ import annotations

from pathlib import Path

from ..errors import ReconRequestInvalidError, ReconVggtModelMissingError
from .base import ProviderCapabilities
from .vggt import VggtProvider

LICENSE_LABEL = "FAIR Noncommercial Research License"


def _is_omega(name: str) -> bool:
    return "omega" in name.lower() or "-Ω" in name or "vggt-ω" in name.lower()


class VggtOmegaResearchProvider(VggtProvider):
    provider_id = "vggt_omega_research"
    adapter_version = "1"
    commercial_use = False

    def _omega_checkpoints(self) -> list[tuple[str, Path]]:
        return [(n, p) for n, p in self._available_checkpoints() if _is_omega(n)]

    def capabilities(self) -> ProviderCapabilities:
        caps = super().capabilities()
        omega = self._omega_checkpoints()
        if caps.available and not omega:
            caps.available = False
            caps.reason = (
                "no VGGT-Ω checkpoint installed. Place a research checkpoint whose "
                "folder name contains 'omega' under models/geometry_estimation/vggt/; "
                "this provider will not run the commercial VGGT weights."
            )
        caps.metadata.update(
            {
                "commercial_use": False,
                "license_label": LICENSE_LABEL,
                "auto_select": False,
                "display_name": "VGGT-Ω -- Research / noncommercial",
                "omega_checkpoints": [n for n, _ in omega],
                "benchmark_note": (
                    "Aug 18 2026 benchmark-contamination notice affects benchmark "
                    "interpretation only, not downstream operation."
                ),
            }
        )
        caps.recommended = False
        return caps

    def resolve_checkpoint(self, requested: str) -> Path:
        omega = {n: p for n, p in self._omega_checkpoints()}
        if not omega:
            raise ReconVggtModelMissingError(
                "no VGGT-Ω checkpoint installed (folder name must contain 'omega')"
            )
        if requested and requested != "auto":
            if requested in omega:
                return omega[requested]
            raise ReconRequestInvalidError(
                f"{requested!r} is not an installed VGGT-Ω checkpoint; available: {sorted(omega)}"
            )
        return next(iter(omega.values()))


__all__ = ["LICENSE_LABEL", "VggtOmegaResearchProvider"]
