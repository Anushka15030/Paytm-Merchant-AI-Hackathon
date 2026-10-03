"""Optional per-merchant memory contract.

The active provider intentionally stays disabled until real merchant authentication
and Cognee Cloud credentials are both available. Chat works without this service.
"""

from typing import Protocol


class MemoryProvider(Protocol):
    async def retrieve(self, merchant_id: str, query: str) -> str | None: ...

    async def remember_approved_note(self, merchant_id: str, note: str) -> None: ...

    async def clear(self, merchant_id: str) -> None: ...


class DisabledMemoryProvider:
    """No-op provider: makes no network calls and stores nothing."""

    enabled = False

    async def retrieve(self, merchant_id: str, query: str) -> None:
        return None

    async def remember_approved_note(self, merchant_id: str, note: str) -> None:
        raise RuntimeError("Memory provider is disabled.")

    async def clear(self, merchant_id: str) -> None:
        raise RuntimeError("Memory provider is disabled.")


def get_memory_provider() -> MemoryProvider:
    # Cognee is deliberately not selected merely because env vars exist. Enabling
    # it requires wiring the authenticated principal into this merchant-scoped API.
    return DisabledMemoryProvider()
