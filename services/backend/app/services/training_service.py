from __future__ import annotations

import asyncio
import uuid
from datetime import datetime
from pathlib import Path

import psutil

from app.models.schemas import LoRATrainRequest, TaskStatus
from app.storage.files import TASKS_DIR, ensure_dirs, read_json, write_json


class TrainingService:
    def __init__(self) -> None:
        ensure_dirs()
        self._tasks: dict[str, TaskStatus] = {}

    def start_training(self, payload: LoRATrainRequest) -> TaskStatus:
        task_id = f"train_{uuid.uuid4().hex[:10]}"
        total_steps = max(payload.config.epochs * 20, 20)
        status = TaskStatus(task_id=task_id, state="queued", total_steps=total_steps)
        self._tasks[task_id] = status
        write_json(TASKS_DIR / f"{task_id}.json", status.model_dump(mode="json"))
        asyncio.create_task(self._run(task_id, payload))
        return status

    async def _run(self, task_id: str, payload: LoRATrainRequest) -> None:
        status = self._tasks[task_id]
        status.state = "running"
        checkpoint_dir = Path("demo/projects/demo-project/lora") / payload.lora_name
        checkpoint_dir.mkdir(parents=True, exist_ok=True)

        for step in range(1, status.total_steps + 1):
            await asyncio.sleep(0.2)
            if status.state == "cancelled":
                break
            status.step = step
            status.progress = step / status.total_steps
            status.loss = round(1.0 / (1 + step * 0.08), 4)
            status.eta_seconds = int((status.total_steps - step) * 0.2)
            status.gpu_usage = {"available": False, "cpu_percent": psutil.cpu_percent(interval=None)}
            status.logs.append(f"step={step} loss={status.loss}")
            if step % 20 == 0:
                ckpt = checkpoint_dir / f"step_{step}.safetensors"
                ckpt.write_text("mock checkpoint", encoding="utf-8")
                status.checkpoints.append(str(ckpt))
            status.updated_at = datetime.utcnow()
            write_json(TASKS_DIR / f"{task_id}.json", status.model_dump(mode="json"))

        if status.state != "cancelled":
            status.state = "completed"
        write_json(TASKS_DIR / f"{task_id}.json", status.model_dump(mode="json"))

    def get_status(self, task_id: str) -> TaskStatus:
        if task_id in self._tasks:
            return self._tasks[task_id]
        data = read_json(TASKS_DIR / f"{task_id}.json")
        if not data:
            raise FileNotFoundError(task_id)
        status = TaskStatus.model_validate(data)
        self._tasks[task_id] = status
        return status

    def cancel(self, task_id: str) -> TaskStatus:
        status = self.get_status(task_id)
        status.state = "cancelled"
        write_json(TASKS_DIR / f"{task_id}.json", status.model_dump(mode="json"))
        return status
