from dataclasses import dataclass, field

from src.briefings.models.briefing import Briefing


@dataclass
class ReportViewModel:
    report_title: str
    company_name: str
    ticker: str
    sector: str
    analyst_name: str
    summary: str
    recommendation: str
    key_points: list[str]
    risks: list[str]
    metrics: list[dict]
    generated_at: str
    has_metrics: bool


class ReportFormatter:
    @staticmethod
    def format(briefing: Briefing) -> ReportViewModel:
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
        raw_metrics = briefing.metrics or []
        metrics = [
            {"name": m.name.title(), "value": m.value} for m in raw_metrics
        ]
        has_metrics = len(metrics) > 0

        generated_at_str = ""
        if briefing.generated_at:
            generated_at_str = briefing.generated_at.strftime(
                "%B %-d, %Y at %H:%M UTC"
            )

        report_title = (
            f"{briefing.company_name} \u2014 {briefing.sector} Briefing"
        )

        return ReportViewModel(
            report_title=report_title,
            company_name=briefing.company_name,
            ticker=briefing.ticker,
            sector=briefing.sector,
            analyst_name=briefing.analyst_name,
            summary=briefing.summary,
            recommendation=briefing.recommendation,
            key_points=key_points,
            risks=risks,
            metrics=metrics,
            generated_at=generated_at_str,
            has_metrics=has_metrics,
        )
