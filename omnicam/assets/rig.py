"""``OMNICAM_HUMANOID_V1`` -- the one humanoid rig contract.

The catalog owns the mapping from a model's *source* rig (Mixamo, generic
GLTF, OmniCam-native) to this canonical joint set; scene state only ever
stores canonical joints (design spec sections 21-22). A rig that does not map
every required joint is simply *incomplete* -- the asset stays a normal model,
it is not a catalog error, and it must never show a ``RIGGED`` badge.

The auto-mapper here is the reference implementation the Python import path and
the tests use; the browser Rig Mapper mirrors it in
``web-src/assets/character/rig-profile.js``.
"""

from __future__ import annotations

import re

OMNICAM_HUMANOID_V1 = "omnicam_humanoid_v1"

#: The 22 joints every rigged Character must resolve (design spec section 21).
REQUIRED_JOINTS: tuple[str, ...] = (
    "root", "pelvis", "spine", "chest", "neck", "head",
    "clavicle_l", "upper_arm_l", "lower_arm_l", "hand_l",
    "clavicle_r", "upper_arm_r", "lower_arm_r", "hand_r",
    "upper_leg_l", "lower_leg_l", "foot_l", "toe_l",
    "upper_leg_r", "lower_leg_r", "foot_r", "toe_r",
)

#: Extra joints an asset may map but a rig is complete without.
OPTIONAL_JOINTS: tuple[str, ...] = ("eye_l", "eye_r", "hand_tip_l", "hand_tip_r")

CANONICAL_JOINTS: frozenset[str] = frozenset(REQUIRED_JOINTS) | frozenset(OPTIONAL_JOINTS)

_REQUIRED_SET = frozenset(REQUIRED_JOINTS)
_MIXAMO_PREFIX = re.compile(r"^mixamorig[:_ ]?", re.IGNORECASE)
_SEP = re.compile(r"[\s_\-.:|]+")

#: canonical joint -> ordered normalised aliases. Left/right are matched by a
#: trailing ``l``/``r`` token OR an embedded ``left``/``right`` (both stripped
#: to a side-less stem first, then re-checked), so ``LeftArm`` and
#: ``upper_arm.L`` both land on ``upper_arm_l``.
_ALIASES: dict[str, tuple[str, ...]] = {
    "root": ("root", "reference", "armature", "rootjnt"),
    "pelvis": ("hips", "pelvis", "hip", "cog", "root"),
    "spine": ("spine", "spine1", "abdomen", "lowerback", "back"),
    "chest": ("chest", "spine2", "spine3", "upperchest", "thorax", "ribcage"),
    "neck": ("neck", "neck1"),
    "head": ("head",),
    "clavicle_l": ("leftshoulder", "shoulderl", "claviclel", "leftclavicle", "collarl"),
    "upper_arm_l": ("leftarm", "arml", "upperarml", "leftupperarm", "leftshoulder2"),
    "lower_arm_l": ("leftforearm", "forearml", "lowerarml", "leftlowerarm", "leftelbow"),
    "hand_l": ("lefthand", "handl", "lefthandwrist", "wristl"),
    "clavicle_r": ("rightshoulder", "shoulderr", "clavicler", "rightclavicle", "collarr"),
    "upper_arm_r": ("rightarm", "armr", "upperarmr", "rightupperarm", "rightshoulder2"),
    "lower_arm_r": ("rightforearm", "forearmr", "lowerarmr", "rightlowerarm", "rightelbow"),
    "hand_r": ("righthand", "handr", "righthandwrist", "wristr"),
    "upper_leg_l": ("leftupleg", "leftupperleg", "upperlegl", "leftthigh", "thighl", "legl"),
    "lower_leg_l": ("leftleg", "leftlowerleg", "lowerlegl", "leftshin", "shinl", "leftcalf", "leftknee"),
    "foot_l": ("leftfoot", "footl", "leftankle", "anklel"),
    "toe_l": ("lefttoebase", "lefttoe", "toel", "leftball", "balll"),
    "upper_leg_r": ("rightupleg", "rightupperleg", "upperlegr", "rightthigh", "thighr", "legr"),
    "lower_leg_r": ("rightleg", "rightlowerleg", "lowerlegr", "rightshin", "shinr", "rightcalf", "rightknee"),
    "foot_r": ("rightfoot", "footr", "rightankle", "ankler"),
    "toe_r": ("righttoebase", "righttoe", "toer", "rightball", "ballr"),
    "eye_l": ("lefteye", "eyel"),
    "eye_r": ("righteye", "eyer"),
    "hand_tip_l": ("lefthandtip", "handtipl", "leftmiddle1", "leftfingers"),
    "hand_tip_r": ("righthandtip", "handtipr", "rightmiddle1", "rightfingers"),
}


def normalize_bone_name(name: str) -> str:
    """Lowercased, ``mixamorig:`` stripped, separators removed."""
    text = _MIXAMO_PREFIX.sub("", str(name or "").strip())
    return _SEP.sub("", text).lower()


def _side_variants(normalised: str) -> tuple[str, ...]:
    """Fold ``left``/``right`` words into a trailing ``l``/``r`` so an alias
    table keyed on ``leftarm`` also catches ``arm.l`` -> ``arml``."""
    out = [normalised]
    if normalised.startswith("left"):
        out.append(normalised[4:] + "l")
    elif normalised.startswith("right"):
        out.append(normalised[5:] + "r")
    if normalised.endswith("left"):
        out.append(normalised[:-4] + "l")
    elif normalised.endswith("right"):
        out.append(normalised[:-5] + "r")
    return tuple(dict.fromkeys(out))


def auto_map_bones(bone_names: list[str] | tuple[str, ...]) -> dict[str, str]:
    """Best-effort ``canonical joint -> source bone name``.

    Exact alias hits win over substring hits; every source bone is used at most
    once; ``pelvis``/``root`` disambiguate by preferring the higher-in-hierarchy
    name only when both alias to the same bone (handled by alias order).
    """
    originals = [str(n) for n in bone_names if str(n).strip()]
    normalised = {name: _side_variants(normalize_bone_name(name)) for name in originals}
    used: set[str] = set()
    mapping: dict[str, str] = {}

    for pass_kind in ("exact", "substring"):
        for canonical, aliases in _ALIASES.items():
            if canonical in mapping:
                continue
            for alias in aliases:
                hit = _match_alias(alias, normalised, used, exact=pass_kind == "exact")
                if hit is not None:
                    mapping[canonical] = hit
                    used.add(hit)
                    break

    # A Mixamo / generic rig has no dedicated root -- its hips bone *is* the
    # root. Sharing one bone between root and pelvis is intentional, so this
    # does not mark it used a second time.
    if "root" not in mapping and "pelvis" in mapping:
        mapping["root"] = mapping["pelvis"]
    return mapping


def _match_alias(
    alias: str, normalised: dict[str, tuple[str, ...]], used: set[str], *, exact: bool
) -> str | None:
    for name, variants in normalised.items():
        if name in used:
            continue
        if exact:
            if alias in variants:
                return name
        elif any(alias in variant or variant in alias for variant in variants):
            return name
    return None


def missing_required_joints(bone_map: dict[str, str] | None) -> list[str]:
    resolved = {k for k, v in (bone_map or {}).items() if str(v).strip()}
    return sorted(_REQUIRED_SET - resolved, key=REQUIRED_JOINTS.index)


def rig_is_complete(bone_map: dict[str, str] | None) -> bool:
    return not missing_required_joints(bone_map)


def rig_status(rig: dict | None) -> str:
    """``"rigged"`` (complete), ``"incomplete"`` (some mapping, missing
    required joints) or ``"none"`` (no usable mapping)."""
    bone_map = (rig or {}).get("bone_map") if isinstance(rig, dict) else None
    if not bone_map:
        return "none"
    return "rigged" if rig_is_complete(bone_map) else "incomplete"
