/**
 * API service layer — communicates with DiabeticVoice AI backend
 */

const BASE_URL = '';  // Uses Vite proxy to http://localhost:8000

export async function sendTextChat(query, conversationId, history = []) {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      conversation_id: conversationId,
      history,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function sendVoiceConversation(audioBase64, audioFormat, conversationId, history = []) {
  const res = await fetch(`${BASE_URL}/api/voice/conversation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      audio_base64: audioBase64,
      audio_format: audioFormat,
      conversation_id: conversationId,
      history,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${BASE_URL}/api/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function getHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Backend not reachable');
  return res.json();
}

export async function synthesizeText(text) {
  const res = await fetch(`${BASE_URL}/api/voice/synthesize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'TTS failed');
  }
  return res.blob();
}
