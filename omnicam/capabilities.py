"""Runtime adapter diagnostics derived from the single ADAPTER_INFO registry."""

from __future__ import annotations

from typing import Any

from .adapters.registry import ADAPTER_INFO, CAPABILITY_STATES


def _available_node_mappings() -> dict[str, Any]:
    try:
        import nodes as comfy_nodes
        return dict(comfy_nodes.NODE_CLASS_MAPPINGS)
    except Exception:
        return {}


def _declared_inputs(node_class: Any) -> set[str] | None:
    define_schema = getattr(node_class, "define_schema", None)
    if callable(define_schema):
        try:
            schema = define_schema()
            inputs = getattr(schema, "inputs", None)
            if inputs is not None:
                names = {
                    str(name)
                    for item in inputs
                    if (name := getattr(item, "id", None) or getattr(item, "name", None))
                }
                if names:
                    return names
        except Exception:
            pass
    try:
        spec = node_class.INPUT_TYPES()
    except Exception:
        return None
    if not isinstance(spec, dict):
        return None
    names: set[str] = set()
    for group in ("required", "optional"):
        values = spec.get(group, {})
        if isinstance(values, dict):
            names.update(str(name) for name in values)
    return names


def detect_capabilities(node_classes: set[str] | dict[str, Any] | None = None) -> dict[str, Any]:
    """Detect presence and, where introspectable, the actual socket contract."""
    mappings = _available_node_mappings() if node_classes is None else (
        dict(node_classes) if isinstance(node_classes, dict) else {name: None for name in node_classes}
    )
    capabilities = []
    for adapter, info in ADAPTER_INFO.items():
        candidates = list(info.get("required_node_classes", []))
        detected = [name for name in candidates if name in mappings]
        expected = set(info.get("expected_inputs", []))
        contracts = [_declared_inputs(mappings[name]) for name in detected if mappings[name] is not None]
        known = [inputs for inputs in contracts if inputs is not None]
        if not detected:
            state = "missing"
        elif not known:
            state = "detected_unverified"
        elif any(expected.issubset(inputs) for inputs in known):
            state = "verified"
        else:
            state = "incompatible"
        capabilities.append({
            "adapter": adapter, "display": info["display_name"], "state": state,
            "installed": bool(detected), "detected_nodes": detected,
            "expected_inputs": sorted(expected), "docs": info["docs"],
        })
    return {"format": "majoor.omnicam.capabilities.v2", "states": CAPABILITY_STATES, "capabilities": capabilities}


def _remediation(entry: dict[str, Any]) -> str | None:
    if entry["state"] == "verified":
        return None
    if entry["state"] == "incompatible":
        return f"Update the downstream node or use a compatible adapter contract. See {entry['docs']}"
    if entry["state"] == "detected_unverified":
        return f"Verify the detected node inputs before queueing. See {entry['docs']}"
    return f"Install {entry['display']} or remove its OmniCam adapter. See {entry['docs']}"


def diagnose_setup(capabilities: dict[str, Any] | None = None) -> dict[str, Any]:
    capabilities = capabilities or detect_capabilities()
    issues = []
    for entry in capabilities["capabilities"]:
        remediation = _remediation(entry)
        if remediation:
            issues.append({
                "adapter": entry["adapter"], "display": entry["display"], "state": entry["state"],
                "severity": "error" if entry["state"] in {"missing", "incompatible"} else "warning",
                "message": f"{entry['display']} contract is {entry['state'].replace('_', ' ')}.",
                "remediation": remediation, "docs": entry["docs"],
            })
    return {"format": "majoor.omnicam.setup-diagnostic.v2", "ok": not any(i["severity"] == "error" for i in issues), "issues": issues}


def check_workflow_compatibility(workflow_node_types: list[str], capabilities: dict[str, Any] | None = None) -> dict[str, Any]:
    capabilities = capabilities or detect_capabilities()
    present = set(workflow_node_types)
    usage = {
        "h3": {"MajoorOmniCamH3Adapter"}, "wan_ati": {"MajoorOmniCamWanVideoWrapperATI"},
        "wan_native": {"MajoorOmniCamWanNativeCamera"}, "wan_tracks_native": {"MajoorOmniCamWanVideoWrapperATI"},
        "ltx": {"MajoorOmniCamLTXAdapter", "MajoorOmniCamLTXCameraGuide"},
    }
    problems = []
    for entry in capabilities["capabilities"]:
        if present.intersection(usage.get(entry["adapter"], set())) and entry["state"] in {"missing", "incompatible"}:
            problems.append({"adapter": entry["adapter"], "message": f"{entry['display']} contract is {entry['state']}.", "remediation": _remediation(entry)})
    return {"ok": not problems, "problems": problems}
