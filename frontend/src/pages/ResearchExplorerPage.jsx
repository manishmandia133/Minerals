// Research Explorer Page — Dedicated Full-Page Indian Scientific & R&D Publications Repository
// Indexed from OpenAlex, CSIR Labs, IITs, IISc, and premier metallurgy & materials journals

import React, { useState, useEffect } from 'react';
import { RESEARCH_PUBLICATIONS } from '../data/researchData';
import { getResearchesLive } from '../api.client';
import { useScrollReveal } from '../components/common/useScrollReveal';
import {
  BookOpen,
  Search,
  ExternalLink,
  Download,
  Bookmark,
  Sparkles,
  Building2,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResearchExplorerPage() {
  // Live research corpus first, cached RESEARCH_PUBLICATIONS as fallback.
  const [publications, setPublications] = useState(RESEARCH_PUBLICATIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMineral, setSelectedMineral] = useState('all');
  const [selectedInstType, setSelectedInstType] = useState('all');
  const [sortBy, setSortBy] = useState('citations-desc');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useScrollReveal();

  useEffect(() => {
    let cancelled = false;
    getResearchesLive()
      .then((live) => {
        if (cancelled) return;
        if (live.length > 0) {
          setPublications(live);
          setUsingLiveData(true);
        }
      })
      .catch(() => {
        // Transport error — keep the cached fallback.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleBookmark = (id, e) => {
    e.stopPropagation();

    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCopyCitation = (paper) => {
    const doiPart = paper.doi ? ` DOI: ${paper.doi}.` : '';
    const citation = `${(paper.authors || []).join(', ')} (${paper.year || 'n.d.'}). "${paper.title}". ${paper.journal}.${doiPart}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(paper.id);

    setTimeout(() => setCopiedId(null), 2500);
  };

  const exportCSV = () => {

    const headers = ['ID', 'Title', 'Mineral', 'Journal', 'Year', 'Authors', 'Institution', 'TRL', 'Citations', 'DOI'];
    const rows = filteredPapers.map((p) => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.mineral}"`,
      `"${p.journal.replace(/"/g, '""')}"`,
      p.year,
      `"${p.authors.join('; ')}"`,
      `"${p.institution.replace(/"/g, '""')}"`,
      p.trl,
      p.citations,
      `"${p.doi}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Indian_Critical_Minerals_Research_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredPapers = publications
    .filter((p) => {
      const matchesQuery =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.authors.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.journal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.keywords && p.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesMineral =
        selectedMineral === 'all' || p.mineral.toLowerCase().includes(selectedMineral.toLowerCase());

      const matchesInstType =
        selectedInstType === 'all' || p.institutionType.toLowerCase().includes(selectedInstType.toLowerCase());

      return matchesQuery && matchesMineral && matchesInstType;
    })
    .sort((a, b) => {
      if (sortBy === 'citations-desc') return b.citations - a.citations;
      if (sortBy === 'year-desc') return b.year - a.year;
      if (sortBy === 'impact-desc') return (b.impactFactor || 0) - (a.impactFactor || 0);
      if (sortBy === 'trl-desc') return b.trl - a.trl;
      return 0;
    });

  const totalCitations = filteredPapers.reduce((acc, p) => acc + p.citations, 0);

  return (
    <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '90px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* Top Header */}
        <div style={{ marginBottom: '36px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge badge-emerald">
              <BookOpen style={{ width: '12px', height: '12px' }} />
              OpenAlex &amp; Indian National Scientific Corpus
            </span>
            <span className="badge">Peer-Reviewed Literature</span>
            <span className="badge badge-indigo">CSIR • IITs • IISc • BARC</span>
            <span className="badge">{isLoading ? 'Connecting…' : usingLiveData ? 'Live corpus' : 'Cached copy'}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: 'var(--color-ink)' }}>
                Research Explorer
              </h1>
              <p style={{ color: 'var(--color-graphite)', fontSize: '15px', marginTop: '8px', maxWidth: '660px' }}>
                Discover scientific papers, journal publications, and laboratory extraction breakthroughs from India's foremost metallurgical researchers, institutes, and academic consortiums.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={exportCSV}
                className="btn-pill"
                style={{ padding: '10px 20px', fontSize: '12px' }}
              >
                <Download style={{ width: '13px', height: '13px' }} />
                <span>Export Dataset ({filteredPapers.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics KPI Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
          className="reveal-init"
        >
          <div className="card card-interactive" style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Indexed Publications
            </div>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '4px' }}>
              {filteredPapers.length} Papers
            </div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>
              High-impact journals
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Total Verified Citations
            </div>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--color-electric-indigo)', marginTop: '4px' }}>
              {totalCitations}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '2px' }}>
              Across global materials journals
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Average Lab TRL
            </div>
            <div style={{ fontSize: '28px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '4px' }}>
              {(filteredPapers.reduce((acc, p) => acc + p.trl, 0) / (filteredPapers.length || 1)).toFixed(1)} / 9
            </div>
            <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>
              Bench-scale &amp; pilot verified
            </div>
          </div>

          <div className="card card-interactive" style={{ padding: '18px 22px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Ask Questions
            </div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-ink)', marginTop: '6px' }}>
              AI Research Chat
            </div>
            <Link
              to="/chat"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: 'var(--color-electric-indigo)',
                fontWeight: 500,
                marginTop: '4px',
                textDecoration: 'none',
              }}
            >
              <Sparkles style={{ width: '12px', height: '12px' }} />
              Chat about Research &rarr;
            </Link>
          </div>
        </div>

        {/* Filter Controls Card */}
        <div className="card reveal-init" style={{ marginBottom: '28px', padding: '24px' }}>
          {/* Top Search Input */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: '#9ca3af',
              }}
            />
            <input
              type="text"
              placeholder="Search by article title, author (e.g. Dr. Abhilash, Sagar Mitra), institution, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '48px', height: '50px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-graphite)',
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            )}
          </div>

          {/* Mineral domain selection pills */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', letterSpacing: '-0.02em', fontWeight: 500 }}>
              Target Mineral Focus
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => {
                  setSelectedMineral('all');

                }}
                className={`tab-pill ${selectedMineral === 'all' ? 'active' : ''}`}
              >
                All Minerals ({publications.length})
              </button>
              {['Lithium', 'Rare Earth Elements (REE)', 'Cobalt', 'Graphite', 'Titanium', 'Gallium', 'Nickel'].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setSelectedMineral(m);

                  }}
                  className={`tab-pill ${selectedMineral === m ? 'active' : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Dropdown filters */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-haze)',
            }}
          >
            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', display: 'block', marginBottom: '6px' }}>
                Institution Category
              </label>
              <select
                value={selectedInstType}
                onChange={(e) => {
                  setSelectedInstType(e.target.value);

                }}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '13px' }}
              >
                <option value="all">All Institutional Categories</option>
                <option value="csir">CSIR National Laboratories</option>
                <option value="iit">IITs &amp; Academia (Bombay, Madras, IISc)</option>
                <option value="psu">Strategic PSUs &amp; DAE (BARC, IREL)</option>
                <option value="corporate">Corporate &amp; Industrial R&amp;D</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', display: 'block', marginBottom: '6px' }}>
                Sort Publications By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);

                }}
                className="input-field"
                style={{ padding: '10px 14px', fontSize: '13px' }}
              >
                <option value="citations-desc">Total Citations (Highest First)</option>
                <option value="year-desc">Publication Year (Latest First)</option>
                <option value="impact-desc">Journal Impact Factor</option>
                <option value="trl-desc">Technology Readiness Level (TRL)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Publication Cards Grid with Staggered Entrance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', gap: '20px' }}>
          {filteredPapers.map((paper, idx) => {
            const isBookmarked = bookmarkedIds.includes(paper.id);

            return (
              <div
                key={paper.id}
                onClick={() => {
                  setSelectedPaper(paper);

                }}
                className="card card-interactive grid-enter"
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--color-haze)',
                  animationDelay: `${Math.min(idx, 7) * 45}ms`,
                }}
              >
                <div>
                  {/* Top Meta Line */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="badge badge-indigo" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {paper.mineral}
                      </span>
                      <span className="badge" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {paper.year || 'n.d.'}
                      </span>
                      <span className="badge badge-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {paper.citations} Citations
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge" style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(26, 47, 251, 0.06)', color: 'var(--color-electric-indigo)' }}>
                        TRL {paper.trl}/9
                      </span>
                      <button
                        onClick={(e) => toggleBookmark(paper.id, e)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: isBookmarked ? 'var(--color-electric-indigo)' : '#9ca3af' }}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark paper'}
                      >
                        <Bookmark style={{ width: '15px', height: '15px', fill: isBookmarked ? 'currentColor' : 'none' }} />
                      </button>
                    </div>
                  </div>

                  {/* Paper Title */}
                  <h3
                    style={{
                      fontSize: '17px',
                      fontWeight: 500,
                      lineHeight: 1.35,
                      color: 'var(--color-ink)',
                      marginBottom: '10px',
                    }}
                  >
                    {paper.title}
                  </h3>

                  {/* Journal Name and Impact Factor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '12px', color: 'var(--color-electric-indigo)', fontWeight: 500 }}>
                    <span>{paper.journal}</span>
                    {paper.impactFactor && (
                      <span style={{ color: 'var(--color-graphite)', fontWeight: 400 }}>
                        • IF {paper.impactFactor}
                      </span>
                    )}
                  </div>

                  {/* Abstract Snippet */}
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-graphite)',
                      lineHeight: 1.55,
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {paper.abstract}
                  </p>

                  {/* Keywords */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {paper.keywords.map((kw) => (
                      <span
                        key={kw}
                        style={{
                          fontSize: '11px',
                          background: 'var(--color-lavender-mist)',
                          color: 'var(--color-graphite)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--color-haze)',
                        }}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Footer Info */}
                <div
                  style={{
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-haze)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--color-graphite)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '65%' }}>
                    <Building2 style={{ width: '13px', height: '13px', shrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {paper.institution}
                    </span>
                  </div>

                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: 'var(--color-electric-indigo)',
                      fontWeight: 500,
                    }}
                  >
                    Read Details
                    <ArrowUpRight style={{ width: '14px', height: '14px' }} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredPapers.length === 0 && (
          <div
            className="card"
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-ink)', marginBottom: '8px' }}>
              No research publications match your criteria
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-graphite)', maxWidth: '440px', margin: '0 auto 20px' }}>
              Try searching for general keywords like "Spodumene", "Recycling", "Coercivity", or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMineral('all');
                setSelectedInstType('all');
              }}
              className="btn-pill"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Publication Details Drawer */}
      {selectedPaper && (
        <PaperDrawer
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
          onCopy={() => handleCopyCitation(selectedPaper)}
          copied={copiedId === selectedPaper.id}
        />
      )}
      <style>{`
        .res-drawer { scrollbar-width: none; -ms-overflow-style: none; }
        .res-drawer::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) { .res-drawer { transition: none !important; } }
      `}</style>
    </div>
  );
}

function PaperDrawer({ paper, onClose, onCopy, copied }) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef(null);

  const handleClose = React.useCallback(() => {
    setOpen(false);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(onClose, 340);
  }, [onClose]);

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    const h = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(closeTimer.current);
      window.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(16,24,40,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={paper.title}
        className="res-drawer"
        style={{
          background: 'var(--color-paper-white)',
          borderRadius: '24px',
          width: 'min(960px, 100%)',
          maxHeight: '88vh',
          overflowY: 'auto',
          border: '1px solid var(--color-haze)',
          boxShadow: '0 20px 50px rgba(16, 24, 40, 0.25)',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
          opacity: open ? 1 : 0,
          transition: open
            ? 'transform 0.45s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease'
            : 'transform 0.3s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.2s ease',
          willChange: 'transform, opacity',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '28px 36px 20px', borderBottom: '1px solid var(--color-haze)', position: 'sticky', top: 0, background: 'var(--color-paper-white)', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-indigo">{paper.mineral}</span>
              <span className="badge badge-emerald">{paper.citations} Citations</span>
              <span className="badge">TRL {paper.trl} / 9</span>
              <span className="badge">{paper.year || 'n.d.'}</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 500, lineHeight: 1.3, color: 'var(--color-ink)' }}>
              {paper.title}
            </h2>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--color-lavender-mist)',
              border: '1px solid var(--color-haze)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-ink)',
              flexShrink: 0,
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        <div style={{ padding: '24px 36px 36px' }}>
          {/* Core Metadata Table */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              padding: '16px',
              borderRadius: '14px',
              background: 'var(--color-lavender-mist)',
              border: '1px solid var(--color-haze)',
              marginBottom: '24px',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-graphite)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                Journal
              </span>
              <span style={{ fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px', display: 'block' }}>
                {paper.journal}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--color-graphite)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                Affiliated Institution
              </span>
              <span style={{ fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px', display: 'block' }}>
                {paper.institution}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--color-graphite)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                Domain Category
              </span>
              <span style={{ fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px', display: 'block' }}>
                {paper.domain}
              </span>
            </div>

            <div>
              <span style={{ color: 'var(--color-graphite)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                Digital Object ID (DOI)
              </span>
              <span style={{ fontWeight: 500, color: 'var(--color-electric-indigo)', marginTop: '2px', display: 'block' }}>
                {paper.doi || '—'}
              </span>
            </div>
          </div>

          {/* Authors */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>
              Contributing Authors
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {paper.authors.map((author) => (
                <span
                  key={author}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'var(--color-paper-white)',
                    border: '1px solid var(--color-haze)',
                    fontSize: '12px',
                    color: 'var(--color-ink)',
                  }}
                >
                  {author}
                </span>
              ))}
            </div>
          </div>

          {/* Full Abstract */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>
              Scientific Abstract
            </div>
            <div
              style={{
                padding: '18px',
                borderRadius: '14px',
                background: 'var(--color-paper-white)',
                border: '1px solid var(--color-haze)',
                fontSize: '13px',
                lineHeight: 1.65,
                color: 'var(--color-ink)',
              }}
            >
              {paper.abstract}
            </div>
          </div>

          {/* Keywords */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>
              Index Keywords
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {paper.keywords.map((kw) => (
                <span
                  key={kw}
                  className="badge"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Drawer Bottom Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--color-haze)',
            }}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              {paper.openAccessUrl ? (
                <a
                  href={paper.openAccessUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill btn-pill-indigo"
                  style={{ fontSize: '12px', padding: '12px 20px' }}
                >
                  <ExternalLink style={{ width: '13px', height: '13px' }} />
                  <span>Open DOI Publisher Article</span>
                </a>
              ) : null}

              <button
                onClick={onCopy}
                className="btn-pill btn-pill-outline"
                style={{ fontSize: '12px', padding: '12px 20px' }}
              >
                {copied ? 'Copied!' : 'Copy Citation'}
              </button>
            </div>

            <Link
              to={`/chat?query=${encodeURIComponent(`Explain research paper: "${paper.title}" by ${paper.institution}`)}`}
              className="btn-pill"
              style={{ fontSize: '12px', padding: '12px 20px' }}
            >
              <Sparkles style={{ width: '13px', height: '13px' }} />
              <span>Discuss Paper with AI</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
