'use strict';
// Auto loop: fetch -> enrich -> prune. No keys needed.
// node src/jobs/auto.js [--once] [--interval MIN]
const store = require('../services/store.service');
const { fetchAndSave } = require('../services/pipeline.service');
const { enrichIds } = require('../services/enrich/enrich.service');
const { sleep } = require('../utils/http');
const { stamp } = require('../utils/dates');
const { QUERIES, INTERVAL_MIN, FETCH_SLEEP_MS, getDateOpts } = require('../config');

// Fetch all queries -> files (Google patents + OpenAlex research).
async function fetchCycle(dateOverride) {
  let received = 0, inserted = 0, duplicates = 0, merged = 0;
  const d = dateOverride || getDateOpts();
  const label = d.since ? ` range=${d.since}->${d.until || 'today'}` : '';
  console.log(`[auto ${stamp()}] fetch${label}`);
  for (const q of QUERIES) {
    try {
      const s = await fetchAndSave({ patentsQuery: q, researchQuery: q,
        pages: 2, oaOpts: { perPage: 100, indiaOnly: true }, dateOpts: d });
      received += s.received; inserted += s.inserted; duplicates += s.duplicates; merged += s.merged || 0;
    } catch (e) {
      console.log(`[auto ${stamp()}] fetch "${q}" failed: ${e.message}`);
    }
    await sleep(FETCH_SLEEP_MS); // be polite to free APIs
  }
  console.log(`[auto ${stamp()}] fetch: queries=${QUERIES.length} received=${received} inserted=${inserted} duplicates=${duplicates} merged=${merged}`);
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

async function cycle(dateOverride) {
  await fetchCycle(dateOverride);
  await enrichCycle();
  pruneCycle();
  console.log(`[auto ${stamp()}] cycle done. records=${store.load().length}`);
}

const args = process.argv.slice(2);
// CLI date range: --since YYYY-MM-DD --until YYYY-MM-DD|today --latest
// e.g. node src/jobs/auto.js --once --since 2024-01-01 --until today
function cliDateOpts() {
  const pick = (name) => {
    const i = args.indexOf(name);
    return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
  };
  const since = pick('--since');
  const until = pick('--until');
  const latest = args.includes('--latest') || args.includes('--newest');
  if (since || until || latest) {
    const { resolveRange } = require('../utils/dates');
    return resolveRange({ since, until, latest });
  }
  return null;
}
(async () => {
  if (args.includes('--help')) {
    console.log('node src/jobs/auto.js [--once] [--interval MIN] [--since YYYY-MM-DD] [--until YYYY-MM-DD|today] [--latest]\n  default: cycle now, repeat every INTERVAL_MIN (default 360)');
    console.log('  --since 2024-01-01 --until today : fetch that date -> current date');
    return;
  }
  if (args.includes('--once')) { await cycle(cliDateOpts() || undefined); return; }
  const intervalIndex = args.indexOf('--interval');
  let mins = INTERVAL_MIN;
  if (intervalIndex !== -1) {
    mins = Number(args[intervalIndex + 1]);
    if (!Number.isFinite(mins) || mins <= 0) {
      throw new Error('--interval must be a positive number of minutes');
    }
  }
  await cycle(cliDateOpts() || undefined);
  console.log(`[auto] next cycle in ${mins} min`);
  setInterval(async () => {
    await cycle().catch((e) => console.log('[auto] cycle failed:', e.message));
    console.log(`[auto] next cycle in ${mins} min`);
  }, mins * 60000);
})().catch((e) => { console.error('[auto]', e.message); process.exit(1); });
