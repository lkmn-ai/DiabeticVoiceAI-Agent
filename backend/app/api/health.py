"""Health check endpoint."""
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service
from app.services.cache_service import cache_service
from app.services.stt_service import stt_service
from app.services.tts_service import tts_service
from app.config import settings

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    llm_provider: str
    llm_model: str
    groq_configured: bool
    whisper_model: str
    embedding_model: str
    kb_documents: int
    cache_entries: int
    stt_available: bool
    tts_available: bool
    tts_provider: str


@router.get("/health", response_model=HealthResponse)
async def health():
    try:
        kb_count = rag_service.collection_count()
        rag_ready = True
    except Exception:
        kb_count = 0
        rag_ready = False

    try:
        cache_count = cache_service.cache_size()
    except Exception:
        cache_count = 0

    groq_configured = bool((settings.groq_api_key or "").strip())
    llm_ok = await llm_service.is_available()

    return HealthResponse(
        status="ok" if rag_ready and llm_ok else "degraded",
        llm_provider=llm_service.provider_name,
        llm_model=llm_service.model_label(),
        groq_configured=groq_configured,
        whisper_model=settings.whisper_model,
        embedding_model=settings.embedding_model,
        kb_documents=kb_count,
        cache_entries=cache_count,
        stt_available=stt_service.is_available(),
        tts_available=tts_service.is_available(),
        tts_provider=tts_service.provider_name(),
    )
