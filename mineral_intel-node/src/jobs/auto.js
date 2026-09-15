'use strict';
// Auto loop: fetch -> enrich -> prune. No keys needed.
// node src/jobs/auto.js [--once] [--interval MIN]
const store = require('../services/store.service');
const { patents } = require('../services/patents.service');
const { openalex } = require('../services/research.service');
const { enrichIds } = require('../services/enrich.service');
const { sleep } = require('../utils/http');
const { stamp } = require('../utils/dates');
const { QUERIES, INTERVAL_MIN, FETCH_SLEEP_MS, getDateOpts } = require('../config');

// Fetch all queries -> files (Google patents + OpenAlex research).
async function fetchCycle() {
  let received = 0, inserted = 0, duplicates = 0;
  const d = getDateOpts();
  for (const q of QUERIES) {
    try {
      const recs = [...await patents(q, 2, d), ...await openalex(q, { perPage: 100, indiaOnly: true, ...d })];
      const s = store.saveRecords(recs);
      received += s.received; inserted += s.inserted; duplicates += s.duplicates;
    } catch (e) {
      console.log(`[auto ${stamp()}] fetch "${q}" failed: ${e.message}`);
    }
    await sleep(FETCH_SLEEP_MS); // be polite to free APIs
  }
  console.log(`[auto ${stamp()}] fetch: queries=${QUERIES.length} received=${received} inserted=${inserted} duplicates=${duplicates}`);
}

// Fill missing abstracts (capped per cycle).
async function enrichCycle(limit = 100) {
  const thin = store.load().filter((r) => !r.abstract).map((r) => r.id);
  const done = await enrichIds(thin, limit);
  console.log(`[auto ${stamp()}] enrich: thin=${thin.length} filled=${done}`);
}

function pruneCycle(minLen) {
  const { removed, kept } = store.pruneUnenriched(minLen);
  console.log(`[auto ${stamp()}] prune: removed=${removed} kept=${kept}`);
}

async function cycle() {
  await fetchCycle();
  await enrichCycle();
  pruneCycle();
  console.log(`[auto ${stamp()}] cycle done. records=${store.load().length}`);
}

const args = process.argv.slice(2);
(async () => {
  if (args.includes('--help')) {
    console.log('node src/jobs/auto.js [--once] [--interval MIN]\n  default: cycle now, repeat every INTERVAL_MIN (default 360)');
    return;
  }
  if (args.includes('--once')) { await cycle(); return; }
  const mins = parseInt(args[args.indexOf('--interval') + 1] || INTERVAL_MIN, 10);
  await cycle();
  console.log(`[auto] next cycle in ${mins} min`);
  setInterval(async () => {
    await cycle().catch((e) => console.log('[auto] cycle failed:', e.message));
    console.log(`[auto] next cycle in ${mins} min`);
  }, mins * 60000);
})().catch((e) => { console.error('[auto]', e.message); process.exit(1); });
