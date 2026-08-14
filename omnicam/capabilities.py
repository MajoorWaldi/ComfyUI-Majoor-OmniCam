"""Adapter capability registry and setup diagnostics.

Detects which downstream nodes are installed in the running ComfyUI and
exposes per-adapter compatibility states: native (core node), optional
(third-party, verified), pinned (third-party at a pinned commit),
experimental, unsupported. The core track never depends on these states;
adapters use them to warn before queueing.
"""

from __future__ import annotations

import importlib.util
from typing import Any

# (adapter key, display, [(node class or module, state when found)], docs url)
_CAPABILITY_PROBES: list[dict[str, Any]] = [
    {
        "adapter": "wan_native",
        "display": "Wan Native Camera (Plücker)",
        "state": "native",
        "probes": {"nodes": ["WanCameraImageToVideo"], "modules": ["comfy_extras.nodes_camera_trajectory"]},
        "docs": "https://docs.comfy.org/",
    },
    {
        "adapter": "h3",
        "display": "MiniMax H3 Omni Reference",
        "state": "optional",
        "probes": {"nodes": ["MinimaxHailuo03ReferenceNode", "MiniMaxHailuo03Reference"], "modules": []},
        "docs": "https://github.com/Comfy-Org/ComfyUI",
    },
    {
        "adapter": "wan_ati",
        "display": "WanVideoWrapper ATI",
        "state": "pinned",
        "probes": {"nodes": ["WanVideoATITracks", "WanVideoATITracksVisualize"], "modules": []},
        "docs": "https://github.com/kijai/ComfyUI-WanVideoWrapper",
    },
    {
        "adapter": "ltx",
        "display": "LTX-Video camera control",
        "state": "experimental",
        "probes": {"nodes": ["LTXVAddVideoICLoRAGuide", "LTXVAddGuide"], "modules": []},
        "docs": "https://github.com/Lightricks/ComfyUI-LTXVideo",
    },
    {
        "adapter": "blender",
        "display": "Blender export",
        "state": "native",  # file export, no node dependency
        "probes": {"nodes": [], "modules": []},
        "docs": "https://docs.blender.org/api/current/",
    },
    {
        "adapter": "unreal",
        "display": "Unreal Sequencer export",
        "state": "experimental",
        "probes": {"nodes": [], "modules": []},
        "docs": "https://dev.epicgames.com/documentation/en-us/unreal-engine/",
    },
]

COMPATIBILITY_STATES = ("native", "optional", "pinned", "experimental", "unsupported")


def _available_node_classes() -> set[str]:
    """Best-effort access to the registered ComfyUI node class names."""
    try:
        import nodes as comfy_nodes

        return set(comfy_nodes.NODE_CLASS_MAPPINGS.keys())
    except Exception:
        return set()


def _module_available(name: str) -> bool:
    try:
        return importlib.util.find_spec(name) is not None
    except (ImportError, ValueError):
        return False


def detect_capabilities(node_classes: set[str] | None = None) -> dict[str, Any]:
    """Return the per-adapter capability map for the current ComfyUI install."""
    available = _available_node_classes() if node_classes is None else set(node_classes)
    capabilities = []
    for probe in _CAPABILITY_PROBES:
        found_nodes = [name for name in probe["probes"]["nodes"] if name in available]
        found_modules = [name for name in probe["probes"]["modules"] if _module_available(name)]
        probed = bool(probe["probes"]["nodes"] or probe["probes"]["modules"])
        installed = bool(found_nodes or found_modules)
        state = probe["state"] if installed else ("native" if not probed else "unsupported")
        capabilities.append(
            {
                "adapter": probe["adapter"],
                "display": probe["display"],
                "state": state,
                "installed": installed,
                "detected_nodes": found_nodes,
                "detected_modules": found_modules,
                "docs": probe["docs"],
            }
        )
    return {
        "format": "majoor.omnicam.capabilities.v1",
        "states": COMPATIBILITY_STATES,
        "capabilities": capabilities,
    }


def _remediation(entry: dict[str, Any]) -> str | None:
    if entry["installed"] or entry["state"] == "native":
        return None
    return f"Install {entry['display']} or remove the corresponding OmniCam adapter from the workflow. See {entry['docs']}"


def diagnose_setup(capabilities: dict[str, Any] | None = None) -> dict[str, Any]:
    """Actionable setup diagnostic: one entry per missing or risky adapter."""
    capabilities = capabilities or detect_capabilities()
    issues = []
    for entry in capabilities["capabilities"]:
        remediation = _remediation(entry)
        if remediation is None:
            continue
        issues.append(
            {
                "adapter": entry["adapter"],
                "display": entry["display"],
                "state": entry["state"],
                "severity": "error" if entry["state"] == "unsupported" else "warning",
                "message": f"{entry['display']} is not available in this ComfyUI install.",
                "remediation": remediation,
                "docs": entry["docs"],
            }
        )
    return {"format": "majoor.omnicam.setup-diagnostic.v1", "ok": not any(issue["severity"] == "error" for issue in issues), "issues": issues}


def check_workflow_compatibility(workflow_node_types: list[str], capabilities: dict[str, Any] | None = None) -> dict[str, Any]:
    """Detect incompatible model/control combinations before queueing.

    Given the node types present in a workflow, report adapters whose OmniCam
    nodes are used while the required downstream model nodes are missing.
    """
    capabilities = capabilities or detect_capabilities()
    present = set(workflow_node_types)
    used = {
        "h3": "MajoorOmniCamH3Adapter" in present,
        "wan_ati": "MajoorOmniCamWanVideoWrapperATI" in present,
        "wan_native": "MajoorOmniCamWanNativeCamera" in present,
        "ltx": "MajoorOmniCamLTXAdapter" in present or "MajoorOmniCamLTXCameraGuide" in present,
    }
    problems = []
    for entry in capabilities["capabilities"]:
        if used.get(entry["adapter"]) and entry["state"] == "unsupported":
            problems.append(
                {
                    "adapter": entry["adapter"],
                    "message": f"Workflow uses OmniCam's {entry['display']} adapter but {entry['display']} is not installed.",
                    "remediation": _remediation(entry),
                }
            )
    return {"ok": not problems, "problems": problems}
