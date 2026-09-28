"""
DiabeticVoice AI — Application Configuration
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field

if "RAG_THRESHOLD" in os.environ:
    del os.environ["RAG_THRESHOLD"]


class Settings(BaseSettings):
    # ── Groq LLM ──────────────────────────────────────────────
    groq_api_key: str = Field("add here", env="GROQ_API_KEY")
    groq_model: str = Field("openai/gpt-oss-20b", env="GROQ_MODEL")
    groq_base_url: str = Field(
        "https://api.groq.com/openai/v1", env="GROQ_BASE_URL"
    )

    # ── Optional local Ollama fallback ────────────────────────
    ollama_base_url: str = Field("http://localhost:11434", env="OLLAMA_BASE_URL")
    ollama_model: str = Field("llama3", env="OLLAMA_MODEL")
    llm_provider: str = Field("groq", env="LLM_PROVIDER")  # groq | ollama

    # ── Whisper STT ───────────────────────────────────────────
    whisper_model: str = Field("small", env="WHISPER_MODEL")
    whisper_device: str = Field("cpu", env="WHISPER_DEVICE")
    whisper_compute_type: str = Field("int8", env="WHISPER_COMPUTE_TYPE")

    # ── Embeddings ────────────────────────────────────────────
    embedding_model: str = Field(
        "sentence-transformers/all-MiniLM-L6-v2", env="EMBEDDING_MODEL"
    )

    # ── RAG / Cache Thresholds ────────────────────────────────
    top_k: int = Field(5, env="TOP_K")
    rag_threshold: float = Field(0.80, env="RAG_THRESHOLD")
    cache_threshold: float = Field(0.90, env="CACHE_THRESHOLD")

    # ── Server ────────────────────────────────────────────────
    backend_host: str = Field("127.0.0.1", env="BACKEND_HOST")
    backend_port: int = Field(8000, env="BACKEND_PORT")

    # ── Storage ───────────────────────────────────────────────
    chroma_persist_dir: str = Field("../storage/chroma", env="CHROMA_PERSIST_DIR")
    cache_persist_dir: str = Field("../storage/cache", env="CACHE_PERSIST_DIR")

    # ── TTS ───────────────────────────────────────────────────
    piper_binary: str = Field("piper", env="PIPER_BINARY")
    piper_model_path: str = Field(
        "../models/en_US-lessac-medium.onnx", env="PIPER_MODEL_PATH"
    )
    tts_output_dir: str = Field("../storage/tts", env="TTS_OUTPUT_DIR")

    # ── Logging ───────────────────────────────────────────────
    log_level: str = Field("INFO", env="LOG_LEVEL")

    class Config:
        env_file = ".env"
        case_sensitive = False

    def get_chroma_path(self) -> Path:
        p = Path(self.chroma_persist_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p

    def get_cache_path(self) -> Path:
        p = Path(self.cache_persist_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p

    def get_tts_output_path(self) -> Path:
        p = Path(self.tts_output_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p


settings = Settings()
