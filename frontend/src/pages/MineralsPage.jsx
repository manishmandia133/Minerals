// Minerals index — all tracked mineral dossiers in one place.
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { CRITICAL_MINERALS } from '../data/mineralsData';
import { useScrollReveal } from '../components/common/useScrollReveal';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';

export default function MineralsPage() {
  useScrollReveal();

  return (
    <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '90px', color: INK }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* utility line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Minerals</span>
          </div>
          <div>Source: Live corpus + editorial dataset</div>
        </div>

        {/* header */}
        <div style={{ paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">8 Tracked Minerals</span>
            <span className="badge">Dossiers · TRL · Import Risk</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
            Critical Minerals
          </h1>
          <p style={{ fontSize: '15px', color: GRAPHITE, margin: '8px 0 0', maxWidth: '660px', lineHeight: 1.55 }}>
            Open a dossier for patents, research output, value-chain readiness, gaps and policy guidance per mineral.
          </p>
        </div>

        {/* cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {[...CRITICAL_MINERALS].sort((a, b) => a.priorityRank - b.priorityRank).map((m) => (
            <Link
              key={m.id}
              to={`/mineral/${m.id}`}
              aria-label={`Open ${m.name} dossier`}
              className="card card-interactive"
              style={{ textDecoration: 'none', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-indigo" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  Priority #{m.priorityRank}
                </span>
                <span className="badge" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {m.symbol}
                </span>
                <span className="badge" style={{ fontSize: '11px', padding: '2px 8px' }}>
                  TRL {m.currentIndiaTRL}/9
                </span>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 500, color: INK }}>{m.name}</div>
              <div style={{ fontSize: '12.5px', color: GRAPHITE }}>
                {m.patentsCount} patents · {m.researchCount} papers · {m.importDependency} import dependent
              </div>
              <div style={{ paddingTop: '10px', borderTop: `1px solid ${HAZE}`, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--color-electric-indigo)', fontWeight: 500 }}>
                Open dossier <ArrowUpRight style={{ width: '14px', height: '14px' }} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
