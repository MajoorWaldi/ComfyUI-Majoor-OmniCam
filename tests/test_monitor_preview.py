from omnicam.core.track import OmniCamTrack
from omnicam.monitor import preview as monitor_preview


def _track():
    return OmniCamTrack.from_dict({
        "fps": 24, "duration_frames": 25, "width": 640, "height": 360,
        "keyframes": [
            {"frame": 0, "camera": {"position": [0, 1, 5], "target": [0, 1, 0]}, "interpolation": "linear"},
            {"frame": 24, "camera": {"position": [1, 1, 5], "target": [0, 1, 0]}, "interpolation": "linear"},
        ],
    })


def test_ati_preview_contains_the_exact_adapter_tracks(monkeypatch):
    exact = [[{"x": 12.5, "y": 18.25}]]
    monkeypatch.setattr(monitor_preview, "track_to_ati_tracks", lambda *args, **kwargs: exact)
    preview = monitor_preview.build_adapter_preview(_track(), adapter="wan_ati", width=832, height=480)
    assert preview.payload["tracks"] is exact
    assert preview.exact_output_representation is True
    assert preview.kind == "trajectory_overlay"


def test_wan_native_camera_path_is_explicitly_diagnostic():
    preview = monitor_preview.build_adapter_preview(_track(), adapter="wan_native", length=81)
    assert preview.kind == "camera_path"
    assert preview.exact_output_representation is False
    assert preview.label.startswith("DIAGNOSTIC")


def test_ltx_preview_reuses_the_real_sampling_plan():
    preview = monitor_preview.build_adapter_preview(_track(), adapter="ltx", ltx_max_frames=6, ltx_sampling_mode="uniform")
    assert preview.payload["indices"] == [0, 5, 10, 14, 19, 24]
    assert preview.exact_output_representation is True


def test_h3_preview_points_to_the_existing_proxy_player():
    preview = monitor_preview.build_adapter_preview(_track(), adapter="h3", proxy_available=True)
    assert preview.kind == "proxy_video"
    assert preview.payload["proxy_available"] is True
