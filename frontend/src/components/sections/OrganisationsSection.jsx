// Leading Organisations & Institutional Network Analytics
// Benchmarking India's top patent-generating institutes and research centers

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../common/ScrollReveal';
import { LEADING_ORGANISATIONS } from '../../data/mineralsData';
import { Building2, Award, Network, BookOpen, ChevronRight, ExternalLink, Sparkles, FileText, ArrowUpRight } from 'lucide-react';
export default function OrganisationsSection() {
  const [selectedOrg, setSelectedOrg] = useState(LEADING_ORGANISATIONS[0]);
  const [filterType, setFilterType] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All Entities' },
    { id: 'csir', label: 'CSIR & National Labs' },
    { id: 'academic', label: 'IITs & Academia' },
    { id: 'psu', label: 'Strategic PSUs & DAE' },
  ];

  const filteredOrgs = LEADING_ORGANISATIONS.filter((org) => {
    if (filterType === 'csir') return org.id.startsWith('csir');
    if (filterType === 'academic') return org.id.startsWith('iit');
    if (filterType === 'psu') return org.id === 'barc' || org.id === 'irel' || org.id === 'c-met' || org.id === 'tata-steel';
    return true;
  });

  const handleOrgClick = (org) => {

    setSelectedOrg(org);
  };

  const handleFilterClick = (id) => {

    setFilterType(id);
  };

  return (
    <section id="organisations" className="section-spacing" style={{ background: "var(--color-lavender-mist)", padding: "80px 0", width: "100%", overflowX: "clip", boxSizing: "border-box" }}>
      <div className="page-container" style={{ maxWidth: "1360px", display: "flex", flexDirection: "column", gap: "40px", width: "100%", boxSizing: "border-box" }}>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-sans text-[var(--color-electric-indigo)] uppercase tracking-widest font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              <span>INDIAN R&amp;D ECOSYSTEM // LEADING HUBS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium font-display text-[var(--color-ink)] tracking-tight">
              LEADING ORGANISATIONS
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
            Benchmarking India's top patent-generating institutes and research centers, evaluating intellectual property portfolios, citation impacts, and cross-sector consortiums.
          </ScrollReveal>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none" style={{ width: "100%", maxWidth: "100%" }}>
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleFilterClick(opt.id)}
              className={`tab-pill ${filterType === opt.id ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 2-Column Layout: Organisation Directory (7 cols) + Institutional Dossier (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" style={{ width: "100%", minWidth: 0 }}>
          {/* List of Organisations */}
          <div className="lg:col-span-7" style={{ minWidth: 0, width: "100%" }}>
            {filteredOrgs.map((org, index) => {
              const isSelected = selectedOrg?.id === org.id;

              return (
                <div
                  key={org.id}
                  onClick={() => handleOrgClick(org)}
                  className={`org-card ${isSelected ? 'selected' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-sans text-xs font-semibold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[var(--color-electric-indigo)] text-white'
                          : 'bg-[var(--color-lavender-mist)] text-[var(--color-electric-indigo)]'
                      }`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <div className="text-base font-medium font-display text-[var(--color-ink)] leading-tight">
                          {org.name}
                        </div>
                        <div className="text-xs text-[var(--color-graphite)] font-sans mt-1">
                          {org.location} • <span className="text-[var(--color-ink)] font-medium">{org.type}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-sans text-xs">
                      <span className="badge badge-indigo font-semibold px-3 py-1">{org.patentsCount} Patents</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-[var(--color-haze)]">
                    {org.topMinerals.map((mineral) => (
                      <span key={mineral} className="mineral-chip">
                        {mineral}
                      </span>
                    ))}
                    <span className="text-xs font-sans text-[var(--color-electric-indigo)] ml-auto font-semibold">
                      TRL: {org.trlSpecialization}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Organisation Detail Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24" style={{ minWidth: 0, width: "100%" }}>
            {selectedOrg && (
              <div className="dossier-card space-y-5">
                <div className="flex items-center justify-between border-b border-[var(--color-haze)] pb-4">
                  <span className="font-sans text-xs text-[var(--color-graphite)] uppercase tracking-wider font-semibold">
                    Institutional Profile
                  </span>
                  <span className="badge badge-emerald font-semibold px-3 py-1">
                    Impact: {selectedOrg.citationImpact} / 5.0
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-medium font-display text-[var(--color-ink)] leading-snug">
                    {selectedOrg.name}
                  </h3>
                  <div className="text-xs text-[var(--color-graphite)] font-sans mt-1">
                    {selectedOrg.location}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 font-sans">
                  <div className="stat-box-dossier">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-graphite)] block font-semibold">INDIAN PATENTS</span>
                    <span className="text-2xl font-bold font-display text-[var(--color-electric-indigo)] mt-1 block">{selectedOrg.patentsCount}</span>
                  </div>
                  <div className="stat-box-dossier">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-graphite)] block font-semibold">RESEARCH ARTICLES</span>
                    <span className="text-2xl font-bold font-display text-[var(--color-ink)] mt-1 block">{selectedOrg.activeResearchPapers}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-sans text-[var(--color-graphite)] uppercase font-semibold">
                    Flagship Technology Breakthrough:
                  </div>
                  <p className="text-xs text-[var(--color-ink)] leading-relaxed bg-[var(--color-lavender-mist)] p-3.5 rounded-xl border border-[var(--color-haze)] font-medium">
                    {selectedOrg.flagshipTech}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-sans text-[var(--color-graphite)] uppercase font-semibold">
                    <Network className="w-3.5 h-3.5 text-[var(--color-electric-indigo)]" />
                    <span>Consortium &amp; Industry Partners:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrg.networkPartners.map((partner) => (
                      <span key={partner} className="partner-chip">
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Links */}
                <div className="pt-3 border-t border-[var(--color-haze)] flex items-center gap-3">
                  <Link
                    to={`/patents?search=${encodeURIComponent(selectedOrg.name.split(' ')[0])}`}
                    className="btn-pill btn-pill-indigo flex-1 justify-center text-xs h-11 gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Patents</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    to={`/research?search=${encodeURIComponent(selectedOrg.name.split(' ')[0])}`}
                    className="btn-pill btn-pill-ghost flex-1 justify-center text-xs h-11 gap-1.5 border border-[var(--color-haze)] bg-[var(--color-paper-white)] hover:border-[var(--color-graphite)]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Research</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

