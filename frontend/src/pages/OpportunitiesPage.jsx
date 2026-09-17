// Opportunity Whitespaces + Collaboration Corridors — merged bands.
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FlaskConical, Network } from 'lucide-react';
import SpotlightCard from '../components/bits/SpotlightCard';
import { useScrollReveal } from '../components/common/useScrollReveal';
import { CRITICAL_MINERALS } from '../data/mineralsData';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const MIST = 'var(--color-lavender-mist)';

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

export default function OpportunitiesPage() {
  useScrollReveal();
  return (
    <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <div className="page-container reveal-init" style={{ maxWidth: '1360px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <Link to="/ecosystem" style={{ color: GRAPHITE, textDecoration: 'none' }}>Innovation Network</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Opportunities &amp; Corridors</span>
          </div>
          <div>Source: Policy priority ranking · import dependence</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-electric-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
          <FlaskConical style={{ width: '14px', height: '14px' }} />
          <span>Priority R&amp;D bets</span>
        </div>
        <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', color: INK, margin: 0, lineHeight: 1.15 }}>
          Opportunities &amp; Corridors
        </h1>
        <p style={{ color: GRAPHITE, fontSize: '14px', maxWidth: '640px', marginTop: '8px', marginBottom: '24px', lineHeight: 1.6 }}>
          Priority bets + the clusters that can deliver them — the four highest-priority minerals by policy rank, and the lab-to-industry corridors that can close the gap fastest.{' '}
          <Link to="/policy" style={{ color: 'var(--color-electric-indigo)', fontWeight: 600, textDecoration: 'none' }}>
            Read the policy brief →
          </Link>
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          {[...CRITICAL_MINERALS].sort((a, b) => a.priorityRank - b.priorityRank).slice(0, 4).map((m) => (
            <Link key={m.id} to={`/mineral/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }} aria-label={`View ${m.name} dossier`}>
              <SpotlightCard className="card card-interactive" spotlightColor="rgba(26, 47, 251, 0.09)" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
                <span className="badge badge-indigo" style={{ alignSelf: 'flex-start' }}>Priority #{m.priorityRank}</span>
                <div style={{ fontSize: '15px', fontWeight: 500, color: INK, lineHeight: 1.35 }}>{m.name}</div>
                <div style={{ fontSize: '13px', color: GRAPHITE, lineHeight: 1.55 }}>{m.policyRecommendation}</div>
                <div style={{ fontSize: '12px', color: GRAPHITE, lineHeight: 1.55, paddingTop: '10px', borderTop: `1px solid ${HAZE}` }}>
                  Import dependence: {m.importDependency} · India TRL {m.currentIndiaTRL}/9 · {m.indiaGlobalShare}
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>

        <div style={{ paddingTop: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-electric-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
            <Network style={{ width: '14px', height: '14px' }} />
            <span>How the ecosystem connects</span>
          </div>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 500, letterSpacing: '-0.02em', color: INK, margin: 0, lineHeight: 1.15 }}>
            Collaboration corridors
          </h2>
          <p style={{ color: GRAPHITE, fontSize: '14px', maxWidth: '640px', marginTop: '8px', marginBottom: '24px', lineHeight: 1.6 }}>
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
      </div>
    </div>
  );
}
