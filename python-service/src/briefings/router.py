import uuid

from fastapi import APIRouter, Depends, status
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession

from src.briefings.schemas.briefing import BriefingResponse, CreateBriefingRequest
from src.briefings.services.briefing_service import briefing_service
from src.database.session import get_db

router = APIRouter(prefix="/briefings", tags=["Briefings"])


@router.post(
    "",
    response_model=BriefingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_briefing(
    body: CreateBriefingRequest,
    db: AsyncSession = Depends(get_db),
) -> BriefingResponse:
    return await briefing_service.create_briefing(db, body)


@router.get("/{briefing_id}", response_model=BriefingResponse)
async def get_briefing(
    briefing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> BriefingResponse:
    return await briefing_service.get_briefing(db, briefing_id)


@router.post("/{briefing_id}/generate", response_model=BriefingResponse)
async def generate_report(
    briefing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> BriefingResponse:
    return await briefing_service.generate_report(db, briefing_id)


@router.get("/{briefing_id}/html", response_class=HTMLResponse)
async def get_rendered_html(
    briefing_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> HTMLResponse:
    html = await briefing_service.get_rendered_html(db, briefing_id)
    return HTMLResponse(content=html, status_code=200)
