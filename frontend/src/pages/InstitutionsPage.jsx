// Leading Institutions — explorer moved verbatim-styled from EcosystemPage.
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Building2, MapPin, Network } from 'lucide-react';
import { useScrollReveal } from '../components/common/useScrollReveal';
import { PLATFORM_STATS, LEADING_ORGANISATIONS } from '../data/mineralsData';
import { getPatentsLive, getResearchesLive, classifyInstitution } from '../api.client';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const MIST = 'var(--color-lavender-mist)';

const STATIC_TOP_ORGS = [...LEADING_ORGANISATIONS].sort((a, b) => b.patentsCount - a.patentsCount).slice(0, 4);

function orgTypeShort(type = '') {
  const t = type.toLowerCase();
  if (t.includes('csir') || t.includes('national r&d') || t.includes('mineral processing')) return 'CSIR Lab';
  if (t.includes('academic') || t.includes('consortium')) return 'Academia';
  if (t.includes('strategic') || t.includes('public sector') || t.includes('dae')) return 'Strategic PSU';
  if (t.includes('corporate')) return 'Industry';
  return 'Research Org';
}

export default function InstitutionsPage() {
  useScrollReveal();
  const [livePatents, setLivePatents] = useState(null);
  const [liveResearch, setLiveResearch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPatentsLive()
      .then((p) => {
        if (!cancelled) setLivePatents(p);
      })
      .catch(() => {
        if (!cancelled) setLivePatents([]);
      });
    getResearchesLive()
      .then((r) => {
        if (!cancelled) setLiveResearch(r);
      })
      .catch(() => {
        if (!cancelled) setLiveResearch([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const liveTopOrgs = useMemo(() => {
    if (!livePatents?.length && !liveResearch?.length) return null;
    const byOrg = {};
    const touch = (name, kind, mineral, tech) => {
      const key = (name || 'Unknown').trim() || 'Unknown';
      const o = (byOrg[key] =
        byOrg[key] || { name: key, patents: 0, papers: 0, minerals: {}, techs: {} });
      if (kind === 'patent') o.patents += 1;
      else o.papers += 1;
      const m = (mineral || '').trim();
      if (m) o.minerals[m] = (o.minerals[m] || 0) + 1;
      const t = (tech || '').trim();
      if (t) o.techs[t] = (o.techs[t] || 0) + 1;
    };
    (livePatents || []).forEach((p) => touch(p.applicant, 'patent', p.mineral, p.category));
    (liveResearch || []).forEach((p) => touch(p.institution, 'paper', p.mineral, p.domain));
    const ranked = Object.values(byOrg).sort(
      (a, b) => b.patents + b.papers - (a.patents + a.papers)
    );
    if (ranked.length === 0) return null;
    return ranked.slice(0, 4).map((o, i) => ({
      id: `live-org-${i}`,
      name: o.name,
      location: 'India',
      type: classifyInstitution(o.name),
      patentsCount: o.patents,
      activeResearchPapers: o.papers,
      citationImpact: null,
      flagshipTech:
        Object.entries(o.techs)
          .sort((a, b) => b[1] - a[1])
          .map(([t]) => t)[0] || 'Critical minerals R&D',
      topMinerals: Object.entries(o.minerals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([m]) => m),
      trlSpecialization: '—',
      networkPartners: [],
    }));
  }, [livePatents, liveResearch]);

  const TOP_ORGS = liveTopOrgs || STATIC_TOP_ORGS;
  const maxOrgPatents = Math.max(...TOP_ORGS.map((o) => o.patentsCount), 1);
  const totalOrgPatents = TOP_ORGS.reduce((a, o) => a + o.patentsCount, 0);
  const totalOrgPapers = TOP_ORGS.reduce((a, o) => a + (o.activeResearchPapers || 0), 0);

  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const selectedOrg = TOP_ORGS.find((o) => o.id === selectedOrgId) ?? TOP_ORGS[0];
  const setSelectedOrg = (org) => setSelectedOrgId(org?.id ?? null);

  return (
    <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <Link to="/ecosystem" style={{ color: GRAPHITE, textDecoration: 'none' }}>Innovation Network</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Institutions</span>
          </div>
          <div>Source: Live corpus + editorial dataset</div>
        </div>

        <div style={{ marginBottom: '24px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">Indian R&amp;D Ecosystem</span>
            <span className="badge">Institutions</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: INK, margin: 0 }}>
            Leading Institutions
          </h1>
          <p style={{ color: GRAPHITE, fontSize: '15px', marginTop: '8px', maxWidth: '700px' }}>
            Who leads India&apos;s critical-minerals R&amp;D — {PLATFORM_STATS.activeRndInstitutions} institutions tracked.
          </p>
        </div>
      </div>

      <section className="reveal-init" style={{ background: MIST, padding: '24px 0 8px' }}>
        <div className="page-container" style={{ maxWidth: '1360px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-electric-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
                <Building2 style={{ width: '14px', height: '14px' }} />
                <span>Who leads domestic R&amp;D</span>
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.1, color: INK }}>
                Leading Institutions
              </h2>
            </div>
            <p style={{ color: GRAPHITE, fontSize: '14px', maxWidth: '420px', lineHeight: 1.6 }}>
              Top {TOP_ORGS.length} institutions holding {totalOrgPatents} patents and {totalOrgPapers.toLocaleString()} papers.
              Select any institution to open its capability dossier.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', alignItems: 'start' }}>
            <div style={{ gridColumn: 'span 7', minWidth: 0 }} className="eco-orgs">
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: GRAPHITE, fontWeight: 600, marginBottom: '12px' }}>
                Patent output leaderboard
              </div>
              {TOP_ORGS.map((org) => {
                const isSelected = selectedOrg?.id === org.id;
                return (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedOrg(org); } }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={isSelected}
                    aria-label={`${org.name}, ${org.patentsCount} patents`}
                    className={`org-card ${isSelected ? 'selected' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 500, color: INK, lineHeight: 1.35 }}>{org.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GRAPHITE, marginTop: '4px' }}>
                          <MapPin style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{org.location}</span>
                        </div>
                      </div>
                      <span className="badge" style={{ fontSize: '11px', padding: '2px 8px', flexShrink: 0 }}>{orgTypeShort(org.type)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ flex: 1, height: '6px', borderRadius: '999px', background: 'var(--color-haze)', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(6, (org.patentsCount / maxOrgPatents) * 100)}%`, height: '100%', borderRadius: '999px', background: isSelected ? 'var(--color-electric-indigo)' : 'var(--color-graphite)', transition: 'width 300ms ease' }} />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: isSelected ? 'var(--color-electric-indigo)' : INK, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                        {org.patentsCount} patents
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ gridColumn: 'span 5', minWidth: 0, position: 'sticky', top: '100px' }} className="eco-dossier">
              {selectedOrg && (
                <div className="dossier-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: `1px solid ${HAZE}`, marginBottom: '18px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: GRAPHITE, fontWeight: 600 }}>
                      Institution dossier
                    </span>
                    <span className="badge badge-indigo" style={{ fontSize: '11px', padding: '2px 8px' }}>{orgTypeShort(selectedOrg.type)}</span>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.3, color: INK, marginBottom: '4px' }}>{selectedOrg.name}</h3>
                  <div style={{ fontSize: '12px', color: GRAPHITE, marginBottom: '10px' }}>{selectedOrg.type} • {selectedOrg.location}</div>
                  <Link to={`/organisation/${encodeURIComponent(selectedOrg.name)}`} style={{ display: 'inline-block', fontSize: '13px', fontWeight: 600, color: 'var(--color-electric-indigo)', textDecoration: 'none', marginBottom: '18px' }}>
                    Open full profile →
                  </Link>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '10px', marginBottom: '18px' }}>
                      {[
                        ['Patents', String(selectedOrg.patentsCount)],
                        ['Papers', String(selectedOrg.activeResearchPapers ?? 0)],
                        ['Cite impact', selectedOrg.citationImpact != null ? selectedOrg.citationImpact.toFixed(1) : '—'],
                      ].map(([k, v]) => (
                      <div key={k} className="stat-box-dossier">
                        <div style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-electric-indigo)' }}>{v}</div>
                        <div style={{ fontSize: '11px', color: GRAPHITE, marginTop: '2px' }}>{k}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: GRAPHITE, fontWeight: 600, marginBottom: '8px' }}>
                    Flagship capability
                  </div>
                  <p style={{ fontSize: '13px', color: INK, lineHeight: 1.6, padding: '14px 16px', borderRadius: '14px', background: MIST, border: `1px solid ${HAZE}`, marginBottom: '18px' }}>
                    {selectedOrg.flagshipTech}
                  </p>

                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: GRAPHITE, fontWeight: 600, marginBottom: '8px' }}>
                    Mineral focus • {selectedOrg.trlSpecialization}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '18px' }}>
                    {selectedOrg.topMinerals.map((m) => (
                      <span key={m} className="mineral-chip">{m}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: GRAPHITE, fontWeight: 600, marginBottom: '8px' }}>
                    <Network style={{ width: '12px', height: '12px' }} />
                    Network partners
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedOrg.networkPartners.map((p) => (
                      <span key={p} className="partner-chip">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .eco-orgs, .eco-dossier { grid-column: span 12 !important; }
          .eco-dossier { position: static !important; }
        }
      `}</style>
    </div>
  );
}
