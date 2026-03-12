"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-03-10 00:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "briefings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("company_name", sa.String(255), nullable=False),
        sa.Column("ticker", sa.String(20), nullable=False),
        sa.Column("sector", sa.String(255), nullable=False),
        sa.Column("analyst_name", sa.String(255), nullable=False),
        sa.Column("summary", sa.Text, nullable=False),
        sa.Column("recommendation", sa.Text, nullable=False),
        sa.Column("is_generated", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("generated_at", sa.TIMESTAMP, nullable=True),
        sa.Column("rendered_html", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP,
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP,
            nullable=False,
            server_default=sa.text("now()"),
        ),
    )

    op.create_table(
        "briefing_points",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "briefing_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("briefings.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("point_type", sa.String(20), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("display_order", sa.Integer, nullable=False),
    )
    op.create_index(
        "ix_briefing_points_briefing_id", "briefing_points", ["briefing_id"]
    )

    op.create_table(
        "briefing_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "briefing_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("briefings.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("value", sa.String(255), nullable=False),
    )
    op.create_index(
        "ix_briefing_metrics_briefing_id", "briefing_metrics", ["briefing_id"]
    )
    op.create_unique_constraint(
        "uq_briefing_metrics_briefing_name",
        "briefing_metrics",
        ["briefing_id", "name"],
    )


def downgrade() -> None:
    op.drop_table("briefing_metrics")
    op.drop_table("briefing_points")
    op.drop_table("briefings")
