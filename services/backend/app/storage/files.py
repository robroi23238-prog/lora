from __future__ import annotations

import json
from pathlib import Path
from typing import Any

BASE_DATA = Path("services/backend/data")
PROJECTS_DIR = BASE_DATA / "projects"
TASKS_DIR = BASE_DATA / "tasks"
CONFIG_PATH = BASE_DATA / "config.json"


def ensure_dirs() -> None:
    PROJECTS_DIR.mkdir(parents=True, exist_ok=True)
    TASKS_DIR.mkdir(parents=True, exist_ok=True)
    BASE_DATA.mkdir(parents=True, exist_ok=True)


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
