// CLI for the Critical Minerals Patent Tracker pipeline (patents only).
// The pipeline itself is ES modules in ./pipeline/ (*.mjs); this CommonJS
// wrapper exists so the command stays exactly `node pipeline.js ...`.
//
//   node pipeline.js --refresh [--raw-dir data/raw] [--out-dir data/processed] [--no-parquet]
//   node pipeline.js --download                 # Kaggle datasets 1+2 -> data/raw/
//   node pipeline.js --bigquery [--project ID]  # BigQuery source 3 -> data/raw/gpatents_in.csv
const path = require('node:path');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, dflt) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : dflt;
};
const ROOT = __dirname;
const RAW = path.resolve(ROOT, opt('--raw-dir', 'data/raw'));
const OUT = path.resolve(ROOT, opt('--out-dir', 'data/processed'));

(async () => {
  if (flag('--help') || !args.length) {
    console.log(`patent pipeline (patents only, offline after download)
  node pipeline.js --download                  Kaggle datasets 1+2 -> data/raw/
  node pipeline.js --bigquery [--project ID]   BigQuery source 3 -> data/raw/gpatents_in.csv
  node pipeline.js --refresh [--raw-dir DIR] [--out-dir DIR] [--no-parquet]
                                               normalize -> dedupe -> filter -> data/processed/patents.parquet`);
    process.exit(args.length ? 1 : 0);
  }
  if (flag('--download')) {
    const { downloadAll } = await import('./pipeline/download.mjs');
    await downloadAll(RAW);
  }
  if (flag('--bigquery')) {
    const { exportGpatents } = await import('./pipeline/bigquery-export.mjs');
    await exportGpatents(RAW, opt('--project', undefined));
  }
  if (flag('--refresh')) {
    const { refresh } = await import('./pipeline/run.mjs');
    await refresh(RAW, OUT, { skipParquet: flag('--no-parquet') });
  }
})().catch((e) => { console.error(`[pipeline] ${e.message}`); process.exit(1); });
