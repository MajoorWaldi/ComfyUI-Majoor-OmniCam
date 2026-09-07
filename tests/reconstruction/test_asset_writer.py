"""Tests for managed GLB asset persistence and security."""

from __future__ import annotations

import json
from pathlib import Path

import pytest
import torch

from omnicam.reconstruction.asset_writer import (
    AssetWriterSecurityError,
    write_reconstruction_assets,
)
from omnicam.reconstruction.geometry import ProxyMesh


def test_asset_writer_rejects_malicious_fingerprint(tmp_path):
    mesh = ProxyMesh(
        vertices=torch.zeros((3, 3)),
        faces=torch.tensor([[0, 1, 2]]),
        triangle_count=1,
    )

    with pytest.raises(AssetWriterSecurityError, match="fingerprint"):
        write_reconstruction_assets(
            fingerprint="../../etc",
            mesh=mesh,
            summary={"provider": "fake"},
            input_root=tmp_path,
        )

    with pytest.raises(AssetWriterSecurityError, match="fingerprint"):
        write_reconstruction_assets(
            fingerprint="abc/../../../evil",
            mesh=mesh,
            summary={"provider": "fake"},
            input_root=tmp_path,
        )


def test_asset_writer_containment_check(tmp_path):
    mesh = ProxyMesh(
        vertices=torch.zeros((3, 3)),
        faces=torch.tensor([[0, 1, 2]]),
        normals=torch.tensor([[0.0, 1.0, 0.0]] * 3),
        triangle_count=1,
    )
    # Valid 20-char hex
    fp = "0123456789abcdef0123"

    saved_calls = []

    def stub_save_glb(*args, **kwargs):
        saved_calls.append((args, kwargs))
        # Create dummy glb file
        filepath = kwargs.get("filepath")
        if filepath:
            Path(filepath).write_bytes(b"glTFfake")

    annotated_path, written_glb, written_json = write_reconstruction_assets(
        fingerprint=fp,
        mesh=mesh,
        summary={"provider": "fake", "triangles": 1},
        input_root=tmp_path,
        save_glb_fn=stub_save_glb,
    )

    assert annotated_path == f"majoor_omnicam/reconstruction/{fp}/environment.glb [input]"
    assert written_glb.is_file()
    assert written_json.is_file()

    # Verify containment
    assert tmp_path.resolve() in written_glb.resolve().parents
    assert tmp_path.resolve() in written_json.resolve().parents

    # Verify JSON content
    data = json.loads(written_json.read_text(encoding="utf-8"))
    assert data["provider"] == "fake"
    assert data["triangles"] == 1
    assert data["fingerprint"] == fp

    # Verify stub arguments. Normals must reach save_glb_fn: without them the
    # GLB's texture is lit by a missing NORMAL accessor and renders black
    # (save_glb only takes the unlit/KHR_materials_unlit path when there is
    # no texture, and a reconstruction always embeds one).
    assert len(saved_calls) == 1
    _, kwargs = saved_calls[0]
    assert kwargs["normals"] is not None
    assert torch.equal(kwargs["normals"], mesh.normals)
    assert "unlit" not in kwargs
    assert "producer" in kwargs["metadata"]
