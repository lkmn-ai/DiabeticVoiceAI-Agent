import React, { useState } from 'react';
import { INGREDIENTS } from '../data/ingredients';

function IngredientModal({ ingredient, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(26, 26, 24, 0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: ingredient.color,
          border: '1px solid var(--cream-border)',
          borderRadius: 8,
          padding: '40px 36px',
          maxWidth: 560,
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: ingredient.accentColor, opacity: 0.5 }}
        >
          ✕
        </button>

        <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: ingredient.accentColor }}>
          {ingredient.tagline}
        </div>
        <h2 className="display-md" style={{ marginTop: 8 }}>{ingredient.name}</h2>
        <div className="body-sm" style={{ marginTop: 2 }}>{ingredient.aka}</div>

        <p className="body-md" style={{ marginTop: 20 }}>{ingredient.description}</p>

        <div style={{ marginTop: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Benefits</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {ingredient.benefits.map(b => (
              <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--charcoal-mid)' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: ingredient.accentColor, flexShrink: 0 }} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Best For</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ingredient.goodFor.map(g => (
              <span key={g} className="tag" style={{ background: ingredient.accentColor + '18', color: ingredient.accentColor, padding: '4px 12px' }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24, padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: 4 }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Usage Note</div>
          <p className="body-sm">{ingredient.avoid}</p>
        </div>

        <div className="body-xs" style={{ marginTop: 14 }}>
          Practical amount: {ingredient.concentration}
        </div>
      </div>
    </div>
  );
}

export function IngredientsPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ maxWidth: 560, marginBottom: 48 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Nutrition building blocks</div>
          <h1 className="display-md">Protein, fiber, carbs, and timing</h1>
          <p className="body-lg" style={{ marginTop: 16 }}>
            These are the pieces people use to steady glucose and support a fatty liver. Open a card for how it fits breakfast, afternoon, and dinner. They are not a personal diet prescription.
          </p>
        </div>

        {/* Grid */}
        <div className="ingredient-grid">
          {INGREDIENTS.map(ing => (
            <div
              key={ing.id}
              className="ingredient-card"
              style={{ background: ing.color }}
              onClick={() => setSelected(ing)}
            >
              <div className="ingredient-tagline" style={{ color: ing.accentColor }}>
                {ing.tagline}
              </div>
              <div className="ingredient-name">{ing.name}</div>
              <div className="ingredient-aka">{ing.aka}</div>
              <div className="ingredient-desc">{ing.description}</div>
              <div className="ingredient-pills">
                {ing.goodFor.map(g => (
                  <span key={g} className="tag" style={{ background: ing.accentColor + '18', color: ing.accentColor, fontSize: 10 }}>
                    {g}
                  </span>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 11, color: ing.accentColor, fontWeight: 500, letterSpacing: '0.06em' }}>
                Learn more →
              </div>
            </div>
          ))}
        </div>

        {/* Pairing guide */}
        <div style={{ marginTop: 72 }}>
          <div className="section-header">
            <div className="section-header-left">
              <div className="eyebrow section-header-eyebrow">Plate guide</div>
              <div className="display-md section-header-title">What usually goes together</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { title: '✓ Protein + fiber + a modest carb', note: 'The usual plate: vegetables and protein with a smaller share of rice, roti, or fruit. The carb is not eaten alone.', ok: true },
              { title: '✓ Vegetables first, then starch', note: 'Meal order often lowers the peak from the same dinner. A short walk afterward stacks on top.', ok: true },
              { title: '✓ Earlier dinner + regular sleep', note: 'Both support the fasting number and give the liver less late-night work.', ok: true },
              { title: '⚠ Juice, soda, or sweet chai alone', note: 'Liquid sugar is the fastest insulin spike and a common driver of liver fat. Whole fruit is the better default.', ok: false },
              { title: '⚠ Stopping insulin because meals improved', note: 'Remission is a clinician decision after labs. Stopping medicine on your own can be dangerous.', ok: false },
              { title: '⚠ Near-zero carbs on insulin', note: 'A sudden carb cut while doses stay the same can cause lows. Change food and medicine together with your care team.', ok: false },
            ].map(item => (
              <div
                key={item.title}
                style={{
                  padding: '20px',
                  borderRadius: 4,
                  background: item.ok ? 'var(--sage-bg)' : 'var(--amber-bg)',
                  border: `1px solid ${item.ok ? 'var(--sage-muted)' : '#D4B87A'}`,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: item.ok ? 'var(--sage-deep)' : 'var(--amber)', marginBottom: 8 }}>
                  {item.title}
                </div>
                <div className="body-sm">{item.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && <IngredientModal ingredient={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
