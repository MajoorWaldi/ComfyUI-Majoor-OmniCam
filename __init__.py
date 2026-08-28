"""ComfyUI custom-node entrypoint for Majoor OmniCam."""

WEB_DIRECTORY = "./web"

# ComfyUI loads a custom-node directory as a package. Some standalone tooling
# (notably pytest collection from the repository root) may import this file as a
# top-level module named ``__init__``. Avoid importing ComfyUI-only modules in
# that standalone case so the model-agnostic test suite remains runnable.
if __package__:
    from .omnicam import routes as _routes  # noqa: F401
    from .omnicam.extension import comfy_entrypoint

    __all__ = ["WEB_DIRECTORY", "comfy_entrypoint"]
else:
    __all__ = ["WEB_DIRECTORY"]
