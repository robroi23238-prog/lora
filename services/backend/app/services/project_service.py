from __future__ import annotations

import uuid
from pathlib import Path

from app.models.schemas import ProjectCreateRequest, ProjectRecord
from app.storage.files import PROJECTS_DIR, ensure_dirs, read_json, write_json


class ProjectService:
    def __init__(self) -> None:
        ensure_dirs()

    def create_project(self, payload: ProjectCreateRequest) -> ProjectRecord:
        project_id = f"proj_{uuid.uuid4().hex[:8]}"
        root = Path(payload.root_dir)
        for sub in ["datasets", "cameras", "graphs", "lora", "outputs"]:
            (root / sub).mkdir(parents=True, exist_ok=True)
        record = ProjectRecord(
            id=project_id,
            name=payload.name,
            root_dir=str(root),
            car=payload.car,
            render_folders=payload.render_folders,
        )
        write_json(PROJECTS_DIR / f"{project_id}.json", record.model_dump())
        return record

    def get_project(self, project_id: str) -> ProjectRecord:
        data = read_json(PROJECTS_DIR / f"{project_id}.json")
        if not data:
            raise FileNotFoundError(f"Project {project_id} not found")
        return ProjectRecord.model_validate(data)
