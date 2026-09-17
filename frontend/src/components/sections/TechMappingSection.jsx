// Technology Value Chain Mapping — Lusion light theme
import React, { useState } from 'react';
import ScrollReveal from '../common/ScrollReveal';
import { VALUE_CHAIN_STAGES } from '../../data/mineralsData';

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

const sectionStyle = {
  background: 'var(--color-lavender-mist)',
  padding: 'clamp(48px, 8vw, 72px) clamp(20px, 5vw, 40px)',
};

const labelStyle = {
  fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em',
  textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px',
};

export default function TechMappingSection() {
  const [activeStageId, setActiveStageId] = useState('upstream');
  const [selectedTech, setSelectedTech] = useState(VALUE_CHAIN_STAGES[0].technologies[0]);

  const activeStage = VALUE_CHAIN_STAGES.find((s) => s.id === activeStageId) || VALUE_CHAIN_STAGES[0];
  const gap = gapColors[selectedTech?.gapStatus] || { bg: 'var(--color-haze)', color: 'var(--color-graphite)' };

  return (
    <section id="mapping" style={sectionStyle}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={labelStyle}>End-to-End Value Chain Architecture</div>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 50px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)', lineHeight: 1.1 }}>
            Technology Mapping
          </h2>
          <ScrollReveal
            baseOpacity={0.15}
            enableBlur={true}
            baseRotation={0}
            blurStrength={6}
            containerClassName="section-reveal"
            textClassName="section-reveal-text section-reveal-lg"
          >
            Explore the end-to-end critical mineral value chain — from extraction through recycling — mapped against Indian TRL levels and patent activity.
          </ScrollReveal>
        </div>

        {/* Stage tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {VALUE_CHAIN_STAGES.map((stage) => {
            const active = stage.id === activeStageId;
            return (
              <button
                key={stage.id}
                onClick={() => {
                  setActiveStageId(stage.id);
                  if (stage.technologies.length > 0) setSelectedTech(stage.technologies[0]);
                }}
                style={{
                  fontFamily: 'var(--font-aeonik)',
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: '87.5px',
                  background: active ? 'var(--color-graphite)' : 'var(--color-paper-white)',
                  color: active ? '#fff' : 'var(--color-ink)',
                  border: `1px solid ${active ? 'var(--color-graphite)' : 'var(--color-haze)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {stage.name.split(':')[0]}
              </button>
            );
          })}
        </div>

        {/* Stage info bar */}
        <div style={{
          background: 'var(--color-paper-white)',
          borderRadius: '15px',
          padding: '20px 24px',
          border: '1px solid var(--color-haze)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          gap: '32px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          alignItems: 'center',
        }}>
          <div>
            <div style={labelStyle}>Stage</div>
            <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em' }}>{activeStage.name}</div>
          </div>
          <div>
            <div style={labelStyle}>TRL Range</div>
            <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-electric-indigo)' }}>{activeStage.trlRange}</div>
          </div>
          <div>
            <div style={labelStyle}>Patents Filed</div>
            <div style={{ fontSize: '16px', fontWeight: 500, letterSpacing: '-0.02em' }}>{activeStage.patentCount}+</div>
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={labelStyle}>Focus</div>
            <div style={{ fontSize: '14px', letterSpacing: '-0.02em', color: 'var(--color-graphite)', lineHeight: 1.4 }}>{activeStage.description}</div>
          </div>
        </div>

        {/* Technologies + detail — stacks on phones */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px' }}>
          {/* Tech list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeStage.technologies.map((tech) => {
              const selected = selectedTech?.name === tech.name;
              const g = gapColors[tech.gapStatus] || { bg: 'var(--color-haze)', color: 'var(--color-graphite)' };
              return (
                <button
                  key={tech.name}
                  onClick={() => setSelectedTech(tech)}
                  style={{
                    fontFamily: 'var(--font-aeonik)',
                    textAlign: 'left',
                    padding: '16px 20px',
                    borderRadius: '15px',
                    background: selected ? 'var(--color-graphite)' : 'var(--color-paper-white)',
                    border: `1px solid ${selected ? 'var(--color-graphite)' : 'var(--color-haze)'}`,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '-0.02em', color: selected ? '#fff' : 'var(--color-ink)', lineHeight: 1.3 }}>{tech.name}</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '3px', background: selected ? 'rgba(255,255,255,0.15)' : g.bg, color: selected ? '#fff' : g.color, whiteSpace: 'nowrap' }}>TRL {tech.trl}</div>
                  </div>
                  <div style={{ fontSize: '12px', letterSpacing: '-0.02em', color: selected ? 'rgba(255,255,255,0.65)' : 'var(--color-graphite)', marginTop: '4px', textTransform: 'uppercase', fontWeight: 500 }}>{tech.gapStatus}</div>
                </button>
              );
            })}
          </div>

          {/* Selected tech detail */}
          {selectedTech && (
            <div style={{ background: 'var(--color-paper-white)', borderRadius: '15px', padding: '24px', border: '1px solid var(--color-haze)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'inline-block', fontSize: '11px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '3px', background: gap.bg, color: gap.color, marginBottom: '16px' }}>{selectedTech.gapStatus}</div>
              <h3 style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: '12px', lineHeight: 1.2 }}>{selectedTech.name}</h3>
              <p style={{ fontSize: '14px', letterSpacing: '-0.02em', color: 'var(--color-graphite)', lineHeight: 1.5, marginBottom: '20px' }}>{selectedTech.description}</p>
              <div style={{ height: '1px', background: 'var(--color-haze)', marginBottom: '16px' }} />
              <div style={labelStyle}>Technology Gap Analysis</div>
              <p style={{ fontSize: '14px', letterSpacing: '-0.02em', color: 'var(--color-ink)', lineHeight: 1.5, marginBottom: '16px' }}>{selectedTech.gapDetail}</p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div>
                  <div style={labelStyle}>Patents</div>
                  <div style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-electric-indigo)' }}>{selectedTech.patents}</div>
                </div>
                <div>
                  <div style={labelStyle}>India TRL</div>
                  <div style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>{selectedTech.trl}/9</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

