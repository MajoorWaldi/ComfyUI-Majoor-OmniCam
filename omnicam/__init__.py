"""Model-agnostic OmniCam package.

Keep this module free of ComfyUI imports so the camera math, adapters, exporters,
and tests can run in normal Python tooling outside a live ComfyUI process.
The custom-node entrypoint lives in the repository root ``__init__.py``.
"""

__version__ = "0.2.0"

__all__ = ["__version__"]
