"""Stable error catalogue and exception classes for scene reconstruction."""

from __future__ import annotations


class ReconstructionError(Exception):
    """Base exception for all reconstruction failures with a stable error code."""

    code: str = "RECON_FAILED"

    def __init__(self, message: str, *, code: str | None = None) -> None:
        super().__init__(message)
        if code:
            self.code = code

    def to_dict(self) -> dict[str, dict[str, str]]:
        return {"error": {"code": self.code, "message": str(self)}}


class ReconSourceInvalidError(ReconstructionError):
    code = "RECON_SOURCE_INVALID"


class ReconSourceUnsupportedError(ReconstructionError):
    code = "RECON_SOURCE_UNSUPPORTED"


class ReconProviderUnavailableError(ReconstructionError):
    code = "RECON_PROVIDER_UNAVAILABLE"


class ReconModelMissingError(ReconstructionError):
    code = "RECON_MODEL_MISSING"


class ReconGpuOomError(ReconstructionError):
    code = "RECON_GPU_OOM"


class ReconInferenceFailedError(ReconstructionError):
    code = "RECON_INFERENCE_FAILED"


class ReconEmptyGeometryError(ReconstructionError):
    code = "RECON_EMPTY_GEOMETRY"


class ReconMeshTooLargeError(ReconstructionError):
    code = "RECON_MESH_TOO_LARGE"


class ReconAssetWriteFailedError(ReconstructionError):
    code = "RECON_ASSET_WRITE_FAILED"


class ReconCancelledError(ReconstructionError):
    code = "RECON_CANCELLED"


class ReconResultInvalidError(ReconstructionError):
    code = "RECON_RESULT_INVALID"


class ReconRequestInvalidError(ReconstructionError):
    """The requested reconstruction parameters are not a valid combination
    (unknown mode, a checkpoint that is not installed, ...)."""

    code = "RECON_REQUEST_INVALID"


class ReconGpuContentionError(ReconstructionError):
    """A ComfyUI workflow claimed the GPU while reconstruction was using it.

    Deliberately not a ReconCancelledError: the user did not ask for this, and
    a silent STOPPED would leave them staring at a job that abandoned itself
    for no visible reason.
    """

    code = "RECON_GPU_CONTENTION"


class ReconGpuBusyError(ReconstructionError):
    """ComfyUI is already executing a workflow; refused to start reconstruction."""

    code = "RECON_GPU_BUSY"


# --------------------------------------------------------------------------- #
# Granular semantic-blockout / scan / completion codes (design doc section 19).
# Each is a subclass of an existing broad category so ``except`` sites that
# already catch ReconProviderUnavailableError / ReconInferenceFailedError /
# ReconRequestInvalidError keep working, while the wire ``code`` is specific.
# --------------------------------------------------------------------------- #
class ReconSegmentationUnavailableError(ReconProviderUnavailableError):
    code = "RECON_SEGMENTATION_UNAVAILABLE"


class ReconSegmentationModelMissingError(ReconProviderUnavailableError):
    code = "RECON_SEGMENTATION_MODEL_MISSING"


class ReconSegmentationFailedError(ReconInferenceFailedError):
    code = "RECON_SEGMENTATION_FAILED"


class ReconNoInstancesError(ReconstructionError):
    code = "RECON_NO_INSTANCES"


class ReconBlockoutEmptyError(ReconstructionError):
    code = "RECON_BLOCKOUT_EMPTY"


class ReconVggtUnavailableError(ReconProviderUnavailableError):
    code = "RECON_VGGT_UNAVAILABLE"


class ReconVggtModelMissingError(ReconProviderUnavailableError):
    code = "RECON_VGGT_MODEL_MISSING"


class ReconVggtInferenceFailedError(ReconInferenceFailedError):
    code = "RECON_VGGT_INFERENCE_FAILED"


class ReconSam3dUnavailableError(ReconProviderUnavailableError):
    code = "RECON_SAM3D_UNAVAILABLE"


class ReconSam3dModelMissingError(ReconProviderUnavailableError):
    code = "RECON_SAM3D_MODEL_MISSING"


class ReconSam3dInferenceFailedError(ReconInferenceFailedError):
    code = "RECON_SAM3D_INFERENCE_FAILED"


class ReconSourceSetInvalidError(ReconSourceInvalidError):
    code = "RECON_SOURCE_SET_INVALID"


class ReconTooManyViewsError(ReconRequestInvalidError):
    code = "RECON_TOO_MANY_VIEWS"


class ReconAssetLibraryUnavailableError(ReconProviderUnavailableError):
    """Blockout asset retrieval was requested but the GLB library is not
    installed (run ``scripts/fetch_blockout_library.py``)."""

    code = "RECON_ASSET_LIBRARY_UNAVAILABLE"


class ReconAssetLibraryInvalidError(ReconRequestInvalidError):
    """The asset library's ``library.json`` is absent or malformed."""

    code = "RECON_ASSET_LIBRARY_INVALID"
