# Build a Local Voice-Based GenAI Skincare Consultant

I want you to build a complete, production-style local GenAI application called **VoiceSkin AI**.

The application is a voice-based skincare consultant. A user should be able to open a web frontend, press a microphone button, speak naturally, and have a conversation with an AI skincare assistant.

The entire application must run locally on my laptop.

## CRITICAL CONSTRAINT

Do NOT use any paid API.

Do NOT require API keys.

Do NOT use OpenAI API, Gemini API, Groq API, Anthropic API, ElevenLabs API, Azure Speech API, AWS services, or any other paid/cloud API.

Use open-source/local models wherever possible.

The application should work offline after the required models/dependencies have been downloaded.

---

# 1. Core Product

Build:

**VoiceSkin AI — Local Voice + RAG + LLM Skincare Consultant**

The user experience should be:

```text
User speaks
    ↓
Speech-to-Text
    ↓
Query Processing
    ↓
Semantic Cache
    ↓
RAG Retrieval
    ↓
Confidence Router
    ↓
Either:
    ├── KB/RAG response
    └── Local LLM response
    ↓
Text-to-Speech
    ↓
User hears the response
```

The goal is specifically to demonstrate that frequently asked questions can be answered from the local knowledge base instead of invoking the LLM.

This should reduce:

* LLM inference time
* computational cost
* unnecessary model calls
* latency

Since everything is local, "cost reduction" should be demonstrated conceptually through **LLM call reduction and inference avoidance**, rather than claiming cloud API savings.

---

# 2. Technology Stack

Use this stack unless there is a strong technical reason to change something.

## Frontend

* React
* Vite
* Tailwind CSS
* WebSocket for real-time communication where appropriate
* Browser MediaRecorder / Web Audio APIs for microphone input

## Backend

* Python
* FastAPI
* WebSocket support
* Pydantic
* Uvicorn

## Speech-to-Text

Use:

**faster-whisper**

Prefer a small/medium local Whisper model depending on available hardware.

Make the model configurable through `.env`:

```text
WHISPER_MODEL=small
```

If the laptop is CPU-only, provide a lightweight option.

The system should convert the user's speech into text locally.

---

# 3. Local LLM

Use **Ollama** for local LLM inference.

The LLM model must be configurable.

For example:

```text
OLLAMA_MODEL=qwen3:8b
```

If the selected model is unavailable, document how to switch to another locally available Ollama model.

Do not hardcode the model throughout the codebase.

Create a clean LLM abstraction:

```python
LLMProvider
```

so that another local model can be plugged in later.

The LLM must never require an API key.

---

# 4. Text-to-Speech

Use a completely local TTS engine.

Prefer:

**Piper TTS**

The TTS layer should accept text and generate an audio file or audio stream.

Create an abstraction:

```python
TTSProvider
```

so that the TTS implementation can later be replaced.

The frontend should automatically play the generated response.

---

# 5. RAG

Implement a proper RAG pipeline.

Use:

* Sentence Transformers for embeddings
* ChromaDB as the vector database
* local embedding model

Do NOT use a hosted embedding API.

Use a configurable embedding model, for example:

```text
sentence-transformers/all-MiniLM-L6-v2
```

Create a knowledge base containing skincare-related Q&A.

Example:

```json
{
  "question": "What is a good routine for oily skin?",
  "answer": "A simple routine for oily skin can include a gentle cleanser, lightweight moisturizer and sunscreen in the morning. At night, use a gentle cleanser followed by appropriate treatment and moisturizer.",
  "category": "skin_type",
  "source": "skincare_kb"
}
```

---

# 6. Knowledge Base

Create an initial local knowledge base with approximately 100 realistic skincare Q&A entries.

Organize the knowledge into categories:

```text
skin_types
    oily
    dry
    combination
    normal
    sensitive

concerns
    acne
    blackheads
    whiteheads
    dryness
    dark_spots
    hyperpigmentation
    irritation
    uneven_texture

ingredients
    niacinamide
    salicylic_acid
    hyaluronic_acid
    vitamin_c
    retinoids
    benzoyl_peroxide
    ceramides

routines
    morning
    night
    beginner
    acne_prone
    sensitive_skin

general
    sunscreen
    cleansing
    moisturizer
    patch_testing
    product_layering
```

Do not make dangerous medical claims.

The application must clearly state that it is an educational skincare assistant and not a dermatologist.

For potentially serious symptoms, the assistant should recommend consulting a qualified dermatologist.

---

# 7. Semantic Retrieval

When the user asks a question:

1. Convert the query into an embedding.
2. Search ChromaDB.
3. Retrieve top-k relevant documents.
4. Calculate similarity/confidence.
5. Route the request based on the similarity score.

Make these configurable:

```text
TOP_K=5
RAG_THRESHOLD=0.82
CACHE_THRESHOLD=0.90
```

Do not blindly assume these values are optimal.

Make the thresholds configurable and easy to tune.

---

# 8. Semantic Cache

Implement a semantic cache.

The purpose is to avoid processing repeated or semantically equivalent questions unnecessarily.

Example:

User asks:

> "What skincare routine is good for oily skin?"

Later:

> "I have oily skin. What routine should I follow?"

These should be recognized as semantically similar.

Architecture:

```text
User Query
    ↓
Embedding
    ↓
Semantic Cache
    ↓
Cache similarity
    ↓
High similarity?
    ├── YES → Return cached answer
    └── NO → Continue to RAG
```

For the first implementation, use a local solution.

You may use:

* ChromaDB
* SQLite
* local JSON/database

Do not introduce Redis unless there is a clear reason.

Keep the initial project easy to run on a laptop.

---

# 9. Intelligent Routing

This is one of the most important parts of the project.

Implement:

```text
User Query
     ↓
Semantic Cache
     ↓
RAG Retrieval
     ↓
Confidence Router
     ↓
--------------------------------
|                              |
HIGH CONFIDENCE            LOW CONFIDENCE
|                              |
↓                              ↓
RAG/KB Answer                  Local LLM
|                              |
--------------------------------
               ↓
              TTS
```

Example:

```text
Query:
"What does niacinamide do?"

Similarity:
0.94

Decision:
RAG

LLM:
NOT CALLED
```

Another:

```text
Query:
"I have oily skin, occasional acne and I currently use three products. Can you help me build a routine around them?"

Similarity:
0.53

Decision:
LLM

Reason:
Requires contextual reasoning/personalization.
```

The system should record the routing decision.

---

# 10. RAG Response Behavior

If the retrieved knowledge is sufficiently relevant:

DO NOT call the LLM.

Return the answer directly from the knowledge base.

However, make the response conversational enough for a voice assistant.

For example:

Knowledge base:

```text
A gentle cleanser is generally suitable for oily skin.
```

Voice response:

```text
For oily skin, a gentle cleanser is generally a good starting point.
```

Do not unnecessarily rewrite the answer using the LLM.

The entire point is to avoid the LLM call.

---

# 11. LLM Behavior

When RAG confidence is low, invoke the local Ollama model.

Provide the LLM with:

```text
System instructions
+
User query
+
Relevant RAG context
+
Conversation history
```

The LLM should:

* answer naturally
* avoid hallucinating
* prioritize retrieved skincare information
* clearly distinguish general information from personalized suggestions
* recommend professional medical advice when appropriate

Do not let the LLM invent product claims.

---

# 12. Conversation Memory

Implement short-term conversation memory.

Example:

User:

> "I have oily skin."

Assistant:

> "Got it. What are you mainly concerned about?"

User:

> "Acne."

The system should understand that "acne" refers to the user's previously mentioned oily skin context.

Store conversation history locally.

Limit the amount of history sent to the LLM to avoid unnecessary context.

---

# 13. Voice Interaction

The frontend should have a large microphone button.

Example:

```text
          🎙️
       Speak to AI
```

When clicked:

```text
Listening...
```

After the user stops speaking:

```text
Processing...
```

Then:

```text
AI is responding...
```

Then play the TTS response.

Also display:

```text
You:
"I have oily skin. What should I use?"

VoiceSkin:
"For oily skin..."
```

---

# 14. Frontend UI

Create a polished modern UI.

Use React + Tailwind.

Main screen:

```text
--------------------------------------------------
                VOICESKIN AI
        Your Local AI Skincare Consultant

                    🤖

        "How can I help with your
             skincare today?"

--------------------------------------------------

You

"I have oily skin and acne."

--------------------------------------------------

VoiceSkin AI

"For oily and acne-prone skin, you can
start with a gentle cleanser..."

🔊 Playing...

--------------------------------------------------

        🎙️ SPEAK TO AI

--------------------------------------------------
```

Add a developer/analytics panel that can be toggled.

Display:

```text
STT latency
Retrieval latency
Routing decision
Similarity score
Cache hit/miss
RAG hit/miss
LLM called: YES/NO
LLM inference time
TTS latency
Total response latency
```

This is important because the project should demonstrate measurable optimization.

---

# 15. Analytics

Create a simple local analytics system.

Track:

```text
total_queries
cache_hits
cache_misses
rag_hits
rag_misses
llm_calls
average_latency
average_rag_latency
average_llm_latency
average_tts_latency
```

Calculate:

```text
LLM Avoidance Rate =
queries_not_sent_to_LLM / total_queries
```

Display this in the frontend.

Example:

```text
Total Queries:          50
RAG Answers:            31
Semantic Cache Hits:    9
LLM Calls:              10

LLM Avoidance Rate:     80%
Average Latency:        1.8s
```

Do not fake these numbers. Calculate them from actual application activity.

---

# 16. Architecture

Organize the backend cleanly.

Use a structure similar to:

```text
voiceskin/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   │
│   │   ├── api/
│   │   │   ├── chat.py
│   │   │   ├── voice.py
│   │   │   └── health.py
│   │   │
│   │   ├── services/
│   │   │   ├── stt_service.py
│   │   │   ├── tts_service.py
│   │   │   ├── llm_service.py
│   │   │   ├── rag_service.py
│   │   │   ├── cache_service.py
│   │   │   ├── router_service.py
│   │   │   └── analytics_service.py
│   │   │
│   │   ├── models/
│   │   │   ├── chat.py
│   │   │   └── voice.py
│   │   │
│   │   └── utils/
│   │
│   ├── data/
│   │   └── skincare_kb.json
│   │
│   ├── scripts/
│   │   └── ingest_kb.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── models/
│
├── storage/
│   ├── chroma/
│   └── cache/
│
├── .env.example
├── README.md
└── docker-compose.yml
```

You can improve the structure if necessary, but maintain clear separation between:

```text
STT
RAG
Cache
Routing
LLM
TTS
API
Frontend
Analytics
```

---

# 17. API Design

Create endpoints such as:

```text
GET  /health

POST /api/chat

POST /api/voice/transcribe

POST /api/voice/synthesize

POST /api/voice/conversation

GET  /api/analytics

POST /api/rag/search
```

Prefer a WebSocket endpoint for the complete voice conversation if it makes the implementation cleaner.

---

# 18. Safety

This is a skincare educational assistant.

It must NOT:

* diagnose diseases
* claim certainty about skin conditions
* prescribe medication
* recommend prescription drugs
* replace a dermatologist

For concerning symptoms, it should say that professional medical evaluation may be appropriate.

Include this behavior in the system prompt.

---

# 19. Configuration

Create:

```text
.env.example
```

with settings such as:

```text
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b

WHISPER_MODEL=small

EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

RAG_THRESHOLD=0.82
CACHE_THRESHOLD=0.90
TOP_K=5

BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
```

No API keys should be required.

---

# 20. Installation Experience

The project should be easy to run.

README must contain exact commands for:

1. Installing Python dependencies
2. Installing Node dependencies
3. Installing Ollama
4. Pulling the required Ollama model
5. Installing/configuring Piper
6. Downloading the Whisper model
7. Creating the ChromaDB collection
8. Ingesting the skincare KB
9. Starting FastAPI
10. Starting React
11. Opening the application

Provide separate instructions for:

```text
macOS
Windows
Linux
```

If some steps differ, clearly document them.

---

# 21. Hardware Awareness

The application will initially run on a personal laptop.

Do not assume an NVIDIA GPU.

Prefer CPU-compatible defaults.

Allow model size to be configured.

If GPU acceleration is available, document how to enable it, but the project must remain functional on CPU.

Do not introduce unnecessarily large models.

---

# 22. Error Handling

Handle gracefully:

* Ollama not running
* LLM model missing
* Whisper model unavailable
* TTS unavailable
* microphone permission denied
* empty audio
* invalid audio format
* ChromaDB unavailable
* no RAG results
* LLM timeout
* TTS failure

The frontend should show useful user-facing errors rather than stack traces.

---

# 23. Logging

Add structured logging.

For every request, log:

```text
request_id
timestamp
query
STT duration
embedding duration
cache result
RAG similarity
routing decision
LLM called
LLM duration
TTS duration
total duration
```

Do not log sensitive user information unnecessarily.

---

# 24. Testing

Create tests for:

### RAG

* exact FAQ match
* paraphrased FAQ
* unrelated query
* low-confidence query

### Cache

* exact repeated query
* semantically similar query
* cache miss

### Router

Test:

```text
high similarity → RAG
low similarity → LLM
cache hit → cached response
```

### API

Test:

```text
/health
/chat
/voice/transcribe
/voice/synthesize
```

---

# 25. Important Development Strategy

Do NOT attempt to build everything at once.

Implement in this order:

## Phase 1

Build:

```text
FastAPI
+
Ollama
+
basic chat
```

Verify that local LLM conversation works.

## Phase 2

Add:

```text
Skincare KB
+
Embeddings
+
ChromaDB
+
RAG retrieval
```

## Phase 3

Add:

```text
Semantic Cache
+
Confidence Router
```

## Phase 4

Add:

```text
Faster-Whisper STT
```

## Phase 5

Add:

```text
Piper TTS
```

## Phase 6

Build:

```text
React frontend
+
microphone
+
audio playback
```

## Phase 7

Add:

```text
Analytics
+
latency metrics
+
RAG/LLM routing visualization
```

## Phase 8

Testing and polish.

At every phase, make sure the existing application continues working.

---

# 26. Future Extensibility

Architect the system so that later I can add:

```text
Skin image analysis
        ↓
Vision model
        ↓
Skin concern detection
```

and:

```text
User profile
        ↓
Personalized skincare routine
```

and:

```text
Product database
        ↓
Ingredient analysis
        ↓
Product recommendation
```

and eventually:

```text
Supervisor Agent
      │
      ├── Skin Analysis Agent
      ├── Skincare RAG Agent
      ├── Product Agent
      └── Routine Agent
```

Do NOT implement these future features now.

Just make the architecture extensible enough to add them later.

---

# 27. Final Deliverables

I want you to actually create the complete project, not just describe it.

Deliver:

1. Complete backend
2. Complete frontend
3. Local RAG pipeline
4. Local semantic cache
5. Local LLM integration through Ollama
6. Local STT
7. Local TTS
8. Skincare knowledge base
9. KB ingestion script
10. Analytics
11. Tests
12. `.env.example`
13. README
14. Startup instructions
15. Proper error handling
16. Clean project structure

Before finishing:

* run the backend
* run the frontend
* test the health endpoint
* test a normal text query
* test a RAG query
* test a low-confidence LLM query
* test repeated semantic queries
* test STT
* test TTS
* verify that the frontend can play the generated audio
* verify that the application does not require any paid API key

If something cannot be executed in your environment because a local dependency/model is unavailable, implement the code correctly and clearly document the exact command I need to run locally.

Do not replace a missing local component with a paid API.

---

# 28. Most Important Demonstration

The final application must clearly demonstrate this scenario:

### Query A

User:

> "What is a good routine for oily skin?"

System:

```text
STT
 ↓
Semantic Cache MISS
 ↓
RAG
 ↓
Similarity = HIGH
 ↓
KB RESPONSE
 ↓
TTS
```

LLM should NOT be called.

### Query B

User:

> "I have oily skin, acne around my chin, and I currently use a cleanser and niacinamide. Can you suggest how I should structure my routine?"

System:

```text
STT
 ↓
Semantic Cache MISS
 ↓
RAG
 ↓
Similarity = LOW/MEDIUM
 ↓
Local Ollama LLM
 ↓
Relevant RAG context + conversation history
 ↓
Response
 ↓
TTS
```

### Query C

User:

> "What is a good routine for oily skin?"

again.

System should demonstrate:

```text
STT
 ↓
Semantic Cache HIT
 ↓
Cached response
 ↓
TTS

LLM CALL = NO
RAG SEARCH = optionally skipped
```

This three-query flow should be easy to demonstrate during a project presentation.

---

# Goal

The final result should feel like a real **local voice AI product**, not a basic chatbot.

The main engineering concept is:

**"Use retrieval and semantic caching to answer known questions locally, and intelligently route only novel/context-heavy queries to the local LLM."**

Prioritize:

* clean architecture
* local execution
* low latency
* modularity
* measurable LLM avoidance
* good voice UX
* RAG quality
* extensibility

Start by inspecting the environment and available hardware, then create the project incrementally according to the phases above.
