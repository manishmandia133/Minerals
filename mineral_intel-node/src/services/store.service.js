'use strict';
// File store: data/records/<slug>-<id>.json, one file per record.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getRecordsDir, MIN_ABSTRACT_LEN } = require('../config');

const DIR = getRecordsDir();
const getDir = getRecordsDir;

const clean = (r) => ({
  source: r.source || 'manual',
  kind: r.kind === 'research' ? 'research' : 'patent',
  title: String(r.title || 'Untitled').replace(/\s+/g, ' ').trim().slice(0, 1000),
  abstract: r.abstract ? String(r.abstract).replace(/\s+/g, ' ').trim().slice(0, 3000) : null,
  // snippet = raw search-result excerpt (e.g. Google Patents). Provenance only:
  // never treated as the abstract, but kept so records stay identifiable and
  // enrichment can upgrade abstract from the source page later.
  snippet: r.snippet ? String(r.snippet).replace(/\s+/g, ' ').trim().slice(0, 2000) : null,
  full_text: r.full_text ? String(r.full_text).replace(/\s+/g, ' ').trim().slice(0, 20000) : null,
  publication_number: r.publication_number ? String(r.publication_number).replace(/\s+/g, '').toUpperCase() : null,
  doi: r.doi ? String(r.doi).toLowerCase() : null,
  publication_date: r.publication_date ? String(r.publication_date).slice(0, 10) : null,
  applicants_or_authors: Array.isArray(r.applicants_or_authors) ? r.applicants_or_authors.slice(0, 20) : [],
  organisation: r.organisation || null,
  lens_id: r.lens_id || null,
  journal: r.journal || null,
  citation_count: r.citation_count ?? null,
  source_url: r.source_url || null,
});

const key = (r) => (r.publication_number && 'pub:' + r.publication_number)
  || (r.doi && 'doi:' + r.doi)
  || ('title:' + r.title.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 80));

// Filename: <slug>-<id>.json (id keeps it unique).
function slug(title) {
  const s = String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
  return s || 'untitled';
}

function entries() {
  const dir = getDir();
  fs.mkdirSync(dir, { recursive: true });
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    try { out.push({ file: path.join(dir, f), rec: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) }); } catch { /* skip bad files */ }
  }
  return out;
}

function load() {
  return entries().map((e) => e.rec)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function saveRecords(recs) {
  const existing = load();
  const seen = new Map(existing.map((r) => [key(r), r.id]));
  let inserted = 0, duplicates = 0, merged = 0;
  const ids = [];
  for (const r of recs) {
    const c = clean(r);
    if (c.title.length < 3 || (r.collector_note && !c.abstract)) continue;
    const k = key(c);
    if (seen.has(k)) {
      // Same record seen before: merge anything improved, else count duplicate.
      if (updateRecord(seen.get(k), c)) merged++; else duplicates++;
      continue;
    }
    const rec = { id: crypto.randomBytes(6).toString('hex'), ...c, created_at: new Date().toISOString() };
    fs.writeFileSync(path.join(getDir(), `${slug(rec.title)}-${rec.id}.json`), JSON.stringify(rec, null, 2));
    seen.set(k, rec.id);
    ids.push(rec.id);
    inserted++;
  }
  const renamed = reconcileFilenames();
  return { received: recs.length, inserted, duplicates, merged, ids, renamed };
}

// Fix names that don't match their content.
function reconcileFilenames() {
  const dir = getDir();
  let renamed = 0;
  for (const e of entries()) {
    const want = `${slug(e.rec.title)}-${e.rec.id}.json`;
    if (path.basename(e.file) !== want) {
      fs.writeFileSync(path.join(dir, want), JSON.stringify(e.rec, null, 2));
      fs.unlinkSync(e.file);
      renamed++;
    }
  }
  return renamed;
}

// Merge patch into the record with `id`.
//   - empty slots are filled (never clobbers good data);
//   - `abstract` upgrades when the incoming one is longer (abstracts improve
//     over time: snippet-seed -> scraped page -> authoritative source).
// Renames the file if the title changed. Returns true only if something changed.
function updateRecord(id, patch) {
  const e = entries().find((x) => x.rec.id === id);
  if (!e) return false;
  const rec = { ...e.rec };
  let changed = false;
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) continue;
    const cur = rec[k];
    if (k === 'abstract') {
      if (cur && String(cur).length >= String(v).length) continue;
      rec[k] = v; changed = true; continue;
    }
    if (cur === null || cur === undefined || cur === '' || (Array.isArray(cur) && !cur.length)) { rec[k] = v; changed = true; }
  }
  if (!changed) return false;
  const want = path.join(getDir(), `${slug(rec.title)}-${rec.id}.json`);
  fs.writeFileSync(want, JSON.stringify(rec, null, 2));
  if (want !== e.file) fs.unlinkSync(e.file);
  return true;
}

// Delete records with no usable abstract.
function pruneUnenriched(minLen = MIN_ABSTRACT_LEN) {
  let removed = 0, kept = 0;
  for (const e of entries()) {
    const abs = (e.rec.abstract || '').trim();
    if (!abs || abs.length < minLen || String(e.rec.title || '').startsWith('[pending]')) {
      fs.unlinkSync(e.file);
      removed++;
    } else kept++;
  }
  return { removed, kept };
}

module.exports = { DIR, getDir, clean, key, slug, load, saveRecords, updateRecord, reconcileFilenames, pruneUnenriched };
