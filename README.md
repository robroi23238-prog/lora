# LoRA Studio Desktop (ComfyUI-style)

Production-grade starter for a local desktop pipeline that helps visualization studios:
1. Build datasets from CAD/Unreal multi-pass renders.
2. Train/version LoRA models per car model + trim + angle family.
3. Generate Nano Banana Pro-style backgrounds via adapter plugin.
4. Composite product-accurate car renders into generated backgrounds.

## Repository structure

- `apps/desktop` — Electron + React + TypeScript UI.
- `services/backend` — FastAPI service for projects, datasets, LoRA training jobs, background generation, compositing, export.
- `packages/shared` — typed schemas/types (zod), schema version `1.0.0`.
- `demo/projects/demo-project` — launch-ready sample project, camera rig, graph JSON, mock passes.

## Requirements

- Node.js 20+
- Python 3.10+
- Windows first priority (works on macOS as well)
- NVIDIA CUDA optional (CPU fallback currently mocked)

## Setup

### 1) Install UI dependencies

```bash
npm install
```

### 2) Install backend dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
pip install -r services/backend/requirements.txt
```

## Run

## Build installable desktop app (Windows)

This repository now includes a Windows installer pipeline.

### Prerequisites

- Node.js 20+
- Python 3.10+
- Windows machine (or Windows runner) for `.exe` output

### Build steps

From repo root:

```bash
npm install
python -m venv .venv
.venv\Scripts\activate
pip install -r services/backend/requirements-build.txt
npm run build:installer
```

What this does:
1. Freezes backend to `services/backend/dist/` via PyInstaller (`lora-backend.exe`).
2. Builds React desktop assets.
3. Packages Electron app with NSIS installer.

### Installer output

Look in:
- `apps/desktop/dist-electron/`

Typical artifact:
- `LoRA Studio Setup <version>.exe`

### Install + run

1. Double-click installer `.exe`.
2. Launch **LoRA Studio** from Start Menu or desktop shortcut.
3. App starts local backend automatically and opens the desktop window.

### Quick start (single command)

```bash
npm run dev
```

This starts both the desktop UI dev server and backend API together.

### Manual start (two terminals)

Terminal A:
```bash
npm run dev:desktop
```

Terminal B:
```bash
npm run dev:backend
```

Preview URL: `http://localhost:5173`.

### Public browser link (optional)

If you want a shareable URL (outside your local machine), run:

```bash
npm run share
```

- This starts the app and opens a tunnel on port `5173`.
- If `cloudflared` is installed, it will be used first.
- If not, `ngrok` is used (if installed).
- The command prints an `https://...` URL you can open/share.

> Note: frontend API requests use `/api` and Vite proxies them to `http://localhost:8000`, so the shared frontend URL also works with backend endpoints while your dev process is running.

## Core workflow

### Create/Open project
- Use `POST /projects/create` to initialize a persistent project root with datasets/cameras/graphs/lora/outputs folders.
- Project explorer shows datasets, camera rigs, LoRA versions, node graphs, outputs.

### Import CAD renders + dataset build
- `ImportCADRendersNode` loads beauty/depth/normals/masks.
- `DatasetBuilderNode` writes `manifest.jsonl` where each line stores pass paths, tags, captions, and camera metadata.
- Run backend endpoint:

```bash
curl -X POST http://localhost:8000/datasets/build \
  -H 'Content-Type: application/json' \
  -d '{"project_id":"demo-project","source_folder":"demo/projects/demo-project/renders","output_name":"falcon_v1"}'
```

### Camera preview and rigs
- Right inspector includes 3D orbit viewport with camera controls.
- Save/load rigs as JSON (`demo/projects/demo-project/cameras/*.json`).
- Supports manual matching for external shot metadata.

### Train LoRA
- `LoRATrainingNode` configures base model, resolution, batch, epochs, LR schedule, captioning mode, dataset passes.
- Start task from UI or endpoint:

```bash
curl -X POST http://localhost:8000/lora/train \
  -H 'Content-Type: application/json' \
  -d '{"project_id":"demo-project","dataset_manifest":"demo/projects/demo-project/datasets/falcon_v1/manifest.jsonl","lora_name":"falcon_gt_front","config":{"base_model":"sdxl-base","resolution":1024,"batch_size":2,"epochs":4,"learning_rate":0.0001,"lr_schedule":"cosine","captioning_method":"template","passes_used":["beauty","depth","masks"]}}'
```

Poll:
```bash
curl http://localhost:8000/lora/train/<task_id>/status
```

### Background + integration
- `BackgroundGenNode` calls plugin adapter.
- Default provider: `MockNanoBananaAdapter` (simulated responses, retry support).
- `IntegrationCompositeNode` merges car/background with alignment metadata, shadows, color/exposure/grain/lens-distortion controls.

### Export
- `OutputNode` writes final image and sidecar JSON with prompt, LoRA version(s), seed, camera metadata.
- Endpoint: `POST /export`.

## Backend API (implemented)

- `POST /projects/create`
- `GET /projects/{id}`
- `POST /datasets/build`
- `POST /lora/train`
- `GET /lora/train/{task_id}/status`
- `POST /lora/train/{task_id}/cancel`
- `POST /generate/background`
- `POST /composite/integrate`
- `POST /export`

## Plugin architecture

Adapters live in `services/backend/app/adapters`.
- `base.py` — adapter interface
- `mock_nano_banana.py` — default simulator for local dev/testing
- `registry.py` — swap in real provider later

Add real API credentials/endpoints in `services/backend/data/config.json` (not committed by default).

## Persistence formats

- Node graphs: JSON (`graphs/*.json`)
- Camera rigs: JSON (`cameras/*.json`)
- Datasets: JSONL (`datasets/*/manifest.jsonl`)
- Outputs: image + sidecar JSON

All records include `schemaVersion` for migration-friendly evolution.

## What to build next

1. Real Nano Banana Pro adapter (auth, retries, rate limiting, robust error maps).
2. Physically-based relighting with HDRI estimation and shadow catcher integration.
3. Unreal bridge for direct render pass ingestion + camera metadata sync.
4. Multi-GPU distributed LoRA training with checkpoint pruning and promotion workflows.
5. Full node execution engine (topological scheduling, cache invalidation, resumable runs).
