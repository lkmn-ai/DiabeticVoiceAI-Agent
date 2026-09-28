/**
 * AnalyticsPanel — minimal right-side developer panel
 */
import React from 'react';
import { X } from 'lucide-react';

function Metric({ label, value, note }) {
  return (
    <div className="analytics-row">
      <span className="analytics-key">{label}</span>
      <div style={{ textAlign: 'right' }}>
        <span className="analytics-val">{value ?? '—'}</span>
        {note && (
          <span style={{ fontSize: 10, color: 'var(--charcoal-low)', marginLeft: 4 }}>
            {note}
          </span>
        )}
      </div>
    </div>
  );
}

export function AnalyticsPanel({ analytics, health, onClose }) {
  const avoidPct = analytics?.llm_avoidance_rate_pct ?? 0;

  return (
    <div
      style={{
        background: 'var(--warm-white)',
        border: '1px solid var(--cream-border)',
        borderRadius: 12,
        padding: '20px 18px',
        height: 'fit-content',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span className="type-label">Session Analytics</span>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--charcoal-low)',
              padding: 2,
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* LLM avoidance highlight */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="type-body-sm">LLM Avoidance</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--sage)' }}>
            {avoidPct.toFixed(0)}%
          </span>
        </div>
        <div className="avoid-bar-bg">
          <div className="avoid-bar-fill" style={{ width: `${avoidPct}%` }} />
        </div>
      </div>

      {/* Metrics */}
      <div style={{ marginBottom: 16 }}>
        <Metric label="Total queries"    value={analytics?.total_queries} />
        <Metric label="Cache hits"       value={analytics?.cache_hits} />
        <Metric label="RAG hits"         value={analytics?.rag_hits} />
        <Metric label="LLM calls"        value={analytics?.llm_calls} />
        <Metric label="Avg latency"      value={analytics?.avg_total_latency_ms != null ? `${Math.round(analytics.avg_total_latency_ms)}ms` : null} />
        <Metric label="Avg RAG latency"  value={analytics?.avg_rag_latency_ms != null ? `${Math.round(analytics.avg_rag_latency_ms)}ms` : null} />
        <Metric label="Avg LLM latency"  value={analytics?.avg_llm_latency_ms != null ? `${Math.round(analytics.avg_llm_latency_ms)}ms` : null} />
      </div>

      {/* System */}
      {health && (
        <>
          <div className="divider" style={{ marginBottom: 14 }} />
          <div>
            <div style={{ marginBottom: 10 }}>
              <span className="type-label">System</span>
            </div>
            <Metric label="KB documents" value={health.kb_documents} />
            <Metric label="STT"          value={health.stt_available ? 'Active' : 'Unavailable'} />
            <Metric label="TTS"          value={health.tts_available ? 'Active' : 'Unavailable'} />
            <Metric label="LLM model"    value={health.ollama_model} />
            <Metric label="Embed model"  value={health.embedding_model?.split('/').pop()} />
          </div>
        </>
      )}
    </div>
  );
}
