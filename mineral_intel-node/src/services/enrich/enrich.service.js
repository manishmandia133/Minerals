'use strict';
// Fill missing abstracts: DOI -> OpenAlex (work-ID fallback when no DOI),
// else Google Patents page. Snippet-seeded abstracts are upgraded, not skipped.
const store = require('../store.service');
const { scrapePage } = require('./scrape.service');
const { sleep } = require('../../utils/http');
const { ENRICH_SLEEP_MS, USER_AGENT } = require('../../config');

async function openAlexPatch(doi) {
  const clean = String(doi).replace(/^https?:\/\/(dx\.)?doi\.org\//, '').trim();
  if (!clean) return null;
  const mailto = process.env.OPENALEX_MAILTO ? `?mailto=${encodeURIComponent(process.env.OPENALEX_MAILTO)}` : '';
  return openAlexFetch(`https://api.openalex.org/works/https://doi.org/${encodeURIComponent(clean)}${mailto}`);
}

// Fallback when a record has no usable DOI but points at an OpenAlex work
// (research.service stores source_url = doi || openalex id).
async function openAlexIdPatch(workId) {
  const mailto = process.env.OPENALEX_MAILTO ? `?mailto=${encodeURIComponent(process.env.OPENALEX_MAILTO)}` : '';
  return openAlexFetch(`https://api.openalex.org/works/${encodeURIComponent(workId)}${mailto}`);
}

async function openAlexFetch(url) {
  const r = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!r.ok) return null;
  const d = await r.json();
  const inv = d.abstract_inverted_index || {};
  const pos = {};
  for (const [w, list] of Object.entries(inv)) for (const p of list) pos[p] = w;
  const abstract = Object.keys(pos).sort((a, b) => a - b).map((k) => pos[k]).join(' ');
  if (!abstract) return null;
  return {
    abstract,
    journal: ((d.primary_location || {}).source || {}).display_name || null,
    citation_count: d.cited_by_count ?? null,
  };
}

async function enrichRecord(rec) {
  // A complete record needs no work; anything thin (missing abstract or
  // missing authors/org) deserves an upgrade attempt from the source link.
  // updateRecord() fills empty slots and keeps the longer abstract.
  const thinAuthors = !(rec.applicants_or_authors || []).length && !rec.organisation;
  if (rec.abstract && !rec.snippet && !thinAuthors) return false;
  try {
    if (rec.doi) {
      const patch = await openAlexPatch(rec.doi);
      if (patch) return store.updateRecord(rec.id, patch);
    } else {
      const m = /^https?:\/\/openalex\.org\/(W\w+)\/?$/i.exec(rec.source_url || '');
      if (m) {
        const patch = await openAlexIdPatch(m[1]);
        if (patch) return store.updateRecord(rec.id, patch);
      }
    }
    if (rec.source_url && /^https?:\/\/patents\.google\.com\//.test(rec.source_url)) {
      const s = await scrapePage(rec.source_url);
      const patch = {};
      if (s.abstract && s.abstract.length > 40) patch.abstract = s.abstract;
      if (s.full_text) patch.full_text = s.full_text;
      if ((s.authors || []).length) patch.applicants_or_authors = s.authors;
      if (s.organisation) patch.organisation = s.organisation;
      if (s.journal) patch.journal = s.journal;
      if (s.published_date) patch.publication_date = s.published_date;
      if (Object.keys(patch).length) return store.updateRecord(rec.id, patch);
    }
  } catch { /* skip */ }
  return false;
}

// Returns number filled.
async function enrichIds(ids, limit = 50) {
  let done = 0;
  for (const id of ids.slice(0, limit)) {
    const rec = store.load().find((r) => r.id === id);
    if (rec && await enrichRecord(rec)) done++;
    await sleep(ENRICH_SLEEP_MS);
  }
  return done;
}

module.exports = { enrichRecord, enrichIds };
