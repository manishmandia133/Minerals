// Task 2 (scripted): run pipeline/bigquery.sql via @google-cloud/bigquery
// (free tier) and save data/raw/gpatents_in.csv.
// Auth: GOOGLE_APPLICATION_CREDENTIALS pointing at a service-account key.
// Alternative: paste bigquery.sql into the Kaggle notebook UI once and drop
// the exported CSV at data/raw/gpatents_in.csv manually — pipeline.js
// picks up any *.csv placed there.
import { BigQuery } from '@google-cloud/bigquery';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const cell = (v) => {
  const s = v === null || v === undefined ? '' : String(v instanceof Date ? v.toISOString().slice(0, 10) : v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function exportGpatents(rawDir, projectId) {
  const sql = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'bigquery.sql'), 'utf8');
  const bq = new BigQuery(projectId ? { projectId } : {});
  console.log('[bigquery] running publications query WHERE country_code = \'IN\' ...');
  const [rows] = await bq.query({ query: sql, location: 'US' });
  console.log(`[bigquery] ${rows.length} Indian patents`);
  const cols = ['id', 'title', 'abstract', 'assignee', 'inventor', 'filing_date', 'grant_date', 'ipc_cpc_codes'];
  const lines = [cols.join(',')];
  for (const r of rows) lines.push(cols.map((c) => cell(r[c])).join(','));
  fs.mkdirSync(rawDir, { recursive: true });
  const out = path.join(rawDir, 'gpatents_in.csv');
  fs.writeFileSync(out, lines.join('\n'));
  console.log(`[bigquery] saved -> ${out}`);
  return out;
}
