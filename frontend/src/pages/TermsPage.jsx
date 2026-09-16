// Terms of Use — plain-language legal page for Minerals.
// Matches Lusion light-theme: lavender mist canvas, Aeonik, badge + card primitives.
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../components/common/useScrollReveal';
import SplitText from '../components/bits/SplitText';
import {
  Scale,
  Database,
  ShieldCheck,
  CircleAlert,
  FileText,
  Mail,
  ArrowUpRight,
  Check,
} from 'lucide-react';

const INK = 'var(--color-ink)';
const GRAPHITE = 'var(--color-graphite)';
const HAZE = 'var(--color-haze)';
const MIST = 'var(--color-lavender-mist)';
const INDIGO = 'var(--color-electric-indigo)';

const SECTIONS = [
  { id: 'acceptance', label: '1 · Acceptance' },
  { id: 'service', label: '2 · The service' },
  { id: 'data', label: '3 · Data sources' },
  { id: 'use', label: '4 · Acceptable use' },
  { id: 'ip', label: '5 · Intellectual property' },
  { id: 'ai', label: '6 · AI assistant' },
  { id: 'liability', label: '7 · Disclaimers' },
  { id: 'privacy', label: '8 · Privacy' },
  { id: 'changes', label: '9 · Changes & contact' },
];

function H2({ id, children }) {
  return (
    <h2 id={id} style={{ fontSize: '21px', fontWeight: 500, color: INK, letterSpacing: '-0.02em', marginBottom: '10px', scrollMarginTop: '110px' }}>
      {children}
    </h2>
  );
}

function P({ children }) {
  return <p style={{ fontSize: '14px', color: GRAPHITE, lineHeight: 1.7, marginBottom: '12px' }}>{children}</p>;
}

function Li({ children }) {
  return (
    <li style={{ display: 'flex', gap: '8px', fontSize: '14px', color: GRAPHITE, lineHeight: 1.65, marginBottom: '8px' }}>
      <Check style={{ width: '14px', height: '14px', color: INDIGO, flexShrink: 0, marginTop: '4px' }} />
      <span>{children}</span>
    </li>
  );
}

export default function TermsPage() {
  useScrollReveal();
  const [agreed, setAgreed] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ background: MIST, minHeight: '100vh', paddingTop: '100px' }}>
      <div className="page-container" style={{ maxWidth: '1360px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">Legal</span>
            <span className="badge">Effective 1 January 2026 · v1.2</span>
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.15, color: INK }}>
            <SplitText
              text="Terms of Use"
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
            The plain-language rules for using Minerals — a Smart Technology &amp; Patent
            Tracker for critical minerals. If you use the platform, these terms apply.
          </p>
        </div>

        {/* Summary strip */}
        <div className="reveal-init" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { icon: Database, t: 'Data is informational', d: 'Verify high-stakes decisions against the original IPO / OpenAlex record.' },
            { icon: ShieldCheck, t: 'Attribute reuse', d: 'Summaries & charts may be reused with credit to Minerals + source.' },
            { icon: CircleAlert, t: 'No confidential inputs', d: 'Never paste personal, secret or export-controlled data into chat.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="card card-interactive" style={{ padding: '18px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: MIST, border: `1px solid ${HAZE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: '16px', height: '16px', color: INK }} />
              </span>
              <span>
                <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: INK }}>{t}</span>
                <span style={{ display: 'block', fontSize: '12.5px', color: GRAPHITE, marginTop: '3px', lineHeight: 1.5 }}>{d}</span>
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px', alignItems: 'start' }}>
          {/* TOC */}
          <aside style={{ gridColumn: 'span 3', minWidth: 0, position: 'sticky', top: '100px' }} className="terms-toc reveal-init">
            <div className="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: GRAPHITE, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '12px' }}>
                <FileText style={{ width: '13px', height: '13px' }} />
                <span>On this page</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: 500, color: GRAPHITE, padding: '7px 10px', borderRadius: '8px', transition: 'background 0.15s ease, color 0.15s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = MIST; e.currentTarget.style.color = INK; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = GRAPHITE; }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: `1px solid ${HAZE}` }}>
                <Link to="/help" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: INDIGO, textDecoration: 'none' }}>
                  Visit Help Center <ArrowUpRight style={{ width: '13px', height: '13px' }} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Body */}
          <div style={{ gridColumn: 'span 9', minWidth: 0 }} className="terms-body reveal-init">
            <div className="card" style={{ padding: '32px' }}>
              <section style={{ marginBottom: '28px' }}>
                <H2 id="acceptance">1 · Acceptance of these terms</H2>
                <P>By accessing Minerals (“the platform”, “we”, “us”) you agree to these Terms of Use. If you use the platform on behalf of an organisation, you confirm you are authorised to accept on its behalf. If you do not agree, please do not use the platform.</P>
                <P>You must be legally able to enter contracts in your jurisdiction, and you are responsible for complying with local laws on patents, export controls and data protection.</P>
              </section>

              <div className="divider" style={{ margin: '0 0 28px' }} />

              <section style={{ marginBottom: '28px' }}>
                <H2 id="service">2 · What the service provides</H2>
                <P>Minerals aggregates and visualises public technology intelligence: patent search, research exploration, filing-trend analytics, ecosystem dossiers and an AI chat assistant. Features may change as we improve coverage and add minerals.</P>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <Li>Patent Explorer — searchable IPO records with IPC codes, TRL estimates and legal status.</Li>
                  <Li>Research Explorer — OpenAlex-indexed papers with citation and institutional analytics.</Li>
                  <Li>Trends &amp; Velocity — decade filing curves, growth velocity and domestic-share views.</Li>
                  <Li>Ecosystem — institutions, collaboration corridors and technology-gap dossiers.</Li>
                </ul>
              </section>

              <div className="divider" style={{ margin: '0 0 28px' }} />

              <section style={{ marginBottom: '28px' }}>
                <H2 id="data">3 · Data sources &amp; accuracy</H2>
                <P>Records are drawn from public sources — principally the Indian Patent Office InPASS register and OpenAlex — plus computed analytics (velocity, TRL estimates, gap assessments). We work to keep data current and correctly mapped, but public registers contain delays, name variants and classification quirks.</P>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <Li>Always verify filing dates, legal status and claims against the original IPO publication before legal, investment or procurement decisions.</Li>
                  <Li>TRL values and technology-gap ratings are expert-modelled estimates, not certifications.</Li>
                  <Li>Report mapping errors with the record ID (application number / OpenAlex ID) so we can correct them.</Li>
                </ul>
              </section>

              <div className="divider" style={{ margin: '0 0 28px' }} />

              <section style={{ marginBottom: '28px' }}>
                <H2 id="use">4 · Acceptable use</H2>
                <P>You agree to use the platform lawfully and to respect rate limits and access controls. In particular, you will not:</P>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <Li>Scrape, bulk-download or resell raw record dumps in ways that circumvent the interface.</Li>
                  <Li>Attempt to breach, probe or overload the service, or misrepresent your identity.</Li>
                  <Li>Submit unlawful, infringing, personal or export-controlled content via chat or forms.</Li>
                  <Li>Use outputs to file misleading patent, regulatory or investment claims.</Li>
                </ul>
                <P>We may suspend access for abuse, security risk or legal obligation, with notice where feasible.</P>
              </section>

              <div className="divider" style={{ margin: '0 0 28px' }} />

              <section style={{ marginBottom: '28px' }}>
                <H2 id="ip">5 · Intellectual property &amp; reuse</H2>
                <P>The Minerals interface, visualisations and computed analytics are our work product. Underlying patent texts and paper metadata remain the property of their publishers and applicants.</P>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <Li>You may reuse summaries, charts and AI answers with attribution: “Source: Minerals, via IPO InPASS / OpenAlex”.</Li>
                  <Li>Reproducing full patent specifications or paper PDFs is governed by the original publisher&apos;s terms.</Li>
                  <Li>Feedback you send (bug reports, corrections) may be used to improve the platform without compensation.</Li>
                </ul>
              </section>

              <div className="divider" style={{ margin: '0 0 28px' }} />

              <section style={{ marginBottom: '28px' }}>
                <H2 id="ai">6 · AI assistant notice</H2>
                <P>The AI assistant generates explanatory answers from platform data. It can make mistakes, misread ambiguous queries or reflect gaps in source coverage. AI output is decision support — not legal, technical or investment advice.</P>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <Li>Check cited patent / paper IDs before relying on an answer.</Li>
                  <Li>Do not submit confidential or sensitive information in chat prompts.</Li>
                  <Li>Conversations may be logged for quality, safety and abuse-prevention.</Li>
                </ul>
              </section>

              <div className="divider" style={{ margin: '0 0 28px' }} />

              <section style={{ marginBottom: '28px' }}>
                <H2 id="liability">7 · Disclaimers &amp; limitation of liability</H2>
                <P>The platform is provided “as is” without warranties of completeness, timeliness or fitness for a particular purpose. To the maximum extent permitted by law, we are not liable for indirect or consequential losses arising from reliance on platform content — including lapsed-status errors, TRL misreads or AI hallucinations.</P>
                <P>Nothing here limits liability that cannot be limited by law, nor your obligation to verify critical facts against primary sources.</P>
              </section>

              <div className="divider" style={{ margin: '0 0 28px' }} />

              <section style={{ marginBottom: '28px' }}>
                <H2 id="privacy">8 · Privacy in brief</H2>
                <P>We collect only what is needed to run the service: usage telemetry, chat prompts for quality and safety, and contact emails you send us. We do not sell personal data. A full privacy notice will be published alongside the production launch; until then, minimise personal data in all inputs.</P>
              </section>

              <div className="divider" style={{ margin: '0 0 28px' }} />

              <section>
                <H2 id="changes">9 · Changes, governing terms &amp; contact</H2>
                <P>We may update these terms as coverage and features evolve; material changes will be noted by a new version and effective date at the top of this page. Continued use after the effective date constitutes acceptance.</P>
                <div className="card" style={{ padding: '18px 20px', background: MIST, boxShadow: 'none', display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '14px' }}>
                  <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--color-paper-white)', border: `1px solid ${HAZE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail style={{ width: '15px', height: '15px', color: INK }} />
                  </span>
                  <span>
                    <span style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: INK }}>Questions about these terms?</span>
                    <span style={{ display: 'block', fontSize: '13px', color: GRAPHITE, marginTop: '2px' }}>
                      Email <a href="mailto:legal@minerals.example" style={{ color: INDIGO, fontWeight: 600 }}>legal@minerals.example</a> — include the section number you&apos;re asking about.
                    </span>
                  </span>
                </div>
              </section>

              {/* Acknowledge */}
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: `1px solid ${HAZE}`, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setAgreed(!agreed)}
                  aria-pressed={agreed}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: agreed ? INDIGO : 'var(--color-paper-white)', color: agreed ? '#fff' : INK, border: `1px solid ${agreed ? INDIGO : HAZE}`, borderRadius: '999px', padding: '10px 18px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '-0.02em' }}
                >
                  {agreed && <Check style={{ width: '13px', height: '13px' }} />}
                  {agreed ? 'Understood — thanks' : 'Mark as read'}
                </button>
                <span style={{ fontSize: '12px', color: GRAPHITE }}>
                  {agreed ? 'Acknowledged locally in this browser. Continued use constitutes acceptance.' : 'Optional — records nothing server-side; just tracks your reading.'}
                </span>
              </div>
            </div>

            {/* Version history */}
            <div className="card" style={{ padding: '20px 24px', marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Scale style={{ width: '16px', height: '16px', color: GRAPHITE, flexShrink: 0, marginTop: '3px' }} />
              <div style={{ fontSize: '12.5px', color: GRAPHITE, lineHeight: 1.65 }}>
                <strong style={{ color: INK }}>Version history:</strong> v1.2 (1 Jan 2026) — added AI-assistant notice &amp; attribution rule.
                v1.1 (1 Nov 2025) — added TRL/gap estimate disclaimer. v1.0 (15 Sep 2025) — initial publication.
              </div>
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: '48px' }} />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .terms-toc, .terms-body { grid-column: span 12 !important; }
          .terms-toc { position: static !important; }
        }
      `}</style>
    </div>
  );
}
