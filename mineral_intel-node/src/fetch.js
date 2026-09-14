'use strict';
// Live API fetchers actually in use: Google Patents (IN), OpenAlex, Lens.
// Removed: rss(), generic scrape() — scraping now lives in ./webscrape.js
// and is only used internally by enrich.js as a fallback.
const HEADERS = { 'User-Agent': 'mineral-intel/1.0' };

async function getJson(url, params) {
  const u = new URL(url);
  if (params) for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u, { headers: HEADERS });
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${u}`);
  return r.json();
}

const pending = (source, kind, query, note) =>
  [{ source, kind, title: `[pending] ${query}`, collector_note: note }];

// Indian patents via Google Patents (country=IN), no key needed.
async function patents(query, pages = 2) {
  const out = [];
  for (let p = 0; p < Math.max(1, pages); p++) {
    try {
      const data = await getJson('https://patents.google.com/xhr/query', {
        url: `q=${query}&country=IN&page=${p}&language=ENGLISH`, exp: '',
      });
      const clusters = ((data.results || {}).cluster || []).slice(0, 100);
      for (const { result: pat = {} } of clusters) {
        out.push({
          source: 'indian_patent', kind: 'patent', title: pat.title || '',
          publication_number: pat.publication_number || null,
          publication_date: pat.publication_date ? String(pat.publication_date).slice(0, 10) : null,
          source_url: pat.publication_number ? `https://patents.google.com/patent/${pat.publication_number}/en` : null,
        });
      }
    } catch (e) {
      return pending('indian_patent', 'patent', query, String(e.message || e));
    }
  }
  return out;
}

// Research papers via OpenAlex, no key needed.
// opts: { perPage, indiaOnly, mailto }
async function openalex(query, opts = {}) {
  const { perPage = 100, indiaOnly = false, mailto = process.env.OPENALEX_MAILTO } =
    typeof opts === 'number' ? { perPage: opts } : opts;
  try {
    const params = { search: query, 'per-page': String(perPage) };
    if (indiaOnly) params.filter = 'institutions.country_code:IN';
    if (mailto) params.mailto = mailto;
    const data = await getJson('https://api.openalex.org/works', params);
    return (data.results || []).map((w) => {
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
  } catch (e) {
    return pending('openalex', 'research', query, String(e.message || e));
  }
}

// Lens.org patents — needs LENS_TOKEN (free at lens.org/lens/user/subscriptions).
async function lens(query, opts = {}) {
  const token = opts.token || process.env.LENS_TOKEN;
  if (!token) return pending('lens', 'patent', query, 'lens: missing token — set LENS_TOKEN');
  const size = Math.min(Math.max(opts.size || 100, 1), 100);
  const must = [{ bool: { should: ['title', 'abstract', 'claim', 'description'].map((f) => ({ match: { [f]: query } })) } }];
  if (opts.jurisdiction !== null) must.push({ term: { country: opts.jurisdiction || 'IN' } });
  try {
    const r = await fetch('https://api.lens.org/patent/search', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(opts.raw || {
        query: { bool: { must } }, size, include: ['lens_id', 'biblio', 'abstract'],
      }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
    const data = await r.json();
    return (data.data || []).map((d) => {
      const bib = d.biblio || {};
      const pub = bib.publication_reference || {};
      const title = ((bib.invention_title || [])[0] || {}).text || d.lens_id || query;
      const pubNo = pub.country && pub.doc_number ? `${pub.country}${pub.doc_number}${pub.kind || ''}` : null;
      const parties = bib.parties || {};
      const names = (list, k) => (list || []).map((p) => {
        const n = p[k] || {};
        return n.org_name || [n.first_name, n.middle_name, n.last_name].filter(Boolean).join(' ') || n['name.value'];
      }).filter(Boolean);
      const applicants = names(parties.applicants, 'applicant_name');
      const inventors = names(parties.inventors, 'inventor_name');
      return {
        source: 'lens', kind: 'patent', title,
        abstract: ((d.abstract || [])[0] || {}).text || null,
        publication_number: pubNo,
        publication_date: (d.date_publ || pub.date || '').slice(0, 10) || null,
        applicants_or_authors: [...applicants, ...inventors].slice(0, 20),
        organisation: applicants[0] || null,
        source_url: pubNo ? `https://patents.google.com/patent/${pubNo}/en` : null,
        lens_id: d.lens_id || null,
      };
    });
  } catch (e) {
    return pending('lens', 'patent', query, `lens: ${e.message || e}`);
  }
}

module.exports = { patents, openalex, lens };
