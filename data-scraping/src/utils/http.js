'use strict';
// fetch helpers.
const { USER_AGENT } = require('../config');

const HEADERS = { 'User-Agent': USER_AGENT };

const DEFAULT_TIMEOUT_MS = 15000;

async function fetchTimed(url, opts = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new Error(`Timeout after ${timeoutMs}ms for ${url}`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function getJson(url, params) {
  const u = new URL(url);
  if (params) for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetchTimed(u, { headers: HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${u}`);
  return r.json();
}

// Failure envelope: the store skips these, so outages never crash.
const pending = (source, kind, query, note) =>
  [{ source, kind, title: `[pending] ${query}`, collector_note: note }];

// Politeness delay between API calls.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { HEADERS, fetchTimed, getJson, pending, sleep };
