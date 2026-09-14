// Cross-source dedup using fuzzball (token_set_ratio):
//  1. exact match on normalized publication/application number, else
//  2. fuzzy title (>=85) AND same filing year.
import { token_set_ratio } from 'fuzzball';

const normNum = (v) => !v ? null : String(v).toUpperCase().replace(/[^A-Z0-9]/g, '') || null;
const normTitle = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const yearOf = (d) => (d && /^\d{4}/.test(d) ? d.slice(0, 4) : null);

export function dedupe(records, threshold = 85) {
  const seenNums = new Set();
  const kept = []; // { rec, titleNorm, year }
  let dupNumber = 0, dupFuzzy = 0;

  for (const rec of records) {
    const num = normNum(rec.id);
    if (num) {
      if (seenNums.has(num)) { dupNumber++; continue; }
      seenNums.add(num);
    }
    const t = normTitle(rec.title);
    const y = yearOf(rec.filingDate);
    const dup = kept.find((k) =>
      token_set_ratio(t, k.titleNorm) >= threshold &&
      (y === null || k.year === null || y === k.year));
    if (dup) { dupFuzzy++; continue; }
    kept.push({ rec, titleNorm: t, year: y });
  }
  console.log(`[dedupe] in=${records.length} kept=${kept.length} dupes=${dupNumber + dupFuzzy} (number=${dupNumber}, fuzzy=${dupFuzzy})`);
  return kept.map((k) => k.rec);
}
