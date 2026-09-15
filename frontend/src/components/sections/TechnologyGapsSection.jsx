// Technology Gaps & Emerging Areas Strategic Radar
// Diagnoses India's domestic readiness gaps against the global state-of-the-art

import React, { useState } from 'react';
import ScrollReveal from '../common/ScrollReveal';
import { TECHNOLOGY_GAPS } from '../../data/mineralsData';
import { ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
export default function TechnologyGapsSection() {
  const [selectedGap, setSelectedGap] = useState(TECHNOLOGY_GAPS[0]);

  const emergingAreas = [
    {
      title: 'Deep Eutectic Solvents (DES) Leaching',
      domain: 'Circular Battery Extraction',
      readiness: 'TRL 4 (Lab Demo)',
      advantage: 'Zero toxic acid mist emissions, ambient pressure processing with biodegradable ionic analogues.',
      activeInstitutes: ['IIT Bombay', 'CSIR-NML'],
    },
    {
      title: 'Garnet Solid-State Electrolytes (LLZO)',
      domain: 'Next-Gen Energy Storage',
      readiness: 'TRL 3 (Coin Cell Prototype)',
      advantage: 'Eliminates battery fire risk and enables pure lithium metal anodes with >450 Wh/kg energy density.',
      activeInstitutes: ['IISc Bangalore', 'ARCI Hyderabad'],
    },
    {
      title: 'Hydrogen Decrepitation (HD) Magnet Rejuvenation',
      domain: 'Rare Earth Strategic Recycling',
      readiness: 'TRL 5 (Bench Pilot)',
      advantage: '80% lower carbon footprint than mining virgin monazite sands; direct grain boundary addition.',
      activeInstitutes: ['BARC Mumbai', 'CSIR-IMMT'],
    },
    {
      title: 'Silicon-Graphene Anode Nano-Architecture',
      domain: 'Fast EV Charging',
      readiness: 'TRL 5 (Pilot Pouch Cell)',
      advantage: 'Accommodates 300% silicon volume expansion while providing 1,200 mAh/g specific capacity.',
      activeInstitutes: ['IIT Madras', 'Tata Steel R&D'],
    },
  ];

  const handleGapSelect = (gap) => {

    setSelectedGap(gap);
  };

  return (
    <section id="gaps" className="section-spacing" style={{ background: "var(--color-lavender-mist)", padding: "80px 0", width: "100%", overflowX: "clip", boxSizing: "border-box" }}>
      <div className="page-container" style={{ maxWidth: "1360px", display: "flex", flexDirection: "column", gap: "40px", width: "100%", boxSizing: "border-box" }}>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-sans text-rose-600 uppercase tracking-widest font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>STRATEGIC VULNERABILITY RADAR &amp; OPPORTUNITY MATRIX</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium font-display text-[var(--color-ink)] tracking-tight">
              TECHNOLOGY GAPS &amp; EMERGING AREAS
            </h2>
          </div>

          <ScrollReveal
            baseOpacity={0.15}
            enableBlur={true}
            baseRotation={0}
            blurStrength={6}
            containerClassName="section-reveal"
            textClassName="section-reveal-text font-sans"
          >
            Benchmarking India's domestic capabilities against global technology frontiers to identify critical supply bottlenecks, import exposures, and high-impact R&amp;D whitespaces.
          </ScrollReveal>
        </div>

        {/* Core Technology Gaps: Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" style={{ width: "100%", minWidth: 0 }}>
          {/* Left: Gap Selector Cards (7 cols) */}
          <div className="lg:col-span-7" style={{ minWidth: 0, width: "100%" }}>
            <div className="text-xs font-sans text-[var(--color-graphite)] uppercase tracking-wider font-semibold mb-3">
              Critical Domestic Technology Gaps (TRL Deficits)
            </div>

            {TECHNOLOGY_GAPS.map((gap) => {
              const isSelected = selectedGap?.id === gap.id;
              const trlGap = gap.globalTRL - gap.indiaTRL;

              return (
                <div
                  key={gap.id}
                  onClick={() => handleGapSelect(gap)}
                  className={`gap-card ${isSelected ? 'selected' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-base font-medium font-display text-[var(--color-ink)] leading-tight">
                        {gap.title}
                      </div>
                      <div className="text-xs text-[var(--color-graphite)] font-sans mt-1">
                        MINERAL: <span className="text-[var(--color-ink)] font-semibold">{gap.mineral.toUpperCase()}</span> • IMPORT: <span className="text-rose-600 font-semibold">{gap.importDependency}</span>
                      </div>
                    </div>

                    <span className="badge badge-rose text-xs font-sans font-semibold shrink-0 px-3 py-1">
                      GAP: -{trlGap} TRL
                    </span>
                  </div>

                  {/* Visual TRL Comparison Gauge */}
                  <div className="mt-4 pt-3 border-t border-[var(--color-haze)] space-y-2">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-[var(--color-graphite)]">
                        India Readiness: <strong className="text-[var(--color-electric-indigo)] font-bold">TRL {gap.indiaTRL}/9</strong>
                      </span>
                      <span className="text-[var(--color-graphite)]">
                        Global Benchmark: <strong className="text-emerald-700 font-bold">TRL {gap.globalTRL}/9</strong>
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-[var(--color-haze)] rounded-full overflow-hidden flex shadow-inner">
                      <div
                        className="h-full bg-[var(--color-electric-indigo)] rounded-l-full transition-all duration-500"
                        style={{ width: `${(gap.indiaTRL / 9) * 100}%` }}
                      />
                      <div
                        className="h-full bg-rose-400/80 transition-all duration-500"
                        style={{ width: `${(trlGap / 9) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Gap Diagnostic Dossier (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24" style={{ minWidth: 0, width: "100%" }}>
            {selectedGap && (
              <div className="dossier-card space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--color-haze)] pb-4">
                  <span className="font-sans text-xs text-[var(--color-graphite)] uppercase tracking-wider font-semibold">
                    Gap Diagnostic Card
                  </span>
                  <span className="badge badge-rose font-sans text-xs font-bold px-3 py-1">
                    RISK: {selectedGap.vulnerabilityLevel.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-medium font-display text-[var(--color-ink)] leading-snug">
                    {selectedGap.title}
                  </h3>
                  <div className="text-xs text-rose-600 font-sans font-semibold mt-1">
                    PRIMARY IMPORT EXPOSURE: {selectedGap.importDependency}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-sans text-[var(--color-graphite)] uppercase font-semibold">
                    Core Technical Bottleneck:
                  </div>
                  <p className="text-xs text-[var(--color-ink)] leading-relaxed bg-[var(--color-lavender-mist)] p-3.5 rounded-xl border border-[var(--color-haze)] font-medium">
                    {selectedGap.coreBottleNeck}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-sans text-[var(--color-graphite)] uppercase font-semibold">
                    Global Frontier Leaders:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedGap.globalFrontierLeaders.map((leader) => (
                      <span key={leader} className="partner-chip">
                        {leader}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-sans text-emerald-800 font-bold uppercase">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Recommended Policy &amp; R&amp;D Intervention</span>
                  </div>
                  <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                    {selectedGap.recommendedAction}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emerging Frontiers Radar (4 Cards) */}
        <div className="space-y-4 pt-6">
          <div className="flex items-center gap-2 text-xs font-sans text-[var(--color-electric-indigo)] uppercase tracking-wider font-bold">
            <Sparkles className="w-4 h-4" />
            <span>High-Impact Emerging R&amp;D Frontiers in India</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergingAreas.map((area) => (
              <div
                key={area.title}
                className="card card-interactive space-y-3 p-5 bg-white border border-[var(--color-haze)] rounded-2xl flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="badge badge-indigo font-sans text-[10px] font-semibold px-2.5 py-0.5">
                    {area.domain}
                  </span>

                  <div className="font-medium text-sm font-display text-[var(--color-ink)] leading-snug">
                    {area.title}
                  </div>

                  <p className="text-xs text-[var(--color-graphite)] leading-relaxed">
                    {area.advantage}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-haze)] flex items-center justify-between text-[11px] font-sans">
                  <span className="text-emerald-700 font-bold">{area.readiness}</span>
                  <span className="text-[var(--color-graphite)] font-medium">{area.activeInstitutes.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

