'use strict';
// OpenAlex research papers, no key. opts: { perPage, indiaOnly, mailto, since, until, latest }.
const { getJson, pending } = require('../utils/http');
const { resolveSince, resolveUntil, resolveLatest, inRange, newestFirst } = require('../utils/dates');

async function openalex(query, opts = {}) {
  const { perPage = 100, indiaOnly = false, mailto = process.env.OPENALEX_MAILTO } =
    typeof opts === 'number' ? { perPage: opts } : opts;
  const since = resolveSince(opts);
  const until = resolveUntil(opts);
  const latest = resolveLatest(opts);
  try {
    const params = { search: query, 'per-page': String(perPage) };
    const filters = [];
    if (indiaOnly) filters.push('institutions.country_code:IN');
    if (since) filters.push(`from_publication_date:${since}`);
    if (until) filters.push(`to_publication_date:${until}`);
    if (filters.length) params.filter = filters.join(',');
    if (mailto) params.mailto = mailto;
    if (latest) params.sort = 'publication_date:desc';
    const data = await getJson('https://api.openalex.org/works', params);
    const recs = (data.results || []).map((w) => {
      const ships = w.authorships || [];
      const authors = ships.slice(0, 10).map((a) => (a.author || {}).display_name).filter(Boolean);
      return {
        source: 'openalex', kind: 'research', title: w.title || '',
        abstract: null, doi: w.doi || null,
        applicants_or_authors: authors,
        organisation: ((ships[0] || {}).institutions || [])[0]?.display_name || null,
        publication_date: (w.publication_date || '').slice(0, 10) || null,
        source_url: w.doi || w.id || null,
      };
    });
    const filtered = (since || until) ? recs.filter((r) => inRange(r.publication_date, since, until)) : recs;
    if (latest) filtered.sort(newestFirst);
    return filtered;
  } catch (e) {
    return pending('openalex', 'research', query, String(e.message || e));
  }
}

module.exports = { openalex };
