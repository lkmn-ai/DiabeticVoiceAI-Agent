/**
 * useVoiceRecorder — custom hook for browser microphone recording
 * Uses MediaRecorder API with webm/opus or fallback formats.
 */
import { useState, useRef, useCallback } from 'react';

const SUPPORTED_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
];

function getSupportedMimeType() {
  for (const type of SUPPORTED_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export function useVoiceRecorder({ onData, silenceTimeout = 3000 }) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const streamRef = useRef(null);
  const silenceTimer = useRef(null);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks.current, {
          type: mimeType || 'audio/webm',
        });
        const format = mimeType.includes('ogg') ? 'ogg'
          : mimeType.includes('mp4') ? 'mp4'
          : 'webm';
        onData(blob, format);
        // Cleanup stream
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(250); // Collect data every 250ms
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access.'
          : `Microphone error: ${err.message}`
      );
    }
  }, [onData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
    }
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording, error };
}
