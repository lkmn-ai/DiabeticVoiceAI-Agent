"""Pydantic models for voice interactions."""
from pydantic import BaseModel
from typing import Optional


class TranscribeResponse(BaseModel):
    text: str
    duration_ms: float
    language: Optional[str] = None


class SynthesizeRequest(BaseModel):
    text: str
    voice: Optional[str] = None


class SynthesizeResponse(BaseModel):
    audio_url: str
    duration_ms: float
