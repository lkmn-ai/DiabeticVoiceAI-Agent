import React, { useState } from 'react';
import { PRODUCTS, CATEGORIES, CONCERNS } from '../data/products';
import { ProductCard } from '../components/ProductCard';

export function ProductsPage({ onProductSelect, initialCategory, initialConcern }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'All');
  const [activeConcern, setActiveConcern] = useState(initialConcern || null);
  const [sort, setSort] = useState('default');

  let filtered = PRODUCTS;

  if (activeCategory && activeCategory !== 'All') {
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if (activeConcern) {
    filtered = filtered.filter(p => p.concern?.includes(activeConcern));
  }

  if (sort === 'price-asc')  filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === 'rating')     filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const activeConcernLabel = CONCERNS.find(c => c.id === activeConcern)?.label;

  return (
    <div style={{ paddingTop: 'var(--header-h)' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
        {/* Page header */}
        <div style={{ marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            {activeConcernLabel ? `Topics for ${activeConcernLabel}` : 'Lifestyle library'}
          </div>
          <h1 className="display-md">
            {activeConcernLabel
              ? `${activeConcernLabel}`
              : activeCategory !== 'All'
              ? activeCategory
              : 'Meals, glucose, and liver'
            }
          </h1>
          <p className="body-md" style={{ marginTop: 12, maxWidth: 480 }}>
            {`${filtered.length} ${filtered.length === 1 ? 'topic' : 'topics'} · Suggestions for daily life, not a diagnosis or a medicine change.`}
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div className="filter-bar" style={{ marginBottom: 0 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat && !activeConcern ? 'active' : ''}`}
                onClick={() => { setActiveCategory(cat); setActiveConcern(null); }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              padding: '7px 14px',
              borderRadius: 20,
              border: '1px solid var(--cream-border)',
              background: 'var(--warm-white)',
              color: 'var(--charcoal-mid)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Quicker habits first</option>
            <option value="price-desc">Longer habits first</option>
            <option value="rating">Most opened</option>
          </select>
        </div>

        {/* Concern filters */}
        <div className="filter-bar">
          {activeConcern && (
            <button
              className="filter-btn active"
              onClick={() => setActiveConcern(null)}
              style={{ background: 'var(--sage)', borderColor: 'var(--sage)', color: 'white' }}
            >
              ✕ {activeConcernLabel}
            </button>
          )}
          {CONCERNS.filter(c => c.id !== activeConcern).map(c => (
            <button
              key={c.id}
              className="filter-btn"
              onClick={() => setActiveConcern(c.id)}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="product-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onClick={onProductSelect} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="display-md" style={{ opacity: 0.3 }}>No topics found</div>
            <p className="body-md" style={{ marginTop: 12 }}>Try adjusting your filters.</p>
            <button className="btn btn-secondary" style={{ marginTop: 20 }} onClick={() => { setActiveCategory('All'); setActiveConcern(null); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
