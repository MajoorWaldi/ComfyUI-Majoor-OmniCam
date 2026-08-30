import pytest

pytest.importorskip("comfy_api.latest")


def test_comfy_compat_reexports_the_supported_v3_surface():
    from omnicam.comfy_compat import IO, UI, ComfyAPI, ComfyExtension, InputImpl, PromptServer

    assert ComfyAPI is not None
    assert ComfyExtension is not None
    assert IO is not None
    assert InputImpl is not None
    assert PromptServer is not None
    assert UI is not None
