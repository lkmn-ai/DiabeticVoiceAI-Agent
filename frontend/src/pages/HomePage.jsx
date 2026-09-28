import React from 'react';
import { ArrowRight, Mic } from 'lucide-react';
import { PRODUCTS, CONCERNS } from '../data/products';
import { INGREDIENTS, ROUTINES } from '../data/ingredients';
import { ProductCard } from '../components/ProductCard';
import { getProductById } from '../data/products';

function IngredientTile({ ingredient, onClick }) {
  return (
    <div
      className="ingredient-card"
      style={{ background: ingredient.color, cursor: 'pointer' }}
      onClick={() => onClick?.(ingredient)}
    >
      <div className="ingredient-tagline" style={{ color: ingredient.accentColor }}>
        {ingredient.tagline}
      </div>
      <div className="ingredient-name">{ingredient.name}</div>
      <div className="ingredient-aka">{ingredient.aka}</div>
      <div className="ingredient-desc" style={{ WebkitLineClamp: 3, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>
        {ingredient.description}
      </div>
      <div className="ingredient-pills">
        {ingredient.goodFor.slice(0, 2).map(g => (
          <span key={g} className="tag" style={{ background: ingredient.accentColor + '18', color: ingredient.accentColor, fontSize: 10 }}>
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}

function RoutinePreview({ onProductSelect }) {
  const [activeTab, setActiveTab] = React.useState('morning');
  const steps = ROUTINES[activeTab];

  return (
    <div>
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

      <div className="routine-steps">
        {steps.map(step => {
          const product = getProductById(step.productId);
          return (
            <div key={step.step} className="routine-step">
              <div className="routine-step-num">{step.step}</div>
              <div>
                <div className="routine-step-name">{step.name}</div>
                <div className="routine-step-desc">{step.description}</div>
              </div>
              {product && (
                <div className="routine-step-product" onClick={() => onProductSelect?.(product)}>
                  <div>
                    <div className="routine-step-product-name">{product.name}</div>
                    <div className="routine-step-product-brand">{product.brand}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HomePage({ onNavigate, onProductSelect }) {
  const featured = PRODUCTS.slice(0, 4);
  const bestSellers = PRODUCTS.filter(p => p.badge === 'Common' || p.rating >= 4.7).slice(0, 4);

  return (
    <div>
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div className="animate-up">
              <div className="eyebrow" style={{ marginBottom: 16 }}>Lifestyle diabetes guidance</div>
              <h1 className="display-xl">
                Eat, walk, and<br />
                <span style={{ fontStyle: 'italic', color: 'var(--sage)' }}>steady your glucose.</span>
              </h1>
              <p className="hero-sub">
                DiabeticVoice AI helps you shape breakfast, afternoon, and dinner around protein, fiber, and carbs — and explains insulin spikes, fatty liver, and the habits linked with improvement.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => onNavigate('products')}>
                  Browse topics
                  <ArrowRight size={16} strokeWidth={1.5} />
                </button>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-diabetes-chat'))}
                  style={{ gap: 8 }}
                >
                  <Mic size={16} strokeWidth={1.5} />
                  Ask DiabeticVoice
                </button>
              </div>
            </div>

            <div className="hero-image-wrap animate-up animate-up-d1">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80"
                alt="A table of vegetables, grains, and fresh food"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--warm-white)', borderTop: '1px solid var(--cream-border)', borderBottom: '1px solid var(--cream-border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <div className="eyebrow section-header-eyebrow">Browse by goal</div>
              <div className="display-md section-header-title">What do you want to steady?</div>
            </div>
          </div>
          <div className="concerns-grid">
            {CONCERNS.map(c => (
              <div key={c.id} className="concern-card" onClick={() => onNavigate('products', { concern: c.id })}>
                <span className="concern-emoji">{c.emoji}</span>
                <span className="concern-label">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <div className="eyebrow section-header-eyebrow">Lifestyle library</div>
              <div className="display-md section-header-title">Meals, spikes, and liver</div>
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => onNavigate('products')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              View all <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div className="product-grid">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onClick={onProductSelect} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--cream-mid)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <div className="eyebrow section-header-eyebrow">Plate building blocks</div>
              <div className="display-md section-header-title">Protein, fiber, carbs, movement</div>
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => onNavigate('ingredients')}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              Explore all <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div className="ingredient-grid">
            {INGREDIENTS.slice(0, 4).map(ing => (
              <IngredientTile key={ing.id} ingredient={ing} onClick={() => onNavigate('ingredients')} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>A day of eating</div>
              <h2 className="display-md">Morning, afternoon, dinner</h2>
              <p className="body-lg" style={{ marginTop: 16 }}>
                The useful pattern is the same at each meal: protein and vegetables first, a modest carb portion, and a short walk after. Sugary drinks are the change that helps both glucose and fatty liver fastest.
              </p>
              <p className="body-md" style={{ marginTop: 12 }}>
                Ask DiabeticVoice what to eat at a given time of day. Familiar questions come from the knowledge base; personal medicine questions stay with your clinician.
              </p>
              <button
                className="btn btn-primary"
                style={{ marginTop: 28 }}
                onClick={() => window.dispatchEvent(new CustomEvent('open-diabetes-chat', { detail: { type: 'routine' } }))}
              >
                <Mic size={15} strokeWidth={1.5} />
                Build a day of meals
              </button>
            </div>
            <div>
              <RoutinePreview onProductSelect={onProductSelect} />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: 'var(--warm-white)', borderTop: '1px solid var(--cream-border)' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <div className="eyebrow section-header-eyebrow">Frequently opened</div>
              <div className="display-md section-header-title">Start here</div>
            </div>
          </div>
          <div className="product-grid">
            {bestSellers.map(p => (
              <ProductCard key={p.id} product={p} onClick={onProductSelect} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: 12 }}>Browse by area</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Meals', 'Glucose', 'Liver', 'Movement', 'Habits'].map(cat => (
              <button
                key={cat}
                className="btn btn-secondary"
                style={{ fontSize: 14 }}
                onClick={() => onNavigate('products', { category: cat })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
