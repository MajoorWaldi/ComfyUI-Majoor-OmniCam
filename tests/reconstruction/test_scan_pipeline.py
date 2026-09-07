"""End-to-end scan pipeline with fake VGGT + fake SAM3 (plan Task 28)."""

from __future__ import annotations

import numpy as np

from omnicam.core.motion_scene import MotionScene
from omnicam.reconstruction.multiview.coordinates import normalize_vggt_evidence
from omnicam.reconstruction.multiview.source import sample_image_batch
from omnicam.reconstruction.multiview.types import MultiViewEvidence, ViewCameraEvidence
from omnicam.reconstruction.pipelines.scan import run_scan_pipeline
from omnicam.reconstruction.segmentation.fake import FakeSegmentationProvider
from omnicam.reconstruction.settings import ReconstructionSettings


def _K(fx=400.0, fy=400.0, cx=80.0, cy=60.0):
    return np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1.0]])


class FakeVggtProvider:
    provider_id = "vggt"
    adapter_version = "fake"

    def reconstruct_views(self, samples, settings, *, cancel=None, progress=None, gpu_guard=None):
        v = len(samples)
        h, w = samples[0].height, samples[0].width
        ys, xs = np.mgrid[0:h, 0:w]
        wx = (xs / w - 0.5) * 6.0
        wz = (ys / h - 0.5) * 6.0 - 4.0
        wy = np.full((h, w), -1.5) + 0.01 * np.sin(xs / 5.0)
        grid = np.stack([wx, wy, wz], axis=-1).astype(float)
        points = np.stack([grid] * v, axis=0)

        cams = []
        for i, s in enumerate(samples):
            e = np.eye(4)
            e[:3, 3] = -np.array([i * 0.6, 1.2, 0.0])  # camera drifts to the right
            cams.append(
                ViewCameraEvidence(
                    view_index=i,
                    width=w,
                    height=h,
                    extrinsic_camera_from_world=e,
                    intrinsics=_K(),
                    source_frame=s.source_frame,
                )
            )
        ev = MultiViewEvidence(
            images=None,
            depth=None,
            depth_confidence=None,
            points_world=points,
            point_confidence=None,
            cameras=cams,
            provider_id="vggt",
            provider_version="fake",
        )
        return normalize_vggt_evidence(ev)


def _samples(n=4, h=120, w=160):
    batch = np.zeros((n, h, w, 3), np.float32)
    s = sample_image_batch(batch, max_views=n)
    return s


def _settings(**kw):
    kw.setdefault("mode", "scan")
    kw.setdefault("provider", "vggt")
    kw.setdefault("semantic_labels", ("chair", "table"))
    kw.setdefault("quality", "custom")  # honour the explicit view fields below
    kw.setdefault("vggt_segmentation_views", 2)
    kw.setdefault("source_mode", "video_scan")  # -> trajectory Scan Camera track
    return ReconstructionSettings(**kw)


def _run(**over):
    kw = dict(
        source=None,
        settings=_settings(),
        geometry_provider=FakeVggtProvider(),
        segmentation_provider=FakeSegmentationProvider(),
        samples=_samples(),
    )
    kw.update(over)
    return run_scan_pipeline(**kw)


def test_scan_pipeline_output_validates():
    out = _run()
    MotionScene.from_dict(out.motion_scene)
    assert out.summary["mode"] == "scan"
    assert out.summary["view_count"] == 4


def test_video_scan_emits_one_trajectory_camera_track():
    out = _run()
    roles = [o.get("reconstruction", {}).get("role") for o in out.motion_scene["objects"]]
    assert "blockout_object" in roles
    assert len(out.motion_scene["cameras"]) == 1  # one trajectory, not one cam/view
    track = out.motion_scene["cameras"][0]["track"]
    assert len(track["keyframes"]) >= 2
    assert out.summary["provider_summary"]["scan_kind"] == "video"


def test_video_scan_camera_track_preserves_sampled_source_frames():
    samples = _samples(n=4)
    out = _run(samples=samples)
    track_frames = {kf["frame"] for kf in out.motion_scene["cameras"][0]["track"]["keyframes"]}
    expected = {int(s.source_frame) for s in samples}
    # frames are clamped into the timeline but the distinct set is preserved
    assert track_frames == expected


def test_unordered_image_set_scan_inserts_only_the_anchor_camera():
    # source_mode "multi_view" -> no trajectory track; one anchor source camera
    # with a single hold keyframe (design doc 10.6).
    out = _run(settings=_settings(source_mode="multi_view"))
    cams = out.motion_scene["cameras"]
    assert len(cams) == 1
    kfs = cams[0]["track"]["keyframes"]
    assert len(kfs) == 1
    assert out.summary["provider_summary"]["scan_kind"] == "image_set"
    # still a full blockout
    assert "blockout_object" in [
        o.get("reconstruction", {}).get("role") for o in out.motion_scene["objects"]
    ]


def test_scan_view_presets_drive_segmentation_view_count():
    fast = _settings(quality="fast")
    balanced = _settings(quality="balanced")
    high = _settings(quality="high")
    assert fast.scan_view_counts() == (12, 3)
    assert balanced.scan_view_counts() == (24, 6)
    assert high.scan_view_counts() == (48, 10)
    # custom keeps the explicit fields
    assert _settings(quality="custom", vggt_max_views=9, vggt_segmentation_views=4).scan_view_counts() == (9, 4)


def test_two_views_of_same_chair_do_not_double_count():
    # single instance per label, 2 segmentation views -> still one chair object
    out = _run()
    chairs = [
        o for o in out.motion_scene["objects"]
        if o.get("reconstruction", {}).get("semantic") == "chair"
    ]
    assert len(chairs) == 1


def test_two_physical_chairs_stay_two_objects():
    out = _run(segmentation_provider=FakeSegmentationProvider(instances_per_label=2))
    chairs = [
        o for o in out.motion_scene["objects"]
        if o.get("reconstruction", {}).get("semantic") == "chair"
    ]
    assert len(chairs) == 2


def test_objects_seen_from_more_views_get_a_depth_confidence_bump():
    one_view = _run(
        settings=_settings(semantic_labels=("chair",), vggt_segmentation_views=1)
    )
    many_view = _run(
        settings=_settings(semantic_labels=("chair",), vggt_segmentation_views=4)
    )

    def _depth_conf(out):
        chair = next(
            o for o in out.motion_scene["objects"]
            if o.get("reconstruction", {}).get("semantic") == "chair"
        )
        return chair["reconstruction"]["axis_confidence"]["depth"]

    assert _depth_conf(many_view) >= _depth_conf(one_view)


def test_scan_fingerprint_is_plain_hex_and_returned():
    import re

    out = _run()
    fp = out.fingerprint
    assert fp and re.fullmatch(r"[0-9a-f]{1,64}", fp), fp
    assert out.summary["fingerprint"] == fp
    # Different pixel content -> different key even at the same frame indices.
    other = _run(samples=[
        type(s)(view_index=s.view_index, image=np.full_like(np.asarray(s.image), 0.5),
                source_frame=s.source_frame, width=s.width, height=s.height)
        for s in _samples()
    ])
    assert other.fingerprint != fp


def test_scan_segments_on_the_point_map_grid_when_images_are_preprocessed():
    from omnicam.reconstruction.multiview.coordinates import normalize_vggt_evidence
    from omnicam.reconstruction.multiview.types import MultiViewEvidence, ViewCameraEvidence

    class ResizingVggt:
        provider_id = "vggt"
        adapter_version = "fake"

        def reconstruct_views(self, samples, settings, *, cancel=None, progress=None, gpu_guard=None):
            v = len(samples)
            mh, mw = 84, 126  # model resolution differs from the 120x160 source
            ys, xs = np.mgrid[0:mh, 0:mw]
            grid = np.stack([(xs / mw - 0.5) * 6, np.full((mh, mw), -1.5), (ys / mh - 0.5) * 6 - 4], -1).astype(float)
            pts = np.stack([grid] * v, 0)
            imgs = np.zeros((v, mh, mw, 3), np.float32)
            cams = [ViewCameraEvidence(view_index=i, width=mw, height=mh,
                                       extrinsic_camera_from_world=np.eye(4), intrinsics=_K(),
                                       source_frame=s.source_frame) for i, s in enumerate(samples)]
            ev = MultiViewEvidence(images=imgs, depth=None, depth_confidence=None, points_world=pts,
                                   point_confidence=None, cameras=cams, provider_id="vggt", provider_version="fake")
            return normalize_vggt_evidence(ev)

    out = _run(geometry_provider=ResizingVggt())
    # Canvas follows the point-map grid so masks / intrinsics / fov stay in one space.
    assert out.motion_scene["canvas"] == {"width": 126, "height": 84}


def test_resolve_scan_input_rejects_a_single_still_and_passes_batches_through():
    import pytest

    from omnicam.reconstruction.errors import ReconSourceSetInvalidError
    from omnicam.reconstruction.pipeline import _resolve_scan_input
    from omnicam.reconstruction.types import ReconstructionSource

    s = _settings()
    batch = _samples()
    resolved, fps = _resolve_scan_input(None, s, batch, None)
    assert resolved is batch and fps == 24.0

    still = ReconstructionSource(kind="annotated_input", value="room.png [input]")
    with pytest.raises(ReconSourceSetInvalidError, match="video source or a multi-view"):
        _resolve_scan_input(still, s, None, None)
