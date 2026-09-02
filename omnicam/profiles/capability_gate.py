"""Fold the installed downstream contract into the selected profile's preflight.

A profile can compile a perfect payload for a node that is not installed. That
is not a success -- it is a workflow that will fail the moment it is queued, and
the panel is the only place the user can be told before that happens.

Capability detection already knows the answer. This module is what makes the
answer *binding*, and only for the profile the user actually selected: a missing
LTX install is irrelevant to someone compiling for Wan Camera.
"""

from __future__ import annotations

from typing import Any

from ..monitor.result import Check

#: Detected contract state -> preflight state.
_STATE_TO_CHECK = {
    "verified": "PASS",
    "detected_unverified": "WARNING",
    "incompatible": "BLOCKED",
    "missing": "BLOCKED",
}


def capability_check(profile_id: str, capabilities: dict[str, Any] | None) -> Check | None:
    """One Check for the downstream contract, or None when detection is unavailable.

    Returning None matters: outside a running ComfyUI there are no node mappings
    to inspect, and inventing a BLOCKED there would make every unit test and
    every headless compile fail for a reason that has nothing to do with the
    scene. ``node_registry_available`` is what separates that case from a
    running ComfyUI where the node is genuinely not installed -- without it both
    look like ``missing`` and this check can never be made binding.
    """
    if not capabilities:
        return None
    if not capabilities.get("node_registry_available"):
        return None
    entries = capabilities.get("capabilities")
    if not isinstance(entries, list):
        return None
    entry = next(
        (item for item in entries if str(item.get("adapter")) == profile_id),
        None,
    )
    if entry is None:
        return None

    # A profile whose contract names no downstream node -- see
    # ``external_reference_video`` -- always evaluates to "verified" with
    # nothing detected, because there is nothing to be missing or
    # incompatible with. Saying so as "user managed" is the honest read of
    # that; "verified: " with an empty list after the colon is not.
    # Checked as "key present and empty", not just falsy: `detect_capabilities`
    # always sets this key, but a hand-built test payload that omits it is
    # asserting about `state` directly and must fall through to that below.
    if "requirements" in entry and not entry["requirements"]:
        return Check(
            id="downstream_contract",
            label="Downstream contract: external / user managed",
            state="PASS",
            message=(
                "This profile applies no model-specific restrictions. Compatibility "
                "with the model you connect it to is your responsibility."
            ),
        )

    state = str(entry.get("state", ""))
    detected = [str(name) for name in entry.get("detected_nodes") or []]
    check_state = _STATE_TO_CHECK.get(state, "WARNING")
    expected = ", ".join(str(name) for name in entry.get("expected_inputs") or [])
    if check_state == "PASS":
        message = ""
        label = f"Downstream contract verified: {', '.join(detected)}"
    elif state == "missing":
        message = (
            f"{entry.get('display', profile_id)} is not installed, so this output has "
            "nowhere to connect. Install it, or choose a profile whose target you have."
        )
        label = "Downstream contract: not installed"
    elif state == "incompatible":
        message = (
            f"{', '.join(detected)} is installed but does not expose {expected}. "
            "Its socket contract changed; update the node or the OmniCam contract."
        )
        label = "Downstream contract: incompatible"
    else:
        message = (
            f"{', '.join(detected)} was found but its inputs could not be read. "
            "Verify the socket contract before queueing."
        )
        label = "Downstream contract: detected, unverified"

    return Check(
        id="downstream_contract",
        label=label,
        state=check_state,
        message=message,
    )
