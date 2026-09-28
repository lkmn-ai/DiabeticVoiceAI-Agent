import React from 'react';

export function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">DiabeticVoice AI</div>
            <p className="footer-tagline">
              Voice-ready lifestyle guidance for meals, insulin spikes, protein, carbs, and fatty liver — education beside your clinician, not instead of one.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Explore</div>
            <ul className="footer-links">
              <li><button onClick={() => onNavigate('products')}>Topics</button></li>
              <li><button onClick={() => onNavigate('ingredients')}>Nutrition</button></li>
              <li><button onClick={() => onNavigate('routines')}>Meal day</button></li>
              <li><button onClick={() => window.dispatchEvent(new CustomEvent('open-diabetes-chat'))}>Ask AI</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Focus</div>
            <ul className="footer-links">
              <li><button onClick={() => onNavigate('products', { concern: 'morning' })}>Morning</button></li>
              <li><button onClick={() => onNavigate('products', { concern: 'afternoon' })}>Afternoon</button></li>
              <li><button onClick={() => onNavigate('products', { concern: 'dinner' })}>Dinner</button></li>
              <li><button onClick={() => onNavigate('products', { concern: 'spikes' })}>Insulin spikes</button></li>
              <li><button onClick={() => onNavigate('products', { concern: 'liver' })}>Fatty liver</button></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Safety</div>
            <ul className="footer-links">
              <li><span>Not a diagnosis</span></li>
              <li><span>Not an insulin dose</span></li>
              <li><span>Do not stop medicines</span></li>
              <li><span>Urgent care for lows and DKA signs</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-disclaimer">
            DiabeticVoice AI is an educational lifestyle assistant. It does not replace a physician, endocrinologist, or dietitian, and it cannot reverse diabetes on its own. Type 2 improvement is possible for some people with clinician-guided habits. Type 1 diabetes is not reversed by food.
          </p>
          <p className="footer-copy">© 2026 DiabeticVoice AI · Educational use only</p>
        </div>
      </div>
    </footer>
  );
}
