// Steps 3-6: normalize -> dedupe -> filter -> write.
// Funnel counts are logged at every step for sanity-checking.
import fs from 'node:fs';
import path from 'node:path';
import { loadAll } from './normalize.mjs';
import { dedupe } from './dedupe.mjs';
import { isRelevant } from './minerals.mjs';

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : Array.isArray(v) ? v.join('; ') : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

async function writeParquet(records, file) {
  const mod = await import('parquetjs');
  const { ParquetSchema, ParquetWriter } = mod.default || mod;
  const schema = new ParquetSchema({
    id: { type: 'UTF8', optional: true },
    title: { type: 'UTF8', optional: true },
    abstract: { type: 'UTF8', optional: true },
    assignee: { type: 'UTF8', optional: true },
    inventor: { type: 'UTF8', optional: true },
    filingDate: { type: 'UTF8', optional: true },
    grantDate: { type: 'UTF8', optional: true },
    ipcCpcCodes: { type: 'UTF8', optional: true },
    source: { type: 'UTF8', optional: true },
    mineralsMatched: { type: 'UTF8', optional: true },
  });
  const writer = await ParquetWriter.openFile(schema, file);
  for (const r of records) {
    await writer.appendRow({
      ...r,
      ipcCpcCodes: (r.ipcCpcCodes || []).join('; ') || null,
      mineralsMatched: (r.mineralsMatched || []).join(', ') || null,
    });
  }
  await writer.close();
}

export async function refresh(rawDir, outDir, { skipParquet = false } = {}) {
  // 3. normalize
  const bySource = loadAll(rawDir);
  const sources = Object.entries(bySource);
  if (!sources.length) {
    console.log('[pipeline] no CSVs in data/raw/ — nothing to do. (run: node pipeline.js --download)');
    return { received: 0, deduped: 0, filtered: 0 };
  }
  const all = sources.flatMap(([, recs]) => recs);
  console.log(`[normalize] total=${all.length} (${sources.map(([s, r]) => `${s}=${r.length}`).join(', ')})`);

  // 4. dedupe
  const uniq = dedupe(all);

  // 5. filter to critical-minerals relevance
  const kept = [];
  for (const rec of uniq) {
    const { keep, mineralsMatched } = isRelevant(rec);
    if (keep) kept.push({ ...rec, mineralsMatched });
  }
  console.log(`[filter] kept=${kept.length} dropped=${uniq.length - kept.length} (minerals + CPC/IPC C22B,B03B,B03C,C01G,E21C,C22C,H01M)`);

  // 6. write outputs
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'patents.json');
  fs.writeFileSync(jsonPath, JSON.stringify(kept, null, 2));
  const cols = ['id', 'title', 'abstract', 'assignee', 'inventor', 'filingDate', 'grantDate', 'ipcCpcCodes', 'source', 'mineralsMatched'];
  fs.writeFileSync(path.join(outDir, 'patents.csv'), [cols.join(','), ...kept.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\n'));
  console.log(`[write] ${jsonPath} + patents.csv`);

  if (!skipParquet) {
    try {
      const pq = path.join(outDir, 'patents.parquet');
      await writeParquet(kept, pq);
      console.log(`[write] ${pq}`);
    } catch (e) {
      console.warn(`[write] parquet skipped (${e.message}); patents.json/.csv are complete.`);
    }
  }
  console.log(`[funnel] raw=${all.length} -> deduped=${uniq.length} -> filtered=${kept.length}`);
  return { received: all.length, deduped: uniq.length, filtered: kept.length };
}
