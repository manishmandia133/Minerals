'use strict';
// Google Patents (India), no key. Google has no date param, so since/until filter here.
//
// Response shape (verified Sep 2026): results.cluster[] holds ONE cluster whose
// `result` is an ARRAY of { id: 'patent/<PUBNO>/en', patent: { title, snippet,
// publication_date, inventor, assignee, publication_number, ... } } — up to 10
// per page. Older shape (result = single flat object) is still accepted.
const { getJson, pending } = require('../utils/http');
const { resolveSince, resolveUntil, resolveLatest, inRange, newestFirst } = require('../utils/dates');

// Snippet HTML -> plain text seed for the abstract.
const plain = (s) => String(s || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-zA-Z0-9#]+;/g, ' ')
  .replace(/\s+/g, ' ').trim();

// id 'patent/<PUBNO>/en' -> '<PUBNO>' (fallback when patent{} lacks the number).
const pubNoFromId = (id) => {
  const parts = String(id || '').split('/');
  return parts.length >= 2 && parts[1] ? parts[1] : null;
};

async function patents(query, pages = 2, opts = {}) {
  if (typeof pages === 'object' && pages !== null) { opts = pages; pages = 2; }
  const since = resolveSince(opts);
  const until = resolveUntil(opts);
  const latest = resolveLatest(opts);
  const out = [];
  for (let p = 0; p < Math.max(1, pages); p++) {
    try {
      let q = `q=${query}&country=IN&page=${p}&language=ENGLISH`;
      if (latest) q += '&sort=new';
      const data = await getJson('https://patents.google.com/xhr/query', { url: q, exp: '' });
      const clusters = ((data.results || {}).cluster || []).slice(0, 100);
      for (const { result } of clusters) {
        const items = Array.isArray(result) ? result : (result ? [result] : []);
        for (const item of items.slice(0, 100)) {
          const pat = (item && item.patent) || item || {};
          const publication_number = pat.publication_number || pubNoFromId(item && item.id);
          const snippet = plain(pat.snippet);
          const parties = [pat.assignee, pat.inventor].map((s) => String(s || '').trim()).filter(Boolean);
          out.push({
            source: 'indian_patent', kind: 'patent', title: plain(pat.title) || '',
            abstract: snippet.length > 40 ? snippet : null,
            publication_number,
            publication_date: pat.publication_date ? String(pat.publication_date).slice(0, 10) : null,
            applicants_or_authors: [...new Set(parties)],
            organisation: (parties[0] || null),
            source_url: publication_number
              ? `https://patents.google.com/patent/${publication_number}/en`
              : (item && item.id ? `https://patents.google.com/${item.id}/en` : null),
          });
        }
      }
    } catch (e) {
      // Keep pages already fetched; stub only if empty.
      if (out.length) break;
      return pending('indian_patent', 'patent', query, String(e.message || e));
    }
  }
  const filtered = (since || until) ? out.filter((r) => inRange(r.publication_date, since, until)) : out;
  if (latest) filtered.sort(newestFirst);
  return filtered;
}

module.exports = { patents };
