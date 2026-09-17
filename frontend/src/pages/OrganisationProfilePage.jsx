// Organisation profile — per-institution dossier driven by LEADING_ORGANISATIONS + CRITICAL_MINERALS.
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CRITICAL_MINERALS, LEADING_ORGANISATIONS } from '../data/mineralsData';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const MIST = 'var(--color-lavender-mist)';
const INDIGO = 'var(--color-electric-indigo)';
const PAPER = 'var(--color-paper-white)';

const sectionTitle = {
  fontSize: 'clamp(20px, 2.6vw, 26px)',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: INK,
  marginBottom: '6px',
};

const stem = (w) => w.toLowerCase().replace(/[^a-z]/g, '').replace(/s$/, '');

// Resolve a topMinerals chip to a real CRITICAL_MINERALS id (or undefined → render plain chip, never a dead link).
function resolveMineralByChip(chip) {
  const lower = chip.toLowerCase().trim();
  const direct = CRITICAL_MINERALS.find(
    (m) => m.name.toLowerCase().includes(lower) || lower.includes(m.name.toLowerCase())
  );
  if (direct) return direct;
  const chipStems = lower.split(/[\s/&(),-]+/).map(stem).filter((s) => s.length >= 3);
  if (chipStems.length === 0) return undefined;
  return CRITICAL_MINERALS.find((m) => {
    const mineralStems = m.name.toLowerCase().split(/[\s/&(),-]+/).map(stem).filter((s) => s.length >= 3);
    return chipStems.some((s) => mineralStems.includes(s));
  });
}

export default function OrganisationProfilePage() {
  const { name } = useParams();
  const orgName = useMemo(() => {
    try {
      return decodeURIComponent(name || '');
    } catch {
      return name || '';
    }
  }, [name]);

  const org = useMemo(
    () => LEADING_ORGANISATIONS.find((o) => o.name === orgName),
    [orgName]
  );

  if (!org) {
    return (
      <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
        <div className="page-container" style={{ maxWidth: '1360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <Link to="/ecosystem" style={{ color: GRAPHITE, textDecoration: 'none' }}>Innovation Network</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Unknown organisation</span>
          </div>
          <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 500, color: INK, marginBottom: '8px' }}>Unknown organisation</div>
            <p style={{ fontSize: '14px', color: GRAPHITE, marginBottom: '20px' }}>
              We couldn&apos;t find a profile for &ldquo;{orgName}&rdquo;. It may not be one of the tracked institutions yet.
            </p>
            <Link to="/ecosystem" className="btn-pill btn-pill-indigo" style={{ fontSize: '13px' }}>
              Back to Innovation Network
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    org.patentsCount != null && { label: 'Patents', value: String(org.patentsCount), sub: 'Indian filings' },
    org.activeResearchPapers != null && { label: 'Research Papers', value: String(org.activeResearchPapers), sub: 'Active publications' },
    org.citationImpact != null && { label: 'Citation Impact', value: Number(org.citationImpact).toFixed(1), sub: 'Mean citation score' },
  ].filter(Boolean);

  const contributesTo = CRITICAL_MINERALS.filter((m) => (m.topOrgs || []).includes(org.name));

  return (
    <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px', color: INK }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE, flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
          <ChevronRight style={{ width: '12px', height: '12px' }} />
          <Link to="/ecosystem" style={{ color: GRAPHITE, textDecoration: 'none' }}>Innovation Network</Link>
          <ChevronRight style={{ width: '12px', height: '12px' }} />
          <span style={{ color: INK, fontWeight: 600 }}>{org.name}</span>
        </div>

        {/* header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">{org.type}</span>
            <span className="badge">{org.location}</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
            {org.name}
          </h1>
          <p style={{ color: GRAPHITE, fontSize: '15px', marginTop: '8px', maxWidth: '720px', lineHeight: 1.6 }}>
            {org.type} • {org.location}
          </p>
        </div>

        {/* stat cards */}
        {stats.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {stats.map((s) => (
              <div key={s.label} className="card" style={{ padding: '18px 22px' }}>
                <div style={{ fontSize: '12px', color: GRAPHITE, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{s.label}</div>
                <div style={{ fontSize: '24px', fontWeight: 500, color: INK, marginTop: '4px', lineHeight: 1.2 }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: GRAPHITE, marginTop: '2px' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* flagship capability callout */}
        {org.flagshipTech && (
          <div className="card" style={{ padding: '24px', marginBottom: '24px', background: PAPER }}>
            <span className="badge badge-indigo" style={{ alignSelf: 'flex-start' }}>Flagship capability</span>
            <p style={{ fontSize: '14px', color: INK, lineHeight: 1.65, margin: '12px 0 0' }}>{org.flagshipTech}</p>
          </div>
        )}

        {/* mineral focus + TRL + partners */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={sectionTitle}>Mineral focus</h2>
            <p style={{ fontSize: '13px', color: GRAPHITE, margin: '0 0 14px' }}>Priority minerals in this institution&apos;s portfolio.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(org.topMinerals || []).map((chip) => {
                const match = resolveMineralByChip(chip);
                return match ? (
                  <Link key={chip} to={`/mineral/${match.id}`} className="badge badge-indigo" style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}>
                    {chip}
                  </Link>
                ) : (
                  <span key={chip} className="badge" style={{ fontSize: '12px', padding: '6px 12px' }}>{chip}</span>
                );
              })}
            </div>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={sectionTitle}>TRL specialization</h2>
            <p style={{ fontSize: '13px', color: GRAPHITE, margin: '0 0 14px' }}>Technology-readiness band where this institution operates.</p>
            <div style={{ fontSize: '20px', fontWeight: 500, color: INDIGO }}>{org.trlSpecialization || '—'}</div>
          </div>
          <div className="card" style={{ padding: '24px' }}>
            <h2 style={sectionTitle}>Network partners</h2>
            <p style={{ fontSize: '13px', color: GRAPHITE, margin: '0 0 14px' }}>Collaborators across industry and academia.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(org.networkPartners || []).map((p) => (
                <span key={p} className="badge" style={{ fontSize: '12px', padding: '6px 12px' }}>{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* reverse lookup: minerals this org contributes to */}
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={sectionTitle}>Minerals this org contributes to</h2>
          <p style={{ fontSize: '13px', color: GRAPHITE, margin: '0 0 14px' }}>
            Mineral dossiers where {org.name} is listed as a leading organisation.
          </p>
          {contributesTo.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {contributesTo.map((m) => (
                <Link key={m.id} to={`/mineral/${m.id}`} className="badge badge-indigo" style={{ fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}>
                  {m.name}
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: GRAPHITE, margin: 0 }}>
              No mineral dossiers currently list this institution as a leading contributor.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
