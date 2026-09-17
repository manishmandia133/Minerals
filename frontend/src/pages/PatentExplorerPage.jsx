// Patent search — IPO critical minerals register
// Themed to match ResearchExplorerPage (Lusion tokens); layout positions unchanged.

import React, { useState, useEffect, useMemo, useDeferredValue, memo } from 'react';
import { PATENT_RECORDS, CRITICAL_MINERALS } from '../data/mineralsData';
import { getPatentsLive, fetchPatents } from '../api.client';
import {
  Search,
  ExternalLink,
  RefreshCw,
  X,
  Download,
  Bookmark,
  ChevronRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  FlaskConical,
  Atom,
  Layers,
  Scale,
  Gauge,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SplitText from '../components/bits/SplitText';
import CountUp from '../components/bits/CountUp';
import SpotlightCard from '../components/bits/SpotlightCard';

// Design system: Lusion light theme — same tokens as Research Explorer
// (paper-white cards, haze borders, ink/graphite type, lavender-mist washes).
const INK = 'var(--color-ink)';
const MUTED = 'var(--color-graphite)';
const FAINT = '#6b7280';
const LINE = 'var(--color-haze)';
const BG = 'var(--color-lavender-mist)';
const PANEL = 'var(--color-paper-white)';
const NAVY = 'var(--color-graphite)';
const NAVY_SOFT = 'var(--color-lavender-mist)';
const SERIF = 'var(--font-aeonik)';

const formatDate = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const statusOf = (s = '') => {
  // Icon + text + color: never color-alone (ux: color-only, high severity).
  const v = s.toLowerCase();
  if (v.includes('grant')) return { label: 'Granted', fg: '#027a48', bg: '#ecfdf3', bd: '#abefc6', edge: '#12b76a', Icon: CheckCircle2 };
  if (v.includes('exam')) return { label: 'Under examination', fg: '#b45309', bg: '#fffaeb', bd: '#fedf89', edge: '#f79009', Icon: Clock3 };
  if (v.includes('publish')) return { label: 'Published', fg: '#175cd3', bg: '#eff8ff', bd: '#b2ddff', edge: '#2e90fa', Icon: FileText };
  if (v.includes('research')) return { label: 'Research record', fg: '#475569', bg: '#f1f5f9', bd: '#e2e8f0', edge: '#94a3b8', Icon: FlaskConical };
  return { label: s || 'Indian patent', fg: '#334155', bg: '#f1f5f9', bd: '#e2e8f0', edge: NAVY, Icon: FileText };
};

// Memoized: pure tile with real render cost across long filtered lists
// (react stack guidance — memo as measured optimization, not blanket default).
// Mirrors ResearchExplorerPage cards: badges → title → identifier → IPC chips → footer.
// TRL meter, citations and abstract live in the modal only.
const STATUS_BADGE_CLASS = {
  Granted: 'badge-emerald',
  'Under examination': 'badge-amber',
  Published: 'badge-indigo',
};

const PatentTile = memo(function PatentTile({ p, saved, onOpen, onToggleSave }) {
  const st = statusOf(p.grantStatus);
  const year = (p.filingDate || '').slice(0, 4);
  return (
    <article
      onClick={onOpen}
      className="card card-interactive"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}
      tabIndex={0}
      role="button"
      aria-label={`${p.publicationNumber}: ${p.title}`}
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid var(--color-haze)',
        height: '100%',
      }}
    >
      <div>
        {/* Top meta line — mirrors research cards */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo" style={{ fontSize: '11px', padding: '2px 8px' }}>
              {p.mineral}
            </span>
            <span className="badge" style={{ fontSize: '11px', padding: '2px 8px' }}>
              {year}
            </span>
            <span className={`badge ${STATUS_BADGE_CLASS[st.label] || ''}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
              {st.label}
            </span>
          </div>
          <button
            onClick={onToggleSave}
            title={saved ? 'Remove from saved' : 'Save record'}
            aria-label={saved ? `Remove ${p.publicationNumber} from saved` : `Save ${p.publicationNumber}`}
            aria-pressed={saved}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: saved ? 'var(--color-electric-indigo)' : '#9ca3af' }}
          >
            <Bookmark aria-hidden="true" style={{ width: '15px', height: '15px', fill: saved ? 'currentColor' : 'none' }} />
          </button>
        </div>

        {/* Title — mirrors research cards */}
        <h3 style={{ fontSize: '17px', fontWeight: 500, lineHeight: 1.35, color: 'var(--color-ink)', marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '46px' }}>
          {p.title}
        </h3>

        {/* Identifier + stage — mirrors research journal line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '12px', color: 'var(--color-graphite)', fontWeight: 500 }}>
          <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontWeight: 600 }}>{p.publicationNumber}</span>
          <span style={{ fontWeight: 400 }}>• {p.category}</span>
        </div>

        {/* IPC codes as keyword chips — mirrors research keywords */}
        {(p.ipcCodes || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {(p.ipcCodes || []).slice(0, 3).map((c) => (
              <span
                key={c}
                title={`IPC ${c}`}
                style={{
                  fontSize: '11px',
                  background: 'var(--color-lavender-mist)',
                  color: 'var(--color-graphite)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--color-haze)',
                  fontFamily: 'ui-monospace, Menlo, monospace',
                }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer — mirrors research cards */}
      <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-haze)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-graphite)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '65%' }}>
          <Building2 aria-hidden="true" style={{ width: '13px', height: '13px', flexShrink: 0 }} />
          <span title={p.applicant} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.applicant}</span>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-electric-indigo)', fontWeight: 500 }}>
          View record <ArrowUpRight aria-hidden="true" style={{ width: '14px', height: '14px' }} />
        </span>
      </div>
    </article>
  );
});

const btn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
  fontSize: '13px',
  fontWeight: 600,
  padding: '8px 14px',
  borderRadius: '87.5px',
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  border: '1px solid transparent',
};

const inputStyle = {
  width: '100%',
  fontSize: '16px',
  padding: '14px 18px 14px 48px',
  height: '50px',
  border: `1px solid ${LINE}`,
  borderRadius: '18px',
  background: PANEL,
  color: INK,
  outline: 'none',
};

const selectStyle = {
  width: '100%',
  fontSize: '13px',
  padding: '8px 10px',
  border: `1px solid ${LINE}`,
  borderRadius: '18px',
  background: PANEL,
  color: INK,
};

const tokenStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 600,
  color: NAVY,
  background: PANEL,
  border: `1px solid ${LINE}`,
  borderRadius: '999px',
  padding: '4px 6px 4px 11px',
  cursor: 'pointer',
  flexWrap: 'wrap',
};

const sectionLabel = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: FAINT,
  marginBottom: '8px',
};

function FilterGroup({ title, icon: Icon, children }) {
  return (
    <div style={{ padding: '14px 0', borderBottom: `1px solid ${LINE}` }}>
      <div style={{ ...sectionLabel, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-graphite)' }}>
        {Icon && <Icon aria-hidden="true" style={{ width: '12px', height: '12px', flexShrink: 0 }} />}
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{children}</div>
    </div>
  );
}

function RadioRow({ name, value, current, onChange, label, count }) {
  const selected = current === value;
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        fontSize: '13px',
        fontWeight: selected ? 600 : 400,
        color: selected ? 'var(--color-ink)' : 'var(--color-graphite)',
        background: selected ? 'var(--color-lavender-mist)' : 'transparent',
        border: selected ? '1px solid var(--color-haze)' : '1px solid transparent',
        borderRadius: '10px',
        padding: '7px 10px',
        margin: '0 -10px',
        cursor: 'pointer',
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(43, 46, 58, 0.04)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <input
        type="radio"
        name={name}
        checked={selected}
        onChange={() => onChange(value)}
        style={{ accentColor: 'var(--color-electric-indigo)', width: '14px', height: '14px', flexShrink: 0, cursor: 'pointer', margin: 0 }}
      />
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {typeof count === 'number' && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: selected ? 'var(--color-electric-indigo)' : FAINT,
            background: selected ? 'rgba(26, 47, 251, 0.08)' : 'transparent',
            borderRadius: '999px',
            padding: '1px 8px',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          {count}
        </span>
      )}
    </label>
  );
}

export default function PatentExplorerPage() {
  const [records, setRecords] = useState(PATENT_RECORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMineral, setSelectedMineral] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTRL, setSelectedTRL] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [bookmarksOnly, setBookmarksOnly] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [usingLiveData, setUsingLiveData] = useState(false);

  // Live patent corpus first, cached PATENT_RECORDS as fallback.
  useEffect(() => {
    let cancelled = false;
    getPatentsLive()
      .then((live) => {
        if (cancelled) return;
        if (live.length > 0) {
          setRecords(live);
          setUsingLiveData(true);
        }
      })
      .catch(() => {
        // Transport error — keep the cached fallback below.
      })
      .finally(() => {
        if (!cancelled) setIsLoadingRecords(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLiveSync = async () => {
    setIsSyncing(true);
    setSyncMessage('Contacting patent corpus…');
    try {
      await fetchPatents({ patents: 'lithium extraction India', patent_pages: 2 });
      const live = await getPatentsLive();
      if (live.length > 0) {
        setRecords(live);
        setUsingLiveData(true);
        setSyncMessage(`Updated from live corpus — ${live.length} records.`);
      } else {
        setSyncMessage('Corpus returned no records — showing cached copy.');
      }
    } catch {
      setSyncMessage('Corpus unreachable — showing cached copy dated Sep 2026.');
    }
    setTimeout(() => {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(''), 5000);
    }, 1000);
  };

  const toggleBookmark = (id, e) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleCopyCitation = (patent) => {
    const c = `${patent.applicant}. "${patent.title}." ${patent.publicationNumber}, filed ${formatDate(patent.filingDate)}. Indian Patent Office. ${patent.sourceUrl}`;
    try { navigator.clipboard.writeText(c); } catch { /* noop */ }
    setCopiedId(patent.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    const headers = ['Publication number', 'Title', 'Mineral', 'Stage', 'Applicant', 'Filing date', 'Legal status', 'IPC', 'TRL', 'Citations'];
    const rows = filteredRecords.map((r) => [
      `"${r.publicationNumber}"`,
      `"${String(r.title).replace(/"/g, '""')}"`,
      `"${r.mineral}"`,
      `"${r.category}"`,
      `"${String(r.applicant).replace(/"/g, '""')}"`,
      `"${r.filingDate}"`,
      `"${r.grantStatus}"`,
      `"${(r.ipcCodes || []).join('; ')}"`,
      r.trl,
      r.citations || 0,
    ]);
    const uri = encodeURI('data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n'));
    const a = document.createElement('a');
    a.setAttribute('href', uri);
    a.setAttribute('download', `ipo_critical_minerals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const mineralCounts = useMemo(() => {
    const m = {};
    records.forEach((r) => { m[r.mineral] = (m[r.mineral] || 0) + 1; });
    return m;
  }, [records]);

  // Deferred query keeps typing responsive on long lists (react stack guidance).
  const deferredQuery = useDeferredValue(searchQuery);
  const filteredRecords = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return records
      .filter((rec) => {
        const hit =
          q === '' ||
          rec.title.toLowerCase().includes(q) ||
          rec.applicant.toLowerCase().includes(q) ||
          (rec.abstract && rec.abstract.toLowerCase().includes(q)) ||
          (rec.publicationNumber && rec.publicationNumber.toLowerCase().includes(q)) ||
          (rec.ipcCodes && rec.ipcCodes.some((c) => c.toLowerCase().includes(q)));
        const mMin = selectedMineral === 'all' || rec.mineral.toLowerCase().includes(selectedMineral.toLowerCase());
        const mCat = selectedCategory === 'all' || rec.category.toLowerCase().includes(selectedCategory.toLowerCase());
        const mTRL =
          selectedTRL === 'all' ||
          (selectedTRL === 'low' && rec.trl <= 4) ||
          (selectedTRL === 'mid' && rec.trl >= 5 && rec.trl <= 6) ||
          (selectedTRL === 'high' && rec.trl >= 7);
        const mSt =
          selectedStatus === 'all' ||
          (selectedStatus === 'granted' && rec.grantStatus.toLowerCase().includes('grant')) ||
          (selectedStatus === 'published' && rec.grantStatus.toLowerCase().includes('publish')) ||
          (selectedStatus === 'examination' && rec.grantStatus.toLowerCase().includes('exam'));
        const mBm = !bookmarksOnly || bookmarkedIds.includes(rec.id);
        return hit && mMin && mCat && mTRL && mSt && mBm;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.filingDate) - new Date(a.filingDate);
        if (sortBy === 'date-asc') return new Date(a.filingDate) - new Date(b.filingDate);
        if (sortBy === 'citations-desc') return (b.citations || 0) - (a.citations || 0);
        if (sortBy === 'trl-desc') return b.trl - a.trl;
        return 0;
      });
  }, [records, deferredQuery, selectedMineral, selectedCategory, selectedTRL, selectedStatus, bookmarksOnly, bookmarkedIds, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMineral('all');
    setSelectedCategory('all');
    setSelectedTRL('all');
    setSelectedStatus('all');
    setBookmarksOnly(false);
  };

  const hasFilters = selectedMineral !== 'all' || selectedCategory !== 'all' || selectedTRL !== 'all' || selectedStatus !== 'all' || bookmarksOnly || searchQuery.trim() !== '';
  const activeFilterCount = [selectedMineral, selectedCategory, selectedTRL, selectedStatus].filter((v) => v !== 'all').length + (bookmarksOnly ? 1 : 0);

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingTop: '100px', paddingBottom: '90px', color: INK }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>

        {/* utility line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', padding: '18px 0 12px', fontSize: '12px', color: FAINT }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link to="/" style={{ color: FAINT, textDecoration: 'none' }}>Home</Link>
            <ChevronRight style={{ width: '12px', height: '12px' }} />
            <span style={{ color: INK, fontWeight: 600 }}>Patent search</span>
          </div>
          <div>Source: {usingLiveData ? 'Live patent corpus' : 'IPO InPASS (ipindiaservices.gov.in) · Cached Sep 2026'} · IN jurisdiction</div>
        </div>

        {/* title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span className="badge badge-emerald">
                <FileText style={{ width: '12px', height: '12px' }} />
                IPO InPASS Corpus
              </span>
              <span className="badge">Indian Jurisdiction</span>
              <span className="badge badge-indigo">Extraction • Refining • Recycling</span>
            </div>
            <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(30px, 7vw, 42px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, margin: 0, textWrap: 'balance' }}>
              <SplitText
                text="Patent search"
                tag="span"
                splitType="chars"
                textAlign="left"
                delay={30}
                duration={0.7}
                from={{ opacity: 0, y: 28 }}
                to={{ opacity: 1, y: 0 }}
              />
            </h1>
            <p style={{ fontSize: '15px', color: MUTED, margin: '8px 0 0', maxWidth: '660px', lineHeight: 1.55 }}>
              {records.length} published applications and grants covering extraction, refining, manufacturing and recycling.
              Legal status must be confirmed in InPASS before reliance.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={handleLiveSync} disabled={isSyncing} style={{ ...btn, background: PANEL, borderColor: LINE, color: INK }}>
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              {isSyncing ? 'Checking…' : 'Refresh from InPASS'}
            </button>
            <button onClick={exportCSV} style={{ ...btn, background: NAVY, color: 'var(--color-paper-white)' }}>
              <Download style={{ width: '14px', height: '14px' }} />
              CSV ({filteredRecords.length})
            </button>
          </div>
        </div>

        {syncMessage && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: MUTED, background: PANEL, border: `1px solid ${LINE}`, borderRadius: '12px', padding: '9px 12px' }}>
            {syncMessage}
          </div>
        )}

        {/* search bar */}
        <div style={{ marginTop: '16px', background: PANEL, border: `1px solid ${LINE}`, borderRadius: '15px', padding: '24px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#9ca3af' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by publication number, title, applicant, inventor or IPC — e.g. IN 202411048912, CSIR-NML, C22B"
              style={inputStyle}
              aria-label="Search patents"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} aria-label="Clear" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: FAINT, display: 'flex' }}>
                <X style={{ width: '15px', height: '15px' }} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
            <div style={{ fontSize: '13px', color: MUTED }}>
              {isLoadingRecords ? (
                'Loading live records…'
              ) : (
                <>
                  <strong style={{ color: INK }}>{filteredRecords.length}</strong> of {records.length} records
                  {usingLiveData && <span> · live</span>}
                </>
              )}
              {bookmarkedIds.length > 0 && <span> · {bookmarkedIds.length} saved</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: MUTED }}>
              <label htmlFor="pat-sort">Sort</label>
              <select id="pat-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ ...selectStyle, width: 'auto' }}>
                <option value="date-desc">Filing date, newest</option>
                <option value="date-asc">Filing date, oldest</option>
                <option value="citations-desc">Most cited</option>
                <option value="trl-desc">Highest TRL</option>
              </select>
            </div>
          </div>
        </div>

        {/* body: sidebar + results */}
        <div className="pat-grid" style={{ display: 'grid', gridTemplateColumns: '248px 1fr', gap: '16px', marginTop: '16px', alignItems: 'start' }}>
          {/* sidebar */}
          <aside className="pat-side" style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: '15px', padding: '4px 16px 12px', position: 'sticky', top: '88px', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${LINE}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="badge badge-indigo" style={{ fontSize: '10px', padding: '1px 8px' }}>{activeFilterCount} on</span>
                )}
              </div>
              {hasFilters && (
                <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: NAVY, fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                  Clear all
                </button>
              )}
            </div>

            <FilterGroup title="Mineral" icon={Atom}>
              <RadioRow name="min" value="all" current={selectedMineral} onChange={setSelectedMineral} label="All minerals" count={records.length} />
              {CRITICAL_MINERALS.slice(0, 8).map((m) => (
                <RadioRow key={m.id} name="min" value={m.name} current={selectedMineral} onChange={setSelectedMineral} label={`${m.name} (${m.symbol})`} count={mineralCounts[m.name] || 0} />
              ))}
            </FilterGroup>

            <FilterGroup title="Value-chain stage" icon={Layers}>
              {[
                ['all', 'All stages'],
                ['upstream', 'Upstream extraction'],
                ['midstream', 'Midstream refining'],
                ['downstream', 'Downstream manufacturing'],
                ['circular', 'Circular / recycling'],
              ].map(([v, l]) => (
                <RadioRow key={v} name="cat" value={v} current={selectedCategory} onChange={setSelectedCategory} label={l} />
              ))}
            </FilterGroup>

            <FilterGroup title="Legal status" icon={Scale}>
              {[
                ['all', 'All statuses'],
                ['published', 'Published'],
                ['examination', 'Under examination'],
                ['granted', 'Granted'],
              ].map(([v, l]) => (
                <RadioRow key={v} name="st" value={v} current={selectedStatus} onChange={setSelectedStatus} label={l} />
              ))}
            </FilterGroup>

            <div style={{ padding: '14px 0' }}>
              <div style={{ ...sectionLabel, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-graphite)' }}>
                <Gauge aria-hidden="true" style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                Readiness (TRL)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <RadioRow name="trl" value="all" current={selectedTRL} onChange={setSelectedTRL} label="All TRL 1–9" />
              <RadioRow name="trl" value="low" current={selectedTRL} onChange={setSelectedTRL} label="TRL 1–4 · Lab" />
              <RadioRow name="trl" value="mid" current={selectedTRL} onChange={setSelectedTRL} label="TRL 5–6 · Pilot" />
              <RadioRow name="trl" value="high" current={selectedTRL} onChange={setSelectedTRL} label="TRL 7–9 · Commercial" />
              </div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  fontSize: '13px',
                  fontWeight: bookmarksOnly ? 600 : 400,
                  color: bookmarksOnly ? 'var(--color-ink)' : 'var(--color-graphite)',
                  background: bookmarksOnly ? 'var(--color-lavender-mist)' : 'transparent',
                  border: bookmarksOnly ? '1px solid var(--color-haze)' : '1px solid transparent',
                  borderRadius: '10px',
                  padding: '7px 10px',
                  margin: '6px -10px 0',
                  cursor: 'pointer',
                  transition: 'background 150ms ease, border-color 150ms ease',
                }}
                onMouseEnter={(e) => { if (!bookmarksOnly) e.currentTarget.style.background = 'rgba(43, 46, 58, 0.04)'; }}
                onMouseLeave={(e) => { if (!bookmarksOnly) e.currentTarget.style.background = 'transparent'; }}
              >
                <input type="checkbox" checked={bookmarksOnly} onChange={(e) => setBookmarksOnly(e.target.checked)} style={{ accentColor: 'var(--color-electric-indigo)', width: '14px', height: '14px', flexShrink: 0, cursor: 'pointer', margin: 0 }} />
                Saved records only
              </label>
            </div>
          </aside>

          {/* results */}
          <section style={{ minWidth: 0 }}>
            {/* stats row — mirrors research KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '14px' }}>
              {[
                ['Records', filteredRecords.length, '', '', `${records.length} indexed`, false],
                ['Granted', filteredRecords.filter((r) => r.grantStatus.toLowerCase().includes('grant')).length, '', '', 'in current view', false],
                ['Mean TRL', filteredRecords.reduce((a, r) => a + r.trl, 0) / (filteredRecords.length || 1), '', ' / 9', 'readiness', false],
                ['Citations', filteredRecords.reduce((a, r) => a + (r.citations || 0), 0), ',', '', 'forward cites', true],
              ].map(([k, to, sep, suffix, s, accent]) => (
                <SpotlightCard key={k} className="card card-interactive" spotlightColor="rgba(26, 47, 251, 0.09)" style={{ padding: '18px 22px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-graphite)', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>{k}</div>
                  <div style={{ fontSize: '28px', fontWeight: 500, color: accent ? 'var(--color-electric-indigo)' : 'var(--color-ink)', marginTop: '4px' }}><CountUp to={to} separator={sep} duration={1.2} />{suffix}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-graphite)', marginTop: '2px' }}>{s}</div>
                </SpotlightCard>
              ))}
            </div>

            {/* active filter tokens */}
            {hasFilters && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {searchQuery.trim() && (
                  <button onClick={() => setSearchQuery('')} style={tokenStyle}>“{searchQuery.trim().slice(0, 28)}” <X style={{ width: '12px', height: '12px' }} /></button>
                )}
                {selectedMineral !== 'all' && (
                  <button onClick={() => setSelectedMineral('all')} style={tokenStyle}>{selectedMineral} <X style={{ width: '12px', height: '12px' }} /></button>
                )}
                {selectedCategory !== 'all' && (
                  <button onClick={() => setSelectedCategory('all')} style={tokenStyle}>{selectedCategory} <X style={{ width: '12px', height: '12px' }} /></button>
                )}
                {selectedStatus !== 'all' && (
                  <button onClick={() => setSelectedStatus('all')} style={tokenStyle}>{selectedStatus} <X style={{ width: '12px', height: '12px' }} /></button>
                )}
                {selectedTRL !== 'all' && (
                  <button onClick={() => setSelectedTRL('all')} style={tokenStyle}>TRL {selectedTRL} <X style={{ width: '12px', height: '12px' }} /></button>
                )}
                {bookmarksOnly && (
                  <button onClick={() => setBookmarksOnly(false)} style={tokenStyle}>Saved only <X style={{ width: '12px', height: '12px' }} /></button>
                )}
              </div>
            )}

            {filteredRecords.length === 0 ? (
              <div style={{ background: PANEL, border: `1px solid ${LINE}`, borderRadius: '15px', padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontFamily: SERIF, fontSize: '19px', marginBottom: '6px' }}>No records match these filters</div>
                <div style={{ fontSize: '13px', color: MUTED, marginBottom: '16px', lineHeight: 1.6 }}>
                  Try “lithium”, “CSIR-NML”, publication no. “IN 202411048912”, or IPC subclass “C22B”.
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['lithium', 'C22B', 'CSIR'].map((s) => (
                    <button key={s} onClick={() => setSearchQuery(s)} style={{ ...btn, background: NAVY_SOFT, borderColor: LINE, color: NAVY }}>
                      Try “{s}”
                    </button>
                  ))}
                  <button onClick={resetFilters} style={{ ...btn, background: NAVY, color: 'var(--color-paper-white)' }}>Clear filters</button>
                </div>
              </div>
            ) : (
              <div className="pat-tiles" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                {filteredRecords.map((p) => (
                  <div key={p.id} className="pat-cell" style={{ gridColumn: 'span 6' }}>
                    <PatentTile
                      p={p}
                      saved={bookmarkedIds.includes(p.id)}
                      onOpen={() => setSelectedPatent(p)}
                      onToggleSave={(e) => toggleBookmark(p.id, e)}
                    />
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: '12px', color: FAINT, lineHeight: 1.6, marginTop: '12px' }}>
              Bibliographic data compiled from IPO InPASS and normalised to IPC / value-chain taxonomies.
              TRL values are editorial assessments of specification enablement, not examination outcomes.
              Confirm legal status by file inspection at ipindiaservices.gov.in before freedom-to-operate or licensing use.
            </p>
          </section>
        </div>
      </div>

      {selectedPatent && (
        <PatentDrawer patent={selectedPatent} onClose={() => setSelectedPatent(null)} onCopy={() => handleCopyCitation(selectedPatent)} copied={copiedId === selectedPatent.id} />
      )}

      <style>{`
        button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible { outline: 2px solid ${NAVY}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .pat-side label { transition: none !important; } }
        @media (prefers-reduced-motion: reduce) { .pat-drawer { transition: none !important; } }
        .pat-drawer { scrollbar-width: none; -ms-overflow-style: none; }
        .pat-drawer::-webkit-scrollbar { display: none; }
        @media (max-width: 1024px) { .pat-cell { grid-column: span 12 !important; } }
        @media (max-width: 900px) { .pat-grid { grid-template-columns: 1fr !important; } .pat-side { position: static !important; } }
      `}</style>
    </div>
  );
}

function PatentDrawer({ patent, onClose, onCopy, copied }) {
  const st = statusOf(patent.grantStatus);
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

  const cells = [
    ['Publication no.', patent.publicationNumber, false],
    ['Applicant', patent.applicant, false],
    ['Inventors', (patent.inventors || []).join('; '), false],
    ['Filing / publication', formatDate(patent.filingDate), false],
    ['Office', 'Indian Patent Office (IN)', false],
    ['Mineral / stage', `${patent.mineral} — ${patent.category}`, false],
    ['Legal status (as indexed)', patent.grantStatus, false],
    ['Forward citations', String(patent.citations || 0), false],
  ];

  return (
    <div
      onClick={handleClose}
      className="pat-drawer-backdrop"
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
        aria-label={patent.title}
        className="pat-drawer"
        style={{
          background: PANEL,
          borderRadius: '24px',
          width: 'min(960px, 100%)',
          maxHeight: '88vh',
          overflowY: 'auto',
          border: `1px solid ${LINE}`,
          boxShadow: '0 20px 50px rgba(16, 24, 40, 0.25)',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
          opacity: open ? 1 : 0,
          transition: open
            ? 'transform 0.45s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease'
            : 'transform 0.3s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.2s ease',
          willChange: 'transform, opacity',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '28px 36px 20px', borderBottom: `1px solid ${LINE}`, position: 'sticky', top: 0, background: PANEL, zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="badge badge-indigo">{patent.mineral}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: st.fg, background: st.bg, border: `1px solid ${st.bd}`, borderRadius: '20px', padding: '4px 12px' }}>{st.label}</span>
              <span className="badge">TRL {patent.trl} / 9</span>
              <span className="badge badge-emerald">{patent.citations || 0} Citations</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 500, lineHeight: 1.3, color: 'var(--color-ink)' }}>
              {patent.title}
            </h2>
            <code style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', fontWeight: 700, color: NAVY, display: 'block', marginTop: '6px' }}>{patent.publicationNumber}</code>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--color-lavender-mist)',
              border: `1px solid ${LINE}`,
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              padding: '16px',
              borderRadius: '14px',
              background: 'var(--color-lavender-mist)',
              border: `1px solid ${LINE}`,
              marginBottom: '24px',
              fontSize: '12px',
            }}
          >
            {cells.map(([k, v]) => (
              <div key={k}>
                <span style={{ color: 'var(--color-graphite)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                  {k}
                </span>
                <span style={{ fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px', display: 'block' }}>
                  {v || '—'}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>
              Abstract
            </div>
            <div
              style={{
                padding: '18px',
                borderRadius: '14px',
                background: 'var(--color-paper-white)',
                border: `1px solid ${LINE}`,
                fontSize: '13px',
                lineHeight: 1.65,
                color: 'var(--color-ink)',
              }}
            >
              {patent.abstract}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>IPC (WIPO IPC-8)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(patent.ipcCodes || []).map((c) => (
                  <code key={c} style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '12px', border: `1px solid ${LINE}`, borderRadius: '4px', padding: '3px 8px', background: NAVY_SOFT }}>{c}</code>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>Readiness</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-ink)' }}>TRL {patent.trl} / 9</div>
              <div style={{ height: '5px', background: LINE, borderRadius: '99px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${(patent.trl / 9) * 100}%`, height: '100%', background: NAVY }} />
              </div>
              <div style={{ fontSize: '12px', color: FAINT, marginTop: '6px' }}>1 basic research → 9 proven operation</div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '16px',
              borderTop: `1px solid ${LINE}`,
            }}
          >
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href={patent.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn-pill btn-pill-indigo" style={{ fontSize: '12px', padding: '12px 20px' }}>
                <ExternalLink style={{ width: '13px', height: '13px' }} /> <span>Open in InPASS</span>
              </a>
              <button onClick={onCopy} className="btn-pill btn-pill-outline" style={{ fontSize: '12px', padding: '12px 20px' }}>
                {copied ? 'Copied' : 'Copy citation'}
              </button>
            </div>
            <Link to={`/chat?patent=${encodeURIComponent(patent.publicationNumber)}`} className="btn-pill" style={{ fontSize: '12px', padding: '12px 20px' }}>
              <Sparkles style={{ width: '13px', height: '13px' }} /> <span>Ask in AI chat</span>
            </Link>
          </div>
          <div style={{ fontSize: '11.5px', color: FAINT, marginTop: '12px', lineHeight: 1.55 }}>
            Cite as: {patent.applicant}. “{patent.title}.” {patent.publicationNumber}, filed {formatDate(patent.filingDate)}. Indian Patent Office.
          </div>
        </div>
      </div>
    </div>
  );
}
