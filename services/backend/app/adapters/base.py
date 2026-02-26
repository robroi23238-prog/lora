from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict


class BackgroundAdapter(ABC):
    name = "base"

    @abstractmethod
    async def generate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError
