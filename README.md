# Backend Engineering Assessment

This repository is a standalone starter for the backend engineering take-home assessment. It contains two independent services in a shared mono-repo:

- **python-service/** (InsightOps): FastAPI + SQLAlchemy + manual SQL migrations
- **ts-service/** (TalentFlow): NestJS + TypeORM

The repository is intentionally incomplete for assessment features. Candidates should build within the existing structure and patterns.

---

## Prerequisites

- [Docker](https://www.docker.com/)
- Python 3.12
- Node.js 22+
- npm

---

## Start Postgres

From the repository root:

```bash
docker compose up -d postgres
```

This starts PostgreSQL on `localhost:5432` with:

| Setting  | Value               |
| -------- | ------------------- |
| database | `assessment_db`   |
| user     | `assessment_user` |
| password | `assessment_pass` |

---

## Start Redis

```bash
docker compose up -d redis
```

Redis starts on `localhost:6379` (required by ts-service).

---

## Run all services with Docker

```bash
docker compose up --build
```

| Service        | URL                            |
| -------------- | ------------------------------ |
| python-service | http://localhost:8000/docs     |
| ts-service     | http://localhost:3000/api/docs |
| postgres       | localhost:5432                 |
| redis          | localhost:6379                 |

---

## Service Guides

- Python service setup and commands: [python-service/README.md](python-service/README.md)
- TypeScript service setup and commands: [ts-service/README.md](ts-service/README.md)
