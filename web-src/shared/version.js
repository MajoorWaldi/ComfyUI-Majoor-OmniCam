// Single source of truth for the version shown on the Director/Extractor/
// Monitor panels: package.json, the same file `npm version` and the release
// process already bump alongside pyproject.toml and omnicam/__init__.py.
import pkg from "../../package.json" with { type: "json" };

export const OMNICAM_VERSION = pkg.version;
