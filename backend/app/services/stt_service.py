"""
STT Service — Speech to Text
Uses faster-whisper for local, offline transcription.
Falls back gracefully if faster-whisper is not installed.
"""
import time
import logging
import tempfile
import os
from typing import Optional, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)


class TTSProvider:
    """Base TTS Provider interface."""
    async def synthesize(self, text: str) -> Tuple[bytes, float]:
        raise NotImplementedError


class STTService:
    def __init__(self):
        self._model = None
        self._initialized = False
        self._available = True

    def _ensure_initialized(self):
        if self._initialized:
            return
        try:
            from faster_whisper import WhisperModel
            from app.config import settings

            logger.info(f"Loading Whisper model: {settings.whisper_model}")
            self._model = WhisperModel(
                settings.whisper_model,
                device=settings.whisper_device,
                compute_type=settings.whisper_compute_type,
            )
            self._initialized = True
            self._available = True
            logger.info("Whisper STT ready.")
        except ImportError:
            logger.warning(
                "faster-whisper not installed. Install with: pip install faster-whisper"
            )
            self._available = False
        except Exception as e:
            logger.error(f"Whisper initialization failed: {e}")
            self._available = False

    def transcribe(self, audio_bytes: bytes, audio_format: str = "webm") -> Tuple[str, float]:
        """
        Transcribe audio bytes to text.
        Returns (transcript, duration_ms).
        """
        self._ensure_initialized()

        if not self._available or self._model is None:
            return "[STT unavailable — faster-whisper not installed]", 0.0

        t0 = time.perf_counter()
        try:
            # Write to temp file
            suffix = f".{audio_format}"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name

            try:
                segments, info = self._model.transcribe(
                    tmp_path,
                    beam_size=5,
                    language="en",
                )
                transcript = " ".join(seg.text for seg in segments).strip()
            finally:
                os.unlink(tmp_path)

            duration_ms = (time.perf_counter() - t0) * 1000
            logger.info(
                f"STT: '{transcript[:80]}' ({duration_ms:.0f}ms, lang={info.language})"
            )
            return transcript, duration_ms

        except Exception as e:
            logger.error(f"STT transcription error: {e}")
            duration_ms = (time.perf_counter() - t0) * 1000
            return "", duration_ms

    def is_available(self) -> bool:
        self._ensure_initialized()
        return self._available


stt_service = STTService()
