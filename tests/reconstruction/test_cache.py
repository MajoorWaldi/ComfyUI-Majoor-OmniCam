"""Tests for fingerprint-keyed reconstruction cache and validation."""

from __future__ import annotations

from omnicam.reconstruction.cache import (
    CACHE_VERSION,
    CacheEntry,
    clear_reconstruction_cache,
    lookup_cache,
    write_cache_manifest,
)


def test_cache_manifest_round_trip(tmp_path):
    entry = CacheEntry(
        cache_version=CACHE_VERSION,
        fingerprint="0123456789abcdef0123",
        provider="fake",
        provider_version="fake-1.0",
        asset="majoor_omnicam/reconstruction/0123456789abcdef0123/environment.glb [input]",
        summary={"triangle_count": 100, "confidence": 0.9},
        created_at=1234567890.0,
    )

    manifest_path = write_cache_manifest(entry, input_root=tmp_path)
    assert manifest_path.is_file()

    # Create the matching GLB asset
    glb_path = manifest_path.parent / "environment.glb"
    glb_path.write_bytes(b"dummy_glb_data")

    found = lookup_cache(
        fingerprint=entry.fingerprint,
        provider="fake",
        provider_version="fake-1.0",
        input_root=tmp_path,
    )
    assert found is not None
    assert found.fingerprint == entry.fingerprint
    assert found.asset == entry.asset
    assert found.summary == entry.summary


def test_cache_miss_on_version_or_provider_mismatch(tmp_path):
    fp = "0123456789abcdef0123"
    target_dir = tmp_path / "majoor_omnicam" / "reconstruction" / fp
    target_dir.mkdir(parents=True)
    (target_dir / "environment.glb").write_bytes(b"data")

    entry = CacheEntry(
        cache_version=CACHE_VERSION,
        fingerprint=fp,
        provider="fake",
        provider_version="fake-1.0",
        asset=f"majoor_omnicam/reconstruction/{fp}/environment.glb [input]",
        summary={},
        created_at=100.0,
    )
    write_cache_manifest(entry, input_root=tmp_path)

    # Provider mismatch
    assert (
        lookup_cache(
            fingerprint=fp,
            provider="different_provider",
            provider_version="fake-1.0",
            input_root=tmp_path,
        )
        is None
    )

    # Provider version mismatch
    assert (
        lookup_cache(
            fingerprint=fp,
            provider="fake",
            provider_version="fake-2.0",
            input_root=tmp_path,
        )
        is None
    )


def test_cache_miss_on_missing_or_corrupt_asset(tmp_path):
    fp = "0123456789abcdef0123"
    target_dir = tmp_path / "majoor_omnicam" / "reconstruction" / fp
    target_dir.mkdir(parents=True)

    # Missing GLB
    entry = CacheEntry(
        cache_version=CACHE_VERSION,
        fingerprint=fp,
        provider="fake",
        provider_version="fake-1.0",
        asset=f"majoor_omnicam/reconstruction/{fp}/environment.glb [input]",
        summary={},
        created_at=100.0,
    )
    write_cache_manifest(entry, input_root=tmp_path)
    assert (
        lookup_cache(
            fingerprint=fp,
            provider="fake",
            provider_version="fake-1.0",
            input_root=tmp_path,
        )
        is None
    )

    # Corrupt / 0-byte GLB
    (target_dir / "environment.glb").write_bytes(b"")
    assert (
        lookup_cache(
            fingerprint=fp,
            provider="fake",
            provider_version="fake-1.0",
            input_root=tmp_path,
        )
        is None
    )

    # Corrupt JSON manifest
    (target_dir / "reconstruction.json").write_text("invalid json{{{{", encoding="utf-8")
    assert (
        lookup_cache(
            fingerprint=fp,
            provider="fake",
            provider_version="fake-1.0",
            input_root=tmp_path,
        )
        is None
    )


def test_clear_reconstruction_cache_removes_every_cached_entry(tmp_path):
    for fp in ("0123456789abcdef0123", "fedcba9876543210fedc"):
        entry_dir = tmp_path / "majoor_omnicam" / "reconstruction" / fp
        entry_dir.mkdir(parents=True)
        (entry_dir / "environment.glb").write_bytes(b"x" * 100)
        (entry_dir / "reconstruction.json").write_text("{}", encoding="utf-8")
    inputs_dir = tmp_path / "majoor_omnicam" / "reconstruction" / "inputs"
    inputs_dir.mkdir()
    (inputs_dir / "recon_input_abc.png").write_bytes(b"y" * 50)

    result = clear_reconstruction_cache(input_root=tmp_path)

    assert result.entries_removed == 5
    assert result.bytes_freed == 100 + len(b"{}") + 100 + len(b"{}") + 50
    recon_dir = tmp_path / "majoor_omnicam" / "reconstruction"
    assert recon_dir.is_dir()  # recreated empty, not left missing
    assert list(recon_dir.iterdir()) == []


def test_clear_reconstruction_cache_on_an_empty_tree_is_a_noop(tmp_path):
    result = clear_reconstruction_cache(input_root=tmp_path)
    assert result.entries_removed == 0
    assert result.bytes_freed == 0


def test_clear_reconstruction_cache_never_touches_sibling_directories(tmp_path):
    sibling = tmp_path / "some_other_upload.png"
    sibling.write_bytes(b"do not delete me")
    recon_dir = tmp_path / "majoor_omnicam" / "reconstruction" / "abc"
    recon_dir.mkdir(parents=True)
    (recon_dir / "environment.glb").write_bytes(b"z")

    clear_reconstruction_cache(input_root=tmp_path)

    assert sibling.is_file()
    assert sibling.read_bytes() == b"do not delete me"


def test_delete_reconstruction_cache_entry_removes_only_that_fingerprint(tmp_path):
    from omnicam.reconstruction.cache import delete_reconstruction_cache_entry

    keep_fp, drop_fp = "0123456789abcdef0123", "fedcba9876543210fedc"
    for fp in (keep_fp, drop_fp):
        d = tmp_path / "majoor_omnicam" / "reconstruction" / fp
        d.mkdir(parents=True)
        (d / "environment.glb").write_bytes(b"x" * 20)
        (d / "reconstruction.json").write_text("{}", encoding="utf-8")

    result = delete_reconstruction_cache_entry(drop_fp, input_root=tmp_path)

    assert result.entries_removed == 2
    assert result.bytes_freed == 20 + len(b"{}")
    recon_dir = tmp_path / "majoor_omnicam" / "reconstruction"
    assert not (recon_dir / drop_fp).exists()
    assert (recon_dir / keep_fp / "environment.glb").is_file()


def test_delete_reconstruction_cache_entry_rejects_a_non_hex_fingerprint(tmp_path):
    import pytest

    from omnicam.reconstruction.cache import delete_reconstruction_cache_entry

    for bad in ("../escape", "abc/def", "zz;rm", ""):
        with pytest.raises(ValueError, match="fingerprint"):
            delete_reconstruction_cache_entry(bad, input_root=tmp_path)


def test_delete_reconstruction_cache_entry_missing_folder_is_a_noop(tmp_path):
    from omnicam.reconstruction.cache import delete_reconstruction_cache_entry

    result = delete_reconstruction_cache_entry("0123456789abcdef0123", input_root=tmp_path)
    assert result.entries_removed == 0
    assert result.bytes_freed == 0
