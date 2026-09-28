import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header({ page, onNavigate, backendStatus }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { key: 'home',        label: 'Home' },
    { key: 'products',    label: 'Topics' },
    { key: 'ingredients', label: 'Nutrition' },
    { key: 'routines',    label: 'Meal day' },
    { key: 'consultant',  label: 'Ask AI' },
  ];

  const handleLink = (link) => {
    setMobileOpen(false);
    if (link.key === 'consultant') {
      window.dispatchEvent(new CustomEvent('open-diabetes-chat'));
    } else {
      onNavigate(link.key);
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand */}
        <button
          className="header-brand"
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          DiabeticVoice
          <span
            className="status-dot"
            style={{ marginLeft: 6, verticalAlign: 'middle' }}
            title={backendStatus === 'ok' ? 'Backend connected' : 'Backend offline'}
          />
        </button>

        {/* Desktop nav */}
        <nav>
          <ul className="header-nav">
            {links.map(link => (
              <li key={link.key}>
                <button
                  className={`nav-link ${page === link.key && !link.isAnchor ? 'active' : ''}`}
                  onClick={() => handleLink(link)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(v => !v)}
          style={{ display: 'none', background: 'none', border: 'none', padding: 4, cursor: 'pointer' }}
          className="mobile-menu-btn"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div style={{
          position: 'absolute',
          top: 'var(--header-h)',
          left: 0,
          right: 0,
          background: 'var(--cream)',
          borderBottom: '1px solid var(--cream-border)',
          padding: '16px 24px',
          zIndex: 99,
        }}>
          {links.map(link => (
            <button
              key={link.key}
              className="nav-link"
              onClick={() => handleLink(link)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', borderBottom: '1px solid var(--cream-border)', fontSize: 15 }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
