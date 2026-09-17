// Header — Lusion.co exact light-theme reproduction
// Lavender Mist canvas. Single responsive nav row (no hamburger, no scroll):
// wordmark + links + CTA share one bar that wraps gracefully on phones.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowUpRight } from 'lucide-react';
export default function Header() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Overview' },
    { path: '/patents', label: 'Patents' },
    { path: '/research', label: 'Research' },
    { path: '/trends', label: 'Trends & Velocity' },
    { path: '/ecosystem', label: 'Ecosystem' },
    { path: '/chat', label: 'AI Chat' },
  ];

  const headerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    fontFamily: 'var(--font-aeonik)',
    background: 'rgba(240, 241, 250, 0.88)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(228, 230, 239, 0.8)',
  };

  const wordmarkStyle = {
    fontSize: '17px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    color: 'var(--color-ink)',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const navLinkStyle = (isActive) => ({
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    color: isActive ? 'var(--color-electric-indigo)' : 'var(--color-ink)',
    padding: '6px 2px',
    position: 'relative',
    opacity: isActive ? 1 : 0.82,
    transition: 'color 0.2s ease, opacity 0.2s ease',
    whiteSpace: 'nowrap',
  });

  return (
    <header style={headerStyle}>
      <div className="site-header-bar">
        {/* Wordmark — left */}
        <Link to="/" style={wordmarkStyle} className="site-wordmark">
          <span>MINERALS</span>
          <span
            className="site-wordmark-badge"
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '10px',
              background: 'var(--color-graphite)',
              color: 'var(--color-paper-white)',
              fontWeight: 500,
            }}
          >
            IPO
          </span>
        </Link>

        {/* Primary nav — same links on every screen; wraps on phones */}
        <nav className="site-nav" aria-label="Primary">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="site-nav-link"
                style={navLinkStyle(isActive)}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.style.color = 'var(--color-electric-indigo)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.color = 'var(--color-ink)';
                }}
              >
                {link.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'var(--color-electric-indigo)',
                      borderRadius: '1px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTAs */}
        <div className="site-header-ctas" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Link
            to="/chat"
            className="btn-pill btn-pill-outline site-header-ai"
            style={{ fontSize: '12px', padding: '10px 18px', gap: '8px' }}
          >
            <span
              className="pulse-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-electric-indigo)',
                display: 'inline-block',
              }}
            />
            <Sparkles style={{ width: '13px', height: '13px', color: 'var(--color-electric-indigo)' }} />
            <span className="site-ai-text">AI Assistant</span>
          </Link>

          <Link
            to="/patents"
            className="btn-pill site-header-explore"
            style={{ fontSize: '12px', padding: '10px 20px', gap: '6px' }}
          >
            <span>Explore Patents</span>
            <ArrowUpRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>
      </div>
    </header>
  );
}
