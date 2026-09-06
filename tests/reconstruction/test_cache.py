"""Tests for fingerprint-keyed reconstruction cache and validation."""

from __future__ import annotations

from omnicam.reconstruction.cache import (
    CACHE_VERSION,
    CacheEntry,
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
