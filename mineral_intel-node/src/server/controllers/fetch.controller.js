'use strict';
// POST /fetch: { patents, research, query, records[], since, until, latest, ... }
// patents -> Google, research -> OpenAlex, query -> both.
// Date range: { since: "2024-01-01" } alone means "that date -> today".
// { since, until: "today"|"2025-01-01" } bounds both ends. Aliases:
// since = from_date/from/after, until = to_date/to/before.
const { saveRecords } = require('../../services/store.service');
const { enrichIds } = require('../../services/enrich/enrich.service');
const { fetchAndSave } = require('../../services/pipeline.service');
const { resolveRange, today } = require('../../utils/dates');

async function fetchHandler(req, res) {
  try {
    const b = req.body || {};
    const oa = { indiaOnly: !!b.india_only };
    const { since, until, latest, effectiveUntil } = resolveRange(b);
    const dateOpts = { since, until, latest };
    const pages = Math.max(1, Number(b.patent_pages) || 2);
    const totals = { received: 0, inserted: 0, duplicates: 0, merged: 0, renamed: 0, enriched: 0, ids: [] };
    const merge = (s) => {
      totals.received += s.received || 0;
      totals.inserted += s.inserted || 0;
      totals.duplicates += s.duplicates || 0;
      totals.merged += s.merged || 0;
      totals.renamed += s.renamed || 0;
      totals.enriched += s.enriched || 0;
      if (Array.isArray(s.ids)) totals.ids.push(...s.ids);
    };
    if (b.patents) merge(await fetchAndSave({ patentsQuery: b.patents, pages, oaOpts: {}, dateOpts }));
    if (b.query) merge(await fetchAndSave({ patentsQuery: b.query, researchQuery: b.query, pages, oaOpts: oa, dateOpts }));
    if (b.research) merge(await fetchAndSave({ researchQuery: b.research, pages, oaOpts: oa, dateOpts }));
    if (b.records && b.records.length) {
      const saved = saveRecords(b.records);
      const enriched = await enrichIds(saved.ids);
      merge({ ...saved, enriched });
    }
    if (!totals.received) return res.status(400).json({ detail: 'Give { patents } (Google) or { research } (OpenAlex) or { query } or { records }.' });
    const { ids, ...stats } = totals;
    res.json({ ok: true, range: { since, until: until || (since ? today() : null), effectiveUntil, latest }, ...stats, enriched: totals.enriched });
  } catch (e) {
    res.status(500).json({ detail: String(e.message || e) });
  }
}

module.exports = { fetchHandler };
