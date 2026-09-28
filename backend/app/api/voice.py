"""
Voice API endpoints.
POST /api/voice/transcribe    — audio bytes → text (STT)
POST /api/voice/synthesize    — text → audio (TTS)
POST /api/voice/conversation  — full pipeline: audio → STT → route → TTS → audio
"""
import time
import uuid
import base64
import logging
import traceback
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional

from app.models.voice import TranscribeResponse, SynthesizeRequest
from app.models.chat import Message
from app.services.stt_service import stt_service
from app.services.tts_service import tts_service
from app.services.router_service import route_query
from app.services.analytics_service import analytics_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/api/voice/transcribe", response_model=TranscribeResponse)
async def transcribe(audio: UploadFile = File(...)):
    """Convert uploaded audio to text using local Whisper."""
    logger.info(f"POST /api/voice/transcribe — file={audio.filename} type={audio.content_type}")

    if not stt_service.is_available():
        raise HTTPException(
            status_code=503,
            detail="STT service unavailable. Install faster-whisper: pip install faster-whisper",
        )

    try:
        audio_bytes = await audio.read()
    except Exception as exc:
        logger.error(f"Failed to read audio upload: {exc}")
        raise HTTPException(status_code=400, detail=f"Could not read audio: {exc}")

    if len(audio_bytes) < 100:
        raise HTTPException(status_code=400, detail="Audio file too small or empty.")

    fmt = "webm"
    if audio.content_type:
        if "wav" in audio.content_type:   fmt = "wav"
        elif "mp4" in audio.content_type or "mpeg" in audio.content_type: fmt = "mp4"
        elif "ogg" in audio.content_type: fmt = "ogg"

    try:
        transcript, duration_ms = stt_service.transcribe(audio_bytes, fmt)
    except Exception as exc:
        logger.error(f"STT transcription failed: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}")

    logger.info(f"Transcribed ({duration_ms:.0f}ms): '{transcript}'")
    return TranscribeResponse(text=transcript, duration_ms=duration_ms)


@router.post("/api/voice/synthesize")
async def synthesize(request: SynthesizeRequest):
    """Convert text to speech using local TTS. Returns WAV audio."""
    logger.info(f"POST /api/voice/synthesize — text length={len(request.text or '')}")

    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")

    try:
        audio_bytes, duration_ms = await tts_service.synthesize(request.text.strip())
    except Exception as exc:
        logger.error(f"TTS synthesis failed: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {exc}")

    if not audio_bytes:
        logger.warning("TTS returned empty audio bytes.")
        raise HTTPException(status_code=503, detail="TTS generation returned empty audio.")

    logger.info(f"TTS done ({duration_ms:.0f}ms) — {len(audio_bytes)} bytes")
    return Response(
        content=audio_bytes,
        media_type="audio/wav",
        headers={
            "X-TTS-Latency-Ms": str(int(duration_ms)),
            "X-TTS-Provider": tts_service.provider_name(),
        },
    )


class ConversationRequest(BaseModel):
    audio_base64: str
    audio_format: str = "webm"
    conversation_id: Optional[str] = None
    history: Optional[list] = []


class ConversationResponse(BaseModel):
    transcript: str
    answer: str
    audio_base64: str
    conversation_id: str
    routing_decision: str
    similarity_score: Optional[float]
    cache_hit: bool
    rag_hit: bool
    llm_called: bool
    stt_latency_ms: float
    retrieval_latency_ms: Optional[float]
    llm_latency_ms: Optional[float]
    tts_latency_ms: float
    total_latency_ms: float


@router.post("/api/voice/conversation", response_model=ConversationResponse)
async def voice_conversation(request: ConversationRequest):
    """
    Full voice pipeline:
    audio (base64) → STT → route (cache/RAG/LLM) → TTS → audio (base64)
    """
    t_total = time.perf_counter()
    conversation_id = request.conversation_id or str(uuid.uuid4())
    rid = conversation_id[:8]

    logger.info(f"[{rid}] POST /api/voice/conversation — format={request.audio_format}")

    # ── Decode audio ─────────────────────────────────────────
    try:
        audio_bytes = base64.b64decode(request.audio_base64)
    except Exception as exc:
        logger.error(f"[{rid}] base64 decode failed: {exc}")
        raise HTTPException(status_code=400, detail=f"Invalid base64 audio: {exc}")

    logger.info(f"[{rid}] Audio decoded — {len(audio_bytes)} bytes")

    # ── STT ──────────────────────────────────────────────────
    if not stt_service.is_available():
        raise HTTPException(status_code=503, detail="STT unavailable. Install faster-whisper.")

    try:
        transcript, stt_latency_ms = stt_service.transcribe(audio_bytes, request.audio_format)
    except Exception as exc:
        logger.error(f"[{rid}] STT failed: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"STT transcription failed: {exc}")

    if not transcript or len(transcript.strip()) < 2:
        logger.warning(f"[{rid}] STT returned empty/too-short transcript: '{transcript}'")
        raise HTTPException(status_code=400, detail="Could not transcribe audio. Please speak clearly and try again.")

    logger.info(f"[{rid}] STT ({stt_latency_ms:.0f}ms): '{transcript}'")

    # ── Routing (Cache → RAG → LLM) ─────────────────────────
    try:
        history = [Message(role=m["role"], content=m["content"]) for m in (request.history or [])]
        answer, debug = await route_query(
            query=transcript,
            history=history,
            request_id=rid,
        )
        debug.stt_latency_ms = stt_latency_ms
    except Exception as exc:
        logger.error(f"[{rid}] route_query failed: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Query routing failed: {exc}")

    logger.info(
        f"[{rid}] Routed — decision={debug.routing_decision.value} "
        f"llm={debug.llm_called} cache={debug.cache_hit} sim={debug.similarity_score}"
    )

    # ── TTS ──────────────────────────────────────────────────
    try:
        audio_bytes_out, tts_latency_ms = await tts_service.synthesize(answer)
        debug.tts_latency_ms = tts_latency_ms
    except Exception as exc:
        logger.error(f"[{rid}] TTS failed: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        # TTS failure is non-fatal — return text with empty audio
        audio_bytes_out = b""
        tts_latency_ms = 0.0
        debug.tts_latency_ms = 0.0
        logger.warning(f"[{rid}] Returning text-only response (TTS unavailable).")

    total_latency_ms = (time.perf_counter() - t_total) * 1000
    debug.total_latency_ms = total_latency_ms

    logger.info(f"[{rid}] Complete — total={total_latency_ms:.0f}ms tts={tts_latency_ms:.0f}ms")

    # ── Analytics (best-effort) ──────────────────────────────
    try:
        analytics_service.record_query(
            cache_hit=debug.cache_hit,
            rag_hit=debug.rag_hit,
            llm_called=debug.llm_called,
            total_latency_ms=total_latency_ms,
            rag_latency_ms=debug.retrieval_latency_ms or 0.0,
            llm_latency_ms=debug.llm_latency_ms or 0.0,
            tts_latency_ms=tts_latency_ms,
            stt_latency_ms=stt_latency_ms,
        )
    except Exception as exc:
        logger.warning(f"[{rid}] Analytics record failed (non-fatal): {exc}")

    audio_b64 = base64.b64encode(audio_bytes_out).decode() if audio_bytes_out else ""

    return ConversationResponse(
        transcript=transcript,
        answer=answer,
        audio_base64=audio_b64,
        conversation_id=conversation_id,
        routing_decision=debug.routing_decision.value,
        similarity_score=debug.similarity_score,
        cache_hit=debug.cache_hit,
        rag_hit=debug.rag_hit,
        llm_called=debug.llm_called,
        stt_latency_ms=stt_latency_ms,
        retrieval_latency_ms=debug.retrieval_latency_ms,
        llm_latency_ms=debug.llm_latency_ms,
        tts_latency_ms=tts_latency_ms,
        total_latency_ms=total_latency_ms,
    )
