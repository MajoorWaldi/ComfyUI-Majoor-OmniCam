"""Frontend chunk route: cache headers + path safety.

The mutable entry ``omnicam.js`` must be revalidated every load (its stable URL
hides a changing list of hashed chunk imports); the content-hashed chunks are
safe to cache forever. A stale entry is exactly what leaves the OmniCam node
black / unmounted until a hard refresh.
"""

from __future__ import annotations

import sys
import types

# routes_chunks imports omnicam.comfy_compat.server at module load; stub the
# PromptServer so importing it here does not need a running ComfyUI.
_fake_server = types.ModuleType("omnicam.comfy_compat.server")


class _Routes:
    def get(self, *_a, **_k):
        return lambda fn: fn

    def static(self, *_a, **_k):
        return None


class _PromptServer:
    instance = types.SimpleNamespace(routes=_Routes())


_fake_server.PromptServer = _PromptServer
sys.modules.setdefault("omnicam.comfy_compat.server", _fake_server)

from omnicam import routes_chunks  # noqa: E402


def test_entry_is_revalidated_hashed_chunks_are_immutable():
    assert routes_chunks.cache_control_for("omnicam.js") == "no-cache"
    assert "immutable" in routes_chunks.cache_control_for("chunk-6CSnqNny.js")
    assert "immutable" in routes_chunks.cache_control_for("vendor-three-abc123.js")
    assert routes_chunks.cache_control_for("asset-DEADBEEF.css").startswith("public, max-age=")


def test_resolve_chunk_path_rejects_traversal_and_subpaths(tmp_path, monkeypatch):
    monkeypatch.setattr(routes_chunks, "CHUNK_DIRECTORY", tmp_path)
    (tmp_path / "chunk-aa.js").write_text("//", encoding="utf-8")
    (tmp_path / "omnicam.js").write_text("//", encoding="utf-8")

    assert routes_chunks.resolve_chunk_path("chunk-aa.js") == (tmp_path / "chunk-aa.js")
    assert routes_chunks.resolve_chunk_path("omnicam.js") == (tmp_path / "omnicam.js")

    for bad in ("", ".", "..", "../secret.js", "sub/chunk-aa.js", "sub\\x.js", "missing.js"):
        assert routes_chunks.resolve_chunk_path(bad) is None
