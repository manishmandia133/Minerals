// Policy Brief — printable R&D priority summary for critical minerals.
// Light theme: lavender-mist canvas, badge + card primitives, print-friendly.
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Printer, ArrowUpRight, FileText, ShieldAlert } from 'lucide-react';
import { CRITICAL_MINERALS } from '../data/mineralsData';
import { useScrollReveal } from '../components/common/useScrollReveal';
import SplitText from '../components/bits/SplitText';
import SpotlightCard from '../components/bits/SpotlightCard';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const MIST = 'var(--color-lavender-mist)';

const topFive = [...CRITICAL_MINERALS]
  .sort((a, b) => a.priorityRank - b.priorityRank)
  .slice(0, 5);
const allRanked = [...CRITICAL_MINERALS].sort((a, b) => a.priorityRank - b.priorityRank);

export default function PolicyBriefPage() {
  useScrollReveal();

  return (
    <div className="policy-brief-print" style={{ background: MIST, minHeight: '100vh', paddingTop: '100px', paddingBottom: '72px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* Breadcrumb + source line */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '18px 0 12px',
            fontSize: '12px',
            color: GRAPHITE,
          }}
          className="reveal-init no-print"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Policy Brief</span>
          </div>
          <div>Source: Minerals tracker · IPO InPASS + OpenAlex · Cached Sep 2026</div>
        </div>

        {/* Title + executive summary */}
        <div style={{ marginBottom: '24px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">
              <FileText style={{ width: '12px', height: '12px' }} />
              Policy Brief
            </span>
            <span className="badge">R&amp;D priorities · Sep 2026</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(30px, 7vw, 42px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: INK,
            }}
          >
            <SplitText
              text="Critical Minerals: Five R&D Bets for India"
              tag="span"
              splitType="words"
              textAlign="left"
              delay={55}
              duration={0.9}
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
            />
          </h1>
          <p style={{ color: GRAPHITE, fontSize: '15px', marginTop: '10px', maxWidth: '760px', lineHeight: 1.65 }}>
            India imports 100% of its cobalt, lithium and heavy rare earth needs, and domestic
            technology readiness still trails the global frontier across extraction, refining and
            component manufacturing. This brief prioritizes five R&amp;D bets — ranked by import
            risk and TRL gap — where targeted pilots and scale-up can close the sovereignty gap fastest.
          </p>
          <div className="no-print" style={{ marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => window.print()}
              className="btn-pill btn-pill-indigo"
              style={{ fontSize: '12px', padding: '12px 20px', cursor: 'pointer' }}
            >
              <Printer style={{ width: '13px', height: '13px' }} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Top 5 R&D priorities */}
        <section aria-labelledby="policy-top5" className="reveal-init" style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--color-electric-indigo)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: '10px',
            }}
          >
            <ShieldAlert style={{ width: '14px', height: '14px' }} />
            <span>Ranked by import risk × TRL gap</span>
          </div>
          <h2
            id="policy-top5"
            style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, letterSpacing: '-0.02em', color: INK, marginBottom: '8px' }}
          >
            Top 5 R&amp;D priorities
          </h2>
          <p style={{ color: GRAPHITE, fontSize: '14px', maxWidth: '640px', marginBottom: '20px', lineHeight: 1.6 }}>
            The five lowest policy-rank minerals — each with its recommendation and key stats.
            Open a dossier for full evidence.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {topFive.map((m) => (
              <SpotlightCard
                key={m.id}
                className="card card-interactive"
                spotlightColor="rgba(26, 47, 251, 0.09)"
                style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}
              >
                <span className="badge badge-indigo" style={{ alignSelf: 'flex-start' }}>
                  Priority #{m.priorityRank}
                </span>
                <div style={{ fontSize: '16px', fontWeight: 500, color: INK, lineHeight: 1.35 }}>{m.name}</div>
                <div style={{ fontSize: '13px', color: GRAPHITE, lineHeight: 1.55 }}>{m.policyRecommendation}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: GRAPHITE,
                    lineHeight: 1.55,
                    paddingTop: '10px',
                    borderTop: `1px solid ${HAZE}`,
                  }}
                >
                  Import dependence: {m.importDependency} · India TRL {m.currentIndiaTRL}/9 · {m.indiaGlobalShare}
                </div>
                <Link
                  to={`/mineral/${m.id}`}
                  aria-label={`View ${m.name} dossier`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: 'var(--color-electric-indigo)',
                    textDecoration: 'none',
                  }}
                >
                  View dossier <ArrowUpRight style={{ width: '13px', height: '13px' }} />
                </Link>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* Import-risk table */}
        <section aria-labelledby="policy-table" className="reveal-init" style={{ marginBottom: '28px' }}>
          <h2
            id="policy-table"
            style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, letterSpacing: '-0.02em', color: INK, marginBottom: '8px' }}
          >
            Import-risk snapshot
          </h2>
          <p style={{ color: GRAPHITE, fontSize: '14px', maxWidth: '640px', marginBottom: '20px', lineHeight: 1.6 }}>
            All eight tracked minerals, sorted by policy priority.
          </p>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  minWidth: '640px',
                  borderCollapse: 'collapse',
                  fontSize: '13px',
                  textAlign: 'left',
                }}
              >
                <thead>
                  <tr style={{ borderBottom: `1px solid ${HAZE}` }}>
                    {['Mineral', 'Import dependency', 'India TRL', 'Global share'].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        style={{
                          padding: '14px 18px',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: GRAPHITE,
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allRanked.map((m) => (
                    <tr key={m.id} style={{ borderBottom: `1px solid ${HAZE}` }}>
                      <td style={{ padding: '13px 18px', fontWeight: 600, color: INK, whiteSpace: 'nowrap' }}>
                        <Link to={`/mineral/${m.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          #{m.priorityRank} · {m.name}
                        </Link>
                      </td>
                      <td style={{ padding: '13px 18px', color: GRAPHITE }}>{m.importDependency}</td>
                      <td style={{ padding: '13px 18px', color: GRAPHITE, fontVariantNumeric: 'tabular-nums' }}>
                        {m.currentIndiaTRL}/9
                      </td>
                      <td style={{ padding: '13px 18px', color: GRAPHITE }}>{m.indiaGlobalShare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Methodology note */}
        <div className="card reveal-init" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, color: INK, marginBottom: '6px' }}>Methodology</div>
          <p style={{ fontSize: '13px', color: GRAPHITE, lineHeight: 1.65 }}>
            Rankings combine import dependence with the gap between domestic TRL and the global
            frontier (TRL 9). Figures are editorial estimates from IPO InPASS filings and
            OpenAlex-indexed research — see the full{' '}
            <Link to="/help#methodology" style={{ color: 'var(--color-electric-indigo)', fontWeight: 600 }}>
              methodology note
            </Link>{' '}
            for coverage, refresh cadence and limitations.
          </p>
        </div>
      </div>
    </div>
  );
}
