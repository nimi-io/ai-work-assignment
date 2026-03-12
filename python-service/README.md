# python-service

A FastAPI service for creating, managing, and rendering equity research briefings as HTML reports.

---

## Stack

- **FastAPI** — HTTP framework
- **SQLAlchemy 2 (async)** + **asyncpg** — async ORM + PostgreSQL driver
- **Alembic** — database migrations
- **Jinja2** — server-side HTML templating
- **Pydantic v2** (`pydantic-settings`) — request/response validation and config
- **pytest + pytest-asyncio + httpx** — async test suite with in-memory SQLite

---

## Setup

### 1. Install dependencies

```bash
cd python-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL connection string
```

`.env` fields:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLAlchemy async URL, e.g. `postgresql+asyncpg://user:pass@localhost:5432/dbname` |
| `ENV` | `development` \| `production` |

---

## Running the service

```bash
uvicorn src.main:app --reload --port 8000
```

Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Database migrations

Ensure `DATABASE_URL` is set in `.env`, then:

```bash
# Apply all migrations
alembic upgrade head

# Roll back one revision
alembic downgrade -1

# Create a new (empty) migration
alembic revision -m "describe change"
```

> `synchronize = False` is enforced — never let SQLAlchemy auto-create tables.

---

## Running tests

Tests use an **in-memory SQLite** database — no PostgreSQL required.

```bash
pytest
# or with coverage
pytest --tb=short -v
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/briefings` | Create a new briefing |
| `GET` | `/briefings/{id}` | Fetch a briefing by ID |
| `POST` | `/briefings/{id}/generate` | Render the HTML report |
| `GET` | `/briefings/{id}/html` | Return the rendered HTML |
| `GET` | `/health` | Health check |

---

## Assumptions

- `ticker` is always normalized to uppercase on ingestion.
- `generated_at` is stored as naive UTC (`datetime.utcnow()`) in the database.
- The rendered HTML is persisted in the `briefings.rendered_html` column; re-generating an already-generated briefing is explicitly rejected (400).
- Metric names are compared case-insensitively for uniqueness within a single request but stored with their original casing.
- `%-d` (day without leading zero) is a Linux strftime extension; on macOS use `%-d` (works on Python's standard library via `platform`).
