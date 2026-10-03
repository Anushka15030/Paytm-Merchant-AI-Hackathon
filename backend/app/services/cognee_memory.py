"""Cognee Cloud adapter for per-merchant, explicitly approved memory."""

import hashlib
import os
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import httpx
from dotenv import load_dotenv


REQUEST_TIMEOUT = httpx.Timeout(60.0, connect=3.0)
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


class CogneeUnavailable(Exception):
    """Cognee is not configured or temporarily unavailable."""


def _dataset_name(merchant_id: str) -> str:
    """Create a stable, opaque dataset name without sending the merchant ID."""
    digest = hashlib.sha256(merchant_id.encode("utf-8")).hexdigest()[:32]
    return f"merchant_memory_{digest}"


class CogneeMemory:
    def __init__(self) -> None:
        self._api_url = os.getenv("COGNEE_API_URL", "").strip().rstrip("/")
        self._api_key = os.getenv("COGNEE_API_KEY", "").strip()
        self._tenant_id = os.getenv("COGNEE_TENANT_ID", "").strip()
        parsed_url = urlsplit(self._api_url)
        self._valid_url = (
            parsed_url.scheme == "https"
            and bool(parsed_url.netloc)
            and not parsed_url.query
            and not parsed_url.fragment
        )

    @property
    def configured(self) -> bool:
        return bool(self._api_key and self._tenant_id and self._valid_url)

    async def _request(
        self, method: str, path: str, *, json: dict[str, Any] | None = None,
        data: dict[str, Any] | None = None,
    ) -> Any:
        if not self.configured:
            raise CogneeUnavailable(
                "Merchant memory is not configured. Set COGNEE_API_URL, "
                "COGNEE_API_KEY, and COGNEE_TENANT_ID on the server."
            )

        try:
            async with httpx.AsyncClient(
                timeout=REQUEST_TIMEOUT,
                headers={
                    "X-Api-Key": self._api_key,
                    "X-Tenant-Id": self._tenant_id,
                },
            ) as client:
                url = f"{self._api_url}/{path.lstrip('/')}"
                response = await client.request(method, url, json=json, data=data)
            if response.status_code == 429:
                raise CogneeUnavailable("Merchant memory is rate limited.")
            response.raise_for_status()
            return response.json() if response.content else None
        except CogneeUnavailable:
            raise
        except (httpx.TimeoutException, httpx.TransportError) as exc:
            raise CogneeUnavailable("Merchant memory is temporarily unavailable.") from exc
        except httpx.HTTPStatusError as exc:
            # Do not surface provider response bodies, which may contain sensitive data.
            raise CogneeUnavailable("Merchant memory could not complete the request.") from exc

    async def retrieve(self, merchant_id: str, query: str) -> Any:
        """Retrieve only this merchant's graph chunks before chat generation."""
        dataset = _dataset_name(merchant_id)
        return await self._request(
            "POST",
            "/api/v1/search",
            json={"query": query, "search_type": "CHUNKS", "datasets": [dataset], "top_k": 5},
        )

    async def remember_approved_note(self, merchant_id: str, note: str) -> None:
        """Persist a note only after an explicit merchant-approved action."""
        dataset = _dataset_name(merchant_id)
        await self._request(
            "POST",
            "/api/v1/add",
            data={"raw_data": note, "datasetName": dataset},
        )
        await self._request(
            "POST",
            "/api/v1/cognify",
            json={"datasets": [dataset], "run_in_background": False},
        )

    async def clear(self, merchant_id: str) -> None:
        """Clear this merchant's graph/vector memory while retaining its dataset."""
        await self._request(
            "POST",
            "/api/v1/forget",
            json={"dataset": _dataset_name(merchant_id), "memoryOnly": True},
        )
