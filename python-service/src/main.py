from fastapi import FastAPI

from src.briefings.router import router as briefings_router

app = FastAPI(title="python-service", version="1.0.0")

app.include_router(briefings_router)


@app.get("/health", tags=["Health"])
async def health() -> dict:
    return {"status": "ok"}
