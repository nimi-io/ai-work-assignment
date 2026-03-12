import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from src.database.base import Base


class Briefing(Base):
    __tablename__ = "briefings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ticker: Mapped[str] = mapped_column(String(20), nullable=False)
    sector: Mapped[str] = mapped_column(String(255), nullable=False)
    analyst_name: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)
    is_generated: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    generated_at: Mapped[datetime | None] = mapped_column(nullable=True)
    rendered_html: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        nullable=False, server_default=func.now(), onupdate=func.now()
    )

    points: Mapped[list["BriefingPoint"]] = relationship(
        "BriefingPoint",
        back_populates="briefing",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    metrics: Mapped[list["BriefingMetric"]] = relationship(
        "BriefingMetric",
        back_populates="briefing",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class BriefingPoint(Base):
    __tablename__ = "briefing_points"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    briefing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("briefings.id", ondelete="CASCADE"),
        nullable=False,
    )
    point_type: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, nullable=False)

    briefing: Mapped["Briefing"] = relationship("Briefing", back_populates="points")

    __table_args__ = (Index("ix_briefing_points_briefing_id", "briefing_id"),)


class BriefingMetric(Base):
    __tablename__ = "briefing_metrics"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    briefing_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("briefings.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)

    briefing: Mapped["Briefing"] = relationship("Briefing", back_populates="metrics")

    __table_args__ = (
        Index("ix_briefing_metrics_briefing_id", "briefing_id"),
        UniqueConstraint("briefing_id", "name", name="uq_briefing_metrics_briefing_name"),
    )
