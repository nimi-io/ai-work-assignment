import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import HTTPException
from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.briefings.formatters.report_formatter import ReportFormatter
from src.briefings.models.briefing import Briefing, BriefingMetric, BriefingPoint
from src.briefings.schemas.briefing import BriefingResponse, CreateBriefingRequest

_TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "templates"

_jinja_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
)


def _to_response(briefing: Briefing) -> BriefingResponse:
    key_points = [
        p.content
        for p in sorted(
            (p for p in briefing.points if p.point_type == "key_point"),
            key=lambda p: p.display_order,
        )
    ]
    risks = [
        p.content
        for p in sorted(
            (p for p in briefing.points if p.point_type == "risk"),
            key=lambda p: p.display_order,
        )
    ]
    return BriefingResponse(
        id=briefing.id,
        companyName=briefing.company_name,
        ticker=briefing.ticker,
        sector=briefing.sector,
        analystName=briefing.analyst_name,
        summary=briefing.summary,
        recommendation=briefing.recommendation,
        keyPoints=key_points,
        risks=risks,
        metrics=briefing.metrics,
        isGenerated=briefing.is_generated,
        generatedAt=briefing.generated_at,
        createdAt=briefing.created_at,
    )


async def _fetch_with_relations(db: AsyncSession, briefing_id: uuid.UUID) -> Briefing:
    result = await db.execute(
        select(Briefing)
        .options(
            selectinload(Briefing.points),
            selectinload(Briefing.metrics),
        )
        .where(Briefing.id == briefing_id)
    )
    briefing = result.scalar_one_or_none()
    if briefing is None:
        raise HTTPException(status_code=404, detail="Briefing not found")
    return briefing


class BriefingService:
    async def create_briefing(
        self, db: AsyncSession, data: CreateBriefingRequest
    ) -> BriefingResponse:
        briefing = Briefing(
            company_name=data.companyName,
            ticker=data.ticker,
            sector=data.sector,
            analyst_name=data.analystName,
            summary=data.summary,
            recommendation=data.recommendation,
        )
        db.add(briefing)
        await db.flush()  # get the PK before adding children

        for order, content in enumerate(data.keyPoints):
            db.add(
                BriefingPoint(
                    briefing_id=briefing.id,
                    point_type="key_point",
                    content=content,
                    display_order=order,
                )
            )

        for order, content in enumerate(data.risks):
            db.add(
                BriefingPoint(
                    briefing_id=briefing.id,
                    point_type="risk",
                    content=content,
                    display_order=order,
                )
            )

        if data.metrics:
            for metric in data.metrics:
                db.add(
                    BriefingMetric(
                        briefing_id=briefing.id,
                        name=metric.name,
                        value=metric.value,
                    )
                )

        await db.commit()
        await db.refresh(briefing)
        refreshed = await _fetch_with_relations(db, briefing.id)
        return _to_response(refreshed)

    async def get_briefing(
        self, db: AsyncSession, briefing_id: uuid.UUID
    ) -> BriefingResponse:
        briefing = await _fetch_with_relations(db, briefing_id)
        return _to_response(briefing)

    async def generate_report(
        self, db: AsyncSession, briefing_id: uuid.UUID
    ) -> BriefingResponse:
        briefing = await _fetch_with_relations(db, briefing_id)

        if briefing.is_generated:
            raise HTTPException(
                status_code=400, detail="Report has already been generated"
            )

        view_model = ReportFormatter.format(briefing)
        now = datetime.now(tz=timezone.utc)
        view_model.generated_at = now.strftime("%B %-d, %Y at %H:%M UTC")

        template = _jinja_env.get_template("report.html")
        rendered_html = template.render(
            report_title=view_model.report_title,
            company_name=view_model.company_name,
            ticker=view_model.ticker,
            sector=view_model.sector,
            analyst_name=view_model.analyst_name,
            summary=view_model.summary,
            recommendation=view_model.recommendation,
            key_points=view_model.key_points,
            risks=view_model.risks,
            metrics=view_model.metrics,
            has_metrics=view_model.has_metrics,
            generated_at=view_model.generated_at,
        )

        briefing.rendered_html = rendered_html
        briefing.is_generated = True
        briefing.generated_at = now.replace(tzinfo=None)  # store as naive UTC

        db.add(briefing)
        await db.commit()
        await db.refresh(briefing)

        updated = await _fetch_with_relations(db, briefing.id)
        return _to_response(updated)

    async def get_rendered_html(
        self, db: AsyncSession, briefing_id: uuid.UUID
    ) -> str:
        briefing = await _fetch_with_relations(db, briefing_id)

        if not briefing.is_generated:
            raise HTTPException(
                status_code=400, detail="Report has not been generated yet"
            )

        return briefing.rendered_html  # type: ignore[return-value]


briefing_service = BriefingService()
