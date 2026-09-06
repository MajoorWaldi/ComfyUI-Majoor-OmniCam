"""Tests for reconstruction image source resolution and path security."""

from __future__ import annotations

import pytest

from omnicam.reconstruction.source import (
    ALLOWED_IMAGE_EXTENSIONS,
    ReconstructionSourceResolutionError,
    resolve_reconstruction_source,
)
from omnicam.reconstruction.types import ReconstructionSource


def test_allowed_extensions_set():
    assert {".png", ".jpg", ".jpeg", ".webp"} == ALLOWED_IMAGE_EXTENSIONS


@pytest.mark.parametrize(
    "bad_path",
    [
        "../../etc/passwd",
        r"..\..\Windows\System32\cmd.exe",
        r"C:\Windows\win.ini",
        r"/etc/shadow",
        r"\\server\share\f.png",
        "//server/share/f.png",
        "file:///etc/passwd",
        "http://example.com/image.png",
        "https://example.com/image.png",
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
    ],
)
def test_reconstruct_source_rejects_unsafe_paths(bad_path, tmp_path):
    with pytest.raises(ReconstructionSourceResolutionError):
        resolve_reconstruction_source(
            ReconstructionSource(kind="annotated_input", value=bad_path),
            roots=[tmp_path],
        )


@pytest.mark.parametrize(
    "bad_ext",
    [
        "photo.gif",
        "photo.tiff",
        "photo.bmp",
        "photo.mp4",
        "photo.exe",
        "photo.svg",
    ],
)
def test_reconstruct_source_rejects_disallowed_extensions(bad_ext, tmp_path):
    f = tmp_path / bad_ext
    f.write_bytes(b"content")
    with pytest.raises(ReconstructionSourceResolutionError, match="extension"):
        resolve_reconstruction_source(
            ReconstructionSource(kind="annotated_input", value=bad_ext),
            roots=[tmp_path],
        )


def test_reconstruct_source_accepts_valid_annotated_input(tmp_path):
    img_file = tmp_path / "valid_room.png"
    img_file.write_bytes(b"\x89PNG\r\n\x1a\nfakecontent")

    resolved = resolve_reconstruction_source(
        ReconstructionSource(kind="annotated_input", value="valid_room.png"),
        roots=[tmp_path],
    )
    assert resolved == img_file.resolve()


def test_reconstruct_source_accepts_annotated_output(tmp_path):
    out_file = tmp_path / "generated.webp"
    out_file.write_bytes(b"RIFFfakeWEBP")

    resolved = resolve_reconstruction_source(
        ReconstructionSource(kind="annotated_output", value="generated.webp [output]"),
        roots=[tmp_path],
    )
    assert resolved == out_file.resolve()


def test_reconstruct_source_rejects_non_existent_file(tmp_path):
    with pytest.raises(ReconstructionSourceResolutionError, match="does not exist"):
        resolve_reconstruction_source(
            ReconstructionSource(kind="annotated_input", value="non_existent.png"),
            roots=[tmp_path],
        )


def test_reconstruct_source_rejects_empty_file(tmp_path):
    empty_file = tmp_path / "empty.png"
    empty_file.write_bytes(b"")
    with pytest.raises(ReconstructionSourceResolutionError, match="empty"):
        resolve_reconstruction_source(
            ReconstructionSource(kind="annotated_input", value="empty.png"),
            roots=[tmp_path],
        )
