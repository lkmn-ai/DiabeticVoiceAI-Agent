"""Pydantic models for chat interactions."""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class RoutingDecision(str, Enum):
    CACHE = "cache"
    RAG = "rag"
    LLM = "llm"


class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
    history: Optional[List[Message]] = []


class DebugInfo(BaseModel):
    routing_decision: RoutingDecision
    similarity_score: Optional[float] = None
    cache_hit: bool = False
    rag_hit: bool = False
    llm_called: bool = False
    stt_latency_ms: Optional[float] = None
    embedding_latency_ms: Optional[float] = None
    retrieval_latency_ms: Optional[float] = None
    llm_latency_ms: Optional[float] = None
    tts_latency_ms: Optional[float] = None
    total_latency_ms: Optional[float] = None
    sources: Optional[List[str]] = None
    context_used: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    conversation_id: str
    debug: DebugInfo
