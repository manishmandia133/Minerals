'use strict';
// Fetch -> save -> enrich pipeline shared by POST /fetch and jobs/auto.js.
// Patents: Google first, Lens.org fallback when Google yields nothing usable
// (throttle returns a [pending] stub that the store would skip).
const { patents } = require('./fetch/patents.service');
const { lensPatents } = require('./fetch/lens.service');
const { openalex } = require('./fetch/research.service');
const { saveRecords } = require('./store.service');
const { enrichIds } = require('./enrich/enrich.service');

const usable = (recs) => (recs || []).filter((r) => !r.collector_note);

async function fetchAndSave({ patentsQuery, researchQuery, pages = 2, oaOpts = {}, dateOpts = {} }) {
  const recs = [];
  if (patentsQuery) {
    const g = await patents(patentsQuery, pages, dateOpts);
    if (usable(g).length) recs.push(...g);
    else recs.push(...await lensPatents(patentsQuery, pages, dateOpts));
  }
  if (researchQuery) recs.push(...await openalex(researchQuery, { ...oaOpts, ...dateOpts }));
  const saved = saveRecords(recs);
  // Scrape every newly fetched record's source link (no 50-cap here):
  // thin patent records upgrade abstract/authors/org from the source page,
  // so stored patent JSONs carry the same full tag set as research ones.
  const enriched = await enrichIds(saved.ids, saved.ids.length);
  return { ...saved, enriched };
}

module.exports = { fetchAndSave };
