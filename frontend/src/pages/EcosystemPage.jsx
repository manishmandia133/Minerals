// R&D Ecosystem & Technology Gaps Page — merged home for Leading Organisations
// and Technology Gaps & Emerging Areas (moved off the overview).

import React from 'react';
import OrganisationsSection from '../components/sections/OrganisationsSection';
import TechnologyGapsSection from '../components/sections/TechnologyGapsSection';
import { useScrollReveal } from '../components/common/useScrollReveal';

export default function EcosystemPage() {
  useScrollReveal();

  return (
    <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', paddingTop: '100px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* Page Top Header */}
        <div style={{ marginBottom: '8px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-indigo">Indian R&amp;D Ecosystem</span>
            <span className="badge">Institutions &amp; Vulnerability Radar</span>
          </div>

          <h1 style={{ fontSize: '42px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--color-ink)' }}>
            Ecosystem &amp; Technology Gaps
          </h1>
          <p style={{ color: 'var(--color-graphite)', fontSize: '15px', marginTop: '8px', maxWidth: '680px' }}>
            India's leading patent-generating organisations alongside the strategic
            technology gaps and emerging R&amp;D frontiers shaping sovereign mineral readiness.
          </p>
        </div>
      </div>

      {/* Leading Organisations Section */}
      <div className="reveal-init">
        <OrganisationsSection />
      </div>

      {/* Technology Gaps & Emerging Areas */}
      <div className="reveal-init">
        <TechnologyGapsSection />
      </div>

      <div style={{ paddingBottom: '40px' }} />
    </div>
  );
}
