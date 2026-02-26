from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

SCHEMA_VERSION = "1.0.0"


class CarMetadata(BaseModel):
    model: str
    year: int
    platform: str
    trims: List[str]


class ProjectCreateRequest(BaseModel):
    name: str
    root_dir: str
    car: CarMetadata
    render_folders: List[str] = Field(default_factory=list)


class ProjectRecord(BaseModel):
    id: str
    schema_version: str = SCHEMA_VERSION
    name: str
    root_dir: str
    car: CarMetadata
    render_folders: List[str]
    datasets: List[str] = Field(default_factory=list)
    camera_rigs: List[str] = Field(default_factory=list)
    graphs: List[str] = Field(default_factory=list)
    lora_versions: List[Dict[str, Any]] = Field(default_factory=list)
    outputs: List[str] = Field(default_factory=list)


class DatasetBuildRequest(BaseModel):
    project_id: str
    source_folder: str
    output_name: str
    train_split: float = 0.9
    caption_mode: Literal["manual", "template", "auto-tag"] = "template"
    template: str = "{car_model} {trim} {angle}"


class TrainingConfig(BaseModel):
    base_model: str
    resolution: int
    batch_size: int
    epochs: int
    learning_rate: float
    lr_schedule: str
    captioning_method: str
    passes_used: List[str]


class LoRATrainRequest(BaseModel):
    project_id: str
    dataset_manifest: str
    lora_name: str
    config: TrainingConfig


class BackgroundGenerateRequest(BaseModel):
    prompt: str
    negative_prompt: Optional[str] = None
    style_preset: str
    width: int = 1536
    height: int = 1024
    seed: Optional[int] = None
    variants: int = 2


class CompositeRequest(BaseModel):
    project_id: str
    car_image_path: str
    car_mask_path: Optional[str] = None
    depth_path: Optional[str] = None
    background_path: str
    white_balance: float = 1.0
    exposure: float = 0.0
    grain: float = 0.0
    lens_distortion: float = 0.0


class ExportRequest(BaseModel):
    project_id: str
    output_image_path: str
    output_dir: str
    sidecar: Dict[str, Any]


class TaskStatus(BaseModel):
    task_id: str
    state: Literal["queued", "running", "completed", "failed", "cancelled"]
    progress: float = 0.0
    step: int = 0
    total_steps: int = 0
    loss: Optional[float] = None
    eta_seconds: Optional[int] = None
    gpu_usage: Optional[Dict[str, Any]] = None
    logs: List[str] = Field(default_factory=list)
    checkpoints: List[str] = Field(default_factory=list)
    error: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
