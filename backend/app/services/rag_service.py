"""
RAG Service
Manages ChromaDB vector store, embedding generation, and semantic retrieval.
Uses sentence-transformers locally — no API calls.
"""
import time
import logging
from typing import List, Tuple, Optional
from pathlib import Path

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

from app.config import settings

logger = logging.getLogger(__name__)

COLLECTION_NAME = "diabetes_kb"


class RAGService:
    def __init__(self):
        self._model: Optional[SentenceTransformer] = None
        self._client: Optional[chromadb.PersistentClient] = None
        self._collection = None
        self._initialized = False

    def _ensure_initialized(self):
        if self._initialized:
            return
        try:
            logger.info(f"Loading embedding model: {settings.embedding_model}")
            self._model = SentenceTransformer(settings.embedding_model)

            persist_dir = str(settings.get_chroma_path())
            logger.info(f"Connecting to ChromaDB at: {persist_dir}")
            self._client = chromadb.PersistentClient(
                path=persist_dir,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
            self._collection = self._client.get_or_create_collection(
                name=COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )
            self._initialized = True
            logger.info(
                f"RAG Service ready. Collection has {self._collection.count()} documents."
            )
        except Exception as e:
            logger.error(f"RAG Service initialization failed: {e}")
            raise

    def embed(self, text: str) -> List[float]:
        self._ensure_initialized()
        return self._model.encode(text, normalize_embeddings=True).tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        self._ensure_initialized()
        return self._model.encode(texts, normalize_embeddings=True).tolist()

    def add_documents(
        self,
        documents: List[str],
        metadatas: List[dict],
        ids: List[str],
    ):
        self._ensure_initialized()
        embeddings = self.embed_batch(documents)
        self._collection.upsert(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )
        logger.info(f"Added/updated {len(documents)} documents in ChromaDB.")

    def search(
        self, query: str, top_k: Optional[int] = None
    ) -> Tuple[List[dict], float, float]:
        """
        Returns (results, best_similarity, latency_ms).
        results: list of dicts with keys: document, metadata, similarity
        similarity is 1 - distance (cosine distance → similarity)
        """
        self._ensure_initialized()
        k = top_k or settings.top_k

        t0 = time.perf_counter()
        query_embedding = self.embed(query)
        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=min(k, self._collection.count() or 1),
            include=["documents", "metadatas", "distances"],
        )
        latency_ms = (time.perf_counter() - t0) * 1000

        docs = results["documents"][0] if results["documents"] else []
        metas = results["metadatas"][0] if results["metadatas"] else []
        distances = results["distances"][0] if results["distances"] else []

        items = []
        best_similarity = 0.0
        for doc, meta, dist in zip(docs, metas, distances):
            # ChromaDB cosine distance: 0=identical, 2=opposite
            # Convert to similarity: 1 - dist/2 (normalized cosine similarity)
            similarity = max(0.0, 1.0 - dist)
            best_similarity = max(best_similarity, similarity)
            items.append(
                {
                    "document": doc,
                    "metadata": meta,
                    "similarity": round(similarity, 4),
                }
            )

        logger.info(f"RAG search query='{query}', found={len(items)} results in {latency_ms:.1f}ms (best_sim={best_similarity:.2f})")
        return items, best_similarity, latency_ms

    def collection_count(self) -> int:
        self._ensure_initialized()
        return self._collection.count()

    def is_ready(self) -> bool:
        try:
            self._ensure_initialized()
            return True
        except Exception:
            return False


rag_service = RAGService()
