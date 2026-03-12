# ts-service (TalentFlow)

A NestJS service for managing candidates, documents, summaries, and workspaces with AI-powered summarization.

---

## Stack

- **NestJS** — HTTP framework
- **TypeORM** + **pg** — ORM + PostgreSQL driver
- **BullMQ** + **ioredis** — Redis-backed job queues
- **@nestjs/config** — environment-based configuration
- **class-validator** + **class-transformer** — request validation
- **@nestjs/swagger** — API documentation

---

## Setup

### 1. Install dependencies

```bash
cd ts-service
npm install
```

### 2. Configure environment

Create a `.env` file at the **repository root** (one level up from `ts-service/`):

```bash
cp .env.example .env
# Edit .env with your credentials
```

`.env` fields used by ts-service:

| Variable      | Description                                  | Default               |
|---------------|----------------------------------------------|-----------------------|
| `PORT`        | HTTP port                                    | `3000`                |
| `ENV`         | `development` \| `staging` \| `production`  | `development`         |
| `DB_HOST`     | PostgreSQL host                              | `localhost`           |
| `DB_PORT`     | PostgreSQL port                              | `5432`                |
| `DB_USER`     | PostgreSQL user                              | —                     |
| `DB_PASSWORD` | PostgreSQL password                          | —                     |
| `DB_NAME`     | PostgreSQL database name                     | —                     |
| `REDIS_HOST`  | Redis host (BullMQ)                          | `localhost`           |
| `REDIS_PORT`  | Redis port (BullMQ)                          | `6379`                |
| `REDIS_URL`   | Redis connection URL                         | `redis://localhost:6379` |

> In `development` mode TypeORM runs with `synchronize: true` — schema is auto-managed.

---

## Running the service

```bash
# Development (hot-reload)
npm run start:dev

# Production build
npm run build
npm run start:prod
```

Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Running tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# e2e tests
npm run test:e2e
```

---

## API Overview

All routes are prefixed with `/api/v1/`.

| Resource      | Base path              | Description                              |
|---------------|------------------------|------------------------------------------|
| Candidates    | `/api/v1/candidates`   | Create and manage candidates             |
| Documents     | `/api/v1/documents`    | Upload and retrieve candidate documents  |
| Summaries     | `/api/v1/summaries`    | AI-generated candidate summaries        |
| Workspaces    | `/api/v1/workspaces`   | Multi-tenant workspace management        |

Authentication is header-based in development (`x-user-id`, `x-workspace-id`).

---

## Queue

Document summarization is processed asynchronously via BullMQ. Ensure Redis is running before processing jobs:

```bash
docker compose up -d redis
```
