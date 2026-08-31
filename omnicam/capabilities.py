"""Runtime adapter diagnostics derived from the single ADAPTER_INFO registry."""

from __future__ import annotations

import contextlib
import logging
from typing import Any

from .adapters.registry import ADAPTER_INFO, CAPABILITY_STATES

logger = logging.getLogger(__name__)


def _available_node_mappings() -> dict[str, Any]:
    try:
        import nodes as comfy_nodes
        return dict(comfy_nodes.NODE_CLASS_MAPPINGS)
    except Exception as exc:  # noqa: BLE001 - running outside ComfyUI is a supported mode
        logger.debug("ComfyUI node mappings are unavailable: %s", exc)
        return {}


def _socket_names(inputs: Any, depth: int = 0) -> set[str]:
    """Collect socket ids, descending into template inputs.

    V3 wrappers such as Autogrow and DynamicCombo hold their real sockets in a
    nested template. A flat walk misses them, which is why an installed node
    could look like it was missing the very input it exposes.
    """
    names: set[str] = set()
    if depth > 4 or inputs is None:
        return names
    for item in inputs:
        name = getattr(item, "id", None) or getattr(item, "name", None)
        if name:
            names.add(str(name))
        for attribute in ("template", "inputs", "options", "entries"):
            nested = getattr(item, attribute, None)
            if isinstance(nested, (list, tuple)):
                names |= _socket_names(nested, depth + 1)
            elif nested is not None and hasattr(nested, "__iter__") and not isinstance(nested, (str, bytes, dict)):
                with contextlib.suppress(TypeError):
                    names |= _socket_names(list(nested), depth + 1)
    return names


def _declared_inputs(node_class: Any) -> set[str] | None:
    define_schema = getattr(node_class, "define_schema", None)
    if callable(define_schema):
        try:
            schema = define_schema()
            inputs = getattr(schema, "inputs", None)
            if inputs is not None:
                names = _socket_names(inputs)
                if names:
                    return names
        except Exception as exc:  # noqa: BLE001 - third-party schemas may raise anything
            logger.debug("Could not read the V3 schema of %r: %s", node_class, exc)
    try:
        spec = node_class.INPUT_TYPES()
    except Exception as exc:  # noqa: BLE001 - third-party INPUT_TYPES may raise anything
        logger.debug("Could not read INPUT_TYPES of %r: %s", node_class, exc)
        return None
    if not isinstance(spec, dict):
        return None
    names: set[str] = set()  # type: ignore[no-redef]
    for group in ("required", "optional"):
        values = spec.get(group, {})
        if isinstance(values, dict):
            names.update(str(name) for name in values)
    return names


def _evaluate_requirement(requirement: dict[str, Any], mappings: dict[str, Any]) -> dict[str, Any]:
    candidates = list(requirement.get("any_of", []))
    detected = [name for name in candidates if name in mappings]
    expected = set(requirement.get("expected_inputs", [])) | set(
        requirement.get("expected_widgets", [])
    )
    if not detected:
        state = "missing"
    else:
        contracts = [
            _declared_inputs(mappings[name])
            for name in detected
            if mappings.get(name) is not None
        ]
        known = [inputs for inputs in contracts if inputs is not None]
        if not known:
            state = "detected_unverified"
        elif any(expected.issubset(inputs) for inputs in known):
            state = "verified"
        else:
            state = "incompatible"
    return {
        "state": state,
        "any_of": candidates,
        "detected_nodes": detected,
        "expected_inputs": sorted(expected),
    }


def detect_capabilities(node_classes: set[str] | dict[str, Any] | None = None) -> dict[str, Any]:
    """Detect presence and, where introspectable, the actual socket contract."""
    mappings = _available_node_mappings() if node_classes is None else (
        dict(node_classes) if isinstance(node_classes, dict) else {name: None for name in node_classes}
    )
    capabilities = []
    for adapter, info in ADAPTER_INFO.items():
        requirements = list(info.get("requirements", []))
        stage_reports = [_evaluate_requirement(requirement, mappings) for requirement in requirements]
        states = [stage["state"] for stage in stage_reports]
        if "missing" in states:
            state = "missing"
        elif "incompatible" in states:
            state = "incompatible"
        elif "detected_unverified" in states:
            state = "detected_unverified"
        else:
            state = "verified"

        detected = [
            name for stage in stage_reports for name in stage["detected_nodes"]
        ]
        expected = set(info.get("expected_inputs", [])) | set(info.get("expected_widgets", []))

        capabilities.append({
            "adapter": adapter, "display": info["display_name"], "state": state,
            "installed": "missing" not in states, "detected_nodes": detected,
            "expected_inputs": sorted(expected), "docs": info["docs"],
            "requirements": stage_reports,
        })
    return {
        "format": "majoor.omnicam.capabilities.v2",
        "states": CAPABILITY_STATES,
        "capabilities": capabilities,
        "extractor": detect_extractor_backends(),
    }


def detect_extractor_backends() -> dict[str, Any]:
    """Which camera-tracking solvers this install can actually run.

    Both are optional, and probing them must never be able to break OmniCam's
    import: an environment with a half-built CUDA extension is exactly the one
    that needs the diagnostic to still load.
    """
    try:
        from .extractor.backends import backend_availability

        return {
            name: {"available": availability.available, "reason": availability.reason}
            for name, availability in backend_availability().items()
        }
    except Exception as exc:  # noqa: BLE001 - a broken optional dependency is a report, not a crash
        logger.debug("OmniCam extractor backends could not be probed: %s", exc)
        return {}


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
            if entry["state"] == "incompatible":
                severity = "error"
            elif entry["state"] == "missing":
                severity = "info"
            else:
                severity = "warning"

            issues.append({
                "adapter": entry["adapter"], "display": entry["display"], "state": entry["state"],
                "severity": severity,
                "message": f"{entry['display']} contract is {entry['state'].replace('_', ' ')}.",
                "remediation": remediation, "docs": entry["docs"],
            })
    extractor = capabilities.get("extractor") or {}
    if extractor and not any(entry.get("available") for entry in extractor.values()):
        # A warning, not an error: OmniCam's five other nodes work perfectly
        # well without a tracker installed.
        reasons = "; ".join(f"{name}: {entry.get('reason') or 'unavailable'}" for name, entry in extractor.items())
        issues.append({
            "adapter": "extractor", "display": "OmniCam Extractor", "state": "missing",
            "severity": "warning",
            "message": f"No camera-tracking backend is installed ({reasons}).",
            "remediation": "Install DPVO or OpenCV to use OmniCam Extractor. See docs/NODES.md",
            "docs": "https://github.com/MajoorWaldi/ComfyUI-Majoor-OmniCam/tree/main/docs/NODES.md",
        })
    return {"format": "majoor.omnicam.setup-diagnostic.v2", "ok": not any(i["severity"] == "error" for i in issues), "issues": issues}


def check_workflow_compatibility(workflow_node_types: list[str], capabilities: dict[str, Any] | None = None) -> dict[str, Any]:
    capabilities = capabilities or detect_capabilities()
    present = set(workflow_node_types)
    # The legacy per-adapter nodes. h3_native and ltx_motion_track never had
    # one: they are reachable only through Monitor.
    usage = {
        "h3": {"MajoorOmniCamH3Adapter"}, "h3_native": set(),
        "wan_ati": {"MajoorOmniCamWanVideoWrapperATI"},
        "wan_native": {"MajoorOmniCamWanNativeCamera"}, "wan_tracks_native": {"MajoorOmniCamWanVideoWrapperATI"},
        "ltx": {"MajoorOmniCamLTXAdapter", "MajoorOmniCamLTXCameraGuide"},
        "ltx_motion_track": set(),
    }
    problems = []
    for entry in capabilities["capabilities"]:
        if present.intersection(usage.get(entry["adapter"], set())) and entry["state"] in {"missing", "incompatible"}:
            problems.append({"adapter": entry["adapter"], "message": f"{entry['display']} contract is {entry['state']}.", "remediation": _remediation(entry)})
    return {"ok": not problems, "problems": problems}
