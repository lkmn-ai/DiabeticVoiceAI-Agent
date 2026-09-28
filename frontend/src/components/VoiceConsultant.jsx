import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Loader2,
  Send,
  ChevronDown,
  ChevronUp,
  X,
  MessageCircle,
} from 'lucide-react';

import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import {
  sendTextChat,
  sendVoiceConversation,
  synthesizeText,
} from '../services/api';


/* ============================================================
   VOICE STATES
   ============================================================ */

const STATE_LABELS = {
  idle: null,
  listening: 'Listening…',
  processing: 'Understanding…',
  speaking: 'Preparing response…',
};


/* ============================================================
   LIFESTYLE SUGGESTIONS
   ============================================================ */

const SUGGESTIONS = [
  'What should I eat for breakfast to avoid an insulin spike?',
  'What is a good afternoon snack for diabetes?',
  'How should dinner look if I have fatty liver?',
  'What is an insulin spike and how do I flatten it?',
  'How do protein and carbs affect blood sugar?',
];


/* ============================================================
   AUDIO HELPERS
   ============================================================ */

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result.split(',')[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


async function playAudioBase64(b64) {
  if (!b64) return;

  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([bytes], {
      type: 'audio/wav',
    });

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.play().catch(resolve);
    });
  } catch (e) {
    console.error('Audio playback error:', e);
  }
}


async function speakText(text) {
  try {
    const blob = await synthesizeText(text);

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        resolve();
      };

      audio.play().catch(resolve);
    });
  } catch (e) {
    console.error('TTS error:', e);
  }
}


/* ============================================================
   TIME
   ============================================================ */

function formatTime() {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}


/* ============================================================
   DEVELOPER / AI INSIGHTS PANEL
   ============================================================ */

function DevPanel({ entry }) {
  if (!entry?.debug) return null;

  const { debug } = entry;
  const routing = debug.routing_decision;

  const routingClass =
    routing === 'cache'
      ? 'cache'
      : routing === 'rag'
        ? 'rag'
        : 'llm';

  return (
    <div
      className="dev-panel"
      style={{ marginTop: 16 }}
    >
      <div className="dev-row">
        <span className="dev-key">route</span>

        <span className={`dev-val ${routingClass}`}>
          {routing?.toUpperCase() ?? '—'}
        </span>
      </div>


      {debug.similarity_score != null && (
        <div className="dev-row">
          <span className="dev-key">rag match</span>

          <span className="dev-val">
            {debug.similarity_score.toFixed(3)}
          </span>
        </div>
      )}


      <div className="dev-row">
        <span className="dev-key">cache</span>

        <span
          className={`dev-val ${
            debug.cache_hit ? 'hit' : 'miss'
          }`}
        >
          {debug.cache_hit ? 'HIT' : 'MISS'}
        </span>
      </div>


      <div className="dev-row">
        <span className="dev-key">llm called</span>

        <span
          className={`dev-val ${
            debug.llm_called ? 'yes' : 'no'
          }`}
        >
          {debug.llm_called ? 'YES' : 'NO'}
        </span>
      </div>


      {debug.total_latency_ms != null && (
        <div className="dev-row">
          <span className="dev-key">latency</span>

          <span className="dev-val">
            {Math.round(debug.total_latency_ms)}ms
          </span>
        </div>
      )}
    </div>
  );
}


/* ============================================================
   MAIN ORTHOVOICE COMPONENT
   ============================================================ */

export function VoiceConsultant({ conversationId }) {

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState([]);

  const [micState, setMicState] = useState('idle');

  const [textInput, setTextInput] = useState('');

  const [error, setError] = useState(null);

  const [showDev, setShowDev] = useState(false);

  const transcriptRef = useRef(null);


  /* ==========================================================
     AUTO SCROLL
     ========================================================== */

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop =
        transcriptRef.current.scrollHeight;
    }
  }, [messages]);


  /* ==========================================================
     COPY EVENT
     ========================================================== */

  useEffect(() => {
    const handleCopy = () => {
      setIsOpen(true);

      const text = window
        .getSelection()
        .toString()
        .trim();

      if (text) {
        setTextInput((prev) =>
          prev
            ? `${prev} ${text}`
            : text
        );
      }
    };

    document.addEventListener(
      'copy',
      handleCopy
    );

    return () => {
      document.removeEventListener(
        'copy',
        handleCopy
      );
    };
  }, []);


  /* ==========================================================
     CONVERSATION HISTORY
     ========================================================== */

  const getHistory = useCallback(() => {
    return messages
      .filter((m) => m.content)
      .slice(-8)
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));
  }, [messages]);


  /* ==========================================================
     ADD MESSAGE
     ========================================================== */

  const addMsg = useCallback(
    (role, content, debug = null) => {

      const id =
        `m_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}`;

      setMessages((prev) => [
        ...prev,
        {
          id,
          role,
          content,
          debug,
          time: formatTime(),
        },
      ]);

      return id;
    },
    []
  );


  /* ==========================================================
     UPDATE MESSAGE
     ========================================================== */

  const updateMsg = useCallback(
    (id, updates) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, ...updates }
            : m
        )
      );
    },
    []
  );


  /* ==========================================================
     TEXT CHAT
     ========================================================== */

  const handleTextSubmit = useCallback(
    async (q) => {

      const query = (
        q || textInput
      ).trim();

      if (
        !query ||
        micState !== 'idle'
      ) {
        return;
      }

      setTextInput('');
      setError(null);

      addMsg('user', query);

      setMicState('processing');

      try {

        const res =
          await sendTextChat(
            query,
            conversationId,
            getHistory()
          );


        addMsg(
          'assistant',
          res.answer,
          res.debug
        );


        setMicState('speaking');

        await speakText(
          res.answer
        );

        setMicState('idle');

      } catch (e) {

        setError(e.message);

        setMicState('idle');
      }
    },
    [
      textInput,
      micState,
      conversationId,
      getHistory,
      addMsg,
    ]
  );


  /* ==========================================================
     VOICE CHAT
     ========================================================== */

  const handleVoiceData = useCallback(
    async (blob, format) => {

      setMicState('processing');

      setError(null);

      try {

        const b64 =
          await blobToBase64(blob);


        const res =
          await sendVoiceConversation(
            b64,
            format,
            conversationId,
            getHistory()
          );


        /* -------------------------------
           User transcript
           -------------------------------- */

        if (res.transcript) {
          addMsg(
            'user',
            res.transcript
          );
        }


        /* -------------------------------
           AI response
           -------------------------------- */

        addMsg(
          'assistant',
          res.answer,
          {
            routing_decision:
              res.routing_decision,

            similarity_score:
              res.similarity_score,

            cache_hit:
              res.cache_hit,

            rag_hit:
              res.rag_hit,

            llm_called:
              res.llm_called,

            total_latency_ms:
              res.total_latency_ms,
          }
        );


        setMicState('speaking');


        await playAudioBase64(
          res.audio_base64
        );


        setMicState('idle');

      } catch (e) {

        setError(e.message);

        setMicState('idle');
      }
    },
    [
      conversationId,
      getHistory,
      addMsg,
    ]
  );


  /* ==========================================================
     VOICE RECORDER
     ========================================================== */

  const {
    startRecording,
    stopRecording,
    error: recorderError,
  } = useVoiceRecorder({
    onData: handleVoiceData,
  });


  /* ==========================================================
     MICROPHONE BUTTON
     ========================================================== */

  const handleMicClick = useCallback(
    () => {

      if (micState === 'idle') {

        setMicState('listening');

        startRecording();

      } else if (
        micState === 'listening'
      ) {

        stopRecording();
      }
    },
    [
      micState,
      startRecording,
      stopRecording,
    ]
  );


  /* ==========================================================
     UI STATE
     ========================================================== */

  const stateLabel =
    STATE_LABELS[micState];

  const displayError =
    error || recorderError;


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="floating-widget-container">


      {/* ======================================================
          ORTHOVOICE PANEL
          ====================================================== */}

      {isOpen && (

        <div className="floating-panel">

          <div className="consultant-inner">


            {/* =================================================
                CLOSE BUTTON
                ================================================= */}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '8px',
                marginRight: '-12px',
                marginTop: '-12px',
              }}
            >

              <button
                onClick={() =>
                  setIsOpen(false)
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color:
                    'rgba(247,244,239,0.5)',
                  cursor: 'pointer',
                  transition:
                    'color 0.2s',
                }}
                onMouseEnter={(e) =>
                  e.currentTarget.style.color =
                    'var(--cream)'
                }
                onMouseLeave={(e) =>
                  e.currentTarget.style.color =
                    'rgba(247,244,239,0.5)'
                }
                aria-label="Close DiabeticVoice AI"
              >
                <X size={20} />
              </button>

            </div>


            {/* =================================================
                HEADER
                ================================================= */}

            <div className="consultant-eyebrow">
              DIABETICVOICE AI
            </div>


            <h2 className="consultant-title">

              Speak with your
              <br />

              DiabeticVoice AI

            </h2>


            <p className="consultant-sub">

              Ask what to eat in the morning,
              afternoon, or at dinner.
              <br />

              Get practical guidance on
              insulin spikes, protein, carbs,
              and fatty liver.

            </p>


            {/* =================================================
                WAVEFORM
                ================================================= */}

            <div
              style={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 32,
                opacity:
                  micState === 'speaking'
                    ? 1
                    : 0,
                transition:
                  'opacity 0.4s ease',
              }}
            >

              <div className="waveform">

                {[...Array(7)].map(
                  (_, i) => (
                    <div
                      key={i}
                      className="waveform-bar"
                    />
                  )
                )}

              </div>

            </div>


            {/* =================================================
                MICROPHONE
                ================================================= */}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                marginTop: 12,
              }}
            >

              <div
                className={`mic-outer-ring ${micState}`}
              >

                <button
                  id="mic-button"
                  className={`mic-btn ${micState}`}
                  onClick={
                    handleMicClick
                  }
                  disabled={
                    micState ===
                    'processing'
                  }
                  aria-label={
                    micState === 'idle'
                      ? 'Start speaking'
                      : 'Stop recording'
                  }
                >

                  {micState ===
                  'processing' ? (

                    <Loader2
                      size={26}
                      strokeWidth={1.5}
                      className="animate-spin"
                    />

                  ) : micState ===
                    'listening' ? (

                    <MicOff
                      size={26}
                      strokeWidth={1.5}
                    />

                  ) : (

                    <Mic
                      size={26}
                      strokeWidth={1.5}
                    />

                  )}

                </button>

              </div>


              <div
                style={{
                  minHeight: 24,
                }}
              >

                {stateLabel ? (

                  <span
                    key={stateLabel}
                    className="state-label"
                  >
                    {stateLabel}
                  </span>

                ) : (

                  <span
                    className="body-sm"
                    style={{
                      color:
                        'rgba(247,244,239,0.35)',
                      letterSpacing:
                        '0.04em',
                      fontSize: 12,
                    }}
                  >
                    tap to speak
                  </span>

                )}

              </div>

            </div>


            {/* =================================================
                ORTHOPEDIC SUGGESTIONS
                ================================================= */}

            {messages.length === 0 && (

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 24,
                }}
              >

                {SUGGESTIONS.map(
                  (suggestion) => (

                    <button
                      key={suggestion}
                      className="chip"
                      onClick={() =>
                        handleTextSubmit(
                          suggestion
                        )
                      }
                    >
                      {suggestion}
                    </button>

                  )
                )}

              </div>

            )}


            {/* =================================================
                ERROR
                ================================================= */}

            {displayError && (

              <div
                className="error-bar"
                style={{
                  marginTop: 20,
                }}
              >
                {displayError}
              </div>

            )}


            {/* =================================================
                CONVERSATION
                ================================================= */}

            {messages.length > 0 && (

              <div
                ref={transcriptRef}
                className="transcript-wrap"
                style={{
                  marginTop: 40,
                }}
              >

                {messages.map(
                  (msg) => (

                    <div
                      key={msg.id}
                      className="transcript-entry"
                    >

                      {msg.role === 'user' ? (

                        <>
                          <div className="transcript-label-user">
                            You
                          </div>

                          <div className="transcript-text-user">
                            {msg.content}
                          </div>
                        </>

                      ) : (

                        <>
                          <div className="transcript-label-ai">
                            DiabeticVoice
                          </div>

                          <div className="transcript-text-ai">
                            {msg.content}
                          </div>

                          {showDev && (
                            <DevPanel
                              entry={msg}
                            />
                          )}

                        </>

                      )}

                    </div>

                  )
                )}

              </div>

            )}


            {/* =================================================
                TEXT INPUT
                ================================================= */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginTop: 32,
              }}
            >

              <input
                id="text-input"
                type="text"
                className="text-field-dark"
                placeholder="Ask about a meal, a spike, or fatty liver…"
                value={textInput}
                onChange={(e) =>
                  setTextInput(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === 'Enter' &&
                    !e.shiftKey
                  ) {
                    handleTextSubmit();
                  }

                }}
                disabled={
                  micState !== 'idle'
                }
              />


              <button
                id="send-button"
                onClick={() =>
                  handleTextSubmit()
                }
                disabled={
                  !textInput.trim() ||
                  micState !== 'idle'
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: textInput.trim()
                    ? 'var(--sage-light)'
                    : 'rgba(247,244,239,0.2)',
                  cursor: textInput.trim()
                    ? 'pointer'
                    : 'default',
                  padding: '8px 4px',
                  transition:
                    'color 0.18s',
                  flexShrink: 0,
                }}
                aria-label="Send message"
              >

                <Send
                  size={18}
                  strokeWidth={1.5}
                />

              </button>

            </div>


            {/* =================================================
                AI INSIGHTS
                ================================================= */}

            <div
              style={{
                marginTop: 28,
                display: 'flex',
                justifyContent: 'center',
              }}
            >

              <button
                className="dev-toggle"
                onClick={() =>
                  setShowDev(
                    (value) => !value
                  )
                }
              >

                {showDev ? (
                  <ChevronUp size={12} />
                ) : (
                  <ChevronDown size={12} />
                )}

                {showDev
                  ? 'Hide'
                  : 'Show'} AI Insights

              </button>

            </div>


            {/* =================================================
                MEDICAL DISCLAIMER
                ================================================= */}

            <p
              style={{
                marginTop: 20,
                fontSize: 11,
                color:
                  'rgba(247,244,239,0.2)',
                lineHeight: 1.6,
              }}
            >

              DiabeticVoice AI provides educational
              information only. It does not diagnose
              medical conditions or replace advice
              from a qualified healthcare professional.

            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          FLOATING OPEN BUTTON
          ====================================================== */}

      {!isOpen && (

        <button
          className="floating-toggle-btn"
          onClick={() =>
            setIsOpen(true)
          }
          aria-label="Open DiabeticVoice AI"
        >

          <MessageCircle size={28} />

        </button>

      )}

    </div>
  );
}