// Header — Lusion.co light-theme reproduction with a motion-menu style nav:
// one shared dropdown viewport morphs (position + size) to the active
// trigger, content slides horizontally with direction, and a highlight pill
// follows hover/active triggers. GSAP-powered, no new dependencies.

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import {
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  Layers,
  Database,
  BookOpen,
  TrendingUp,
  Network,
  FileText,
  Globe,
  Building2,
  ShieldAlert,
  LayoutGrid,
} from 'lucide-react';
import MineralsLogo from '../common/MineralsLogo';

const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = (d) => (REDUCED ? 0 : d);

const headerStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 50,
  fontFamily: 'var(--font-aeonik)',
  background: 'rgba(240, 241, 250, 0.88)',
  backdropFilter: 'blur(14px)',
  borderBottom: '1px solid rgba(228, 230, 239, 0.8)',
};

const wordmarkStyle = {
  fontSize: '17px',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  color: 'var(--color-ink)',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  flexShrink: 0,
};

const navLinkStyle = (isActive) => ({
  fontSize: '13px',
  fontWeight: 500,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  color: isActive ? 'var(--color-electric-indigo)' : 'var(--color-ink)',
  padding: '6px 2px',
  position: 'relative',
  zIndex: 1,
  opacity: isActive ? 1 : 0.82,
  transition: 'color 0.2s ease, opacity 0.2s ease',
  whiteSpace: 'nowrap',
});

const drawerDescStyle = {
  fontSize: '11px',
  fontWeight: 400,
  textTransform: 'none',
  letterSpacing: '0',
  color: 'var(--color-graphite)',
};

const DRAWER_IDS = ['explore', 'network', 'insights'];

function DrawerLink({ to, label, desc, active, onNavigate, Icon }) {
  const [hover, setHover] = useState(false);
  const highlighted = active || hover;
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onNavigate}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        textDecoration: 'none',
        color: 'var(--color-ink)',
        background: highlighted ? 'var(--color-lavender-mist)' : 'transparent',
        borderRadius: '9px',
        padding: '9px 12px',
        transition: 'background 0.15s ease',
      }}
    >
      {Icon && (
        <span
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '9px',
            background: highlighted ? 'var(--color-paper-white)' : 'var(--color-lavender-mist)',
            border: '1px solid var(--color-haze)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: highlighted ? 'var(--color-ink)' : 'var(--color-graphite)',
            flexShrink: 0,
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
        >
          <Icon style={{ width: '15px', height: '15px' }} />
        </span>
      )}
      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <span>{label}</span>
        {desc && <span style={drawerDescStyle}>{desc}</span>}
      </span>
    </Link>
  );
}

export default function Header() {
  const location = useLocation();
  const [openDrawer, setOpenDrawer] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [renderPanel, setRenderPanel] = useState(false);

  const navRef = useRef(null);
  const panelRef = useRef(null);
  const contentRef = useRef(null);
  const pillRef = useRef(null);
  const triggerRefs = useRef({});
  const closeTimer = useRef(null);
  const prevDrawerRef = useRef(null);
  const heightRef = useRef(0);
  const dirRef = useRef(1);

  const exploreLinks = [
    { to: '/minerals', label: 'All Minerals', desc: '8 dossiers · stats & TRL', Icon: Layers },
    { to: '/patents', label: 'Patents', desc: 'IPO records · IPC · TRL', Icon: Database },
    { to: '/research', label: 'Research', desc: 'OpenAlex papers · citations', Icon: BookOpen },
  ];
  const exploreIntro = {
    title: 'Knowledge Hub',
    desc: 'Patents, papers and dossiers across critical minerals.',
    to: '/minerals',
    cta: 'See all minerals',
    video:
      'https://media.gettyimages.com/id/473406221/video/technical-drawing.mp4?s=mp4-640x640-gi&k=20&c=5NJolLPkvLgHQcoLflekVpJdL-xLbgn5FkRoGBkzHW8=',
  };

  const networkGroups = [
    {
      title: 'Network',
      items: [
        { to: '/ecosystem', label: 'Overview', desc: 'Institutions & vulnerability radar', Icon: LayoutGrid },
        { to: '/institutions', label: 'Leading Institutions', desc: 'Patent leaderboard & dossiers', Icon: Building2 },
      ],
    },
    {
      title: 'Strategy',
      items: [
        { to: '/gaps', label: 'Technology Gaps', desc: 'TRL deficits & emerging areas', Icon: ShieldAlert },
        { to: '/opportunities', label: 'Opportunities & Corridors', desc: 'Priority bets + clusters', Icon: Sparkles },
      ],
    },
  ];
  const networkIntro = {
    title: 'Innovation Network',
    desc: 'Who leads, where the gaps are, and which bets to back.',
    to: '/ecosystem',
    cta: 'See overview',
    video:
      'https://media.gettyimages.com/id/956188690/video/modern-industry-blueprint.mp4?s=mp4-640x640-gi&k=20&c=bk634KcM5kD3M5r_Uj9mrlxxjgbP_b47ouV6HDhzDlU=',
  };

  const insightsLinks = [
    { to: '/trends', label: 'Trends & Velocity', desc: 'Filing curves · applicant dynamics', Icon: TrendingUp },
    { to: '/technology-mapping', label: 'Technology Mapping', desc: 'Value chain · TRL by stage', Icon: Network },
    { to: '/policy', label: 'Policy Brief', desc: 'Top-5 priorities · import risk', Icon: FileText },
    { to: '/benchmark', label: 'Global Benchmark', desc: 'India vs frontier · TRL lag', Icon: Globe },
  ];
  const insightsIntro = {
    title: 'Intelligence',
    desc: 'Momentum, mapping and policy-ready analysis.',
    to: '/trends',
    cta: 'See trends',
    video:
      'https://videos.pexels.com/video-files/7816246/7816246-hd_1280_720_25fps.mp4',
  };

  const drawers = {
    explore: { label: 'Knowledge Hub', intro: exploreIntro, groups: [{ items: exploreLinks }] },
    network: { label: 'Innovation Network', intro: networkIntro, groups: networkGroups },
    insights: { label: 'Intelligence', intro: insightsIntro, groups: [{ items: insightsLinks }] },
  };

  const atPath = (to) => location.pathname + location.hash === to;
  const exploreActive = exploreLinks.some((l) => atPath(l.to));
  const networkActive = ['/ecosystem', '/institutions', '/gaps', '/opportunities'].includes(location.pathname);
  const insightsActive = insightsLinks.some((l) => location.pathname === l.to);
  const activeId =
    location.pathname === '/' ? 'overview'
    : location.pathname === '/chat' ? 'chat'
    : exploreActive ? 'explore'
    : networkActive ? 'network'
    : insightsActive ? 'insights'
    : null;

  const openId = (id) => {
    clearTimeout(closeTimer.current);
    setOpenDrawer((cur) => {
      if (cur === id) return cur;
      const prevIdx = DRAWER_IDS.indexOf(cur);
      const nextIdx = DRAWER_IDS.indexOf(id);
      dirRef.current = prevIdx !== -1 && nextIdx > prevIdx ? 1 : nextIdx < prevIdx && prevIdx !== -1 ? -1 : 1;
      return id;
    });
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenDrawer(null), 140);
  };
  const closeNow = () => {
    clearTimeout(closeTimer.current);
    setOpenDrawer(null);
  };

  // Close the viewport on route change.
  useEffect(() => {
    setOpenDrawer(null);
  }, [location.pathname, location.hash ]);

  // Mount on open; animate out then unmount on close.
  useEffect(() => {
    if (openDrawer) {
      setRenderPanel(true);
    } else if (renderPanel && panelRef.current) {
      gsap.to(panelRef.current, {
        opacity: 0,
        y: -8,
        scale: 0.97,
        transformOrigin: '50% 0%',
        duration: D(0.16),
        ease: 'power2.in',
        overwrite: 'auto',
        onComplete: () => setRenderPanel(false),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDrawer ]);

  // Entrance + morph: slide panel to the trigger, morph size, cascade content.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const nav = navRef.current;
    if (!renderPanel || !openDrawer || !panel || !nav) return;
    const prev = prevDrawerRef.current;
    const dir = dirRef.current;
    const trigger = triggerRefs.current[openDrawer];

    // Position: center under the active trigger, clamped to the nav.
    const navW = nav.offsetWidth;
    const panelW = Math.min(560, navW);
    let center = navW / 2;
    if (trigger) {
      center = trigger.offsetLeft + trigger.offsetWidth / 2;
    }
    const half = panelW / 2;
    const left = panelW >= navW ? navW / 2 : Math.max(half + 4, Math.min(navW - half - 4, center));
    gsap.set(panel, { xPercent: -50, width: panelW });
    gsap.to(panel, { left, duration: D(0.38), ease: 'power3.out', overwrite: 'auto' });

    // Size morph from previous height.
    const content = contentRef.current;
    const newH = panel.scrollHeight;
    if (prev && prev !== openDrawer && heightRef.current > 0) {
      gsap.fromTo(
        panel,
        { height: heightRef.current },
        {
          height: newH,
          duration: D(0.32),
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => gsap.set(panel, { clearProps: 'height' }),
        }
      );
    }

    if (!prev) {
      gsap.fromTo(
        panel,
        { opacity: 0, y: -10, scale: 0.98 },
        {
          opacity: 1, y: 0, scale: 1, duration: D(0.3), ease: 'back.out(1.5)',
          overwrite: 'auto', transformOrigin: '50% 0%',
        }
      );
    }
    if (content) {
      gsap.fromTo(
        content,
        { opacity: 0, x: 44 * dir },
        { opacity: 1, x: 0, duration: D(0.3), ease: 'power3.out', overwrite: 'auto' }
      );
      const items = content.querySelectorAll('[role="menuitem"], .drawer-intro');
      if (items.length && !REDUCED) {
        gsap.fromTo(
          items,
          { opacity: 0, x: -8 },
          {
            opacity: 1, x: 0, duration: 0.22, ease: 'power2.out',
            stagger: 0.03, delay: 0.06, overwrite: 'auto', clearProps: 'transform',
          }
        );
      }
    }
    heightRef.current = newH;
    prevDrawerRef.current = openDrawer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderPanel, openDrawer ]);

  // Sliding highlight pill follows hover, else the open drawer, else the active trigger.
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const nav = navRef.current;
    if (!pill || !nav) return;
    const target = triggerRefs.current[hoverId || openDrawer || activeId];
    if (!target) {
      gsap.to(pill, { opacity: 0, duration: D(0.18), overwrite: 'auto' });
      return;
    }
    gsap.to(pill, {
      opacity: 1,
      left: target.offsetLeft,
      top: target.offsetTop,
      width: target.offsetWidth,
      height: target.offsetHeight,
      duration: D(0.3),
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }, [hoverId, openDrawer, activeId ]);

  // Click outside the nav closes the viewport.
  useEffect(() => {
    const onDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpenDrawer(null);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);

  const setTrigger = (id) => (el) => {
    if (el) triggerRefs.current[id] = el;
    else delete triggerRefs.current[id];
  };

  const triggerBtnStyle = (isActive) => ({
    ...navLinkStyle(isActive),
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  });

  const renderTrigger = (id, label) => {
    const isActive =
      id === 'explore' ? exploreActive : id === 'network' ? networkActive : insightsActive;
    const isOpen = openDrawer === id;
    return (
      <button
        key={id}
        ref={setTrigger(id)}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeNow() : openId(id))}
        onMouseEnter={() => {
          setHoverId(id);
          openId(id);
        }}
        onMouseLeave={() => setHoverId(null)}
        onFocus={() => openId(id)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') closeNow();
        }}
        className="site-nav-link"
        style={triggerBtnStyle(isActive)}
      >
        {label}
        <ChevronDown
          style={{
            width: '13px',
            height: '13px',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.25s ease',
          }}
        />
        {isActive && (
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'var(--color-electric-indigo)',
              borderRadius: '1px',
            }}
          />
        )}
      </button>
    );
  };

  const drawer = openDrawer ? drawers[openDrawer] : null;

  return (
    <header style={headerStyle}>
      <div className="site-header-bar">
        {/* Wordmark — footer logo mark + MINERALS */}
        <Link to="/" style={wordmarkStyle} className="site-wordmark">
          <MineralsLogo
            width={30}
            height={18}
            style={{ color: 'var(--color-ink)', flexShrink: 0, display: 'block' }}
          />
          <span>MINERALS</span>
        </Link>

        {/* Primary nav — single morphing viewport for all drawers */}
        <nav
          ref={navRef}
          className="site-nav"
          aria-label="Primary"
          style={{ position: 'relative' }}
          onMouseLeave={() => {
            setHoverId(null);
            scheduleClose();
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) closeNow();
          }}
        >
          {/* Sliding highlight pill */}
          <span
            ref={pillRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 0,
              height: 0,
              opacity: 0,
              borderRadius: '999px',
              background: 'rgba(43, 46, 58, 0.07)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <Link
            to="/"
            ref={setTrigger('overview')}
            className="site-nav-link"
            style={navLinkStyle(location.pathname === '/')}
            onMouseEnter={() => setHoverId('overview')}
            onMouseLeave={() => setHoverId(null)}
          >
            Overview
            {location.pathname === '/' && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--color-electric-indigo)',
                  borderRadius: '1px',
                }}
              />
            )}
          </Link>

          {renderTrigger('explore', 'Knowledge Hub')}
          {renderTrigger('network', 'Innovation Network')}
          {renderTrigger('insights', 'Insights')}

          <Link
            to="/chat"
            ref={setTrigger('chat')}
            className="site-nav-link"
            style={navLinkStyle(location.pathname === '/chat')}
            onMouseEnter={() => setHoverId('chat')}
            onMouseLeave={() => setHoverId(null)}
          >
            AI Chat
            {location.pathname === '/chat' && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--color-electric-indigo)',
                  borderRadius: '1px',
                }}
              />
            )}
          </Link>

          {/* Shared morphing viewport */}
          {renderPanel && drawer && (
            <div
              ref={panelRef}
              role="menu"
              onMouseEnter={() => clearTimeout(closeTimer.current)}
              style={{
                position: 'absolute',
                top: 'calc(100% + 10px)',
                left: 0,
                background: 'var(--color-paper-white)',
                border: '1px solid var(--color-haze)',
                borderRadius: '16px',
                boxShadow: '0 16px 40px rgba(13, 14, 22, 0.14)',
                padding: '10px',
                zIndex: 60,
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                overflow: 'hidden',
              }}
            >
              <div
                className="drawer-intro"
                style={{
                  width: '190px',
                  flexShrink: 0,
                  flexGrow: 1,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'var(--color-graphite)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                {drawer.intro.video && (
                  <>
                    <video
                      aria-hidden="true"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      src={drawer.intro.video}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(180deg, rgba(13,14,22,0.55) 0%, rgba(13,14,22,0.72) 100%)',
                      }}
                    />
                  </>
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em', color: '#fff' }}>
                    {drawer.intro.title}
                  </div>
                  <div style={{ fontSize: '12px', lineHeight: 1.55, color: 'rgba(255,255,255,0.78)', margin: '6px 0 12px' }}>
                    {drawer.intro.desc}
                  </div>
                  <Link
                    to={drawer.intro.to}
                    onClick={closeNow}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#fff',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    {drawer.intro.cta}
                    <ArrowUpRight style={{ width: '13px', height: '13px' }} />
                  </Link>
                </div>
              </div>
              <div ref={contentRef} style={{ flex: '2 1 220px', minWidth: 0 }}>
                {drawer.groups.map((group, gi) => (
                  <div key={group.title || gi}>
                    {group.title && (
                      <>
                        {gi > 0 && (
                          <div style={{ height: '1px', background: 'var(--color-haze)', margin: '6px 4px' }} />
                        )}
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'var(--color-graphite)',
                            padding: '6px 12px 2px',
                          }}
                        >
                          {group.title}
                        </div>
                      </>
                    )}
                    {group.items.map((link) => (
                      <DrawerLink
                        key={link.to}
                        to={link.to}
                        label={link.label}
                        desc={link.desc}
                        Icon={link.Icon}
                        active={atPath(link.to)}
                        onNavigate={closeNow}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Right CTAs */}
        <div className="site-header-ctas" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Link
            to="/chat"
            className="btn-pill btn-pill-outline site-header-ai"
            style={{ fontSize: '12px', padding: '10px 18px', gap: '8px' }}
          >
            <span
              className="pulse-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--color-electric-indigo)',
                display: 'inline-block',
              }}
            />
            <Sparkles style={{ width: '13px', height: '13px', color: 'var(--color-electric-indigo)' }} />
            <span className="site-ai-text">AI Assistant</span>
          </Link>

          <Link
            to="/patents"
            className="btn-pill site-header-explore"
            style={{ fontSize: '12px', padding: '10px 20px', gap: '6px' }}
          >
            <span>Explore Patents</span>
            <ArrowUpRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>
      </div>
    </header>
  );
}
