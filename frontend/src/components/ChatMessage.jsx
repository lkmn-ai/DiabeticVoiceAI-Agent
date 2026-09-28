/**
 * ConversationEntry — renders a single exchange as editorial typography
 * No chat bubbles. Clean text layout.
 */
import React from 'react';

function DebugBadge({ debug }) {
  if (!debug) return null;

  const routing = debug.routing_decision;
  const routingClass =
    routing === 'cache' ? 'cache'
    : routing === 'rag' ? 'rag'
    : 'llm';

  return (
    <div className="dev-panel" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--cream-border)' }}>
      <div className="dev-row">
        <span className="dev-key">route</span>
        <span className={`dev-val ${routingClass}`}>{routing?.toUpperCase() ?? '—'}</span>
      </div>
      {debug.similarity_score != null && (
        <div className="dev-row">
          <span className="dev-key">similarity</span>
          <span className="dev-val">{debug.similarity_score.toFixed(3)}</span>
        </div>
      )}
      <div className="dev-row">
        <span className="dev-key">cache</span>
        <span className={`dev-val ${debug.cache_hit ? 'hit' : 'miss'}`}>
          {debug.cache_hit ? 'HIT' : 'MISS'}
        </span>
      </div>
      <div className="dev-row">
        <span className="dev-key">rag</span>
        <span className={`dev-val ${debug.rag_hit ? 'hit' : 'miss'}`}>
          {debug.rag_hit ? 'HIT' : 'MISS'}
        </span>
      </div>
      <div className="dev-row">
        <span className="dev-key">llm</span>
        <span className={`dev-val ${debug.llm_called ? 'yes' : 'no'}`}>
          {debug.llm_called ? 'YES' : 'NO'}
        </span>
      </div>
      {debug.total_latency_ms != null && (
        <div className="dev-row">
          <span className="dev-key">latency</span>
          <span className="dev-val">{Math.round(debug.total_latency_ms)}ms</span>
        </div>
      )}
    </div>
  );
}

export function ChatMessage({ message, showDebug }) {
  const isUser = message.role === 'user';

  return (
    <div
      className="msg-enter"
      style={{
        paddingBottom: 24,
        borderBottom: '1px solid var(--cream-border)',
      }}
    >
      {/* Label */}
      <div
        className={`conv-label ${isUser ? 'conv-label-user' : 'conv-label-assistant'}`}
        style={{ marginBottom: 6 }}
      >
        {isUser ? 'You' : 'Skin'}
      </div>

      {/* Text */}
      <p className={isUser ? 'conv-user' : 'conv-assistant'}>
        {message.content}
      </p>

      {/* Timestamp */}
      {message.timestamp && (
        <div style={{ marginTop: 4 }}>
          <span className="type-body-sm" style={{ fontSize: 11 }}>
            {message.timestamp}
          </span>
        </div>
      )}

      {/* Debug info */}
      {showDebug && message.debug && <DebugBadge debug={message.debug} />}
    </div>
  );
}
