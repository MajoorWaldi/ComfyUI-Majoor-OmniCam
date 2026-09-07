"""Tests for bounded model identity cache tokens (plan Task 4)."""

from __future__ import annotations

import os

from omnicam.reconstruction.model_identity import (
    ModelIdentity,
    file_model_identity,
    missing_model_identity,
)


def test_identity_changes_when_checkpoint_changes(tmp_path):
    path = tmp_path / "model.safetensors"
    path.write_bytes(b"a")
    first = file_model_identity(path, provider_id="comfy_sam3", adapter_version="1")

    # Rewrite with different content + bump mtime so size and mtime both move.
    path.write_bytes(b"different-bytes")
    os.utime(path, ns=(first.mtime_ns + 1_000_000, first.mtime_ns + 1_000_000))
    second = file_model_identity(path, provider_id="comfy_sam3", adapter_version="1")

    assert first.cache_token != second.cache_token


def test_identity_stable_for_same_file_and_two_paths(tmp_path):
    path = tmp_path / "model.safetensors"
    path.write_bytes(b"weights")
    a = file_model_identity(path, provider_id="comfy_sam3", adapter_version="1")
    b = file_model_identity(
        tmp_path / "sub" / ".." / "model.safetensors",
        provider_id="comfy_sam3",
        adapter_version="1",
    )
    assert a.cache_token == b.cache_token


def test_adapter_version_participates_in_token(tmp_path):
    path = tmp_path / "model.safetensors"
    path.write_bytes(b"weights")
    v1 = file_model_identity(path, provider_id="comfy_sam3", adapter_version="1")
    v2 = file_model_identity(path, provider_id="comfy_sam3", adapter_version="2")
    assert v1.cache_token != v2.cache_token


def test_declared_digest_strengthens_token(tmp_path):
    path = tmp_path / "model.safetensors"
    path.write_bytes(b"weights")
    plain = file_model_identity(path, provider_id="vggt", adapter_version="1")
    digested = file_model_identity(
        path, provider_id="vggt", adapter_version="1", declared_digest="sha256:abc"
    )
    assert plain.cache_token != digested.cache_token


def test_missing_identity_is_distinct_per_provider():
    a = missing_model_identity(provider_id="comfy_sam3", adapter_version="1")
    b = missing_model_identity(provider_id="sam3d_objects", adapter_version="1")
    assert a.cache_token != b.cache_token
    assert a.file_size == 0


def test_identity_token_is_short_hex():
    ident = ModelIdentity("p", "1", "m", 10, 20)
    assert len(ident.cache_token) == 24
    assert all(c in "0123456789abcdef" for c in ident.cache_token)
