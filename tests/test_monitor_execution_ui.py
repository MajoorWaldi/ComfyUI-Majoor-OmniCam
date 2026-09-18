from omnicam.monitor.execution_ui import execution_ui_payload


def test_panel_survives_comfy_list_aggregation_and_json_cache_round_trip():
    import json

    panel = {
        "preflight": [{"id": "video", "state": "WARNING"}],
        "capabilities": {"capabilities": [{"adapter": "wan", "state": "PASS"}]},
        "target_profile": "external_reference_video",
    }
    ui = execution_ui_payload(panel)
    # Core get_output_from_returns concatenates each UI value, even for one run.
    merged = {key: [item for output in [ui] for item in output[key]] for key in ui}
    replay = json.loads(json.dumps(merged))
    assert replay["target_profile"] == [panel["target_profile"]]
    assert replay["capabilities"] == [panel["capabilities"]]
    assert replay["preflight"] == panel["preflight"]
