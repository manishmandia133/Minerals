// Smart Technology & Patent Tracker for Critical Minerals
// Multi-page React Application inspired by Lusion.co light-theme aesthetic

import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import FooterSection5 from './components/ui/footer-section-5';
import ChatCurtainTransition from './components/common/ChatCurtainTransition';

// Route-level code splitting: each page (with its heavy deps like motion/gsap
// charts) loads on demand instead of bloating the initial bundle.
const HomePage = lazy(() => import('./pages/HomePage'));
const MineralsPage = lazy(() => import('./pages/MineralsPage'));
const PatentExplorerPage = lazy(() => import('./pages/PatentExplorerPage'));
const ResearchExplorerPage = lazy(() => import('./pages/ResearchExplorerPage'));
const PatentTrendsPage = lazy(() => import('./pages/PatentTrendsPage'));
const TechnologyMappingPage = lazy(() => import('./pages/TechnologyMappingPage'));
const EcosystemPage = lazy(() => import('./pages/EcosystemPage'));
const InstitutionsPage = lazy(() => import('./pages/InstitutionsPage'));
const GapsPage = lazy(() => import('./pages/GapsPage'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
const MineralDetailPage = lazy(() => import('./pages/MineralDetailPage'));
const OrganisationProfilePage = lazy(() => import('./pages/OrganisationProfilePage'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const PolicyBriefPage = lazy(() => import('./pages/PolicyBriefPage'));
const BenchmarkPage = lazy(() => import('./pages/BenchmarkPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

// Caption shown under the curtain mark, per destination route.
function curtainLabelFor(pathname) {
  if (pathname.startsWith('/mineral/')) return 'MINERAL DOSSIER';
  switch (pathname) {
    case '/chat':
      return 'AI ASSISTANT';
    case '/patents':
      return 'PATENTS';
    case '/research':
      return 'RESEARCH';
    case '/trends':
      return 'TRENDS & VELOCITY';
    case '/ecosystem':
      return 'ECOSYSTEM';
    case '/help':
      return 'HELP';
    case '/terms':
      return 'TERMS';
    default:
      return 'OVERVIEW';
  }
}

// Seamless overlap page transition (View Transitions API: fade + lift) on
// every internal navigation — old and new pages overlap momentarily while
// the incoming page rises into place. Falls back to instant navigation
// where the API is unsupported or reduced-motion is preferred.
//
// EXCEPTION — the AI chat page uses a GSAP curtain transition instead:
// navigating TO /chat plays the curtain intro, navigating AWAY plays the
// curtain outro. See ChatCurtainTransition for the animation itself.
// `curtainRef` drives the overlay; `curtainNavRef` flags navigations the
// curtain already handled so the popstate watcher doesn't replay them.
function PageViewTransition({ curtainRef, curtainNavRef }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target?.closest?.('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      let url;
      try {
        url = new URL(anchor.getAttribute('href'), window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.href === window.location.href) return;

      const rel = url.pathname.startsWith(base) ? url.pathname.slice(base.length) || '/' : url.pathname;
      const to = { pathname: rel, search: url.search, hash: url.hash };
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // ---- Chat curtain (intro when entering, outro when leaving) ----
      const fromChat = location.pathname === '/chat';
      const toChat = rel === '/chat';
      const curtain = curtainRef?.current;
      if ((fromChat || toChat) && curtain && !reduceMotion) {
        // Header links normally navigate instantly — but chat links always
        // go through the curtain so the intro/outro never gets skipped.
        e.preventDefault();
        // Capture phase + stopPropagation so React Router's own Link handler
        // doesn't navigate first (which would leave nothing to animate).
        e.stopPropagation();
        // Swallow clicks mid-animation so transitions can't stack.
        if (curtain.isBusy()) return;
        document.documentElement.classList.remove('vt-page');
        curtainNavRef.current = true;
        curtain.transitionTo(() => navigate(to), curtainLabelFor(rel)).finally(() => {
          curtainNavRef.current = false;
        });
        return;
      }

      if (anchor.closest('header')) return; // navbar navigates instantly — no transition

      e.preventDefault();
      // Capture phase + stopPropagation so React Router's own Link handler
      // doesn't navigate first (which would leave nothing to animate).
      e.stopPropagation();

      const canTransition = typeof document.startViewTransition === 'function' && !reduceMotion;

      document.documentElement.classList.add('vt-page');
      if (canTransition) {
        try {
          const t = document.startViewTransition(() => navigate(to));
          t.finished.finally(() => document.documentElement.classList.remove('vt-page'));
          return;
        } catch {
          /* fall through to instant navigation */
        }
      }
      navigate(to);
      document.documentElement.classList.remove('vt-page');
    };

    // Capture phase: run before React Router's Link handler so the route
    // update happens inside startViewTransition's snapshot window.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate, location.pathname, curtainRef, curtainNavRef]);

  return null;
}

// Scroll to top on route transition — or to the anchored section when the
// URL carries a hash (used by the Innovation Network drawer links).
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const scroll = () => {
        try {
          const el = document.querySelector(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return true;
          }
        } catch {
          /* invalid selector — fall through to top */
        }
        return false;
      };
      // Route pages lazy-load, so retry once the section has mounted.
      if (!scroll()) {
        const id = setTimeout(scroll, 400);
        return () => clearTimeout(id);
      }
      return undefined;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    return undefined;
  }, [pathname, hash]);

  return null;
}

function PageLoader() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Loading page">
      <span className="pulse-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-electric-indigo)', display: 'inline-block' }} />
    </div>
  );
}
// The AI chat is a standalone full-screen workspace — no navbar or footer.
function AppShell({ curtainRef, curtainNavRef }) {
  const { pathname } = useLocation();
  const isChat = pathname === '/chat';
  const prevPathRef = useRef(pathname);
  const mountedRef = useRef(false);

  // Chat curtain for navigations the click interceptor can't cover:
  // direct load / refresh on /chat (intro on mount) and browser
  // back/forward (popstate). The route has already swapped by the time we
  // see it, so start covered (hides the snap) and lift — same intro feel.
  useEffect(() => {
    const curtain = curtainRef?.current;
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevPathRef.current = pathname;
      if (pathname === '/chat') {
        // Wait a paint so the overlay + chat are laid out before lifting.
        const id = requestAnimationFrame(() =>
          requestAnimationFrame(() => curtain?.playIntro(curtainLabelFor(pathname)))
        );
        return () => cancelAnimationFrame(id);
      }
      return;
    }
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    const involvedChat = pathname === '/chat' || prev === '/chat';
    if (involvedChat && !curtainNavRef.current) {
      curtain?.playIntro(curtainLabelFor(pathname));
    }
  }, [pathname, curtainRef, curtainNavRef]);
  return (
    <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', color: 'var(--color-ink)' }}>
      {!isChat && <Header />}

      <main>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/minerals" element={<MineralsPage />} />
            <Route path="/patents" element={<PatentExplorerPage />} />
            <Route path="/research" element={<ResearchExplorerPage />} />
            <Route path="/trends" element={<PatentTrendsPage />} />
            <Route path="/technology-mapping" element={<TechnologyMappingPage />} />
            <Route path="/ecosystem" element={<EcosystemPage />} />
            <Route path="/institutions" element={<InstitutionsPage />} />
            <Route path="/gaps" element={<GapsPage />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/mineral/:id" element={<MineralDetailPage />} />
            <Route path="/organisation/:name" element={<OrganisationProfilePage />} />
            <Route path="/chat" element={<AIChatPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/policy" element={<PolicyBriefPage />} />
            <Route path="/benchmark" element={<BenchmarkPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>

      {!isChat && <FooterSection5 />}
    </div>
  );
}
export default function App() {
  const curtainRef = useRef(null);
  const curtainNavRef = useRef(false);
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <PageViewTransition curtainRef={curtainRef} curtainNavRef={curtainNavRef} />
      <ChatCurtainTransition ref={curtainRef} />
      <AppShell curtainRef={curtainRef} curtainNavRef={curtainNavRef} />
    </BrowserRouter>
  );
}
