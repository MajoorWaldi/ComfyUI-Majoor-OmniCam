"""Structural validation for catalog rows, semantic tags and viewport labels.

One rule set, applied everywhere an asset / tag / annotation enters the system:
catalog files, import payloads and (later) Semantic Director API operations.
Failures raise a typed :class:`omnicam.assets.errors.AssetError` subclass whose
``code`` is wire-stable (design spec sections 12 and 32).
"""

from __future__ import annotations

import math
import re
from typing import Any

from .errors import (
    AnnotationInvalidError,
    AssetCatalogInvalidError,
    AssetLicenseInvalidError,
    TagInvalidError,
    TagLimitExceededError,
)
from .types import (
    ASSET_FITS,
    ASSET_FORMATS,
    ASSET_KINDS,
    AssetDefinition,
)

# -- bounds (design spec section 32) ----------------------------------- #
MAX_TAGS_PER_OBJECT = 32
MAX_TAG_CHARS = 64
MAX_ANNOTATION_CHARS = 128
MAX_ASSET_ID_CHARS = 120
MAX_ASSET_KIND_CHARS = 32
MAX_CLIPS_PER_ASSET = 256
MAX_BONE_MAPPINGS_PER_ASSET = 128
MAX_ANIMATION_ID_CHARS = 80
MAX_SPDX_CHARS = 64
MAX_SOURCE_CHARS = 400

#: Lowercase ASCII semantic slug: ``a-z 0-9 _ -``, must start alphanumeric.
_SLUG = re.compile(r"^[a-z0-9][a-z0-9_-]*$")
#: Strict 3- or 6-digit hex colour, nothing else.
_HEX_COLOR = re.compile(r"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")
#: A dotted asset id: ``omnicam.character.human_01``.
_ASSET_ID = re.compile(r"^[a-z0-9]+(?:[._-][a-z0-9]+)*$")

_ANNOTATION_ANCHORS = frozenset({"top", "center", "bottom"})
#: Substrings that would make a label anything other than inert text.
_UNSAFE_ANNOTATION = ("<", ">", "://", "javascript:", "expression(", "&#", "\\")


def validate_tags(raw: Any) -> list[str]:
    """Normalise a tag list: lowercase, trimmed, slug-checked, deduplicated,
    order preserved. Raises on a non-list, an over-long tag or too many tags."""
    if raw is None:
        return []
    if not isinstance(raw, (list, tuple)):
        raise TagInvalidError("tags must be a list of strings")
    out: list[str] = []
    seen: set[str] = set()
    for item in raw:
        if not isinstance(item, str):
            raise TagInvalidError(f"tag must be a string, got {type(item).__name__}")
        tag = item.strip().lower()
        if not tag:
            continue
        if len(tag) > MAX_TAG_CHARS:
            raise TagInvalidError(f"tag exceeds {MAX_TAG_CHARS} chars: {tag[:16]}…")
        if not _SLUG.match(tag):
            raise TagInvalidError(f"tag is not a lowercase semantic slug: {item!r}")
        if tag in seen:
            continue
        seen.add(tag)
        out.append(tag)
    if len(out) > MAX_TAGS_PER_OBJECT:
        raise TagLimitExceededError(f"more than {MAX_TAGS_PER_OBJECT} tags")
    return out


def validate_annotation(raw: Any) -> dict[str, Any] | None:
    """Validate a viewport-label annotation, or ``None`` when absent/empty.

    ``{"text": str<=128, "visible": bool, "color": "#rrggbb", "anchor": ...}``
    Text is inert -- no HTML, URL or CSS expression -- because the overlay
    renders it with ``textContent`` (design spec section 32).
    """
    if raw is None:
        return None
    if not isinstance(raw, dict):
        raise AnnotationInvalidError("annotation must be an object")
    text = raw.get("text", "")
    if not isinstance(text, str):
        raise AnnotationInvalidError("annotation text must be a string")
    text = text.strip()
    if not text:
        return None
    if len(text) > MAX_ANNOTATION_CHARS:
        raise AnnotationInvalidError(f"annotation text exceeds {MAX_ANNOTATION_CHARS} chars")
    lowered = text.lower()
    if any(bad in lowered for bad in _UNSAFE_ANNOTATION):
        raise AnnotationInvalidError("annotation text may not contain HTML, URLs or CSS expressions")
    color = str(raw.get("color", "#8d7ee8")).strip()
    if not _HEX_COLOR.match(color):
        raise AnnotationInvalidError(f"annotation color is not a strict hex colour: {color!r}")
    anchor = str(raw.get("anchor", "top")).strip().lower()
    if anchor not in _ANNOTATION_ANCHORS:
        raise AnnotationInvalidError(f"annotation anchor must be one of {sorted(_ANNOTATION_ANCHORS)}")
    visible = raw.get("visible", True)
    return {
        "text": text,
        "visible": bool(visible),
        "color": color.lower(),
        "anchor": anchor,
    }


def validate_license(raw: Any) -> dict[str, str]:
    """``{"spdx": str, "source": str}`` -- both optional, both bounded."""
    if raw is None:
        return {}
    if not isinstance(raw, dict):
        raise AssetLicenseInvalidError("license must be an object")
    spdx = str(raw.get("spdx", "")).strip()
    source = str(raw.get("source", "")).strip()
    if len(spdx) > MAX_SPDX_CHARS:
        raise AssetLicenseInvalidError(f"license spdx exceeds {MAX_SPDX_CHARS} chars")
    if len(source) > MAX_SOURCE_CHARS:
        raise AssetLicenseInvalidError(f"license source exceeds {MAX_SOURCE_CHARS} chars")
    out: dict[str, str] = {}
    if spdx:
        out["spdx"] = spdx
    if source:
        out["source"] = source
    return out


def _validate_rig(definition: AssetDefinition) -> None:
    rig = definition.rig
    if rig is None:
        return
    if len(rig.bone_map) > MAX_BONE_MAPPINGS_PER_ASSET:
        raise AssetCatalogInvalidError(
            f"asset {definition.id!r}: more than {MAX_BONE_MAPPINGS_PER_ASSET} bone mappings"
        )
    for canonical, bone in rig.bone_map.items():
        if not canonical or not isinstance(canonical, str) or len(canonical) > MAX_TAG_CHARS:
            raise AssetCatalogInvalidError(f"asset {definition.id!r}: invalid canonical joint {canonical!r}")
        if not bone or len(bone) > 160:
            raise AssetCatalogInvalidError(f"asset {definition.id!r}: invalid runtime bone {bone!r}")


def validate_asset_definition(
    data: dict[str, Any] | AssetDefinition, *, source: str = "default"
) -> AssetDefinition:
    """Parse (if needed) and structurally validate one catalog row.

    Rig *completeness* against ``OMNICAM_HUMANOID_V1`` is deferred to Phase 5 --
    an incomplete rig simply leaves the asset a normal model, it is not a
    catalog error (design spec section 22).
    """
    definition = (
        data
        if isinstance(data, AssetDefinition)
        else AssetDefinition.from_dict(data, source=source)
    )
    definition.source = source

    if not definition.id or not _ASSET_ID.match(definition.id) or len(definition.id) > MAX_ASSET_ID_CHARS:
        raise AssetCatalogInvalidError(f"asset id is not a valid dotted slug: {definition.id!r}")
    if not definition.name:
        raise AssetCatalogInvalidError(f"asset {definition.id!r}: name is required")
    if definition.kind not in ASSET_KINDS:
        raise AssetCatalogInvalidError(
            f"asset {definition.id!r}: unknown kind {definition.kind!r}; expected {sorted(ASSET_KINDS)}"
        )
    if len(definition.kind) > MAX_ASSET_KIND_CHARS:
        raise AssetCatalogInvalidError(f"asset {definition.id!r}: kind string too long")
    if definition.fit not in ASSET_FITS:
        raise AssetCatalogInvalidError(
            f"asset {definition.id!r}: unknown fit {definition.fit!r}; expected {sorted(ASSET_FITS)}"
        )
    if definition.kind == "helper":
        # Built-in primitive: no managed file, no format constraint.
        if definition.file and definition.format not in ASSET_FORMATS:
            raise AssetCatalogInvalidError(f"asset {definition.id!r}: unknown format {definition.format!r}")
    else:
        if not definition.file:
            raise AssetCatalogInvalidError(f"asset {definition.id!r}: file is required for kind {definition.kind!r}")
        if definition.format not in ASSET_FORMATS:
            raise AssetCatalogInvalidError(
                f"asset {definition.id!r}: unknown format {definition.format!r}; expected {sorted(ASSET_FORMATS)}"
            )
        _reject_path_escape(definition.id, definition.file)
    if definition.thumbnail:
        _reject_path_escape(definition.id, definition.thumbnail)

    if any((not math.isfinite(v) or v <= 0.0) for v in definition.base_size):
        raise AssetCatalogInvalidError(f"asset {definition.id!r}: base_size must be three finite positive numbers")

    definition.tags = validate_tags(definition.tags)
    definition.license = validate_license(definition.license)

    if len(definition.animations) > MAX_CLIPS_PER_ASSET:
        raise AssetCatalogInvalidError(f"asset {definition.id!r}: more than {MAX_CLIPS_PER_ASSET} clips")
    seen_clip_ids: set[str] = set()
    for clip in definition.animations:
        if not clip.id or not _SLUG.match(clip.id) or len(clip.id) > MAX_ANIMATION_ID_CHARS:
            raise AssetCatalogInvalidError(f"asset {definition.id!r}: invalid animation id {clip.id!r}")
        if clip.id in seen_clip_ids:
            raise AssetCatalogInvalidError(f"asset {definition.id!r}: duplicate animation id {clip.id!r}")
        seen_clip_ids.add(clip.id)
        clip.tags = validate_tags(clip.tags)

    _validate_rig(definition)
    return definition


def _reject_path_escape(asset_id: str, relative: str) -> None:
    """A catalog ``file`` / ``thumbnail`` is always a forward-slash relative path
    inside the managed library -- never absolute, never ``..``, never a drive."""
    text = relative.replace("\\", "/")
    if text.startswith("/") or text.startswith("~") or re.match(r"^[A-Za-z]:", text):
        raise AssetCatalogInvalidError(f"asset {asset_id!r}: file path must be relative: {relative!r}")
    if any(part in ("..", "") for part in text.split("/")):
        raise AssetCatalogInvalidError(f"asset {asset_id!r}: file path may not contain '..' or empty segments")
