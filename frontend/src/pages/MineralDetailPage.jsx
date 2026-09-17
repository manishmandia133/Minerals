// Mineral dossier — per-mineral deep dive driven by CRITICAL_MINERALS + MINERAL_ANNUAL_SERIES.
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CRITICAL_MINERALS, MINERAL_ANNUAL_SERIES } from '../data/mineralsData';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const MIST = 'var(--color-lavender-mist)';
const INDIGO = 'var(--color-electric-indigo)';

const STAGE_LABELS = {
  upstream: 'Upstream — Extraction & Beneficiation',
  midstream: 'Midstream — Refining & Precursors',
  downstream: 'Downstream — Components & Devices',
  circular: 'Circular — Recycling & Urban Mining',
};

const sectionTitle = {
  fontSize: 'clamp(20px, 2.6vw, 26px)',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: INK,
  marginBottom: '6px',
};
export default function MineralDetailPage() {
  const { id } = useParams();
  const mineral = useMemo(
    () => CRITICAL_MINERALS.find((m) => m.id === id),
    [id]
  );
  const series = (id && MINERAL_ANNUAL_SERIES[id]) || [];

  if (!mineral) {
    return (
      <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
        <div className="page-container" style={{ maxWidth: '1360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <Link to="/minerals" style={{ color: GRAPHITE, textDecoration: 'none' }}>Minerals</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Unknown mineral</span>
          </div>
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 500, color: INK, marginBottom: '8px' }}>Unknown mineral</div>
            <p style={{ fontSize: '14px', color: GRAPHITE, marginBottom: '20px' }}>
              We couldn&apos;t find a dossier for &ldquo;{id}&rdquo;. It may not be one of the minerals tracked in depth yet.
            </p>
            <Link to="/" className="btn-pill btn-pill-indigo" style={{ fontSize: '13px' }}>
              Back to overview
            </Link>
          </div>
        </div>
      </div>
    );
  }
  const maxVal = Math.max(1, ...series.flatMap((d) => [d.patents, d.research]));
  const stats = [
    { label: 'Indian Patents', value: String(mineral.patentsCount), sub: 'IPO InPASS filings' },
    { label: 'Research Papers', value: String(mineral.researchCount), sub: 'OpenAlex-indexed' },
    { label: 'India TRL', value: `${mineral.currentIndiaTRL}/9`, sub: `Frontier ${mineral.globalFrontierTRL}/9` },
    { label: 'Import Dependency', value: mineral.importDependency, sub: 'Share imported' },
    { label: 'Global Share', value: mineral.indiaGlobalShare, sub: "India's output share" },
  ];

  return (
    <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', color: INK }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* breadcrumb + source line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <Link to="/minerals" style={{ color: GRAPHITE, textDecoration: 'none' }}>Minerals</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>{mineral.name}</span>
          </div>
          <div>Source: Live corpus + editorial dataset</div>
        </div>

        {/* header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">{mineral.symbol}</span>
            <span className="badge">{mineral.status}</span>
            <span className="badge badge-emerald">Priority #{mineral.priorityRank}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
            {mineral.name}
          </h1>
          <p style={{ color: GRAPHITE, fontSize: '15px', marginTop: '8px', maxWidth: '720px', lineHeight: 1.6 }}>
            {mineral.description}
          </p>
        </div>

        {/* stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} className="card" style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: '12px', color: GRAPHITE, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: INK, marginTop: '4px', lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: GRAPHITE, marginTop: '2px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* annual activity chart — plain div bars, no deps */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={sectionTitle}>Annual activity, 2016–2026</h2>
          <p style={{ fontSize: '13px', color: GRAPHITE, margin: '0 0 16px' }}>
            Indian patent filings vs research papers per year for {mineral.name}.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: GRAPHITE, marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: INDIGO, display: 'inline-block' }} /> Patents
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-haze)', display: 'inline-block' }} /> Research
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', minHeight: '190px', overflowX: 'auto', paddingBottom: '4px' }} role="img" aria-label={`Annual patents and research for ${mineral.name}, 2016 to 2026`}>
            {series.map((d) => (
              <div key={d.year} style={{ flex: '1 1 0', minWidth: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: '11px', color: GRAPHITE, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {d.patents}/{d.research}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '130px' }}>
                  <div title={`${d.year}: ${d.patents} patents`} style={{ width: '14px', height: `${Math.max(4, (d.patents / maxVal) * 130)}px`, borderRadius: '4px 4px 2px 2px', background: INDIGO }} />
                  <div title={`${d.year}: ${d.research} papers`} style={{ width: '14px', height: `${Math.max(4, (d.research / maxVal) * 130)}px`, borderRadius: '4px 4px 2px 2px', background: 'var(--color-haze)', border: '1px solid var(--color-graphite)' }} />
                </div>
                <div style={{ fontSize: '11px', color: GRAPHITE, fontVariantNumeric: 'tabular-nums' }}>{d.year}</div>
              </div>
            ))}
          </div>
        </div>
        {/* value-chain readiness */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h2 style={sectionTitle}>Value-chain readiness</h2>
          <p style={{ fontSize: '13px', color: GRAPHITE, margin: '0 0 16px' }}>
            Technology readiness (TRL 1–9) by value-chain stage.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {Object.entries(STAGE_LABELS).map(([stage, label]) => {
              const trl = mineral.trlByStage?.[stage] ?? 0;
              return (
                <div key={stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: INK }}>{label}</span>
                    <span style={{ color: GRAPHITE, fontVariantNumeric: 'tabular-nums' }}>TRL {trl}/9</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '999px', background: MIST, border: `1px solid ${HAZE}`, overflow: 'hidden' }}>
                    <div style={{ width: `${(trl / 9) * 100}%`, height: '100%', borderRadius: '999px', background: INDIGO }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* gaps + orgs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={sectionTitle}>Technology gaps</h2>
            <p style={{ fontSize: '13px', color: GRAPHITE, margin: '0 0 14px' }}>Bottlenecks holding back sovereignty.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(mineral.keyGaps || []).map((g) => (
                <div key={g} style={{ fontSize: '13px', color: INK, lineHeight: 1.55, padding: '10px 14px', borderRadius: '12px', background: MIST, border: `1px solid ${HAZE}` }}>
                  {g}
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={sectionTitle}>Leading organisations</h2>
            <p style={{ fontSize: '13px', color: GRAPHITE, margin: '0 0 14px' }}>Institutions driving domestic R&amp;D.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(mineral.topOrgs || []).map((o) => (
                <span key={o} className="badge" style={{ fontSize: '12px', padding: '6px 12px' }}>{o}</span>
              ))}
            </div>
          </div>
        </div>

        {/* policy callout */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'rgba(26, 47, 251, 0.06)', borderColor: 'rgba(26, 47, 251, 0.25)' }}>
          <span className="badge badge-indigo" style={{ alignSelf: 'flex-start' }}>Priority #{mineral.priorityRank}</span>
          <h2 style={{ ...sectionTitle, marginTop: '12px' }}>Policy recommendation</h2>
          <p style={{ fontSize: '14px', color: INK, lineHeight: 1.65, margin: 0 }}>{mineral.policyRecommendation}</p>
        </div>

        {/* IPC + applications + occurrences */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={sectionTitle}>Dominant IPC codes</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {(mineral.dominantIPCCodes || []).map((c) => (
                <code key={c} style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', border: `1px solid ${HAZE}`, borderRadius: '6px', padding: '4px 10px', background: MIST, color: GRAPHITE }}>
                  {c}
                </code>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={sectionTitle}>Applications</h2>
            <ul style={{ margin: '12px 0 0', paddingLeft: '18px', fontSize: '13px', color: GRAPHITE, lineHeight: 1.7 }}>
              {(mineral.applications || []).map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={sectionTitle}>Indian occurrences</h2>
            <ul style={{ margin: '12px 0 0', paddingLeft: '18px', fontSize: '13px', color: GRAPHITE, lineHeight: 1.7 }}>
              {(mineral.keyIndianOccurrences || []).map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
