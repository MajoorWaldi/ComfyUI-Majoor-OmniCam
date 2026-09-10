#!/usr/bin/env python3
"""OmniCam starter asset library bootstrap (CLI entry point).

    python scripts/bootstrap_asset_library.py --preset starter --download

See ``docs/ASSET_LIBRARY.md`` for the full contract. All real logic lives in
:mod:`omnicam.assets.bootstrap.cli` so this file stays a thin launcher.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from omnicam.assets.bootstrap.cli import main

if __name__ == "__main__":
    raise SystemExit(main())
