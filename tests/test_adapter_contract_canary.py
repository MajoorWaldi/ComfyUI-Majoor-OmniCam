from pathlib import Path

from scripts.adapter_contract_canary import verify


def _write_node(path: Path, name: str, literals: list[str]) -> None:
    quoted = ", ".join(repr(value) for value in literals)
    path.write_text(f"class {name}:\n    inputs = ({quoted},)\n", encoding="utf-8")


def test_adapter_contract_canary_accepts_current_required_surfaces(tmp_path):
    ltx = tmp_path / "ltx"
    wan = tmp_path / "wan"
    ltx.mkdir()
    wan.mkdir()
    _write_node(ltx / "nodes.py", "LTXVDrawTracks", ["tracks", "width", "height"])
    _write_node(ltx / "guide.py", "LTXAddVideoICLoRAGuide", ["image"])
    _write_node(wan / "nodes.py", "WanVideoATITracks", ["tracks", "width", "height"])

    assert verify({"ltx": ltx, "ltx_motion_track": ltx, "wan_ati": wan}) == []


def test_adapter_contract_canary_reports_missing_required_socket(tmp_path):
    ltx = tmp_path / "ltx"
    wan = tmp_path / "wan"
    ltx.mkdir()
    wan.mkdir()
    _write_node(ltx / "nodes.py", "LTXVDrawTracks", ["tracks", "width"])
    _write_node(ltx / "guide.py", "LTXAddVideoICLoRAGuide", ["image"])
    _write_node(wan / "nodes.py", "WanVideoATITracks", ["tracks", "width", "height"])

    errors = verify({"ltx": ltx, "ltx_motion_track": ltx, "wan_ati": wan})

    assert any("ltx_motion_track" in error and "height" in error for error in errors)
