"""Tests for provider protocol and capability reporting."""

from __future__ import annotations

import json
import sys

from omnicam.reconstruction.providers.base import (
    CancelToken,
    ProgressSink,
    ProviderCapabilities,
    ReconstructionProvider,
)
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import GeometryEvidence, ReconstructionSource


def test_provider_base_import_triggers_no_comfyui():
    # Verify importing provider base does not drag in ComfyUI or comfy_api
    loaded_modules = set(sys.modules.keys())
    # Should not have loaded comfy or folder_paths
    assert not any(m == "comfy" or m.startswith("comfy.") for m in loaded_modules)
    assert "folder_paths" not in loaded_modules


def test_provider_capabilities_json_safe():
    caps = ProviderCapabilities(
        provider_id="fake_provider",
        available=True,
        modes=["geometry", "layout"],
        source_kinds=["annotated_input", "annotated_output"],
        reason="",
        recommended=True,
        metadata={"precision": "fp32"},
    )
    d = caps.to_dict()
    serialized = json.dumps(d)
    deserialized = json.loads(serialized)
    assert deserialized["provider_id"] == "fake_provider"
    assert deserialized["available"] is True
    assert deserialized["modes"] == ["geometry", "layout"]
    assert deserialized["recommended"] is True

    caps2 = ProviderCapabilities.from_dict(deserialized)
    assert caps2.provider_id == caps.provider_id
    assert caps2.available == caps.available
    assert caps2.modes == caps.modes
    assert caps2.metadata == {"precision": "fp32"}


def test_dummy_provider_implements_protocol():
    class DummyCancelToken:
        def __init__(self) -> None:
            self._cancelled = False

        def is_cancelled(self) -> bool:
            return self._cancelled

    class DummyProvider:
        provider_id = "dummy"

        def capabilities(self) -> ProviderCapabilities:
            return ProviderCapabilities(
                provider_id=self.provider_id,
                available=True,
                modes=["geometry"],
                source_kinds=["annotated_input"],
            )

        def reconstruct(
            self,
            source: ReconstructionSource,
            settings: ReconstructionSettings,
            *,
            progress: ProgressSink | None = None,
            cancel: CancelToken | None = None,
        ) -> GeometryEvidence:
            if progress:
                progress("INFER_GEOMETRY", 0.5, "Working")
            if cancel and cancel.is_cancelled():
                raise RuntimeError("Cancelled")
            return GeometryEvidence(points=[0, 0, 0])

    provider: ReconstructionProvider = DummyProvider()
    assert provider.provider_id == "dummy"
    caps = provider.capabilities()
    assert caps.available is True

    events = []

    def on_progress(stage: str, pct: float, msg: str) -> None:
        events.append((stage, pct, msg))

    evidence = provider.reconstruct(
        ReconstructionSource(kind="annotated_input", value="img.png"),
        ReconstructionSettings(),
        progress=on_progress,
        cancel=DummyCancelToken(),
    )
    assert len(events) == 1
    assert evidence.points == [0, 0, 0]
