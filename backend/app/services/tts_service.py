"""
TTS Service — Text to Speech
Primary: Piper TTS (local binary, zero cloud API)
Fallback: pyttsx3 (cross-platform, no binary needed)
Further fallback: returns empty bytes with an error message

TTSProvider abstraction allows future backend swaps.
"""
import time
import logging
import subprocess
import tempfile
import os
import asyncio
from typing import Tuple, Optional
from pathlib import Path

from app.config import settings

logger = logging.getLogger(__name__)

TTS_OUTPUT_DIR = settings.get_tts_output_path()


class TTSProvider:
    """Abstract TTS provider interface."""
    async def synthesize(self, text: str) -> Tuple[bytes, float]:
        """Returns (audio_bytes, latency_ms). audio_bytes is WAV format."""
        raise NotImplementedError

    def is_available(self) -> bool:
        raise NotImplementedError


class PiperTTSProvider(TTSProvider):
    """Piper TTS — needs piper binary + .onnx voice model."""

    def __init__(self):
        self._binary = settings.piper_binary
        self._model = settings.piper_model_path
        self._checked: Optional[bool] = None

    def _check_available(self) -> bool:
        if self._checked is not None:
            return self._checked
        try:
            result = subprocess.run(
                [self._binary, "--help"],
                capture_output=True, timeout=5
            )
            model_exists = Path(self._model).exists()
            self._checked = model_exists
            if not model_exists:
                logger.warning(
                    f"Piper model not found at: {self._model}. "
                    "Download from: https://huggingface.co/rhasspy/piper-voices"
                )
        except (FileNotFoundError, subprocess.TimeoutExpired):
            logger.warning("Piper binary not found. Install Piper TTS.")
            self._checked = False
        return self._checked

    def is_available(self) -> bool:
        return self._check_available()

    async def synthesize(self, text: str) -> Tuple[bytes, float]:
        t0 = time.perf_counter()
        if not self.is_available():
            return b"", 0.0

        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                output_path = tmp.name

            proc = await asyncio.create_subprocess_exec(
                self._binary,
                "--model", self._model,
                "--output_file", output_path,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            _, stderr = await proc.communicate(input=text.encode())

            if proc.returncode != 0:
                logger.error(f"Piper error: {stderr.decode()}")
                return b"", 0.0

            with open(output_path, "rb") as f:
                audio_bytes = f.read()
            os.unlink(output_path)

            latency_ms = (time.perf_counter() - t0) * 1000
            logger.info(f"Piper TTS synthesis successful ({latency_ms:.0f}ms), {len(audio_bytes)} bytes generated")
            return audio_bytes, latency_ms
        except Exception as e:
            logger.error(f"Piper TTS error: {e}")
            return b"", (time.perf_counter() - t0) * 1000


class Pyttsx3TTSProvider(TTSProvider):
    """
    Fallback TTS using pyttsx3.
    Generates audio to a temp file and returns bytes.
    """

    def is_available(self) -> bool:
        try:
            import pyttsx3
            return True
        except ImportError:
            return False

    async def synthesize(self, text: str) -> Tuple[bytes, float]:
        t0 = time.perf_counter()
        try:
            import pyttsx3
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                output_path = tmp.name

            # pyttsx3 is synchronous; run in thread pool
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._sync_synthesize, text, output_path)

            if Path(output_path).exists() and Path(output_path).stat().st_size > 0:
                with open(output_path, "rb") as f:
                    audio_bytes = f.read()
                os.unlink(output_path)
                latency_ms = (time.perf_counter() - t0) * 1000
                logger.info(f"pyttsx3 TTS synthesis successful ({latency_ms:.0f}ms), {len(audio_bytes)} bytes generated")
                return audio_bytes, latency_ms
            return b"", (time.perf_counter() - t0) * 1000
        except Exception as e:
            logger.error(f"pyttsx3 TTS error: {e}")
            return b"", (time.perf_counter() - t0) * 1000

    def _sync_synthesize(self, text: str, output_path: str):
        import pyttsx3
        engine = pyttsx3.init()
        engine.setProperty("rate", 170)
        engine.setProperty("volume", 0.9)
        engine.save_to_file(text, output_path)
        engine.runAndWait()
        engine.stop()


class TTSService:
    def __init__(self):
        self._piper = PiperTTSProvider()
        self._fallback = Pyttsx3TTSProvider()
        self._provider: Optional[TTSProvider] = None

    def _get_provider(self) -> TTSProvider:
        if self._provider:
            return self._provider
        if self._piper.is_available():
            logger.info("Using Piper TTS")
            self._provider = self._piper
        elif self._fallback.is_available():
            logger.info("Using pyttsx3 TTS (fallback)")
            self._provider = self._fallback
        else:
            logger.warning("No TTS provider available.")
            self._provider = self._fallback
        return self._provider

    def set_provider(self, provider: TTSProvider):
        """Swap TTS provider at runtime."""
        self._provider = provider

    async def synthesize(self, text: str) -> Tuple[bytes, float]:
        provider = self._get_provider()
        return await provider.synthesize(text)

    def is_available(self) -> bool:
        return self._get_provider().is_available()

    def provider_name(self) -> str:
        p = self._get_provider()
        return type(p).__name__


tts_service = TTSService()
