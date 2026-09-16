'use strict';
const { load } = require('../../services/store.service');
const { resolveRange } = require('../../utils/dates');

function listRecords(req, res) {
  const n = parseInt(req.query.limit || '100', 10);
  const limit = Math.min(Math.max(Number.isFinite(n) ? n : 100, 1), 1000);
  // ?since=2024-01-01 alone => since -> today. ?until=today also accepted.
  const { since, until, latest } = resolveRange(req.query);
  const sortRaw = String(req.query.sort || req.query.order || '').toLowerCase();
  const newest = latest || sortRaw === 'new' || sortRaw === 'newest' || req.query.latest === 'true' || req.query.latest === '1';
  let all = load();
  if (since) all = all.filter((r) => (r.publication_date || '') >= since);
  if (until) all = all.filter((r) => (r.publication_date || '') <= until);
  if (newest) all = [...all].sort((a, b) => (b.publication_date || '').localeCompare(a.publication_date || ''));
  res.json({ total: all.length, records: all.slice(0, limit) });
}

function getRecord(req, res) {
  const rec = load().find((r) => r.id === req.params.id);
  if (!rec) return res.status(404).json({ detail: 'Not found.' });
  res.json(rec);
}

function getHealth(req, res) {
  res.json({ ok: true });
}

function landing(req, res) {
  res.type('html').send(
    `<h1>mineral-intel-node</h1><p>Fetch mineral data, store as JSON files.<br>` +
    `Sources: Google Patents = patents, OpenAlex = research.</p>` +
    `<pre>POST /fetch   {"patents":"lithium extraction India"}\n` +
    `POST /fetch   {"research":"cobalt battery","india_only":true}\n` +
    `POST /fetch   {"patents":"graphite anode","since":"2024-01-01","latest":true}\n` +
    `POST /fetch   {"patents":"lithium","since":"2024-01-01","until":"today"}  (specific date -&gt; current date)\n` +
    `POST /fetch   {"research":"rare earth","since":"2024-01-01","latest":true}\n` +
    `POST /fetch   {"query":"lithium extraction India"}  (legacy: patents+research)\n` +
    `GET  /records?limit=100&amp;since=2024-01-01&amp;until=today&amp;sort=newest\nGET  /records/:id\nGET  /health</pre>`);
}

module.exports = { listRecords, getRecord, getHealth, landing };
