"""
Router Service
Implements the confidence-based routing logic.

Flow:
  query → semantic cache → RAG retrieval → confidence check
       → HIGH confidence: return RAG answer (no LLM call)
       → LOW confidence: call Groq (or Ollama) with RAG context
"""
import time
import uuid
import logging
import traceback
from typing import List, Optional, Tuple

from app.config import settings
from app.models.chat import ChatRequest, ChatResponse, DebugInfo, RoutingDecision, Message
from app.services.cache_service import cache_service
from app.services.rag_service import rag_service
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


def _make_conversational(kb_answer: str, query: str) -> str:
    """
    Lightly reformats a KB answer to sound more natural for voice.
    Avoids calling the LLM — just adds a small prefix if needed.
    """
    answer = kb_answer.strip()
    if not answer.endswith((".","!","?")):
        answer += "."
    return answer


async def route_query(
    query: str,
    history: Optional[List[Message]] = None,
    request_id: Optional[str] = None,
) -> Tuple[str, DebugInfo]:
    """
    Core routing logic.
    Returns (answer, DebugInfo).
    """
    rid = request_id or str(uuid.uuid4())[:8]
    t_start = time.perf_counter()

    logger.info(f"[{rid}] route_query START — query='{query[:100]}' history_turns={len(history or [])}")

    debug = DebugInfo(
        routing_decision=RoutingDecision.LLM,
        cache_hit=False,
        rag_hit=False,
        llm_called=False,
    )

    # ── Step 1: Semantic Cache Lookup ────────────────────
    try:
        logger.debug(f"[{rid}] Checking semantic cache...")
        cached_answer, cache_similarity = cache_service.lookup(query)
    except Exception as exc:
        logger.warning(f"[{rid}] Cache lookup raised {type(exc).__name__}: {exc} — skipping cache")
        cached_answer, cache_similarity = None, 0.0

    if cached_answer:
        debug.cache_hit = True
        debug.similarity_score = cache_similarity
        debug.routing_decision = RoutingDecision.CACHE
        debug.total_latency_ms = (time.perf_counter() - t_start) * 1000
        logger.info(f"[{rid}] CACHE HIT (sim={cache_similarity:.3f}) — returning cached answer")
        return cached_answer, debug
    else:
        logger.debug(f"[{rid}] Cache MISS (sim={cache_similarity:.3f})")

    # ── Step 2: RAG Retrieval ───────────────────────────
    try:
        logger.debug(f"[{rid}] Running RAG search...")
        rag_results, best_similarity, retrieval_latency_ms = rag_service.search(query)
        debug.retrieval_latency_ms = retrieval_latency_ms
        debug.similarity_score = best_similarity
        logger.info(
            f"[{rid}] RAG retrieved {len(rag_results)} docs "
            f"best_sim={best_similarity:.3f} threshold={settings.rag_threshold} "
            f"latency={retrieval_latency_ms:.0f}ms"
        )
    except Exception as exc:
        logger.error(
            f"[{rid}] RAG search failed: {type(exc).__name__}: {exc}\n{traceback.format_exc()}"
        )
        rag_results, best_similarity, retrieval_latency_ms = [], 0.0, 0.0
        debug.retrieval_latency_ms = 0.0
        debug.similarity_score = 0.0

    # Build context string from top results
    context_parts = []
    sources = []
    for r in rag_results:
        context_parts.append(r["document"])
        meta = r.get("metadata", {})
        if meta.get("source"):
            sources.append(meta["source"])
    context = "\n\n".join(context_parts[:3])  # Top 3 results for context
    debug.context_used = context[:500] if context else None
    debug.sources = list(set(sources)) if sources else None

    # ── Step 3: Confidence Routing ────────────────────────
    if best_similarity >= settings.rag_threshold and rag_results:
        # HIGH CONFIDENCE: Use RAG answer directly, skip LLM
        best_doc = rag_results[0]["document"]
        # Extract answer from the document (format: "Q: ...\nA: ...")
        answer = best_doc
        if "\nA: " in best_doc:
            answer = best_doc.split("\nA: ", 1)[1].strip()
        elif "A: " in best_doc:
            answer = best_doc.split("A: ", 1)[1].strip()

        answer = _make_conversational(answer, query)
        debug.rag_hit = True
        debug.llm_called = False
        debug.routing_decision = RoutingDecision.RAG
        logger.info(f"[{rid}] Decision: RAG (sim={best_similarity:.3f} >= {settings.rag_threshold}) — LLM skipped")

        # Cache this answer for future similar queries (best-effort)
        try:
            cache_service.store(query, answer)
        except Exception as exc:
            logger.warning(f"[{rid}] Cache store failed (non-fatal): {exc}")
    else:
        # LOW CONFIDENCE: Invoke Local LLM
        logger.info(
            f"[{rid}] Decision: LLM (sim={best_similarity:.3f} < {settings.rag_threshold}) — "
            f"model={llm_service.model_label()} context_len={len(context)} history_turns={len(history or [])}"
        )
        t_llm = time.perf_counter()
        try:
            answer = await llm_service.generate(
                query=query,
                context=context,
                history=history,
            )
            llm_elapsed = (time.perf_counter() - t_llm) * 1000
            debug.llm_latency_ms = llm_elapsed
            logger.info(f"[{rid}] LLM returned {len(answer)} chars in {llm_elapsed:.0f}ms")
        except Exception as exc:
            llm_elapsed = (time.perf_counter() - t_llm) * 1000
            logger.error(
                f"[{rid}] LLM generate raised {type(exc).__name__}: {exc}\n{traceback.format_exc()}"
            )
            answer = (
                "I'm sorry, I ran into an issue generating a response. "
                "Please check GROQ_API_KEY in backend/.env, or that Ollama is running if you use the local fallback."
            )
            debug.llm_latency_ms = llm_elapsed

        debug.llm_called = True
        debug.rag_hit = False
        debug.routing_decision = RoutingDecision.LLM

        # Cache LLM answers too (best-effort)
        try:
            cache_service.store(query, answer)
        except Exception as exc:
            logger.warning(f"[{rid}] Cache store failed (non-fatal): {exc}")

    debug.total_latency_ms = (time.perf_counter() - t_start) * 1000
    logger.info(
        f"[{rid}] route_query DONE — route={debug.routing_decision.value} "
        f"total={debug.total_latency_ms:.0f}ms"
    )
    return answer, debug
