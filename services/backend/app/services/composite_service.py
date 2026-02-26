from __future__ import annotations

import json
from pathlib import Path

from app.models.schemas import CompositeRequest, ExportRequest


class CompositeService:
    def integrate(self, payload: CompositeRequest) -> dict:
        out_dir = Path("demo/projects/demo-project/outputs/composites")
        out_dir.mkdir(parents=True, exist_ok=True)
        out_path = out_dir / f"composite_{Path(payload.car_image_path).stem}.json"
        out_path.write_text(json.dumps(payload.model_dump(), indent=2), encoding="utf-8")
        return {"composite_path": str(out_path), "status": "ok"}

    def export(self, payload: ExportRequest) -> dict:
        output_dir = Path(payload.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        src = Path(payload.output_image_path)
        out_img = output_dir / src.name
        if src.exists():
            out_img.write_bytes(src.read_bytes())
        else:
            out_img.write_text("mock export image", encoding="utf-8")
        sidecar = output_dir / f"{src.stem}.json"
        sidecar.write_text(json.dumps(payload.sidecar, indent=2), encoding="utf-8")
        return {"image": str(out_img), "sidecar": str(sidecar)}
