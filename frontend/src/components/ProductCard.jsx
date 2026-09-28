import React from 'react';
import { Star } from 'lucide-react';
import { ProductImage } from './ProductImage';

function StarRating({ rating }) {
  return (
    <div className="product-stars">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={11}
          fill={i <= Math.round(rating) ? 'currentColor' : 'none'}
          strokeWidth={1.5}
        />
      ))}
      <span className="product-stars-count">({rating})</span>
    </div>
  );
}

export function ProductCard({ product, onClick }) {
  return (
    <div className="product-card" onClick={() => onClick?.(product)} role="button" tabIndex={0}>
      {/* Image */}
      <div className="product-card-image">
        <ProductImage product={product} style={{ width: '100%', height: '100%' }} />
        {product.badge && (
          <span className="product-card-badge">{product.badge}</span>
        )}
      </div>

      {/* Body */}
      <div className="product-card-body">
        <div className="product-card-brand">{product.brand}</div>
        <div className="product-card-name">{product.name}</div>

        {/* Tags */}
        <div className="product-card-meta">
          <span className="tag tag-cream">{product.category}</span>
          {product.keyIngredients.slice(0, 1).map(i => (
            <span key={i} className="tag tag-sage">{i}</span>
          ))}
        </div>

        {/* Skin type */}
        <div className="body-xs" style={{ marginTop: 6 }}>
          {product.skinType.slice(0, 2).join(' · ')}
        </div>

        <div className="product-card-price">
          <span>{product.recovery || 'Educational'}</span>
          <StarRating rating={product.rating} />
        </div>
      </div>
    </div>
  );
}
