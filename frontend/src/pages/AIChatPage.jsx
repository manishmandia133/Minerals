// AI Patent Intelligence Chat Assistant
// Lusion.co light-theme aesthetic: Lavender Mist canvas, paper-white cards, Electric Indigo accents
// Provides conversational analysis across all Indian critical mineral patents, research, and TRLs

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PATENT_RECORDS, LEADING_ORGANISATIONS } from '../data/mineralsData';
import { useScrollReveal } from '../components/common/useScrollReveal';
import { askRAG } from '../api.client';
import MineralsLogo from '../components/common/MineralsLogo';
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
  ChevronDown,
  X,
  FileText,
  Building2,
  FlaskConical,
  TrendingUp,
  AlertCircle,
  BarChart2,
  ArrowLeft,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Dedupe — the DB can return duplicate rows (same id, or same content
// ingested twice under different ids). Never show the same entry twice.
// ---------------------------------------------------------------------------
function dedupeRagItems(items) {
  if (!Array.isArray(items) || items.length <= 1) return items || [];
  const seenIds = new Set();
  const seenContent = new Set();
  const norm = (v) =>
    String(v ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  const result = [];
  for (const item of items) {
    if (!item || typeof item !== 'object') {
      if (seenContent.has(item)) continue;
      seenContent.add(item);
      result.push(item);
      continue;
    }
    const hasIdentity =
      item.id != null ||
      item.title != null ||
      item.organisation != null ||
      item.publicationNumber != null;
    if (!hasIdentity) {
      const flat = JSON.stringify(item);
      if (seenContent.has(flat)) continue;
      seenContent.add(flat);
      result.push(item);
      continue;
    }
    const idKey =
      item.id != null
        ? `${item.document_type ?? 'item'}::${String(item.id).trim()}`
        : null;
    const contentKey =
      `${norm(item.title)}|${norm(item.organisation)}|` +
      `${norm(item.mineral)}|${norm(item.technology_area)}|` +
      `${norm(item.abstract).slice(0, 200)}|` +
      `${norm(item.publicationNumber)}`;
    const isEmptyContent =
      !norm(item.title) &&
      !norm(item.organisation) &&
      !norm(item.abstract) &&
      !norm(item.publicationNumber);
    const effectiveContentKey = isEmptyContent ? JSON.stringify(item) : contentKey;
    if ((idKey && seenIds.has(idKey)) || seenContent.has(effectiveContentKey)) {
      continue;
    }
    if (idKey) seenIds.add(idKey);
    seenContent.add(effectiveContentKey);
    result.push(item);
  }
  return result;
}

function dedupeRagData(ragData) {
  if (!ragData || typeof ragData !== 'object') return ragData;
  return {
    ...ragData,
    sources: Array.isArray(ragData.sources) ? dedupeRagItems(ragData.sources) : ragData.sources,
    opportunities: Array.isArray(ragData.opportunities)
      ? dedupeRagItems(ragData.opportunities)
      : ragData.opportunities,
  };
}

// ---------------------------------------------------------------------------
// RAGChart — pure SVG chart for bar / line / pie / scatter
// Only renders when getChartableData() finds a real quantitative breakdown;
// otherwise returns null so no filler graph is shown.
// ---------------------------------------------------------------------------
const CHART_FONT = 'Inter, var(--font-aeonik), system-ui, -apple-system, sans-serif';
const CHART_GRID = '#e9edf3';
const CHART_AXIS = '#d3d9e1';
const CHART_TICK = '#9aa3b2';
const CHART_LABEL = '#5b6472';

function RAGChart({ sources, chartType }) {
  const chartable = getChartableData(sources);
  if (!chartable) return null;
  const { labelKey, valueKey, data } = chartable;
  const pretty = (k) => String(k).replace(/_/g, ' ');

  const COLORS = [
    '#6366f1', '#818cf8', '#059669', '#34d399', '#f59e0b',
    '#f87171', '#38bdf8', '#a78bfa', '#fb923c', '#4ade80',
  ];

  const W = 560;
  const H = 280;
  const PAD = { top: 20, right: 20, bottom: 60, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const shortLabel = (l) => (l.length > 12 ? l.slice(0, 12) + '…' : l);

  // ---------- BAR ----------
  if (!chartType || chartType === 'bar') {
    const barW = Math.max(10, (innerW / data.length) * 0.62);
    const gap = innerW / data.length;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={CHART_FONT} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Y grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + innerH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke={CHART_GRID} strokeWidth="1" />
              <text x={PAD.left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill={CHART_TICK}>
                {Math.round(maxVal * t).toLocaleString()}
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {data.map((d, i) => {
          const x = PAD.left + gap * i + (gap - barW) / 2;
          const bh = Math.max(2, (d.value / maxVal) * innerH);
          const y = PAD.top + innerH - bh;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bh} fill={COLORS[i % COLORS.length]} rx="5" opacity="0.94" />
              <text x={x + barW / 2} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="10" fill={CHART_LABEL}
                transform={`rotate(-28, ${x + barW / 2}, ${H - PAD.bottom + 14})`}>
                {shortLabel(d.label)}
              </text>
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="10.5" fill={COLORS[i % COLORS.length]} fontWeight="700">
                {d.value.toLocaleString()}
              </text>
            </g>
          );
        })}
        {/* Axis */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke={CHART_AXIS} strokeWidth="1" />
        <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH} stroke={CHART_AXIS} strokeWidth="1" />
        <text x={PAD.left - 38} y={PAD.top + innerH / 2} textAnchor="middle" fontSize="10" fill={CHART_TICK}
          transform={`rotate(-90, ${PAD.left - 38}, ${PAD.top + innerH / 2})`}>{pretty(valueKey)}</text>
        <text x={PAD.left + innerW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={CHART_TICK}>{pretty(labelKey)}</text>
      </svg>
    );
  }

  // ---------- LINE ----------
  if (chartType === 'line') {
    const pts = data.map((d, i) => {
      const x = PAD.left + (i / (data.length - 1 || 1)) * innerW;
      const y = PAD.top + innerH - (d.value / maxVal) * innerH;
      return [x, y];
    });
    const polyline = pts.map((p) => p.join(',')).join(' ');
    return (
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={CHART_FONT} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + innerH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke={CHART_GRID} strokeWidth="1" />
              <text x={PAD.left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill={CHART_TICK}>{Math.round(maxVal * t).toLocaleString()}</text>
            </g>
          );
        })}
        {/* Fill area */}
        <polygon
          points={`${PAD.left},${PAD.top + innerH} ${polyline} ${PAD.left + innerW},${PAD.top + innerH}`}
          fill="rgba(99,102,241,0.09)"
        />
        <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4.5" fill="#6366f1" stroke="#fff" strokeWidth="2" />
            <text x={x} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="10" fill={CHART_LABEL}
              transform={`rotate(-28, ${x}, ${H - PAD.bottom + 14})`}>
              {shortLabel(data[i].label)}
            </text>
          </g>
        ))}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke={CHART_AXIS} strokeWidth="1" />
        <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH} stroke={CHART_AXIS} strokeWidth="1" />
        <text x={PAD.left + innerW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={CHART_TICK}>{pretty(labelKey)}</text>
      </svg>
    );
  }

  // ---------- PIE ----------
  if (chartType === 'pie') {
    const total = data.reduce((s, d) => s + d.value, 0) || 1;
    const cx = W / 2 + 60, cy = H / 2 - 6, r = Math.min(innerW - 130, innerH) / 2 - 6;
    let angle = -Math.PI / 2;
    const slices = data.map((d, i) => {
      const sweep = (d.value / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      angle += sweep;
      const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle);
      const large = sweep > Math.PI ? 1 : 0;
      const mid = angle - sweep / 2;
      return { path: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`, color: COLORS[i % COLORS.length], mid, pct: Math.round((d.value / total) * 100), label: d.label };
    });
    return (
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={CHART_FONT} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {slices.map((s, i) => (
          <g key={i}>
            <path d={s.path} fill={s.color} opacity="0.92" stroke="#fff" strokeWidth="2.5" />
            {s.pct > 5 && (
              <text x={cx + (r * 0.65) * Math.cos(s.mid)} y={cy + (r * 0.65) * Math.sin(s.mid) + 4}
                textAnchor="middle" fontSize="10.5" fill="#fff" fontWeight="700">{s.pct}%</text>
            )}
          </g>
        ))}
        {/* Legend */}
        {slices.map((s, i) => (
          <g key={i} transform={`translate(12, ${PAD.top + i * 20})`}>
            <rect width="11" height="11" fill={s.color} rx="3" />
            <text x="17" y="9.5" fontSize="10.5" fill={CHART_LABEL}>{shortLabel(s.label)} ({s.pct}%)</text>
          </g>
        ))}
      </svg>
    );
  }

  // ---------- SCATTER ----------
  if (chartType === 'scatter') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} fontFamily={CHART_FONT} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + innerH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke={CHART_GRID} strokeWidth="1" />
              <text x={PAD.left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill={CHART_TICK}>{Math.round(maxVal * t).toLocaleString()}</text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const x = PAD.left + (i / (data.length - 1 || 1)) * innerW;
          const y = PAD.top + innerH - (d.value / maxVal) * innerH;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5.5" fill={COLORS[i % COLORS.length]} opacity="0.9" stroke="#fff" strokeWidth="1.5" />
              <text x={x} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="10" fill={CHART_LABEL}
                transform={`rotate(-28, ${x}, ${H - PAD.bottom + 14})`}>
                {shortLabel(d.label)}
              </text>
            </g>
          );
        })}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke={CHART_AXIS} strokeWidth="1" />
        <line x1={PAD.left} y1={PAD.top + innerH} x2={W - PAD.right} y2={PAD.top + innerH} stroke={CHART_AXIS} strokeWidth="1" />
        <text x={PAD.left + innerW / 2} y={H - 6} textAnchor="middle" fontSize="10" fill={CHART_TICK}>{pretty(labelKey)}</text>
      </svg>
    );
  }

  return null;
}

// ---------------------------------------------------------------------------
// PDF chart rendering — draws the same bar / line / pie / scatter charts as
// RAGChart onto a canvas so they can be embedded as PNGs in the chat PDF.
// ---------------------------------------------------------------------------
const PDF_CHART_COLORS = [
  '#6366f1', '#818cf8', '#059669', '#34d399', '#f59e0b',
  '#f87171', '#38bdf8', '#a78bfa', '#fb923c', '#4ade80',
];

function getChartableData(sources) {
  // Only real quantitative breakdowns deserve a chart. Raw research/patent
  // documents (keys like id / document_type / title) carry no plottable
  // numbers — rendering those produced the meaningless flat graphs.
  if (!Array.isArray(sources) || sources.length < 2) return null;
  const firstItem = sources[0];
  if (!firstItem || typeof firstItem !== 'object') return null;
  const keys = Object.keys(firstItem);
  if (keys.length < 2) return null;
  const ID_LIKE = /^(id|_id|uuid|pk|external_id)$/i;
  let labelKey = keys[0];
  let valueKey = keys[1];
  if (ID_LIKE.test(labelKey)) {
    if (keys.length < 3) return null;
    labelKey = keys[1];
    valueKey = keys[2];
  }
  if (ID_LIKE.test(labelKey)) return null;
  const parsed = sources
    .map((s) => ({
      label: String(s[labelKey] ?? '').trim(),
      value: Number(s[valueKey]),
    }))
    .filter((d) => d.label && Number.isFinite(d.value));
  // At least two real numeric points, non-zero, with actual variation —
  // a flat all-equal series carries no insight worth charting.
  if (parsed.length < 2) return null;
  const values = parsed.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  if (!(max > 0) || !(max > min)) return null;
  const CHART_MAX_POINTS = 12;
  const truncated = parsed.length > CHART_MAX_POINTS;
  return {
    labelKey,
    valueKey,
    data: parsed.slice(0, CHART_MAX_POINTS),
    total: parsed.length,
    truncated,
  };
}

function renderChartImageForPdf(sources, chartType) {
  try {
    const parsed = getChartableData(sources);
    if (!parsed) return null;
    const { labelKey, valueKey, data } = parsed;
    const type = chartType || 'bar';

    const CW = 960;
    const CH = 440;
    const PAD = { top: 32, right: 32, bottom: 96, left: 88 };
    const innerW = CW - PAD.left - PAD.right;
    const innerH = CH - PAD.top - PAD.bottom;
    const maxVal = Math.max(...data.map((d) => d.value), 1);

    const canvas = document.createElement('canvas');
    canvas.width = CW;
    canvas.height = CH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CW, CH);

    const hexToRgb = (hex) => {
      const h = hex.replace('#', '');
      return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
      ];
    };

    const drawGrid = () => {
      ctx.font = '18px Helvetica, Arial, sans-serif';
      [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
        const y = PAD.top + innerH * (1 - t);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(PAD.left, y);
        ctx.lineTo(CW - PAD.right, y);
        ctx.stroke();
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(Math.round(maxVal * t)), PAD.left - 10, y);
      });
      // Axes
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(PAD.left, PAD.top);
      ctx.lineTo(PAD.left, PAD.top + innerH);
      ctx.lineTo(CW - PAD.right, PAD.top + innerH);
      ctx.stroke();
      // Axis captions
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(String(labelKey), PAD.left + innerW / 2, CH - 34);
      ctx.save();
      ctx.translate(26, PAD.top + innerH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(String(valueKey), 0, 0);
      ctx.restore();
    };

    const drawRotatedLabels = (xPositions) => {
      ctx.font = '17px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#6b7280';
      xPositions.forEach((x, i) => {
        const label = data[i].label.length > 12 ? `${data[i].label.slice(0, 12)}…` : data[i].label;
        ctx.save();
        ctx.translate(x, CH - PAD.bottom + 26);
        ctx.rotate(-Math.PI / 6);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      });
    };

    if (type === 'pie') {
      const total = data.reduce((s, d) => s + d.value, 0) || 1;
      const cx = data.length > 4 ? CW * 0.62 : CW / 2;
      const cy = CH / 2 - 8;
      const r = Math.min(innerW, innerH) / 2 - 8;
      let angle = -Math.PI / 2;
      const slices = data.map((d, i) => {
        const sweep = (d.value / total) * 2 * Math.PI;
        const s = {
          color: PDF_CHART_COLORS[i % PDF_CHART_COLORS.length],
          mid: angle + sweep / 2,
          pct: Math.round((d.value / total) * 100),
          label: d.label,
          start: angle,
          end: angle + sweep,
        };
        angle += sweep;
        return s;
      });
      slices.forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, s.start, s.end);
        ctx.closePath();
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.stroke();
        if (s.pct > 4) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            `${s.pct}%`,
            cx + r * 0.65 * Math.cos(s.mid),
            cy + r * 0.65 * Math.sin(s.mid)
          );
        }
      });
      // Legend
      ctx.font = '17px Helvetica, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      slices.forEach((s, i) => {
        const ly = PAD.top + i * 30;
        if (ly > CH - 30) return;
        ctx.fillStyle = s.color;
        ctx.fillRect(PAD.left, ly - 9, 18, 18);
        ctx.fillStyle = '#6b7280';
        const name = s.label.length > 20 ? `${s.label.slice(0, 20)}…` : s.label;
        ctx.fillText(`${name} (${s.pct}%)`, PAD.left + 26, ly);
      });
      ctx.font = '18px Helvetica, Arial, sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`${valueKey} by ${labelKey}`, cx, CH - 34);
    } else if (type === 'line' || type === 'scatter') {
      drawGrid();
      const pts = data.map((d, i) => [
        PAD.left + (i / (data.length - 1 || 1)) * innerW,
        PAD.top + innerH - (d.value / maxVal) * innerH,
      ]);
      if (type === 'line') {
        // Area fill
        ctx.beginPath();
        ctx.moveTo(PAD.left, PAD.top + innerH);
        pts.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(PAD.left + innerW, PAD.top + innerH);
        ctx.closePath();
        ctx.fillStyle = 'rgba(99,102,241,0.08)';
        ctx.fill();
        // Polyline
        ctx.beginPath();
        pts.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      pts.forEach(([x, y], i) => {
        ctx.beginPath();
        ctx.arc(x, y, type === 'line' ? 8 : 10, 0, 2 * Math.PI);
        ctx.fillStyle = type === 'line' ? '#6366f1' : PDF_CHART_COLORS[i % PDF_CHART_COLORS.length];
        ctx.globalAlpha = type === 'line' ? 1 : 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      drawRotatedLabels(pts.map(([x]) => x));
    } else {
      // ---------- BAR (default) ----------
      drawGrid();
      const gap = innerW / data.length;
      const barW = Math.max(16, gap * 0.65);
      data.forEach((d, i) => {
        const x = PAD.left + gap * i + (gap - barW) / 2;
        const bh = (d.value / maxVal) * innerH;
        const y = PAD.top + innerH - bh;
        const [rr, gg, bb] = hexToRgb(PDF_CHART_COLORS[i % PDF_CHART_COLORS.length]);
        ctx.fillStyle = `rgba(${rr},${gg},${bb},0.9)`;
        ctx.fillRect(x, y, barW, bh);
        // Value label
        ctx.fillStyle = PDF_CHART_COLORS[i % PDF_CHART_COLORS.length];
        ctx.font = 'bold 18px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(d.value), x + barW / 2, y - 6);
      });
      drawRotatedLabels(data.map((_, i) => PAD.left + gap * i + gap / 2));
    }

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// RAG Source Card — renders a single research / patent / opportunity entry
// ---------------------------------------------------------------------------
function RAGSourceCard({ item, type }) {
  const similarityPct = item.similarity != null ? Math.round(item.similarity * 100) : null;
  const isOpportunity = type === 'opportunity';

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: '10px',
        background: 'var(--color-paper-white)',
        border: `1px solid ${isOpportunity ? 'rgba(99,102,241,0.35)' : 'var(--color-haze)'}`,
        fontSize: '12px',
        lineHeight: 1.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Similarity bar */}
      {similarityPct != null && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '3px',
            width: `${similarityPct}%`,
            background: isOpportunity
              ? 'linear-gradient(90deg,#6366f1,#818cf8)'
              : 'linear-gradient(90deg,#059669,#34d399)',
            borderRadius: '10px 0 0 0',
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginTop: '4px' }}>
        <p style={{ fontWeight: 600, color: 'var(--color-ink)', margin: 0, flex: 1 }}>
          {item.title || item.organisation}
        </p>
        {similarityPct != null && (
          <span
            style={{
              flexShrink: 0,
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '20px',
              background: isOpportunity ? 'rgba(99,102,241,0.12)' : 'rgba(5,150,105,0.12)',
              color: isOpportunity ? '#6366f1' : '#059669',
            }}
          >
            {similarityPct}% match
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
        {item.organisation && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-graphite)' }}>
            <Building2 style={{ width: '11px', height: '11px' }} />
            {item.organisation}
          </span>
        )}
        {item.mineral && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-graphite)' }}>
            <FlaskConical style={{ width: '11px', height: '11px' }} />
            {item.mineral}
          </span>
        )}
        {item.technology_area && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-graphite)' }}>
            <TrendingUp style={{ width: '11px', height: '11px' }} />
            {item.technology_area}
          </span>
        )}
        {item.document_type && (
          <span className="badge">{item.document_type}</span>
        )}
        {isOpportunity && item.different_technology && (
          <span className="badge badge-indigo" style={{ fontSize: '10px' }}>Different tech</span>
        )}
      </div>

      {item.abstract && (
        <p style={{ margin: '8px 0 0', color: 'var(--color-graphite)', fontSize: '11px', lineHeight: 1.5 }}>
          {item.abstract.length > 220 ? item.abstract.slice(0, 220) + '…' : item.abstract}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RAG Sources Panel — renders research + opportunities / sources / gap block
// ---------------------------------------------------------------------------
const SOURCES_PREVIEW = 3; // how many to show before "View more"
const ANSWER_PREVIEW_LEN = 600; // chars before truncation

function RAGSourcesPanel({ ragData }) {
  const [showAllSources, setShowAllSources] = useState(false);
  const [showAllOpportunities, setShowAllOpportunities] = useState(false);

  if (!ragData) return null;
  const { research, gap, response_type, chart_type } = ragData;
  // De-duplicate at render time too — backend may send duplicate DB rows.
  const sources = dedupeRagItems(ragData.sources);
  const opportunities = dedupeRagItems(ragData.opportunities);

  const isChart = response_type === 'chart';
  // Charts only render for genuine quantitative breakdowns — see
  // getChartableData(). Raw document lists never produce filler graphs.
  const chartable = getChartableData(sources);
  const showChart = (isChart || (sources && sources.length > 5 && !isChart)) && !!chartable;

  const hasSources = sources && sources.length > 0;
  const hasOpportunities = opportunities && opportunities.length > 0;
  const hasResearch = !!research;
  const hasGap = !!gap;

  if (!hasSources && !hasOpportunities && !hasResearch && !hasGap) return null;

  const visibleSources = showAllSources ? sources : (sources || []).slice(0, SOURCES_PREVIEW);
  const visibleOpportunities = showAllOpportunities ? opportunities : (opportunities || []).slice(0, SOURCES_PREVIEW);

  const toggleBtnStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    marginTop: '8px', padding: '5px 12px', borderRadius: '20px',
    background: 'var(--color-lavender-mist)', border: '1px solid var(--color-haze)',
    fontSize: '11px', fontWeight: 500, color: 'var(--color-electric-indigo)',
    cursor: 'pointer', transition: 'all 0.15s',
  };

  return (
    <div
      style={{
        marginTop: '16px',
        paddingTop: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Chart — only for genuine quantitative breakdowns */}
      {showChart && hasSources && chartable && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span
              style={{
                width: '26px', height: '26px', borderRadius: '8px',
                background: 'rgba(99,102,241,0.12)', color: 'var(--color-electric-indigo)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <BarChart2 style={{ width: '14px', height: '14px' }} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.01em' }}>
                {isChart ? 'Data Chart' : 'Distribution Overview'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-graphite)' }}>
                {String(chartable.valueKey).replace(/_/g, ' ')} by {String(chartable.labelKey).replace(/_/g, ' ')}
                {chartable.truncated ? ` • showing first ${chartable.data.length} of ${chartable.total}` : ` • ${chartable.total} points`}
              </div>
            </div>
          </div>
          <div style={{ padding: '20px 20px 12px', borderRadius: '14px', background: 'var(--color-paper-white)', border: '1px solid var(--color-haze)', boxShadow: 'var(--shadow-sm)' }}>
            <RAGChart sources={sources} chartType={chart_type} />
          </div>
        </div>
      )}

      {/* Primary research document */}
      {hasResearch && (
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '6px', fontWeight: 500 }}>
            Reference Research
          </div>
          <RAGSourceCard item={research} type="research" />
        </div>
      )}

      {/* Semantic sources — hidden when chart-only mode */}
      {hasSources && !isChart && (
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '6px', fontWeight: 500 }}>
            Top Sources ({sources.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visibleSources.map((s, i) => (
              <RAGSourceCard key={`${s.document_type ?? 'source'}-${s.id ?? s.title ?? i}-${i}`} item={s} type="source" />
            ))}
          </div>
          {sources.length > SOURCES_PREVIEW && (
            <button style={toggleBtnStyle} onClick={() => setShowAllSources((v) => !v)}>
              <ChevronDown style={{ width: '12px', height: '12px', transform: showAllSources ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              {showAllSources ? 'Show less' : `View ${sources.length - SOURCES_PREVIEW} more`}
            </button>
          )}
        </div>
      )}

      {/* Collaboration opportunities */}
      {hasOpportunities && (
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '6px', fontWeight: 500 }}>
            Collaboration Opportunities ({opportunities.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {visibleOpportunities.map((o, i) => (
              <RAGSourceCard key={`${o.document_type ?? 'opportunity'}-${o.id ?? o.title ?? i}-${i}`} item={o} type="opportunity" />
            ))}
          </div>
          {opportunities.length > SOURCES_PREVIEW && (
            <button style={toggleBtnStyle} onClick={() => setShowAllOpportunities((v) => !v)}>
              <ChevronDown style={{ width: '12px', height: '12px', transform: showAllOpportunities ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              {showAllOpportunities ? 'Show less' : `View ${opportunities.length - SOURCES_PREVIEW} more`}
            </button>
          )}
        </div>
      )}

      {/* Gap analysis block */}
      {hasGap && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.3)',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#b45309', marginBottom: '6px' }}>
            <AlertCircle style={{ width: '13px', height: '13px' }} />
            Patent Gap Analysis
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: 'var(--color-graphite)' }}>
            <span><strong>Status:</strong> {gap.status?.replace(/_/g, ' ')}</span>
            {gap.closest_patent_similarity != null && (
              <span><strong>Closest patent:</strong> {Math.round(gap.closest_patent_similarity * 100)}% similar</span>
            )}
            {gap.patents_checked != null && (
              <span><strong>Patents checked:</strong> {gap.patents_checked}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIChatPage() {
  const [searchParams] = useSearchParams();
  const initialPatent = searchParams.get('patent');
  const initialQuery = searchParams.get('query');

  const [inputQuery, setInputQuery] = useState('');
  const [selectedMineralScope, setSelectedMineralScope] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPatentModal, setSelectedPatentModal] = useState(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [expandedAnswers, setExpandedAnswers] = useState(new Set());
  const chatScrollContainerRef = useRef(null);
  const lastQueryRef = useRef('');

  useScrollReveal();

  const initialGreeting = {
    role: 'assistant',
    text: `Hello! I am the **Minerals AI Patent Intelligence Assistant**, trained on the Indian Patent Office (IPO) repository, OpenAlex scientific literature, and India's 30 Notified Critical Minerals.\n\nYou can ask me about:\n- Specific Indian patents and utility applications (e.g. *IN 202411048912 A*)\n- Extraction & refining technologies for Lithium, Rare Earths, Cobalt, and Graphite\n- TRL acceleration gaps and laboratory-to-pilot benchmarks\n- Institutional filings by CSIR-NML, IIT Bombay, BARC, and Tata Steel\n\nHow can I assist your patent intelligence research today?`,
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

    // Build conversation history from current snapshot (before appending new user msg)
    const history = messages
      .slice(1) // skip the initial greeting
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));

    const userMsg = {
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // 1. Immediately append user message and show loading spinner
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    // 2. Fire RAG request
    askRAG({ question: query, history })
      .then((res) => {
        const d = res?.data ?? {};
        const answerText =
          d.answer ||
          (d.sources ? `Found ${d.sources.length} relevant source(s).` : 'No answer returned.');

        const botMsg = {
          role: 'assistant',
          text: answerText,
          ragData: dedupeRagData({
            research: d.research ?? null,
            opportunities: d.opportunities ?? null,
            sources: d.sources ?? null,
            gap: d.gap ?? null,
            response_type: d.response_type,
            chart_type: d.chart_type,
            resolvedQuestion: d.resolvedQuestion,
          }),
          citations: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      })
      .catch((err) => {
        console.error('[RAG] API error, falling back to local data:', err);
        // Fallback to local static data on API failure
        const response = generateAIResponse(query);
        const botMsg = {
          role: 'assistant',
          text: response.text,
          citations: dedupeRagItems(response.citations),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      })
      .finally(() => {
        setIsGenerating(false);
      });
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

  const exportChat = async () => {
    // Dynamically import jsPDF to keep the initial bundle lean
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 48;
    const usableW = pageW - margin * 2;
    let y = margin;

    const addPage = () => {
      doc.addPage();
      y = margin;
    };

    const checkY = (needed = 20) => {
      if (y + needed > pageH - margin) addPage();
    };

    // ---- Header ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // electric indigo
    doc.text('Minerals AI Patent Intelligence — Chat Export', margin, y);
    y += 24;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 130);
    doc.text(`Exported: ${new Date().toLocaleString()}  •  Messages: ${messages.length}`, margin, y);
    y += 6;

    doc.setDrawColor(200, 200, 215);
    doc.line(margin, y, pageW - margin, y);
    y += 18;

    // ---- Messages ----
    messages.forEach((msg) => {
      const isUser = msg.role === 'user';

      checkY(40);

      // Role label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(isUser ? 55 : 79, isUser ? 65 : 70, isUser ? 81 : 229);
      doc.text(
        `${isUser ? 'You' : 'Minerals AI'}   ${msg.timestamp || ''}`,
        margin,
        y
      );
      y += 14;

      // Body text — wrap long lines
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 40);

      // Strip markdown markers for cleaner PDF output
      const plainText = (msg.text || '')
        .replace(/###\s*/g, '')
        .replace(/####\s*/g, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1');

      const lines = doc.splitTextToSize(plainText, usableW);
      lines.forEach((line) => {
        checkY(13);
        doc.text(line, margin, y);
        y += 13;
      });

      // RAG sources summary
      if (msg.ragData) {
        const { research, response_type, chart_type } = msg.ragData;
        const sources = dedupeRagItems(msg.ragData.sources);
        const opportunities = dedupeRagItems(msg.ragData.opportunities);

        // Charts/graphs — same helpfulness gate as the on-screen chart, so
        // the PDF contains the same visuals as the chat (no filler graphs).
        const isChart = response_type === 'chart';
        const pdfChartable = getChartableData(sources);
        const showChart =
          !isUser &&
          (isChart || (sources && sources.length > 5 && !isChart)) &&
          !!pdfChartable;
        if (showChart) {
          const chartImg = renderChartImageForPdf(sources, chart_type);
          if (chartImg) {
            const imgW = usableW;
            const imgH = (imgW * 440) / 960;
            if (y + imgH + 30 > pageH - margin) addPage();
            checkY(16);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            doc.setTextColor(99, 102, 241);
            const chartTitle = `${isChart ? 'Data Chart' : 'Distribution Overview'}: ${String(pdfChartable.valueKey).replace(/_/g, ' ')} by ${String(pdfChartable.labelKey).replace(/_/g, ' ')}${pdfChartable.truncated ? ` (first ${pdfChartable.data.length} of ${pdfChartable.total})` : ''}`;
            doc.text(chartTitle, margin, y);
            y += 12;
            // Light panel behind the chart to match the chat UI
            doc.setFillColor(245, 243, 255);
            doc.setDrawColor(220, 218, 235);
            doc.rect(margin, y, imgW, imgH + 16, 'FD');
            try {
              doc.addImage(chartImg, 'PNG', margin + 8, y + 8, imgW - 16, imgH);
            } catch {
              // If image embedding fails, continue with text-only export
            }
            y += imgH + 16 + 10;
          }
        }

        const entries = [
          ...(research ? [{ label: 'Reference', item: research }] : []),
          ...(sources || []).map((s) => ({ label: 'Source', item: s })),
          ...(opportunities || []).map((o) => ({ label: 'Opportunity', item: o })),
        ];
        if (entries.length > 0) {
          checkY(16);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(99, 102, 241);
          doc.text('Sources & Opportunities:', margin, y);
          y += 12;
          entries.forEach(({ label, item }) => {
            const txt = `  [${label}] ${item.organisation || ''} — ${(item.title || '').slice(0, 80)}${(item.title || '').length > 80 ? '…' : ''}`;
            const wrapped = doc.splitTextToSize(txt, usableW - 10);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 100);
            wrapped.forEach((l) => {
              checkY(11);
              doc.text(l, margin + 4, y);
              y += 11;
            });
          });
        }
      }

      // Divider between messages
      checkY(14);
      doc.setDrawColor(230, 230, 240);
      doc.line(margin, y + 4, pageW - margin, y + 4);
      y += 18;
    });

    // ---- Footer on every page ----
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 175);
      doc.text(
        `Grounded in IPO + OpenAlex corpus  •  Page ${i} of ${totalPages}`,
        margin,
        pageH - 24
      );
    }

    doc.save(`Minerals_AI_Chat_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const SUGGESTED_QUERIES = [
    'Brief me on patent IN 202411048912 A',
    'Lithium extraction landscape in India',
    'Rare-earth magnet technology gaps',
    'Top cobalt recycling patents',
  ];

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f7f6ff 0%, var(--color-lavender-mist) 60%, #eef0f9 100%)',
      }}
    >
      {/* Top bar — back to dashboard, identity, actions */}
      <header
        style={{
          flexShrink: 0,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-haze)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
          className="chat-topbar"
        >
          <Link
            to="/"
            className="chat-backlink"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              color: 'var(--color-graphite)',
              fontSize: '13px',
              fontWeight: 500,
              padding: '6px 12px 6px 6px',
              borderRadius: '999px',
              border: '1px solid transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-lavender-mist)';
              e.currentTarget.style.borderColor = 'var(--color-haze)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <span
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--color-paper-white)',
                border: '1px solid var(--color-haze)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-ink)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <ArrowLeft style={{ width: '15px', height: '15px' }} />
            </span>
            <span className="chat-back-label">Back</span>
          </Link>

          <div className="chat-topdivider" style={{ width: '1px', height: '24px', background: 'var(--color-haze)' }} />

          <div className="chat-identity" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <MineralsLogo
              width={30}
              height={18}
              style={{ color: 'var(--color-ink)', flexShrink: 0, display: 'block' }}
            />
            <div style={{ minWidth: 0 }}>
              <div className="chat-identity-title" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                AI Patent Assistant
              </div>
            </div>
          </div>

          <div className="chat-topactions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
            <button onClick={exportChat} className="btn-pill btn-pill-outline" style={{ fontSize: '12px', padding: '8px 16px' }}>
              <Download style={{ width: '13px', height: '13px' }} />
              <span className="chat-topbtn-label">Export Chat</span>
            </button>
            <button onClick={clearChat} className="btn-pill btn-pill-outline" style={{ fontSize: '12px', padding: '8px 16px' }}>
              <Trash2 style={{ width: '13px', height: '13px' }} />
              <span className="chat-topbtn-label">Clear</span>
            </button>
          </div>
        </div>

        {/* Mineral scope strip — hidden on mobile (no scroll row) */}
        <div className="chat-scope-strip">
          <div
            style={{
              maxWidth: '980px',
              margin: '0 auto',
              padding: '8px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
            }}
          >
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-graphite)', fontWeight: 600, whiteSpace: 'nowrap', marginRight: '2px' }}>
              Scope
            </span>
            {['all', 'Lithium', 'Rare Earth', 'Cobalt', 'Graphite', 'Titanium'].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMineralScope(m);

                }}
                className={`tab-pill ${selectedMineralScope === m ? 'active' : ''}`}
                style={{ padding: '4px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
              >
                {m === 'all' ? 'All 30 Minerals' : m}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div
        ref={chatScrollContainerRef}
        style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}
      >
        <div
          style={{
            maxWidth: '980px',
            margin: '0 auto',
            padding: '28px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '22px',
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
                        background: isUser ? 'var(--color-graphite)' : 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
                        color: '#fff',
                        boxShadow: isUser ? 'none' : '0 3px 10px rgba(79,70,229,0.3)',
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
                        <span style={{ fontWeight: 500, color: 'var(--color-electric-indigo)' }}>Minerals AI</span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}
                    style={{
                      maxWidth: isUser ? '78%' : '100%',
                      width: isUser ? 'auto' : '100%',
                      padding: isUser ? '13px 18px' : '20px 22px',
                      borderRadius: isUser ? '20px 20px 6px 20px' : '18px',
                      background: isUser
                        ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                        : 'var(--color-paper-white)',
                      color: isUser ? '#fff' : 'var(--color-ink)',
                      border: isUser ? 'none' : '1px solid var(--color-haze)',
                      boxShadow: isUser
                        ? '0 6px 18px rgba(79,70,229,0.28)'
                        : '0 2px 12px rgba(23,25,45,0.06)',
                      fontSize: '14px',
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                      position: 'relative',
                    }}
                  >
                    {/* Message Content formatted */}
                    {(() => {
                      const LIMIT = 600;
                      const fullText = msg.text || '';
                      const needsTrunc = !isUser && fullText.length > LIMIT;
                      // find a clean break point (newline) near the limit
                      const breakAt = needsTrunc
                        ? (fullText.lastIndexOf('\n', LIMIT) > LIMIT * 0.5
                            ? fullText.lastIndexOf('\n', LIMIT)
                            : LIMIT)
                        : LIMIT;
                      const isExpanded = expandedAnswers.has(idx);
                      const displayText = needsTrunc && !isExpanded ? fullText.slice(0, breakAt) : fullText;

                      return (
                        <>
                          <div className="chat-message-content">
                            {displayText.split('\n').map((line, lIdx) => {
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

                          {/* Read more / Show less toggle */}
                          {needsTrunc && (
                            <button
                              onClick={() => setExpandedAnswers((prev) => {
                                const next = new Set(prev);
                                if (isExpanded) next.delete(idx); else next.add(idx);
                                return next;
                              })}
                              style={{
                                marginTop: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: 'rgba(99,102,241,0.1)',
                                border: '1px solid rgba(99,102,241,0.25)',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'var(--color-electric-indigo)',
                                cursor: 'pointer',
                              }}
                            >
                              <ChevronDown style={{ width: '11px', height: '11px', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                              {isExpanded ? 'Show less' : 'Read more'}
                            </button>
                          )}
                        </>
                      );
                    })()}

                    {/* Cited Patents Interactive Pills */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div
                        style={{
                          marginTop: '16px',
                          paddingTop: '12px',
                        }}
                      >
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--color-graphite)', marginBottom: '8px', fontWeight: 500 }}>
                          Cited Official Indian Patents:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {dedupeRagItems(msg.citations).map((pat, i) => (
                            <button
                              key={`${pat.id ?? pat.publicationNumber ?? pat.title ?? i}-${i}`}
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

                  {/* RAG Sources Panel */}
                  {!isUser && msg.ragData && (
                    <RAGSourcesPanel ragData={msg.ragData} />
                  )}

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
                    background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
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

            {/* Starter suggestions — only before the conversation begins */}
            {messages.length <= 1 && !isGenerating && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '4px 2px' }}>
                {SUGGESTED_QUERIES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleUserSend(q)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '999px',
                      background: 'var(--color-paper-white)',
                      border: '1px solid var(--color-haze)',
                      boxShadow: '0 1px 6px rgba(23,25,45,0.05)',
                      fontSize: '12.5px',
                      fontWeight: 500,
                      color: 'var(--color-electric-indigo)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-electric-indigo)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.18)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-haze)';
                      e.currentTarget.style.boxShadow = '0 1px 6px rgba(23,25,45,0.05)';
                    }}
                  >
                    <Sparkles style={{ width: '12px', height: '12px' }} />
                    {q}
                  </button>
                ))}
              </div>
            )}
        </div>
      </div>

      {/* Prompt box — pinned to the bottom of the viewport */}
      <footer
        style={{
          flexShrink: 0,
          background: '#F0F1FA',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 10,
        }}
      >
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '14px 20px 10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--color-paper-white)',
              border: '1px solid var(--color-haze)',
              borderRadius: '18px',
              padding: '6px 6px 6px 20px',
              boxShadow: '0 4px 16px rgba(23,25,45,0.07)',
            }}
          >
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
              style={{ flex: 1, height: '46px', border: 'none', background: 'transparent', boxShadow: 'none', padding: 0 }}
            />

            <button
              onClick={() => handleUserSend()}
              disabled={!inputQuery.trim() || isGenerating}
              className="btn-pill"
              style={{
                height: '46px',
                width: '46px',
                padding: 0,
                borderRadius: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: !inputQuery.trim() || isGenerating ? 0.45 : 1,
                boxShadow: !inputQuery.trim() || isGenerating ? 'none' : '0 4px 14px rgba(79,70,229,0.4)',
              }}
              aria-label="Send message"
              title="Send message"
            >
              <Send style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
          <p className="chat-footer-note" style={{ fontSize: '11px', color: 'var(--color-graphite)', textAlign: 'center', marginTop: '8px' }}>
            Grounded in the IPO + OpenAlex corpus • Always verify filings on ipindiaservices.gov.in
          </p>
        </div>
      </footer>

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
