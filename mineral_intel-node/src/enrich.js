'use strict';
// Enrichment: fill records missing an abstract via DOI -> OpenAlex,
// else scrape source_url with ./webscrape.js. Used by server + auto.js.
const store = require('./store');
const { scrapePage } = require('./webscrape');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openAlexPatch(doi) {
  const clean = String(doi).replace(/^https?:\/\/doi\.org\//, '');
  const d = await (await fetch(`https://api.openalex.org/works/https://doi.org/${clean}`,
    { headers: { 'User-Agent': 'mineral-intel/1.0' } })).json();
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
  if (rec.abstract) return false;
  try {
    if (rec.doi) {
      const patch = await openAlexPatch(rec.doi);
      if (patch) return store.updateRecord(rec.id, patch);
    }
    if (rec.source_url && /^https?:\/\//.test(rec.source_url)) {
      const s = await scrapePage(rec.source_url);
      if (s.abstract && s.abstract.length > 40) {
        return store.updateRecord(rec.id, {
          abstract: s.abstract,
          full_text: s.full_text,
          applicants_or_authors: s.authors,
          organisation: s.organisation,
          journal: s.journal,
          publication_date: s.published_date,
        });
      }
    }
  } catch { /* blocked page / offline — skip */ }
  return false;
}

// Enrich the given ids (fresh-loaded). Returns number filled.
async function enrichIds(ids, limit = 50) {
  let done = 0;
  for (const id of ids.slice(0, limit)) {
    const rec = store.load().find((r) => r.id === id);
    if (rec && await enrichRecord(rec)) done++;
    await sleep(300);
  }
  return done;
}

module.exports = { enrichRecord, enrichIds };
