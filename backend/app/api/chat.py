"""
Chat API endpoint.
POST /api/chat  — text-based query with full routing (cache→RAG→LLM).
GET  /api/analytics — return performance metrics.
POST /api/rag/search — direct RAG search (debugging/testing).
"""
import time
import uuid
import logging
import traceback
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional

from app.models.chat import ChatRequest, ChatResponse, Message, DebugInfo, RoutingDecision
from app.services.router_service import route_query
from app.services.analytics_service import analytics_service
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    conversation_id = request.conversation_id or str(uuid.uuid4())
    rid = conversation_id[:8]

    logger.info(f"[{rid}] POST /api/chat — query: '{request.query[:120]}'")

    try:
        answer, debug = await route_query(
            query=request.query,
            history=request.history or [],
            request_id=rid,
        )
    except Exception as exc:
        logger.error(
            f"[{rid}] route_query FAILED — {type(exc).__name__}: {exc}\n"
            + traceback.format_exc()
        )
        raise HTTPException(
            status_code=500,
            detail=f"Query routing failed: {type(exc).__name__}: {exc}",
        )

    logger.info(
        f"[{rid}] Done — route={debug.routing_decision.value} "
        f"llm={debug.llm_called} cache={debug.cache_hit} "
        f"latency={round(debug.total_latency_ms or 0)}ms"
    )

    # Record analytics (best-effort — don't fail the request if this errors)
    try:
        analytics_service.record_query(
            cache_hit=debug.cache_hit,
            rag_hit=debug.rag_hit,
            llm_called=debug.llm_called,
            total_latency_ms=debug.total_latency_ms or 0.0,
            rag_latency_ms=debug.retrieval_latency_ms or 0.0,
            llm_latency_ms=debug.llm_latency_ms or 0.0,
            tts_latency_ms=debug.tts_latency_ms or 0.0,
            stt_latency_ms=debug.stt_latency_ms or 0.0,
        )
    except Exception as exc:
        logger.warning(f"[{rid}] Analytics record failed (non-fatal): {exc}")

    return ChatResponse(
        answer=answer,
        conversation_id=conversation_id,
        debug=debug,
    )


@router.get("/api/analytics")
async def get_analytics():
    try:
        return analytics_service.get_stats()
    except Exception as exc:
        logger.error(f"Analytics fetch failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Analytics error: {exc}")


class RAGSearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5


@router.post("/api/rag/search")
async def rag_search(request: RAGSearchRequest):
    try:
        results, best_sim, latency_ms = rag_service.search(request.query, request.top_k)
        return {
            "query": request.query,
            "results": results,
            "best_similarity": best_sim,
            "latency_ms": latency_ms,
        }
    except Exception as exc:
        logger.error(f"RAG search failed: {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"RAG search failed: {exc}")
