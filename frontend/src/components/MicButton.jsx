/**
 * MicButton — minimal circular microphone button
 * States: idle | listening | processing | speaking
 */
import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

const STATE_ICONS = {
  idle:       <Mic size={22} strokeWidth={1.5} />,
  listening:  <Mic size={22} strokeWidth={1.5} />,
  processing: <Loader2 size={20} strokeWidth={1.5} className="animate-spin" />,
  speaking:   <MicOff size={20} strokeWidth={1.5} />,
};

const STATE_LABELS = {
  idle:       null,
  listening:  'Listening…',
  processing: 'Understanding…',
  speaking:   'Preparing response…',
};

const RING_STATE = {
  idle:       'mic-ring-idle',
  listening:  'mic-ring-listening',
  processing: 'mic-ring-processing',
  speaking:   'mic-ring-speaking',
};

export function MicButton({ state = 'idle', onClick, disabled }) {
  const label = STATE_LABELS[state];
  const ringClass = RING_STATE[state] || 'mic-ring-idle';

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Waveform — only visible when speaking */}
      <div
        style={{
          height: 24,
          display: 'flex',
          alignItems: 'center',
          opacity: state === 'speaking' ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div className="waveform">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="waveform-bar" />
          ))}
        </div>
      </div>

      {/* Ring + Button */}
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer ring */}
        <div
          className={`mic-ring ${ringClass}`}
          style={{
            width: 88,
            height: 88,
            position: 'absolute',
          }}
        />
        {/* Inner button */}
        <button
          id="mic-button"
          className={`mic-btn ${state}`}
          onClick={onClick}
          disabled={disabled || state === 'processing'}
          aria-label={
            state === 'idle' ? 'Start listening'
            : state === 'listening' ? 'Stop recording'
            : state === 'processing' ? 'Processing…'
            : 'Speaking'
          }
        >
          {STATE_ICONS[state] || STATE_ICONS.idle}
        </button>
      </div>

      {/* State label */}
      <div style={{ height: 20, display: 'flex', alignItems: 'center' }}>
        {label ? (
          <span key={label} className="state-label">
            {label}
          </span>
        ) : (
          <span className="type-body-sm" style={{ letterSpacing: '0.04em' }}>
            tap to speak
          </span>
        )}
      </div>
    </div>
  );
}
