'use strict';
// File store: data/records/<slug>-<id>.json, one file per record.
// Cache assumption: this process must be the sole writer of RECORDS_DIR while running.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getRecordsDir, MIN_ABSTRACT_LEN } = require('../config');

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

// In-memory cache: { dir, byId: Map<id, {file, rec}> }
// Avoids re-scanning the directory on every hot-path call.
let cache = null;

function loadCache() {
  const dir = getDir();
  if (cache && cache.dir === dir) return cache;
  fs.mkdirSync(dir, { recursive: true });
  const byId = new Map();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    const filePath = path.join(dir, f);
    try {
      const rec = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      byId.set(rec.id, { file: filePath, rec });
    } catch (e) {
      console.warn(`[store] Failed to parse ${f}: ${e.message}`);
    }
  }
  cache = { dir, byId };
  return cache;
}

function entries() {
  return [...loadCache().byId.values()];
}

function load() {
  return entries().map((e) => e.rec)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

// O(1) lookup by id — no sort, no scan.
function getById(id) {
  return loadCache().byId.get(id)?.rec ?? null;
}

function saveRecords(recs) {
  const c = loadCache();
  // Build dedupe map from cache directly — no load() call needed.
  const seen = new Map();
  for (const { rec } of c.byId.values()) seen.set(key(rec), rec.id);
  let inserted = 0, duplicates = 0, merged = 0;
  const ids = [];
  for (const r of recs) {
    const cleaned = clean(r);
    if (cleaned.title.length < 3 || (r.collector_note && !cleaned.abstract)) continue;
    const k = key(cleaned);
    if (seen.has(k)) {
      // Same record seen before: merge anything improved, else count duplicate.
      if (updateRecord(seen.get(k), cleaned)) merged++; else duplicates++;
      continue;
    }
    const rec = { id: crypto.randomBytes(6).toString('hex'), ...cleaned, created_at: new Date().toISOString() };
    const filePath = path.join(getDir(), `${slug(rec.title)}-${rec.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(rec, null, 2));
    // Update cache in place — no invalidation needed.
    c.byId.set(rec.id, { file: filePath, rec });
    seen.set(k, rec.id);
    ids.push(rec.id);
    inserted++;
  }
  // reconcileFilenames() is called once at startup (app.js) to heal legacy files;
  // saveRecords always writes correctly-named files so no rename needed here.
  return { received: recs.length, inserted, duplicates, merged, ids, renamed: 0 };
}

// Fix names that don't match their content.
function reconcileFilenames() {
  const c = loadCache();
  const dir = c.dir;
  let renamed = 0;
  for (const [id, e] of c.byId) {
    const want = `${slug(e.rec.title)}-${e.rec.id}.json`;
    if (path.basename(e.file) !== want) {
      const newPath = path.join(dir, want);
      fs.writeFileSync(newPath, JSON.stringify(e.rec, null, 2));
      fs.unlinkSync(e.file);
      // Update cache in place.
      c.byId.set(id, { file: newPath, rec: e.rec });
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
  const c = loadCache();
  const e = c.byId.get(id);
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
  // Update cache in place.
  c.byId.set(id, { file: want, rec });
  return true;
}

// Delete records with no usable abstract.
function pruneUnenriched(minLen = MIN_ABSTRACT_LEN) {
  const c = loadCache();
  let removed = 0, kept = 0;
  for (const [id, e] of c.byId) {
    const abs = (e.rec.abstract || '').trim();
    if (!abs || abs.length < minLen || String(e.rec.title || '').startsWith('[pending]')) {
      fs.unlinkSync(e.file);
      c.byId.delete(id);
      removed++;
    } else kept++;
  }
  return { removed, kept };
}

// Keep DIR export for backward-compat (used in some callers).
const DIR = getRecordsDir();

module.exports = { DIR, getDir, clean, key, slug, load, getById, saveRecords, updateRecord, reconcileFilenames, pruneUnenriched };
