"""
DiabeticVoice AI — FastAPI Main Application
"""
import logging
import sys
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.api import health, chat, voice

# ── Logging Setup ──────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("diabeticvoice")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / Shutdown lifecycle."""
    logger.info("=" * 60)
    logger.info("  DiabeticVoice AI — Lifestyle diabetes guidance")
    logger.info("=" * 60)
    logger.info(f"  LLM Provider   : {settings.llm_provider}")
    logger.info(f"  LLM Model      : {settings.groq_model if settings.llm_provider != 'ollama' else settings.ollama_model}")
    logger.info(f"  Whisper Model  : {settings.whisper_model}")
    logger.info(f"  Embedding      : {settings.embedding_model}")
    logger.info(f"  RAG Threshold  : {settings.rag_threshold}")
    logger.info(f"  Cache Threshold: {settings.cache_threshold}")
    logger.info(f"  Top-K          : {settings.top_k}")
    logger.info("=" * 60)

    # Pre-warm services in background
    try:
        from app.services.rag_service import rag_service
        rag_service._ensure_initialized()
        logger.info("RAG service initialized.")
    except Exception as e:
        logger.warning(f"RAG service pre-warm failed: {e}")

    try:
        from app.services.cache_service import cache_service
        cache_service._ensure_initialized()
        logger.info("Cache service initialized.")
    except Exception as e:
        logger.warning(f"Cache service pre-warm failed: {e}")

    yield

    logger.info("DiabeticVoice AI shutting down...")


app = FastAPI(
    title="DiabeticVoice AI",
    description="Voice-based lifestyle guide for diabetes, meals, and fatty liver",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────
app.include_router(health.router)
app.include_router(chat.router)
app.include_router(voice.router)


# ── Global unhandled exception handler ────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    logger.error(
        f"Unhandled exception on {request.method} {request.url.path}\n"
        f"  Type   : {type(exc).__name__}\n"
        f"  Detail : {exc}\n"
        f"  Traceback:\n{tb}"
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": type(exc).__name__,
            "detail": str(exc),
            "path": str(request.url.path),
        },
    )


@app.get("/")
async def root():
    return {
        "name": "DiabeticVoice AI",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
