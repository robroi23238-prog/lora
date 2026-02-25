from __future__ import annotations

import json
from pathlib import Path

from app.models.schemas import DatasetBuildRequest
from app.services.project_service import ProjectService


class DatasetService:
    def __init__(self) -> None:
        self.projects = ProjectService()

    def build_dataset(self, payload: DatasetBuildRequest) -> dict:
        project = self.projects.get_project(payload.project_id)
        output_dir = Path(project.root_dir) / "datasets" / payload.output_name
        output_dir.mkdir(parents=True, exist_ok=True)
        manifest_path = output_dir / "manifest.jsonl"

        beauty_files = sorted(Path(payload.source_folder).glob("**/*beauty*"))
        if not beauty_files:
            beauty_files = sorted(Path(payload.source_folder).glob("**/*.png"))

        rows = []
        split_idx = int(len(beauty_files) * payload.train_split)
        for idx, beauty in enumerate(beauty_files):
            split = "train" if idx < split_idx else "val"
            row = {
                "id": f"sample_{idx:05d}",
                "imagePath": str(beauty),
                "caption": payload.template,
                "split": split,
                "tags": [project.car.model, split],
                "passes": {
                    "beauty": str(beauty),
                    "depth": str(beauty).replace("beauty", "depth"),
                    "normals": str(beauty).replace("beauty", "normals"),
                    "masks": str(beauty).replace("beauty", "masks"),
                },
                "camera": {},
                "metadata": {"schemaVersion": "1.0.0"},
            }
            rows.append(row)

        with manifest_path.open("w", encoding="utf-8") as fp:
            for row in rows:
                fp.write(json.dumps(row) + "\n")

        return {
            "manifest": str(manifest_path),
            "count": len(rows),
            "output_dir": str(output_dir),
        }
