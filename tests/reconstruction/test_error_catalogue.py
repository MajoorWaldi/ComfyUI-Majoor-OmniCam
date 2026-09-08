"""The granular error catalogue from the design doc, section 19."""

from __future__ import annotations

import pytest

from omnicam.reconstruction import errors as errs

DESIGN_CODES = {
    "RECON_SEGMENTATION_UNAVAILABLE": errs.ReconSegmentationUnavailableError,
    "RECON_SEGMENTATION_MODEL_MISSING": errs.ReconSegmentationModelMissingError,
    "RECON_SEGMENTATION_FAILED": errs.ReconSegmentationFailedError,
    "RECON_NO_INSTANCES": errs.ReconNoInstancesError,
    "RECON_BLOCKOUT_EMPTY": errs.ReconBlockoutEmptyError,
    "RECON_VGGT_UNAVAILABLE": errs.ReconVggtUnavailableError,
    "RECON_VGGT_MODEL_MISSING": errs.ReconVggtModelMissingError,
    "RECON_VGGT_INFERENCE_FAILED": errs.ReconVggtInferenceFailedError,
    "RECON_SAM3D_UNAVAILABLE": errs.ReconSam3dUnavailableError,
    "RECON_SAM3D_MODEL_MISSING": errs.ReconSam3dModelMissingError,
    "RECON_SAM3D_INFERENCE_FAILED": errs.ReconSam3dInferenceFailedError,
    "RECON_GPU_CONTENTION": errs.ReconGpuContentionError,
    "RECON_SOURCE_SET_INVALID": errs.ReconSourceSetInvalidError,
    "RECON_TOO_MANY_VIEWS": errs.ReconTooManyViewsError,
}


@pytest.mark.parametrize(("code", "cls"), sorted(DESIGN_CODES.items()))
def test_every_design_code_has_a_class_with_that_code(code, cls):
    exc = cls("boom")
    assert exc.code == code
    assert exc.to_dict() == {"error": {"code": code, "message": "boom"}}


def test_specific_errors_stay_catchable_by_the_broad_categories():
    # except-sites that predate the catalogue must keep working.
    assert issubclass(errs.ReconSegmentationUnavailableError, errs.ReconProviderUnavailableError)
    assert issubclass(errs.ReconSegmentationModelMissingError, errs.ReconProviderUnavailableError)
    assert issubclass(errs.ReconSegmentationFailedError, errs.ReconInferenceFailedError)
    assert issubclass(errs.ReconVggtUnavailableError, errs.ReconProviderUnavailableError)
    assert issubclass(errs.ReconVggtInferenceFailedError, errs.ReconInferenceFailedError)
    assert issubclass(errs.ReconSam3dInferenceFailedError, errs.ReconInferenceFailedError)
    assert issubclass(errs.ReconSourceSetInvalidError, errs.ReconSourceInvalidError)
    assert issubclass(errs.ReconTooManyViewsError, errs.ReconRequestInvalidError)
    # all still a ReconstructionError -> the job runner's blanket handler catches them
    for cls in DESIGN_CODES.values():
        assert issubclass(cls, errs.ReconstructionError)


def test_no_instances_and_blockout_empty_are_plain_reconstruction_errors():
    # These are result-shape failures, not provider/request problems.
    assert not issubclass(errs.ReconNoInstancesError, errs.ReconProviderUnavailableError)
    assert not issubclass(errs.ReconBlockoutEmptyError, errs.ReconRequestInvalidError)
