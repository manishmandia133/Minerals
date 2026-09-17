// Global Benchmark Page — domestic-vs-foreign filing splits + India vs frontier TRL lag
// Editorial estimates only (see GLOBAL_BENCHMARK + methodology note). Plain divs/SVG, no new deps.

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Globe2, Gauge, ShieldAlert, Info, ArrowUpRight } from 'lucide-react';
import { GLOBAL_BENCHMARK } from '../data/mineralsData';

const INK = 'var(--color-ink)';
const MUTED = 'var(--color-graphite)';
const FAINT = '#6b7280';
const LINE = 'var(--color-haze)';
const BG = 'var(--color-lavender-mist)';
const INDIGO = 'var(--color-electric-indigo)';
const FOREIGN = '#c3c9d8';

export default function BenchmarkPage() {
  const watchList = GLOBAL_BENCHMARK.filter((m) => m.foreignShare >= 40);

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingTop: '100px', paddingBottom: '90px', color: INK }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* Breadcrumb + source line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '18px 0 12px', fontSize: '12px', color: FAINT }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: FAINT, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Global Benchmark</span>
          </div>
          <div>Editorial estimates · see <Link to="/help#methodology" style={{ color: INDIGO, fontWeight: 600 }}>Methodology</Link></div>
        </div>

        {/* Title + lede */}
        <div style={{ paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">
              <Globe2 style={{ width: '12px', height: '12px' }} />
              India vs Global Frontier
            </span>
            <span className="badge">8 Tracked Minerals</span>
            <span className="badge badge-emerald">Editorial Estimates</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
            Global Benchmark
          </h1>
          <p style={{ fontSize: '15px', color: MUTED, margin: '8px 0 0', maxWidth: '680px', lineHeight: 1.55 }}>
            How India's filing presence and technology readiness compare with the global frontier —
            illustrative splits to frame sovereignty priorities, not official statistics.
          </p>
        </div>

        {/* Domestic vs foreign stacked bars */}
        <section className="card" style={{ padding: '28px', marginBottom: '24px' }} aria-label="Domestic versus foreign filing share">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Globe2 style={{ width: '18px', height: '18px', color: INDIGO }} />
            <h2 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Domestic vs Foreign Filing Share</h2>
          </div>
          <p style={{ fontSize: '13px', color: MUTED, margin: '0 0 20px' }}>
            Illustrative share of filings attributed to domestic vs foreign applicants per mineral.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '12px', color: MUTED, marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: INDIGO }} /> Domestic
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: FOREIGN }} /> Foreign
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '520px' }}>
              {GLOBAL_BENCHMARK.map((m) => (
                <div key={m.mineralId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', fontSize: '13px', marginBottom: '6px' }}>
                    <Link to={`/mineral/${m.mineralId}`} style={{ fontWeight: 600, color: INK, textDecoration: 'none' }}>
                      {m.mineralName}
                    </Link>
                    <span style={{ color: MUTED, fontSize: '12px', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: INDIGO }}>{m.domesticShare}%</strong> domestic · {m.foreignShare}% foreign
                    </span>
                  </div>
                  <div
                    role="img"
                    aria-label={`${m.mineralName}: ${m.domesticShare}% domestic, ${m.foreignShare}% foreign`}
                    style={{ display: 'flex', width: '100%', height: '14px', borderRadius: '7px', overflow: 'hidden', background: 'var(--color-haze)' }}
                  >
                    <div style={{ width: `${m.domesticShare}%`, background: INDIGO }} />
                    <div style={{ width: `${m.foreignShare}%`, background: FOREIGN }} />
                  </div>
                  <div style={{ fontSize: '12px', color: FAINT, marginTop: '4px' }}>{m.wipoContext}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TRL-lag chart */}
        <section className="card" style={{ padding: '28px', marginBottom: '24px' }} aria-label="India versus frontier TRL">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Gauge style={{ width: '18px', height: '18px', color: INDIGO }} />
            <h2 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>TRL Lag: India vs Frontier</h2>
          </div>
          <p style={{ fontSize: '13px', color: MUTED, margin: '0 0 20px' }}>
            Paired bars per mineral with the readiness gap (frontier − India) called out.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: '520px' }}>
              {GLOBAL_BENCHMARK.map((m) => {
                const gap = m.frontierTRL - m.indiaTRL;
                return (
                  <div key={m.mineralId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', fontSize: '13px', marginBottom: '6px' }}>
                      <Link to={`/mineral/${m.mineralId}`} style={{ fontWeight: 600, color: INK, textDecoration: 'none' }}>
                        {m.mineralName}
                      </Link>
                      <span className="badge badge-amber" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                        Gap: {gap} TRL {gap === 1 ? 'level' : 'levels'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '64px', flexShrink: 0, fontSize: '11px', color: MUTED }}>India</span>
                        <div style={{ flex: 1, height: '10px', borderRadius: '5px', background: 'var(--color-haze)', overflow: 'hidden' }}>
                          <div style={{ width: `${(m.indiaTRL / 9) * 100}%`, height: '100%', borderRadius: '5px', background: INDIGO }} />
                        </div>
                        <span style={{ width: '52px', flexShrink: 0, fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>TRL {m.indiaTRL}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '64px', flexShrink: 0, fontSize: '11px', color: MUTED }}>Frontier</span>
                        <div style={{ flex: 1, height: '10px', borderRadius: '5px', background: 'var(--color-haze)', overflow: 'hidden' }}>
                          <div style={{ width: `${(m.frontierTRL / 9) * 100}%`, height: '100%', borderRadius: '5px', background: '#10b981' }} />
                        </div>
                        <span style={{ width: '52px', flexShrink: 0, fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>TRL {m.frontierTRL}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sovereignty signal list */}
        <section className="card" style={{ padding: '28px', marginBottom: '24px' }} aria-label="Sovereignty signals">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <ShieldAlert style={{ width: '18px', height: '18px', color: '#b45309' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 500, margin: 0 }}>Sovereignty Signals</h2>
          </div>
          <p style={{ fontSize: '13px', color: MUTED, margin: '0 0 16px' }}>
            Minerals with foreign filing share ≥ 40% are flagged as import-risk watch candidates.
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {watchList.map((m) => (
              <li
                key={m.mineralId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'var(--color-lavender-mist)',
                  border: `1px solid ${LINE}`,
                  fontSize: '13px',
                }}
              >
                <Link
                  to={`/mineral/${m.mineralId}`}
                  style={{ fontWeight: 600, color: INK, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {m.mineralName}
                  <ArrowUpRight style={{ width: '13px', height: '13px', color: INDIGO }} />
                </Link>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: MUTED }}>{m.foreignShare}% foreign share</span>
                  <span className="badge badge-amber" style={{ fontSize: '11px' }}>Import-risk watch</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Methodology note */}
        <section
          className="card"
          style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: MUTED, lineHeight: 1.6 }}
          aria-label="Methodology note"
        >
          <Info style={{ width: '16px', height: '16px', color: INDIGO, flexShrink: 0, marginTop: '2px' }} />
          <span>
            All shares and jurisdictional context on this page are editorial estimates for illustration —
            not WIPO statistics. TRL values mirror the tracked dataset. See the full{' '}
            <Link to="/help#methodology" style={{ color: INDIGO, fontWeight: 600 }}>
              methodology note
            </Link>
            .
          </span>
        </section>
      </div>
    </div>
  );
}
