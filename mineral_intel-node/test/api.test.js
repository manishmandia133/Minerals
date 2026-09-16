'use strict';
// Offline tests: no network calls.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.RECORDS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mineral-test-'));
const { createApp } = require('../src/server/app');

async function post(port, body) {
  const r = await fetch(`http://localhost:${port}/fetch`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return { status: r.status, data: await r.json() };
}

test('fetch stores records, dedups, serves them', async () => {
  const srv = createApp().listen(0);
  const port = srv.address().port;
  try {
    const r = await post(port, { records: [{ title: 'Lithium extraction method', publication_number: 'IN202400001' }] });
    assert.equal(r.status, 200);
    assert.equal(r.data.inserted, 1);

    const dup = await post(port, { records: [{ title: 'Lithium extraction method', publication_number: 'IN202400001' }] });
    assert.equal(dup.data.duplicates, 1);

    const list = await (await fetch(`http://localhost:${port}/records`)).json();
    assert.ok(list.total >= 1);
    const one = await (await fetch(`http://localhost:${port}/records/${list.records[0].id}`)).json();
    assert.ok(one.title);
  } finally { srv.close(); }
});

test('fetch with no source returns 400 (lens and other sources removed)', async () => {
  const srv = createApp().listen(0);
  const port = srv.address().port;
  try {
    const empty = await post(port, {});
    assert.equal(empty.status, 400);

    // Lens was removed, so { lens } is unknown -> 400.
    const lens = await post(port, { lens: 'lithium' });
    assert.equal(lens.status, 400);
  } finally { srv.close(); }
});

test('patents() parses current Google shape: cluster[].result[] with patent{}', async () => {
  const { patents } = require('../src/services/fetch/patents.service');
  const realFetch = global.fetch;
  // New Google XHR shape: result is an ARRAY of { id, patent: {...} }.
  // Plus one legacy cluster where result is a single object.
  let lastUrl = '';
  global.fetch = async (url) => {
    lastUrl = String(url);
    return { ok: true, json: async () => ({ results: { cluster: [
    { result: [
      { id: 'patent/IN2015DN01183A/en', rank: 0, patent: {
        title: ' Patent IN2015DN01183A',
        snippet: 'a particulate <b>lithium</b> metal composite material with core shell morphology for battery use in vehicles',
        publication_date: '2015-07-17', inventor: 'Ulrich Wietelmann',
        assignee: 'Rockwood Lithium GmbH', publication_number: 'IN2015DN01183A', language: 'en' } },
      { id: 'patent/IN2014CH01395A/en', rank: 1, patent: {
        title: ' Patent IN2014CH01395A', snippet: 'short',
        publication_date: '2016-02-05', inventor: 'Jane Doe',
        assignee: 'Acme Corp', publication_number: 'IN2014CH01395A', language: 'en' } },
    ] },
    { result: { title: 'Legacy patent', publication_number: 'IN202000001', publication_date: '2020-01-01' } },
    {}, // empty cluster (Google's zero-result shape) -> skipped
  ] } }) };
  };
  try {
    const recs = await patents('lithium', 1);
    assert.equal(recs.length, 3);
    assert.equal(recs[0].publication_number, 'IN2015DN01183A');
    assert.equal(recs[0].publication_date, '2015-07-17');
    assert.equal(recs[0].source_url, 'https://patents.google.com/patent/IN2015DN01183A/en');
    assert.ok(recs[0].title.length >= 3, 'title must survive the store filter');
    assert.ok((recs[0].abstract || '').includes('lithium'), 'snippet seeds the abstract');
    assert.deepEqual(recs[0].applicants_or_authors, ['Rockwood Lithium GmbH', 'Ulrich Wietelmann']);
    assert.equal(recs[2].publication_number, 'IN202000001'); // legacy shape still works
    assert.ok(lastUrl.includes('num%3D100') || lastUrl.includes('num=100'), 'request up to 100/page, got: ' + lastUrl.slice(0, 120));
    assert.ok(recs[0].snippet && recs[0].snippet.includes('lithium'), 'snippet kept separate');
    assert.equal(recs[1].abstract, null, 'short snippet stays null (real abstract comes later)');
  } finally { global.fetch = realFetch; }
});

test('POST /fetch { patents } stores Google-shaped hits as files', async () => {
  const realFetch = global.fetch;
  // Stub only the Google XHR host; everything else (localhost) passes through.
  global.fetch = async (url, opts) => {
    if (String(url).includes('patents.google.com/xhr')) {
      return { ok: true, json: async () => ({ results: { cluster: [{ result: [
        { id: 'patent/IN2015DN01183A/en', rank: 0, patent: {
          title: ' Patent IN2015DN01183A',
          snippet: 'a particulate lithium metal composite material with core shell morphology for battery use in vehicles',
          publication_date: '2015-07-17', inventor: 'Ulrich Wietelmann',
          assignee: 'Rockwood Lithium GmbH', publication_number: 'IN2015DN01183A', language: 'en' } },
      ] }] } }) };
    }
    return realFetch(url, opts);
  };
  const srv = createApp().listen(0);
  const port = srv.address().port;
  try {
    const r = await post(port, { patents: 'lithium battery', patent_pages: 1 });
    assert.equal(r.status, 200);
    assert.equal(r.data.inserted, 1);
    const list = await (await fetch(`http://localhost:${port}/records?limit=10`)).json();
    const rec = list.records.find((x) => x.publication_number === 'IN2015DN01183A');
    assert.ok(rec, 'Google hit must be stored as a file');
    assert.ok((rec.abstract || '').includes('lithium'));
  } finally { srv.close(); global.fetch = realFetch; }
});

test('duplicate with better metadata merges instead of discarding', async () => {
  const store = require('../src/services/store.service');
  const first = store.saveRecords([{ title: 'Merge patent', publication_number: 'INMERGE001',
    abstract: 'short abstract here yes indeed', organisation: null }]);
  assert.equal(first.inserted, 1);
  // Identical re-post: pure duplicate, nothing changes.
  const same = store.saveRecords([{ title: 'Merge patent', publication_number: 'INMERGE001',
    abstract: 'short abstract here yes indeed', organisation: null }]);
  assert.equal(same.duplicates, 1);
  assert.equal(same.merged || 0, 0);
  // Improved re-post: longer abstract + new organisation -> merged.
  const better = store.saveRecords([{ title: 'Merge patent', publication_number: 'INMERGE001',
    abstract: 'short abstract here yes indeed plus much more detail about the extraction method and claims',
    organisation: 'IIT Delhi' }]);
  assert.equal(better.merged, 1);
  const rec = store.load().find((r) => r.publication_number === 'INMERGE001');
  assert.ok(rec.abstract.includes('extraction method'));
  assert.equal(rec.organisation, 'IIT Delhi');
});

test('snippet-seeded abstract upgrades from the Google page', async () => {
  const store = require('../src/services/store.service');
  const { enrichRecord } = require('../src/services/enrich/enrich.service');
  const realFetch = global.fetch;
  const seed = 'seed snippet text about lithium extraction that is long enough to count as provisional abstract here';
  const saved = store.saveRecords([{ title: 'Patent INUP001', publication_number: 'INUP001',
    abstract: seed, snippet: seed, source_url: 'https://patents.google.com/patent/INUP001/en' }]);
  assert.equal(saved.inserted, 1);
  const pageAbstract = 'The present invention provides a full and proper abstract describing the lithium extraction method in complete detail with all steps claims and embodiments included here.';
  global.fetch = async () => ({ ok: true,
    text: async () => `<html><head><meta name="description" content="${pageAbstract}"></head><body><p>${pageAbstract}</p></body></html>` });
  try {
    const rec = store.load().find((r) => r.publication_number === 'INUP001');
    assert.equal(await enrichRecord(rec), true);
    const after = store.load().find((r) => r.publication_number === 'INUP001');
    assert.equal(after.abstract, pageAbstract);
    assert.equal(after.snippet, seed, 'snippet preserved for provenance');
  } finally { global.fetch = realFetch; }
});

test('scraper never reports the publisher as the organisation', async () => {
  const { scrapePage } = require('../src/services/enrich/scrape.service');
  const realFetch = global.fetch;
  global.fetch = async () => ({ ok: true, text: async () =>
    `<html><head><meta property="og:site_name" content="Elsevier">` +
    `<meta name="description" content="A sufficiently long abstract text about mineral processing methods and results here yes.">` +
    `</head><body><p>body</p></body></html>` });
  try {
    const s = await scrapePage('https://patents.google.com/patent/INPUB001/en');
    assert.equal(s.organisation, null);
  } finally { global.fetch = realFetch; }
  global.fetch = async () => ({ ok: true, text: async () =>
    `<html><head><meta property="og:site_name" content="Elsevier">` +
    `<meta name="citation_author_institution" content="IIT Delhi">` +
    `</head><body><p>body</p></body></html>` });
  try {
    const s = await scrapePage('https://patents.google.com/patent/INPUB001/en');
    assert.equal(s.organisation, 'IIT Delhi');
  } finally { global.fetch = realFetch; }
});

test('enrichment falls back to the OpenAlex work ID when DOI is missing', async () => {
  const store = require('../src/services/store.service');
  const { enrichRecord } = require('../src/services/enrich/enrich.service');
  const realFetch = global.fetch;
  store.saveRecords([{ title: 'DOI-less paper', source_url: 'https://openalex.org/W999999',
    doi: null, abstract: null }]);
  global.fetch = async () => ({ ok: true, json: async () => ({
    abstract_inverted_index: { Lithium: [0], extraction: [1], methods: [2], reviewed: [3], thoroughly: [4] },
    primary_location: { source: { display_name: 'J Test' } }, cited_by_count: 7 }) });
  try {
    const rec = store.load().find((r) => r.title === 'DOI-less paper');
    assert.equal(await enrichRecord(rec), true);
    const after = store.load().find((r) => r.title === 'DOI-less paper');
    assert.equal(after.abstract, 'Lithium extraction methods reviewed thoroughly');
  } finally { global.fetch = realFetch; }
});

test('auto.js rejects a malformed --interval', async () => {
  const { execFileSync } = require('node:child_process');
  const job = path.join(__dirname, '..', 'src', 'jobs', 'auto.js');
  for (const bad of ['abc', '0', '-5']) {
    assert.throws(() => execFileSync(process.execPath, [job, '--interval', bad], { stdio: 'pipe' }),
      /--interval must be a positive number/);
  }
});

test('GET /records supports since + sort=newest', async () => {
  const srv = createApp().listen(0);
  const port = srv.address().port;
  try {
    await post(port, { records: [
      { title: 'Old mineral record', publication_number: 'IN202000001', publication_date: '2020-01-01', abstract: 'long enough abstract text for testing purposes here yes' },
      { title: 'New mineral record', publication_number: 'IN202500001', publication_date: '2025-06-01', abstract: 'long enough abstract text for testing purposes here yes' },
    ] });
    const f = await (await fetch(`http://localhost:${port}/records?limit=100&since=2024-01-01`)).json();
    assert.ok(f.records.every((r) => (r.publication_date || '') >= '2024-01-01'));
    assert.ok(f.records.some((r) => r.title === 'New mineral record'));

    const s = await (await fetch(`http://localhost:${port}/records?limit=100&sort=newest`)).json();
    const dates = s.records.map((r) => r.publication_date || '');
    assert.deepEqual(dates, [...dates].sort().reverse());

    // Non-numeric limit falls back to the default instead of returning [].
    const bad = await (await fetch(`http://localhost:${port}/records?limit=abc`)).json();
    assert.ok(bad.records.length > 0 && bad.total >= 1);
  } finally { srv.close(); }
});
