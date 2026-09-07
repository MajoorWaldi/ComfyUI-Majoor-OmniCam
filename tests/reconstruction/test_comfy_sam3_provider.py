"""Native SAM3 adapter tests -- no model, no ComfyUI.

The fake ``SAM3_Detect`` mirrors the real ``comfy_extras.nodes_sam3`` contract:
it returns ``(mask_stack, all_bbox_dicts)`` where ``all_bbox_dicts`` is a
per-frame list of lists of ``{"x", "y", "width", "height", "score"}`` dicts
(top-left corner, pixel width/height), and honours the ``category : N`` prompt
suffix for multi-detection.
"""

from __future__ import annotations

import re
from typing import ClassVar

import numpy as np
import pytest

from omnicam.reconstruction.blockout.types import InstanceEvidence
from omnicam.reconstruction.errors import (
    ReconInferenceFailedError,
    ReconProviderUnavailableError,
    ReconRequestInvalidError,
)
from omnicam.reconstruction.model_cache import SingleSlotModelCache
from omnicam.reconstruction.segmentation.comfy_sam3 import (
    ComfySam3Provider,
    _normalize_sam3_boxes,
    _Sam3Modules,
    deduplicate_instances,
    extract_node_outputs,
    instances_from_sam3_output,
)
from omnicam.reconstruction.settings import ReconstructionSettings


class _FakeCheckpointLoader:
    calls = 0

    def load_checkpoint(self, name):
        type(self).calls += 1
        return (f"model::{name}", f"clip::{name}", "vae")


class _FakeCLIPTextEncode:
    calls: ClassVar[list[str]] = []

    def encode(self, clip, prompt):
        type(self).calls.append(prompt)
        # carry the requested max-detections through to the fake detector
        m = re.match(r"^(.*?)\s*:\s*(\d+)\s*$", prompt)
        max_det = int(m.group(2)) if m else 1
        return ([("cond", prompt, max_det)],)


class _FakeSAM3Detect:
    executions: ClassVar[list[dict]] = []

    @staticmethod
    def execute(model, image, *, conditioning, threshold, refine_iterations, individual_masks, **_kw):
        max_det = conditioning[0][2] if len(conditioning[0]) > 2 else 1
        _FakeSAM3Detect.executions.append(
            {
                "threshold": threshold,
                "refine_iterations": refine_iterations,
                "individual_masks": individual_masks,
                "max_det": max_det,
            }
        )
        h, w = 100, 100
        n = min(max_det, 3)  # this fake "detects" up to 3 boxes when asked
        masks = np.zeros((n, h, w), dtype=bool)
        dicts = []
        for i in range(n):
            x0, y0 = 5 + i * 25, 5 + i * 25
            masks[i, y0 : y0 + 30, x0 : x0 + 30] = True
            dicts.append({"x": float(x0), "y": float(y0), "width": 30.0, "height": 30.0, "score": 0.9 - 0.1 * i})
        # real contract: per-frame list of lists of dicts
        return (masks, [dicts])


class _FakeFolderPaths:
    def __init__(self, names):
        self._names = list(names)

    def get_filename_list(self, kind):
        assert kind == "checkpoints"
        return list(self._names)

    def get_full_path(self, kind, name):
        return None


def _modules(checkpoints=("sam3.1_multiplex_fp16.safetensors", "sam3_old.safetensors")):
    _FakeCheckpointLoader.calls = 0
    _FakeCLIPTextEncode.calls = []
    _FakeSAM3Detect.executions = []

    class _Core:
        CheckpointLoaderSimple = _FakeCheckpointLoader
        CLIPTextEncode = _FakeCLIPTextEncode

    class _Sam3:
        SAM3_Detect = _FakeSAM3Detect

    return _Sam3Modules(sam3_nodes=_Sam3, core_nodes=_Core, folder_paths=_FakeFolderPaths(checkpoints))


def _settings(**kw):
    kw.setdefault("max_blockout_objects", 24)
    return ReconstructionSettings(
        mode="blockout",
        segmentation_provider="comfy_sam3",
        instance_iou_dedup=0.72,
        min_instance_area_ratio=0.0015,
        **kw,
    )


# --------------------------------------------------------------------------- #
def test_extract_node_outputs_variants():
    assert extract_node_outputs((1, 2, 3), expected=2) == (1, 2)

    class _V3:
        result = ("m", "b")

    assert extract_node_outputs(_V3(), expected=2) == ("m", "b")
    with pytest.raises(ReconInferenceFailedError):
        extract_node_outputs((1,), expected=2)


def test_normalize_sam3_boxes_decodes_per_frame_dicts_to_xyxy():
    boxes = [[{"x": 10.0, "y": 20.0, "width": 30.0, "height": 40.0, "score": 0.8}]]
    rows = _normalize_sam3_boxes(boxes)
    assert rows == [(10.0, 20.0, 40.0, 60.0, 0.8)]
    # numeric fallback still works
    assert _normalize_sam3_boxes([[1, 2, 3, 4]]) == [(1.0, 2.0, 3.0, 4.0, 0.9)]
    assert _normalize_sam3_boxes(None) == []


def test_instances_from_sam3_output_uses_dict_boxes():
    masks = np.zeros((2, 50, 50), bool)
    masks[0, 5:20, 5:20] = True
    masks[1, 25:45, 25:45] = True
    boxes = [
        [
            {"x": 5.0, "y": 5.0, "width": 15.0, "height": 15.0, "score": 0.95},
            {"x": 25.0, "y": 25.0, "width": 20.0, "height": 20.0, "score": 0.55},
        ]
    ]
    got = instances_from_sam3_output(label="chair", label_index=0, masks=masks, boxes=boxes, min_area_ratio=0.0)
    assert [g.bbox_xyxy for g in got] == [(5.0, 5.0, 20.0, 20.0), (25.0, 25.0, 45.0, 45.0)]
    assert got[0].score == pytest.approx(0.95)


def test_capabilities_false_when_no_sam3_checkpoint_installed():
    provider = ComfySam3Provider(model_cache=SingleSlotModelCache(), modules=_modules(checkpoints=("sdxl.safetensors",)))
    caps = provider.capabilities()
    assert caps.available is False
    assert "checkpoint" in caps.reason.lower()


def test_capabilities_true_lists_checkpoints():
    caps = ComfySam3Provider(model_cache=SingleSlotModelCache(), modules=_modules()).capabilities()
    assert caps.available is True
    assert "sam3.1_multiplex_fp16.safetensors" in caps.checkpoints


def test_auto_prefers_multiplex_then_lexical():
    p = ComfySam3Provider(model_cache=SingleSlotModelCache(), modules=_modules())
    assert p.resolve_checkpoint("auto", p._load_modules()) == "sam3.1_multiplex_fp16.safetensors"
    p2 = ComfySam3Provider(model_cache=SingleSlotModelCache(), modules=_modules(checkpoints=("sam3_z.safetensors", "sam3_a.safetensors")))
    assert p2.resolve_checkpoint("auto", p2._load_modules()) == "sam3_a.safetensors"


def test_explicit_missing_checkpoint_rejected():
    p = ComfySam3Provider(model_cache=SingleSlotModelCache(), modules=_modules())
    with pytest.raises(ReconRequestInvalidError):
        p.resolve_checkpoint("not_installed.safetensors", p._load_modules())


def test_segment_loads_model_once_and_requests_multi_detection_per_label():
    provider = ComfySam3Provider(model_cache=SingleSlotModelCache(), modules=_modules())
    image = np.zeros((100, 100, 3), np.float32)
    labels = ["chair", "table", "sofa", "bed", "desk"]

    instances = provider.segment(image, labels, _settings(max_blockout_objects=8))

    assert _FakeCheckpointLoader.calls == 1  # model loaded once for 5 labels
    # each label encoded once, with a "category : N" multi-detection suffix
    assert _FakeCLIPTextEncode.calls == [f"{lbl} : 8" for lbl in labels]
    assert all(e["max_det"] == 8 for e in _FakeSAM3Detect.executions)
    # 3 detections per label (fake caps its own output at 3)
    assert len(instances) == 15
    assert {i.label for i in instances} == set(labels)
    for inst in instances:
        assert inst.label in inst.instance_id
    assert _FakeSAM3Detect.executions[0]["individual_masks"] is True
    assert _FakeSAM3Detect.executions[0]["threshold"] == pytest.approx(0.55)


def test_segment_omits_suffix_when_only_one_detection_wanted():
    provider = ComfySam3Provider(model_cache=SingleSlotModelCache(), modules=_modules())
    provider.segment(np.zeros((100, 100, 3), np.float32), ["chair"], _settings(max_blockout_objects=1))
    assert _FakeCLIPTextEncode.calls == ["chair"]


def test_segment_raises_capability_error_without_checkpoint():
    provider = ComfySam3Provider(model_cache=SingleSlotModelCache(), modules=_modules(checkpoints=()))
    with pytest.raises(ReconProviderUnavailableError):
        provider.segment(np.zeros((10, 10, 3), np.float32), ["chair"], _settings())


def test_deduplicate_collapses_high_iou_to_higher_score():
    m = np.zeros((20, 20), bool)
    m[2:18, 2:18] = True
    m_shift = np.zeros((20, 20), bool)
    m_shift[3:19, 3:19] = True  # ~high IoU with m
    low = InstanceEvidence("a", "chair", 0.5, m, (2, 2, 18, 18))
    high = InstanceEvidence("b", "chair", 0.9, m_shift, (3, 3, 19, 19))
    other = InstanceEvidence("c", "table", 0.4, m, (2, 2, 18, 18))

    kept = deduplicate_instances([low, high, other], iou_threshold=0.7)
    kept_ids = {k.instance_id for k in kept}
    assert "b" in kept_ids  # higher score survives
    assert "a" not in kept_ids  # duplicate chair dropped
    assert "c" in kept_ids  # different label kept
