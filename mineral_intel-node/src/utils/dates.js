'use strict';
// Date helpers. YYYY-MM-DD or null; ISO dates compare as plain strings.
function normDate(s) {
  if (!s) return null;
  const d = String(s).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
}

function resolveSince(opts = {}) {
  return normDate(opts.since || opts.from_date || opts.from || opts.after);
}

function resolveUntil(opts = {}) {
  return normDate(opts.until || opts.to_date || opts.to || opts.before);
}

function resolveLatest(opts = {}) {
  const s = String(opts.sort || opts.order || '').toLowerCase();
  return !!(opts.latest || opts.sortNewest || opts.newest || s === 'new' || s === 'newest');
}

function inRange(dateStr, since, until) {
  const d = normDate(dateStr);
  if (since || until) {
    if (!d) return false; // no date -> drop when filtering
    if (since && d < since) return false;
    if (until && d > until) return false;
  }
  return true;
}

function newestFirst(a, b) {
  return (b.publication_date || '').localeCompare(a.publication_date || '');
}

const stamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

module.exports = { normDate, resolveSince, resolveUntil, resolveLatest, inRange, newestFirst, stamp };
