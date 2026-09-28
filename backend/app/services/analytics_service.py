"""
Analytics Service
Tracks and aggregates metrics across queries: cache hits, RAG hits, LLM calls, latencies.
All data is stored in-memory and persisted to a local JSON file.
"""
import json
import time
import threading
from pathlib import Path
from typing import Dict, Any, Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

_ANALYTICS_FILE = Path(settings.cache_persist_dir).parent / "analytics.json"


class AnalyticsService:
    def __init__(self):
        self._lock = threading.Lock()
        self._data: Dict[str, Any] = {
            "total_queries": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "rag_hits": 0,
            "rag_misses": 0,
            "llm_calls": 0,
            "llm_avoided": 0,
            "total_latency_ms": 0.0,
            "total_rag_latency_ms": 0.0,
            "total_llm_latency_ms": 0.0,
            "total_tts_latency_ms": 0.0,
            "total_stt_latency_ms": 0.0,
            "query_count_for_avg": 0,
        }
        self._load()

    def _load(self):
        try:
            _ANALYTICS_FILE.parent.mkdir(parents=True, exist_ok=True)
            if _ANALYTICS_FILE.exists():
                with open(_ANALYTICS_FILE, "r") as f:
                    saved = json.load(f)
                    self._data.update(saved)
        except Exception as e:
            logger.warning(f"Could not load analytics: {e}")

    def _save(self):
        try:
            with open(_ANALYTICS_FILE, "w") as f:
                json.dump(self._data, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save analytics: {e}")

    def record_query(
        self,
        *,
        cache_hit: bool = False,
        rag_hit: bool = False,
        llm_called: bool = False,
        total_latency_ms: float = 0.0,
        rag_latency_ms: float = 0.0,
        llm_latency_ms: float = 0.0,
        tts_latency_ms: float = 0.0,
        stt_latency_ms: float = 0.0,
    ):
        with self._lock:
            self._data["total_queries"] += 1
            self._data["query_count_for_avg"] += 1

            if cache_hit:
                self._data["cache_hits"] += 1
            else:
                self._data["cache_misses"] += 1

            if rag_hit:
                self._data["rag_hits"] += 1
            else:
                self._data["rag_misses"] += 1

            if llm_called:
                self._data["llm_calls"] += 1
            else:
                self._data["llm_avoided"] += 1

            self._data["total_latency_ms"] += total_latency_ms
            self._data["total_rag_latency_ms"] += rag_latency_ms
            self._data["total_llm_latency_ms"] += llm_latency_ms
            self._data["total_tts_latency_ms"] += tts_latency_ms
            self._data["total_stt_latency_ms"] += stt_latency_ms

            self._save()
            logger.debug(f"Analytics recorded: cache_hit={cache_hit}, rag_hit={rag_hit}, llm_called={llm_called}")

    def get_stats(self) -> Dict[str, Any]:
        with self._lock:
            d = self._data.copy()

        total = max(d["total_queries"], 1)
        q = max(d["query_count_for_avg"], 1)

        llm_avoidance_rate = (
            round((d["llm_avoided"] / total) * 100, 1) if total > 0 else 0.0
        )

        return {
            "total_queries": d["total_queries"],
            "cache_hits": d["cache_hits"],
            "cache_misses": d["cache_misses"],
            "rag_hits": d["rag_hits"],
            "rag_misses": d["rag_misses"],
            "llm_calls": d["llm_calls"],
            "llm_avoided": d["llm_avoided"],
            "llm_avoidance_rate_pct": llm_avoidance_rate,
            "avg_total_latency_ms": round(d["total_latency_ms"] / q, 1),
            "avg_rag_latency_ms": round(d["total_rag_latency_ms"] / q, 1),
            "avg_llm_latency_ms": round(
                d["total_llm_latency_ms"] / max(d["llm_calls"], 1), 1
            ),
            "avg_tts_latency_ms": round(d["total_tts_latency_ms"] / q, 1),
            "avg_stt_latency_ms": round(d["total_stt_latency_ms"] / q, 1),
        }

    def reset(self):
        with self._lock:
            self._data = {k: 0 if isinstance(v, int) else 0.0 for k, v in self._data.items()}
            self._save()


analytics_service = AnalyticsService()
