from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.adapters.registry import AdapterRegistry
from app.models.schemas import (
    BackgroundGenerateRequest,
    CompositeRequest,
    DatasetBuildRequest,
    ExportRequest,
    LoRATrainRequest,
    ProjectCreateRequest,
)
from app.services.composite_service import CompositeService
from app.services.dataset_service import DatasetService
from app.services.project_service import ProjectService
from app.services.training_service import TrainingService

router = APIRouter()
projects = ProjectService()
datasets = DatasetService()
training = TrainingService()
composite = CompositeService()
adapters = AdapterRegistry()


@router.post("/projects/create")
def create_project(payload: ProjectCreateRequest):
    return projects.create_project(payload)


@router.get("/projects/{project_id}")
def get_project(project_id: str):
    try:
        return projects.get_project(project_id)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/datasets/build")
def build_dataset(payload: DatasetBuildRequest):
    return datasets.build_dataset(payload)


@router.post("/lora/train")
def start_training(payload: LoRATrainRequest):
    return training.start_training(payload)


@router.get("/lora/train/{task_id}/status")
def training_status(task_id: str):
    try:
        return training.get_status(task_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Unknown task")


@router.post("/lora/train/{task_id}/cancel")
def cancel_training(task_id: str):
    return training.cancel(task_id)


@router.post("/generate/background")
async def generate_background(payload: BackgroundGenerateRequest):
    adapter = adapters.get("mock")
    for attempt in range(3):
        try:
            response = await adapter.generate(payload.model_dump())
            return response
        except Exception as exc:
            if attempt == 2:
                raise HTTPException(status_code=502, detail=f"Adapter failed: {exc}") from exc
    raise HTTPException(status_code=500, detail="Unexpected generation failure")


@router.post("/composite/integrate")
def integrate(payload: CompositeRequest):
    return composite.integrate(payload)


@router.post("/export")
def export(payload: ExportRequest):
    return composite.export(payload)
