'use strict';
// Offline tests: direct records + lens-no-token (no network).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');

process.env.RECORDS_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'mineral-test-'));
const { createApp } = require('../src/server');

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

test('lens without token degrades to pending (no crash, offline-safe)', async () => {
  delete process.env.LENS_TOKEN;
  const srv = createApp().listen(0);
  const port = srv.address().port;
  try {
    const r = await post(port, { lens: 'lithium' });
    assert.equal(r.status, 200);
    assert.equal(r.data.received, 1);
    assert.equal(r.data.inserted, 0); // pending note is skipped, never stored
  } finally { srv.close(); }
});
