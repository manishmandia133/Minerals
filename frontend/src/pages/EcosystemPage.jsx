// R&D Ecosystem Page — institutions + vulnerability radar.
// Heavy patent velocity analytics live on /trends; patent records on /patents; papers on /research.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TechnologyGapsSection from '../components/sections/TechnologyGapsSection';
import { useScrollReveal } from '../components/common/useScrollReveal';
import SplitText from '../components/bits/SplitText';
import CountUp from '../components/bits/CountUp';
import SpotlightCard from '../components/bits/SpotlightCard';
import StarBorder from '../components/bits/StarBorder';
import { PLATFORM_STATS, TECHNOLOGY_GAPS, LEADING_ORGANISATIONS } from '../data/mineralsData';
import { TrendingUp, FileText, BookOpen, ArrowUpRight, Building2, MapPin, FlaskConical, Network, Sparkles } from 'lucide-react';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const MIST = 'var(--color-lavender-mist)';

const criticalGaps = TECHNOLOGY_GAPS.filter((g) => g.vulnerabilityLevel === 'Critical').length;
// Top 4 institutions by patent volume — the only ones shown in Leading Institutions
const TOP_ORGS = [...LEADING_ORGANISATIONS].sort((a, b) => b.patentsCount - a.patentsCount).slice(0, 4);
const maxOrgPatents = Math.max(...TOP_ORGS.map((o) => o.patentsCount));
const totalOrgPatents = TOP_ORGS.reduce((a, o) => a + o.patentsCount, 0);
const totalOrgPapers = TOP_ORGS.reduce((a, o) => a + o.activeResearchPapers, 0);

function orgTypeShort(type = '') {
  const t = type.toLowerCase();
  if (t.includes('csir') || t.includes('national r&d') || t.includes('mineral processing')) return 'CSIR Lab';
  if (t.includes('academic') || t.includes('consortium')) return 'Academia';
  if (t.includes('strategic') || t.includes('public sector') || t.includes('dae')) return 'Strategic PSU';
  if (t.includes('corporate')) return 'Industry';
  return 'Research Org';
}

// Collaboration corridors curated from LEADING_ORGANISATIONS networkPartners
const CORRIDORS = [
  {
    name: 'Jamshedpur Steel–Research Corridor',
    orgs: ['CSIR-NML', 'Tata Steel R&D', 'IIT Kharagpur'],
    focus: 'Battery recycling & titanium sponge metallurgy',
  },
  {
    name: 'Bhubaneswar Minerals Corridor',
    orgs: ['CSIR-IMMT', 'NALCO', 'IREL'],
    focus: 'Red-mud valorisation & beach-sand beneficiation',
  },
  {
    name: 'Mumbai Strategic Materials Corridor',
    orgs: ['BARC', 'IREL', 'DMRL / MIDHANI'],
    focus: 'Rare-earth separation & nuclear-grade metals',
  },
  {
    name: 'Chennai EV-Battery Corridor',
    orgs: ['IIT Madras', 'Ola Electric', 'Ather Energy'],
    focus: 'Fast-charging cells & cathode precursor scale-up',
  },
];

const SHORTCUTS = [
  {
    to: '/trends',
    icon: TrendingUp,
    title: 'Patent trends & velocity',
    desc: 'Decade filing curves, mineral velocity and domestic-share analytics.',
  },
  {
    to: '/patents',
    icon: FileText,
    title: 'Patent repository',
    desc: 'Searchable IPO records, IPC codes, TRL and grant status.',
  },
  {
    to: '/research',
    icon: BookOpen,
    title: 'Research repository',
    desc: 'OpenAlex papers, citation impact and institutional output.',
  },
];

export default function EcosystemPage() {
  useScrollReveal();
  const [selectedOrg, setSelectedOrg] = useState(TOP_ORGS[0]);

  const kpis = [
    { label: 'Active R&D Institutions', to: PLATFORM_STATS.activeRndInstitutions, separator: '', suffix: '', sub: 'CSIR • IITs • PSUs • Industry', accent: false },
    { label: 'Patents Tracked', to: PLATFORM_STATS.totalPatentsTracked, separator: ',', suffix: '', sub: 'IPO InPASS critical-minerals register', accent: true },
    { label: 'Critical Gaps', to: criticalGaps, separator: '', suffix: '', sub: '100% import-dependent bottlenecks', accent: false },
    { label: 'Average India TRL', to: PLATFORM_STATS.averageIndiaTRL, separator: '', suffix: ' / 9', sub: 'Bench-to-pilot readiness', accent: false },
  ];

  return (
    <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* Page header */}
        <div style={{ marginBottom: '24px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">Indian R&amp;D Ecosystem</span>
            <span className="badge">Institutions &amp; Vulnerability Radar</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: INK }}>
            <SplitText
              text="Ecosystem & Technology Gaps"
              tag="span"
              splitType="words"
              textAlign="left"
              delay={55}
              duration={0.9}
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
            />
          </h1>
          <p style={{ color: GRAPHITE, fontSize: '15px', marginTop: '8px', maxWidth: '700px' }}>
            Who leads India&apos;s critical-minerals R&amp;D and where sovereign capability
            still trails the global frontier — {PLATFORM_STATS.activeRndInstitutions} institutions,{' '}
            {PLATFORM_STATS.totalPatentsTracked.toLocaleString()} patents, {criticalGaps} critical gaps.
          </p>
        </div>

        {/* KPI band — mirrors research explorer cards */}
        <div className="reveal-init" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {kpis.map((k) => (
            <SpotlightCard key={k.label} className="card card-interactive" spotlightColor="rgba(26, 47, 251, 0.09)" style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: '12px', color: GRAPHITE, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{k.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 500, color: k.accent ? 'var(--color-electric-indigo)' : INK, marginTop: '4px' }}>
                <CountUp to={k.to} separator={k.separator} duration={1.6} />{k.suffix}
              </div>
              <div style={{ fontSize: '12px', color: GRAPHITE, marginTop: '2px' }}>{k.sub}</div>
            </SpotlightCard>
          ))}
        </div>

        {/* Slim shortcut strip to deep analytics */}
        <div className="reveal-init" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '8px' }}>
          {SHORTCUTS.map(({ to, icon: Icon, title, desc }) => (
            <Link
              key={to}
              to={to}
              style={{ textDecoration: 'none' }}
            >
              <SpotlightCard className="card" spotlightColor="rgba(26, 47, 251, 0.09)" style={{ padding: '18px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start', height: '100%' }}>
                <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: MIST, border: `1px solid ${HAZE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: '16px', height: '16px', color: INK }} />
                </span>
                <span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: INK }}>
                    {title} <ArrowUpRight style={{ width: '13px', height: '13px' }} />
                  </span>
                  <span style={{ display: 'block', fontSize: '12px', color: GRAPHITE, marginTop: '3px', lineHeight: 1.45 }}>{desc}</span>
                </span>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Leading institutions explorer */}
      <section className="reveal-init" style={{ background: MIST, padding: '72px 0 8px', marginTop: '16px' }}>
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
            {/* Selector list with leaderboard bars */}
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

            {/* Sticky dossier */}
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
                  <div style={{ fontSize: '12px', color: GRAPHITE, marginBottom: '18px' }}>{selectedOrg.type} • {selectedOrg.location}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
                    {[
                      ['Patents', String(selectedOrg.patentsCount)],
                      ['Papers', String(selectedOrg.activeResearchPapers)],
                      ['Cite impact', selectedOrg.citationImpact.toFixed(1)],
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

      {/* Gap dossiers */}
      <div className="reveal-init">
        <TechnologyGapsSection />
      </div>

      {/* Collaboration corridors */}
      <div className="page-container reveal-init" style={{ maxWidth: '1360px', paddingTop: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-electric-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
          <Network style={{ width: '14px', height: '14px' }} />
          <span>How the ecosystem connects</span>
        </div>
        <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, letterSpacing: '-0.02em', color: INK, marginBottom: '8px' }}>
          Collaboration corridors
        </h2>
        <p style={{ color: GRAPHITE, fontSize: '14px', maxWidth: '640px', marginBottom: '24px', lineHeight: 1.6 }}>
          Lab-to-industry clusters where patents, pilots and production meet — drawn from institutional partnership networks.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {CORRIDORS.map((c) => (
            <SpotlightCard key={c.name} className="card card-interactive" spotlightColor="rgba(26, 47, 251, 0.09)" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: INK, lineHeight: 1.35 }}>{c.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {c.orgs.map((o) => (
                  <span key={o} className="mineral-chip">{o}</span>
                ))}
              </div>
              <div style={{ fontSize: '12px', color: GRAPHITE, lineHeight: 1.55, paddingTop: '10px', borderTop: `1px solid ${HAZE}` }}>{c.focus}</div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Closing CTA */}
      <div className="page-container reveal-init" style={{ maxWidth: '1360px', paddingTop: '32px' }}>
        <div className="card" style={{ padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap', background: 'var(--color-graphite)', borderColor: 'var(--color-graphite)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-haze)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '8px' }}>
              <FlaskConical style={{ width: '14px', height: '14px' }} />
              <span>Ask the ecosystem</span>
            </div>
            <div style={{ fontSize: 'clamp(20px, 2.6vw, 28px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-paper-white)', lineHeight: 1.2 }}>
              Which institution leads your mineral — and what&apos;s still missing?
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
            <StarBorder
              as={Link}
              to={`/chat?query=${encodeURIComponent('Which Indian institutions lead critical minerals R&D and where are the biggest technology gaps?')}`}
              color="#1a2ffb"
              speed="5s"
              backgroundColor="var(--color-paper-white)"
              textColor="var(--color-ink)"
              borderColor="var(--color-haze)"
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 500 }}>
                <Sparkles style={{ width: '13px', height: '13px' }} />
                Ask Mineralis AI
              </span>
            </StarBorder>
            <Link to="/trends" className="btn-pill btn-pill-ghost" style={{ color: 'var(--color-paper-white)', fontSize: '12px' }}>
              <span>View patent velocity</span>
              <ArrowUpRight style={{ width: '13px', height: '13px' }} />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ paddingBottom: '40px' }} />

      <style>{`
        @media (max-width: 900px) {
          .eco-orgs, .eco-dossier { grid-column: span 12 !important; }
          .eco-dossier { position: static !important; }
        }
      `}</style>
    </div>
  );
}
