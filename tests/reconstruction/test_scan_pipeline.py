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


def _run(**over):
    kw = dict(
        source=None,
        settings=ReconstructionSettings(
            mode="scan", provider="vggt", semantic_labels=("chair", "table"),
            vggt_segmentation_views=2,
        ),
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


def test_scan_emits_blockout_objects_and_a_single_camera_track():
    out = _run()
    roles = [o.get("reconstruction", {}).get("role") for o in out.motion_scene["objects"]]
    assert "blockout_object" in roles
    assert len(out.motion_scene["cameras"]) == 1  # one trajectory, not one cam/view
    track = out.motion_scene["cameras"][0]["track"]
    assert len(track["keyframes"]) >= 2


def test_scan_camera_track_preserves_sampled_source_frames():
    samples = _samples(n=4)
    out = _run(samples=samples)
    track_frames = {kf["frame"] for kf in out.motion_scene["cameras"][0]["track"]["keyframes"]}
    expected = {int(s.source_frame) for s in samples}
    # frames are clamped into the timeline but the distinct set is preserved
    assert track_frames == expected


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
        settings=ReconstructionSettings(
            mode="scan", provider="vggt", semantic_labels=("chair",), vggt_segmentation_views=1
        )
    )
    many_view = _run(
        settings=ReconstructionSettings(
            mode="scan", provider="vggt", semantic_labels=("chair",), vggt_segmentation_views=4
        )
    )

    def _depth_conf(out):
        chair = next(
            o for o in out.motion_scene["objects"]
            if o.get("reconstruction", {}).get("semantic") == "chair"
        )
        return chair["reconstruction"]["axis_confidence"]["depth"]

    assert _depth_conf(many_view) >= _depth_conf(one_view)
