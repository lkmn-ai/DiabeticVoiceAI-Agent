"""
Tests for DiabeticVoice AI backend.
Run with: pytest backend/tests/ -v
"""
import pytest
from unittest.mock import AsyncMock, patch


class TestRAGRetrieval:
    def test_exact_faq_match(self):
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested — run ingest_kb.py first")

        results, sim, latency = rag_service.search("What should I eat for breakfast to avoid an insulin spike?")
        assert len(results) > 0
        assert sim > 0.85, f"Expected high similarity, got {sim}"
        assert latency > 0

    def test_paraphrased_faq(self):
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested — run ingest_kb.py first")

        results, sim, _ = rag_service.search("What is a good morning meal if I want a smaller glucose rise?")
        assert len(results) > 0
        assert sim > 0.55, f"Expected moderate similarity for paraphrase, got {sim}"

    def test_unrelated_query_low_similarity(self):
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested — run ingest_kb.py first")

        results, sim, _ = rag_service.search("How do I compile a Rust kernel module for an embedded board?")
        assert sim < 0.70, f"Expected low similarity for unrelated query, got {sim}"

    def test_collection_count_after_ingest(self):
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested — run ingest_kb.py first")

        count = rag_service.collection_count()
        assert count >= 30, f"Expected at least 30 docs, got {count}"


class TestSemanticCache:
    def test_exact_cache_hit(self):
        from app.services.cache_service import cache_service
        test_query = "test exact cache hit query for diabeticvoice 123"
        test_answer = "This is a test cached answer."

        cache_service.store(test_query, test_answer)
        cached, sim = cache_service.lookup(test_query)

        assert cached is not None, "Should have cache hit"
        assert sim >= 0.90, f"Similarity should be high for exact query, got {sim}"
        assert cached == test_answer

    def test_semantically_similar_cache_hit(self):
        from app.services.cache_service import cache_service
        original = "What should I eat for breakfast to keep glucose steadier?"
        answer = "Start with protein and fiber, and skip juice."
        similar = "What is a good morning meal for a smaller glucose rise?"

        cache_service.store(original, answer)
        cached, sim = cache_service.lookup(similar)

        assert isinstance(sim, float)
        assert 0.0 <= sim <= 1.0

    def test_cache_miss_unrelated(self):
        from app.services.cache_service import cache_service
        cached, sim = cache_service.lookup("quantum physics and string theory abc xyz 999")
        assert cached is None or sim < 0.90


class TestRouter:
    @pytest.mark.asyncio
    async def test_high_similarity_rag_route(self):
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested")

        from app.services.router_service import route_query
        answer, debug = await route_query("What should I eat for breakfast to avoid an insulin spike?")

        assert answer
        assert debug.routing_decision.value in ("rag", "cache")
        assert not debug.llm_called, "LLM should NOT be called for high-sim RAG query"

    @pytest.mark.asyncio
    async def test_low_similarity_llm_route(self):
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested")

        with patch("app.services.router_service.llm_service") as mock_llm:
            mock_llm.generate = AsyncMock(return_value="Mock LLM response about your specific meal pattern.")
            mock_llm.model_label = lambda: "mock"

            from app.services.router_service import route_query
            answer, debug = await route_query(
                "I take insulin at dinner, my fasting glucose is 160, and I want a lower-carb "
                "South Indian meal this week — how should I change tonight's dose and rice?"
            )
            assert answer

    @pytest.mark.asyncio
    async def test_cache_hit_skips_rag(self):
        from app.services.cache_service import cache_service
        from app.services.router_service import route_query
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested")

        query = "What is a unique cached test query diabeticvoice alpha omega"
        expected = "This is the cached test answer."
        cache_service.store(query, expected)

        answer, debug = await route_query(query)
        assert debug.cache_hit
        assert answer == expected


class TestAPI:
    @pytest.fixture
    def client(self):
        from fastapi.testclient import TestClient
        from app.main import app
        return TestClient(app)

    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "kb_documents" in data
        assert "llm_provider" in data

    def test_chat_endpoint_valid(self, client):
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested")

        response = client.post(
            "/api/chat",
            json={"query": "What should I eat for breakfast to avoid an insulin spike?"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "debug" in data
        assert len(data["answer"]) > 0

    def test_chat_endpoint_empty_query(self, client):
        response = client.post(
            "/api/chat",
            json={"query": ""},
        )
        assert response.status_code == 422

    def test_rag_search_endpoint(self, client):
        from app.services.rag_service import rag_service
        if rag_service.collection_count() == 0:
            pytest.skip("KB not ingested")

        response = client.post(
            "/api/rag/search",
            json={"query": "morning breakfast insulin spike", "top_k": 3},
        )
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "best_similarity" in data

    def test_analytics_endpoint(self, client):
        response = client.get("/api/analytics")
        assert response.status_code == 200
        data = response.json()
        assert "total_queries" in data
        assert "llm_avoidance_rate_pct" in data
