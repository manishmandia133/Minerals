// Help / Support Center — guides, FAQs and troubleshooting for Minerals.
// Matches Lusion light-theme: lavender mist canvas, Aeonik, badge + card primitives.
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../components/common/useScrollReveal';
import SplitText from '../components/bits/SplitText';
import SpotlightCard from '../components/bits/SpotlightCard';
import {
  LifeBuoy,
  Search,
  BookOpen,
  Database,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ArrowUpRight,
  CircleHelp,
  Zap,
  ShieldCheck,
  Mail,
} from 'lucide-react';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const MIST = 'var(--color-lavender-mist)';
const INDIGO = 'var(--color-electric-indigo)';

const GUIDES = [
  {
    icon: Database,
    title: 'Search patents',
    desc: 'Filter IPO records by mineral, IPC code, TRL and grant status on the Patents page.',
    to: '/patents',
    cta: 'Open Patents',
  },
  {
    icon: BookOpen,
    title: 'Explore research',
    desc: 'Find OpenAlex papers, citation impact and institutional output by mineral.',
    to: '/research',
    cta: 'Open Research',
  },
  {
    icon: TrendingUp,
    title: 'Read trends',
    desc: 'Use velocity charts and domestic-share analytics to spot fast-moving minerals.',
    to: '/trends',
    cta: 'Open Trends',
  },
  {
    icon: Sparkles,
    title: 'Ask Minerals AI',
    desc: 'Ask plain-language questions — e.g. “Which orgs lead lithium recycling?”',
    to: '/chat',
    cta: 'Open AI Chat',
  },
];

const FAQS = [
  {
    group: 'Getting started',
    q: 'What is Minerals?',
    a: 'Minerals is a Smart Technology & Patent Tracker for critical minerals. It brings together Indian Patent Office (IPO InPASS) records, OpenAlex research papers, trend analytics and an AI assistant so you can see who is innovating, what is maturing, and where India still depends on imports.',
  },
  {
    group: 'Getting started',
    q: 'Where do I start as a first-time user?',
    a: 'Start on Overview (/) for the big picture, then go to Patents to search records, Trends & Velocity for decade filing curves, Ecosystem for institutions and technology gaps, and AI Chat when you want a plain-language answer with sources.',
  },
  {
    group: 'Patents',
    q: 'What patent data is covered?',
    a: 'Critical-minerals filings in the Indian Patent Office register (InPASS) — titles, applicants, IPC codes, filing/publication dates, TRL estimates and legal status (granted, pending, lapsed). Use the mineral, status and TRL filters on /patents to narrow results.',
  },
  {
    group: 'Patents',
    q: 'What do TRL levels mean?',
    a: 'Technology Readiness Level runs 1–9: 1–3 is lab research, 4–6 is pilot validation, 7–9 is deployment-ready. Minerals shows an estimated India TRL per record so you can separate bench chemistry from scalable processes.',
  },
  {
    group: 'Research',
    q: 'Where do research papers come from?',
    a: 'Peer-reviewed papers indexed via OpenAlex, mapped to minerals and Indian institutions (CSIR labs, IITs, PSUs, industry R&D). Citation impact and yearly output are shown on /research.',
  },
  {
    group: 'Trends',
    q: 'How should I read the Trends & Velocity page?',
    a: 'Look at decade filing curves for momentum, the velocity view for year-on-year growth speed, and domestic-vs-foreign share for sovereignty signal. A rising curve with low domestic share means opportunity — and import risk.',
  },
  {
    group: 'AI Chat',
    q: 'How does the AI Assistant work?',
    a: 'The assistant answers from the same patent + research + ecosystem data behind the site. Ask comparative or explanatory questions (“Compare lithium extraction routes by TRL”). Always verify high-stakes decisions against the linked patent or paper record.',
  },
  {
    group: 'AI Chat',
    q: 'The AI gave an unexpected answer. What should I do?',
    a: 'Rephrase with the mineral, year range or institution named explicitly, and check the cited record IDs. If something looks wrong, report it via Contact (see below) with the exact question text and a screenshot.',
  },
  {
    group: 'Troubleshooting',
    q: 'Search returns no results. What now?',
    a: 'Clear one filter at a time (status, TRL, year), check spelling of minerals (“rare earth” vs “rare-earth”), and try a broader IPC prefix. Some niche processes only exist under older applicant name variants.',
  },
  {
    group: 'Troubleshooting',
    q: 'A page looks broken or data looks stale. How do I report it?',
    a: 'Note the page URL, the filters you had applied, and what you expected. Send it via the Contact card below — reports with the record ID (patent number or OpenAlex ID) get triaged fastest.',
  },
  {
    group: 'Data & terms',
    q: 'Can I reuse Minerals data in a report or publication?',
    a: 'Summaries and charts may be reused with attribution to Minerals and the underlying source (IPO InPASS / OpenAlex). Reproducing full patent specifications should follow the original publisher terms — see the Terms page for details.',
  },
  {
    group: 'Data & terms',
    q: 'Is my chat history stored?',
    a: 'Conversations are processed to generate answers and may be retained for quality and abuse-prevention. Do not paste confidential, personal or export-controlled information into the chat.',
  },
];

const GROUPS = ['All', ...Array.from(new Set(FAQS.map((f) => f.group)))];

export default function HelpPage() {
  useScrollReveal();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All');
  const [openIdx, setOpenIdx] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.map((f, i) => ({ ...f, i })).filter((f) => {
      if (group !== 'All' && f.group !== group) return false;
      if (!q) return true;
      return `${f.q} ${f.a} ${f.group}`.toLowerCase().includes(q);
    });
  }, [query, group]);

  return (
    <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">Support Center</span>
            <span className="badge">Guides • FAQs • Troubleshooting</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: INK }}>
            <SplitText
              text="Help & how to use Minerals"
              tag="span"
              splitType="words"
              textAlign="left"
              delay={55}
              duration={0.9}
              from={{ opacity: 0, y: 32 }}
              to={{ opacity: 1, y: 0 }}
            />
          </h1>
          <p style={{ color: GRAPHITE, fontSize: '15px', marginTop: '8px', maxWidth: '720px' }}>
            Everything you need to search patents, read research, interpret trends
            and get the most from the AI assistant.
          </p>
        </div>

        {/* Search + group filter */}
        <div className="reveal-init card" style={{ padding: '18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
              <Search style={{ width: '15px', height: '15px', color: GRAPHITE, position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-field"
                style={{ paddingLeft: '36px' }}
                placeholder="Search help — e.g. “TRL”, “no results”, “AI”"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search help articles"
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {GROUPS.map((g) => (
                <button
                  key={g}
                  className={`tab-pill ${group === g ? 'active' : ''}`}
                  onClick={() => setGroup(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div style={{ fontSize: '12px', color: GRAPHITE, marginTop: '10px' }}>
            Showing {results.length} of {FAQS.length} answers
            {query.trim() && <> for “{query.trim()}”</>}
          </div>
        </div>

        {/* Guides */}
        <div className="reveal-init" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', marginBottom: '28px' }}>
          {GUIDES.map(({ icon: Icon, title, desc, to, cta }) => (
            <Link key={title} to={to} style={{ textDecoration: 'none' }}>
              <SpotlightCard className="card card-interactive" spotlightColor="rgba(26, 47, 251, 0.09)" style={{ padding: '20px', height: '100%' }}>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: MIST, border: `1px solid ${HAZE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Icon style={{ width: '17px', height: '17px', color: INK }} />
                </span>
                <div style={{ fontSize: '15px', fontWeight: 500, color: INK }}>{title}</div>
                <div style={{ fontSize: '13px', color: GRAPHITE, marginTop: '4px', lineHeight: 1.55 }}>{desc}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: INDIGO, marginTop: '12px' }}>
                  {cta} <ArrowUpRight style={{ width: '13px', height: '13px' }} />
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', alignItems: 'start' }}>
          {/* FAQ accordion */}
          <div style={{ gridColumn: 'span 8', minWidth: 0 }} className="help-faq reveal-init">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '12px' }}>
              <CircleHelp style={{ width: '14px', height: '14px' }} />
              <span>Frequently asked questions</span>
            </div>
            {results.length === 0 && (
              <div className="card" style={{ padding: '28px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: INK, marginBottom: '6px' }}>No answers match your search</div>
                <div style={{ fontSize: '13px', color: GRAPHITE, marginBottom: '14px' }}>Try a shorter keyword like “patent”, “TRL” or “AI”.</div>
                <button className="btn-pill btn-pill-outline" style={{ fontSize: '12px' }} onClick={() => { setQuery(''); setGroup('All'); }}>
                  Clear search
                </button>
              </div>
            )}
            {results.map((f) => {
              const open = openIdx === f.i;
              return (
                <div key={f.i} className="card" style={{ padding: 0, marginBottom: '10px', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenIdx(open ? -1 : f.i)}
                    aria-expanded={open}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
                  >
                    <span>
                      <span className="badge" style={{ fontSize: '10px', marginBottom: '6px' }}>{f.group}</span>
                      <span style={{ display: 'block', fontSize: '15px', fontWeight: 500, color: INK, lineHeight: 1.4 }}>{f.q}</span>
                    </span>
                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${HAZE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                      <ChevronDown style={{ width: '14px', height: '14px', color: GRAPHITE }} />
                    </span>
                  </button>
                  {open && (
                    <div className="grid-enter" style={{ padding: '0 18px 18px', fontSize: '13.5px', color: GRAPHITE, lineHeight: 1.65, borderTop: `1px solid ${HAZE}`, paddingTop: '14px', margin: '0 18px 18px', paddingLeft: 0, paddingRight: 0 }}>
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Side rail */}
          <div style={{ gridColumn: 'span 4', minWidth: 0, position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '14px' }} className="help-side reveal-init">
            <div className="card" style={{ padding: '22px', background: 'var(--color-graphite)', borderColor: 'var(--color-graphite)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--color-haze)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
                <Zap style={{ width: '13px', height: '13px' }} />
                <span>Fastest way to an answer</span>
              </div>
              <div style={{ fontSize: '19px', fontWeight: 500, color: 'var(--color-paper-white)', lineHeight: 1.3, marginBottom: '8px' }}>
                Ask Minerals AI in plain language.
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(240,241,250,0.75)', lineHeight: 1.6, marginBottom: '16px' }}>
                It searches the same patents, papers and ecosystem data — with sources attached.
              </p>
              <Link
                to={`/chat?query=${encodeURIComponent('How do I find lithium battery-recycling patents by Indian applicants?')}`}
                className="btn-pill"
                style={{ background: 'var(--color-paper-white)', color: INK, fontSize: '12px', justifyContent: 'center', width: '100%' }}
              >
                <Sparkles style={{ width: '13px', height: '13px' }} />
                <span>Try an example question</span>
              </Link>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: GRAPHITE, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
                <ShieldCheck style={{ width: '13px', height: '13px' }} />
                <span>Data you can trust</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: GRAPHITE, lineHeight: 1.55 }}>
                <li><strong style={{ color: INK }}>Patents:</strong> Indian Patent Office (InPASS) critical-minerals register.</li>
                <li><strong style={{ color: INK }}>Research:</strong> OpenAlex-indexed peer-reviewed papers.</li>
                <li><strong style={{ color: INK }}>Analytics:</strong> computed filing velocity & domestic share.</li>
              </ul>
              <Link to="/terms" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: INDIGO, marginTop: '14px', textDecoration: 'none' }}>
                Read the Terms of Use <ArrowUpRight style={{ width: '13px', height: '13px' }} />
              </Link>
            </div>

            <div className="card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: GRAPHITE, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '10px' }}>
                <Mail style={{ width: '13px', height: '13px' }} />
                <span>Still stuck? Contact us</span>
              </div>
              <p style={{ fontSize: '13px', color: GRAPHITE, lineHeight: 1.6, marginBottom: '12px' }}>
                Include the page URL, filters applied and — for data issues — the patent or paper ID.
              </p>
              <a href="mailto:support@minerals.example" className="btn-pill btn-pill-outline" style={{ fontSize: '12px', justifyContent: 'center', width: '100%' }}>
                <LifeBuoy style={{ width: '13px', height: '13px' }} />
                <span>support@minerals.example</span>
              </a>
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: '48px' }} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .help-faq, .help-side { grid-column: span 12 !important; }
          .help-side { position: static !important; }
        }
      `}</style>
    </div>
  );
}
