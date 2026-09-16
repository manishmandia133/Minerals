'use strict';
// fetch helpers.
const { USER_AGENT } = require('../config');

const HEADERS = { 'User-Agent': USER_AGENT };

async function getJson(url, params) {
  const u = new URL(url);
  if (params) for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${u}`);
  return r.json();
}

// Failure envelope: the store skips these, so outages never crash.
const pending = (source, kind, query, note) =>
  [{ source, kind, title: `[pending] ${query}`, collector_note: note }];

// Politeness delay between API calls.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { HEADERS, getJson, pending, sleep };
