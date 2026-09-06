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
