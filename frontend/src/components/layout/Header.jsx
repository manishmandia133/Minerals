// Header — Lusion.co exact light-theme reproduction
// Transparent on Lavender Mist canvas. Wordmark left, nav center, pill CTAs + MENU right.
// Integrated with React Router for seamless navigation across dedicated pages.

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, ArrowUpRight, Menu, X } from 'lucide-react';
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
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
    padding: '16px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily: 'var(--font-aeonik)',
    background: 'rgba(240, 241, 250, 0.88)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid rgba(228, 230, 239, 0.8)',
    transition: 'padding 0.3s ease',
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
  });

  return (
    <>
      <header style={headerStyle}>
        {/* Wordmark — left */}
        <Link to="/" style={wordmarkStyle}>
          <span>MINERALS</span>
          <span
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

        {/* Center nav — desktop */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="hidden md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
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

        {/* Right — Sound Canvas + CTA pill + MENU */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

          <Link
            to="/chat"
            className="btn-pill btn-pill-outline hidden sm:inline-flex"
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
            <span>AI Assistant</span>
          </Link>

          <Link
            to="/patents"
            className="btn-pill"
            style={{ fontSize: '12px', padding: '10px 20px', gap: '6px' }}
          >
            <span>Explore Patents</span>
            <ArrowUpRight style={{ width: '14px', height: '14px' }} />
          </Link>

          {/* Mobile menu trigger */}
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-ink)',
              padding: '6px',
            }}
            className="md:hidden"
            onClick={() => {
              setMenuOpen(!menuOpen);

            }}
            aria-label="Toggle Navigation"
          >
            {menuOpen ? <X style={{ width: '22px', height: '22px' }} /> : <Menu style={{ width: '22px', height: '22px' }} />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--color-lavender-mist)',
            zIndex: 49,
            padding: '100px 32px 40px',
            fontFamily: 'var(--font-aeonik)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', fontWeight: 500 }}>
              Platform Navigation
            </span>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                  setMenuOpen(false);

                }}
                style={{
                  fontSize: '32px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  color: location.pathname === link.path ? 'var(--color-electric-indigo)' : 'var(--color-ink)',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{link.label}</span>
                <ArrowUpRight style={{ width: '24px', height: '24px', opacity: 0.5 }} />
              </Link>
            ))}
          </div>

          <div style={{ paddingTop: '24px', borderTop: '1px solid var(--color-haze)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/chat"
              onClick={() => {
                setMenuOpen(false);

              }}
              className="btn-pill"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Sparkles style={{ width: '14px', height: '14px' }} />
              <span>Open AI Patent Assistant</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
