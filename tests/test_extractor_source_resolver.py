"""The trust boundary between a browser reference and a file on disk."""

import numpy as np
import pytest

from omnicam.extractor.source_resolver import (
    MANAGED_SUBFOLDER,
    SourceResolutionError,
    describe_video_file,
    resolve_interactive_video_source,
)

av = pytest.importorskip("av")


def write_clip(path, frames=8, width=64, height=48, fps=24):
    path.parent.mkdir(parents=True, exist_ok=True)
    with av.open(str(path), mode="w") as container:
        stream = container.add_stream("mpeg4", rate=fps)
        stream.width, stream.height, stream.pix_fmt = width, height, "yuv420p"
        for index in range(frames):
            image = np.zeros((height, width, 3), dtype=np.uint8)
            image[:, (index * 3) % (width - 8):(index * 3) % (width - 8) + 8] = 255
            container.mux(stream.encode(av.VideoFrame.from_ndarray(image, format="rgb24")))
        container.mux(stream.encode(None))
    return path


@pytest.fixture
def input_root(tmp_path):
    root = tmp_path / "input"
    root.mkdir()
    write_clip(root / "shot.mov")
    write_clip(root / MANAGED_SUBFOLDER / "picked.mp4")
    return root


def resolve(value, kind="annotated_input", **kwargs):
    return resolve_interactive_video_source({"kind": kind, "value": value}, **kwargs)


# ---------------------------------------------------------------------------
# Accepted
# ---------------------------------------------------------------------------

def test_native_load_video_reference_is_accepted(input_root):
    path = resolve("shot.mov", roots=[input_root])
    assert path.name == "shot.mov"
    assert path.is_file()


def test_an_annotated_input_reference_is_accepted(input_root):
    assert resolve("shot.mov [input]", roots=[input_root]).name == "shot.mov"


def test_a_managed_extractor_source_is_accepted(input_root):
    path = resolve(f"{MANAGED_SUBFOLDER}/picked.mp4", kind="managed", roots=[input_root])
    assert path.name == "picked.mp4"


def test_a_subfolder_reference_stays_inside_the_root(input_root):
    write_clip(input_root / "shots" / "b.mp4")
    assert resolve("shots/b.mp4", roots=[input_root]).name == "b.mp4"


# ---------------------------------------------------------------------------
# Refused
# ---------------------------------------------------------------------------

def test_a_missing_file_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="not found"):
        resolve("absent.mp4", roots=[input_root])


def test_path_traversal_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="traverse"):
        resolve("../../etc/passwd.mp4", roots=[input_root])


def test_a_posix_absolute_path_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="Absolute paths"):
        resolve("/etc/passwd.mp4", roots=[input_root])


def test_a_windows_absolute_path_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="Absolute paths"):
        resolve("C:/secrets/private.mov", roots=[input_root])


def test_a_network_share_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="Network paths"):
        resolve("//fileserver/share/shot.mov", roots=[input_root])


def test_a_remote_url_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="Remote URLs"):
        resolve("https://example.com/shot.mp4", roots=[input_root])


def test_a_symlink_escaping_the_root_is_refused(input_root, tmp_path):
    outside = write_clip(tmp_path / "outside" / "secret.mp4")
    link = input_root / "link.mp4"
    try:
        link.symlink_to(outside)
    except (OSError, NotImplementedError):
        pytest.skip("this platform does not allow creating symlinks here")
    with pytest.raises(SourceResolutionError, match="outside the ComfyUI managed directories"):
        resolve("link.mp4", roots=[input_root])


def test_a_non_video_extension_is_refused(input_root):
    (input_root / "notes.txt").write_text("hello", encoding="utf-8")
    with pytest.raises(SourceResolutionError, match="Unsupported video extension"):
        resolve("notes.txt", roots=[input_root])


def test_a_file_that_is_not_really_video_is_refused(input_root):
    (input_root / "fake.mp4").write_bytes(b"not a video at all")
    with pytest.raises(SourceResolutionError, match="metadata could not be validated"):
        resolve("fake.mp4", roots=[input_root])


def test_an_empty_file_is_refused(input_root):
    (input_root / "empty.mp4").write_bytes(b"")
    with pytest.raises(SourceResolutionError, match="empty"):
        resolve("empty.mp4", roots=[input_root])


def test_an_oversized_source_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="above the"):
        resolve("shot.mov", roots=[input_root], max_bytes=10)


def test_an_unknown_source_kind_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="Unsupported video source kind"):
        resolve("shot.mov", kind="in_memory", roots=[input_root])


def test_a_managed_kind_pointing_elsewhere_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="must live under"):
        resolve("shot.mov", kind="managed", roots=[input_root])


def test_a_non_object_source_is_refused():
    with pytest.raises(SourceResolutionError, match="must be an object"):
        resolve_interactive_video_source("shot.mov")


def test_an_empty_reference_is_refused(input_root):
    with pytest.raises(SourceResolutionError, match="needs a video source"):
        resolve("", roots=[input_root])


# ---------------------------------------------------------------------------
# Metadata
# ---------------------------------------------------------------------------

def test_describe_reports_the_container_metadata(input_root):
    info = describe_video_file(input_root / "shot.mov")
    assert (info["width"], info["height"]) == (64, 48)
    assert info["fps"] == pytest.approx(24.0)
    assert info["frame_count"] >= 1
    assert info["size_bytes"] > 0
    assert info["name"] == "shot.mov"
