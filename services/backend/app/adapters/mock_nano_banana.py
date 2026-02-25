from __future__ import annotations

import asyncio
import random
from pathlib import Path
from typing import Any, Dict

from app.adapters.base import BackgroundAdapter


class MockNanoBananaAdapter(BackgroundAdapter):
    name = "mock-nano-banana"

    async def generate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        await asyncio.sleep(0.25)
        out_dir = Path(payload.get("output_dir", "demo/projects/demo-project/outputs/backgrounds"))
        out_dir.mkdir(parents=True, exist_ok=True)
        variants = payload.get("variants", 1)
        seed_base = payload.get("seed") or random.randint(1000, 9999)
        images = []
        for i in range(variants):
            seed = seed_base + i
            file_path = out_dir / f"bg_{seed}.txt"
            file_path.write_text(
                f"Mock background for prompt={payload['prompt']} style={payload['style_preset']} seed={seed}",
                encoding="utf-8",
            )
            images.append(
                {
                    "path": str(file_path),
                    "seed": seed,
                    "metadata": {
                        "style": payload.get("style_preset"),
                        "resolution": [payload.get("width"), payload.get("height")],
                    },
                }
            )
        return {"images": images, "provider": self.name}
