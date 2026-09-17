// R&D Ecosystem hub — header + KPIs + shortcuts + network cards + CTA.
// Detail explorers live on /institutions, /gaps, /opportunities.
import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../components/common/useScrollReveal';
import SplitText from '../components/bits/SplitText';
import CountUp from '../components/bits/CountUp';
import SpotlightCard from '../components/bits/SpotlightCard';
import StarBorder from '../components/bits/StarBorder';
import { PLATFORM_STATS, TECHNOLOGY_GAPS } from '../data/mineralsData';
import { TrendingUp, FileText, BookOpen, ArrowUpRight, Building2, FlaskConical, Network, Sparkles, ShieldAlert } from 'lucide-react';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const MIST = 'var(--color-lavender-mist)';

const criticalGaps = TECHNOLOGY_GAPS.filter((g) => g.vulnerabilityLevel === 'Critical').length;

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

const NETWORK_CARDS = [
  {
    to: '/institutions',
    icon: Building2,
    title: 'Leading Institutions',
    desc: 'Patent leaderboard and capability dossiers.',
  },
  {
    to: '/gaps',
    icon: ShieldAlert,
    title: 'Technology Gaps',
    desc: 'TRL deficits, import exposure and emerging areas.',
  },
  {
    to: '/opportunities',
    icon: FlaskConical,
    title: 'Opportunities & Corridors',
    desc: 'Priority bets + lab-to-industry clusters',
  },
];

export default function EcosystemPage() {
  useScrollReveal();

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
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: INK }}>
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

        {/* Explore the network — links to the four sub-pages */}
        <div className="reveal-init" style={{ paddingTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-electric-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
            <Network style={{ width: '14px', height: '14px' }} />
            <span>Explore the network</span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, letterSpacing: '-0.02em', color: INK, marginBottom: '8px' }}>
            Dive into the ecosystem
          </h2>
          <p style={{ color: GRAPHITE, fontSize: '14px', maxWidth: '640px', marginBottom: '24px', lineHeight: 1.6 }}>
            Institutions, gaps and opportunities each have a dedicated page.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
            {NETWORK_CARDS.map(({ to, icon: Icon, title, desc }) => (
              <Link key={to} to={to} style={{ textDecoration: 'none' }}>
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
                Ask Minerals AI
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
    </div>
  );
}
