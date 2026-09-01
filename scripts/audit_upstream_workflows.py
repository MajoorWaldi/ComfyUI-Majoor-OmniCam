"""Validate pinned motion contracts and optionally audit upstream checkouts."""

from __future__ import annotations

import argparse
import json
from collections.abc import Iterable
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_FIXTURE_DIR = ROOT / "tests" / "fixtures" / "upstream_contracts"
SEMANTICS = {"camera_embedding", "screen_tracks", "reference_video"}


def _require_string(value: Any, field: str, errors: list[str]) -> None:
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{field} must be a non-empty string")


def validate_contract(contract: Any, source: str = "contract") -> list[str]:
    """Return schema errors for one compact upstream contract descriptor."""
    if not isinstance(contract, dict):
        return [f"{source}: contract must be an object"]

    errors: list[str] = []
    for field in ("profile_id", "display_name"):
        _require_string(contract.get(field), f"{source}.{field}", errors)

    semantic = contract.get("semantic")
    if semantic not in SEMANTICS:
        errors.append(f"{source}.semantic must be one of {sorted(SEMANTICS)}")

    node = contract.get("node")
    if not isinstance(node, dict):
        errors.append(f"{source}.node must be an object")
    else:
        _require_string(node.get("id"), f"{source}.node.id", errors)
        for direction in ("inputs", "outputs"):
            sockets = node.get(direction)
            if not isinstance(sockets, list) or not sockets:
                errors.append(f"{source}.node.{direction} must be a non-empty list")
                continue
            for index, socket in enumerate(sockets):
                prefix = f"{source}.node.{direction}[{index}]"
                if not isinstance(socket, dict):
                    errors.append(f"{prefix} must be an object")
                    continue
                _require_string(socket.get("name"), f"{prefix}.name", errors)
                _require_string(socket.get("type"), f"{prefix}.type", errors)

    frame_policy = contract.get("frame_policy")
    if not isinstance(frame_policy, dict):
        errors.append(f"{source}.frame_policy must be an object")
    else:
        _require_string(frame_policy.get("kind"), f"{source}.frame_policy.kind", errors)
        facts = frame_policy.get("facts")
        if not isinstance(facts, list) or not facts or not all(
            isinstance(fact, str) and fact.strip() for fact in facts
        ):
            errors.append(f"{source}.frame_policy.facts must contain non-empty strings")

    evidence = contract.get("evidence")
    if not isinstance(evidence, list) or not evidence:
        errors.append(f"{source}.evidence must be a non-empty list")
    else:
        for index, item in enumerate(evidence):
            prefix = f"{source}.evidence[{index}]"
            if not isinstance(item, dict):
                errors.append(f"{prefix} must be an object")
                continue
            for field in ("repository", "url", "ref", "path"):
                _require_string(item.get(field), f"{prefix}.{field}", errors)
            markers = item.get("required_literals")
            if not isinstance(markers, list) or not markers or not all(
                isinstance(marker, str) and marker for marker in markers
            ):
                errors.append(f"{prefix}.required_literals must contain strings")
    return errors


def load_contracts(fixture_dir: Path = DEFAULT_FIXTURE_DIR) -> list[dict[str, Any]]:
    """Load and validate every pinned contract fixture in filename order."""
    paths = sorted(fixture_dir.glob("*.json"))
    contracts: list[dict[str, Any]] = []
    errors: list[str] = []
    for path in paths:
        try:
            contract = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
            errors.append(f"{path.name}: {error}")
            continue
        errors.extend(validate_contract(contract, path.name))
        if isinstance(contract, dict):
            contract["_fixture"] = path.name
            contracts.append(contract)

    profile_ids = [contract.get("profile_id") for contract in contracts]
    duplicates = sorted({item for item in profile_ids if profile_ids.count(item) > 1})
    if duplicates:
        errors.append(f"duplicate profile IDs: {duplicates}")
    if errors:
        raise ValueError("Invalid upstream contract fixtures:\n- " + "\n- ".join(errors))
    return contracts


def audit_checkouts(
    contracts: Iterable[dict[str, Any]], checkouts: dict[str, Path]
) -> list[str]:
    """Return missing files/literals for repositories supplied by the caller."""
    errors: list[str] = []
    for contract in contracts:
        for evidence in contract["evidence"]:
            root = checkouts.get(evidence["repository"])
            if root is None:
                continue
            path = root / evidence["path"]
            try:
                text = path.read_text(encoding="utf-8")
            except (OSError, UnicodeDecodeError) as error:
                errors.append(f"{contract['profile_id']}: cannot read {path}: {error}")
                continue
            for marker in evidence["required_literals"]:
                if marker not in text:
                    errors.append(
                        f"{contract['profile_id']}: {evidence['path']} missing {marker!r}"
                    )
    return errors


def _checkout(value: str) -> tuple[str, Path]:
    repository, separator, raw_path = value.partition("=")
    if not separator or not repository or not raw_path:
        raise argparse.ArgumentTypeError("expected REPOSITORY=PATH")
    return repository, Path(raw_path)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fixtures", type=Path, default=DEFAULT_FIXTURE_DIR)
    parser.add_argument(
        "--checkout",
        action="append",
        default=[],
        type=_checkout,
        metavar="REPOSITORY=PATH",
    )
    args = parser.parse_args(argv)

    try:
        contracts = load_contracts(args.fixtures)
    except ValueError as error:
        print(error)
        return 1
    errors = audit_checkouts(contracts, dict(args.checkout))
    if errors:
        print("Upstream motion contracts changed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print(f"Upstream motion contracts: {len(contracts)} pinned descriptors OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
