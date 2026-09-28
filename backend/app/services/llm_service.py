"""
LLM Service — Groq by default, optional Ollama fallback.
"""
import time
import logging
import httpx
from typing import List, Optional
from app.config import settings
from app.models.chat import Message

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are DiabeticVoice AI, a lifestyle education assistant for people living with diabetes, prediabetes, or fatty liver.

IMPORTANT GUIDELINES:
- You are an EDUCATIONAL assistant, NOT a physician, endocrinologist, or dietitian.
- Do NOT diagnose diabetes, fatty liver, or complications.
- Do NOT prescribe, stop, or change insulin, tablets, or any other medicine.
- Do NOT give personal insulin doses, carb gram targets, or calorie prescriptions.
- Type 1 diabetes is not reversed by diet. Type 2 remission is possible for some people with clinician-guided weight loss and habits, and it is not guaranteed.
- Keep answers concise and conversational — they may be spoken aloud.
- Base answers on the provided diabetes lifestyle context when available.
- Suggest practical patterns: breakfast, afternoon, and dinner; protein; fiber; carb quality and portions; meal order; walking after meals; sleep; fewer sugary drinks for fatty liver.
- For red flags always advise urgent care: confusion or fainting from a low, chest pain, trouble breathing, vomiting with very high glucose, fast breathing or fruity breath, a hot spreading foot wound, sudden vision loss, yellow eyes, or vomiting blood.
- Do not invent guaranteed reversal claims or detox products.

You help people improve daily food and movement choices alongside their clinical care.
Always be calm, practical, and appropriately cautious."""


class LLMProvider:
    async def generate(
        self,
        query: str,
        context: str = "",
        history: Optional[List[Message]] = None,
    ) -> str:
        raise NotImplementedError

    async def is_available(self) -> bool:
        return False


def _build_messages(
    query: str,
    context: str = "",
    history: Optional[List[Message]] = None,
) -> list:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        for msg in history[-6:]:
            if msg.role in ("user", "assistant") and msg.content:
                messages.append({"role": msg.role, "content": msg.content})
    user_content = query
    if context:
        user_content = (
            f"Relevant diabetes lifestyle information:\n{context}\n\nUser question: {query}"
        )
    messages.append({"role": "user", "content": user_content})
    return messages


class GroqProvider(LLMProvider):
    def __init__(self):
        self.api_key = (settings.groq_api_key or "").strip()
        self.model = settings.groq_model
        self.base_url = settings.groq_base_url.rstrip("/")

    async def generate(
        self,
        query: str,
        context: str = "",
        history: Optional[List[Message]] = None,
    ) -> str:
        if not self.api_key:
            return (
                "Groq is not configured. Add GROQ_API_KEY to backend/.env and restart the server."
            )

        messages = _build_messages(query, context, history)
        try:
            logger.info(f"Groq generation started (model: {self.model})")
            t0 = time.perf_counter()
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": self.model,
                        "messages": messages,
                        "temperature": 0.5,
                        "max_tokens": 700,
                    },
                )
                if response.status_code == 401:
                    logger.error("Groq authentication failed")
                    return "Groq rejected the API key. Check GROQ_API_KEY in backend/.env."
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"].strip()
                logger.info(f"Groq generation completed in {(time.perf_counter() - t0):.2f}s")
                return content
        except httpx.HTTPStatusError as e:
            logger.error(f"Groq HTTP error: {e}")
            return "I encountered an error contacting Groq. Please try again in a moment."
        except Exception as e:
            logger.error(f"Groq generation error: {e}")
            return "I'm having trouble generating a response right now."

    async def is_available(self) -> bool:
        return bool(self.api_key)


class OllamaProvider(LLMProvider):
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model

    async def generate(
        self,
        query: str,
        context: str = "",
        history: Optional[List[Message]] = None,
    ) -> str:
        messages = _build_messages(query, context, history)
        try:
            logger.info(f"Ollama generation started (model: {self.model})")
            t0 = time.perf_counter()
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json={
                        "model": self.model,
                        "messages": messages,
                        "stream": False,
                        "options": {"temperature": 0.5, "num_predict": 512},
                    },
                )
                response.raise_for_status()
                data = response.json()
                content = data["message"]["content"].strip()
                logger.info(f"Ollama generation completed in {(time.perf_counter() - t0):.2f}s")
                return content
        except httpx.ConnectError:
            logger.error("Ollama not running")
            return "The local language model is not available. Start Ollama or set GROQ_API_KEY."
        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            return "I'm having trouble generating a response right now."

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                r = await client.get(f"{self.base_url}/api/tags")
                return r.status_code == 200
        except Exception:
            return False


class LLMService:
    def __init__(self):
        provider = (settings.llm_provider or "groq").lower()
        if provider == "ollama":
            self._provider: LLMProvider = OllamaProvider()
        else:
            self._provider = GroqProvider()
        self.provider_name = "ollama" if provider == "ollama" else "groq"

    def set_provider(self, provider: LLMProvider):
        self._provider = provider

    async def generate(
        self,
        query: str,
        context: str = "",
        history: Optional[List[Message]] = None,
    ) -> str:
        return await self._provider.generate(query, context, history)

    async def is_available(self) -> bool:
        return await self._provider.is_available()

    def model_label(self) -> str:
        if self.provider_name == "ollama":
            return settings.ollama_model
        return settings.groq_model


llm_service = LLMService()
