import pytest

pytest.importorskip("comfy_api.latest")

from omnicam.core.motion_scene import MotionScene
from omnicam.nodes.monitor import MajoorOmniCamMonitor


def _scene() -> MotionScene:
    return MotionScene.from_dict(
        {
            "version": 1,
            "timeline": {"duration_seconds": 2.0, "authoring_fps": 24.0},
            "canvas": {"width": 640, "height": 360},
            "cameras": [
                {
                    "id": "hero_camera",
                    "label": "Hero Camera",
                    "enabled": True,
                    "track": {
                        "schema_version": 1,
                        "fps": 24,
                        "duration_frames": 48,
                        "width": 640,
                        "height": 360,
                        "render_mode": "omni_ref",
                        "keyframes": [
                            {
                                "frame": 0,
                                "camera": {
                                    "position": [0.0, 2.0, 6.0],
                                    "target": [0.0, 1.0, 0.0],
                                    "fov": 45.0,
                                    "roll": 0.0,
                                },
                                "interpolation": "linear",
                            }
                        ],
                        "objects": [],
                        "metadata": {},
                    },
                }
            ],
            "active_camera_id": "hero_camera",
            "playblast_camera_id": "hero_camera",
            "objects": [],
            "motion_layers": [
                {
                    "id": "subject_motion",
                    "label": "Subject motion",
                    "enabled": True,
                    "semantic": "screen_point",
                    "source_kind": "manual_2d",
                    "source": {},
                    "keys": [
                        {
                            "time_seconds": 0.0,
                            "interpolation": "linear",
                            "visible": True,
                            "x": 0.25,
                            "y": 0.5,
                        },
                        {
                            "time_seconds": 2.0,
                            "interpolation": "linear",
                            "visible": True,
                            "x": 0.75,
                            "y": 0.5,
                        },
                    ],
                }
            ],
            "cuts": [],
            "metadata": {},
        }
    )


def test_monitor_v3_schema_has_stable_typed_contract():
    schema = MajoorOmniCamMonitor.define_schema()
    assert schema.node_id == "MajoorOmniCamMonitor"
    assert schema.display_name == "OmniCam Monitor"
    assert schema.is_experimental is True
    assert [item.id for item in schema.inputs] == [
        "motion_scene", "playblast_video", "base_prompt", "target_profile",
        "target_width", "target_height", "duration_seconds", "target_fps"
    ]
    assert [item.display_name for item in schema.outputs] == [
        "final_prompt", "reference_video", "reference_frames",
        "camera_embedding", "native_tracks", "tracks_json",
        "target_width", "target_height", "target_length",
    ]


def test_a_new_monitor_defaults_to_the_permissive_generic_profile():
    """A fresh Director -> Monitor graph should never fail to queue on its own.

    Defaulting to a strict model profile means the very first thing a new user
    sees, before they have chosen a destination model, is a preflight that can
    read BLOCKED. The permissive passthrough never can.
    """
    target_profile = next(
        item for item in MajoorOmniCamMonitor.define_schema().inputs if item.id == "target_profile"
    )
    assert target_profile.default == "external_reference_video"


def test_inactive_typed_outputs_are_none_not_fake_tensors(all_targets_installed):
    output = MajoorOmniCamMonitor.execute(
        motion_scene=_scene().to_dict(),
        playblast_video=None,
        base_prompt="A test",
        target_profile="wan_move_native",
        target_width=832,
        target_height=480,
        duration_seconds=2.0,
        target_fps=24.0
    )
    values = output.outputs if hasattr(output, "outputs") else tuple(output)

    assert len(values) == 9

    assert values[0] == "A test"
    assert values[1] is None
    assert values[2] is None
    assert values[3] is None
    assert values[4] is not None
    assert values[5] == ""
    assert values[6:] == (832, 480, 48)

    ui = output.ui
    assert "preflight" in ui
    assert "capabilities" in ui
    assert ui["target_profile"] == "wan_move_native"


def test_zero_duration_and_fps_inherit_the_connected_shot(all_targets_installed):
    """0 on either widget means "use the shot the upstream authored".

    A Director authoring a 3 s move should not need its duration re-typed into
    the Monitor; leaving the field blank (0) must produce the same compile as
    typing the scene's own numbers, and a different one from the old 2 s / 24
    fps defaults.
    """
    scene = _scene().to_dict()
    scene["timeline"] = {"duration_seconds": 3.0, "authoring_fps": 30.0}
    # The camera track has to agree with the timeline it lives on.
    track = scene["cameras"][0]["track"]
    track["fps"] = 30
    track["duration_frames"] = 90

    inherited = MajoorOmniCamMonitor.execute(
        motion_scene=scene, playblast_video=None, base_prompt="",
        target_profile="external_reference_video", target_width=832, target_height=480,
        duration_seconds=0.0, target_fps=0.0,
    )
    explicit = MajoorOmniCamMonitor.execute(
        motion_scene=scene, playblast_video=None, base_prompt="",
        target_profile="external_reference_video", target_width=832, target_height=480,
        duration_seconds=3.0, target_fps=30.0,
    )
    old_defaults = MajoorOmniCamMonitor.execute(
        motion_scene=scene, playblast_video=None, base_prompt="",
        target_profile="external_reference_video", target_width=832, target_height=480,
        duration_seconds=2.0, target_fps=24.0,
    )

    def outs(node_output):
        return node_output.outputs if hasattr(node_output, "outputs") else tuple(node_output)

    assert outs(inherited)[8] == outs(explicit)[8]
    assert outs(inherited)[8] != outs(old_defaults)[8]


def test_unknown_target_profile_is_rejected_instead_of_silently_switched():
    with pytest.raises(KeyError, match="missing_profile"):
        MajoorOmniCamMonitor.execute(
            motion_scene=_scene().to_dict(),
            playblast_video=None,
            base_prompt="A test",
            target_profile="missing_profile",
            target_width=832,
            target_height=480,
            duration_seconds=2.0,
            target_fps=24.0,
        )


# ---------------------------------------------------------------------------
# The downstream capability gate is binding at execute(), not just in the panel
# ---------------------------------------------------------------------------

def _detection(state: str, **extra):
    """A detection payload from a running ComfyUI for wan_move_native."""
    return {
        "node_registry_available": True,
        "capabilities": [
            {
                "adapter": "wan_move_native",
                "display": "Wan Move",
                "state": state,
                "detected_nodes": extra.pop("detected_nodes", ["WanTrackToVideo"]),
                **extra,
            }
        ],
    }


def _execute(**overrides):
    kwargs = dict(
        motion_scene=_scene().to_dict(),
        playblast_video=None,
        base_prompt="A test",
        target_profile="wan_move_native",
        target_width=832,
        target_height=480,
        duration_seconds=2.0,
        target_fps=24.0,
    )
    kwargs.update(overrides)
    return MajoorOmniCamMonitor.execute(**kwargs)


def test_a_missing_downstream_stops_execute_instead_of_only_colouring_the_panel(monkeypatch):
    """The README promises a binding preflight; this is what makes it one.

    Compiling a payload for a node that is not installed produces a workflow
    that fails at queue time, pointing at the wrong node.
    """
    monkeypatch.setattr(
        "omnicam.nodes.monitor.detect_capabilities",
        lambda: _detection("missing", detected_nodes=[]),
    )

    with pytest.raises(ValueError, match="not installed"):
        _execute()


def test_an_incompatible_downstream_socket_contract_stops_execute(monkeypatch):
    monkeypatch.setattr(
        "omnicam.nodes.monitor.detect_capabilities",
        lambda: _detection("incompatible", expected_inputs=["tracks"]),
    )

    with pytest.raises(ValueError, match="does not expose"):
        _execute()


def test_a_detected_but_unverified_downstream_warns_and_still_compiles(monkeypatch):
    """Unverified is not a failure: the node is there, its schema was unreadable."""
    monkeypatch.setattr(
        "omnicam.nodes.monitor.detect_capabilities",
        lambda: _detection("detected_unverified"),
    )

    output = _execute()

    downstream = next(
        item for item in output.ui["preflight"] if item["id"] == "downstream_contract"
    )
    assert downstream["state"] == "WARNING"


def test_a_verified_downstream_compiles_and_reports_pass(monkeypatch):
    monkeypatch.setattr(
        "omnicam.nodes.monitor.detect_capabilities",
        lambda: _detection("verified"),
    )

    output = _execute()

    downstream = next(
        item for item in output.ui["preflight"] if item["id"] == "downstream_contract"
    )
    assert downstream["state"] == "PASS"


# ---------------------------------------------------------------------------
# A blocked run still explains itself in the panel
# ---------------------------------------------------------------------------

def _captured_panels(monkeypatch):
    """Collect what the Monitor pushes over the socket.

    The fake module is installed in ``sys.modules`` rather than patched onto the
    real one: importing ComfyUI's server pulls in the whole model stack, which
    needs a GPU this suite is not entitled to assume.
    """
    import sys
    import types

    sent = []

    class FakeServer:
        instance = type("Instance", (), {"send_sync": staticmethod(
            lambda event, payload, *args: sent.append((event, payload))
        )})()

    module = types.ModuleType("omnicam.comfy_compat.server")
    module.PromptServer = FakeServer
    monkeypatch.setitem(sys.modules, "omnicam.comfy_compat.server", module)
    return sent


def test_a_blocked_downstream_publishes_the_panel_before_it_raises(monkeypatch):
    """Stopping the run must not blank the one place that says why.

    ComfyUI delivers a node's ui only when it succeeds, so a binding preflight
    would otherwise leave the user with a traceback and an empty panel.
    """
    sent = _captured_panels(monkeypatch)
    monkeypatch.setattr(
        "omnicam.nodes.monitor.detect_capabilities",
        lambda: _detection("missing", detected_nodes=[]),
    )
    monkeypatch.setattr(MajoorOmniCamMonitor, "hidden", type("H", (), {"unique_id": "4"})())

    with pytest.raises(ValueError, match="not installed"):
        _execute()

    assert [event for event, _ in sent] == ["executed"]
    payload = sent[0][1]
    assert payload["node"] == "4"
    states = {check["id"]: check["state"] for check in payload["output"]["preflight"]}
    assert states["downstream_contract"] == "BLOCKED"
    # The scene's own checks travel with it, so the panel is not reduced to the
    # single failure that happened to stop the run.
    assert len(states) > 1


def test_a_profile_that_refuses_to_compile_also_publishes_its_panel(monkeypatch):
    sent = _captured_panels(monkeypatch)
    monkeypatch.setattr(
        "omnicam.nodes.monitor.detect_capabilities",
        lambda: {"node_registry_available": False, "capabilities": []},
    )
    monkeypatch.setattr(MajoorOmniCamMonitor, "hidden", type("H", (), {"unique_id": "7"})())

    # wan_move_native refuses a scene with no enabled motion layer.
    scene = _scene().to_dict()
    scene["motion_layers"][0]["enabled"] = False

    with pytest.raises(ValueError, match="motion layer"):
        _execute(motion_scene=scene)

    assert [event for event, _ in sent] == ["executed"]
    checks = sent[0][1]["output"]["preflight"]
    assert any(check["state"] == "BLOCKED" for check in checks)


def test_a_healthy_run_publishes_nothing_early_and_returns_its_ui(monkeypatch):
    """The success path must not double-send or pay for a second preflight."""
    sent = _captured_panels(monkeypatch)
    monkeypatch.setattr(
        "omnicam.nodes.monitor.detect_capabilities",
        lambda: _detection("verified"),
    )
    monkeypatch.setattr(MajoorOmniCamMonitor, "hidden", type("H", (), {"unique_id": "9"})())

    output = _execute()

    assert sent == []
    assert output.ui["preflight"]
