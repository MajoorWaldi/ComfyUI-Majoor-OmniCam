"""OmniCam starter asset library bootstrap.

An *explicit* developer / user pipeline that resolves approved CC0 Kenney
packs, inventories and validates their GLB contents, curates a small
previs-oriented starter selection, installs the chosen files under the unified
asset library (``<input>/omnicam/library/``) and records a provenance
lockfile + report. Nothing here ever runs implicitly at ComfyUI or Director
start-up (plan sections 7 and 44).

The public surface is the CLI in :mod:`omnicam.assets.bootstrap.cli`; every
other module is a focused, independently testable stage.
"""

from __future__ import annotations

from .source_registry import (
    SourceDefinition,
    load_source_registry,
    select_sources,
)
from .types import BootstrapError

__all__ = [
    "BootstrapError",
    "SourceDefinition",
    "load_source_registry",
    "select_sources",
]
