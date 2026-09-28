"""
Semantic Cache Service
Caches previous query→answer pairs.
When a new query is semantically similar to a cached query (similarity >= CACHE_THRESHOLD),
returns the cached answer without hitting RAG or LLM.
Uses ChromaDB as a persistent backend for the cache.
"""
import time
import uuid
import logging
from typing import Optional, Tuple, List

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

CACHE_COLLECTION = "semantic_cache"


class CacheService:
    def __init__(self):
        self._model: Optional[SentenceTransformer] = None
        self._client = None
        self._collection = None
        self._initialized = False

    def _ensure_initialized(self):
        if self._initialized:
            return
        try:
            # Reuse the same embedding model
            logger.info("Initializing CacheService...")
            self._model = SentenceTransformer(settings.embedding_model)
            persist_dir = str(settings.get_cache_path())
            self._client = chromadb.PersistentClient(
                path=persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
            self._collection = self._client.get_or_create_collection(
                name=CACHE_COLLECTION,
                metadata={"hnsw:space": "cosine"},
            )
            self._initialized = True
            logger.info(
                f"CacheService ready. Cache has {self._collection.count()} entries."
            )
        except Exception as e:
            logger.error(f"CacheService initialization failed: {e}")
            raise

    def _embed(self, text: str) -> List[float]:
        return self._model.encode(text, normalize_embeddings=True).tolist()

    def lookup(self, query: str) -> Tuple[Optional[str], float]:
        """
        Returns (cached_answer, similarity) if cache hit, else (None, 0.0).
        """
        self._ensure_initialized()
        if self._collection.count() == 0:
            return None, 0.0

        try:
            embedding = self._embed(query)
            results = self._collection.query(
                query_embeddings=[embedding],
                n_results=1,
                include=["documents", "metadatas", "distances"],
            )

            if not results["documents"] or not results["documents"][0]:
                return None, 0.0

            distance = results["distances"][0][0]
            similarity = max(0.0, 1.0 - distance)

            if similarity >= settings.cache_threshold:
                answer = results["metadatas"][0][0].get("answer", "")
                logger.info(
                    f"Cache HIT (similarity={similarity:.3f}): '{query[:50]}...'"
                )
                return answer, similarity

            logger.info(f"Cache MISS (best_sim={similarity:.3f} < {settings.cache_threshold}): '{query[:50]}...'")
            return None, similarity
        except Exception as e:
            logger.warning(f"Cache lookup error: {e}")
            return None, 0.0

    def store(self, query: str, answer: str):
        """Store a query-answer pair in the cache."""
        self._ensure_initialized()
        try:
            embedding = self._embed(query)
            entry_id = str(uuid.uuid4())
            self._collection.upsert(
                documents=[query],
                embeddings=[embedding],
                metadatas=[{"answer": answer, "query": query}],
                ids=[entry_id],
            )
            logger.info(f"Cached answer for: '{query[:60]}'")
        except Exception as e:
            logger.warning(f"Cache store error: {e}")

    def cache_size(self) -> int:
        self._ensure_initialized()
        return self._collection.count()

    def clear(self):
        self._ensure_initialized()
        self._client.delete_collection(CACHE_COLLECTION)
        self._collection = self._client.get_or_create_collection(
            name=CACHE_COLLECTION,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info("Cache cleared.")

    def is_ready(self) -> bool:
        try:
            self._ensure_initialized()
            return True
        except Exception:
            return False


cache_service = CacheService()
