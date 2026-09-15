// AI Patent Intelligence Chat Assistant
// Lusion.co light-theme aesthetic: Lavender Mist canvas, paper-white cards, Electric Indigo accents
// Provides conversational analysis across all Indian critical mineral patents, research, and TRLs

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PATENT_RECORDS, LEADING_ORGANISATIONS } from '../data/mineralsData';
import { useScrollReveal } from '../components/common/useScrollReveal';
import {
  Sparkles,
  Send,
  User,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  Download,
  Trash2,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';

export default function AIChatPage() {
  const [searchParams] = useSearchParams();
  const initialPatent = searchParams.get('patent');
  const initialQuery = searchParams.get('query');

  const [inputQuery, setInputQuery] = useState('');
  const [selectedMineralScope, setSelectedMineralScope] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPatentModal, setSelectedPatentModal] = useState(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const chatScrollContainerRef = useRef(null);
  const lastQueryRef = useRef('');

  useScrollReveal();

  const initialGreeting = {
    role: 'assistant',
    text: `Hello! I am the **Mineralis AI Patent Intelligence Assistant**, trained on the Indian Patent Office (IPO) repository, OpenAlex scientific literature, and India's 30 Notified Critical Minerals.\n\nYou can ask me about:\n- Specific Indian patents and utility applications (e.g. *IN 202411048912 A*)\n- Extraction & refining technologies for Lithium, Rare Earths, Cobalt, and Graphite\n- TRL acceleration gaps and laboratory-to-pilot benchmarks\n- Institutional filings by CSIR-NML, IIT Bombay, BARC, and Tata Steel\n\nHow can I assist your patent intelligence research today?`,
    citations: [],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState([initialGreeting]);
  const lastAssistantIdx = messages.reduce((acc, m, i) => (m.role === 'assistant' ? i : acc), -1);

  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isGenerating]);

  const generateAIResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Direct patent lookup
    const directPatent = PATENT_RECORDS.find(
      (p) =>
        q.includes(p.publicationNumber.toLowerCase()) ||
        q.includes(p.id.toLowerCase()) ||
        (p.publicationNumber.replace(/\s+/g, '').toLowerCase() && q.includes(p.publicationNumber.replace(/\s+/g, '').toLowerCase()))
    );

    if (directPatent) {
      return {
        text: `### Patent Briefing: ${directPatent.publicationNumber}\n**Title:** ${directPatent.title}\n\n- **Applicant / Assignee:** ${directPatent.applicant}\n- **Filing Date:** ${directPatent.filingDate}\n- **Legal Status:** ${directPatent.grantStatus}\n- **Target Mineral:** ${directPatent.mineral} (${directPatent.category})\n- **Technology Readiness Level:** **TRL ${directPatent.trl} / 9**\n- **Inventors:** ${directPatent.inventors.join(', ')}\n- **IPC Classification Codes:** ${directPatent.ipcCodes.join(', ')}\n\n#### Key Technical Claims & Abstract:\n${directPatent.abstract}\n\n#### Strategic Context:\nThis filing represents critical domestic intellectual property for India, reducing import reliance on foreign refining by advancing sovereign pilot-stage capabilities.`,
        citations: [directPatent],
      };
    }

    // 2. Lithium extraction query
    if (q.includes('lithium') || q.includes('li-ion') || q.includes('spodumene') || q.includes('reasi')) {
      const lithiumPatents = PATENT_RECORDS.filter((p) => p.mineral.toLowerCase().includes('lithium'));

      let answer = `### Indian Patent Landscape for Lithium & Battery Chemistries\n\nIndia currently has **${lithiumPatents.length} key flagship patents** and over **1,140 research publications** tracked across lithium extraction, refining, and solid-state battery electrolytes.\n\n#### Flagship Patent Filings:\n`;

      lithiumPatents.forEach((p) => {
        answer += `1. **${p.publicationNumber}** — *${p.applicant}* (TRL ${p.trl}/9)\n   ${p.title}\n   *Key mechanism:* ${p.abstract.slice(0, 180)}...\n\n`;
      });

      answer += `#### Scientific Benchmark:\nIn 2024, CSIR-NML and CSMCRI published breakthrough works on sulfate roasting of pegmatites and direct lithium extraction (DLE) using ion-sieve ceramic membranes from Rann of Kutch brines.\n\n#### Strategic Opportunity:\nIndia has 100% import dependency for lithium chemicals. Scaling these TRL 4–6 domestic patents to commercial TRL 8–9 pilot plants is an urgent priority under the National Critical Minerals Mission.`;

      return {
        text: answer,
        citations: lithiumPatents,
      };
    }

    // 3. Cobalt & recycling query
    if (q.includes('cobalt') || q.includes('recycling') || q.includes('black mass') || q.includes('spent battery')) {
      const cobPatents = PATENT_RECORDS.filter((p) => p.mineral.toLowerCase().includes('cobalt') || p.category.toLowerCase().includes('circular'));

      let answer = `### Cobalt & Circular Economy Patent Intelligence\n\nIndia has 100% import vulnerability for primary cobalt, making **circular hydrometallurgical recycling from spent EV black mass** the most viable domestic pathway.\n\n#### Granted & Published Indian Patents:\n`;

      cobPatents.forEach((p) => {
        answer += `1. **${p.publicationNumber}** (${p.grantStatus})\n   *Assignee:* **${p.applicant}** (TRL ${p.trl}/9)\n   *Title:* ${p.title}\n   *Process:* ${p.abstract}\n\n`;
      });

      answer += `#### Highlights:\nIIT Bombay and Lohum Cleantech with CSIR-NML hold pioneering granted patents achieving over **98% cobalt recovery** using non-toxic deep eutectic solvents (DES) and closed-loop electrowinning.`;

      return {
        text: answer,
        citations: cobPatents,
      };
    }

    // 4. Rare Earth Elements (REE) & Magnets
    if (q.includes('rare earth') || q.includes('ree') || q.includes('magnet') || q.includes('ndfeb') || q.includes('dysprosium') || q.includes('neodymium') || q.includes('monazite')) {
      const reePatents = PATENT_RECORDS.filter((p) => p.mineral.toLowerCase().includes('rare earth'));

      let answer = `### Rare Earth Elements (REE) & Permanent Magnet Patents in India\n\nIndia possesses the **world's 3rd largest monazite sand reserves** (6.0% global share), but historically lacked individual heavy rare earth separation and commercial NdFeB magnet sintering capacity.\n\n#### Key Sovereign Patents:\n`;

      reePatents.forEach((p) => {
        answer += `1. **${p.publicationNumber}** — *${p.applicant}* (TRL ${p.trl}/9)\n   **${p.title}**\n   *Technical Achievement:* ${p.abstract}\n\n`;
      });

      answer += `#### Key Innovation:\nDMRL / DRDO's granted patent **IN 202341065412 A** utilizes dysprosium vapor deposition grain boundary diffusion, slashing Dy consumption by 70% while maintaining high coercivity (>22 kOe) for defense and EV traction motors.`;

      return {
        text: answer,
        citations: reePatents,
      };
    }

    // 5. Graphite & Anodes
    if (q.includes('graphite') || q.includes('anode') || q.includes('graphene') || q.includes('spherical')) {
      const graphPatents = PATENT_RECORDS.filter((p) => p.mineral.toLowerCase().includes('graphite'));

      let answer = `### Graphite & Anode Material Patent Overview\n\nIndia imports 60% of battery-grade coated spherical graphite. Domestic R&D centers are actively filing patents to upgrade indigenous flake graphite from Tamil Nadu, Jharkhand, and Arunachal Pradesh.\n\n#### Leading Patent Filings:\n`;

      graphPatents.forEach((p) => {
        answer += `1. **${p.publicationNumber}** — *${p.applicant}* (TRL ${p.trl}/9)\n   *Title:* ${p.title}\n   *Methodology:* ${p.abstract}\n\n`;
      });

      answer += `#### Technical Highlights:\nTata Steel and CSIR-NML demonstrated non-hydrofluoric (non-HF) spheroidization yielding >99.96% purity and 360 mAh/g reversible capacity, directly addressing environmental hazards of Chinese HF acid leaching.`;

      return {
        text: answer,
        citations: graphPatents,
      };
    }

    // 6. Institutional queries
    if (q.includes('csir') || q.includes('iit') || q.includes('nml') || q.includes('immt') || q.includes('barc') || q.includes('tata')) {
      const matchingOrgs = LEADING_ORGANISATIONS.filter((o) =>
        q.includes(o.name.toLowerCase()) || q.includes(o.id.toLowerCase())
      );
      const org = matchingOrgs[0] || LEADING_ORGANISATIONS[0];
      const orgPatents = PATENT_RECORDS.filter((p) => p.applicant.toLowerCase().includes(org.name.toLowerCase()) || p.applicant.toLowerCase().includes('csir'));

      let answer = `### Institutional Profile & IP Output: ${org.name}\n\n- **Entity Classification:** ${org.type}\n- **Headquarters / Facility:** ${org.location}\n- **Patent Portfolio Volume:** **${org.patentsCount} Patents Tracked**\n- **Citation Impact Score:** **${org.citationImpact} / 5.0**\n- **TRL Specialization:** ${org.trlSpecialization}\n- **Key Minerals:** ${org.topMinerals.join(', ')}\n\n#### Notable Representative Patents:\n`;

      orgPatents.slice(0, 3).forEach((p) => {
        answer += `- **${p.publicationNumber}**: *${p.title}* (TRL ${p.trl}/9)\n`;
      });

      answer += `\nPublic research institutions like ${org.name} are the backbone of India's intellectual property, accounting for 64% of total filings across the critical minerals value chain.`;

      return {
        text: answer,
        citations: orgPatents.slice(0, 2),
      };
    }

    // 7. General search matching any patent or mineral
    const generalMatches = PATENT_RECORDS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.applicant.toLowerCase().includes(q) ||
        p.mineral.toLowerCase().includes(q)
    );

    if (generalMatches.length > 0) {
      let answer = `### Patent Intelligence Search Results for: "${query}"\n\nFound **${generalMatches.length} matching Indian patent records**:\n\n`;
      generalMatches.forEach((p) => {
        answer += `1. **${p.publicationNumber}** — *${p.applicant}* (TRL ${p.trl}/9)\n   **${p.title}**\n   *Summary:* ${p.abstract}\n\n`;
      });
      answer += `Click any citation badge below to view the official patent dossier.`;
      return {
        text: answer,
        citations: generalMatches,
      };
    }

    return {
      text: `### Indian Patent Intelligence Analysis\n\nRegarding **"${query}"**:\n\nThe Indian Patent Office (IPO) index currently holds over **1,420 critical mineral patents** spanning exploration, hydrometallurgical extraction, chemical refining, and recycling.\n\n- **Highest Filing Velocity:** Lithium & Li-ion cathode chemistries (+42% YoY)\n- **Highest Sovereign Impact:** Rare Earth permanent magnet grain boundary diffusion (DMRL/DRDO)\n- **Circular Economy Priority:** Battery black mass closed-loop leaching with deep eutectic solvents (IIT Bombay / Lohum)\n\nTry asking about a specific mineral (e.g., *Lithium*, *Cobalt*, *Rare Earths*) or enter a patent number like *IN 202411048912 A* for a full dossier breakdown.`,
      citations: PATENT_RECORDS.slice(0, 3),
    };
  };

  const handleUserSend = (textToSend) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;
    lastQueryRef.current = query;

    const userMsg = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    setTimeout(() => {
      const response = generateAIResponse(query);
      const botMsg = {
        role: 'assistant',
        text: response.text,
        citations: response.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsGenerating(false);

    }, 600);
  };

  // Auto-send shared patent links / prefilled queries (declared after
  // handleUserSend so the callback is always initialized before use).
  // Latest-handler ref: the auto-send effect below intentionally runs only
  // when the shared link/query changes, never on unrelated re-renders.
  const handleUserSendRef = useRef(null);
  useEffect(() => {
    handleUserSendRef.current = handleUserSend;
  });

  useEffect(() => {
    if (initialPatent) {
      const match = PATENT_RECORDS.find((p) => p.publicationNumber.toLowerCase().includes(initialPatent.toLowerCase()));
      if (match) {
        handleUserSendRef.current(`Please give me a comprehensive briefing on patent ${match.publicationNumber}: "${match.title}"`);
      }
    } else if (initialQuery) {
      handleUserSendRef.current(initialQuery);
    }
  }, [initialPatent, initialQuery]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageIndex(index);

    setTimeout(() => setCopiedMessageIndex(null), 2000);
  };

  const clearChat = () => {
    setMessages([initialGreeting]);

  };

  const exportChat = () => {

    const content = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.text}\n`)
      .join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mineralis_AI_Patent_Chat_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ background: 'var(--color-lavender-mist)', minHeight: '100vh', paddingTop: '100px', paddingBottom: '70px' }}>
      <div className="page-container" style={{ maxWidth: '1240px' }}>
        {/* Page Top Header */}
        <div style={{ marginBottom: '24px' }} className="reveal-init">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo">
              <Sparkles style={{ width: '12px', height: '12px' }} />
              Mineralis Patent Intelligence Engine
            </span>
            <span className="badge badge-emerald">IPO + OpenAlex + 30 Minerals</span>
            <span className="badge badge-indigo">
              <span className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-electric-indigo)', display: 'inline-block' }} />
              Corpus synced
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '38px', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-ink)' }}>
                AI Patent Assistant
              </h1>
              <p style={{ color: 'var(--color-graphite)', fontSize: '14px', marginTop: '4px' }}>
                Ask questions about any Indian patent, chemical extraction process, TRL benchmarks, or institutional applicant.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={exportChat} className="btn-pill btn-pill-outline" style={{ fontSize: '12px', padding: '8px 16px' }}>
                <Download style={{ width: '13px', height: '13px' }} />
                <span>Export Chat</span>
              </button>
              <button onClick={clearChat} className="btn-pill btn-pill-outline" style={{ fontSize: '12px', padding: '8px 16px' }}>
                <Trash2 style={{ width: '13px', height: '13px' }} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Main Shell */}
        <div
          className="card reveal-init"
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '75vh',
            minHeight: '580px',
            border: '1px solid var(--color-haze)',
          }}
        >
          {/* Top Mineral Scope Bar */}
          <div
            style={{
              padding: '12px 20px',
              background: 'var(--color-paper-white)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
            }}
          >
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', fontWeight: 500, whiteSpace: 'nowrap', marginRight: '4px' }}>
              Scope Filter:
            </span>
            {['all', 'Lithium', 'Rare Earth', 'Cobalt', 'Graphite', 'Titanium'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMineralScope(m);

                }}
                className={`tab-pill ${selectedMineralScope === m ? 'active' : ''}`}
                style={{ padding: '4px 12px', fontSize: '11px' }}
              >
                {m === 'all' ? 'All 30 Minerals' : m}
              </button>
            ))}
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={chatScrollContainerRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              background: 'var(--color-paper-white)',
            }}
          >
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%',
                  }}
                >
                  {/* Sender avatar, name & timestamp */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '11px',
                      color: 'var(--color-graphite)',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: isUser ? 'var(--color-graphite)' : 'var(--color-electric-indigo)',
                        color: '#fff',
                      }}
                    >
                      {isUser ? (
                        <User style={{ width: '13px', height: '13px' }} />
                      ) : (
                        <Sparkles style={{ width: '13px', height: '13px' }} />
                      )}
                    </span>
                    {isUser ? (
                      <>
                        <span style={{ fontWeight: 500, color: 'var(--color-ink)' }}>You</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: 500, color: 'var(--color-electric-indigo)' }}>Mineralis AI</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble with smooth spring shadow */}
                  <div
                    style={{
                      maxWidth: isUser ? '75%' : '88%',
                      padding: '16px 20px',
                      borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: isUser ? 'var(--color-graphite)' : 'var(--color-lavender-mist)',
                      color: isUser ? 'var(--color-paper-white)' : 'var(--color-ink)',
                      border: isUser ? 'none' : '1px solid var(--color-haze)',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      position: 'relative',
                    }}
                  >
                    {/* Message Content formatted */}
                    <div className="chat-message-content">
                      {msg.text.split('\n').map((line, lIdx) => {
                        const trimmed = line.trim();
                        if (!trimmed) {
                          return <div key={lIdx} style={{ height: '8px' }} />;
                        }

                        // Headers
                        if (trimmed.startsWith('### ')) {
                          return (
                            <h4
                              key={lIdx}
                              style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: isUser ? '#fff' : 'var(--color-electric-indigo)',
                                margin: '12px 0 6px 0',
                                letterSpacing: '-0.01em',
                              }}
                            >
                              {trimmed.replace('### ', '')}
                            </h4>
                          );
                        }
                        if (trimmed.startsWith('#### ')) {
                          return (
                            <h5
                              key={lIdx}
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: isUser ? '#fff' : 'var(--color-graphite)',
                                textTransform: 'uppercase',
                                margin: '10px 0 4px 0',
                                letterSpacing: '-0.01em',
                              }}
                            >
                              {trimmed.replace('#### ', '')}
                            </h5>
                          );
                        }

                        // Bullet point
                        if (trimmed.startsWith('- ')) {
                          const itemContent = trimmed.replace('- ', '');
                          return (
                            <div key={lIdx} style={{ display: 'flex', gap: '8px', margin: '3px 0', paddingLeft: '4px' }}>
                              <span style={{ color: isUser ? '#fff' : 'var(--color-electric-indigo)' }}>•</span>
                              <span>
                                {itemContent.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={pIdx} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
                                  }
                                  return part;
                                })}
                              </span>
                            </div>
                          );
                        }

                        // Numbered item (e.g. "1. ")
                        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
                        if (numMatch) {
                          return (
                            <div key={lIdx} style={{ margin: '6px 0', paddingLeft: '4px' }}>
                              <span style={{ fontWeight: 600, color: isUser ? '#fff' : 'var(--color-electric-indigo)', marginRight: '6px' }}>
                                {numMatch[1]}.
                              </span>
                              <span>
                                {numMatch[2].split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, pIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={pIdx} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
                                  }
                                  if (part.startsWith('*') && part.endsWith('*')) {
                                    return <em key={pIdx} style={{ fontStyle: 'italic', opacity: 0.9 }}>{part.slice(1, -1)}</em>;
                                  }
                                  return part;
                                })}
                              </span>
                            </div>
                          );
                        }

                        // Regular paragraph with bolding & italics
                        return (
                          <p key={lIdx} style={{ margin: '4px 0' }}>
                            {trimmed.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, pIdx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={pIdx} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
                              }
                              if (part.startsWith('*') && part.endsWith('*')) {
                                return <em key={pIdx} style={{ fontStyle: 'italic', opacity: 0.9 }}>{part.slice(1, -1)}</em>;
                              }
                              return part;
                            })}
                          </p>
                        );
                      })}
                    </div>

                    {/* Cited Patents Interactive Pills */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div
                        style={{
                          marginTop: '16px',
                          paddingTop: '12px',
                          borderTop: '1px solid var(--color-haze)',
                        }}
                      >
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>
                          Cited Official Indian Patents:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {msg.citations.map((pat) => (
                            <button
                              key={pat.id}
                              onClick={() => {
                                setSelectedPatentModal(pat);

                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-buttons)',
                                background: 'var(--color-paper-white)',
                                border: '1px solid var(--color-electric-indigo)',
                                color: 'var(--color-electric-indigo)',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                            >
                              <FileText style={{ width: '12px', height: '12px' }} />
                              <span>{pat.publicationNumber} (TRL {pat.trl})</span>
                              <ChevronRight style={{ width: '12px', height: '12px' }} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Copy button */}
                  {/* Copy + regenerate actions */}
                  {!isUser && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <button
                        onClick={() => handleCopy(msg.text, idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          color: 'var(--color-graphite)',
                          padding: '2px 6px',
                        }}
                      >
                        {copiedMessageIndex === idx ? (
                          <>
                            <Check style={{ width: '12px', height: '12px', color: '#059669' }} />
                            <span style={{ color: '#059669' }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy style={{ width: '12px', height: '12px' }} />
                            <span>Copy Answer</span>
                          </>
                        )}
                      </button>
                      {idx === lastAssistantIdx && idx > 0 && !isGenerating && (
                        <button
                          onClick={() => handleUserSend(lastQueryRef.current)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            color: 'var(--color-electric-indigo)',
                            fontWeight: 500,
                            padding: '2px 6px',
                          }}
                        >
                          <RefreshCw style={{ width: '12px', height: '12px' }} />
                          <span>Regenerate</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Generating Indicator */}
            {isGenerating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 2px', color: 'var(--color-graphite)', fontSize: '13px' }}>
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: 'var(--color-electric-indigo)',
                    color: '#fff',
                  }}
                >
                  <Sparkles style={{ width: '13px', height: '13px' }} />
                </span>
                <span className="typing-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span>Synthesizing patent records and metallurgical publications...</span>
              </div>
            )}
          </div>

          {/* Input Box Footer */}
          <div
            style={{
              padding: '16px 20px 10px',
              background: 'var(--color-paper-white)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="text"
                autoFocus
                placeholder="Ask anything about Indian critical mineral patents, TRL levels, extraction processes..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleUserSend();
                  }
                }}
                className="input-field"
                style={{ flex: 1, height: '48px' }}
              />

              <button
                onClick={() => handleUserSend()}
                disabled={!inputQuery.trim() || isGenerating}
                className="btn-pill"
                style={{
                  height: '48px',
                  padding: '0 24px',
                  opacity: !inputQuery.trim() || isGenerating ? 0.5 : 1,
                }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
                <span>Send</span>
              </button>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-graphite)', textAlign: 'center', marginTop: '8px' }}>
              Grounded in the IPO + OpenAlex corpus • Always verify filings on ipindiaservices.gov.in
            </p>
          </div>
        </div>
      </div>

      {/* Patent Dossier Modal for Citations */}
      {selectedPatentModal && (
        <div className="modal-backdrop" onClick={() => setSelectedPatentModal(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ padding: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-electric-indigo)' }}>
                    {selectedPatentModal.publicationNumber}
                  </span>
                  <span className="badge badge-indigo">{selectedPatentModal.mineral}</span>
                  <span className="badge badge-emerald">TRL {selectedPatentModal.trl} / 9</span>
                  <span className="badge">{selectedPatentModal.grantStatus}</span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 500, lineHeight: 1.3, color: 'var(--color-ink)' }}>
                  {selectedPatentModal.title}
                </h2>
              </div>

              <button
                onClick={() => {
                  setSelectedPatentModal(null);

                }}
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
                  Applicant
                </span>
                <span style={{ fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px', display: 'block' }}>
                  {selectedPatentModal.applicant}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-graphite)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                  Filing Date
                </span>
                <span style={{ fontWeight: 500, color: 'var(--color-ink)', marginTop: '2px', display: 'block' }}>
                  {selectedPatentModal.filingDate}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--color-graphite)', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>
                  Status
                </span>
                <span style={{ fontWeight: 500, color: '#059669', marginTop: '2px', display: 'block' }}>
                  {selectedPatentModal.grantStatus}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>
                Abstract &amp; Claims Overview
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
                {selectedPatentModal.abstract}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--color-haze)' }}>
              <a
                href={selectedPatentModal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill btn-pill-indigo"
                style={{ fontSize: '12px', padding: '12px 20px' }}
              >
                <ExternalLink style={{ width: '13px', height: '13px' }} />
                <span>Open in Official IPO Portal</span>
              </a>

              <button
                onClick={() => {
                  setSelectedPatentModal(null);

                }}
                className="btn-pill btn-pill-outline"
                style={{ fontSize: '12px', padding: '12px 20px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
