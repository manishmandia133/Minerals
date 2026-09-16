// Hero Section — Lusion light-theme gallery style
// Centered headline + full-width cinematic video in 100px-radius container

import React from 'react';
import ScrollReveal from '../common/ScrollReveal';
import FoldText from '../common/FoldText';
import CountUp from '../bits/CountUp';
import { CRITICAL_MINERALS, PLATFORM_STATS } from '../../data/mineralsData';

const s = {
  section: {
    paddingTop: '120px',
    paddingBottom: '72px',
    background: 'var(--color-lavender-mist)',
    width: '100%',
    overflowX: 'clip',
    boxSizing: 'border-box',
  },
  inner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 40px',
    width: '100%',
    boxSizing: 'border-box',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
    color: 'var(--color-graphite)',
    textAlign: 'center',
    marginBottom: '20px',
  },
  headline: {
    fontSize: 'clamp(38px, 5vw, 72px)',
    fontWeight: 500,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    color: 'var(--color-ink)',
    textAlign: 'center',
    marginBottom: '16px',
  },
  viewerWrap: {
    borderRadius: '80px',
    overflow: 'hidden',
    width: '100%',
    height: '560px',
    background: 'radial-gradient(ellipse at 50% 40%, #161a2e 0%, #0c0e18 100%)',
    position: 'relative',
    marginBottom: '24px',
    boxShadow: '0 24px 48px -12px rgba(13, 14, 22, 0.18)',
    border: '1px solid rgba(228, 230, 239, 0.6)',
  },
  scrollHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
    color: 'var(--color-ink)',
  },
};

export default function HeroSection({ activeMineral, setActiveMineral, patentCount, researchCount }) {
  const currentMineral = CRITICAL_MINERALS.find((m) => m.id === activeMineral) || CRITICAL_MINERALS[0];

  return (
    <section id="hero" style={s.section}>
      <div style={s.inner}>
        {/* Eyebrow */}
        <p style={s.eyebrow}>
          National Critical Minerals Mission · India · 30 Notified Minerals
        </p>

        {/* Headline */}
        <h1 style={s.headline}>
          <FoldText
            text={'Smart Technology &\nPatent Tracker'}
            splitBy="word"
            hinge="top"
            trigger="mount"
            duration={0.7}
            stagger={0.08}
            ease="power3.out"
            perspective={700}
            creaseShading={0.4}
            fontSize="clamp(38px, 5vw, 72px)"
            fontWeight={500}
            color="var(--color-ink)"
            style={{ lineHeight: 1.05, letterSpacing: '-0.02em' }}
          />
        </h1>
        <ScrollReveal
          baseOpacity={0.15}
          enableBlur={true}
          baseRotation={3}
          blurStrength={6}
          containerClassName="hero-reveal"
          textClassName="hero-reveal-text"
        >
          Mapping Indian patent activity, R&amp;D leadership, technology readiness, and strategic gaps across critical minerals.
        </ScrollReveal>

        {/* Full-width cinematic video — 100px radius */}
        <div style={s.viewerWrap}>
          <video
            className="reveal-init reveal-active"
            src={`${import.meta.env.BASE_URL}videos/reel-desktop.mp4`}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        {/* Scroll indicator */}
        <div style={s.scrollHint}>
          <span>+</span>
          <span>Scroll to Explore</span>
          <span>+</span>
        </div>

        {/* Mineral selector row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '32px', justifyContent: 'center' }}>
          {CRITICAL_MINERALS.slice(0, 6).map((m) => {
            const isActive = activeMineral === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMineral(m.id)}
                style={{
                  fontFamily: 'var(--font-aeonik)',
                  fontSize: '13px',
                  fontWeight: 500,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  padding: '10px 20px',
                  borderRadius: '87.5px',
                  background: isActive ? 'var(--color-graphite)' : 'var(--color-paper-white)',
                  color: isActive ? '#fff' : 'var(--color-ink)',
                  border: `1px solid ${isActive ? 'var(--color-graphite)' : 'var(--color-haze)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {m.name}
              </button>
            );
          })}
        </div>

        {/* Active mineral info card */}
        <div style={{
          marginTop: '32px',
          background: 'var(--color-paper-white)',
          borderRadius: '15px',
          padding: '24px',
          border: '1px solid var(--color-haze)',
          boxShadow: 'var(--shadow-md)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '24px',
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '6px' }}>Mineral</div>
            <div style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>{currentMineral.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '6px' }}>Import Risk</div>
            <div style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: '#dc2626' }}>{currentMineral.importDependency}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '6px' }}>India TRL</div>
            <div style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-electric-indigo)' }}>TRL {currentMineral.currentIndiaTRL}/9</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '6px' }}>Indian Patents</div>
            <div style={{ fontSize: '22px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>{currentMineral.patentsCount}+</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '6px' }}>Key Occurrences</div>
            <div style={{ fontSize: '14px', letterSpacing: '-0.02em', color: 'var(--color-ink)', lineHeight: 1.4 }}>{currentMineral.keyIndianOccurrences.join(' · ')}</div>
          </div>
        </div>

        {/* Platform stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          background: 'var(--color-haze)',
          borderRadius: '15px',
          overflow: 'hidden',
          marginTop: '16px',
        }}>
          {[
            { label: 'Patents Tracked', value: <><CountUp to={patentCount ?? PLATFORM_STATS.totalPatentsTracked} separator="," duration={1.8} />+</> },
            { label: 'Research Works', value: <><CountUp to={researchCount ?? PLATFORM_STATS.totalResearchArticles} separator="," duration={1.8} />+</> },
            { label: 'Critical Minerals', value: <CountUp to={PLATFORM_STATS.notifiedMinerals} duration={1.4} /> },
            { label: 'R&D Institutions', value: <CountUp to={PLATFORM_STATS.activeRndInstitutions} duration={1.4} /> },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'var(--color-paper-white)',
              padding: '20px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '26px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '-0.02em', textTransform: 'uppercase', color: 'var(--color-graphite)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
