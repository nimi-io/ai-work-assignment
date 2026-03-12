"""
Tests for the briefings API endpoints.

Uses an in-memory SQLite database (aiosqlite) — no external services required.
UUID primary keys are stored as strings in SQLite (no native UUID type).
"""

import uuid
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.database.base import Base
from src.database.session import get_db
from src.main import app

# ---------------------------------------------------------------------------
# Database fixture — in-memory SQLite
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
_TestSession = async_sessionmaker(
    bind=_engine, class_=AsyncSession, expire_on_commit=False
)


@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db():
    """Create all tables before each test, drop after."""
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with _engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    async def override_get_db():
        async with _TestSession() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

VALID_PAYLOAD = {
    "companyName": "Acme Corp",
    "ticker": "acme",
    "sector": "Industrial Technology",
    "analystName": "Jane Smith",
    "summary": "A leading provider of widgets.",
    "recommendation": "Strong Buy",
    "keyPoints": ["Record revenue in Q4", "Expanding into APAC markets"],
    "risks": ["Supply chain disruption"],
    "metrics": [
        {"name": "P/E Ratio", "value": "22x"},
        {"name": "Revenue Growth", "value": "18%"},
    ],
}


async def _create_briefing(client: AsyncClient, payload: dict | None = None) -> dict:
    resp = await client.post("/briefings", json=payload or VALID_PAYLOAD)
    assert resp.status_code == 201
    return resp.json()


# ---------------------------------------------------------------------------
# POST /briefings
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_briefing_success(client: AsyncClient):
    data = await _create_briefing(client)

    assert data["companyName"] == "Acme Corp"
    assert data["ticker"] == "ACME"  # normalized to uppercase
    assert data["sector"] == "Industrial Technology"
    assert data["analystName"] == "Jane Smith"
    assert data["isGenerated"] is False
    assert data["generatedAt"] is None
    assert len(data["keyPoints"]) == 2
    assert len(data["risks"]) == 1
    assert len(data["metrics"]) == 2
    assert "id" in data
    assert "createdAt" in data


@pytest.mark.asyncio
async def test_create_briefing_ticker_uppercased(client: AsyncClient):
    payload = {**VALID_PAYLOAD, "ticker": "tsla"}
    data = await _create_briefing(client, payload)
    assert data["ticker"] == "TSLA"


@pytest.mark.asyncio
async def test_create_briefing_fails_with_less_than_two_key_points(client: AsyncClient):
    payload = {**VALID_PAYLOAD, "keyPoints": ["Only one point"]}
    resp = await client.post("/briefings", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_briefing_fails_with_no_risks(client: AsyncClient):
    payload = {**VALID_PAYLOAD, "risks": []}
    resp = await client.post("/briefings", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_briefing_fails_with_duplicate_metric_names(client: AsyncClient):
    payload = {
        **VALID_PAYLOAD,
        "metrics": [
            {"name": "P/E Ratio", "value": "22x"},
            {"name": "P/E Ratio", "value": "25x"},
        ],
    }
    resp = await client.post("/briefings", json=payload)
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_create_briefing_without_metrics(client: AsyncClient):
    payload = {k: v for k, v in VALID_PAYLOAD.items() if k != "metrics"}
    data = await _create_briefing(client, payload)
    assert data["metrics"] == []


# ---------------------------------------------------------------------------
# GET /briefings/{id}
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_briefing_returns_briefing(client: AsyncClient):
    created = await _create_briefing(client)
    briefing_id = created["id"]

    resp = await client.get(f"/briefings/{briefing_id}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == briefing_id
    assert data["companyName"] == "Acme Corp"


@pytest.mark.asyncio
async def test_get_briefing_returns_404_for_unknown_id(client: AsyncClient):
    unknown_id = str(uuid.uuid4())
    resp = await client.get(f"/briefings/{unknown_id}")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# POST /briefings/{id}/generate
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_generate_report_marks_is_generated_true(client: AsyncClient):
    created = await _create_briefing(client)
    briefing_id = created["id"]

    resp = await client.post(f"/briefings/{briefing_id}/generate")
    assert resp.status_code == 200
    data = resp.json()
    assert data["isGenerated"] is True
    assert data["generatedAt"] is not None


@pytest.mark.asyncio
async def test_generate_report_returns_400_if_already_generated(client: AsyncClient):
    created = await _create_briefing(client)
    briefing_id = created["id"]

    await client.post(f"/briefings/{briefing_id}/generate")
    resp = await client.post(f"/briefings/{briefing_id}/generate")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_generate_report_returns_404_for_unknown_id(client: AsyncClient):
    unknown_id = str(uuid.uuid4())
    resp = await client.post(f"/briefings/{unknown_id}/generate")
    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# GET /briefings/{id}/html
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_get_html_returns_html_content_type(client: AsyncClient):
    created = await _create_briefing(client)
    briefing_id = created["id"]
    await client.post(f"/briefings/{briefing_id}/generate")

    resp = await client.get(f"/briefings/{briefing_id}/html")
    assert resp.status_code == 200
    assert "text/html" in resp.headers["content-type"]
    assert "<html" in resp.text.lower()


@pytest.mark.asyncio
async def test_get_html_returns_400_if_not_yet_generated(client: AsyncClient):
    created = await _create_briefing(client)
    briefing_id = created["id"]

    resp = await client.get(f"/briefings/{briefing_id}/html")
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_get_html_contains_company_name(client: AsyncClient):
    created = await _create_briefing(client)
    briefing_id = created["id"]
    await client.post(f"/briefings/{briefing_id}/generate")

    resp = await client.get(f"/briefings/{briefing_id}/html")
    assert "Acme Corp" in resp.text


@pytest.mark.asyncio
async def test_get_html_returns_404_for_unknown_id(client: AsyncClient):
    unknown_id = str(uuid.uuid4())
    resp = await client.get(f"/briefings/{unknown_id}/html")
    assert resp.status_code == 404
