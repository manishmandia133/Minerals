// Shared pagination — Prev / page numbers / Next.
// Lusion tokens: paper-white bar, haze borders, graphite page pills,
// electric-indigo active page. Scrolls to top of results on change
// via onPageChange (caller scrolls its own results ref).
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function pageItems(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, page - 1, page, page + 1, total - 1, total]);
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push('…');
    out.push(n);
    prev = n;
  }
  return out;
}

export default function Pagination({ page, totalPages, onChange, label = 'results' }) {
  const items = useMemo(() => pageItems(page, totalPages), [page, totalPages]);
  if (totalPages <= 1) return null;

  const pill = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '36px',
    height: '36px',
    padding: '0 12px',
    borderRadius: '999px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid var(--color-haze)',
    background: 'var(--color-paper-white)',
    color: 'var(--color-graphite)',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  };

  const go = (p) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next !== page) onChange(next);
  };

  return (
    <nav
      aria-label={`${label} pagination`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginTop: '20px',
        background: 'var(--color-paper-white)',
        border: '1px solid var(--color-haze)',
        borderRadius: '15px',
        padding: '12px 16px',
      }}
    >
      <span style={{ fontSize: '12.5px', color: 'var(--color-graphite)' }}>
        Page <strong style={{ color: 'var(--color-ink)' }}>{page}</strong> of{' '}
        <strong style={{ color: 'var(--color-ink)' }}>{totalPages}</strong>
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          style={{
            ...pill,
            opacity: page === 1 ? 0.4 : 1,
            cursor: page === 1 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft style={{ width: '15px', height: '15px' }} />
          <span className="pag-label">Prev</span>
        </button>

        {items.map((it, i) =>
          it === '…' ? (
            <span key={`gap-${i}`} style={{ padding: '0 4px', color: '#9ca3af', fontSize: '13px' }}>
              …
            </span>
          ) : (
            <button
              key={it}
              onClick={() => go(it)}
              aria-label={`Page ${it}`}
              aria-current={it === page ? 'page' : undefined}
              style={
                it === page
                  ? {
                      ...pill,
                      background: 'var(--color-graphite)',
                      borderColor: 'var(--color-graphite)',
                      color: '#fff',
                      fontWeight: 600,
                    }
                  : pill
              }
            >
              {it}
            </button>
          )
        )}

        <button
          onClick={() => go(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          style={{
            ...pill,
            opacity: page === totalPages ? 0.4 : 1,
            cursor: page === totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          <span className="pag-label">Next</span>
          <ChevronRight style={{ width: '15px', height: '15px' }} />
        </button>
      </div>
      <style>{`@media (max-width: 560px) { .pag-label { display: none; } }`}</style>
    </nav>
  );
}
