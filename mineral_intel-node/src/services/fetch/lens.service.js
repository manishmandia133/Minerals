'use strict';
// Lens.org patents (requires LENS_API_KEY env). Global coverage with
// jurisdiction filter (default IN). Fallback when Google Patents throttles.
//
// POST https://api.lens.org/patent/search, Bearer token, JSON DSL:
// match on title OR abstract, term filter on jurisdiction, range on
// date_published, `from` pagination. Abstracts come via include.
const { pending } = require('../../utils/http');
const { resolveRange, applyRange } = require('../../utils/dates');

const ENDPOINT = 'https://api.lens.org/patent/search';
const INCLUDE = ['lens_id', 'abstract', 'biblio', 'date_published', 'doc_number', 'jurisdiction', 'kind'];

const plain = (s) => String(s || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ').trim();

// [{ text, lang }] -> English preferred.
const enText = (arr) => {
  if (!Array.isArray(arr) || !arr.length) return null;
  const ts = arr.filter((x) => x && x.text);
  if (!ts.length) return null;
  return (ts.find((x) => x.lang === 'en') || ts[0]).text || null;
};

const names = (list) => (Array.isArray(list) ? list : [])
  .map((p) => p && p.extracted_name && p.extracted_name.value)
  .map((s) => String(s || '').trim())
  .filter(Boolean);

function toRecord(d) {
  const b = (d && d.biblio) || {};
  const title = plain(enText(b.invention_title));
  const abstract = plain(enText(d.abstract));
  const applicants = names(b.parties && b.parties.applicants);
  const inventors = names(b.parties && b.parties.inventors);
  const publication_number = d.jurisdiction && d.doc_number
    ? `${d.jurisdiction}${d.doc_number}${d.kind || ''}`
    : (d.doc_key || null);
  return {
    source: 'lens_patent', kind: 'patent', title: title || '',
    // Lens ships real abstracts: keep only usable ones, no snippet seeding.
    abstract: abstract && abstract.length > 40 ? abstract : null,
    snippet: null,
    publication_number,
    publication_date: d.date_published ? String(d.date_published).slice(0, 10) : null,
    applicants_or_authors: [...new Set([...applicants, ...inventors])].slice(0, 20),
    organisation: applicants[0] || null,
    lens_id: d.lens_id || null,
    // Point enrichment at the Google Patents page: Lens IN records often lack
    // abstracts, and enrichRecord() upgrades from patents.google.com pages.
    source_url: publication_number
      ? `https://patents.google.com/patent/${publication_number}/en`
      : (d.lens_id ? `https://www.lens.org/lens/patent/${d.lens_id}` : null),
  };
}

async function lensPatents(query, pages = 2, opts = {}) {
  if (typeof pages === 'object' && pages !== null) { opts = pages; pages = 2; }
  const token = process.env.LENS_API_KEY;
  if (!token) return pending('lens_patent', 'patent', query, 'LENS_API_KEY not set');
  // since-only means "since -> today": until stays open, effectiveUntil bounds the server query.
  const { since, until, latest, effectiveUntil } = resolveRange(opts);
  const jurisdiction = opts.jurisdiction || opts.country || 'IN';
  const size = Math.min(Math.max(Number(opts.perPage) || 100, 1), 100);
  const out = [];
  for (let p = 0; p < Math.max(1, pages); p++) {
    try {
      const filter = [];
      if (jurisdiction) filter.push({ term: { jurisdiction } });
      if (since || effectiveUntil) {
        const range = {};
        if (since) range.gte = since;
        if (effectiveUntil) range.lte = effectiveUntil;
        filter.push({ range: { date_published: range } });
      }
      const body = {
        query: { bool: {
          must: [{ bool: { should: [{ match: { title: query } }, { match: { abstract: query } }] } }],
          ...(filter.length ? { filter } : {}),
        } },
        size, from: p * size, include: INCLUDE,
      };
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status} for lens patent search`);
      const data = await r.json();
      const recs = (data.data || []).map(toRecord);
      out.push(...recs);
      if (recs.length < size) break;
    } catch (e) {
      // Keep pages already fetched; stub only if empty.
      if (out.length) break;
      return pending('lens_patent', 'patent', query, String(e.message || e));
    }
  }
  return applyRange(out, since, until, latest);
}

module.exports = { lensPatents, toRecord };
