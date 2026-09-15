'use strict';
// Central config: every env var is read here.
const path = require('path');

const USER_AGENT = 'mineral-intel/1.0';
const PORT = parseInt(process.env.PORT || '8000', 10);
const INTERVAL_MIN = parseInt(process.env.INTERVAL_MIN || '360', 10);
const FETCH_SLEEP_MS = 500;
const ENRICH_SLEEP_MS = 300;
const MIN_ABSTRACT_LEN = 40;

const QUERIES = (process.env.QUERIES ||
  'lithium battery India,cobalt battery,nickel extraction India,rare earth magnets India,graphite anode,manganese ore processing,titanium alloy,copper refining India')
  .split(',').map((s) => s.trim()).filter(Boolean);

// Read each call so tests can override RECORDS_DIR.
function getRecordsDir() {
  return process.env.RECORDS_DIR || path.join(__dirname, '..', 'data', 'records');
}

function getDateOpts() {
  let since = (process.env.SINCE || '').slice(0, 10) || null;
  const days = parseInt(process.env.SINCE_DAYS || '', 10);
  if (!since && Number.isFinite(days) && days > 0) {
    since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  }
  if (since && !/^\d{4}-\d{2}-\d{2}$/.test(since)) since = null;
  let until = (process.env.UNTIL || '').slice(0, 10) || null;
  if (until && !/^\d{4}-\d{2}-\d{2}$/.test(until)) until = null;
  const latest = /^(1|true|yes|new|newest)$/i.test(process.env.LATEST || '');
  return { since, until, latest };
}

module.exports = {
  USER_AGENT, PORT, INTERVAL_MIN, FETCH_SLEEP_MS, ENRICH_SLEEP_MS,
  MIN_ABSTRACT_LEN, QUERIES, getRecordsDir, getDateOpts,
};
