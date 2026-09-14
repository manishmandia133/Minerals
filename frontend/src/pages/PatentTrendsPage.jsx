// Patent Trends & Velocity Page — Dedicated Full-Page Analytics & Strategic Forecasting
// Pure Lusion light aesthetic: Lavender Mist canvas, paper-white cards, Electric Indigo accent

import React, { useState } from 'react';
import { ANNUAL_TRENDS, LEADING_ORGANISATIONS, PLATFORM_STATS } from '../data/mineralsData';
import { useScrollReveal } from '../components/common/useScrollReveal';
import {
  TrendingUp,
  BarChart3,
  Users,
  PieChart,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Sparkles,
  Gauge,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PatentTrendsPage() {
  const [activeYearIndex, setActiveYearIndex] = useState(ANNUAL_TRENDS.length - 1);
  const [selectedVelocityDomain, setSelectedVelocityDomain] = useState('all');

  useScrollReveal();

  const activeYearData = ANNUAL_TRENDS[activeYearIndex];
  const maxPatents = Math.max(...ANNUAL_TRENDS.map((t) => t.patents));
  const maxResearch = Math.max(...ANNUAL_TRENDS.map((t) => t.research));

  const mineralBreakdown = [
    { name: 'Lithium & Li-Ion Batteries', share: 44, color: '#1a2ffb', count: 550, velocity: '+42% YoY', trl: 'TRL 5-7' },
    { name: 'Rare Earth Elements (Nd/Dy)', share: 20, color: '#f59e0b', count: 250, velocity: '+28% YoY', trl: 'TRL 6-7' },
    { name: 'Graphite & Anode Nanotech', share: 15, color: '#10b981', count: 187, velocity: '+24% YoY', trl: 'TRL 6' },
    { name: 'Cobalt & Nickel Chemistries', share: 13, color: '#8b5cf6', count: 162, velocity: '+19% YoY', trl: 'TRL 5-8' },
    { name: 'Titanium, Gallium & Semis', share: 8, color: '#06b6d4', count: 101, velocity: '+15% YoY', trl: 'TRL 6-7' },
  ];

  const applicantDynamics = [
    { entity: 'CSIR National Labs (NML, IMMT, CSMCRI)', share: 38, count: '480 Patents', color: '#1a2ffb', tag: 'Sovereign R&D' },
    { entity: 'IITs & Academic Institutes (Bombay, Madras, IISc)', share: 26, count: '325 Patents', color: '#10b981', tag: 'Academic IP' },
    { entity: 'Domestic Corporate Leaders (Tata, Vedanta, Hindalco)', share: 18, count: '228 Patents', color: '#f59e0b', tag: 'Industrial' },
    { entity: 'Foreign Entities Filing in Indian Patent Office', share: 18, count: '227 Patents', color: '#8b5cf6', tag: 'MNCs & Global' },
  ];

  return (
    <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '90px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* Page Top Header */}
        <div style={{ marginBottom: '36px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-indigo">
              <TrendingUp style={{ width: '12px', height: '12px' }} />
              National Critical Minerals Mission // Patent Trajectory
            </span>
            <span className="badge">IPO Jurisdictional Velocity</span>
            <span className="badge badge-emerald">2016 – 2026 Decade Horizon</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '42px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--color-ink)' }}>
                Patent Trends &amp; Velocity
              </h1>
              <p style={{ color: 'var(--color-graphite)', fontSize: '15px', marginTop: '8px', maxWidth: '680px' }}>
                Multi-year filing trajectories, TRL acceleration dynamics, and institutional leadership data capturing India's rapid rise in critical minerals intellectual property.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link
                to="/chat?query=Summarize+the+decade+patent+trends+for+critical+minerals"
                className="btn-pill"
                style={{ padding: '10px 20px', fontSize: '12px' }}
              >
                <Sparkles style={{ width: '13px', height: '13px' }} />
                <span>AI Trends Analysis</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Velocity KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
          className="reveal-init"
        >
          <div className="card card-interactive" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              10-Year Filing CAGR
            </div>
            <div style={{ fontSize: '32px', fontWeight: 500, color: 'var(--color-electric-indigo)', marginTop: '4px' }}>
              +27.3%
            </div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp style={{ width: '12px', height: '12px' }} />
              Surge from 112 (2016) to 1,250 (2026)
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Peak Velocity Mineral
            </div>
            <div style={{ fontSize: '32px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '4px' }}>
              Lithium (+42%)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '4px' }}>
              44% of total national filings in 2026
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Domestic Sovereign IP
            </div>
            <div style={{ fontSize: '32px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '4px' }}>
              84.0%
            </div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
              Indigenous CSIR, IIT &amp; Industry ratio
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Active Scientific Papers
            </div>
            <div style={{ fontSize: '32px', fontWeight: 500, color: 'var(--color-electric-indigo)', marginTop: '4px' }}>
              4,950+
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '4px' }}>
              OpenAlex peer-reviewed publications
            </div>
          </div>
        </div>

        {/* Main Annual Trajectory Interactive Bar Chart */}
        <div className="card reveal-init" style={{ padding: '32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <BarChart3 style={{ width: '18px', height: '18px', color: 'var(--color-electric-indigo)' }} />
                <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  Annual Filing &amp; Research Trajectory (2016 – 2026)
                </h2>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-graphite)' }}>
                Comparing annual patent filings at the Indian Patent Office (IPO) against indexed OpenAlex research publications.
              </p>
            </div>

            {/* Selected Year KPI Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '10px 20px',
                borderRadius: '16px',
                background: 'var(--color-lavender-mist)',
                border: '1px solid var(--color-haze)',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-graphite)', display: 'block' }}>
                  Year
                </span>
                <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {activeYearData.year}
                </span>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-haze)' }} />
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-graphite)', display: 'block' }}>
                  IPO Patents
                </span>
                <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-electric-indigo)' }}>
                  {activeYearData.patents}
                </span>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-haze)' }} />
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-graphite)', display: 'block' }}>
                  Research Papers
                </span>
                <span style={{ fontSize: '16px', fontWeight: 500, color: '#059669' }}>
                  {activeYearData.research}
                </span>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--color-haze)' }} />
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-graphite)', display: 'block' }}>
                  Domestic Share
                </span>
                <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  {activeYearData.domesticShare}%
                </span>
              </div>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div style={{ paddingTop: '20px', paddingBottom: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '12px',
                height: '280px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--color-haze)',
              }}
            >
              {ANNUAL_TRENDS.map((trend, idx) => {
                const isSelected = idx === activeYearIndex;
                const patentHeight = (trend.patents / maxPatents) * 100;
                const researchHeight = (trend.research / maxResearch) * 100;

                return (
                  <div
                    key={trend.year}
                    onClick={() => {
                      setActiveYearIndex(idx);

                    }}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '100%',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Tooltip on active */}
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: isSelected ? 'var(--color-electric-indigo)' : 'var(--color-graphite)',
                        marginBottom: '6px',
                        transition: 'opacity 0.2s',
                        opacity: isSelected ? 1 : 0.6,
                      }}
                    >
                      {trend.patents}
                    </div>

                    {/* Dual bar pillar */}
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '46px',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '4px',
                        borderRadius: '10px 10px 0 0',
                        background: isSelected ? 'rgba(26, 47, 251, 0.05)' : 'transparent',
                        transition: 'background 0.2s',
                      }}
                    >
                      {/* Patent Bar */}
                      <div
                        style={{
                          width: '16px',
                          height: `${patentHeight}%`,
                          borderRadius: '4px 4px 0 0',
                          background: isSelected ? 'var(--color-electric-indigo)' : 'rgba(26, 47, 251, 0.4)',
                          transition: 'all 0.3s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(26, 47, 251, 0.25)' : 'none',
                        }}
                      />

                      {/* Research Bar */}
                      <div
                        style={{
                          width: '12px',
                          height: `${researchHeight * 0.75}%`,
                          borderRadius: '4px 4px 0 0',
                          background: isSelected ? '#10b981' : 'rgba(16, 185, 129, 0.35)',
                          transition: 'all 0.3s ease',
                        }}
                      />
                    </div>

                    {/* Year Label */}
                    <div
                      style={{
                        fontSize: '12px',
                        marginTop: '8px',
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? 'var(--color-ink)' : 'var(--color-graphite)',
                      }}
                    >
                      '{String(trend.year).slice(2)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', marginTop: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-electric-indigo)' }} />
                <span style={{ color: 'var(--color-ink)' }}>Indian Patent Filings (IPO)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
                <span style={{ color: 'var(--color-ink)' }}>Published Research Articles (OpenAlex)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual Grid: Mineral Velocity vs Applicant Ecosystem */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          {/* Mineral Domain Velocity Breakdown */}
          <div className="card reveal-init" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-haze)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  Patent Velocity by Mineral Domain
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '2px' }}>
                  Breakdown of 1,250 annual filings across strategic sectors
                </p>
              </div>
              <span className="badge badge-indigo">2026 Projection</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {mineralBreakdown.map((item) => (
                <div key={item.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{item.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                      <span style={{ color: '#059669', fontWeight: 500 }}>{item.velocity}</span>
                      <span style={{ color: 'var(--color-graphite)' }}>{item.count} patents ({item.share}%)</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--color-haze)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.share}%`,
                        height: '100%',
                        borderRadius: '3px',
                        background: item.color,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '24px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'var(--color-lavender-mist)',
                border: '1px solid var(--color-haze)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '12px',
                color: 'var(--color-graphite)',
              }}
            >
              <Info style={{ width: '16px', height: '16px', color: 'var(--color-electric-indigo)', shrink: 0, marginTop: '2px' }} />
              <span>
                Lithium-related patenting experienced the sharpest inflection (+42% YoY), driven by PLI Advanced Chemistry Cell (ACC) schemes and Reasi deposit beneficiation R&amp;D.
              </span>
            </div>
          </div>

          {/* Ecosystem Share: Domestic vs Foreign */}
          <div className="card reveal-init" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--color-haze)' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-ink)' }}>
                  Ecosystem Share: Domestic vs Foreign
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '2px' }}>
                  Jurisdictional origin of intellectual property filings
                </p>
              </div>
              <span className="badge badge-emerald">82% Domestic Ratio</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {applicantDynamics.map((item) => (
                <div key={item.entity}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                      <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{item.entity}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                      <span className="badge" style={{ fontSize: '10px', padding: '2px 6px' }}>{item.tag}</span>
                      <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>{item.share}%</span>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--color-haze)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${item.share}%`,
                        height: '100%',
                        borderRadius: '3px',
                        background: item.color,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '24px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'var(--color-lavender-mist)',
                border: '1px solid var(--color-haze)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '12px',
                color: 'var(--color-graphite)',
              }}
            >
              <ShieldCheck style={{ width: '16px', height: '16px', color: '#059669', shrink: 0, marginTop: '2px' }} />
              <span>
                Public research institutes (CSIR Labs &amp; IITs) represent 64% of domestic patent generation, anchoring sovereign technological readiness for commercial licensing.
              </span>
            </div>
          </div>
        </div>

        {/* Institutional Leadership Leaderboard */}
        <div className="card reveal-init" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-ink)' }}>
                Institutional Patent Leadership Rankings
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-graphite)', marginTop: '2px' }}>
                Benchmarked by patent volume, citation impact factor, and TRL readiness
              </p>
            </div>

            <Link
              to="/patents"
              className="btn-pill btn-pill-outline"
              style={{ fontSize: '12px', padding: '10px 18px' }}
            >
              <span>View All Associated Patents</span>
              <ArrowUpRight style={{ width: '13px', height: '13px' }} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-haze)', color: 'var(--color-graphite)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '-0.02em' }}>
                  <th style={{ padding: '12px 16px' }}>Rank &amp; Institution</th>
                  <th style={{ padding: '12px 16px' }}>Type</th>
                  <th style={{ padding: '12px 16px' }}>Patent Count</th>
                  <th style={{ padding: '12px 16px' }}>Impact Score</th>
                  <th style={{ padding: '12px 16px' }}>Core Mineral Domains</th>
                  <th style={{ padding: '12px 16px' }}>TRL Specialization</th>
                </tr>
              </thead>
              <tbody>
                {LEADING_ORGANISATIONS.map((org, idx) => (
                  <tr
                    key={org.id}
                    style={{
                      borderBottom: '1px solid var(--color-haze)',
                      transition: 'background 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-lavender-mist)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--color-ink)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--color-electric-indigo)', fontWeight: 600, width: '20px' }}>
                          0{idx + 1}
                        </span>
                        <div>
                          <div>{org.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-graphite)', fontWeight: 400 }}>{org.location}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--color-graphite)' }}>
                      <span className="badge" style={{ fontSize: '11px' }}>{org.type}</span>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--color-electric-indigo)' }}>
                      {org.patentsCount} Filings
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                        {org.citationImpact} / 5.0
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {org.topMinerals.slice(0, 3).map((m) => (
                          <span key={m} style={{ fontSize: '11px', background: 'var(--color-lavender-mist)', padding: '2px 6px', borderRadius: '4px' }}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--color-graphite)', fontWeight: 500 }}>
                      {org.trlSpecialization}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
