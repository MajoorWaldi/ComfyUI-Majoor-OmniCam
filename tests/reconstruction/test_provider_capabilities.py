"""Tests for provider protocol and capability reporting."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from omnicam.reconstruction.providers.base import (
    CancelToken,
    ProgressSink,
    ProviderCapabilities,
    ReconstructionProvider,
)
from omnicam.reconstruction.settings import ReconstructionSettings
from omnicam.reconstruction.types import GeometryEvidence, ReconstructionSource


def test_provider_base_import_triggers_no_comfyui():
    # Verify importing provider base in a fresh interpreter does not drag in ComfyUI or comfy_api
    import subprocess

    # The repo root goes on sys.path inside the child rather than through
    # PYTHONPATH: an embedded interpreter pinned by a ._pth file ignores the
    # environment variable, and the subprocess would then fail on
    # ModuleNotFoundError -- passing judgement on the wrong thing entirely.
    repo_root = Path(__file__).resolve().parents[2]
    prelude = f"import sys; sys.path.insert(0, {str(repo_root)!r}); "

    proc = subprocess.run(
        [
            sys.executable,
            "-c",
            prelude
            + "from omnicam.reconstruction.providers.base import ReconstructionProvider; "
            "assert not any(m == 'comfy' or m.startswith('comfy.') for m in sys.modules); "
            "assert 'folder_paths' not in sys.modules",
        ],
        capture_output=True,
        text=True,
        check=False,
        cwd=str(repo_root),
    )
    assert proc.returncode == 0, f"Import dragged in comfy modules: {proc.stderr}"


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
