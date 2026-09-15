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
  const { patents } = require('../src/services/patents.service');
  const realFetch = global.fetch;
  // New Google XHR shape: result is an ARRAY of { id, patent: {...} }.
  // Plus one legacy cluster where result is a single object.
  global.fetch = async () => ({ ok: true, json: async () => ({ results: { cluster: [
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
  ] } }) });
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
  } finally { srv.close(); }
});
