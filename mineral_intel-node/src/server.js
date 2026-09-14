'use strict';
// Minimal fetch-only API: fetch -> clean -> save as JSON files.
const express = require('express');
const { load, saveRecords, reconcileFilenames } = require('./store');
const { patents, openalex, lens } = require('./fetch');
const { enrichIds } = require('./enrich');

function createApp() {
  const app = express();
  app.use(express.json());
  reconcileFilenames(); // heal old id-only filenames on startup

  // POST /fetch  Body: { query, research, india_only, patent_pages,
  //                      lens, lens_token, lens_size, lens_jurisdiction, records[] }
  //   query    -> Google Patents (IN) + OpenAlex together
  //   research -> OpenAlex only
  //   lens     -> Lens.org patents (needs LENS_TOKEN or lens_token; IN by default)
  const fetchHandler = async (req, res) => {
    try {
      const b = req.body || {};
      const oa = { indiaOnly: !!b.india_only };
      let recs = [...(b.records || [])];
      if (b.query) recs.push(...await patents(b.query, b.patent_pages || 2), ...await openalex(b.query, oa));
      if (b.research) recs.push(...await openalex(b.research, oa));
      if (b.lens) recs.push(...await lens(b.lens, {
        token: b.lens_token, size: b.lens_size,
        jurisdiction: b.lens_jurisdiction === null ? null : (b.lens_jurisdiction || 'IN'),
      }));
      if (!recs.length) return res.status(400).json({ detail: 'Give { query } or { research } or { lens } or { records }.' });
      const saved = saveRecords(recs);
      const enriched = await enrichIds(saved.ids);
      const { ids, ...stats } = saved;
      res.json({ ok: true, ...stats, enriched });
    } catch (e) {
      res.status(500).json({ detail: String(e.message || e) });
    }
  };
  app.post('/fetch', fetchHandler);
  app.post('/ingest', fetchHandler); // alias for the old Python/Node API

  app.get('/records', (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '100', 10), 1), 1000);
    const all = load();
    res.json({ total: all.length, records: all.slice(0, limit) });
  });

  app.get('/records/:id', (req, res) => {
    const rec = load().find((r) => r.id === req.params.id);
    if (!rec) return res.status(404).json({ detail: 'Not found.' });
    res.json(rec);
  });

  app.get('/health', (req, res) => res.json({ ok: true }));

  // Landing page so opening the server in a browser doesn't show "Cannot GET /".
  app.get('/', (req, res) => res.type('html').send(
    `<h1>mineral-intel-node</h1><p>Fetch mineral data, store as JSON files.</p>` +
    `<pre>POST /fetch   {"query":"lithium extraction India"}\n` +
    `POST /fetch   {"research":"cobalt battery","india_only":true}\n` +
    `POST /fetch   {"lens":"critical minerals AND lithium"}  (needs LENS_TOKEN)\n` +
    `GET  /records?limit=100\nGET  /records/:id\nGET  /health</pre>`));
  app.get('/favicon.ico', (req, res) => res.status(204).end());

  return app;
}

module.exports = { createApp };
