'use strict';
// Fully automated loop — no manual curl needed:
//   1. fetch patents + research for each critical mineral, store as files
//   2. enrich records missing abstracts (DOI -> OpenAlex)
//   3. refresh data/processed/patents.* whenever data/raw/*.csv change
//
//   node auto.js                    daemon: cycle now, repeat every INTERVAL_MIN, watch data/raw/
//   node auto.js --once             single cycle, then exit (cron-friendly)
//   node auto.js --watch            only watch data/raw/ -> pipeline refresh
//
// Env: QUERIES (comma-separated), INTERVAL_MIN (default 360),
//      LENS_TOKEN, OPENALEX_MAILTO, RECORDS_DIR, RAW_DIR, OUT_DIR
const fs = require('fs');
const path = require('path');
const store = require('./src/store');
const { patents, openalex, lens } = require('./src/fetch');
const { enrichIds } = require('./src/enrich');

const ROOT = __dirname;
const RAW_DIR = process.env.RAW_DIR || path.join(ROOT, 'data', 'raw');
const OUT_DIR = process.env.OUT_DIR || path.join(ROOT, 'data', 'processed');
const QUERIES = (process.env.QUERIES ||
  'lithium battery India,cobalt battery,nickel extraction India,rare earth magnets India,graphite anode,manganese ore processing,titanium alloy,copper refining India')
  .split(',').map((s) => s.trim()).filter(Boolean);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

// 1. fetch all mineral queries -> files (>25 per source: 2 patent pages,
// 100 OpenAlex works, 100 Lens patents per query)
async function fetchCycle() {
  let received = 0, inserted = 0, duplicates = 0;
  for (const q of QUERIES) {
    try {
      const recs = [...await patents(q, 2), ...await openalex(q, { perPage: 100, indiaOnly: true })];
      if (process.env.LENS_TOKEN) {
        recs.push(...await lens(q, { size: 100 }));
        await sleep(500);
      }
      const s = store.saveRecords(recs);
      received += s.received; inserted += s.inserted; duplicates += s.duplicates;
    } catch (e) {
      console.log(`[auto ${stamp()}] fetch "${q}" failed: ${e.message}`);
    }
    await sleep(500); // be polite to free APIs
  }
  console.log(`[auto ${stamp()}] fetch: queries=${QUERIES.length} received=${received} inserted=${inserted} duplicates=${duplicates}`);
}

// 2. fill missing content (DOI -> OpenAlex, else scrape source_url via src/webscrape.js).
// updateRecord() also renames each file to <slug>-<id>. Capped per cycle.
async function enrichCycle(limit = 100) {
  const thin = store.load().filter((r) => !r.abstract).map((r) => r.id);
  const done = await enrichIds(thin, limit);
  console.log(`[auto ${stamp()}] enrich: thin=${thin.length} filled=${done}`);
}

// 2b. delete records that are still unenriched (no usable abstract).
function pruneCycle(minLen = 40) {
  const { removed, kept } = store.pruneUnenriched(minLen);
  console.log(`[auto ${stamp()}] prune: removed=${removed} kept=${kept}`);
}

// 3. pipeline refresh if any raw CSV is newer than the processed output
async function pipelineCycle() {
  if (!fs.existsSync(RAW_DIR)) return;
  const csvs = fs.readdirSync(RAW_DIR).filter((f) => f.toLowerCase().endsWith('.csv'));
  if (!csvs.length) return;
  const newest = Math.max(...csvs.map((f) => fs.statSync(path.join(RAW_DIR, f)).mtimeMs));
  const out = path.join(OUT_DIR, 'patents.json');
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= newest) return; // up to date
  console.log(`[auto ${stamp()}] pipeline: raw changed -> refresh`);
  const { refresh } = await import('./pipeline/run.mjs');
  await refresh(RAW_DIR, OUT_DIR);
}

async function cycle() {
  await fetchCycle();
  await enrichCycle();
  pruneCycle();
  await pipelineCycle();
  console.log(`[auto ${stamp()}] cycle done. records=${store.load().length}`);
}

function watchRaw() {
  fs.mkdirSync(RAW_DIR, { recursive: true });
  let t = null;
  fs.watch(RAW_DIR, (ev, f) => {
    if (!f || !f.toLowerCase().endsWith('.csv')) return;
    clearTimeout(t);
    t = setTimeout(() => pipelineCycle().catch((e) => console.log('[auto] refresh failed:', e.message)), 2000);
  });
  console.log(`[auto] watching ${RAW_DIR} -> pipeline refresh on new CSVs`);
}

const args = process.argv.slice(2);
(async () => {
  if (args.includes('--help')) {
    console.log('node auto.js [--once] [--watch] [--interval MIN]\n  default: cycle now, repeat every INTERVAL_MIN (default 360), watch data/raw/');
    return;
  }
  if (args.includes('--watch') && !args.includes('--once')) { watchRaw(); return; }
  if (args.includes('--once')) { await cycle(); return; }
  const mins = parseInt(args[args.indexOf('--interval') + 1] || process.env.INTERVAL_MIN || '360', 10);
  watchRaw();
  await cycle();
  console.log(`[auto] next cycle in ${mins} min`);
  setInterval(async () => {
    await cycle().catch((e) => console.log('[auto] cycle failed:', e.message));
    console.log(`[auto] next cycle in ${mins} min`);
  }, mins * 60000);
})().catch((e) => { console.error('[auto]', e.message); process.exit(1); });
