"""
KB Ingestion Script
Loads diabetes_kb.json and populates ChromaDB with embeddings.
    cd backend
    python scripts/ingest_kb.py
"""
import sys
import json
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.config import settings
from app.services.rag_service import rag_service


def ingest_kb(kb_path: str = None):
    if kb_path is None:
        kb_path = str(Path(__file__).parent.parent / "data" / "diabetes_kb.json")

    print("=" * 60)
    print("  DiabeticVoice AI — Knowledge Base Ingestion")
    print("=" * 60)
    print(f"  KB Path       : {kb_path}")
    print(f"  Embedding     : {settings.embedding_model}")
    print(f"  ChromaDB path : {settings.get_chroma_path()}")
    print("=" * 60)

    with open(kb_path, "r") as f:
        kb_entries = json.load(f)

    print(f"\nLoaded {len(kb_entries)} KB entries.")
    print("Initializing RAG service and embedding model...")

    t0 = time.perf_counter()

    documents = []
    metadatas = []
    ids = []

    for entry in kb_entries:
        doc_text = f"Q: {entry['question']}\nA: {entry['answer']}"
        documents.append(doc_text)
        metadatas.append({
            "id": entry["id"],
            "question": entry["question"],
            "category": entry.get("category", "general"),
            "subcategory": entry.get("subcategory", ""),
            "source": entry.get("source", "diabetes_kb"),
        })
        ids.append(entry["id"])

    print(f"Embedding and ingesting {len(documents)} documents...")
    print("This may take a minute on first run (model download + embedding)...")

    rag_service.add_documents(
        documents=documents,
        metadatas=metadatas,
        ids=ids,
    )

    elapsed = time.perf_counter() - t0
    count = rag_service.collection_count()

    print(f"\n✓ Ingestion complete in {elapsed:.1f}s")
    print(f"✓ ChromaDB collection now has {count} documents.")
    print("\nTest a quick search:")

    results, sim, latency = rag_service.search("What is RICE for a sprained ankle?", top_k=3)
    for i, r in enumerate(results):
        print(f"  [{i+1}] sim={r['similarity']:.3f} | {r['document'][:80]}...")

    print("\n✓ Knowledge base is ready. You can now start the backend.")


if __name__ == "__main__":
    kb_path = sys.argv[1] if len(sys.argv) > 1 else None
    ingest_kb(kb_path)
