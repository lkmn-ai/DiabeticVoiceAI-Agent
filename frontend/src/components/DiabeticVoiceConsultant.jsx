import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Square, Volume2, VolumeX } from 'lucide-react';
import { sendTextChat, sendVoiceConversation, synthesizeText } from '../services/api';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

const CONV_ID = `floating_conv_${Date.now()}`;

export function DiabeticVoiceConsultant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello — I am DiabeticVoice, a lifestyle guide for diabetes and fatty liver. Ask what to eat in the morning, afternoon, or at dinner, or about insulin spikes, protein, and carbs. I do not change medicines.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [isRoutineFlow, setIsRoutineFlow] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    try {
      return localStorage.getItem('diabeticvoice-speak') !== 'off';
    } catch {
      return true;
    }
  });
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const voiceEnabledRef = useRef(voiceEnabled);
  const utteranceRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, loadingStatus]);

  useEffect(() => {
    if (!window.speechSynthesis) return;
    const loadVoices = () => {
      // Filter primarily English voices
      const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en'));
      setAvailableVoices(voices);
      
      // Auto-select preferred voice if not set
      if (!selectedVoiceURI && voices.length > 0) {
        const pref = voices.find(v => 
          v.name.includes('Samantha') || 
          v.name.includes('Karen') ||
          v.name.includes('Victoria') ||
          v.name.includes('Google US English')
        );
        setSelectedVoiceURI(pref ? pref.voiceURI : voices[0].voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [selectedVoiceURI]);

  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true);
      if (e.detail?.type === 'routine') {
        setIsRoutineFlow(true);
        const routineMsg = "I can sketch a day of eating. Are you asking about breakfast, afternoon, or dinner — and do you already take insulin or tablets that can cause lows?";
        setMessages(prev => {
          // Prevent duplicate messages if clicked multiple times
          if (prev.length > 0 && prev[prev.length - 1].content === routineMsg) return prev;
          return [...prev, { role: 'assistant', content: routineMsg }];
        });
        playTTSRef.current(routineMsg);
      }
    };
    
    window.addEventListener('open-diabetes-chat', handleOpenChat);
    return () => window.removeEventListener('open-diabetes-chat', handleOpenChat);
  }, []);

  // Handle dynamic loading steps
  useEffect(() => {
    let interval;
    if (isLoading) {
      const steps = [
        "Checking meal and glucose guidance...",
        "Searching the knowledge base...",
        "Scoring retrieval confidence...",
        "Routing cache, RAG, or Groq...",
        "Preparing a cautious educational answer..."
      ];
      let i = 0;
      setLoadingStatus(steps[0]);
      interval = setInterval(() => {
        i++;
        if (i < steps.length) {
          setLoadingStatus(steps[i]);
        }
      }, 1500);
    } else {
      setLoadingStatus('');
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle body class for pushing content
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => document.body.classList.remove('sidebar-open');
  }, [isOpen]);


  const handleSendText = async (textToSend = inputText) => {
    if (!textToSend.trim() && !inputText.trim()) return;
    
    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setInputText('');
    setIsLoading(true);
    
    // Inject hidden prompt for routine generation if needed
    let backendPayload = textToSend;
    if (isRoutineFlow) {
      backendPayload += "\n\n(Educational only: if appropriate, outline breakfast, afternoon, and dinner with protein, fiber, and carb portions, plus a short walk. Do not diagnose, dose insulin, or tell the user to stop medicine.)";
      setIsRoutineFlow(false); // Reset flow
    }
    
    try {
      const response = await sendTextChat(backendPayload, CONV_ID, messages);
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.answer || 'I am sorry, I could not generate a response.',
          metadata: response.debug,
          events: response.events
        }]);
        setIsLoading(false);
        if (response.answer) playTTSRef.current(response.answer);
      }, 500);
      
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  // Voice logic
  const handleVoiceData = async (audioBlob, format) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result.split(',')[1];
        
        let payloadMessages = [...messages];
        if (isRoutineFlow) {
          payloadMessages.push({ role: 'system', content: 'The user is describing their day, meals, or diabetes context. Offer practical breakfast, afternoon, and dinner ideas with protein, fiber, and carbs. Do not diagnose, dose insulin, or advise stopping medicine.' });
          setIsRoutineFlow(false);
        }
        
        const response = await sendVoiceConversation(base64Audio, format, CONV_ID, payloadMessages);
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            { role: 'user', content: response.transcript || '(voice input)' },
            {
              role: 'assistant',
              content: response.answer || 'I am sorry, I could not generate a response.',
              metadata: response.debug,
              events: response.events
            }
          ]);
          setIsLoading(false);
          if (response.answer) playTTSRef.current(response.answer);
        }, 500);
      };
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Voice error: ${err.message}` }]);
      setIsLoading(false);
    }
  };

  const { isRecording, startRecording, stopRecording, error: micError } = useVoiceRecorder({ onData: handleVoiceData });
  
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const audioRef = useRef(new Audio());
  const playTTSRef = useRef(() => {});

  const stopTTS = useCallback(() => {
    utteranceRef.current = null;
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingTTS(false);
  }, []);

  const playTTS = useCallback((text) => {
    if (!voiceEnabledRef.current || !text) return;
    if (!window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    const voices = window.speechSynthesis.getVoices();
    let targetVoice = selectedVoiceURI
      ? voices.find(v => v.voiceURI === selectedVoiceURI)
      : null;
    if (!targetVoice) {
      targetVoice = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Victoria') ||
        v.name.includes('Google US English')
      );
    }
    if (targetVoice) utterance.voice = targetVoice;

    setIsPlayingTTS(true);
    window.speechSynthesis.speak(utterance);
  }, [selectedVoiceURI]);

  playTTSRef.current = playTTS;

  const toggleVoice = () => {
    setVoiceEnabled(prev => {
      const next = !prev;
      voiceEnabledRef.current = next;
      try {
        localStorage.setItem('diabeticvoice-speak', next ? 'on' : 'off');
      } catch {
        /* ignore private-mode storage failures */
      }
      if (!next) stopTTS();
      return next;
    });
  };

  useEffect(() => () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--sage)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 9999,
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Open DiabeticVoice AI"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      )}

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: '0',
          right: '0',
          bottom: '0',
          width: '420px',
          height: '100vh',
          maxHeight: 'none',
          background: '#111',
          borderRadius: '0',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          borderLeft: '1px solid rgba(0,0,0,0.05)',
          fontFamily: 'inherit'
        }}>
          <div style={{
            background: 'var(--charcoal)',
            color: 'var(--cream)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>DiabeticVoice AI</h3>
              <button
                onClick={() => { stopTTS(); setIsOpen(false); }}
                aria-label="Close chat"
                style={{ background: 'none', border: 'none', color: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={toggleVoice}
                type="button"
                title={voiceEnabled ? 'Turn off spoken answers' : 'Turn on spoken answers'}
                aria-pressed={voiceEnabled}
                aria-label={voiceEnabled ? 'Turn off spoken answers' : 'Turn on spoken answers'}
                style={{
                  background: voiceEnabled ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: 'var(--cream)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '999px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                {voiceEnabled ? 'Voice on' : 'Voice off'}
              </button>

              {voiceEnabled && availableVoices.length > 0 && (
                <select
                  value={selectedVoiceURI}
                  onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'var(--cream)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    padding: '2px 4px',
                    outline: 'none',
                    maxWidth: '160px',
                  }}
                  title="Select Voice"
                >
                  {availableVoices.map(v => (
                    <option key={v.voiceURI} value={v.voiceURI} style={{ color: '#000' }}>
                      {v.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {isPlayingTTS && (
            <button
              type="button"
              onClick={stopTTS}
              aria-label="Stop reading the answer"
              style={{
                width: '100%',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                background: '#3A2A22',
                color: '#fff',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <Square size={12} fill="currentColor" />
              Stop reading
            </button>
          )}

          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}>
                <div style={{
                  background: m.role === 'user' ? '#8C6239' : '#2A2A2A',
                  color: '#fff',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  borderBottomRightRadius: m.role === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: m.role === 'assistant' ? '4px' : '12px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {m.content}
                </div>
                
                {m.events && m.events.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                    {m.events.map((evt, idx) => <div key={idx}>{evt}</div>)}
                  </div>
                )}
                
                {m.role === 'assistant' && m.metadata && (
                  <details style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
                    <summary style={{ cursor: 'pointer' }}>How was this answered?</summary>
                    <div style={{ padding: '8px', background: '#f5f5f5', borderRadius: '4px', marginTop: '4px' }}>
                      {m.metadata.routing_decision && <div>Route: {m.metadata.routing_decision}</div>}
                      {m.metadata.similarity_score != null && <div>Similarity: {m.metadata.similarity_score.toFixed(3)}</div>}
                      {m.metadata.llm_called !== undefined && <div>LLM called: {m.metadata.llm_called ? 'Yes' : 'No'}</div>}
                      {m.metadata.total_latency_ms != null && <div>Latency: {Math.round(m.metadata.total_latency_ms)}ms</div>}
                    </div>
                  </details>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%', fontSize: '13px', color: '#ccc' }}>
                <div style={{ background: '#1A1A1A', color: '#ccc', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1.5s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                  {loadingStatus || 'Consulting...'}
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#5C4033', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about a meal, a spike, or fatty liver..."
              style={{
                flex: 1,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(0,0,0,0.2)',
                color: '#fff',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                resize: 'none',
                minHeight: '40px',
                maxHeight: '120px',
                fontFamily: 'inherit',
                outline: 'none'
              }}
              rows={1}
            />
            


            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                background: isRecording ? '#e74c3c' : 'rgba(255,255,255,0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title={isRecording ? "Stop recording" : "Record voice"}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isRecording ? (
                  <rect x="6" y="6" width="12" height="12" />
                ) : (
                  <>
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </>
                )}
              </svg>
            </button>

            <button
              onClick={() => handleSendText()}
              disabled={!inputText.trim()}
              style={{
                background: 'var(--sage)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() ? 'pointer' : 'default',
                opacity: inputText.trim() ? 1 : 0.5,
                flexShrink: 0
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
