// Smart Technology & Patent Tracker for Critical Minerals
// Multi-page React Application inspired by Lusion.co light-theme aesthetic

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import FooterSection5 from './components/ui/footer-section-5';
import HomePage from './pages/HomePage';
import PatentExplorerPage from './pages/PatentExplorerPage';
import ResearchExplorerPage from './pages/ResearchExplorerPage';
import PatentTrendsPage from './pages/PatentTrendsPage';
import EcosystemPage from './pages/EcosystemPage';
import AIChatPage from './pages/AIChatPage';

// Scroll to top on route transition
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

// Single global footer — identical on every page
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollToTop />
      <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', color: 'var(--color-ink)' }}>
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/patents" element={<PatentExplorerPage />} />
            <Route path="/research" element={<ResearchExplorerPage />} />
            <Route path="/trends" element={<PatentTrendsPage />} />
            <Route path="/ecosystem" element={<EcosystemPage />} />
            <Route path="/chat" element={<AIChatPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>

        <FooterSection5 />
      </div>
    </BrowserRouter>
  );
}
