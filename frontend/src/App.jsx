// Smart Technology & Patent Tracker for Critical Minerals
// Multi-page React Application inspired by Lusion.co light-theme aesthetic

import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Header from './components/layout/Header';
import FooterSection5 from './components/ui/footer-section-5';

// Route-level code splitting: each page (with its heavy deps like motion/gsap
// charts) loads on demand instead of bloating the initial bundle.
const HomePage = lazy(() => import('./pages/HomePage'));
const PatentExplorerPage = lazy(() => import('./pages/PatentExplorerPage'));
const ResearchExplorerPage = lazy(() => import('./pages/ResearchExplorerPage'));
const PatentTrendsPage = lazy(() => import('./pages/PatentTrendsPage'));
const EcosystemPage = lazy(() => import('./pages/EcosystemPage'));
const AIChatPage = lazy(() => import('./pages/AIChatPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

// Seamless overlap page transition (View Transitions API: fade + lift) on
// every internal navigation — old and new pages overlap momentarily while
// the incoming page rises into place. Falls back to instant navigation
// where the API is unsupported or reduced-motion is preferred.
function PageViewTransition() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target?.closest?.('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      if (anchor.closest('header')) return; // navbar navigates instantly — no transition

      let url;
      try {
        url = new URL(anchor.getAttribute('href'), window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.href === window.location.href) return;

      e.preventDefault();
      // Capture phase + stopPropagation so React Router's own Link handler
      // doesn't navigate first (which would leave nothing to animate).
      e.stopPropagation();

      const rel = url.pathname.startsWith(base) ? url.pathname.slice(base.length) || '/' : url.pathname;
      const to = { pathname: rel, search: url.search, hash: url.hash };
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  }, [navigate, location.pathname]);

  return null;
}

// Scroll to top on route transition
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function PageLoader() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Loading page">
      <span className="pulse-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-electric-indigo)', display: 'inline-block' }} />
    </div>
  );
}
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <PageViewTransition />
      <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', color: 'var(--color-ink)' }}>
        <Header />

        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/patents" element={<PatentExplorerPage />} />
              <Route path="/research" element={<ResearchExplorerPage />} />
              <Route path="/trends" element={<PatentTrendsPage />} />
              <Route path="/ecosystem" element={<EcosystemPage />} />
              <Route path="/chat" element={<AIChatPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Suspense>
        </main>

        <FooterSection5 />
      </div>
    </BrowserRouter>
  );
}
