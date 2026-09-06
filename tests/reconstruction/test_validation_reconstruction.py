"""Tests for additive reconstruction metadata validation in MotionScene objects."""

from __future__ import annotations

import pytest

from omnicam.core.validation import TrackLimits, ValidationError, validate_object


def test_object_with_non_dict_reconstruction_raises():
    obj = {
        "id": "recon_env",
        "type": "glb",
        "reconstruction": "invalid_string_not_dict",
    }
    with pytest.raises(ValidationError, match=r"reconstruction must be an object"):
        validate_object(obj, 24, "objects[0]", TrackLimits())


def test_object_with_reconstruction_clamps_confidence():
    obj = {
        "id": "recon_env",
        "type": "glb",
        "reconstruction": {
            "version": 1,
            "role": "environment",
            "provider": "comfy_moge",
            "confidence": 1.5,
        },
    }
    validated = validate_object(obj, 24, "objects[0]", TrackLimits())
    assert validated["reconstruction"]["confidence"] == 1.0

    obj["reconstruction"]["confidence"] = -0.5
    validated2 = validate_object(obj, 24, "objects[0]", TrackLimits())
    assert validated2["reconstruction"]["confidence"] == 0.0


def test_object_with_overlong_reconstruction_strings_raises():
    obj = {
        "id": "recon_env",
        "type": "glb",
        "reconstruction": {
            "version": 1,
            "role": "environment",
            "provider": "a" * 81,  # > 80 chars
        },
    }
    with pytest.raises(ValidationError, match=r"at most 80 characters"):
        validate_object(obj, 24, "objects[0]", TrackLimits())

    obj["reconstruction"]["provider"] = "valid_provider"
    obj["reconstruction"]["role"] = "b" * 81
    with pytest.raises(ValidationError, match=r"at most 80 characters"):
        validate_object(obj, 24, "objects[0]", TrackLimits())

    obj["reconstruction"]["role"] = "environment"
    obj["reconstruction"]["source_kind"] = "c" * 81
    with pytest.raises(ValidationError, match=r"at most 80 characters"):
        validate_object(obj, 24, "objects[0]", TrackLimits())


def test_object_with_additive_unknown_subkeys_is_preserved():
    obj = {
        "id": "recon_env",
        "type": "glb",
        "reconstruction": {
            "version": 1,
            "role": "environment",
            "provider": "custom_future_model",
            "confidence": 0.85,
            "future_experimental_key": {"some": "data"},
        },
    }
    validated = validate_object(obj, 24, "objects[0]", TrackLimits())
    assert validated["reconstruction"]["future_experimental_key"] == {"some": "data"}
    assert validated["reconstruction"]["provider"] == "custom_future_model"
