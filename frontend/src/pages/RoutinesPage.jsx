import React, { useState } from 'react';
import { ROUTINES } from '../data/ingredients';
import { getProductById } from '../data/products';
import { ProductImage } from '../components/ProductImage';

export function RoutinesPage({ onProductSelect }) {
  const [activeTab, setActiveTab] = useState('morning');
  const steps = ROUTINES[activeTab];

  return (
    <div style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'start', marginBottom: 60 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 10 }}>A day of eating</div>
            <h1 className="display-md">Morning, afternoon, and dinner</h1>
            <p className="body-lg" style={{ marginTop: 16 }}>
              Use the same shape all day: protein and vegetables, a modest carb, water instead of juice, and a short walk after the larger meals. Dinner earlier when you can.
            </p>
            <p className="body-md" style={{ marginTop: 12 }}>
              If you use insulin or tablets that can cause lows, keep meals regular and do not copy a fast from the internet.
            </p>
          </div>
          <div style={{ background: 'var(--cream-mid)', borderRadius: 4, padding: '28px 24px' }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>The aim</div>
            <div className="heading-sm" style={{ fontStyle: 'italic' }}>
              "Smaller spikes, less liver fat, and habits you can still be doing in six months."
            </div>
            <div className="body-sm" style={{ marginTop: 12 }}>
              Some people with type 2 diabetes improve enough to reduce medicine — that decision stays with the clinician who sees your labs.
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="routine-tabs">
          <button
            className={`routine-tab ${activeTab === 'morning' ? 'active' : ''}`}
            onClick={() => setActiveTab('morning')}
          >
            Morning
          </button>
          <button
            className={`routine-tab ${activeTab === 'afternoon' ? 'active' : ''}`}
            onClick={() => setActiveTab('afternoon')}
          >
            Afternoon
          </button>
          <button
            className={`routine-tab ${activeTab === 'night' ? 'active' : ''}`}
            onClick={() => setActiveTab('night')}
          >
            Dinner
          </button>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Steps list */}
          <div className="routine-steps">
            {steps.map(step => (
              <div key={step.step} className="routine-step">
                <div className="routine-step-num">{step.step}</div>
                <div>
                  <div className="routine-step-name">{step.name}</div>
                  <div className="routine-step-desc">{step.description}</div>
                  {step.duration && (
                    <div className="body-xs" style={{ marginTop: 4 }}>⏱ {step.duration}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended products */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 20 }}>Related topics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {steps.map(step => {
                const product = getProductById(step.productId);
                if (!product) return null;
                return (
                  <div
                    key={step.step}
                    onClick={() => onProductSelect?.(product)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 16px',
                      background: 'var(--warm-white)',
                      border: '1px solid var(--cream-border)',
                      borderRadius: 4,
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--cream-dark)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--cream-border)'}
                  >
                    <div style={{
                      width: 56,
                      height: 72,
                      borderRadius: 3,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--cream-mid)',
                    }}>
                      <ProductImage
                        product={product}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--charcoal-low)', marginBottom: 3 }}>
                        Step {step.step} · {step.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.2, fontWeight: 400 }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--charcoal-low)', marginTop: 2 }}>
                        {product.brand} · {product.recovery}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--charcoal-low)', flexShrink: 0 }}>→</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tips section */}
        <div style={{ marginTop: 72 }}>
          <div className="section-header">
            <div>
              <div className="eyebrow section-header-eyebrow">Pro Tips</div>
              <div className="display-md section-header-title">Make it stick</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { num: '01', title: 'Drinks first', body: 'Swap juice, soda, and sweetened tea for water and whole fruit. That single change helps glucose and fatty liver.' },
              { num: '02', title: 'Protein at breakfast', body: 'A morning of only bread, juice, or sweet chai is a common spike. Put eggs, curd, dal, or tofu on the plate.' },
              { num: '03', title: 'Walk after you eat', body: 'Ten to fifteen minutes soon after a meal lets muscle use glucose before it peaks.' },
              { num: '04', title: 'Dinner earlier and lighter', body: 'Half the plate vegetables, starch last, finished a few hours before bed.' },
              { num: '05', title: 'Watch the pattern', body: 'One high reading is information. Trends in fasting and after-meal numbers, plus A1C and liver enzymes, show whether habits are working.' },
              { num: '06', title: 'This is education', body: 'DiabeticVoice does not diagnose, dose insulin, or tell you to stop medicine. Type 1 diabetes is not reversed by diet.' },
            ].map(tip => (
              <div key={tip.num} style={{ padding: '24px 0', borderTop: '1px solid var(--cream-border)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 300, color: 'var(--sage)', marginBottom: 8 }}>
                  {tip.num}
                </div>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--charcoal)', marginBottom: 6 }}>{tip.title}</div>
                <div className="body-sm">{tip.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
