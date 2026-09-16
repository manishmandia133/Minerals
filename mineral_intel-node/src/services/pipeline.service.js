'use strict';
// Fetch -> save -> enrich pipeline shared by POST /fetch and jobs/auto.js.
const { patents } = require('./fetch/patents.service');
const { openalex } = require('./fetch/research.service');
const { saveRecords } = require('./store.service');
const { enrichIds } = require('./enrich/enrich.service');

async function fetchAndSave({ patentsQuery, researchQuery, pages = 2, oaOpts = {}, dateOpts = {} }) {
  const recs = [];
  if (patentsQuery) recs.push(...await patents(patentsQuery, pages, dateOpts));
  if (researchQuery) recs.push(...await openalex(researchQuery, { ...oaOpts, ...dateOpts }));
  const saved = saveRecords(recs);
  const enriched = await enrichIds(saved.ids);
  return { ...saved, enriched };
}

module.exports = { fetchAndSave };
