// Technology Mapping — full-page value-chain explorer (standalone companion to the home-page section).
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { VALUE_CHAIN_STAGES, CRITICAL_MINERALS } from '../data/mineralsData';
import { useScrollReveal } from '../components/common/useScrollReveal';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const INDIGO = 'var(--color-electric-indigo)';
const PAPER = 'var(--color-paper-white)';

const gapColors = {
  'Critical Gap': { bg: 'rgba(220,38,38,0.07)', color: '#dc2626' },
  'Critical Sovereign Gap': { bg: 'rgba(220,38,38,0.07)', color: '#dc2626' },
  'High Technology Gap': { bg: 'rgba(245,158,11,0.07)', color: '#b45309' },
  'Moderate Capability': { bg: 'rgba(26,47,251,0.07)', color: '#1a2ffb' },
  'Mature Sovereign': { bg: 'rgba(22,163,74,0.07)', color: '#16a34a' },
  'Emerging Area': { bg: 'rgba(26,47,251,0.07)', color: '#1a2ffb' },
  'Advancing Fast': { bg: 'rgba(22,163,74,0.07)', color: '#16a34a' },
  'Emerging Strategic': { bg: 'rgba(26,47,251,0.07)', color: '#1a2ffb' },
  'Global Frontier R&D': { bg: 'rgba(26,47,251,0.07)', color: '#1a2ffb' },
  'Strategic Military': { bg: 'rgba(107,33,168,0.07)', color: '#7c3aed' },
  'High Opportunity': { bg: 'rgba(22,163,74,0.07)', color: '#16a34a' },
  'Rapid Commercial Growth': { bg: 'rgba(22,163,74,0.07)', color: '#16a34a' },
  'Emerging Eco-Tech': { bg: 'rgba(26,47,251,0.07)', color: '#1a2ffb' },
  'Frontier Clean Tech': { bg: 'rgba(26,47,251,0.07)', color: '#1a2ffb' },
  'High Volume Resource': { bg: 'rgba(22,163,74,0.07)', color: '#16a34a' },
};

const labelStyle = {
  fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em',
  textTransform: 'uppercase', color: GRAPHITE, marginBottom: '8px',
};

export default function TechnologyMappingPage() {
  useScrollReveal();
  const [activeStageId, setActiveStageId] = useState('upstream');
  const [selectedTech, setSelectedTech] = useState(VALUE_CHAIN_STAGES[0].technologies[0]);

  const activeStage = VALUE_CHAIN_STAGES.find((s) => s.id === activeStageId) || VALUE_CHAIN_STAGES[0];
  const gap = gapColors[selectedTech?.gapStatus] || { bg: 'var(--color-haze)', color: GRAPHITE };

  return (
    <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '90px', color: INK }}>
      <style>{`@media (max-width: 900px) { .tech-mapping-grid { grid-template-columns: 1fr !important; } .tech-detail-panel { position: static !important; } }`}</style>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* utility line: breadcrumb + source */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '18px 0 12px', fontSize: '12px', color: GRAPHITE }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: GRAPHITE, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Technology Mapping</span>
          </div>
          <div>Source: Editorial value-chain dataset · Indian TRL assessment · IPO patent counts</div>
        </div>

        {/* header */}
        <div style={{ paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">End-to-End Value Chain Architecture</span>
            <span className="badge">TRL · Gap Status · Patents</span>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0 }}>
            Technology Mapping
          </h1>
          <p style={{ fontSize: '15px', color: GRAPHITE, margin: '8px 0 0', maxWidth: '720px', lineHeight: 1.55 }}>
            Explore the end-to-end critical mineral value chain — from extraction through recycling —
            mapped against Indian TRL levels and patent activity. Pick a stage, then open a technology
            for its readiness level, gap status and patent footprint.
          </p>
        </div>

        {/* stage selector */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }} role="tablist" aria-label="Value chain stages">
          {VALUE_CHAIN_STAGES.map((stage) => {
            const active = stage.id === activeStageId;
            return (
              <button
                key={stage.id}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setActiveStageId(stage.id);
                  if (stage.technologies.length > 0) setSelectedTech(stage.technologies[0]);
                }}
                className="badge"
                style={{
                  fontSize: '13px',
                  padding: '10px 20px',
                  borderRadius: '87.5px',
                  background: active ? 'var(--color-graphite)' : PAPER,
                  color: active ? '#fff' : INK,
                  border: `1px solid ${active ? 'var(--color-graphite)' : HAZE}`,
                  cursor: 'pointer',
                }}
              >
                {stage.name.split(':')[0]}
              </button>
            );
          })}
        </div>

        {/* stage info bar */}
        <div className="card reveal-init" style={{ padding: '20px 24px', display: 'flex', gap: '32px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
          <div>
            <div style={labelStyle}>Stage</div>
            <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em' }}>{activeStage.name}</div>
          </div>
          <div>
            <div style={labelStyle}>TRL Range</div>
            <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em', color: INDIGO }}>{activeStage.trlRange}</div>
          </div>
          <div>
            <div style={labelStyle}>Patents Filed</div>
            <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em' }}>{activeStage.patentCount}+</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={labelStyle}>Focus</div>
            <div style={{ fontSize: '14px', letterSpacing: '-0.02em', color: GRAPHITE, lineHeight: 1.4 }}>{activeStage.description}</div>
          </div>
        </div>

        {/* explorer: tech list + side detail panel */}
        <div className="tech-mapping-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 7fr)', gap: '16px', alignItems: 'start' }}>
          {/* tech list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeStage.technologies.map((tech) => {
              const selected = selectedTech?.name === tech.name;
              const g = gapColors[tech.gapStatus] || { bg: 'var(--color-haze)', color: GRAPHITE };
              return (
                <button
                  key={tech.name}
                  onClick={() => setSelectedTech(tech)}
                  aria-pressed={selected}
                  style={{
                    fontFamily: 'var(--font-aeonik)',
                    textAlign: 'left',
                    padding: '16px 20px',
                    borderRadius: '15px',
                    background: selected ? 'var(--color-graphite)' : PAPER,
                    border: `1px solid ${selected ? 'var(--color-graphite)' : HAZE}`,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.02em', color: selected ? '#fff' : INK, lineHeight: 1.3 }}>{tech.name}</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '3px', background: selected ? 'rgba(255,255,255,0.15)' : g.bg, color: selected ? '#fff' : g.color, whiteSpace: 'nowrap' }}>TRL {tech.trl}</div>
                  </div>
                  <div style={{ fontSize: '12px', letterSpacing: '-0.02em', color: selected ? 'rgba(255,255,255,0.65)' : GRAPHITE, marginTop: '4px', textTransform: 'uppercase', fontWeight: 500 }}>{tech.gapStatus}</div>
                </button>
              );
            })}
          </div>

          {/* side detail panel */}
          {selectedTech && (
            <div className="card tech-detail-panel reveal-init" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
              <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '3px', background: gap.bg, color: gap.color, marginBottom: '16px' }}>{selectedTech.gapStatus}</div>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 500, letterSpacing: '-0.02em', color: INK, margin: '0 0 12px', lineHeight: 1.2 }}>{selectedTech.name}</h2>
              <p style={{ fontSize: '14px', letterSpacing: '-0.02em', color: GRAPHITE, lineHeight: 1.5, margin: '0 0 20px' }}>{selectedTech.description}</p>
              <div style={{ height: '1px', background: HAZE, marginBottom: '16px' }} />
              <div style={labelStyle}>Technology Gap Analysis</div>
              <p style={{ fontSize: '14px', letterSpacing: '-0.02em', color: INK, lineHeight: 1.5, margin: '0 0 20px' }}>{selectedTech.gapDetail}</p>
              {/* TRL meter */}
              <div style={labelStyle}>India Readiness — TRL {selectedTech.trl}/9</div>
              <div style={{ height: '8px', borderRadius: '99px', background: 'var(--color-haze)', overflow: 'hidden', marginBottom: '16px' }} role="progressbar" aria-valuenow={selectedTech.trl} aria-valuemin={0} aria-valuemax={9} aria-label={`${selectedTech.name} TRL ${selectedTech.trl} of 9`}>
                <div style={{ width: `${(selectedTech.trl / 9) * 100}%`, height: '100%', borderRadius: '99px', background: INDIGO }} />
              </div>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                <div>
                  <div style={labelStyle}>Patents</div>
                  <div style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: INDIGO }}>{selectedTech.patents}</div>
                </div>
                <div>
                  <div style={labelStyle}>India TRL</div>
                  <div style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: INK }}>{selectedTech.trl}/9</div>
                </div>
                <div>
                  <div style={labelStyle}>Stage</div>
                  <div style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '-0.02em', color: GRAPHITE }}>{activeStage.name.split(':')[0]}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* cross-link row: mineral dossiers */}
        <div className="card reveal-init" style={{ marginTop: '24px', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.02em', color: INK }}>
              See how each stage performs per mineral
            </div>
            <Link to="/minerals" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: INDIGO, fontWeight: 500, textDecoration: 'none' }}>
              View mineral dossiers <ArrowUpRight style={{ width: '14px', height: '14px' }} />
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[...CRITICAL_MINERALS].sort((a, b) => a.priorityRank - b.priorityRank).map((m) => (
              <Link
                key={m.id}
                to={`/mineral/${m.id}`}
                className="badge badge-indigo"
                style={{ textDecoration: 'none', fontSize: '12.5px', padding: '8px 14px' }}
              >
                {m.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
