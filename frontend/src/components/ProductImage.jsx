/**
 * Topic image — photo when available, food-and-lifestyle illustration otherwise.
 */
import React, { useState } from 'react';

function TopicPlaceholder({ category, bg = '#F3EDE4', accent = '#6B7C5E' }) {
  const shapes = {
    Meals: (
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '58%', opacity: 0.9 }}>
        <ellipse cx="60" cy="78" rx="40" ry="10" fill={accent} opacity="0.25" />
        <circle cx="60" cy="58" r="32" fill="none" stroke={accent} strokeWidth="3" />
        <circle cx="48" cy="54" r="8" fill={accent} opacity="0.55" />
        <circle cx="68" cy="50" r="6" fill={accent} opacity="0.35" />
        <path d="M42 66c8 6 28 6 36-2" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    Glucose: (
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '58%', opacity: 0.9 }}>
        <path d="M18 78h84" stroke={accent} strokeWidth="2" opacity="0.35" />
        <path d="M22 74c10-28 18-8 28-30 8 18 16 8 24-6 8 20 14 10 22-8" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="44" r="4" fill={accent} />
      </svg>
    ),
    Liver: (
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '52%', opacity: 0.9 }}>
        <path d="M60 24c-8 16-28 18-28 40 0 16 12 28 28 28s28-12 28-28c0-22-20-24-28-40z" fill={accent} opacity="0.25" />
        <path d="M60 36c-4 12-16 16-16 30 0 10 7 18 16 18s16-8 16-18c0-14-12-18-16-30z" fill={accent} opacity="0.7" />
        <path d="M60 58v28" stroke="white" strokeWidth="2" opacity="0.7" />
      </svg>
    ),
    Movement: (
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '52%', opacity: 0.9 }}>
        <circle cx="62" cy="32" r="8" fill={accent} />
        <path d="M58 42l-10 22 16 6 8-16 14 8" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M64 64l-6 28M70 68l16 22" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
    Habits: (
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: '52%', opacity: 0.9 }}>
        <circle cx="60" cy="62" r="28" fill="none" stroke={accent} strokeWidth="3" />
        <path d="M60 46v18l12 8" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" />
        <path d="M40 30c6-8 14-10 20-8" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      </svg>
    ),
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {shapes[category] || shapes.Meals}
    </div>
  );
}

const CATEGORY_BG = {
  Meals: '#F3EDE4',
  Glucose: '#F6EBD8',
  Liver: '#E5F0DC',
  Movement: '#E4EEE8',
  Habits: '#E8E6F0',
};

const CATEGORY_ACCENT = {
  Meals: '#8A5A32',
  Glucose: '#C47A3A',
  Liver: '#3D6B4F',
  Movement: '#3A6B52',
  Habits: '#5C5278',
};

export function ProductImage({ product, className, style }) {
  const [failed, setFailed] = useState(false);
  const bg = CATEGORY_BG[product.category] || product.imageBg || '#F3EDE4';
  const accent = CATEGORY_ACCENT[product.category] || '#6B7C5E';

  if (failed || !product.image) {
    return (
      <div className={className} style={{ background: bg, ...style }}>
        <TopicPlaceholder category={product.category} bg={bg} accent={accent} />
      </div>
    );
  }

  return (
    <div className={className} style={{ background: bg, ...style }}>
      <img
        src={product.image}
        alt={product.name}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}
