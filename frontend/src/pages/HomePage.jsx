// Home Page — Master Landing Page inspired by Lusion.co
// Features 3D Sculpture Hero, Quick Portal Navigators, 3D Simulation Reel, Value Chain Mapping, Leading Orgs, and Technology Gaps

import React, { useState } from 'react';
import HeroSection from '../components/sections/HeroSection';
import TechMappingSection from '../components/sections/TechMappingSection';
import MineralGallerySection from '../components/sections/MineralGallerySection';
import OrganisationsSection from '../components/sections/OrganisationsSection';
import TechnologyGapsSection from '../components/sections/TechnologyGapsSection';
import { useScrollReveal } from '../components/common/useScrollReveal';
import { Link } from 'react-router-dom';
import {
  Database,
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  ChevronRight,
  Zap,
} from 'lucide-react';
export default function HomePage() {
  const [activeMineral, setActiveMineral] = useState('lithium');
  useScrollReveal();

  const handleNavigate = (sectionId) => {
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const portalCards = [
    {
      title: 'Patents Explorer',
      description: 'Searchable Indian Patent Office repository with full patent specifications, IPC classification codes, and verified legal status.',
      path: '/patents',
      badge: '1,420+ Patents',
      icon: Database,
      accent: 'var(--color-electric-indigo)',
    },
    {
      title: 'Research Explorer',
      description: 'Peer-reviewed scientific publications, OpenAlex indexed papers, and laboratory extraction breakthroughs from premier Indian institutions.',
      path: '/research',
      badge: '3,850+ Papers',
      icon: BookOpen,
      accent: '#059669',
    },
    {
      title: 'Trends & Velocity',
      description: 'Interactive decade trajectory analytics (2016-2026), mineral growth speedometers, and domestic vs foreign applicant dynamics.',
      path: '/trends',
      badge: '+27.3% CAGR',
      icon: TrendingUp,
      accent: '#d97706',
    },
    {
      title: 'AI Patent Assistant',
      description: 'Chat with our domain-trained AI intelligence assistant to explore any Indian critical mineral patent, extraction route, or TRL level.',
      path: '/chat',
      badge: 'Interactive AI',
      icon: Sparkles,
      accent: 'var(--color-electric-indigo)',
    },
  ];

  return (
    <div>
      {/* 3D Hero Gallery */}
      <HeroSection
        activeMineral={activeMineral}
        setActiveMineral={setActiveMineral}
        onNavigate={handleNavigate}
      />

      {/* Quick Portals Navigation Section with Scroll Reveal */}
      <section className="reveal-init" style={{ padding: '60px 40px 20px', background: 'var(--color-lavender-mist)' }}>
        <div className="page-container" style={{ maxWidth: '1360px' }}>
          <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-indigo">Platform Portals</span>
                <span className="badge">Dedicated Workspaces</span>
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
                Explore Dedicated Intelligence Modules
              </h2>
            </div>
            <p style={{ color: 'var(--color-graphite)', fontSize: '14px', maxWidth: '480px' }}>
              Access full-screen analytical platforms designed for researchers, patent attorneys, mining executives, and policy architects.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {portalCards.map((portal, idx) => {
              const Icon = portal.icon;

              return (
                <Link
                  key={portal.title}
                  to={portal.path}
                  className={`card card-interactive reveal-init stagger-${idx + 1}`}
                  style={{
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '28px',
                    border: '1px solid var(--color-haze)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'var(--color-lavender-mist)',
                          border: '1px solid var(--color-haze)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: portal.accent,
                        }}
                      >
                        <Icon style={{ width: '20px', height: '20px' }} />
                      </div>
                      <span className="badge" style={{ fontSize: '11px' }}>
                        {portal.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '19px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '8px' }}>
                      {portal.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--color-graphite)', lineHeight: 1.55 }}>
                      {portal.description}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--color-electric-indigo)',
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--color-haze)',
                    }}
                  >
                    <span>Launch Module</span>
                    <ArrowUpRight style={{ width: '15px', height: '15px' }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology Mapping Section */}
      <div className="reveal-init">
        <TechMappingSection />
      </div>

      {/* Critical Mineral Ore Gallery */}
      <div className="reveal-init">
        <MineralGallerySection />
      </div>

      {/* Leading Organisations Section */}
      <div className="reveal-init">
        <OrganisationsSection />
      </div>

      {/* Technology Gaps & Emerging Areas */}
      <div className="reveal-init">
        <TechnologyGapsSection />
      </div>
    </div>
  );
}

