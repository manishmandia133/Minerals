'use strict';
// Shared file store: data/records/<slug>-<id>.json (one file per record).
// Used by both the API server (src/server.js) and the automation (auto.js).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = process.env.RECORDS_DIR || path.join(__dirname, '..', 'data', 'records');

const clean = (r) => ({
  source: r.source || 'manual',
  kind: r.kind === 'research' ? 'research' : 'patent',
  title: String(r.title || 'Untitled').replace(/\s+/g, ' ').trim().slice(0, 1000),
  abstract: r.abstract ? String(r.abstract).replace(/\s+/g, ' ').trim().slice(0, 3000) : null,
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

// Filename from the record title: "<slug>-<id>.json". The id suffix keeps it unique.
function slug(title) {
  const s = String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');
  return s || 'untitled';
}

// Each entry: { file, rec }
function entries() {
  fs.mkdirSync(DIR, { recursive: true });
  const out = [];
  for (const f of fs.readdirSync(DIR)) {
    if (!f.endsWith('.json')) continue;
    try { out.push({ file: path.join(DIR, f), rec: JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) }); } catch {}
  }
  return out;
}

function load() {
  return entries().map((e) => e.rec)
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
}

function saveRecords(recs) {
  const existing = load();
  const seen = new Set(existing.map(key));
  let inserted = 0, duplicates = 0;
  const ids = [];
  for (const r of recs) {
    const c = clean(r);
    if (c.title.length < 3 || (r.collector_note && !c.abstract)) continue; // skip empty/failed fetches
    if (seen.has(key(c))) { duplicates++; continue; }
    seen.add(key(c));
    const rec = { id: crypto.randomBytes(6).toString('hex'), ...c, created_at: new Date().toISOString() };
    fs.writeFileSync(path.join(DIR, `${slug(rec.title)}-${rec.id}.json`), JSON.stringify(rec, null, 2));
    ids.push(rec.id);
    inserted++;
  }
  const renamed = reconcileFilenames();
  return { received: recs.length, inserted, duplicates, ids, renamed };
}

// Rename any files that aren't "<slug>-<id>.json" for their content
// (heals files written by older versions). Returns rename count.
function reconcileFilenames() {
  let renamed = 0;
  for (const e of entries()) {
    const want = `${slug(e.rec.title)}-${e.rec.id}.json`;
    if (path.basename(e.file) !== want) {
      fs.writeFileSync(path.join(DIR, want), JSON.stringify(e.rec, null, 2));
      fs.unlinkSync(e.file);
      renamed++;
    }
  }
  return renamed;
}

// Merge patch into the record with `id`, preserving good data.
// Renames the file if the title changed. Returns true if found.
function updateRecord(id, patch) {
  const e = entries().find((x) => x.rec.id === id);
  if (!e) return false;
  const rec = { ...e.rec };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length)) continue;
    const cur = rec[k];
    if (cur === null || cur === undefined || cur === '' || (Array.isArray(cur) && !cur.length)) rec[k] = v;
  }
  const want = path.join(DIR, `${slug(rec.title)}-${rec.id}.json`);
  fs.writeFileSync(want, JSON.stringify(rec, null, 2));
  if (want !== e.file) fs.unlinkSync(e.file);
  return true;
}

// Delete records with no usable abstract (missing or too short).
// Returns { removed, kept }.
function pruneUnenriched(minLen = 40) {
  let removed = 0, kept = 0;
  for (const e of entries()) {
    const abs = (e.rec.abstract || '').trim();
    if (!abs || abs.length < minLen || e.rec.title.startsWith('[pending]')) {
      fs.unlinkSync(e.file);
      removed++;
    } else kept++;
  }
  return { removed, kept };
}

module.exports = { DIR, clean, key, slug, load, saveRecords, updateRecord, reconcileFilenames, pruneUnenriched };
