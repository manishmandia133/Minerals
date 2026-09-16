'use strict';
// Date helpers. YYYY-MM-DD or null; ISO dates compare as plain strings.
// `until` also accepts today/now/current/latest (=> current date, UTC).
// `since`/`until` accept YYYY-MM-DD, YYYY-MM (= first day) or YYYY (= Jan 01).
function today() {
  return new Date().toISOString().slice(0, 10);
}

function normDate(s) {
  if (!s) return null;
  const t = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) {
    const d = t.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : null;
  }
  let m = /^(\d{4})-(\d{2})$/.exec(t);
  if (m) {
    const mo = Number(m[2]);
    if (mo >= 1 && mo <= 12) return `${m[1]}-${m[2]}-01`;
    return null;
  }
  m = /^(\d{4})$/.exec(t);
  if (m) {
    const y = Number(m[1]);
    if (y >= 1000 && y <= 9999) return `${m[1]}-01-01`;
    return null;
  }
  return null;
}

const isTodayKeyword = (s) => /^(today|now|current|latest|\*)$/i.test(String(s || '').trim());

function resolveSince(opts = {}) {
  return normDate(opts.since || opts.from_date || opts.from || opts.after);
}

function resolveUntil(opts = {}) {
  const raw = opts.until ?? opts.to_date ?? opts.to ?? opts.before;
  if (isTodayKeyword(raw)) return today();
  return normDate(raw);
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

function applyRange(recs, since, until, latest) {
  const filtered = (since || until) ? recs.filter((r) => inRange(r.publication_date, since, until)) : recs;
  if (latest) filtered.sort(newestFirst);
  return filtered;
}

// Effective range for "specific date -> latest/current": when `since` is set
// and `until` is open, `effectiveUntil` is today (upper bound = current date).
// OpenAlex gets an explicit to_publication_date; Google filters client-side.
function resolveRange(opts = {}) {
  const since = resolveSince(opts);
  const until = resolveUntil(opts);
  const latest = resolveLatest(opts);
  const effectiveUntil = until || (since ? today() : null);
  return { since, until, latest, effectiveUntil };
}

const stamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

module.exports = { normDate, today, isTodayKeyword, resolveSince, resolveUntil, resolveLatest, resolveRange, applyRange, inRange, newestFirst, stamp };
