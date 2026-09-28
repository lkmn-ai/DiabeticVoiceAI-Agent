import React from 'react';
import { ArrowLeft, Star, Sun, Moon } from 'lucide-react';
import { ProductImage } from './ProductImage';
import { ProductCard } from './ProductCard';
import { getRelatedProducts } from '../data/products';

function StarFull({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="product-stars">
        {[1,2,3,4,5].map(i => (
          <Star key={i} size={13} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} strokeWidth={1.5} />
        ))}
      </div>
              <span className="body-sm">{rating} · Educational topic</span>
    </div>
  );
}

export function ProductDetail({ product, onBack, onProductSelect }) {
  const related = getRelatedProducts(product);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="container" style={{ paddingTop: 24, paddingBottom: 24 }}>
        <button
          className="btn-ghost"
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 0, fontSize: 13, color: 'var(--charcoal-low)' }}
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back to topics
        </button>
      </div>

      <div className="container" style={{ paddingBottom: 80 }}>
        <div className="product-detail-grid">
          {/* Left — Image */}
          <div>
            <div className="product-detail-image">
              <ProductImage product={product} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>

          {/* Right — Info */}
          <div>
            <div className="product-detail-brand">{product.brand}</div>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-price">{product.recovery || 'Educational topic'}</div>

            {/* Rating */}
            <div style={{ marginTop: 12 }}>
              <StarFull rating={product.rating} />
            </div>

            {/* Routine badge */}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {product.morning && (
                <span className="routine-badge morning">
                  <Sun size={12} /> Morning & day
                </span>
              )}
              {product.night && (
                <span className="routine-badge night">
                  <Moon size={12} /> Dinner & evening
                </span>
              )}
            </div>

            {/* Description */}
            <div className="product-detail-section">
              <div className="product-detail-section-title">About</div>
              <p className="body-md">{product.description}</p>
            </div>

            {/* Benefits */}
            <div className="product-detail-section">
              <div className="product-detail-section-title">Why it helps</div>
              <ul className="benefit-list">
                {product.benefits.map(b => <li key={b}>{b}</li>)}
              </ul>
            </div>

            {/* Key ingredients */}
            <div className="product-detail-section">
              <div className="product-detail-section-title">Focus on</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.keyIngredients.map(i => (
                  <span key={i} className="tag tag-sage" style={{ padding: '5px 12px', fontSize: 12 }}>{i}</span>
                ))}
              </div>
            </div>

            {/* Skin types */}
            <div className="product-detail-section">
              <div className="product-detail-section-title">Often useful for</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {product.skinType.map(t => (
                  <span key={t} className="tag tag-cream" style={{ padding: '5px 12px', fontSize: 12 }}>{t}</span>
                ))}
              </div>
            </div>

            {/* How to use */}
            <div className="product-detail-section">
              <div className="product-detail-section-title">A practical way to start</div>
              <p className="body-md">{product.howToUse}</p>
            </div>

            {/* Ingredients */}
            <div className="product-detail-section">
              <div className="product-detail-section-title">Pause and get care if</div>
              <p className="body-sm" style={{ fontStyle: 'italic' }}>{product.fullIngredients}</p>
            </div>

            {/* CTA */}
            <div className="product-detail-section" style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => window.dispatchEvent(new CustomEvent('open-diabetes-chat'))}>Ask DiabeticVoice</button>
              <button className="btn btn-secondary btn-lg" onClick={onBack}>Back</button>
            </div>

            {/* Disclaimer */}
            <p className="body-xs" style={{ marginTop: 16 }}>
              Educational lifestyle information only. It is not a meal prescription, an insulin dose, or a promise of reversal. Keep your medicines unless your clinician changes them. Seek urgent care for severe lows, vomiting with high glucose, chest pain, or trouble breathing.
            </p>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div style={{ marginTop: 80 }}>
            <div className="section-header">
              <div className="section-header-left">
                <div className="eyebrow section-header-eyebrow">You may also like</div>
                <div className="display-md section-header-title">Related topics</div>
              </div>
            </div>
            <div className="product-grid">
              {related.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => onProductSelect?.(p)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
