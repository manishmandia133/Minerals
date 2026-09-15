'use strict';
// POST /fetch: { patents, research, query, records[], since, latest, ... }
// patents -> Google, research -> OpenAlex, query -> both.
const { saveRecords } = require('../../services/store.service');
const { patents } = require('../../services/patents.service');
const { openalex } = require('../../services/research.service');
const { enrichIds } = require('../../services/enrich.service');

async function fetchHandler(req, res) {
  try {
    const b = req.body || {};
    const oa = { indiaOnly: !!b.india_only };
    const since = b.since || b.from_date || b.from || b.after || null;
    const until = b.until || b.to_date || b.to || b.before || null;
    const sortRaw = String(b.sort || b.order || '').toLowerCase();
    const latest = !!(b.latest || b.newest || sortRaw === 'new' || sortRaw === 'newest');
    const dateOpts = { since, until, latest };
    let recs = [...(b.records || [])];
    const pages = Math.max(1, Number(b.patent_pages) || 2);
    if (b.patents) recs.push(...await patents(b.patents, pages, dateOpts));
    if (b.query) recs.push(...await patents(b.query, pages, dateOpts), ...await openalex(b.query, { ...oa, ...dateOpts }));
    if (b.research) recs.push(...await openalex(b.research, { ...oa, ...dateOpts }));
    if (!recs.length) return res.status(400).json({ detail: 'Give { patents } (Google) or { research } (OpenAlex) or { query } or { records }.' });
    const saved = saveRecords(recs);
    const enriched = await enrichIds(saved.ids);
    const { ids, ...stats } = saved;
    res.json({ ok: true, ...stats, enriched });
  } catch (e) {
    res.status(500).json({ detail: String(e.message || e) });
  }
}

module.exports = { fetchHandler };
