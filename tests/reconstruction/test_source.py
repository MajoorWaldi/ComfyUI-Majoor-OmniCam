"""Tests for reconstruction image source resolution and path security."""

from __future__ import annotations

import struct
import zlib

import pytest
from PIL import Image

from omnicam.reconstruction.source import (
    ALLOWED_IMAGE_EXTENSIONS,
    ReconstructionSourceResolutionError,
    resolve_reconstruction_source,
)
from omnicam.reconstruction.types import ReconstructionSource


def _write_image(path, size=(4, 4), fmt=None):
    Image.new("RGB", size, color=(128, 64, 32)).save(path, format=fmt)


def _write_fake_png_header(path, width, height):
    """A PNG whose IHDR claims (width, height) but whose IDAT is garbage.

    PIL parses IHDR eagerly on Image.open() (so .size is real) but only
    decompresses IDAT lazily on .load()/.convert() -- so a pixel-count test
    that only needs .size can use this instead of actually allocating and
    encoding a real width*height buffer, which would be too slow/memory-heavy
    at the sizes a decompression-bomb guard needs to test against.
    """

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", b"\x00\x00\x00\x00") + chunk(b"IEND", b"")
    path.write_bytes(png)


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
    _write_image(img_file)

    resolved = resolve_reconstruction_source(
        ReconstructionSource(kind="annotated_input", value="valid_room.png"),
        roots=[tmp_path],
    )
    assert resolved == img_file.resolve()


def test_reconstruct_source_accepts_annotated_output(tmp_path):
    out_file = tmp_path / "generated.webp"
    _write_image(out_file, fmt="WEBP")

    resolved = resolve_reconstruction_source(
        ReconstructionSource(kind="annotated_output", value="generated.webp [output]"),
        roots=[tmp_path],
    )
    assert resolved == out_file.resolve()


def test_reconstruct_source_rejects_a_decompression_bomb(tmp_path):
    # A small file on disk (MAX_IMAGE_BYTES would happily pass it) can still
    # decode into a huge pixel buffer -- this must be caught from the header
    # alone, before any provider actually opens and converts the image.
    # 10000x10000 = 100 MP: over this module's 64 MP default, but still under
    # Pillow's own built-in ~179 MP decompression-bomb ceiling, so this
    # actually exercises MAX_DECODED_PIXELS and not Pillow's unrelated guard.
    img_file = tmp_path / "bomb.png"
    _write_fake_png_header(img_file, 10_000, 10_000)

    with pytest.raises(ReconstructionSourceResolutionError, match="pixel"):
        resolve_reconstruction_source(
            ReconstructionSource(kind="annotated_input", value="bomb.png"),
            roots=[tmp_path],
        )


def test_reconstruct_source_accepts_a_custom_higher_pixel_limit(tmp_path):
    img_file = tmp_path / "big_but_allowed.png"
    _write_fake_png_header(img_file, 9_000, 9_000)  # 81 MP > default 64 MP limit

    resolved = resolve_reconstruction_source(
        ReconstructionSource(kind="annotated_input", value="big_but_allowed.png"),
        roots=[tmp_path],
        max_pixels=100_000_000,
    )
    assert resolved == img_file.resolve()


def test_reconstruct_source_rejects_a_file_whose_header_is_not_a_real_image(tmp_path):
    fake = tmp_path / "not_really.png"
    fake.write_bytes(b"\x89PNG\r\n\x1a\nnot actually valid image data")

    with pytest.raises(ReconstructionSourceResolutionError, match="dimensions"):
        resolve_reconstruction_source(
            ReconstructionSource(kind="annotated_input", value="not_really.png"),
            roots=[tmp_path],
        )


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
