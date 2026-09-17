// Technology Gaps — renders the shared TechnologyGapsSection.
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import TechnologyGapsSection from '../components/sections/TechnologyGapsSection';
import { useScrollReveal } from '../components/common/useScrollReveal';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const MIST = 'var(--color-lavender-mist)';

export default function GapsPage() {
  useScrollReveal();
  return (
    <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px', paddingBottom: '40px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <Link to="/ecosystem" style={{ color: GRAPHITE, textDecoration: 'none' }}>Innovation Network</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Technology Gaps</span>
          </div>
          <div>Source: Editorial TRL assessment · global frontier benchmark</div>
        </div>

        <div style={{ marginBottom: '8px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">Innovation Network</span>
            <span className="badge">Vulnerability Radar</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: INK, margin: 0 }}>
            Technology Gaps
          </h1>
          <p style={{ color: GRAPHITE, fontSize: '15px', marginTop: '8px', maxWidth: '700px' }}>
            Where sovereign capability still trails the global frontier — TRL deficits, import exposures and emerging R&amp;D frontiers.
          </p>
        </div>
      </div>

      <div className="reveal-init">
        <TechnologyGapsSection />
      </div>
    </div>
  );
}
