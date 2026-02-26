from __future__ import annotations

from app.adapters.base import BackgroundAdapter
from app.adapters.mock_nano_banana import MockNanoBananaAdapter


class AdapterRegistry:
    def __init__(self) -> None:
        self._providers: dict[str, BackgroundAdapter] = {
            "mock": MockNanoBananaAdapter(),
        }

    def get(self, key: str = "mock") -> BackgroundAdapter:
        return self._providers[key]
