"""Regression coverage for the remaining audit resource findings."""
from __future__ import annotations

import inspect
import sys
import types
from pathlib import Path

import pytest

pytest.importorskip("aiohttp")
from aiohttp import web

folder_paths_stub = sys.modules.setdefault("folder_paths", types.ModuleType("folder_paths"))
if not hasattr(folder_paths_stub, "get_input_directory"):
    folder_paths_stub.get_input_directory = lambda: "."
if not hasattr(folder_paths_stub, "get_output_directory"):
    folder_paths_stub.get_output_directory = lambda: "."
server_stub = sys.modules.setdefault("server", types.ModuleType("server"))
if not hasattr(server_stub, "PromptServer"):
    server_stub.PromptServer = type("PromptServer", (), {"instance": types.SimpleNamespace(routes=web.RouteTableDef())})

from omnicam import routes


def test_camera_import_does_not_duplicate_chunk_list_into_joined_bytes() -> None:
    source = inspect.getsource(routes.import_camera_route)
    assert 'b"".join(chunks)' not in source
    assert "bytearray" in source


def test_stl_geometry_budget_rejects_excessive_triangle_count(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setattr(routes, "MAX_MODEL_TRIANGLES", 2)
    path = tmp_path / "large.stl"
    path.write_bytes(b"0" * 80 + (3).to_bytes(4, "little") + b"0" * (3 * 50))

    with pytest.raises(web.HTTPRequestEntityTooLarge):
        routes._validate_model_complexity(path, ".stl")


def test_export_folder_has_a_separate_quota(tmp_path: Path, monkeypatch) -> None:
    monkeypatch.setattr(routes, "MAX_EXPORT_FOLDER_BYTES", 10)
    (tmp_path / "old.bin").write_bytes(b"12345678")

    with pytest.raises(web.HTTPInsufficientStorage):
        routes._check_export_capacity(tmp_path, incoming_bytes=3)
