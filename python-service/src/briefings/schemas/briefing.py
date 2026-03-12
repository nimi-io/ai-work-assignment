import uuid
from datetime import datetime

from pydantic import BaseModel, UUID4, field_validator, model_validator


# ---------- Input ----------

class MetricInput(BaseModel):
    name: str
    value: str

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("metric name must not be empty")
        return v


class CreateBriefingRequest(BaseModel):
    companyName: str
    ticker: str
    sector: str
    analystName: str
    summary: str
    recommendation: str
    keyPoints: list[str]
    risks: list[str]
    metrics: list[MetricInput] | None = None

    @field_validator("companyName", "sector", "analystName", "summary", "recommendation")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("field must not be empty")
        return v

    @field_validator("ticker")
    @classmethod
    def ticker_uppercase(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("ticker must not be empty")
        return v.strip().upper()

    @field_validator("keyPoints")
    @classmethod
    def min_two_key_points(cls, v: list[str]) -> list[str]:
        if len(v) < 2:
            raise ValueError("at least 2 key points are required")
        return v

    @field_validator("risks")
    @classmethod
    def min_one_risk(cls, v: list[str]) -> list[str]:
        if len(v) < 1:
            raise ValueError("at least 1 risk is required")
        return v

    @model_validator(mode="after")
    def unique_metric_names(self) -> "CreateBriefingRequest":
        if self.metrics:
            names = [m.name.strip().lower() for m in self.metrics]
            if len(names) != len(set(names)):
                raise ValueError("metric names must be unique within the same briefing")
        return self


# ---------- Output ----------

class MetricResponse(BaseModel):
    id: UUID4
    name: str
    value: str

    model_config = {"from_attributes": True}


class BriefingResponse(BaseModel):
    id: UUID4
    companyName: str
    ticker: str
    sector: str
    analystName: str
    summary: str
    recommendation: str
    keyPoints: list[str]
    risks: list[str]
    metrics: list[MetricResponse]
    isGenerated: bool
    generatedAt: datetime | None
    createdAt: datetime

    model_config = {"from_attributes": True}
