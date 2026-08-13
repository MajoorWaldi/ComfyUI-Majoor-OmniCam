import ast

from omnicam.adapters.blender import build_blender_script
from omnicam.adapters.unreal import build_unreal_python_script
from omnicam.core.track import OmniCamTrack


def test_export_scripts_embed_track():
    track = OmniCamTrack.from_dict({"duration_frames": 48})
    blender = build_blender_script(track)
    unreal = build_unreal_python_script(track)
    ast.parse(blender)
    ast.parse(unreal)
    assert "OmniCam" in blender
    assert "export_omnicam" in blender
    assert "WORLD_SCALE" in blender
    assert "TRACK" in blender
    assert "CineCameraActor" in unreal
    assert "LevelSequence" in unreal
    assert "export_sequence" in unreal
