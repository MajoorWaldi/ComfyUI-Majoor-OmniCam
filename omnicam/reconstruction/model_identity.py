"""Exact-but-bounded model identity for reconstruction cache keys.

A reconstruction result depends on *which* checkpoint produced it, not just on
the provider id. Swapping ``sam3.1_multiplex_fp16.safetensors`` for a finetune
of the same name must invalidate cached blockouts.

Hashing a multi-gigabyte checkpoint on every run is not acceptable, so the
default identity is the cheap tuple ``(resolved name, size, mtime_ns, adapter
version)``. A caller that already knows a strong digest (from a model manifest)
may pass it as ``declared_digest`` for a stronger key; it is never computed
here.
"""

from __future__ import annotations

import hashlib
import json
import os
from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class ModelIdentity:
    provider_id: str
    adapter_version: str
    model_name: str
    file_size: int
    mtime_ns: int
    declared_digest: str = ""

    @property
    def cache_token(self) -> str:
        raw = json.dumps(asdict(self), sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]

    def to_dict(self) -> dict[str, object]:
        return {**asdict(self), "cache_token": self.cache_token}


def file_model_identity(
    path: str | os.PathLike[str],
    *,
    provider_id: str,
    adapter_version: str,
    declared_digest: str = "",
) -> ModelIdentity:
    """Build a :class:`ModelIdentity` from a checkpoint file on disk.

    ``model_name`` is the canonical resolved basename so two different absolute
    paths to the same managed file collide, while a genuinely different file
    (renamed, re-saved, finetuned) does not.
    """
    resolved = Path(path).resolve()
    stat = resolved.stat()
    return ModelIdentity(
        provider_id=str(provider_id),
        adapter_version=str(adapter_version),
        model_name=resolved.name,
        file_size=int(stat.st_size),
        mtime_ns=int(stat.st_mtime_ns),
        declared_digest=str(declared_digest),
    )


def missing_model_identity(*, provider_id: str, adapter_version: str, reason: str = "missing") -> ModelIdentity:
    """Identity token for a provider stage that has no checkpoint (e.g. the
    fake provider, or ``segmentation_provider="none"``). Still distinct per
    provider/adapter so enabling a stage later invalidates the cache."""
    return ModelIdentity(
        provider_id=str(provider_id),
        adapter_version=str(adapter_version),
        model_name=f"<{reason}>",
        file_size=0,
        mtime_ns=0,
    )
